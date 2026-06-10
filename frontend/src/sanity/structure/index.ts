import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Singletons
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
      S.listItem()
        .title("Main Navigation")
        .id("mainNavigation")
        .child(
          S.document().schemaType("mainNavigation").documentId("mainNavigation")
        ),
      S.listItem()
        .title("Announcement Bar")
        .id("announcementBar")
        .child(
          S.document()
            .schemaType("announcementBar")
            .documentId("announcementBar")
        ),
      S.listItem()
        .title("Announcement Page")
        .id("announcementPage")
        .child(
          S.document()
            .schemaType("announcementPage")
            .documentId("announcementPage")
        ),
      S.divider(),
      // Document types
      S.documentTypeListItem("page"),
      S.documentTypeListItem("specialDeal"),
      S.divider(),
      // Remaining document types
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            "page",
            "specialDeal",
            "siteSettings",
            "mainNavigation",
            "announcementBar",
            "announcementPage",
          ].includes(listItem.getId() as string)
      ),
    ]);
