import { Tag, Check } from "lucide-react";
import type { IDealsSectionProps, TSpecialDeal } from "@/types";
import { StrapiImage } from "@/components/ui/strapi-image";

function DealCard({ deal }: { deal: TSpecialDeal }) {
  const { name, description, originalPrice, dealPrice, image, itemsIncluded } = deal;
  const savings = originalPrice - dealPrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);

  return (
    <div className="bg-background border-t-4 border-b border-x border-brand-black/30 border-t-brand-red overflow-hidden">
      {image && (
        <div className="relative h-48 bg-background">
          <StrapiImage
            src={image.url}
            alt={image.alternativeText || name}
            fill
            className="object-cover grayscale-30 contrast-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-0 right-0 bg-brand-red text-white px-4 py-1.5 text-xs font-serif font-bold uppercase tracking-wider">
            Save {savingsPercent}%
          </div>
        </div>
      )}
      <div className="p-6">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-black mb-2 tracking-tight">
          {name}
        </h3>
        <p className="text-secondary-text font-serif text-sm leading-relaxed mb-4">{description}</p>
        {itemsIncluded && itemsIncluded.length > 0 && (
          <div className="mb-4 border-t border-brand-black/10 pt-3">
            <h4 className="text-xs font-serif font-semibold text-brand-black mb-2 uppercase tracking-widest">
              Includes:
            </h4>
            <ul className="space-y-1">
              {itemsIncluded.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-secondary-text font-serif text-sm">
                  <Check className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                  <span>
                    {item.quantity !== "1" && (
                      <span className="font-medium">{item.quantity}x </span>
                    )}
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-end justify-between pt-4 border-t-2 border-double border-brand-black/20">
          <div>
            <p className="text-sm text-secondary-text line-through font-serif">
              ${originalPrice.toFixed(2)}
            </p>
            <p className="text-3xl font-bold text-brand-red font-serif tracking-tight">
              ${dealPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-brand-red font-serif font-semibold italic">
              Save ${savings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Tag className="w-12 h-12 text-secondary-text mx-auto mb-4" />
      <p className="text-secondary-text text-lg font-serif">
        No special deals available at the moment.
      </p>
      <p className="text-secondary-text text-sm font-serif italic mt-2">
        Check back soon for our latest offers!
      </p>
    </div>
  );
}

export function DealsSection({ data }: { data: IDealsSectionProps }) {
  if (!data) return null;
  const { heading, subHeading, description, deals } = data;
  const hasDeals = deals && deals.length > 0;

  return (
    <section className="bg-background py-16">
      <div className="section-container-cream">
        <div className="text-center mb-12">
          {heading && <h2 className="section-heading-red-center">{heading}</h2>}
          {subHeading && (
            <p className="text-brand-red font-serif text-lg italic mb-2">{subHeading}</p>
          )}
          {description && (
            <p className="text-secondary-text max-w-2xl mx-auto font-serif">{description}</p>
          )}
        </div>
        {hasDeals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
