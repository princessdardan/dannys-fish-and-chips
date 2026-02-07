"use client";

import Link from "next/link";
import type { THeader, TAnnouncement } from "@/types";
import type { IMainMenuItems } from "@/app/(site)/main-menu";

import { Logo } from "@/components/ui/logo";
import { MainMenu } from "@/app/(site)/main-menu";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { HeaderWrapper } from "./header-wrapper";
import { AnnouncementBanner } from "./announcement-banner";

interface IHeaderProps {
  data?: THeader | null;
  menuItems?: IMainMenuItems[];
  announcement?: TAnnouncement | null;
}

function HeaderButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="sm"
        className="masthead-cta"
      >
        {label}
      </Button>
    </Link>
  );
}

function HeaderContent({ data, menuItems }: IHeaderProps) {
  if (!data) return null;

  const { logoText, ctaButton } = data;

  // Defensive guard: Check if ctaButton exists and has elements
  const primaryCta = ctaButton?.[0] || { href: "/contact-us", label: "Contact Us" };
  const hasValidButtons = ctaButton && Array.isArray(ctaButton) && ctaButton.length > 0;

  return (
    <>
      {/* Mobile header - newspaper style */}
      <div className="md:hidden w-full">
        {/* Top rule */}
        <div className="masthead-rule" />

        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile hamburger */}
          <MobileNavigation ctaButton={primaryCta} menuItems={menuItems} />

          {/* Centered site name */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif font-black text-base sm:text-lg text-brand-red tracking-tight whitespace-nowrap">
              Danny&apos;s Fish &amp; Chips
            </span>
          </Link>

          {/* Spacer for balance */}
          <div className="w-11" />
        </div>

        {/* Bottom rule */}
        <div className="masthead-rule" />
      </div>

      {/* Desktop masthead - newspaper style */}
      <div className="hidden md:flex flex-col w-full max-w-6xl mx-auto">
        {/* Top rule */}
        <div className="masthead-rule" />

        {/* Establishment info row */}
        <div className="flex justify-center items-center py-1.5 px-4">
          <span className="masthead-dateline">
            Est. 1975 • Barrie, Ontario
          </span>
        </div>

        {/* Thin rule */}
        <div className="masthead-rule-thin" />

        {/* Masthead */}
        <div className="text-center py-4 px-4">
          <Link href="/" className="inline-block group">
            <h1 className="masthead-title group-hover:text-brand-red transition-colors">
              Danny&apos;s Fish &amp; Chips
            </h1>
          </Link>
          <p className="masthead-tagline">
            A Barrie Tradition Since 1975
          </p>
        </div>

        {/* Double rule */}
        <div className="masthead-rule-double" />

        {/* Navigation row */}
        <nav
          className="flex items-center justify-center py-2 px-4 relative"
          aria-label="Main navigation"
        >
          <NavigationMenu>
            <NavigationMenuList className="gap-0">
              {menuItems && menuItems.length > 0 && (
                <MainMenu data={menuItems} />
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA button - positioned to the right */}
          {hasValidButtons && (
            <div className="absolute right-4">
              {ctaButton.slice(0, 1).map((button, index) => {
                if (!button?.href || !button?.label) return null;
                return (
                  <HeaderButton key={index} href={button.href} label={button.label} />
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom rule */}
        <div className="masthead-rule" />
      </div>

      {/* Hidden Logo for mobile navigation drawer compatibility */}
      <div className="hidden">
        <Logo data={logoText} />
      </div>
    </>
  );
}

/**
 * Site header with newspaper masthead styling.
 *
 * Design: Classic broadsheet newspaper aesthetic with centered masthead,
 * thin rule dividers, and editorial typography.
 *
 * Data flow: consumes global header data and main menu items from Strapi.
 * Layout: responsive navigation (mobile sheet + desktop menu).
 */
export function Header({ data, menuItems, announcement }: IHeaderProps) {
  return (
    <HeaderWrapper>
      <HeaderContent data={data} menuItems={menuItems} />
      <AnnouncementBanner data={announcement ?? null} />
    </HeaderWrapper>
  );
}
