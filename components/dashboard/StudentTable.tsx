"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/lib/types";
import { Search } from "lucide-react";

interface Props {
  students: Student[];
  subjects: string[];
  activeSubject: string | null;
}

function gradeColor(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-blue-100 text-blue-700";
  if (score >= 50) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export function StudentTable({ students, subjects, activeSubject }: Props) {
  const [search, setSearch] = useState("");

  const displaySubjects = activeSubject ? [activeSubject] : subjects;

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-700">
            Student Records
          </CardTitle>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-8 text-xs">#</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                {displaySubjects.map((sub) => (
                  <TableHead key={sub} className="text-xs text-center">
                    {sub}
                  </TableHead>
                ))}
                {students.some((s) => s.attendance !== undefined) && (
                  <TableHead className="text-xs text-center">Attendance</TableHead>
                )}
                <TableHead className="text-xs text-center">Avg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student, i) => {
                const scores = displaySubjects.map(
                  (sub) => student.scores[sub] ?? null
                );
                const validScores = scores.filter((s): s is number => s !== null);
                const avg =
                  validScores.length > 0
                    ? Math.round(
                        validScores.reduce((a, b) => a + b, 0) / validScores.length
                      )
                    : null;

                return (
                  <TableRow key={student.name} className="hover:bg-slate-50/50">
                    <TableCell className="text-xs text-slate-400">{i + 1}</TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">
                      {student.name}
                      {student.id && (
                        <span className="text-xs text-slate-400 ml-1">({student.id})</span>
                      )}
                    </TableCell>
                    {displaySubjects.map((sub) => {
                      const score = student.scores[sub];
                      return (
                        <TableCell key={sub} className="text-center">
                          {score !== undefined ? (
                            <Badge className={`text-xs ${gradeColor(score)}`}>
                              {score}
                            </Badge>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                    {students.some((s) => s.attendance !== undefined) && (
                      <TableCell className="text-center">
                        {student.attendance !== undefined ? (
                          <span
                            className={`text-xs font-medium ${
                              student.attendance >= 75
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {student.attendance}%
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {avg !== null ? (
                        <Badge className={`text-xs font-bold ${gradeColor(avg)}`}>
                          {avg}
                        </Badge>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={displaySubjects.length + 3}
                    className="text-center text-slate-400 text-sm py-8"
                  >
                    No students match your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
