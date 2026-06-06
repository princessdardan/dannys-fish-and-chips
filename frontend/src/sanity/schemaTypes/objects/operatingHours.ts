import { defineField, defineType } from "sanity";

export const operatingHours = defineType({
  name: "operatingHours",
  title: "Operating Hours",
  type: "object",
  fields: [
    defineField({
      name: "day",
      title: "Day",
      type: "string",
      options: {
        list: [
          { title: "Monday", value: "Monday" },
          { title: "Tuesday", value: "Tuesday" },
          { title: "Wednesday", value: "Wednesday" },
          { title: "Thursday", value: "Thursday" },
          { title: "Friday", value: "Friday" },
          { title: "Saturday", value: "Saturday" },
          { title: "Sunday", value: "Sunday" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "open",
      title: "Open Time",
      type: "string",
      description: "e.g. 11:00 AM",
    }),
    defineField({
      name: "close",
      title: "Close Time",
      type: "string",
      description: "e.g. 9:00 PM",
    }),
    defineField({
      name: "isClosed",
      title: "Closed",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
