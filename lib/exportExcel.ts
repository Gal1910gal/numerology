import * as XLSX from "xlsx";
import { NumerologyResult } from "./numerology";
import { ChakraResult } from "./chakras";

export function exportToExcel(
  firstName: string,
  lastName: string,
  day: number,
  month: number,
  year: number,
  numerology: NumerologyResult,
  chakras: ChakraResult
) {
  const data: (string | number)[][] = [
    ["שם מלא", `${firstName} ${lastName}`],
    ["תאריך לידה", `${day}/${month}/${year}`],
    [],
    ["נומרולוגיה", ""],
    ["שביל גורל", numerology.destinyPath],
    ["שנה אישית", numerology.personalYear],
    ["יציאה ליעוד (גיל)", numerology.destinationAge],
    ["גימטריה שם פרטי", numerology.gematria.firstName],
    ["גימטריה שם משפחה", numerology.gematria.lastName],
    ['גימטריה סה"כ', numerology.gematria.total],
    [],
    ["פסגות", ""],
    ["פסגה 1", numerology.peaks.p1],
    ["פסגה 2", numerology.peaks.p2],
    ["פסגה 3", numerology.peaks.p3],
    ["פסגה 4", numerology.peaks.p4],
    [],
    ["אתגרים", ""],
    ["אתגר 1", numerology.challenges.c1],
    ["אתגר 2", numerology.challenges.c2],
    ["אתגר 3", numerology.challenges.c3],
    ["אתגר 4", numerology.challenges.c4],
    [],
    ["מפת הצ'אקרות", ""],
    ["על (שם פרטי)", chakras.super_],
    ["יקום (מזל)", `${chakras.universe} — ${chakras.zodiacName}`],
    ["כתר (יום לידה)", chakras.crown],
    ["עין שלישית", chakras.thirdEye],
    ["גרון", chakras.throat],
    ["לב", chakras.heart],
    ["מקלעת השמש", chakras.solarPlexus],
    ["מין ויצירה", chakras.sexAndCreation],
    ["בסיס", chakras.basis],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 28 }, { wch: 22 }];
  // RTL view
  if (!ws["!sheetView"]) ws["!sheetView"] = [];
  ws["!sheetView"] = [{ rightToLeft: true }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "נתונים נומרולוגיים");

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${firstName}_${lastName}_נומרולוגיה.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
