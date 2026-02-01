"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHeaderContext } from "../custom/layout/header-wrapper";

/**
 * Inline SVG wrapper for the Danny's logo asset.
 */
export function DannysLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 528 528"
      preserveAspectRatio="xMidYMid meet"
      fill="currentColor"
    >
      <image 
        href="/dannys-logo.svg" 
        height="528" 
        width="528"
      />
    </svg>
  );
}

interface ILogoProps {
  label: string;
  dark?: boolean;
}

/**
 * Logo link that adapts color based on header activity.
 *
 * Data flow: reads `useHeaderContext` to switch between brand colors.
 */
export function Logo({ data }: { data: ILogoProps }) {
  const { isActive } = useHeaderContext();
  
  return (
    <Link className="flex items-center gap-2" href="/">
      <DannysLogo className={cn("h-48 w-auto transition-colors duration-300", isActive ? "text-brand-red" : "text-brand-yellow")} />
      <span className="sr-only">{data?.label || "Danny's Fish and Chips - Homepage"}</span>
      <span
        className={`${"text-lg font-medium"} ${
          data?.dark ? "text-white" : "text-slate-900"
        }`}
      > 
      </span>
    </Link>
  );
}