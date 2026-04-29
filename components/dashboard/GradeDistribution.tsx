"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types";

interface Props {
  students: Student[];
  subject?: string;
}

const RANGES = [
  { label: "0–39", min: 0, max: 39, color: "#ef4444" },
  { label: "40–49", min: 40, max: 49, color: "#f97316" },
  { label: "50–59", min: 50, max: 59, color: "#eab308" },
  { label: "60–69", min: 60, max: 69, color: "#84cc16" },
  { label: "70–79", min: 70, max: 79, color: "#22c55e" },
  { label: "80–89", min: 80, max: 89, color: "#3b82f6" },
  { label: "90–100", min: 90, max: 100, color: "#6366f1" },
];

export function GradeDistribution({ students, subject }: Props) {
  const scores = students.flatMap((s) => {
    if (subject) {
      const score = s.scores[subject];
      return score !== undefined ? [score] : [];
    }
    return Object.values(s.scores);
  });

  const data = RANGES.map((r) => ({
    ...r,
    count: scores.filter((sc) => sc >= r.min && sc <= r.max).length,
  }));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-700">
          Grade Distribution {subject ? `— ${subject}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v: unknown) => [v as number, "Students"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
