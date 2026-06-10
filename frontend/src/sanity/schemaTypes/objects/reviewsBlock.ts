import { defineField, defineType } from "sanity";

export const reviewsBlock = defineType({
  name: "reviewsBlock",
  title: "Reviews Block",
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
      name: "widgetType",
      title: "Widget Type",
      type: "string",
      options: {
        list: [
          { title: "Google", value: "google" },
          { title: "TripAdvisor", value: "tripadvisor" },
          { title: "Elfsight", value: "elfsight" },
          { title: "Custom", value: "custom" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "widgetEmbedCode",
      title: "Widget Embed Code",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "googlePlaceId",
      title: "Google Place ID",
      type: "string",
    }),
    defineField({
      name: "tripAdvisorUrl",
      title: "TripAdvisor URL",
      type: "url",
    }),
  ],
});
