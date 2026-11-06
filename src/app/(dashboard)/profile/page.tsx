"use client";

import { useState, useEffect } from "react";
import { User, GraduationCap, Target, Save, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  "bg-white/[0.04] border-white/[0.08] text-slate-300 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 rounded-xl h-10 text-sm";

export default function ProfilePage() {
  const { data: profile, isLoading } = api.user.getProfile.useQuery();
  const { data: user } = api.auth.me.useQuery();
  const utils = api.useUtils();

  const [form, setForm] = useState({
    bio: "",
    phone: "",
    location: "",
    collegeName: "",
    degree: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    careerGoal: "",
    experienceYears: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        collegeName: profile.collegeName ?? "",
        degree: profile.degree ?? "",
        branch: profile.branch ?? "",
        graduationYear: profile.graduationYear?.toString() ?? "",
        cgpa: profile.cgpa?.toString() ?? "",
        careerGoal: profile.careerGoal ?? "",
        experienceYears: profile.experienceYears?.toString() ?? "",
      });
    }
  }, [profile]);

  const upsert = api.user.upsertProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile saved");
      utils.user.getProfile.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    upsert.mutate({
      bio: form.bio || undefined,
      phone: form.phone || undefined,
      location: form.location || undefined,
      collegeName: form.collegeName || undefined,
      degree: form.degree || undefined,
      branch: form.branch || undefined,
      graduationYear: form.graduationYear
        ? parseInt(form.graduationYear)
        : undefined,
      cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
      careerGoal: form.careerGoal || undefined,
      experienceYears: form.experienceYears
        ? parseInt(form.experienceYears)
        : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Profile</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Your personal and academic information
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={upsert.isPending}
          className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 h-9 text-sm font-semibold"
        >
          {upsert.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <Input
              value={user?.name ?? ""}
              disabled
              className={cn(inputCls, "opacity-50 cursor-not-allowed")}
            />
          </Field>
          <Field label="Email">
            <Input
              value={user?.email ?? ""}
              disabled
              className={cn(inputCls, "opacity-50 cursor-not-allowed")}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 9876543210"
              className={inputCls}
            />
          </Field>
          <Field label="Location">
            <Input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Bengaluru, Karnataka"
              className={inputCls}
            />
          </Field>
          <Field label="Bio">
            <Textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="col-span-2 bg-white/[0.04] border-white/[0.08] text-slate-300 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 rounded-xl text-sm resize-none"
            />
          </Field>
        </div>
      </Section>

      {/* Education */}
      <Section title="Education" icon={GraduationCap}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="College / University">
            <Input
              value={form.collegeName}
              onChange={(e) => set("collegeName", e.target.value)}
              placeholder="IIT Bombay"
              className={inputCls}
            />
          </Field>
          <Field label="Degree">
            <Input
              value={form.degree}
              onChange={(e) => set("degree", e.target.value)}
              placeholder="B.Tech"
              className={inputCls}
            />
          </Field>
          <Field label="Branch / Major">
            <Input
              value={form.branch}
              onChange={(e) => set("branch", e.target.value)}
              placeholder="Computer Science"
              className={inputCls}
            />
          </Field>
          <Field label="Graduation Year">
            <Input
              value={form.graduationYear}
              onChange={(e) => set("graduationYear", e.target.value)}
              placeholder="2025"
              type="number"
              className={inputCls}
            />
          </Field>
          <Field label="CGPA">
            <Input
              value={form.cgpa}
              onChange={(e) => set("cgpa", e.target.value)}
              placeholder="8.5"
              type="number"
              step="0.1"
              min="0"
              max="10"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Career Goals */}
      <Section title="Career Goals" icon={Target}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Years of Experience">
            <Input
              value={form.experienceYears}
              onChange={(e) => set("experienceYears", e.target.value)}
              placeholder="0"
              type="number"
              min="0"
              className={inputCls}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Career Goal">
              <Textarea
                value={form.careerGoal}
                onChange={(e) => set("careerGoal", e.target.value)}
                placeholder="e.g. Backend Engineer at a product company, focusing on distributed systems..."
                rows={3}
                className="bg-white/[0.04] border-white/[0.08] text-slate-300 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 rounded-xl text-sm resize-none"
              />
            </Field>
          </div>
        </div>
      </Section>
    </div>
  );
}