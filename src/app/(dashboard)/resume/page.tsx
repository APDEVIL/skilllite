"use client";

import { FileText, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { UploadZone } from "@/components/resume/upload-zone";
import { AnalysisResult } from "@/components/resume/analysis-result";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function ResumePage() {
  const { data: activeResume, isLoading } =
    api.resume.getActiveResume.useQuery();
  const { data: allResumes } = api.resume.getMyResumes.useQuery();
  const utils = api.useUtils();

  const deleteResume = api.resume.deleteResume.useMutation({
    onSuccess: () => {
      toast.success("Resume deleted");
      utils.resume.getActiveResume.invalidate();
      utils.resume.getMyResumes.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

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
      <div>
        <h1 className="text-xl font-extrabold text-white">Resume</h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Upload your resume — AI extracts skills, experience, and projects
          automatically
        </p>
      </div>

      {/* Upload zone — always show so they can re-upload */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {activeResume ? "Upload New Resume" : "Upload Resume"}
        </h2>
        <UploadZone />
      </div>

      {/* Active resume analysis */}
      {activeResume && activeResume.analysisStatus === "done" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Latest Analysis
              </h2>
              <p className="text-[11px] text-slate-700 mt-0.5">
                {activeResume.fileName} ·{" "}
                {formatDate(activeResume.createdAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                deleteResume.mutate({ resumeId: activeResume.id })
              }
              disabled={deleteResume.isPending}
              className="text-red-500/60 hover:text-red-400 hover:bg-red-500/[0.05] h-8 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
          <AnalysisResult resume={activeResume} />
        </div>
      )}

      {/* Processing state */}
      {activeResume && activeResume.analysisStatus === "processing" && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              Analyzing your resume...
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Gemini AI is reading your resume. Refresh in a few seconds.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => utils.resume.getActiveResume.invalidate()}
            className="text-slate-600 hover:text-slate-400 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      )}

      {/* Failed state */}
      {activeResume && activeResume.analysisStatus === "failed" && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6 text-center">
          <p className="text-sm font-semibold text-red-400 mb-1">
            Analysis failed
          </p>
          <p className="text-xs text-slate-600">
            Try uploading your resume again above.
          </p>
        </div>
      )}

      {/* Past resumes list */}
      {allResumes && allResumes.length > 1 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Past Resumes
          </h2>
          <div className="space-y-2">
            {allResumes
              .filter((r) => !r.isActive)
              .map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">
                        {r.fileName}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        {formatDate(r.createdAt)} ·{" "}
                        {r.atsScore ? `ATS: ${r.atsScore}` : r.analysisStatus}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteResume.mutate({ resumeId: r.id })}
                    disabled={deleteResume.isPending}
                    className="text-slate-700 hover:text-red-400 hover:bg-red-500/[0.05] h-8"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}