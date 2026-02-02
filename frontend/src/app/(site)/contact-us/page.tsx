import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { ContactForm } from "@/components/custom/layout/contact-form";

export const revalidate = 1800;

/**
 * Contact Us page.
 *
 * Data flow: loads Strapi blocks and renders standard layout sections,
 * followed by a hardcoded contact form.
 */
export default async function ContactUsPage() {
  const contactUsData = await loaders.getContactUsData();
  const data = validateApiResponse(contactUsData, "contact us");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "contact-us" })}

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
