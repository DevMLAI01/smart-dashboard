export interface Student {
  name: string;
  id?: string;
  scores: Record<string, number>;
  attendance?: number;
  grade?: string;
}

export interface DashboardData {
  id: string;
  title: string;
  uploadedAt: string;
  subjects: string[];
  students: Student[];
  meta: {
    totalStudents: number;
    averageScore: number;
    passRate: number;
    documentType: "marksheet" | "attendance" | "mixed";
  };
}

export type SupportedFormat =
  | "pdf"
  | "docx"
  | "doc"
  | "xlsx"
  | "xls"
  | "csv"
  | "png"
  | "jpg"
  | "jpeg";
