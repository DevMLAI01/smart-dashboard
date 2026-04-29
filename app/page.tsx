import { UploadZone } from "@/components/upload/UploadZone";
import { LayoutDashboard, Sparkles, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="flex items-center gap-3 px-8 py-5">
        <LayoutDashboard className="w-6 h-6 text-blue-400" />
        <span className="text-white font-bold text-lg">Smart Dashboard</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Claude AI
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Turn any student document into a{" "}
            <span className="text-blue-400">smart dashboard</span>
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Upload a mark sheet, attendance record, PDF, Excel, or Word file
            and get an instant analytics dashboard — grade distribution,
            top performers, subject breakdowns, and a shareable link.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
          <UploadZone />
        </div>

        <div className="flex items-center gap-6 mt-8 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Files processed securely
          </span>
          <span>·</span>
          <span>Dashboards expire in 7 days</span>
          <span>·</span>
          <span>No account required</span>
        </div>
      </main>
    </div>
  );
}
