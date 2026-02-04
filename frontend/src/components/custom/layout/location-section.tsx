import { MapPin, Phone, Clock, Car, Navigation } from "lucide-react";

/**
 * Operating hours for a single day
 */
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

/**
 * Props for the LocationSection component
 */
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

/**
 * Formats time from 24h to 12h format
 */
function formatTime(time: string | null): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Returns the current day of the week
 */
function getCurrentDay(): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
}

/**
 * Determines if the restaurant is currently open
 */
function isCurrentlyOpen(hours: IOperatingHours[]): boolean {
  const currentDay = getCurrentDay();
  const todayHours = hours.find((h) => h.day === currentDay);

  if (!todayHours || todayHours.isClosed || !todayHours.openTime || !todayHours.closeTime) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openHours, openMinutes] = todayHours.openTime.split(":").map(Number);
  const [closeHours, closeMinutes] = todayHours.closeTime.split(":").map(Number);

  const openTime = openHours * 60 + openMinutes;
  const closeTime = closeHours * 60 + closeMinutes;

  return currentTime >= openTime && currentTime < closeTime;
}

/**
 * Operating hours display component
 */
function OperatingHoursCard({ hours }: { hours: IOperatingHours[] }) {
  const currentDay = getCurrentDay();
  const isOpen = isCurrentlyOpen(hours);

  // Sort hours by day of week starting from Monday
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const sortedHours = [...hours].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  return (
    <div className="bg-white rounded-lg border border-brand-red p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-red" />
          <h3 className="text-xl font-bold text-brand-black">Opening Hours</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOpen
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isOpen ? "Open Now" : "Closed"}
        </span>
      </div>
      <div className="space-y-2">
        {sortedHours.map((day) => (
          <div
            key={day.id}
            className={`flex justify-between py-2 border-b border-gray-100 last:border-0 ${
              day.day === currentDay ? "bg-brand-pink/30 -mx-2 px-2 rounded" : ""
            }`}
          >
            <span
              className={`font-medium ${
                day.day === currentDay ? "text-brand-red" : "text-brand-black"
              }`}
            >
              {day.day}
            </span>
            <span className="text-gray-600">
              {day.isClosed
                ? "Closed"
                : `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Address and contact card component with embedded map
 */
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

  // Ensure googleMapsUrl has protocol, or use fallback
  let mapsUrl = googleMapsUrl;
  if (mapsUrl && !mapsUrl.startsWith('http://') && !mapsUrl.startsWith('https://')) {
    mapsUrl = `https://${mapsUrl}`;
  }
  if (!mapsUrl) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  }

  // Using Google Maps Embed API (no API key required for basic embeds)
  const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2suk!4v1600000000000!5m2!1sen!2suk`;

  return (
    <div className="bg-white rounded-lg border border-brand-red p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-brand-red" />
        <h3 className="text-xl font-bold text-brand-black">Location</h3>
      </div>

      {/* Embedded Google Map */}
      <div className="w-full h-62.5 rounded-lg overflow-hidden border border-gray-200 mb-4">
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

      <address className="not-italic text-gray-700 mb-4">
        <p>{streetAddress}</p>
        <p>
          {city}, {postcode}
        </p>
        <p>{country}</p>
      </address>

      {/* Click-to-call phone */}
      <a
        href={`tel:${phoneNumber.replace(/\s/g, "")}`}
        className="flex items-center gap-2 text-brand-red hover:text-brand-black transition-colors mb-4"
      >
        <Phone className="w-4 h-4" />
        <span className="font-medium">{phoneNumber}</span>
      </a>

      {/* Parking info */}
      {parkingInfo && (
        <div className="flex items-start gap-2 text-gray-600 mb-4">
          <Car className="w-4 h-4 mt-1 shrink-0" />
          <p className="text-sm">{parkingInfo}</p>
        </div>
      )}

      {/* Get Directions button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg hover:bg-brand-black transition-colors font-medium"
      >
        <Navigation className="w-4 h-4" />
        Get Directions
      </a>
    </div>
  );
}

/**
 * Location Section component
 *
 * Displays restaurant location with:
 * - Google Maps embed
 * - Operating hours with open/closed status
 * - Address with click-to-call phone and directions
 */
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
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {heading && (
            <h2 className="text-4xl md:text-5xl font-bold text-heading-text mb-4">
              {heading}
            </h2>
          )}
          {subHeading && (
            <p className="text-brand-red font-serif text-lg italic">
              {subHeading}
            </p>
          )}
        </div>

        {/* Hours and Location (with embedded map) - Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hours */}
          <div>
            <OperatingHoursCard hours={operatingHours || []} />
          </div>

          {/* Location with embedded map */}
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
