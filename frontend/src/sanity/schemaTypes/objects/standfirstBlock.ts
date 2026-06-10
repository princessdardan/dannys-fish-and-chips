import { defineField, defineType } from "sanity";

export const standfirstBlock = defineType({
  name: "standfirstBlock",
  title: "Standfirst Block",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "kicker",
      title: "Kicker",
      type: "string",
    }),
    defineField({
      name: "standfirst",
      title: "Standfirst",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "media",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "link",
    }),
    defineField({
      name: "mediaPosition",
      title: "Media Position",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "left",
    }),
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
      options: {
        list: [
          { title: "Featured", value: "featured" },
          { title: "Compact", value: "compact" },
        ],
      },
      initialValue: "featured",
    }),
  ],
});
