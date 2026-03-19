import { NextRequest, NextResponse } from "next/server";
import { buildDeepPrompt, SYSTEM_PROMPT } from "@/lib/deepPrompt";
import { NumerologyResult } from "@/lib/numerology";
import { ChakraResult } from "@/lib/chakras";

export interface DeepAnalysisResult {
  career: string;
  relationships: string;
  challenges: string;
  strengths: string;
}

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      firstName: string;
      lastName: string;
      day: number;
      month: number;
      year: number;
      numerology: NumerologyResult;
      chakras: ChakraResult;
    };

    const { firstName, lastName, day, month, year, numerology, chakras } = body;
    const prompt = buildDeepPrompt(firstName, lastName, day, month, year, numerology, chakras);

    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed: DeepAnalysisResult = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Deep analysis error:", err);
    const message = err instanceof Error ? err.message : "ניתוח נכשל";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
