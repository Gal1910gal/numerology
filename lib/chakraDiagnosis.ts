import { ChakraResult } from "./chakras";
import { NumerologyResult } from "./numerology";

export type ChakraState = "master" | "strong" | "balanced" | "weak" | "karmic";

export interface ChakraDiagnosis {
  name: string;
  hebrewName: string;
  value: number;
  state: ChakraState;
  stateLabel: string;
}

export interface DiagnosisContext {
  chakras: ChakraDiagnosis[];
  dominant: ChakraDiagnosis[];       // state=strong or master
  blocked: ChakraDiagnosis[];        // state=karmic
  weak: ChakraDiagnosis[];
  careerType: "independent" | "employed" | "mixed";
  hasADHDPattern: boolean;
  hasMentalHealthFlag: boolean;
  hasCrisisFlag: boolean;
  crisisExitNumber: number;          // מין ויצירה value
  lifeCycleType: "rising" | "support" | "challenge";
}

const MASTER = [11, 22, 33];
const KARMIC = [13, 14, 16, 19];
const CAREER_INDEPENDENT = [1, 3, 5, 8, 9, 11, 22, 33];
const CAREER_EMPLOYED = [2, 4, 6, 7, 16];
const MENTAL_HEALTH = [2, 7, 11];
const CRISIS_FLAG = [7, 13, 14, 16, 19];
const LIFE_RISING = [1, 8, 9, 11, 22];
const LIFE_SUPPORT = [2, 4, 6];

function classifyState(value: number): ChakraState {
  if (KARMIC.includes(value)) return "karmic";
  if (MASTER.includes(value)) return "master";
  if (value >= 7) return "strong";
  if (value >= 4) return "balanced";
  return "weak";
}

function stateLabel(state: ChakraState): string {
  switch (state) {
    case "master": return "אנרגיית מאסטר";
    case "strong": return "חזקה / דומיננטית";
    case "balanced": return "מאוזנת";
    case "weak": return "חלשה / זקוקה להפעלה";
    case "karmic": return "חסימה קארמתית";
  }
}

const CHAKRA_META: { key: keyof ChakraResult; name: string; hebrewName: string }[] = [
  { key: "super_",        name: "super",       hebrewName: "על" },
  { key: "universe",      name: "universe",    hebrewName: "יקום" },
  { key: "crown",         name: "crown",       hebrewName: "כתר" },
  { key: "thirdEye",      name: "thirdEye",    hebrewName: "עין שלישית" },
  { key: "throat",        name: "throat",      hebrewName: "גרון" },
  { key: "heart",         name: "heart",       hebrewName: "לב" },
  { key: "solarPlexus",   name: "solarPlexus", hebrewName: "מקלעת השמש" },
  { key: "sexAndCreation",name: "sexAndCreation", hebrewName: "מין ויצירה" },
  { key: "basis",         name: "basis",       hebrewName: "בסיס" },
];

export function buildDiagnosisContext(
  chakras: ChakraResult,
  numerology: NumerologyResult
): DiagnosisContext {
  const diagnosed: ChakraDiagnosis[] = CHAKRA_META.map(({ key, name, hebrewName }) => {
    const value = key === "zodiacName" ? 0 : (chakras[key] as number);
    const state = classifyState(value);
    return { name, hebrewName, value, state, stateLabel: stateLabel(state) };
  });

  const dominant = diagnosed.filter(c => c.state === "strong" || c.state === "master");
  const blocked  = diagnosed.filter(c => c.state === "karmic");
  const weak     = diagnosed.filter(c => c.state === "weak");

  // Career type based on מין ויצירה + בסיס
  const sexVal   = chakras.sexAndCreation;
  const basisVal = chakras.basis;
  const indScore = [sexVal, basisVal].filter(v => CAREER_INDEPENDENT.includes(v)).length;
  const empScore = [sexVal, basisVal].filter(v => CAREER_EMPLOYED.includes(v)).length;
  const careerType = indScore > empScore ? "independent" : empScore > indScore ? "employed" : "mixed";

  // ADHD: values 1,3,5 appearing in sex+creation, crown, throat (שיעור 19)
  const adhdValues = [chakras.sexAndCreation, chakras.crown, chakras.throat];
  const adhdMatches = adhdValues.filter(v => [1, 3, 5].includes(v)).length;
  const hasADHDPattern = adhdMatches >= 2;

  // Mental health: 2,7,11 in multiple chakras
  const mentalCount = diagnosed.filter(c => MENTAL_HEALTH.includes(c.value)).length;
  const hasMentalHealthFlag = mentalCount >= 2;

  // Crisis flag: 7,13,14,16,19 in thirdEye or solarPlexus (שיעור 21)
  const hasCrisisFlag = CRISIS_FLAG.includes(chakras.thirdEye) || CRISIS_FLAG.includes(chakras.solarPlexus);

  // Life cycle from solar plexus (שיעור 21)
  const spVal = chakras.solarPlexus;
  const lifeCycleType = LIFE_RISING.includes(spVal) ? "rising"
    : LIFE_SUPPORT.includes(spVal) ? "support" : "challenge";

  return {
    chakras: diagnosed,
    dominant,
    blocked,
    weak,
    careerType,
    hasADHDPattern,
    hasMentalHealthFlag,
    hasCrisisFlag,
    crisisExitNumber: chakras.sexAndCreation,
    lifeCycleType,
  };
}
