import { NumerologyResult } from "./numerology";

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  day: number;
  month: number;
  year: number;
  result: NumerologyResult;
}

const KEY = "numerology_analyses";

export function saveAnalysis(
  firstName: string,
  lastName: string,
  day: number,
  month: number,
  year: number,
  result: NumerologyResult
): AnalysisRecord {
  const record: AnalysisRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    firstName,
    lastName,
    day,
    month,
    year,
    result,
  };
  const existing = loadAll();
  // Avoid duplicates (same name + date)
  const withoutDup = existing.filter(
    (r) => !(r.firstName === firstName && r.lastName === lastName && r.day === day && r.month === month && r.year === year)
  );
  localStorage.setItem(KEY, JSON.stringify([record, ...withoutDup]));
  return record;
}

export function loadAll(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteRecord(id: string) {
  const existing = loadAll().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(existing));
}

export function exportToCsv(): string {
  const records = loadAll();
  if (records.length === 0) return "";

  const headers = [
    "שם פרטי", "שם משפחה", "יום", "חודש", "שנה", "תאריך ניתוח",
    "שביל גורל", "שנה אישית", "יציאה ליעוד",
    "פסגה 1", "פסגה 2", "פסגה 3", "פסגה 4",
    "אתגר 1", "אתגר 2", "אתגר 3", "אתגר 4",
    "גימטריה פרטי", "גימטריה משפחה", "גימטריה סהכ",
  ];

  const rows = records.map((r) => [
    r.firstName, r.lastName, r.day, r.month, r.year,
    new Date(r.createdAt).toLocaleDateString("he-IL"),
    r.result.destinyPath, r.result.personalYear, r.result.destinationAge,
    r.result.peaks.p1, r.result.peaks.p2, r.result.peaks.p3, r.result.peaks.p4,
    r.result.challenges.c1, r.result.challenges.c2, r.result.challenges.c3, r.result.challenges.c4,
    r.result.gematria.firstName, r.result.gematria.lastName, r.result.gematria.total,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return "\uFEFF" + csvContent; // BOM for Excel Hebrew
}
