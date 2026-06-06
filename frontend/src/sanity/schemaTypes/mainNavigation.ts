import { defineArrayMember, defineField, defineType } from "sanity";

export const mainNavigation = defineType({
  name: "mainNavigation",
  title: "Main Navigation",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Main Menu",
    }),
    defineField({
      name: "items",
      title: "Navigation Items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "string",
            }),
            defineField({
              name: "page",
              title: "Page",
              type: "reference",
              to: [{ type: "page" }],
            }),
            defineField({
              name: "isExternal",
              title: "External Link",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "children",
              title: "Dropdown Sections",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({
                      name: "sectionTitle",
                      title: "Section Title",
                      type: "string",
                    }),
                    defineField({
                      name: "links",
                      title: "Links",
                      type: "array",
                      of: [defineArrayMember({ type: "link" })],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});
