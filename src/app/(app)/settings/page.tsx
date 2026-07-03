"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, FilePdf, UploadSimple, SignOut, CircleNotch } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { api, unwrap } from "@/lib/api";
import { API_BASE } from "@/lib/config";
import { session } from "@/lib/session";

type Me = { name?: string; email?: string; phone?: string; resumeUrl?: string };

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [resumeUrl, setResumeUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api("/v1/user/me")
      .then((r) => {
        const u = unwrap<Me>(r);
        setMe(u);
        setName(u.name || "");
        setPhone(u.phone || "");
        setResumeUrl(u.resumeUrl);
      })
      .catch(() => {});
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSavedProfile(false);
    try {
      await api("/v1/user/profile", { method: "PATCH", body: { name: name.trim(), phone: phone.trim() || null } });
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    setSavingPw(true);
    try {
      await api("/v1/user/change-password", { method: "PATCH", body: { oldPassword, newPassword } });
      setPwMsg("Password updated.");
      setOldPassword("");
      setNewPassword("");
    } catch {
      setPwMsg("Couldn't update — check your current password.");
    } finally {
      setSavingPw(false);
    }
  };

  const uploadResume = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await fetch(`${API_BASE}/v1/user/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setResumeUrl((data as Me).resumeUrl || "uploaded");
      }
    } finally {
      setUploading(false);
    }
  };

  const logout = () => {
    session.clear();
    router.replace("/login");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" subtitle={me?.email} />

      <div className="space-y-5">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Used to personalize your prep.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving…" : "Save"}
                </Button>
                {savedProfile && (
                  <span className="flex items-center gap-1.5 text-[13px] text-emerald-400">
                    <CheckCircle size={15} weight="fill" /> Saved
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resume */}
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Grounds mock questions and feedback in your real history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[13px] text-ink-soft">
                <FilePdf size={20} className={resumeUrl ? "text-violet-bright" : "text-ink-faint"} />
                {resumeUrl ? "Resume on file" : "No resume uploaded"}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])}
              />
              <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <CircleNotch size={16} className="animate-spin" /> : <UploadSimple size={16} />}
                {resumeUrl ? "Replace" : "Upload PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="old">Current password</Label>
                  <Input id="old" type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" variant="secondary" disabled={savingPw}>
                  {savingPw ? "Updating…" : "Update password"}
                </Button>
                {pwMsg && <span className="text-[13px] text-ink-soft">{pwMsg}</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <button onClick={logout} className="flex items-center gap-2 text-[14px] font-medium text-rose-400 hover:text-rose-300">
          <SignOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );
}
