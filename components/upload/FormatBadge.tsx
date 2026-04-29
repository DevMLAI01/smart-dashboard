import { FileText, FileSpreadsheet, Image, FileType2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FormatInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export const ACCEPTED_FORMATS: FormatInfo[] = [
  {
    label: "PDF",
    icon: <FileText className="w-3 h-3" />,
    color: "bg-red-100 text-red-700 border-red-200",
    description: "Portable Document",
  },
  {
    label: "Word (.docx)",
    icon: <FileText className="w-3 h-3" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Microsoft Word",
  },
  {
    label: "Excel (.xlsx)",
    icon: <FileSpreadsheet className="w-3 h-3" />,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Microsoft Excel",
  },
  {
    label: "CSV",
    icon: <FileSpreadsheet className="w-3 h-3" />,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    description: "Comma-Separated",
  },
  {
    label: "PNG / JPG",
    icon: <Image className="w-3 h-3" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Scanned image",
  },
  {
    label: "Mark Sheet",
    icon: <FileType2 className="w-3 h-3" />,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "Any format above",
  },
  {
    label: "Attendance",
    icon: <FileType2 className="w-3 h-3" />,
    color: "bg-sky-100 text-sky-700 border-sky-200",
    description: "Any format above",
  },
];

export function FormatBadge({ label, icon, color, description }: FormatInfo) {
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${color} border`}
      title={description}
    >
      {icon}
      {label}
    </Badge>
  );
}
