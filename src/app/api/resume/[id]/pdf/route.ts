import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

/* Server-side PDF export. A headless Chromium (puppeteer-core + the remote
 * @sparticuz/chromium-min binary — the pattern that deploys reliably on Vercel)
 * navigates to the same-origin /resume/[id]/print route, waits for its readiness
 * flag, and prints a pixel-perfect, selectable-text (ATS-readable) PDF.
 *
 * Static top-level imports + serverExternalPackages (next.config.ts) are required
 * so the bundler externalizes the package instead of relocating it. */

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Remote Chromium binary pack. x64 matches Vercel's architecture and the version
// matches the installed @sparticuz/chromium-min. Override with CHROMIUM_PACK_URL
// (e.g. to host the .tar on your own storage for faster/more reliable cold starts).
const remoteExecutablePath =
  process.env.CHROMIUM_PACK_URL ||
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

type StyleInput = {
  headingFont?: string;
  bodyFont?: string;
  fontSize?: string;
  primaryColor?: string;
  secondaryColor?: string;
  sectionSpacing?: number;
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  // The client forwards its bearer token; we hand it to the print route via a
  // query param so the in-page fetch to the API is authenticated.
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
    browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(remoteExecutablePath),
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      headless: true,
      ignoreDefaultArgs: ["--enable-automation"],
    });

    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    // The readiness flag (set after data fetch + fonts) is the real gate.
    await page.waitForSelector('html[data-pdf-ready="1"]', { timeout: 30000 });
    await page.emulateMediaType("print");
    // Explicit A4 + margins (deterministic). We intentionally do NOT use
    // preferCSSPageSize — in some headless Chromium builds it emits runaway blank
    // pages. The print route's @page rule still governs the browser-print fallback.
    const pdf = await page.pdf({
      printBackground: true,
      format: "A4",
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
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
