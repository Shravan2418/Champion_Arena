import { Trophy } from "lucide-react";
import "../../styles/branding.css";

export default function BrandLogo() {
  return (
    <div className="brand-logo">
      <div className="brand-logo-symbol">
        <svg
          className="brand-logo-mark"
          viewBox="0 0 84 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Champion Arena trophy"
        >
          <g fill="#FFC928" stroke="#FFD84F" strokeWidth="1.3">
            <path d="M23 63C9 55 5 40 10 25C13 16 18 9 25 5"
              fill="none" strokeWidth="2.5"/>
            <path d="M13 49C5 48 5 40 7 36C14 37 17 43 13 49Z"/>
            <path d="M12 35C5 32 6 25 9 21C16 24 17 30 12 35Z"/>
            <path d="M18 21C12 16 16 9 20 7C25 13 25 18 18 21Z"/>
            <path d="M22 59C15 60 12 54 13 49C21 49 25 54 22 59Z"/>
            <path d="M61 63C75 55 79 40 74 25C71 16 66 9 59 5"
              fill="none" strokeWidth="2.5"/>
            <path d="M71 49C79 48 79 40 77 36C70 37 67 43 71 49Z"/>
            <path d="M72 35C79 32 78 25 75 21C68 24 67 30 72 35Z"/>
            <path d="M66 21C72 16 68 9 64 7C59 13 59 18 66 21Z"/>
            <path d="M62 59C69 60 72 54 71 49C63 49 59 54 62 59Z"/>
          </g>

          <g fill="#FFC928" stroke="#E9A500" strokeWidth="1.5">
            <path d="M29 11H55V27C55 38 49 44 42 44C35 44 29 38 29 27V11Z"/>
            <path d="M29 17H21V24C21 33 27 37 34 36V31C30 30 28 26 29 22V17Z"/>
            <path d="M55 17H63V24C63 33 57 37 50 36V31C54 30 56 26 55 22V17Z"/>
            <path d="M38 44H46V53H38Z"/>
            <path d="M31 53H53V58H31Z"/>
            <path d="M27 59H57V63H27Z"/>
          </g>

          <path
            d="M42 16L44.5 22H51L45.8 26L47.8 32L42 28.3L36.2 32L38.2 26L33 22H39.5L42 16Z"
            fill="#FFF4B7"
          />
        </svg>
      </div>

      <div className="brand-logo-name">
        <span>Champion</span>
        <strong>Arena</strong>
      </div>
    </div>
  );
}
