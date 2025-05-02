"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import useLoginSession from "@/lib/useLoginSession";

const Footer: React.FC = () => {
  const { themeType } = useTheme();
  const session = useLoginSession();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="p-4 bg-[var(--hnf-background)] text-[var(--hnf-foreground)] flex flex-col items-center"
    >
      {/* Only show Tools and Job Coaches if the user is logged in */}
      {session && (
        <>
          <div className="w-full text-left mb-2">
            <h3 className="text-sm font-bold tracking-[0] text-[var(--hnf-heading)]">
              Tools
            </h3>
            <ul className="leading-[1.1] tracking-[0]">
              <li>
                <a
                  href="/Tools/timesheet-calculator"
                  className="text-sm text-[var(--hnf-muted)] hover:text-[var(--hnf-muted-hover)]"
                >
                  Timesheet Calculator
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full text-left mb-2">
            <h3 className="text-sm font-bold tracking-[0] text-[var(--hnf-heading)]">
              Job Coaches
            </h3>
            <ul className="leading-[1.1] tracking-[0]">
              <li>
                <a
                  href="/job-coaches"
                  className="text-sm text-[var(--hnf-muted)] hover:text-[var(--hnf-muted-hover)]"
                >
                  Find a Job Coach
                </a>
              </li>
            </ul>
          </div>
        </>
      )}

      <div className="mt-4 text-center text-xs text-[var(--hnf-muted)] tracking-[0] leading-[1.1]">
        © {currentYear} | desert area resource in training | All Rights Reserved | 
        <a href="/terms-of-service" className="underline">
          Terms of Service
        </a> | 
        <a href="/privacy-policy" className="underline">
          Privacy Policy
        </a> | Website by unenter
      </div>
    </footer>
  );
};

export default Footer;
