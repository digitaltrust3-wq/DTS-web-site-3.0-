import { useId, type SVGProps } from "react";

type BrandLogoProps = SVGProps<SVGSVGElement> & {
  variant?: "horizontal" | "mark";
  tone?: "light" | "dark";
};

export function BrandLogo({
  variant = "horizontal",
  tone = "light",
  className,
  ...props
}: BrandLogoProps) {
  const titleId = useId();
  const isMark = variant === "mark";
  const ink = tone === "light" ? "#F8FAFC" : "#0F1720";
  const muted = tone === "light" ? "#94A3B8" : "#43576B";
  const shield = "#131D28";
  const accent = "#6F8498";
  const accentHighlight = "#BAC6D2";

  return (
    <svg
      viewBox={isMark ? "0 0 160 176" : "0 0 520 176"}
      role="img"
      aria-labelledby={titleId}
      className={className}
      {...props}
    >
      <title id={titleId}>Digital Trust Solutions</title>

      <g id="digital-trust-mark">
        <path
          d="M80 6 148 34v49c0 43-25 72-68 87C37 155 12 126 12 83V34L80 6Z"
          fill={shield}
          stroke={accent}
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M80 18 137 42v41c0 35-19 59-57 74-38-15-57-39-57-74V42L80 18Z"
          fill="none"
          stroke={ink}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M58 52h27c28 0 45 17 45 44s-17 44-45 44H61v-35h18v18h7c16 0 25-10 25-27s-9-27-25-27H76v25H58V52Z"
          fill="none"
          stroke={accentHighlight}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M58 60H43V48" fill="none" stroke={accentHighlight} strokeWidth="6" strokeLinecap="round" />
        <path d="M61 116H39" fill="none" stroke={accentHighlight} strokeWidth="6" strokeLinecap="round" />
        <path d="M72 139v10" fill="none" stroke={accentHighlight} strokeWidth="6" strokeLinecap="round" />
        <circle cx="43" cy="42" r="7" fill={shield} stroke={accentHighlight} strokeWidth="5" />
        <circle cx="33" cy="116" r="7" fill={shield} stroke={accentHighlight} strokeWidth="5" />
        <circle cx="72" cy="151" r="7" fill={shield} stroke={accentHighlight} strokeWidth="5" />
        <circle cx="88" cy="116" r="7" fill={shield} stroke={accentHighlight} strokeWidth="5" />
      </g>

      {!isMark && (
        <g id="digital-trust-wordmark">
          <text
            x="182"
            y="78"
            fill={ink}
            fontFamily="Inter, Arial, sans-serif"
            fontSize="48"
            fontWeight="800"
            letterSpacing="2"
          >
            DIGITAL
          </text>
          <text
            x="182"
            y="126"
            fill={ink}
            fontFamily="Inter, Arial, sans-serif"
            fontSize="48"
            fontWeight="800"
            letterSpacing="2"
          >
            TRUST
          </text>
          <path d="M184 140H508" stroke={accent} strokeWidth="3" />
          <text
            x="184"
            y="163"
            fill={muted}
            fontFamily="Inter, Arial, sans-serif"
            fontSize="16"
            fontWeight="600"
            letterSpacing="9"
          >
            SOLUTIONS
          </text>
        </g>
      )}
    </svg>
  );
}
