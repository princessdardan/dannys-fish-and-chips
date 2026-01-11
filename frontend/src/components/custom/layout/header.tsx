"use client";

import Link from "next/link";
import type { THeader } from "@/types";
import type { IMainMenuItems } from "@/app/(site)/main-menu";

import { Logo } from "@/components/ui/logo";
import { MainMenu } from "@/app/(site)/main-menu";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { HeaderWrapper } from "./header-wrapper";


interface IHeaderProps {
  data?: THeader | null;
  menuItems?: IMainMenuItems[];
}

function HeaderButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <Button className="font-sans font-light text-2xl text-md italic px-4 py-3 bg-brand-red text-white hover:bg-brand-red/90">
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
      <div className="w-full flex items-center justify-center overflow-hidden">
        {/* Mobile hamburger - absolute positioned */}
        <div className="absolute left-4 md:hidden">
          <MobileNavigation ctaButton={primaryCta} menuItems={menuItems} />
        </div>

        {/* Logo - centered on mobile, part of flex layout on md+ */}
        <div className="md:shrink-0 -my-10">
          <Logo data={logoText} />
        </div>

        {/* Desktop navigation - hidden on mobile, centered with flex-grow on md+ */}
        <nav className="hidden md:flex grow items-center justify-center px-4" aria-label="Main navigation">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems && menuItems.length > 0 && (
                <MainMenu data={menuItems} />
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Desktop CTA buttons - part of flex layout on md+ */}
        {hasValidButtons && (
          <div className="hidden md:flex shrink-0 gap-2">
            {ctaButton.map((button, index) => {
              // Additional safety: verify each button has required properties
              if (!button?.href || !button?.label) return null;
              return (
                <HeaderButton key={index} href={button.href} label={button.label} />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export function Header({ data, menuItems }: IHeaderProps) {
  return (
    <HeaderWrapper>
      <HeaderContent data={data} menuItems={menuItems} />
    </HeaderWrapper>
  );
}