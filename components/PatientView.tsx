"use client";

import { HelixMark, PrinterIcon } from "@/components/icons";
import type { DrugAlert, PatientProfile } from "@/lib/samplePatient";

type PatientViewProps = {
  patient: PatientProfile;
};

function AlertList({
  title,
  tone,
  alerts,
  fallbackText,
}: {
  title: string;
  tone: "red" | "amber" | "green";
  alerts: DrugAlert[];
  fallbackText: string;
}) {
  const toneStyles: Record<typeof tone, { line: string; chip: string }> = {
    red: { line: "#FF3B30", chip: "bg-[#FF3B30]" },
    amber: { line: "#FF9500", chip: "bg-[#FF9500]" },
    green: { line: "#34C759", chip: "bg-[#34C759]" },
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-soft">
      <div className="h-[2px]" style={{ background: toneStyles[tone].line }} />
      <div className="flex items-center gap-2.5 px-6 pb-2 pt-5">
        <span className={`h-2 w-2 rounded-full ${toneStyles[tone].chip}`} />
        <h3 className="tracking-tightish text-[16px] font-semibold text-[#1D1D1F]">{title}</h3>
      </div>
      <ul>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <li key={alert.drug} className="drug-row flex items-start justify-between gap-6 border-t border-black/[0.05] px-6 py-4">
              <div className="min-w-0">
                <p className="tracking-tightish text-[15px] font-semibold text-[#1D1D1F]">
                  {alert.drug}
                  {alert.brand ? <span className="font-normal text-black/60"> ({alert.brand})</span> : null}
                </p>
                <p className="mt-1 text-[13.5px] leading-[1.5] text-black/65">{alert.reason}</p>
              </div>
              <button className="shrink-0 text-[13px] font-medium text-[#007AFF] transition-opacity hover:opacity-80">
                Why?
              </button>
            </li>
          ))
        ) : (
          <li className="border-t border-black/[0.05] px-6 py-5 text-[14px] text-black/60">
            {fallbackText}
          </li>
        )}
      </ul>
    </article>
  );
}

function WalletCard({ patient }: { patient: PatientProfile }) {
  return (
    <div
      className="wallet-tilt shadow-card relative w-full max-w-[420px] overflow-hidden rounded-2xl text-white"
      style={{
        aspectRatio: "1.6 / 1",
        background: "linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 60%, #5a5a5e 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(60% 100% at 0% 0%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(40% 80% at 100% 100%, rgba(0,122,255,0.35), transparent 70%)",
        }}
      />
      <div className="relative flex h-full flex-col p-5">
        <div className="flex items-center justify-between">
          <div className="caption text-white/60">PHARMA · PGX PROFILE</div>
          <HelixMark size={16} color="#fff" />
        </div>
        <div className="mt-3 text-[18px] font-semibold tracking-tightish">
          {patient.name.toUpperCase()}
        </div>
        <div className="mt-3 space-y-1.5 text-[11.5px] leading-tight text-white/85">
          <div className="flex items-center gap-2">
            <span className="text-[#FF9F0A]">⚠</span>
            <span>Poor metabolizer: CYP2C19, CYP2D6</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#FF453A]">⚠</span>
            <span>Avoid: Plavix, codeine at standard dose</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#30D158]">✓</span>
            <span>Tested: 30+ drug-gene interactions</span>
          </div>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className="font-mono text-[10.5px] tracking-[0.06em] text-white/55">
            pharma.health/{patient.name.toLowerCase().replace(" ", "-")}
          </div>
          <div className="rounded-md bg-white/10 p-2 text-[10px] text-white/80">QR</div>
        </div>
      </div>
    </div>
  );
}

export function PatientView({ patient }: PatientViewProps) {
  const safeAlerts = patient.drugAlerts.safe ?? [];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-12">
      <div className="caption">Based on your genome</div>
      <h2 className="tracking-tighter2 mt-2 text-[28px] font-semibold text-[#1D1D1F]">
        Your Metabolizer Profile
      </h2>
      <p className="mt-2 max-w-[640px] text-[15px] text-black/60">
        A snapshot of how your body activates and clears medications.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {patient.genes.slice(0, 4).map((gene) => {
          const isPoor = gene.phenotype.toLowerCase().includes("poor");
          return (
            <article key={gene.gene} className="gene-card flex flex-col rounded-2xl border border-black/[0.05] bg-white p-5 shadow-soft">
              <div>
                <div className="tracking-tightish text-[16px] font-semibold text-[#1D1D1F]">{gene.gene}</div>
                <div className="mt-0.5 text-[13px] text-black/45">{gene.genotype}</div>
              </div>
              <div className="mt-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${
                    isPoor ? "bg-[#FF3B30]/10 text-[#C2271F]" : "bg-[#34C759]/15 text-[#1F7A3A]"
                  }`}
                >
                  {gene.phenotype}
                </span>
              </div>
              <div className="mt-5 line-clamp-2 text-[12.5px] leading-[1.45] text-black/60">{gene.affects}</div>
            </article>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="tracking-tighter2 text-[28px] font-semibold text-[#1D1D1F]">
          Drugs to Discuss with Your Doctor
        </h2>
        <p className="mt-2 max-w-[640px] text-[15px] text-black/60">
          Based on your genetic profile, these medications may affect you differently than most people.
        </p>
        <div className="mt-6 space-y-4">
          <AlertList
            title="Use Caution"
            tone="red"
            alerts={patient.drugAlerts.caution}
            fallbackText="No major cautionary medications identified."
          />
          <AlertList
            title="May Need Adjustment"
            tone="amber"
            alerts={patient.drugAlerts.adjust}
            fallbackText="No dosage-adjustment medications identified."
          />
          <AlertList
            title="Likely Safe at Standard Doses"
            tone="green"
            alerts={safeAlerts}
            fallbackText="Most other medications are processed normally based on the genes tested."
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="tracking-tighter2 text-[28px] font-semibold text-[#1D1D1F]">Your PGx Wallet Card</h2>
        <p className="mt-2 max-w-[640px] text-[15px] text-black/60">
          Save this or print it to share with any new doctor or pharmacist.
        </p>
        <div className="mt-6 flex flex-col items-start gap-5">
          <WalletCard patient={patient} />
          <div className="flex items-center gap-3">
            <button className="ring-focus inline-flex items-center gap-2 rounded-full bg-[#007AFF] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0a84ff]">
              <PrinterIcon size={14} color="#fff" />
              Print Card
            </button>
            <button className="ring-focus inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-5 py-2.5 text-[14px] font-medium text-[#1D1D1F] transition-colors hover:bg-white/80">
              Add to Apple Wallet
            </button>
          </div>
        </div>
      </section>

      <div className="mt-16 flex items-center justify-between border-t border-black/[0.06] pt-8 text-[12px] text-black/45">
        <span>Sources: CPIC - FDA Table of Pharmacogenomic Biomarkers - PharmGKB</span>
        <span>Not a substitute for medical advice.</span>
      </div>
    </section>
  );
}
