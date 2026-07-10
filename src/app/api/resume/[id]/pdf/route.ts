import { NextRequest, NextResponse } from "next/server";

/* Server-side PDF export. A headless Chromium navigates to the same-origin
 * /resume/[id]/print route (which renders the real templates + compiled Tailwind
 * + fonts), waits for the readiness flag, and prints. This yields a pixel-perfect,
 * deterministic, ATS-readable (real text) PDF — unlike the browser print path,
 * which is the client-side fallback.
 *
 * Runs on the Node runtime (Chromium can't run on Edge). Prod uses puppeteer-core
 * + @sparticuz/chromium (bundled binary, no runtime download); local dev uses the
 * full puppeteer install. */

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type StyleInput = {
  headingFont?: string;
  bodyFont?: string;
  fontSize?: string;
  primaryColor?: string;
  secondaryColor?: string;
  sectionSpacing?: number;
};

// Remote Chromium binary pack (matches the installed @sparticuz/chromium-min
// major). On Vercel the full binary isn't reliably bundled into the function, so
// -min fetches it from here on cold start. Override with CHROMIUM_PACK_URL, or
// host the .tar on your own storage for faster/more reliable cold starts.
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ||
  // x64 pack (Vercel serverless runs on amd64). Must match @sparticuz/chromium-min's major.
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function launchBrowser(): Promise<any> {
  // On Vercel (or any prod deploy) use chromium-min + the remote binary.
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: true,
    });
  }
  // Local dev: full puppeteer ships its own Chromium.
  const puppeteer = await import("puppeteer");
  return puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  // The client forwards its bearer token; we hand it to the print route via a
  // short-lived query param so the in-page fetch to the API is authenticated.
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    template?: string;
    style?: StyleInput;
  };
  const style = body.style ?? {};

  const qs = new URLSearchParams({
    template: body.template ?? "modern",
    hf: style.headingFont ?? "Inter",
    bf: style.bodyFont ?? "Inter",
    fs: style.fontSize ?? "medium",
    pc: style.primaryColor ?? "#6366f1",
    sc: style.secondaryColor ?? "#475569",
    ss: String(style.sectionSpacing ?? 1.5),
    token,
  });
  const printUrl = `${req.nextUrl.origin}/resume/${id}/print?${qs.toString()}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    // The readiness flag (set after data fetch + fonts) is the real gate — more
    // reliable than networkidle on a page that keeps a font connection open.
    await page.waitForSelector('html[data-pdf-ready="1"]', { timeout: 30000 });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true, // honor the route's @page { size: A4; margin } rules
    });

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "PDF generation failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore */
      }
    }
  }
}
