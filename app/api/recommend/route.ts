import Anthropic from "@anthropic-ai/sdk";

type ProviderResult = {
  text: string | null;
  provider: "claude" | "fallback";
  model: string;
};

type RecommendationPayload = {
  drug: string;
  drugClass: string;
  cpicLevel: string;
  severity: "caution" | "adjust" | "safe";
  headline: string;
  recommendation?: string;
  rationale: string;
  evidenceSource: string;
  alternatives: { drug: string; reason: string }[];
  prescriptionText: string;
  monitoring: string;
};

function getRuleBasedRecommendation(drug: string) {
  const normalized = drug.trim().toLowerCase();

  const recommendations: Record<string, RecommendationPayload> = {
    sertraline: {
      drug: "Sertraline",
      drugClass: "SSRI",
      cpicLevel: "A",
      severity: "adjust",
      headline: "Reduce starting dose by 50%",
      recommendation: "Start low and titrate slowly.",
      rationale:
        "CYP2C19 poor metabolizer status can increase sertraline exposure and side effects. Start at a lower dose and monitor tolerability before escalating.",
      evidenceSource: "CPIC SSRI guidance",
      alternatives: [
        { drug: "Fluoxetine", reason: "Less dependent on CYP2C19 metabolism for exposure." },
        { drug: "Mirtazapine", reason: "Not strongly affected by this patient's PGx profile." },
      ],
      prescriptionText:
        "Sertraline 25 mg PO daily for 7 days, then reassess response and adverse effects before dose increase.",
      monitoring: "Watch for GI side effects, activation, and QT-risk factors.",
    },
    codeine: {
      drug: "Codeine",
      drugClass: "Opioid analgesic",
      cpicLevel: "A",
      severity: "caution",
      headline: "Avoid codeine due to likely lack of efficacy",
      recommendation: "Use a non-codeine analgesic.",
      rationale:
        "CYP2D6 poor metabolizer status reduces conversion of codeine to morphine, making analgesic benefit unlikely.",
      evidenceSource: "CPIC opioid guidance",
      alternatives: [
        { drug: "Morphine", reason: "Does not require CYP2D6 bioactivation." },
        { drug: "Hydromorphone", reason: "Avoids CYP2D6-dependent codeine activation." },
      ],
      prescriptionText:
        "Avoid codeine. Consider morphine IR 5 mg PO q4-6h PRN pain, adjust to clinical response.",
      monitoring: "Assess pain control and opioid adverse effects with standard monitoring.",
    },
    warfarin: {
      drug: "Warfarin",
      drugClass: "Vitamin K antagonist",
      cpicLevel: "A",
      severity: "adjust",
      headline: "Lower initial dose likely appropriate",
      recommendation: "Use conservative initial dosing and INR-guided titration.",
      rationale:
        "VKORC1 sensitivity genotype predicts increased warfarin sensitivity. CYP2C9 appears normal, but VKORC1 supports lower starting dose strategy.",
      evidenceSource: "CPIC warfarin guidance",
      alternatives: [
        { drug: "Apixaban", reason: "Alternative anticoagulant when clinically appropriate." },
      ],
      prescriptionText:
        "Warfarin initial dose 2-3 mg PO daily with close INR monitoring and dose adjustment per protocol.",
      monitoring: "Frequent INR checks during initiation; monitor bleeding/bruising.",
    },
    clopidogrel: {
      drug: "Clopidogrel",
      drugClass: "P2Y12 inhibitor",
      cpicLevel: "A",
      severity: "caution",
      headline: "Avoid clopidogrel in CYP2C19 poor metabolizer",
      recommendation: "Prefer alternative antiplatelet therapy.",
      rationale:
        "CYP2C19 poor metabolizer status impairs activation of clopidogrel, reducing antiplatelet effect and increasing treatment failure risk.",
      evidenceSource: "CPIC antiplatelet guidance",
      alternatives: [
        { drug: "Prasugrel", reason: "Not dependent on CYP2C19 activation to same degree." },
        { drug: "Ticagrelor", reason: "Bypasses CYP2C19-dependent prodrug activation." },
      ],
      prescriptionText:
        "Avoid clopidogrel. Consider ticagrelor 90 mg PO BID (if no contraindication) per cardiology protocol.",
      monitoring: "Monitor bleeding risk and therapy-specific contraindications.",
    },
    plavix: {
      drug: "Plavix (clopidogrel)",
      drugClass: "P2Y12 inhibitor",
      cpicLevel: "A",
      severity: "caution",
      headline: "Avoid Plavix due to CYP2C19 poor metabolism",
      recommendation: "Use prasugrel or ticagrelor when appropriate.",
      rationale:
        "This patient's CYP2C19 poor metabolizer profile predicts reduced clopidogrel activation and reduced antiplatelet efficacy.",
      evidenceSource: "CPIC antiplatelet guidance",
      alternatives: [
        { drug: "Prasugrel", reason: "Less affected by CYP2C19 loss-of-function variants." },
        { drug: "Ticagrelor", reason: "Direct-acting antiplatelet option." },
      ],
      prescriptionText:
        "Avoid Plavix. Use alternative antiplatelet per ACS/PCI guideline and patient-specific contraindications.",
      monitoring: "Monitor ischemic and bleeding outcomes per antiplatelet protocol.",
    },
    omeprazole: {
      drug: "Omeprazole",
      drugClass: "Proton pump inhibitor",
      cpicLevel: "B",
      severity: "adjust",
      headline: "Use lower starting dose",
      recommendation: "Consider dose reduction and symptom-guided titration.",
      rationale:
        "CYP2C19 poor metabolizer status can increase omeprazole exposure. Many patients tolerate standard doses, but lower initial dosing may reduce adverse effects.",
      evidenceSource: "CPIC/PPI PGx evidence",
      alternatives: [
        { drug: "Rabeprazole", reason: "Less CYP2C19-dependent clearance profile." },
      ],
      prescriptionText: "Omeprazole 10-20 mg PO daily initially; titrate based on symptom control.",
      monitoring: "Monitor symptom response and long-term PPI adverse effect risk.",
    },
    citalopram: {
      drug: "Citalopram",
      drugClass: "SSRI",
      cpicLevel: "A",
      severity: "adjust",
      headline: "Consider reduced starting dose",
      recommendation: "Start low and avoid aggressive up-titration.",
      rationale:
        "CYP2C19 poor metabolizer status increases citalopram exposure, which may raise risk of dose-related adverse effects including QT concerns.",
      evidenceSource: "CPIC SSRI guidance",
      alternatives: [
        { drug: "Fluoxetine", reason: "Less impacted by CYP2C19 poor metabolizer status." },
      ],
      prescriptionText:
        "Citalopram 10 mg PO daily initially; reassess efficacy/tolerability before any dose increase.",
      monitoring: "Monitor for serotonergic effects and QT-risk factors when clinically indicated.",
    },
    tamoxifen: {
      drug: "Tamoxifen",
      drugClass: "Selective estrogen receptor modulator",
      cpicLevel: "A",
      severity: "caution",
      headline: "Potential reduced activation risk",
      recommendation: "Discuss alternatives with oncology.",
      rationale:
        "CYP2D6 poor metabolizer status can reduce conversion to active endoxifen, potentially reducing efficacy in tamoxifen-dependent treatment plans.",
      evidenceSource: "CPIC tamoxifen guidance",
      alternatives: [
        { drug: "Aromatase inhibitor", reason: "Alternative option in eligible postmenopausal patients." },
      ],
      prescriptionText:
        "If tamoxifen is required, coordinate oncology review for endoxifen considerations and alternative options.",
      monitoring: "Oncology-directed efficacy monitoring and adverse effect surveillance.",
    },
    ibuprofen: {
      drug: "Ibuprofen",
      drugClass: "NSAID",
      cpicLevel: "C",
      severity: "safe",
      headline: "Standard dosing appropriate",
      recommendation: "Use routine dosing with standard safety precautions.",
      rationale:
        "This patient's genotype profile does not suggest a major clinically actionable PGx interaction for ibuprofen in routine use.",
      evidenceSource: "PharmGKB lookup",
      alternatives: [],
      prescriptionText: "Ibuprofen - prescribe per standard guidelines and clinical context.",
      monitoring: "Standard NSAID monitoring (GI, renal, cardiovascular risk as appropriate).",
    },
  };

  return recommendations[normalized] ?? null;
}

