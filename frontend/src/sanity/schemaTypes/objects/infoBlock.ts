import { defineArrayMember, defineField, defineType } from "sanity";

export const infoBlock = defineType({
  name: "infoBlock",
  title: "Info Block",
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
      name: "description",
      title: "Description",
      type: "portableText",
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [defineArrayMember({ type: "infoWithMedia" })],
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "link",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Standard", value: "standard" },
          { title: "Newspaper", value: "newspaper" },
          { title: "Menu", value: "menu" },
        ],
      },
      initialValue: "standard",
    }),
  ],
});
