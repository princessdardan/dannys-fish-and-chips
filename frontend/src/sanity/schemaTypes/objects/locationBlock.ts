import { defineArrayMember, defineField, defineType } from "sanity";

export const locationBlock = defineType({
  name: "locationBlock",
  title: "Location Block",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "subHeading",
      title: "Sub Heading",
      type: "string",
    }),
    defineField({
      name: "streetAddress",
      title: "Street Address",
      type: "string",
      description: "Street address (e.g., 123 Main Street)",
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      description: "City name",
    }),
    defineField({
      name: "postcode",
      title: "Postcode / ZIP",
      type: "string",
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      initialValue: "Canada",
    }),
    defineField({
      name: "phoneNumber",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Google Maps URL",
      type: "url",
      description: "Google Maps embed or share URL",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    // Legacy fields kept for backward compatibility during migration
    defineField({
      name: "address",
      title: "Legacy Address (deprecated)",
      type: "text",
      rows: 3,
      description: "Deprecated: use explicit streetAddress, city, postcode, country fields instead. Kept for migration fallback.",
      hidden: true,
    }),
    defineField({
      name: "phone",
      title: "Legacy Phone (deprecated)",
      type: "string",
      description: "Deprecated: use phoneNumber field instead. Kept for migration fallback.",
      hidden: true,
    }),
    defineField({
      name: "mapUrl",
      title: "Legacy Map URL (deprecated)",
      type: "url",
      description: "Deprecated: use googleMapsUrl field instead. Kept for migration fallback.",
      hidden: true,
    }),
    defineField({
      name: "latitude",
      title: "Latitude",
      description: "Map center latitude",
      type: "number",
    }),
    defineField({
      name: "longitude",
      title: "Longitude",
      description: "Map center longitude",
      type: "number",
    }),
    defineField({
      name: "parkingInfo",
      title: "Parking Info",
      description: "Parking availability and instructions",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "operatingHours",
      title: "Operating Hours",
      type: "array",
      of: [defineArrayMember({ type: "operatingHours" })],
    }),
  ],
});
