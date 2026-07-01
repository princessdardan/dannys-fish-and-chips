import Link from "next/link";
import type { TFooter } from "@/types";
import type { IMainMenuItems, MenuLinkProps, DropdownMenuProps } from "@/app/(site)/main-menu";
import { Logo } from "@/components/ui/logo";
import { SiFacebook, SiGoogle, SiInstagram, SiTripadvisor } from "@icons-pack/react-simple-icons";
import { MailingListSignup } from "@/components/custom/layout/mailing-list-signup";
import { cn } from "@/lib/utils";

function selectSocialIcon(url: string) {
  if (url.includes("instagram")) return <SiInstagram className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  if (url.includes("facebook")) return <SiFacebook className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  if (url.includes("tripadvisor")) return <SiTripadvisor className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  if (url.includes("google")) return <SiGoogle className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  return null;
}

const POLICY_LINKS = [
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms & Conditions", href: "/terms-and-conditions" },
  { title: "Accessibility Statement", href: "/accessibility-statement" },
  { title: "Cookie Policy", href: "/cookie-policy" },
  { title: "FAQ", href: "/faq" },
] as const;

function isMenuLink(item: IMainMenuItems): item is MenuLinkProps {
  return item.__component === "menu.menu-link";
}

function isDropdown(item: IMainMenuItems): item is DropdownMenuProps {
  return item.__component === "menu.dropdown";
}

function SocialNav({ links }: { links?: TFooter["socialLink"] }) {
  if (!links || links.length === 0) return null;

  return (
    <nav aria-label="Social media links">
      <div className="flex items-center space-x-4">
        {links.map((link) => {
          // Defensive guard: ensure link has required properties
          if (!link?.href || !link?.label) return null;

          return (
            <Link
              className="text-primary-button-text hover:text-hover-primary-button transition-colors"
              href={link.href}
              key={link.id}
            >
              {selectSocialIcon(link.href)}
              <span className="sr-only">Visit us at {link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Vertical footer navigation populated from Sanity main menu items.
 *
 * Simple links render directly; dropdown items render their child section
 * links in a nested vertical list so every Sanity link stays accessible.
 */
function MainFooterNav({ items, className }: { items?: IMainMenuItems[] | null; className?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Footer navigation" className={className}>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => {
          if (isMenuLink(item)) {
            if (!item.url || !item.title) return null;
            return (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className="text-sm text-alt-background hover:text-brand-yellow transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            );
          }

          if (isDropdown(item)) {
            if (!item.sections || item.sections.length === 0) return null;
            return (
              <li key={item.id}>
                <span className="text-sm text-alt-background/70 block mb-1">
                  {item.title}
                </span>
                <ul className="flex flex-col gap-1 pl-3 border-l border-alt-background/20">
                  {item.sections.map((section) =>
                    section.links?.map((link) => {
                      if (!link.url || !link.title) return null;
                      return (
                        <li key={`${section.id}-${link.id}`}>
                          <Link
                            href={link.url}
                            className="text-sm text-alt-background hover:text-brand-yellow transition-colors"
                          >
                            {link.title}
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
              </li>
            );
          }

          return null;
        })}
      </ul>
    </nav>
  );
}

/**
 * Policy navigation for future generic pages.
 */
function PolicyFooterNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Policy links" className={className}>
      <ul className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
        {POLICY_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-xs text-alt-background hover:text-brand-yellow transition-colors"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface IFooterProps {
  data?: TFooter | null;
  menuItems?: IMainMenuItems[] | null;
}

/**
 * Site footer with mailing list signup, main menu navigation, social links,
 * policy links, and designer credit.
 *
 * Data flow: uses global footer data and the Sanity-populated main menu items.
 */
export function Footer({ data, menuItems }: IFooterProps) {
  if (!data) return null;
  const { logoText, socialLink, text } = data;
  return (
    <footer className="bg-brand-black text-white pt-10 pb-4 overflow-hidden" role="contentinfo">
      <div className="content-container px-6 mb-8">
        <MailingListSignup
          heading="Join Our Mailing List"
          description="Subscribe to receive updates about specials, events, and news."
          source="footer"
          className="text-center [&_h3]:text-brand-yellow [&_p]:text-alt-background [&_.form-input]:max-w-sm [&_.form-input]:mx-auto [&_button]:mx-auto"
        />
      </div>
      <div className="content-container md:px-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="-my-12 hidden md:block">
            <Logo data={logoText} />
          </div>
          <MainFooterNav items={menuItems} />
        </div>
        <p className={cn(
          "px-6 md:px-8 text-wrap italic text-xs md:text-sm text-alt-background text-center md:text-left",
          "max-w-md mx-auto md:mx-0"
        )}>
          {text}
        </p>
        <SocialNav links={socialLink} />
      </div>
      <div className="content-container md:px-6 mt-8 pt-4 border-t border-alt-background/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <PolicyFooterNav />
        <p className="text-alt-background font-sans text-xs md:text-sm text-center">
          Designed by{" "}
          <Link
            href="https://dardandemiri.com"
            className="hover:text-brand-yellow transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dardan Demiri
          </Link>
        </p>
      </div>
    </footer>
  );
}
