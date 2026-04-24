import type { Recommendation } from "@/lib/samplePatient";

type RecommendationCardProps = {
  recommendation: Recommendation | null;
  onCopyPrescription: () => void;
  isLoading: boolean;
  message: string | null;
};

export function RecommendationCard({
  recommendation,
  onCopyPrescription,
  isLoading,
  message,
}: RecommendationCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-black/4 bg-[#F5F5F7] p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-1/2 rounded bg-black/10" />
          <div className="h-16 rounded bg-black/8" />
          <div className="h-4 w-full rounded bg-black/8" />
          <div className="h-4 w-5/6 rounded bg-black/8" />
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 p-8 text-center text-[13px] text-black/45">
        Start typing a medication to see PGx-aware recommendations.
      </div>
    );
  }

  const severityStyles: Record<Recommendation["severity"], string> = {
    caution: "bg-[#FF3B30]/12 text-[#FF3B30]",
    adjust: "bg-[#FF9500]/12 text-[#FF9500]",
    safe: "bg-[#34C759]/12 text-[#34C759]",
  };

  return (
    <article className="rounded-xl border border-black/4 bg-[#F5F5F7] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="tracking-tightish text-[18px] font-semibold text-[#1D1D1F]">
          {recommendation.drug}
        </div>
        <span className="inline-flex rounded-full bg-[#007AFF]/10 px-2.5 py-1 text-[11.5px] font-semibold text-[#0a5ec7]">
          CPIC Level {recommendation.cpicLevel}
        </span>
      </div>

      <div className={`mt-4 rounded-xl border-l-4 p-4 ${severityStyles[recommendation.severity]}`}>
        <div className="text-[15px] font-semibold">
          {recommendation.headline ?? recommendation.recommendation ?? "Standard dosing appropriate"}
        </div>
        <p className="mt-1 text-[13.5px] leading-normal text-black/65">{recommendation.rationale}</p>
      </div>

      <div className="mt-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/45">Suggested alternatives</p>
        <ul className="mt-2 space-y-2">
          {recommendation.alternatives.map((option) => (
            <li key={option.drug} className="rounded-lg border border-black/5 bg-white p-3">
              <p className="text-[14px] font-semibold text-[#1D1D1F]">{option.drug}</p>
              <p className="text-[12.5px] text-black/65">{option.reason}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-black/45">
          Suggested prescription
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-[#1D1D1F] p-4 font-mono text-[12.5px] leading-[1.55] text-[#F5F5F7]">
          {recommendation.prescriptionText}
        </pre>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className="ring-focus rounded-full bg-[#007AFF] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0a84ff]"
          onClick={onCopyPrescription}
        >
          Copy prescription
        </button>
        <a
          href="https://cpicpgx.org/guidelines/"
          target="_blank"
          rel="noreferrer"
          className="ring-focus rounded-full border border-black/6 bg-white px-5 py-2.5 text-[14px] font-medium text-[#1D1D1F] transition-colors hover:bg-white/80"
        >
          View CPIC guideline
        </a>
      </div>
      {message ? <p className="mt-3 text-[12px] text-black/50">{message}</p> : null}
    </article>
  );
}
