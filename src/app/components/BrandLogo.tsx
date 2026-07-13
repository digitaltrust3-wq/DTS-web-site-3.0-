import { useId, type SVGProps } from "react";

type BrandLogoProps = SVGProps<SVGSVGElement> & {
  variant?: "horizontal" | "mark";
  showBackground?: boolean;
};

export function BrandLogo({
  variant = "horizontal",
  showBackground = true,
  className,
  ...props
}: BrandLogoProps) {
  const titleId = useId();
  const descriptionId = useId();
  const separatorGradientId = useId().replace(/:/g, "");
  const isMark = variant === "mark";

  return (
    <svg
      viewBox={isMark ? "55 20 270 275" : "0 0 900 300"}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      className={className}
      {...props}
    >
      <title id={titleId}>DT Solutions</title>
      <desc id={descriptionId}>
        Logo de DT Solutions con un escudo tecnológico.
      </desc>

      {showBackground && (
        <rect width="900" height="300" rx="12" fill="#050608" />
      )}

      <g id="digital-trust-shield">
        <path
          d="M190 38 305 82v88c0 55-50 88-115 112C125 258 75 225 75 170V82l115-44Z"
          fill="none"
          stroke="#fff"
          strokeWidth="12"
          strokeLinejoin="round"
        />

        <path
          d="M145 95h45c52 0 77 31 77 70 0 40-26 67-75 67h-47v-58"
          fill="none"
          stroke="#fff"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M164 119h27c30 0 48 18 48 45 0 26-18 43-48 43h-27v-33"
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M164 119v46h41"
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M111 110v32h24M107 188h23v27h18M181 232v18M253 187h24"
          fill="none"
          stroke="#fff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="111" cy="101" r="8" fill="#050608" stroke="#fff" strokeWidth="5" />
        <circle cx="135" cy="142" r="7" fill="#fff" />
        <circle cx="98" cy="188" r="8" fill="#050608" stroke="#fff" strokeWidth="5" />
        <circle cx="148" cy="215" r="7" fill="#fff" />
        <circle cx="181" cy="258" r="8" fill="#050608" stroke="#fff" strokeWidth="5" />
        <circle cx="283" cy="187" r="8" fill="#050608" stroke="#fff" strokeWidth="5" />
      </g>

      {!isMark && (
        <g id="digital-trust-wordmark" fill="#fff">
          <text
            x="360"
            y="185"
            fontFamily="Arial, 'Helvetica Neue', sans-serif"
            fontSize="118"
            fontWeight="700"
            letterSpacing="8"
          >
            DT
          </text>

          <defs>
            <linearGradient id={separatorGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop offset="20%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x="360" y="205" width="470" height="3" fill={`url(#${separatorGradientId})`} />
          <text
            x="420"
            y="255"
            fontFamily="Arial, sans-serif"
            fontSize="31"
            fontWeight="400"
            letterSpacing="11"
          >
            SOLUTIONS
          </text>
        </g>
      )}
    </svg>
  );
}
