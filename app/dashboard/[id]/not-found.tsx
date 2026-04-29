import Link from "next/link";
import { LayoutDashboard, Clock } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard Not Found</h1>
        <p className="text-slate-500 text-sm">
          This dashboard has expired or the link is invalid. Dashboards are
          available for 7 days after upload.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Upload a New Document
        </Link>
      </div>
    </div>
  );
}
