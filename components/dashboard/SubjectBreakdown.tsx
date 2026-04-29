"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types";

interface Props {
  students: Student[];
  subjects: string[];
}

const COLORS = [
  "#3b82f6", "#6366f1", "#22c55e", "#f97316",
  "#ec4899", "#14b8a6", "#a855f7", "#eab308",
];

export function SubjectBreakdown({ students, subjects }: Props) {
  if (subjects.length === 0 || students.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-700">
            Subject Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[260px]">
          <p className="text-slate-400 text-sm">No subject data available</p>
        </CardContent>
      </Card>
    );
  }

  const data = subjects.map((sub) => {
    const scores = students
      .map((s) => s.scores[sub])
      .filter((v): v is number => v !== undefined);
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const pass = scores.filter((v) => v >= 50).length;
    return {
      subject: sub.length > 12 ? sub.slice(0, 12) + "…" : sub,
      "Avg Score": avg,
      "Pass %": scores.length > 0 ? Math.round((pass / scores.length) * 100) : 0,
    };
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-700">
          Subject Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Avg Score" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pass %" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
