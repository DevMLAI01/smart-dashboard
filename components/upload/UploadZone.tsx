"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { FormatBadge, ACCEPTED_FORMATS } from "./FormatBadge";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export function UploadZone() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      setFileName(file.name);
      setStatus("uploading");
      setError(null);

      const form = new FormData();
      form.append("file", file);

      try {
        setStatus("processing");
        const res = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { id } = await res.json();
        router.push(`/dashboard/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      }
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    disabled: status === "uploading" || status === "processing",
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50"}
          ${status === "uploading" || status === "processing" ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {status === "uploading" || status === "processing" ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div>
                <p className="text-lg font-semibold text-slate-700">
                  {status === "uploading" ? "Uploading..." : "Analysing with AI..."}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {fileName && `Processing ${fileName}`}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                {isDragActive ? (
                  <FileText className="w-8 h-8 text-blue-600" />
                ) : (
                  <Upload className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-800">
                  {isDragActive
                    ? "Drop your file here"
                    : "Drag & drop your document"}
                </p>
                <p className="text-slate-500 mt-1">
                  or{" "}
                  <span className="text-blue-600 font-medium underline underline-offset-2">
                    browse to upload
                  </span>
                </p>
              </div>
              <p className="text-sm text-slate-400">
                Max file size: 20 MB
              </p>
            </>
          )}
        </div>
      </div>

      {status === "error" && error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Accepted Formats
        </p>
        <div className="flex flex-wrap gap-2">
          {ACCEPTED_FORMATS.map((fmt) => (
            <FormatBadge key={fmt.label} {...fmt} />
          ))}
        </div>
      </div>
    </div>
  );
}
