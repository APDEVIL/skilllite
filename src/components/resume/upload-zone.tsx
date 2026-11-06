"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, CheckCircle2, XCircle, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type UploadStatus = "idle" | "uploading" | "analyzing" | "done" | "error";

interface UploadZoneProps {
  onSuccess?: (resumeId: string) => void;
}

export function UploadZone({ onSuccess }: UploadZoneProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);

  const utils = api.useUtils();

  const analyzeResume = api.resume.analyzeResume.useMutation({
    onSuccess: (data) => {
      setStatus("done");
      toast.success(
        `Resume analyzed! ATS Score: ${data.atsScore} · ${data.skillsAddedToProfile} skills added`,
      );
      utils.resume.getMyResumes.invalidate();
      utils.resume.getActiveResume.invalidate();
      utils.user.getSkills.invalidate();
      onSuccess?.(data.resumeId);
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(err.message);
      toast.error("Analysis failed. Please try again.");
    },
  });

  const { startUpload } = useUploadThing("resumeUploader", {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: async (res) => {
      const uploaded = res?.[0];
      if (!uploaded) return;
      setStatus("analyzing");
      setProgress(0);
      await analyzeResume.mutateAsync({
        fileName: uploaded.name,
        fileUrl: uploaded.url,
        fileKey: uploaded.key,
      });
    },
    onUploadError: (err) => {
      setStatus("error");
      setErrorMsg(err.message);
      toast.error("Upload failed. Please try again.");
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const dropped = acceptedFiles[0];
      if (!dropped) return;

      setFile(dropped);
      setStatus("uploading");
      setProgress(0);
      setErrorMsg("");
      await startUpload([dropped]);
    },
    [startUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024, // 4MB
    disabled: status === "uploading" || status === "analyzing",
  });

  const reset = () => {
    setStatus("idle");
    setFile(null);
    setProgress(0);
    setErrorMsg("");
  };

  // ── IDLE STATE ────────────────────────────────
  if (status === "idle") {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "relative group rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300",
          isDragActive
            ? "border-blue-500/60 bg-blue-500/5 scale-[1.01]"
            : "border-white/[0.08] hover:border-blue-500/30 hover:bg-blue-500/[0.03]",
        )}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragActive
              ? "bg-blue-500/20 text-blue-400 scale-110"
              : "bg-white/[0.04] text-slate-600 group-hover:bg-blue-500/10 group-hover:text-blue-400",
          )}
        >
          <CloudUpload className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="text-center">
          {isDragActive ? (
            <p className="text-base font-semibold text-blue-400">
              Drop it here!
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-300">
                Drag & drop your resume PDF
              </p>
              <p className="text-xs text-slate-600 mt-1">
                or{" "}
                <span className="text-blue-400 hover:text-blue-300 transition-colors">
                  click to browse
                </span>
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-700">
          <span>PDF only</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>Max 4MB</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>AI powered analysis</span>
        </div>
      </div>
    );
  }

  // ── UPLOADING / ANALYZING STATE ───────────────
  if (status === "uploading" || status === "analyzing") {
    const isAnalyzing = status === "analyzing";

    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 flex flex-col items-center justify-center gap-6">
        {/* Animated icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            {isAnalyzing ? (
              <span className="text-3xl">🧠</span>
            ) : (
              <Upload className="w-7 h-7 text-blue-400" />
            )}
          </div>
          <div className="absolute -inset-2 rounded-2xl border border-blue-500/20 animate-ping opacity-30" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white">
            {isAnalyzing ? "Prep AI is reading your resume..." : "Uploading..."}
          </p>
          <p className="text-xs text-slate-600">
            {isAnalyzing
              ? "Extracting skills, experience, projects — this takes ~10 seconds"
              : `${file?.name} · ${progress}%`}
          </p>
        </div>

        {/* Progress bar */}
        {!isAnalyzing && (
          <div className="w-full max-w-sm">
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing with Gemini 1.5 Flash</span>
          </div>
        )}
      </div>
    );
  }

  // ── DONE STATE ────────────────────────────────
  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-400">
            Resume analyzed successfully!
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Scroll down to see your full analysis report.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-xs text-slate-600 hover:text-slate-400"
        >
          Upload another resume
        </Button>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
        <XCircle className="w-7 h-7 text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-red-400">Upload failed</p>
        <p className="text-xs text-slate-600 mt-1">{errorMsg}</p>
      </div>
      <Button
        size="sm"
        onClick={reset}
        className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 text-xs"
      >
        Try Again
      </Button>
    </div>
  );
}