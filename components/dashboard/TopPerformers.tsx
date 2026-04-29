import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/lib/types";
import { Trophy, TrendingDown } from "lucide-react";

interface Props {
  students: Student[];
  subject?: string;
}

function avgScore(s: Student, subject?: string): number {
  if (subject) return s.scores[subject] ?? 0;
  const vals = Object.values(s.scores);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function gradeColor(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-blue-100 text-blue-700";
  if (score >= 50) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function TopPerformers({ students, subject }: Props) {
  const ranked = [...students]
    .map((s) => ({ ...s, avg: avgScore(s, subject) }))
    .sort((a, b) => b.avg - a.avg);

  const top = ranked.slice(0, 5);
  const bottom = ranked.slice(-3).reverse();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Performers {subject ? `— ${subject}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top</p>
          <div className="space-y-2">
            {top.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base w-6">{MEDALS[i] ?? `${i + 1}.`}</span>
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{s.name}</span>
                </div>
                <Badge className={`text-xs font-semibold ${gradeColor(s.avg)}`}>
                  {Math.round(s.avg)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {bottom.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Needs Attention
            </p>
            <div className="space-y-2">
              {bottom.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 truncate max-w-[170px]">{s.name}</span>
                  <Badge className={`text-xs font-semibold ${gradeColor(s.avg)}`}>
                    {Math.round(s.avg)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
