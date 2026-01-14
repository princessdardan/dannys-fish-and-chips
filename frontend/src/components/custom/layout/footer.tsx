import Link from "next/link";
import type { TFooter } from "@/types";
import { Logo } from "@/components/ui/logo";
import { SiFacebook, SiGoogle, SiInstagram, SiTripadvisor } from "@icons-pack/react-simple-icons";
import { MailingListSignup } from "@/components/custom/layout/mailing-list-signup";

function selectSocialIcon(url: string) {
  if (url.includes("instagram")) return <SiInstagram className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  if (url.includes("facebook")) return <SiFacebook className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  if (url.includes("tripadvisor")) return <SiTripadvisor className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  if (url.includes("google")) return <SiGoogle className="h-6 w-6 text-brand-yellow" aria-hidden="true" />;
  return null;
}

interface IFooterProps {
  data?: TFooter | null;
}

export function Footer({ data }: IFooterProps) {
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
      <div className="content-container md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="-my-12 hidden md:block">
          <Logo data={logoText} />
        </div>
        <p className="px-6 md:px-8 text-wrap italic mx-auto text-xs md:text-sm text-alt-background text-center md:text-left">
          {text}
        </p>
        <nav aria-label="Social media links">
          <div className="flex items-center space-x-4">
            {socialLink && Array.isArray(socialLink) && socialLink.length > 0 && socialLink.map((link) => {
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
      </div>
      <p className="text-alt-background font-sans text-xs md:text-sm text-center mt-4 md:mt-2">
            Designed by{" "}
            <Link
              href="https://dardandemiri.com"
              className="hover:text-brand-yellow transition-colors"
              target="_blank"
              rel="noopener noreferrer">
              Dardan Demiri
            </Link>
          </p>
    </footer>
  );
}
