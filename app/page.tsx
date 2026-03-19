"use client";

import { useState, useEffect } from "react";
import { analyze, NumerologyResult } from "@/lib/numerology";
import { loadAll, AnalysisRecord } from "@/lib/storage";
import ResultsPage from "@/components/ResultsPage";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(loadAll());
  }, []);

  function handleSelectHistory(record: AnalysisRecord) {
    setFirstName(record.firstName);
    setLastName(record.lastName);
    setDay(String(record.day));
    setMonth(String(record.month));
    setYear(String(record.year));
    setShowHistory(false);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (!firstName.trim() || !lastName.trim()) { setError("יש להזין שם פרטי ושם משפחה"); return; }
    if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2025) { setError("תאריך לידה לא תקין"); return; }
    setResult(analyze({ day: d, month: m, year: y, firstName, lastName }));
  }

  function handleReset() {
    setResult(null); setFirstName(""); setLastName(""); setDay(""); setMonth(""); setYear("");
    setHistory(loadAll());
  }

  if (result) {
    return <ResultsPage result={result} firstName={firstName} lastName={lastName} day={parseInt(day)} month={parseInt(month)} year={parseInt(year)} onReset={handleReset} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">מפה נומרולוגית</h1>
          <p className="text-purple-300 text-lg">גלה את המספרים שמעצבים את חייך</p>
        </div>
        {history.length > 0 && (
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => setShowHistory(h => !h)}
              className="w-full py-2.5 px-4 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm text-right flex items-center justify-between"
            >
              <span>📋 ניתוחים קודמים ({history.length})</span>
              <span>{showHistory ? "▲" : "▼"}</span>
            </button>
            {showHistory && (
              <div className="absolute z-10 w-full mt-1 bg-indigo-950/95 border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                {history.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectHistory(r)}
                    className="w-full text-right px-4 py-2.5 text-white/80 hover:bg-white/10 transition-colors text-sm border-b border-white/5 last:border-0"
                  >
                    <span className="font-medium">{r.firstName} {r.lastName}</span>
                    <span className="text-white/40 text-xs mr-2">{r.day}/{r.month}/{r.year}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <datalist id="firstNames">
          {[...new Set(history.map(r => r.firstName))].map(n => <option key={n} value={n} />)}
        </datalist>
        <datalist id="lastNames">
          {[...new Set(history.map(r => r.lastName))].map(n => <option key={n} value={n} />)}
        </datalist>
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="mb-5">
            <label className="block text-purple-200 text-sm font-medium mb-1">שם פרטי בעברית</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="למשל: גלית"
              list="firstNames"
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-right text-lg" />
          </div>
          <div className="mb-5">
            <label className="block text-purple-200 text-sm font-medium mb-1">שם משפחה בעברית</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="למשל: גרינשטיין"
              list="lastNames"
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-right text-lg" />
          </div>
          <div className="mb-6">
            <label className="block text-purple-200 text-sm font-medium mb-1">תאריך לידה</label>
            <div className="flex gap-2">
              <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="שנה" min="1900" max="2025"
                className="flex-[2] bg-white/10 border border-white/30 rounded-xl px-3 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-center text-lg" />
              <input type="number" value={month} onChange={e => setMonth(e.target.value)} placeholder="חודש" min="1" max="12"
                className="flex-1 bg-white/10 border border-white/30 rounded-xl px-3 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-center text-lg" />
              <input type="number" value={day} onChange={e => setDay(e.target.value)} placeholder="יום" min="1" max="31"
                className="flex-1 bg-white/10 border border-white/30 rounded-xl px-3 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-center text-lg" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg active:scale-95">
            ✨ צור מפה נומרולוגית
          </button>
        </form>
        <p className="text-center text-white/30 text-xs mt-4">מכללת הצ&#39;אקרות • יעקבי בן בסט</p>
      </div>
    </main>
  );
}
