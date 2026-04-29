"use client";

import { BookOpen, Users, BarChart2 } from "lucide-react";

interface SidebarProps {
  subjects: string[];
  activeSubject: string | null;
  onSelectSubject: (subject: string | null) => void;
  studentCount: number;
}

export function Sidebar({
  subjects,
  activeSubject,
  onSelectSubject,
  studentCount,
}: SidebarProps) {
  return (
    <aside className="w-56 bg-slate-800 text-white flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          {studentCount} students
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
          Subjects
        </p>

        <button
          onClick={() => onSelectSubject(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
            activeSubject === null
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          <BarChart2 className="w-4 h-4 flex-shrink-0" />
          All Subjects
        </button>

        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => onSelectSubject(sub)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              activeSubject === sub
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{sub}</span>
          </button>
        ))}

        {subjects.length === 0 && (
          <p className="text-slate-500 text-xs px-2 py-1">No subjects found</p>
        )}
      </nav>
    </aside>
  );
}
