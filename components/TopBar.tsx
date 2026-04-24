"use client";

import { HelixMark, PaperPlane, PrinterIcon } from "@/components/icons";

type TopBarProps = {
  view: "patient" | "doctor";
  setView: (view: "patient" | "doctor") => void;
};

export function TopBar({ view, setView }: TopBarProps) {
  const isPatient = view === "patient";

  return (
    <div className="sticky top-0 z-30">
      <div
        className="top-clinical-line h-[2px] w-full transition-opacity duration-300 ease-out"
        style={{ opacity: isPatient ? 0 : 1 }}
      />
      <div className="frost border-b border-black/[0.06]">
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D1D1F] text-white">
              <HelixMark size={15} color="#fff" />
            </div>
            <span className="tracking-tightish text-[15px] font-semibold text-[#1D1D1F]">Pharma</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="frost flex items-center rounded-full border border-black/[0.06] p-[3px]">
              <button
                onClick={() => setView("patient")}
                className={`pill-toggle rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                  isPatient ? "bg-[#007AFF] text-white shadow-sm" : "text-black/60 hover:text-black"
                }`}
                type="button"
              >
                Patient View
              </button>
              <button
                onClick={() => setView("doctor")}
                className={`pill-toggle rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                  !isPatient ? "bg-[#1D1D1F] text-white shadow-sm" : "text-black/60 hover:text-black"
                }`}
                type="button"
              >
                Doctor View
              </button>
            </div>

            <button
              className="ring-focus frost flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] text-black/60 transition-colors hover:text-black"
              aria-label="Share"
              type="button"
            >
              <PaperPlane size={15} />
            </button>
            <button
              className="ring-focus frost flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] text-black/60 transition-colors hover:text-black"
              aria-label="Print"
              type="button"
            >
              <PrinterIcon size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
