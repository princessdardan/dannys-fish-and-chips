import { defineField, defineType } from "sanity";

export const infoWithMedia = defineType({
  name: "infoWithMedia",
  title: "Info With Media",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "portableText",
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "media",
    }),
  ],
});
