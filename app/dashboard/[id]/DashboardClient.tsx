"use client";

import { useState } from "react";
import { DashboardData } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { GradeDistribution } from "@/components/dashboard/GradeDistribution";
import { AttendanceTrend } from "@/components/dashboard/AttendanceTrend";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { SubjectBreakdown } from "@/components/dashboard/SubjectBreakdown";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { Users, BarChart2, TrendingUp, BookOpen } from "lucide-react";

export function DashboardClient({ data }: { data: DashboardData }) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const { students, subjects, meta, title } = data;

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <Header title={title} showShare />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          subjects={subjects}
          activeSubject={activeSubject}
          onSelectSubject={setActiveSubject}
          studentCount={meta.totalStudents}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={meta.totalStudents}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />
            <StatCard
              title="Average Score"
              value={`${meta.averageScore}%`}
              subtitle={activeSubject ? `in ${activeSubject}` : "across all subjects"}
              icon={BarChart2}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-100"
            />
            <StatCard
              title="Pass Rate"
              value={`${meta.passRate}%`}
              subtitle="≥50 marks"
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBg="bg-green-100"
            />
            <StatCard
              title="Subjects"
              value={subjects.length || "—"}
              icon={BookOpen}
              iconColor="text-amber-600"
              iconBg="bg-amber-100"
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GradeDistribution
              students={students}
              subject={activeSubject ?? undefined}
            />
            <AttendanceTrend students={students} />
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopPerformers
              students={students}
              subject={activeSubject ?? undefined}
            />
            <SubjectBreakdown students={students} subjects={subjects} />
          </div>

          {/* Student table */}
          <StudentTable
            students={students}
            subjects={subjects}
            activeSubject={activeSubject}
          />
        </main>
      </div>
    </div>
  );
}
