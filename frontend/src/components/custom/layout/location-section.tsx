import { MapPin, Phone, Car, Navigation } from "lucide-react";
import { OperatingHoursCard } from "@/components/custom/layout/operating-hours-card";

export interface IOperatingHours {
  id: number;
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export interface ILocationSectionProps {
  id: number;
  documentId?: string;
  __component: "layout.location-section";
  heading: string;
  subHeading?: string;
  streetAddress: string;
  city: string;
  postcode: string;
  country: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  operatingHours: IOperatingHours[];
  parkingInfo?: string;
}

function AddressCard({
  streetAddress,
  city,
  postcode,
  country,
  phoneNumber,
  googleMapsUrl,
  parkingInfo,
  latitude,
  longitude,
}: {
  streetAddress: string;
  city: string;
  postcode: string;
  country: string;
  phoneNumber: string;
  googleMapsUrl?: string;
  parkingInfo?: string;
  latitude: number;
  longitude: number;
}) {
  const fullAddress = `${streetAddress}, ${city}, ${postcode}, ${country}`;

  let mapsUrl = googleMapsUrl;
  if (mapsUrl && !mapsUrl.startsWith('http://') && !mapsUrl.startsWith('https://')) {
    mapsUrl = `https://${mapsUrl}`;
  }
  if (!mapsUrl) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  }

  const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2suk!4v1600000000000!5m2!1sen!2suk`;

  return (
    <div className="bg-white border border-brand-black/30 border-t-4 border-t-brand-red p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-brand-red" />
        <h3 className="text-xl font-bold font-serif text-brand-black">Location</h3>
      </div>

      <div
        className="w-full h-48 md:h-64 overflow-hidden border border-brand-black/30 mb-4"
        role="img"
        aria-label={`Map showing the location of ${fullAddress}`}
      >
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing ${fullAddress}`}
        />
      </div>

      <address className="not-italic text-secondary-text mb-4">
        <p>{streetAddress}</p>
        <p>
          {city}, {postcode}
        </p>
        <p>{country}</p>
      </address>

      <a
        href={`tel:${phoneNumber.replace(/\s/g, "")}`}
        className="flex items-center gap-2 text-brand-red hover:text-brand-black transition-colors mb-4"
      >
        <Phone className="w-4 h-4" />
        <span className="font-medium">{phoneNumber}</span>
      </a>

      {parkingInfo && (
        <div className="flex items-start gap-2 text-secondary-text mb-4">
          <Car className="w-4 h-4 mt-1 shrink-0" />
          <p className="text-sm">{parkingInfo}</p>
        </div>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-brand-red text-white px-4 py-2 hover:bg-brand-black transition-colors font-medium"
      >
        <Navigation className="w-4 h-4" />
        Get Directions
      </a>
    </div>
  );
}

export function LocationSection({ data }: { data: ILocationSectionProps }) {
  if (!data) return null;

  const {
    heading,
    subHeading,
    streetAddress,
    city,
    postcode,
    country,
    phoneNumber,
    latitude,
    longitude,
    googleMapsUrl,
    operatingHours,
    parkingInfo,
  } = data;

  return (
    <section className="bg-background py-16">
      <div className="section-container-cream">
        <div className="text-center mb-12">
          {heading && (
            <h2 className="section-heading-red-center">
              {heading}
            </h2>
          )}
          {subHeading && (
            <p className="text-brand-red font-serif text-lg italic">
              {subHeading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <OperatingHoursCard hours={operatingHours || []} />
          </div>

          <div>
            <AddressCard
              streetAddress={streetAddress}
              city={city}
              postcode={postcode}
              country={country}
              phoneNumber={phoneNumber}
              googleMapsUrl={googleMapsUrl}
              parkingInfo={parkingInfo}
              latitude={latitude}
              longitude={longitude}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