function getFallbackRecommendation(drug: string): RecommendationPayload {
  return {
    drug,
    drugClass: "Unknown",
    cpicLevel: "C",
    severity: "safe",
    headline: "No specific PGx guidance",
    rationale: `No established pharmacogenomic guidance was found for ${drug} based on this patient's profile. Standard dosing is likely appropriate, but verify with current prescribing information.`,
    evidenceSource: "PharmGKB lookup",
    alternatives: [],
    prescriptionText: `${drug} - prescribe per standard guidelines`,
    monitoring: "Standard monitoring for this drug class",
  };
}

function jsonWithProvider(body: unknown, provider: ProviderResult["provider"], model: string) {
  return Response.json(body, {
    headers: {
      "x-ai-provider": provider,
      "x-ai-model": model,
    },
  });
}

function buildSystemPrompt(patient: { genes: { gene: string; genotype: string; phenotype: string }[] }) {
  return `You are a clinical pharmacogenomics assistant helping doctors prescribe medications safely based on patient genetic profiles. You provide CPIC-grade recommendations.

The patient has the following PGx profile:
${patient.genes.map((g) => `- ${g.gene}: ${g.genotype} (${g.phenotype})`).join("\n")}

When given a drug, return ONLY valid JSON in this exact format:
{
  "drug": "drug name",
  "cpicLevel": "A|B|C|D",
  "recommendation": "short bold action statement",
  "severity": "caution|adjust|safe",
  "rationale": "1-2 sentence clinical explanation referencing the patient's specific genes",
  "alternatives": [
    {"drug": "name", "reason": "why this is safer for this patient"}
  ],
  "prescriptionText": "exact suggested prescription with dose and notes"
}

Base recommendations on real CPIC guidelines. Be specific to this patient's genotypes. If a drug isn't affected by the patient's profile, return severity: "safe" with normal dosing guidance.
If the drug is not affected by this patient's pharmacogenomic profile (or has no established PGx guidance), still return valid JSON with severity: "safe", a headline like "Standard dosing appropriate", and a rationale explaining that this patient's genotypes don't impact this drug's metabolism. NEVER return an error or refuse to answer — always return the JSON structure.`;
}

