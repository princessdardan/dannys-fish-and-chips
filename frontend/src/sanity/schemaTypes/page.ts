import { defineArrayMember, defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    defineField({
      name: "blocks",
      title: "Blocks",
      type: "array",
      of: [
        defineArrayMember({ type: "heroBlock" }),
        defineArrayMember({ type: "infoBlock" }),
        defineArrayMember({ type: "galleryBlock" }),
        defineArrayMember({ type: "locationBlock" }),
        defineArrayMember({ type: "dealsBlock" }),
        defineArrayMember({ type: "reviewsBlock" }),
        defineArrayMember({ type: "standfirstBlock" }),
      ],
    }),
  ],
});
