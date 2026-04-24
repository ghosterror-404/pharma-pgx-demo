type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

export function HelixMark({ size = 18, color = "currentColor", className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 3c4 4 10 4 14 0" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 21c4-4 10-4 14 0" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 3c0 6 14 12 14 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 3c0 6-14 12-14 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 7h8M8 17h8M9.5 11h5M9.5 13h5" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function UploadCloud({ size = 28, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 16a4 4 0 1 1 .5-7.97A6 6 0 0 1 19 9.5a3.5 3.5 0 0 1-1 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v7M9 14.5l3-3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="1.6" />
      <path d="m20 20-3.6-3.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PaperPlane({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 3 11 14M21 3l-7 18-3-7-7-3 17-8Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function PrinterIcon({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 9V4h10v5M7 18H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="14" width="10" height="6" rx="1.2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
