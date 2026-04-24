import type { GeneVariant } from "@/lib/types";

export type SeverityLevel = "caution" | "adjust" | "safe";

export type PatientGene = {
  gene: string;
  genotype: string;
  phenotype: string;
  activityScore: number | null;
  affects: string;
};

export type DrugAlert = {
  drug: string;
  brand: string | null;
  reason: string;
};

export type PatientProfile = {
  name: string;
  age: number;
  sex: string;
  testedDate: string;
  source?: string;
  variants?: GeneVariant[];
  genes: PatientGene[];
  drugAlerts: {
    caution: DrugAlert[];
    adjust: DrugAlert[];
    safe?: DrugAlert[];
  };
};

export type Recommendation = {
  drug: string;
  cpicLevel: "A" | "B" | "C" | "D" | string;
  recommendation?: string;
  headline?: string;
  drugClass?: string;
  evidenceSource?: string;
  monitoring?: string;
  severity: SeverityLevel;
  rationale: string;
  alternatives: { drug: string; reason: string }[];
  prescriptionText: string;
};

export const SAMPLE_PATIENT: PatientProfile = {
  name: "Jordan Sample",
  age: 32,
  sex: "Female",
  testedDate: "2026-04-24",
  genes: [
    {
      gene: "CYP2C19",
      genotype: "*2/*2",
      phenotype: "Poor Metabolizer",
      activityScore: 0.0,
      affects: "antidepressants, blood thinners, acid reducers",
    },
    {
      gene: "CYP2D6",
      genotype: "*4/*4",
      phenotype: "Poor Metabolizer",
      activityScore: 0.0,
      affects: "codeine, tamoxifen, psychiatric medications",
    },
    {
      gene: "CYP2C9",
      genotype: "*1/*1",
      phenotype: "Normal",
      activityScore: 2.0,
      affects: "warfarin, NSAIDs",
    },
    {
      gene: "TPMT",
      genotype: "*1/*1",
      phenotype: "Normal",
      activityScore: null,
      affects: "thiopurine medications",
    },
    {
      gene: "VKORC1",
      genotype: "-1639G>A",
      phenotype: "Sensitive",
      activityScore: null,
      affects: "warfarin sensitivity",
    },
    {
      gene: "HLA-B",
      genotype: "*57:01 negative",
      phenotype: "—",
      activityScore: null,
      affects: "abacavir safety",
    },
  ],
  drugAlerts: {
    caution: [
      {
        drug: "Clopidogrel",
        brand: "Plavix",
        reason: "Your CYP2C19 cannot activate this drug effectively.",
      },
      {
        drug: "Citalopram",
        brand: "Celexa",
        reason: "Standard doses may cause elevated blood levels.",
      },
      {
        drug: "Codeine",
        brand: null,
        reason: "Your CYP2D6 cannot convert codeine to morphine — likely ineffective.",
      },
    ],
    adjust: [
      {
        drug: "Omeprazole",
        brand: "Prilosec",
        reason: "May require reduced dosing.",
      },
      {
        drug: "Sertraline",
        brand: "Zoloft",
        reason: "Start at 50% standard dose.",
      },
      {
        drug: "Tamoxifen",
        brand: null,
        reason: "May not be effectively activated.",
      },
    ],
    safe: [
      {
        drug: "Abacavir",
        brand: "Ziagen",
        reason: "HLA-B*57:01 negative profile supports routine safety use.",
      },
      {
        drug: "Azathioprine",
        brand: "Imuran",
        reason: "TPMT normal activity supports standard starting strategy.",
      },
    ],
  },
};
