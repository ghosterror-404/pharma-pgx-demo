"use client";

import { PrescribingAssistant } from "@/components/PrescribingAssistant";
import type { PatientProfile } from "@/lib/samplePatient";

type DoctorViewProps = {
  patient: PatientProfile;
};

function PatientProfileCard({ patient }: { patient: PatientProfile }) {
  return (
    <article className="rounded-2xl border border-black/5 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <div className="tracking-tightish text-[20px] font-semibold text-[#1D1D1F]">{patient.name}</div>
          <div className="mt-0.5 text-[13px] text-black/60">
            {patient.age} yo · {patient.sex} · Tested {patient.testedDate}
          </div>
        </div>
        <span className="rounded-full bg-[#30B0C7]/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#1f7d8e]">
          PGx Active
        </span>
      </div>

      <div className="my-5 h-px bg-black/6" />
      <h3 className="tracking-tightish text-[15px] font-semibold text-[#1D1D1F]">PGx Profile</h3>

      <div className="mt-3">
        <div className="grid grid-cols-12 px-1 pb-2 text-[11px] font-semibold uppercase tracking-widest text-black/45">
          <div className="col-span-3">Gene</div>
          <div className="col-span-3">Genotype</div>
          <div className="col-span-4">Phenotype</div>
          <div className="col-span-2 text-right">Activity</div>
        </div>
        <div>
          {patient.genes.map((gene, index) => (
            <div
              key={gene.gene}
              className={`grid grid-cols-12 px-1 py-3 text-[14px] ${
                index !== 0 ? "border-t border-black/5" : ""
              }`}
            >
              <div className="col-span-3 font-semibold text-[#1D1D1F]">{gene.gene}</div>
              <div className="col-span-3 font-mono text-[13px] text-[#1D1D1F]">{gene.genotype}</div>
              <div className="col-span-4 text-black/65">{gene.phenotype}</div>
              <div className="col-span-2 text-right font-mono text-[#1D1D1F]">
                {gene.activityScore === null ? "—" : gene.activityScore}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 text-[11.5px] text-black/45">
        <span>Sources: CPIC · FDA · PharmGKB</span>
        <span>Last updated 4/24/2026</span>
      </div>
    </article>
  );
}

export function DoctorView({ patient }: DoctorViewProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="caption" style={{ color: "#30B0C7" }}>
            Clinical Mode
          </div>
          <h2 className="tracking-tighter2 mt-1 text-[26px] font-semibold text-[#1D1D1F]">
            Pharmacogenomic Decision Support
          </h2>
        </div>
        <div className="font-mono text-[12.5px] text-black/45">MRN 00428291 · Encounter 4/24/26</div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <PatientProfileCard patient={patient} />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <PrescribingAssistant patient={patient} />
        </div>
      </div>
    </section>
  );
}
