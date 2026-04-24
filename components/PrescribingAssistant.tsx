"use client";

import { useCallback, useState } from "react";
import { RecommendationCard } from "@/components/RecommendationCard";
import { SearchIcon } from "@/components/icons";
import type { PatientProfile, Recommendation } from "@/lib/samplePatient";

type PrescribingAssistantProps = {
  patient: PatientProfile;
};

export function PrescribingAssistant({ patient }: PrescribingAssistantProps) {
  const [query, setQuery] = useState("Sertraline");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const quickDrugs = ["Sertraline", "Codeine", "Warfarin", "Ibuprofen", "Plavix"];

  const handleSubmit = useCallback(
    async (drugName: string) => {
      const trimmedDrug = drugName.trim();
      if (!trimmedDrug) {
        return;
      }

      setLoading(true);
      setMessage(null);
      setAnalysisSource(null);

      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drug: trimmedDrug, patient }),
        });

        if (!response.ok) {
          throw new Error("Could not reach prescribing assistant.");
        }

        const provider = response.headers.get("x-ai-provider");
        const model = response.headers.get("x-ai-model");
        const result = (await response.json()) as Recommendation | null;
        if (!result) {
          throw new Error("Assistant returned an empty recommendation.");
        }

        setRecommendation(result);
        if (provider && model) {
          setAnalysisSource(`AI source: ${provider} (${model})`);
        }
      } catch (error) {
        setMessage("We hit an issue reaching Claude. Please retry in a moment.");
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [patient],
  );

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSubmit(query);
  };

  const handleCopy = async () => {
    if (!recommendation?.prescriptionText) {
      return;
    }
    await navigator.clipboard.writeText(recommendation.prescriptionText);
    setMessage("Prescription text copied.");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onFormSubmit} className="rounded-2xl border border-black/5 bg-white p-6 shadow-soft">
        <div className="flex items-baseline justify-between">
          <h3 className="tracking-tightish text-[15px] font-semibold text-[#1D1D1F]">
            Check a drug or prescription
          </h3>
          <span className="text-[12px] text-black/45">Live PGx interaction check</span>
        </div>

        <div className="relative mt-4">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/45">
            <SearchIcon size={16} />
          </div>
          <input
            id="drug-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a drug name (e.g., Sertraline 50mg)"
            className="input-frost w-full rounded-full py-3 pl-11 pr-4 text-[14px] placeholder:text-black/45"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit(query);
              }
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-black/50">
          <span>Try:</span>
          {quickDrugs.map((drug) => (
            <button
              key={drug}
              type="button"
              className="rounded-full border border-black/10 bg-white px-3 py-1 transition-colors hover:bg-black/5"
              onClick={() => {
                setQuery(drug);
                void handleSubmit(drug);
              }}
            >
              {drug}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button type="submit" className="rounded-full bg-[#007AFF] px-5 py-2.5 text-[13px] font-semibold text-white">
            Analyze
          </button>
        </div>
        {analysisSource ? <p className="mt-3 text-right text-[11px] text-black/45">{analysisSource}</p> : null}
      </form>

      <RecommendationCard
        recommendation={recommendation}
        onCopyPrescription={handleCopy}
        isLoading={loading}
        message={message}
      />
    </div>
  );
}
