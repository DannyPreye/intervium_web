"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, BookOpen, Trash } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

type Story = {
  id?: string;
  _id?: string;
  title: string;
  rawStory?: string;
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  theme?: string;
};
const idOf = (s: Story) => s.id || s._id || "";

function StarRow({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <p className="text-[13px] leading-relaxed text-ink-soft">
      <span className="font-semibold text-ink">{label}. </span>
      {text}
    </p>
  );
}

export default function StoryBankPage() {
  const [stories, setStories] = useState<Story[] | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [rawStory, setRawStory] = useState("");

  const load = useCallback(async () => {
    try {
      const r = (await api("/v1/story-bank?limit=100")) as { results?: Story[] };
      setStories(r.results ?? []);
    } catch {
      setStories([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2 || rawStory.trim().length < 30) return;
    setSaving(true);
    try {
      await api("/v1/story-bank", { method: "POST", body: { title: title.trim(), rawStory: rawStory.trim() } });
      setOpen(false);
      setTitle("");
      setRawStory("");
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Story) => {
    setStories((prev) => prev?.filter((x) => idOf(x) !== idOf(s)) ?? null);
    try {
      await api(`/v1/story-bank/${idOf(s)}`, { method: "DELETE" });
    } catch {
      load();
    }
  };

  return (
    <div>
      <PageHeader
        title="Story Bank"
        subtitle="Save your experiences once. The AI draws on them across your prep."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={17} weight="bold" /> Add story
          </Button>
        }
      />

      {stories === null ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories yet"
          description="Add a real experience (a challenge, a win, a conflict). Write it plainly; we structure it into STAR."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stories.map((s) => {
            const hasStar = s.situation || s.task || s.action || s.result;
            return (
              <Card key={idOf(s)} className="p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{s.title}</p>
                    {s.theme && <p className="mt-0.5 text-[11px] font-medium tracking-wide text-violet-bright uppercase">{s.theme}</p>}
                  </div>
                  <button onClick={() => remove(s)} aria-label="Delete" className="rounded-lg p-1.5 text-ink-faint hover:text-rose-400">
                    <Trash size={15} />
                  </button>
                </div>
                {hasStar ? (
                  <div className="space-y-1.5">
                    <StarRow label="S" text={s.situation} />
                    <StarRow label="T" text={s.task} />
                    <StarRow label="A" text={s.action} />
                    <StarRow label="R" text={s.result} />
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed text-ink-soft line-clamp-4">{s.rawStory}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a story">
        <form onSubmit={create} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rescued a failing migration" />
          </div>
          <div>
            <Label htmlFor="story">What happened? *</Label>
            <Textarea
              id="story"
              required
              className="min-h-40"
              value={rawStory}
              onChange={(e) => setRawStory(e.target.value)}
              placeholder="Tell it plainly — the situation, what you did, and how it turned out. We'll structure it into STAR."
            />
            <p className="mt-1 text-[11px] text-ink-faint">{rawStory.trim().length}/30 characters minimum</p>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={saving || title.trim().length < 2 || rawStory.trim().length < 30}>
            {saving ? "Saving…" : "Save story"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
