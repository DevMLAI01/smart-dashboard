"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types";

interface Props {
  students: Student[];
}

export function AttendanceTrend({ students }: Props) {
  const withAttendance = students
    .filter((s) => s.attendance !== undefined)
    .map((s) => ({
      name: s.name.split(" ")[0],
      attendance: s.attendance!,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (withAttendance.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-700">
            Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[220px]">
          <p className="text-slate-400 text-sm">No attendance data in this document</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-700">
          Attendance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={withAttendance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v: unknown) => [`${v}%`, "Attendance"]}
            />
            <ReferenceLine y={75} stroke="#f97316" strokeDasharray="4 4" label={{ value: "75%", fontSize: 10, fill: "#f97316" }} />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
