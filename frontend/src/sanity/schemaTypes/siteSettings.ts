import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Site Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    defineField({
      name: "header",
      title: "Header",
      type: "object",
      fields: [
        defineField({
          name: "logoText",
          title: "Logo Text",
          type: "link",
        }),
        defineField({
          name: "ctaButton",
          title: "CTA Buttons",
          type: "array",
          of: [defineArrayMember({ type: "link" })],
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({
          name: "logoText",
          title: "Logo Text",
          type: "link",
        }),
        defineField({
          name: "text",
          title: "Footer Text",
          type: "string",
        }),
        defineField({
          name: "socialLink",
          title: "Social Links",
          type: "array",
          of: [defineArrayMember({ type: "link" })],
        }),
        defineField({
          name: "contactEmail",
          title: "Contact Email",
          type: "string",
        }),
        defineField({
          name: "contactPhone",
          title: "Contact Phone",
          type: "string",
        }),
      ],
    }),
  ],
});
