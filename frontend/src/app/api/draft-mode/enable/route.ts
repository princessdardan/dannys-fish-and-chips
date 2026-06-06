import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { serverClient } from "@/sanity/server-client";

export const { GET } = defineEnableDraftMode({ client: serverClient });
