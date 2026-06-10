import { loaders } from "@/data/loaders";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { ContactForm } from "@/components/custom/layout/contact-form";
import { draftMode } from "next/headers";

export const revalidate = 1800;

/**
 * Contact Us page.
 *
 * Data flow: loads CMS blocks and renders them above the hardcoded contact form.
 * If CMS data is missing, the contact form still renders (this page has a
 * hardcoded fallback so it never 404s).
 */
export default async function ContactUsPage() {
  const draft = await draftMode();
  const contactUsData = await loaders.getContactUsData(
    draft.isEnabled ? { draftMode: true } : undefined
  );

  const blocks =
    contactUsData?.success && contactUsData.data
      ? contactUsData.data.blocks
      : [];

  return (
    <main>
      {renderLayoutBlocks({ blocks, pageContext: "contact-us" })}

      <section className="bg-background">
        <div className="container mx-auto px-4">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
