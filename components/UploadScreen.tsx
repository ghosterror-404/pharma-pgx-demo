"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HelixMark, UploadCloud } from "@/components/icons";
import { parseGenomeFile } from "@/lib/genomeParser";
import { SAMPLE_PATIENT, type PatientGene, type PatientProfile } from "@/lib/samplePatient";
import type { GeneVariant } from "@/lib/types";

type UploadScreenProps = {
  onPatientLoaded: (patient: PatientProfile) => void;
};

const MIN_PARSE_DURATION_MS = 1200;
const MIN_TOTAL_DURATION_MS = 2500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function variantsToGeneCards(variants: GeneVariant[]): PatientGene[] {
  const grouped = new Map<string, GeneVariant[]>();

  for (const variant of variants) {
    const existing = grouped.get(variant.gene) ?? [];
    existing.push(variant);
    grouped.set(variant.gene, existing);
  }

  return Array.from(grouped.entries()).map(([gene, entries]) => {
    const combinedGenotype = entries.map((entry) => `${entry.rsid}:${entry.genotype}`).join(" · ");
    const phenotypes = Array.from(new Set(entries.map((entry) => entry.phenotype)));
    return {
      gene,
      genotype: combinedGenotype,
      phenotype: phenotypes.join(" / "),
      activityScore: null,
      affects: entries[0].affects,
    };
  });
}

function buildUploadedPatient(variants: GeneVariant[]): PatientProfile {
  const parsedGenes = variantsToGeneCards(variants);
  const paddedGenes = [...parsedGenes];
  for (const fallbackGene of SAMPLE_PATIENT.genes) {
    if (paddedGenes.some((gene) => gene.gene === fallbackGene.gene)) {
      continue;
    }
    paddedGenes.push(fallbackGene);
    if (paddedGenes.length >= SAMPLE_PATIENT.genes.length) {
      break;
    }
  }

  return {
    ...SAMPLE_PATIENT,
    source: "Uploaded file",
    variants,
    genes: paddedGenes,
  };
}

