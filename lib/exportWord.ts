import {
  Document, Packer, Paragraph, TextRun, ImageRun,
  AlignmentType, Footer, HeadingLevel, BorderStyle,
} from "docx";
import { DeepAnalysisResult } from "@/app/api/deep-analysis/route";
import { EnergeticAnalysisResult } from "@/app/api/energetic-diagnosis/route";

const MONTHS_HE = ["ינואר","פברואר","מרץ","אוגוסט","מאי","יוני","יולי","אפריל","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const MONTHS_HE_ORDERED = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

function rtlPara(text: string, opts?: { bold?: boolean; size?: number; heading?: typeof HeadingLevel[keyof typeof HeadingLevel]; spacing?: number }) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    heading: opts?.heading,
    spacing: { after: opts?.spacing ?? 160 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        size: opts?.size ?? 24,
        rightToLeft: true,
        font: "Arial",
      }),
    ],
  });
}

function sectionTitle(text: string) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 320, after: 160 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "8B5CF6", space: 4 },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 30,
        color: "6D28D9",
        rightToLeft: true,
        font: "Arial",
      }),
    ],
  });
}

function subsectionTitle(text: string) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: "374151",
        rightToLeft: true,
        font: "Arial",
      }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ children: [new TextRun({ text: "" })] });
}

export async function exportToWord(
  firstName: string,
  lastName: string,
  day: number,
  month: number,
  year: number,
  deepAnalysis: DeepAnalysisResult | null,
  energeticAnalysis: EnergeticAnalysisResult | null,
) {
  // Fetch logo
  let logoBuffer: ArrayBuffer | null = null;
  try {
    const res = await fetch("/logo.png");
    if (res.ok) logoBuffer = await res.arrayBuffer();
  } catch { /* no logo */ }

  const children: Paragraph[] = [];

  // Logo
  if (logoBuffer) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 220, height: 145 },
            type: "png",
          }),
        ],
      })
    );
  }

  // Client header
  children.push(
    new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `${firstName} ${lastName}`,
          bold: true,
          size: 40,
          color: "1F2937",
          rightToLeft: true,
          font: "Arial",
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `תאריך לידה: ${day} ${MONTHS_HE_ORDERED[month - 1]} ${year}`,
          size: 24,
          color: "6B7280",
          rightToLeft: true,
          font: "Arial",
        }),
      ],
    })
  );

  // Deep analysis
  if (deepAnalysis) {
    children.push(sectionTitle("✦ ניתוח מעמיק"));

    const deepSections: { label: string; key: keyof DeepAnalysisResult }[] = [
      { label: "💼 קריירה ותעסוקה", key: "career" },
      { label: "💑 זוגיות ומשפחה", key: "relationships" },
      { label: "🌀 אתגרים ותיקון", key: "challenges" },
      { label: "✨ כוחות ומתנות", key: "strengths" },
    ];

    for (const { label, key } of deepSections) {
      children.push(subsectionTitle(label));
      children.push(rtlPara(deepAnalysis[key], { spacing: 200 }));
    }

    children.push(emptyLine());
  }

  // Energetic analysis
  if (energeticAnalysis) {
    children.push(sectionTitle("✦ אבחון אנרגטי"));

    const energeticSections: { label: string; key: keyof EnergeticAnalysisResult }[] = [
      { label: "🗺️ מפת האנרגיה", key: "energyMap" },
      { label: "🧠 אבחון פסיכו-גופני", key: "psychoBodyDiagnosis" },
      { label: "⚖️ נקודות איזון", key: "balancePoints" },
      { label: "🎯 המלצות מעשיות", key: "actionRecommendations" },
    ];

    for (const { label, key } of energeticSections) {
      children.push(subsectionTitle(label));
      children.push(rtlPara(energeticAnalysis[key], { spacing: 200 }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                bidirectional: true,
                alignment: AlignmentType.CENTER,
                border: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB", space: 6 },
                },
                children: [
                  new TextRun({
                    text: "גלית גרינשטיין  |  יעוץ ואבחון נומרולוגי  |  052-2792180  |  www.galitcoach.co.il",
                    size: 18,
                    color: "6B7280",
                    rightToLeft: true,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${firstName}_${lastName}_ניתוח_נומרולוגי.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