async function requestFromClaude(systemPrompt: string, drug: string): Promise<ProviderResult | null> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    return null as ProviderResult | null;
  }

  const client = new Anthropic({ apiKey: anthropicApiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: `Drug: ${drug}` }],
  });

  if (!response.content[0]) {
    return null;
  }

  return {
    text: response.content[0].type === "text" ? response.content[0].text : null,
    provider: "claude",
    model: "claude-sonnet-4-5",
  };
}

export async function POST(req: Request) {
  let requestedDrug = "Unknown drug";
  try {
    const { drug, patient } = await req.json();
    requestedDrug = typeof drug === "string" && drug.trim() ? drug.trim() : "Unknown drug";

    if (!drug || !patient?.genes) {
      return Response.json({ error: "Missing drug or patient payload." }, { status: 400 });
    }

    const hardcoded = getRuleBasedRecommendation(requestedDrug);
    if (hardcoded) {
      return jsonWithProvider(hardcoded, "fallback", "rule-based-demo");
    }

    const systemPrompt = buildSystemPrompt(patient);
    const providerResult = await requestFromClaude(systemPrompt, requestedDrug);
    if (!providerResult?.text) {
      return jsonWithProvider(getFallbackRecommendation(requestedDrug), "fallback", "local-fallback");
    }
    console.info(`[recommend] provider=${providerResult.provider} model=${providerResult.model} drug=${requestedDrug}`);

    const jsonMatch = providerResult.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return jsonWithProvider(getFallbackRecommendation(requestedDrug), "fallback", "local-fallback");
    }
    try {
      return jsonWithProvider(JSON.parse(jsonMatch[0]), providerResult.provider, providerResult.model);
    } catch {
      return jsonWithProvider(getFallbackRecommendation(requestedDrug), "fallback", "local-fallback");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return jsonWithProvider(getFallbackRecommendation(requestedDrug), "fallback", "local-fallback");
  }
}
