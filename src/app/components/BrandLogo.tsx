import { useId, type SVGProps } from "react";
import { useLanguage } from "../i18n/LanguageContext";

type BrandLogoProps = SVGProps<SVGSVGElement> & {
  variant?: "horizontal" | "mark";
  showBackground?: boolean;
};

export function BrandLogo({
  variant = "horizontal",
  showBackground = false,
  className,
  ...props
}: BrandLogoProps) {
  const titleId = useId();
  const descriptionId = useId();
  const silverGradientId = useId().replace(/:/g, "");
  const separatorGradientId = useId().replace(/:/g, "");
  const isMark = variant === "mark";
  const silverPaint = `url(#${silverGradientId})`;
  const { language } = useLanguage();

  return (
    <svg
      viewBox={isMark ? "55 20 270 275" : "0 0 900 300"}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      className={className}
      {...props}
    >
      <title id={titleId}>Digital Trust Solutions</title>
      <desc id={descriptionId}>
        {language === "es"
          ? "Logo de Digital Trust Solutions con un escudo tecnológico."
          : "Digital Trust Solutions logo with a technology shield."}
      </desc>

      <defs>
        <linearGradient id={silverGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#66707C" />
          <stop offset="24%" stopColor="#F8FAFC" />
          <stop offset="48%" stopColor="#A7B0BB" />
          <stop offset="72%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7C8794" />
        </linearGradient>
        <linearGradient id={separatorGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A7B0BB" stopOpacity="0" />
          <stop offset="20%" stopColor="#F8FAFC" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#A7B0BB" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#A7B0BB" stopOpacity="0" />
        </linearGradient>
      </defs>

      {showBackground && <rect width="900" height="300" rx="12" fill="#050608" />}

      <g id="digital-trust-shield" fill="none" stroke={silverPaint} strokeLinejoin="round">
        <path d="M190 38 305 82v88c0 55-50 88-115 112C125 258 75 225 75 170V82l115-44Z" strokeWidth="12" />
        <path d="M145 95h45c52 0 77 31 77 70 0 40-26 67-75 67h-47v-58" strokeWidth="11" strokeLinecap="round" />
        <path d="M164 119h27c30 0 48 18 48 45 0 26-18 43-48 43h-27v-33" strokeWidth="8" strokeLinecap="round" />
        <path d="M164 119v46h41" strokeWidth="8" strokeLinecap="round" />
        <path d="M111 110v32h24M107 188h23v27h18M181 232v18M253 187h24" strokeWidth="6" strokeLinecap="round" />
      </g>

      <g stroke={silverPaint} strokeWidth="5">
        <circle cx="111" cy="101" r="8" fill="#050608" />
        <circle cx="98" cy="188" r="8" fill="#050608" />
        <circle cx="181" cy="258" r="8" fill="#050608" />
        <circle cx="283" cy="187" r="8" fill="#050608" />
      </g>
      <circle cx="135" cy="142" r="7" fill={silverPaint} />
      <circle cx="148" cy="215" r="7" fill={silverPaint} />

      {!isMark && (
        <g id="digital-trust-wordmark" fill={silverPaint}>
          <text
            x="360"
            y="150"
            fontFamily="Arial, 'Helvetica Neue', sans-serif"
            fontSize="59"
            fontWeight="700"
            letterSpacing="2"
          >
            DIGITAL TRUST
          </text>
          <rect x="360" y="180" width="470" height="3" fill={`url(#${separatorGradientId})`} />
          <text
            x="405"
            y="252"
            fontFamily="Arial, sans-serif"
            fontSize="36"
            fontWeight="400"
            letterSpacing="10"
          >
            SOLUTIONS
          </text>
        </g>
      )}
    </svg>
  );
}
