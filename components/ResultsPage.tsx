"use client";

import { useEffect, useState } from "react";
import { NumerologyResult } from "@/lib/numerology";
import { DESTINY_PATH, PERSONAL_YEAR, PEAK_MEANINGS, CHALLENGE_MEANINGS, GEMATRIA_MEANINGS, isKarmic, isMaster } from "@/lib/interpretations";
import { saveAnalysis, updateDeepAnalysis, exportToCsv } from "@/lib/storage";
import { calculateChakras } from "@/lib/chakras";
import {
  BASIS_MEANINGS, SEX_CREATION_MEANINGS, SOLAR_PLEXUS_MEANINGS,
  HEART_MEANINGS, THROAT_MEANINGS, THIRD_EYE_MEANINGS,
  CROWN_MEANINGS, UNIVERSE_MEANINGS, SUPER_MEANINGS,
} from "@/lib/chakraInterpretations";
import { DeepAnalysisResult } from "@/app/api/deep-analysis/route";

interface Props {
  result: NumerologyResult;
  firstName: string;
  lastName: string;
  day: number;
  month: number;
  year: number;
  onReset: () => void;
}

function NumberBadge({ n, size = "lg" }: { n: number; size?: "sm" | "lg" }) {
  const base = size === "lg" ? "text-3xl font-bold px-4 py-2" : "text-xl font-bold px-3 py-1";
  const color = isMaster(n)
    ? "bg-yellow-400/20 text-yellow-300 border-yellow-400/40"
    : isKarmic(n)
    ? "bg-red-500/20 text-red-300 border-red-400/40"
    : "bg-purple-500/20 text-purple-200 border-purple-400/40";
  return (
    <span className={`${base} ${color} rounded-xl border inline-block`}>{n}</span>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/8 rounded-2xl p-5 border border-white/15 mb-4">
      <h2 className="text-lg font-bold text-purple-200 mb-4 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value, meaning }: { label: string; value: number; meaning?: string }) {
  return (
    <div className="flex flex-col mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/70 text-sm">{label}</span>
        <NumberBadge n={value} size="sm" />
      </div>
      {meaning && <p className="text-white/50 text-xs leading-relaxed">{meaning}</p>}
    </div>
  );
}

interface ChakraCardProps {
  name: string;
  emoji: string;
  number: number;
  extra?: string;
  meaning?: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

function ChakraCard({ name, emoji, number, extra, meaning, bgClass, textClass, borderClass }: ChakraCardProps) {
  return (
    <div className={`${bgClass} ${borderClass} border rounded-xl p-3 mb-3`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`${textClass} text-sm font-semibold`}>{emoji} {name}{extra ? ` • ${extra}` : ""}</span>
        <NumberBadge n={number} size="sm" />
      </div>
      {meaning && <p className="text-white/55 text-xs leading-relaxed">{meaning}</p>}
    </div>
  );
}

export default function ResultsPage({ result, firstName, lastName, day, month, year, onReset }: Props) {
  const { destinyPath, personalYear, destinationAge, peaks, peakAges, challenges, gematria } = result;
  const [activeTab, setActiveTab] = useState<"numerology" | "chakras" | "deep">("numerology");
  const [deepAnalysis, setDeepAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepError, setDeepError] = useState("");
  const [recordId, setRecordId] = useState<string>("");

  const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

  const chakras = calculateChakras(firstName, lastName, day, month, year);

  async function fetchDeepAnalysis() {
    if (deepAnalysis || deepLoading) return;
    setDeepLoading(true);
    setDeepError("");
    try {
      const res = await fetch("/api/deep-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, day, month, year, numerology: result, chakras }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "שגיאה בניתוח");
      }
      const data: DeepAnalysisResult = await res.json();
      setDeepAnalysis(data);
      if (recordId) updateDeepAnalysis(recordId, data);
    } catch (err) {
      setDeepError(err instanceof Error ? err.message : "שגיאה בניתוח");
    } finally {
      setDeepLoading(false);
    }
  }

  useEffect(() => {
    const record = saveAnalysis(firstName, lastName, day, month, year, result);
    setRecordId(record.id);
  }, []);

  function handleExport() {
    const csv = exportToCsv();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "numerology_analyses.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 py-6 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">{firstName} {lastName}</h1>
          <p className="text-purple-300 mt-1" style={{direction:"ltr", unicodeBidi:"embed"}}>{day} {MONTHS_HE[month-1]} {year}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-white/5 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("numerology")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "numerology" ? "bg-purple-600 text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
          >
            🔢 נומרולוגיה
          </button>
          <button
            onClick={() => setActiveTab("chakras")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "chakras" ? "bg-purple-600 text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
          >
            🌈 צ&#39;אקרות
          </button>
          <button
            onClick={() => { setActiveTab("deep"); fetchDeepAnalysis(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "deep" ? "bg-purple-600 text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
          >
            🔍 ניתוח מעמיק
          </button>
        </div>

        {/* ===== TAB: NUMEROLOGY ===== */}
        {activeTab === "numerology" && <>

          {/* שביל גורל */}
          <Section title="שביל הגורל" icon="🌟">
            <div className="flex items-center gap-6">
              <NumberBadge n={destinyPath} />
              <div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {DESTINY_PATH[destinyPath] ?? ""}
                </p>
                {isMaster(destinyPath) && <span className="text-yellow-400 text-xs font-bold mt-1 block">✨ מספר מאסטר</span>}
                {isKarmic(destinyPath) && <span className="text-red-400 text-xs font-bold mt-1 block">⚠️ מספר קארמתי</span>}
              </div>
            </div>
          </Section>

          {/* שנה אישית + יציאה ליעוד */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/8 rounded-2xl p-5 border border-white/15 text-center">
              <p className="text-purple-200 text-sm mb-2">שנה אישית</p>
              <NumberBadge n={personalYear} />
              <p className="text-white/50 text-xs mt-2 leading-relaxed">
                {PERSONAL_YEAR[personalYear]?.split(".")[0] ?? ""}
              </p>
            </div>
            <div className="bg-white/8 rounded-2xl p-5 border border-white/15 text-center">
              <p className="text-purple-200 text-sm mb-2">יציאה ליעוד</p>
              <span className="text-3xl font-bold text-purple-200">גיל {destinationAge}</span>
              <p className="text-white/50 text-xs mt-2">תחילת מימוש הפוטנציאל</p>
            </div>
          </div>

          {/* פסגות + אתגרים */}
          <Section title="פסגות ואתגרים" icon="⛰️">
            <div className="grid grid-cols-2 gap-3 mb-2" style={{direction:"ltr"}}>
              <p className="text-purple-300 text-xs font-semibold text-center">פסגה</p>
              <p className="text-orange-300 text-xs font-semibold text-center">אתגר</p>
            </div>
            {([1,2,3,4] as const).map(i => {
              const pVal = peaks[`p${i}` as keyof typeof peaks];
              const cVal = challenges[`c${i}` as keyof typeof challenges];
              const ages = peakAges[`p${i}` as keyof typeof peakAges];
              const ageStr = ages.to ? `גיל ${ages.from}–${ages.to}` : `גיל ${ages.from}+`;
              return (
                <div key={i} className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10 last:border-0 last:mb-0 last:pb-0" style={{direction:"ltr"}}>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-white/40 text-xs">{i}</p>
                    <NumberBadge n={pVal} size="sm" />
                    <p className="text-white/40 text-xs">{ageStr}</p>
                    <p className="text-white/60 text-xs text-center leading-relaxed">{PEAK_MEANINGS[pVal]?.split(" - ")[0] ?? ""}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-white/40 text-xs">{i}</p>
                    <NumberBadge n={cVal} size="sm" />
                    <p className="text-white/60 text-xs text-center leading-relaxed">{CHALLENGE_MEANINGS[cVal]?.split(" - ")[0] ?? ""}</p>
                  </div>
                </div>
              );
            })}
          </Section>

          {/* גימטריה */}
          <Section title="גימטריה" icon="✡️">
            <Row label={`שם פרטי (${firstName})`} value={gematria.firstName} meaning={GEMATRIA_MEANINGS[gematria.firstName]} />
            <Row label={`שם משפחה (${lastName})`} value={gematria.lastName} meaning={GEMATRIA_MEANINGS[gematria.lastName]} />
            <div className="border-t border-white/10 pt-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">סה&quot;כ שם מלא</span>
                <NumberBadge n={gematria.total} size="sm" />
              </div>
              <p className="text-white/50 text-xs mt-1">{GEMATRIA_MEANINGS[gematria.total] ?? ""}</p>
            </div>
          </Section>
        </>}

        {/* ===== TAB: CHAKRAS ===== */}
        {activeTab === "chakras" && <>
          <Section title="מפת הצ׳אקרות" icon="🌈">
            <p className="text-white/40 text-xs mb-4">9 מרכזי אנרגיה המשקפים היבטים שונים באישיות</p>

            <ChakraCard name="על" emoji="✨" number={chakras.super_}
              meaning={SUPER_MEANINGS[chakras.super_]}
              bgClass="bg-amber-500/10" textClass="text-amber-300" borderClass="border-amber-400/25" />

            <ChakraCard name="יקום" emoji="🌌" number={chakras.universe}
              extra={chakras.zodiacName}
              meaning={UNIVERSE_MEANINGS[chakras.universe]}
              bgClass="bg-indigo-500/10" textClass="text-indigo-300" borderClass="border-indigo-400/25" />

            <ChakraCard name="כתר" emoji="👑" number={chakras.crown}
              meaning={CROWN_MEANINGS[chakras.crown]}
              bgClass="bg-white/8" textClass="text-white" borderClass="border-white/20" />

            <ChakraCard name="עין שלישית" emoji="🔮" number={chakras.thirdEye}
              meaning={THIRD_EYE_MEANINGS[chakras.thirdEye]}
              bgClass="bg-purple-500/10" textClass="text-purple-300" borderClass="border-purple-400/25" />

            <ChakraCard name="גרון" emoji="💙" number={chakras.throat}
              meaning={THROAT_MEANINGS[chakras.throat]}
              bgClass="bg-cyan-500/10" textClass="text-cyan-300" borderClass="border-cyan-400/25" />

            <ChakraCard name="לב" emoji="💚" number={chakras.heart}
              meaning={HEART_MEANINGS[chakras.heart]}
              bgClass="bg-green-500/10" textClass="text-green-300" borderClass="border-green-400/25" />

            <ChakraCard name="מקלעת השמש" emoji="☀️" number={chakras.solarPlexus}
              meaning={SOLAR_PLEXUS_MEANINGS[chakras.solarPlexus]}
              bgClass="bg-yellow-500/10" textClass="text-yellow-300" borderClass="border-yellow-400/25" />

            <ChakraCard name="מין ויצירה" emoji="🟠" number={chakras.sexAndCreation}
              meaning={SEX_CREATION_MEANINGS[chakras.sexAndCreation]}
              bgClass="bg-orange-500/10" textClass="text-orange-300" borderClass="border-orange-400/25" />

            <ChakraCard name="בסיס" emoji="🔴" number={chakras.basis}
              meaning={BASIS_MEANINGS[chakras.basis]}
              bgClass="bg-red-500/10" textClass="text-red-300" borderClass="border-red-400/25" />
          </Section>
        </>}

        {/* ===== TAB: DEEP ANALYSIS ===== */}
        {activeTab === "deep" && <>
          {deepLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              <p className="text-purple-300 text-sm">מנתח את המפה הנומרולוגית שלך...</p>
            </div>
          )}
          {deepError && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-5 text-center">
              <p className="text-red-300 text-sm mb-3">{deepError}</p>
              <button onClick={() => { setDeepError(""); fetchDeepAnalysis(); }}
                className="px-4 py-2 rounded-xl border border-red-400/40 text-red-300 hover:bg-red-400/10 text-sm transition-all">
                נסה שוב
              </button>
            </div>
          )}
          {deepAnalysis && <>
            {([
              { key: "career",        label: "קריירה ותעסוקה", emoji: "💼", bg: "bg-blue-500/10",   text: "text-blue-300",   border: "border-blue-400/25" },
              { key: "relationships", label: "זוגיות ומשפחה",  emoji: "💑", bg: "bg-pink-500/10",   text: "text-pink-300",   border: "border-pink-400/25" },
              { key: "challenges",    label: "אתגרים ותיקון",  emoji: "🌀", bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-400/25" },
              { key: "strengths",     label: "כוחות ומתנות",   emoji: "✨", bg: "bg-amber-500/10",  text: "text-amber-300",  border: "border-amber-400/25" },
            ] as const).map(({ key, label, emoji, bg, text, border }) => (
              <div key={key} className={`${bg} ${border} border rounded-2xl p-5 mb-4`}>
                <h3 className={`${text} font-bold text-base mb-3`}>{emoji} {label}</h3>
                <p className="text-white/75 text-sm leading-relaxed">{deepAnalysis[key]}</p>
              </div>
            ))}
          </>}
        </>}

        {/* Action buttons */}
        <div className="flex gap-3 mt-2 mb-8">
          <button onClick={onReset} className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm">
            ← ניתוח חדש
          </button>
          <button onClick={handleExport} className="flex-1 py-3 rounded-xl border border-purple-400/40 text-purple-300 hover:bg-purple-400/10 transition-all text-sm">
            📊 ייצא כל הניתוחים
          </button>
        </div>
      </div>
    </div>
  );
}
