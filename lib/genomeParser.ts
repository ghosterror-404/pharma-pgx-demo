import type { GeneVariant } from "./types";

export const PGX_SNPS: Record<string, { gene: string; affects: string }> = {
  rs4244285: { gene: "CYP2C19", affects: "antidepressants, blood thinners, acid reducers" },
  rs4986893: { gene: "CYP2C19", affects: "antidepressants, blood thinners, acid reducers" },
  rs12248560: { gene: "CYP2C19", affects: "antidepressants, blood thinners, acid reducers" },
  rs3892097: { gene: "CYP2D6", affects: "codeine, tamoxifen, psychiatric medications" },
  rs1065852: { gene: "CYP2D6", affects: "codeine, tamoxifen, psychiatric medications" },
  rs1799853: { gene: "CYP2C9", affects: "warfarin, NSAIDs, phenytoin" },
  rs1057910: { gene: "CYP2C9", affects: "warfarin, NSAIDs, phenytoin" },
  rs9923231: { gene: "VKORC1", affects: "warfarin sensitivity" },
  rs1142345: { gene: "TPMT", affects: "thiopurines (azathioprine, 6-MP)" },
  rs2395029: { gene: "HLA-B", affects: "abacavir hypersensitivity risk" },
};

export function genotypeToPhenotype(rsid: string, genotype: string): string {
  const g = genotype.replace(/[\/|]/g, "").toUpperCase();

  const riskAlleles: Record<string, { risk: string; description: (count: number) => string }> = {
    rs4244285: {
      risk: "A",
      description: (count) =>
        count === 2 ? "Poor Metabolizer" : count === 1 ? "Intermediate Metabolizer" : "Normal Metabolizer",
    },
    rs4986893: {
      risk: "A",
      description: (count) =>
        count === 2 ? "Poor Metabolizer" : count === 1 ? "Intermediate Metabolizer" : "Normal Metabolizer",
    },
    rs12248560: {
      risk: "T",
      description: (count) => (count >= 1 ? "Rapid Metabolizer" : "Normal Metabolizer"),
    },
    rs3892097: {
      risk: "A",
      description: (count) =>
        count === 2 ? "Poor Metabolizer" : count === 1 ? "Intermediate Metabolizer" : "Normal Metabolizer",
    },
    rs1065852: {
      risk: "T",
      description: (count) =>
        count === 2 ? "Poor Metabolizer" : count === 1 ? "Intermediate Metabolizer" : "Normal Metabolizer",
    },
    rs1799853: {
      risk: "T",
      description: (count) => (count >= 1 ? "Reduced Metabolizer" : "Normal Metabolizer"),
    },
    rs1057910: {
      risk: "C",
      description: (count) => (count >= 1 ? "Reduced Metabolizer" : "Normal Metabolizer"),
    },
    rs9923231: {
      risk: "T",
      description: (count) =>
        count === 2 ? "High warfarin sensitivity" : count === 1 ? "Moderate sensitivity" : "Normal sensitivity",
    },
    rs1142345: {
      risk: "C",
      description: (count) =>
        count === 2 ? "Poor Metabolizer (severe risk)" : count === 1 ? "Intermediate Metabolizer" : "Normal Metabolizer",
    },
    rs2395029: {
      risk: "G",
      description: (count) =>
        count >= 1 ? "HLA-B*57:01 positive (avoid abacavir)" : "HLA-B*57:01 negative (abacavir safe)",
    },
  };

  const config = riskAlleles[rsid];
  if (!config) {
    return "Unknown";
  }

  const riskCount = (g.match(new RegExp(config.risk, "g")) || []).length;
  return config.description(riskCount);
}

export function parseConsumerFormat(text: string): GeneVariant[] {
  const lines = text.split("\n");
  const variants: GeneVariant[] = [];

  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) {
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length < 4) {
      continue;
    }

    const [rsid, , , genotype] = parts;
    if (!PGX_SNPS[rsid]) {
      continue;
    }

    variants.push({
      rsid,
      gene: PGX_SNPS[rsid].gene,
      genotype,
      phenotype: genotypeToPhenotype(rsid, genotype),
      affects: PGX_SNPS[rsid].affects,
    });
  }

  return variants;
}

export function parseVCF(text: string): GeneVariant[] {
  const lines = text.split("\n");
  const variants: GeneVariant[] = [];

  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) {
      continue;
    }

    const parts = line.split("\t");
    if (parts.length < 10) {
      continue;
    }

    const [, , rsid, ref, alt, , , , , sample] = parts;
    if (!PGX_SNPS[rsid]) {
      continue;
    }

    const gt = sample.split(":")[0];
    let genotype = "";
    if (gt === "0/0" || gt === "0|0") {
      genotype = ref + ref;
    } else if (gt === "1/1" || gt === "1|1") {
      genotype = alt + alt;
    } else if (gt === "0/1" || gt === "1/0" || gt === "0|1" || gt === "1|0") {
      genotype = ref + alt;
    } else {
      continue;
    }

    variants.push({
      rsid,
      gene: PGX_SNPS[rsid].gene,
      genotype,
      phenotype: genotypeToPhenotype(rsid, genotype),
      affects: PGX_SNPS[rsid].affects,
    });
  }

  return variants;
}

export async function parseGenomeFile(file: File): Promise<GeneVariant[] | null> {
  try {
    const text = await file.text();
    const isVCF = text.includes("##fileformat=VCF") || text.startsWith("##");
    const variants = isVCF ? parseVCF(text) : parseConsumerFormat(text);
    if (variants.length >= 3) {
      return variants;
    }

    return null;
  } catch (error) {
    console.error("Genome parse failed:", error);
    return null;
  }
}
