"use client";

import { useState } from "react";
import { DoctorView } from "@/components/DoctorView";
import { PatientView } from "@/components/PatientView";
import { TopBar } from "@/components/TopBar";
import { UploadScreen } from "@/components/UploadScreen";
import type { PatientProfile } from "@/lib/samplePatient";

type Phase = "upload" | "patient" | "doctor";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const currentView: "patient" | "doctor" = phase === "doctor" ? "doctor" : "patient";

  const loadPatient = (nextPatient: PatientProfile) => {
    setPatient(nextPatient);
    setPhase("patient");
  };

  const handleToggleView = (view: "patient" | "doctor") => {
    setPhase(view);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      {phase === "upload" ? <UploadScreen onPatientLoaded={loadPatient} /> : null}

      {patient ? (
        <div className="relative">
          <TopBar view={currentView} setView={handleToggleView} />
          <div
            className={`transition-opacity duration-300 ease-out ${
              phase === "patient" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <PatientView patient={patient} />
          </div>
          <div
            className={`transition-opacity duration-300 ease-out ${
              phase === "doctor" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <DoctorView patient={patient} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
