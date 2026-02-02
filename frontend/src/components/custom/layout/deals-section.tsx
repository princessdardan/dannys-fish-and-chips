import { Tag, Check } from "lucide-react";
import Image from "next/image";
import type { IDealsSectionProps, TSpecialDeal } from "@/types";
import { getStrapiURL } from "@/lib/utils";

/**
 * Individual deal card component
 */
function DealCard({ deal }: { deal: TSpecialDeal }) {
  const { name, description, originalPrice, dealPrice, image, itemsIncluded } = deal;
  const savings = originalPrice - dealPrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);

  return (
    <div className="bg-white rounded-lg border border-brand-red shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Deal Image */}
      {image && (
        <div className="relative h-48 bg-gray-100">
          <Image
            src={getStrapiURL(image.url)}
            alt={image.alternativeText || name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Savings Badge */}
          <div className="absolute top-3 right-3 bg-brand-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
            Save {savingsPercent}%
          </div>
        </div>
      )}

      {/* Deal Content */}
      <div className="p-6">
        {/* Deal Name */}
        <h3 className="text-2xl font-bold text-brand-black mb-2">{name}</h3>

        {/* Deal Description */}
        <p className="text-gray-600 mb-4">{description}</p>

        {/* Items Included */}
        {itemsIncluded && itemsIncluded.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-brand-black mb-2 uppercase tracking-wide">
              Includes:
            </h4>
            <ul className="space-y-1">
              {itemsIncluded.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-gray-700">
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

        {/* Pricing */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500 line-through">
              ${originalPrice.toFixed(2)}
            </p>
            <p className="text-3xl font-bold text-brand-red">
              ${dealPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-700 font-semibold">
              Save ${savings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component when no deals are available
 */
function EmptyState() {
  return (
    <div className="text-center py-12">
      <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">No special deals available at the moment.</p>
      <p className="text-gray-500 text-sm mt-2">Check back soon for our latest offers!</p>
    </div>
  );
}

/**
 * Deals Section component
 *
 * Displays featured deals and combo packages in a responsive card grid:
 * - 1 column on mobile
 * - 2 columns on tablet
 * - 3 columns on desktop
 */
export function DealsSection({ data }: { data: IDealsSectionProps }) {
  if (!data) return null;

  const { heading, subHeading, description, deals } = data;
  const hasDeals = deals && deals.length > 0;

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {heading && (
            <h2 className="text-4xl md:text-5xl font-bold text-heading-text mb-4">
              {heading}
            </h2>
          )}
          {subHeading && (
            <p className="text-brand-red font-serif text-lg italic mb-2">
              {subHeading}
            </p>
          )}
          {description && (
            <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
          )}
        </div>

        {/* Deals Grid or Empty State */}
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
