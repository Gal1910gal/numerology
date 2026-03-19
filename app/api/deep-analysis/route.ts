import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildDeepPrompt, SYSTEM_PROMPT } from "@/lib/deepPrompt";
import { NumerologyResult } from "@/lib/numerology";
import { ChakraResult } from "@/lib/chakras";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface DeepAnalysisResult {
  career: string;
  relationships: string;
  challenges: string;
  strengths: string;
}

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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = buildDeepPrompt(firstName, lastName, day, month, year, numerology, chakras);
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed: DeepAnalysisResult = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Deep analysis error:", err);
    const message = err instanceof Error ? err.message : "ניתוח נכשל";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