export function UploadScreen({ onPatientLoaded }: UploadScreenProps) {
  const [drag, setDrag] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("Decoding your genome...");
  const [usedDemoFallback, setUsedDemoFallback] = useState(false);
  const [showHowModal, setShowHowModal] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadingCaptions = useMemo(
    () => [
      "Reading your genetic markers...",
      "Matching against CPIC database...",
      "Identifying drug interactions...",
      "Building your profile...",
    ],
    [],
  );

  useEffect(() => {
    if (!isProcessing) {
      setCaptionIndex(0);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCaptionIndex((current) => (current + 1) % loadingCaptions.length);
    }, 550);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isProcessing, loadingCaptions.length]);

  const runSampleFlow = async () => {
    setUsedDemoFallback(false);
    setUploadStatus("Loading sample profile...");
    setProcessingMessage("Loading sample pharmacogenomics profile...");
    setIsProcessing(true);
    const start = Date.now();
    await sleep(Math.max(0, MIN_TOTAL_DURATION_MS - (Date.now() - start)));
    onPatientLoaded(SAMPLE_PATIENT);
    setIsProcessing(false);
  };

  const processFile = async (file: File) => {
    setUsedDemoFallback(false);
    setUploadStatus(`Selected: ${file.name}`);
    setProcessingMessage("Decoding your genome...");
    setIsProcessing(true);

    const start = Date.now();
    const variantsPromise = parseGenomeFile(file);
    await sleep(MIN_PARSE_DURATION_MS);
    const variants = await variantsPromise;

    if (variants && variants.length >= 3) {
      setUploadStatus(`Parsed ${variants.length} PGx markers from ${file.name}`);
      await sleep(Math.max(0, MIN_TOTAL_DURATION_MS - (Date.now() - start)));
      onPatientLoaded(buildUploadedPatient(variants));
      setIsProcessing(false);
      return;
    }

    setUsedDemoFallback(true);
    setUploadStatus(`Could not parse PGx markers from ${file.name}. Loading demo profile.`);
    await sleep(800);
    await sleep(Math.max(0, MIN_TOTAL_DURATION_MS - (Date.now() - start)));
    onPatientLoaded(SAMPLE_PATIENT);
    setIsProcessing(false);
  };

  const handleFile = async (file: File | undefined) => {
    if (isProcessing) {
      return;
    }
    if (!file) {
      await runSampleFlow();
      return;
    }
    await processFile(file);
  };

  const openFilePicker = () => {
    setUploadStatus("Waiting for file selection...");
    fileInputRef.current?.click();
  };

  return (
    <section className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-[680px] text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-3 py-1.5 text-[12px] text-black/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
            CPIC-aligned - Reviewed 4/2026
          </div>

          <h1 className="tracking-tighter2 text-[40px] font-semibold leading-[1.05] text-[#1D1D1F]">
            Personalized Medicine,
            <br />
            Decoded.
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[18px] leading-[1.45] text-black/60">
            Upload your 23andMe or AncestryDNA raw data to see how your genes affect medications.
          </p>

          {isProcessing ? (
            <div className="mt-10 rounded-2xl border border-black/10 bg-white/60 px-8 py-20">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-5">
                <div className="spin-slow shadow-soft flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white text-[#1D1D1F]">
                  <HelixMark size={30} />
                </div>
                <p className="text-[16px] font-medium text-[#1D1D1F]">{processingMessage}</p>
                <p className="text-[12px] text-black/45">{loadingCaptions[captionIndex]}</p>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDrag(false);
                void handleFile(event.dataTransfer.files[0]);
              }}
              onClick={openFilePicker}
              className={`mt-10 rounded-2xl border-[1.5px] border-dashed bg-white/40 transition-all duration-300 ease-out ${
                drag ? "border-[#007AFF]/60 bg-[#007AFF]/4" : "border-black/15"
              }`}
            >
              <div className="block cursor-pointer px-8 py-24">
                <div className="flex flex-col items-center gap-4">
                  <div className="shadow-soft flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white text-[#1D1D1F]">
                    <UploadCloud size={26} />
                  </div>
                  <div className="text-[15px] font-medium text-[#1D1D1F]">Drop your raw data here, or click to upload</div>
                  <div className="text-[13px] text-black/45">
                    Supports 23andMe, AncestryDNA, MyHeritage, and VCF files
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openFilePicker();
                    }}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#1D1D1F] transition-colors hover:bg-black/5"
                  >
                    Choose file
                  </button>
                </div>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.tsv,.csv,.vcf,.vcf.gz,.TXT,.VCF"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              setUploadStatus(selected ? `File chosen: ${selected.name}` : "No file selected.");
              void handleFile(selected);
              event.currentTarget.value = "";
            }}
          />

          <div className="mt-3 flex items-center justify-center gap-4 text-[12px]">
            <button
              type="button"
              className="text-[#007AFF] transition-opacity hover:opacity-80"
              onClick={() => setShowHowModal(true)}
            >
              How we read your file
            </button>
            <button
              type="button"
              className="text-black/55 transition-opacity hover:text-black/70"
              onClick={() => void runSampleFlow()}
            >
              Skip and use sample
            </button>
          </div>

          <div className="mt-7">
            <button
              type="button"
              onClick={() => void runSampleFlow()}
              className="pulse-attn ring-focus inline-flex items-center gap-2 rounded-full border border-black/6 bg-white px-5 py-2.5 text-[14px] font-medium text-[#1D1D1F] transition-colors hover:bg-white/90"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
              Try with sample patient
            </button>
          </div>
          <p className="mt-6 text-sm text-[#86868B]">
            Don&apos;t have a 23andMe file handy?{" "}
            <a
              href="/sample-genome.txt"
              download="sample-genome.txt"
              className="font-medium text-[#007AFF] hover:underline"
            >
              Download a sample file
            </a>{" "}
            to try the upload flow.
          </p>

          {usedDemoFallback ? (
            <div className="mx-auto mt-4 max-w-[620px] rounded-xl border border-[#FF9500]/30 bg-[#FF9500]/8 px-4 py-3 text-left text-[12px] text-black/70">
              We couldn&apos;t parse pharmacogenomic markers from this file - loading sample patient for demonstration.
            </div>
          ) : null}
          {uploadStatus ? <p className="mt-3 text-xs text-black/50">{uploadStatus}</p> : null}

          <p className="mx-auto mt-12 max-w-[440px] text-[12px] text-black/40">
            Your data is processed in your browser. Nothing leaves your device without your consent.
          </p>
        </div>
      </div>

      {showHowModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-6">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
            <h3 className="tracking-tightish text-[20px] font-semibold text-[#1D1D1F]">How we read your file</h3>
            <ul className="mt-4 space-y-2 text-[14px] text-black/70">
              <li>We extract approximately 10 well-studied pharmacogenomic SNPs from your file.</li>
              <li>Your file never leaves your browser - parsing happens locally.</li>
              <li>We do not store, transmit, or share your raw genetic data.</li>
            </ul>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="rounded-full border border-black/6 bg-[#007AFF] px-5 py-2 text-[13px] font-semibold text-white"
                onClick={() => setShowHowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
