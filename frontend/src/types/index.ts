import { IMainMenuItems } from "@/app/(site)/main-menu";
import { IHeroSectionProps } from "@/components/custom/layout/hero-section";
import { IInfoSectionProps } from "@/components/custom/layout/info-section";

export type { IHeroSectionProps, IInfoSectionProps };


// Strapi Block Rich Text Types
export type BlocksContent = Array<
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | ImageBlock
  | VideoBlock
  | LinkBlock
>;

export interface ParagraphBlock {
  type: "paragraph";
  children: InlineNode[];
}

export interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

export interface ListBlock {
  type: "list";
  format: "ordered" | "unordered";
  children: ListItemBlock[];
}

export interface ListItemBlock {
  type: "list-item";
  children: InlineNode[];
}

export interface QuoteBlock {
  type: "quote";
  children: InlineNode[];
}

export interface CodeBlock {
  type: "code";
  children: InlineNode[];
}

export interface ImageBlock {
  type: "image";
  image: {
    name: string;
    alternativeText?: string | null;
    url: string;
    caption?: string | null;
    width: number;
    height: number;
    formats?: Record<string, unknown>;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    previewUrl?: string | null;
    provider: string;
    provider_metadata?: unknown;
    createdAt: string;
    updatedAt: string;
  };
  children: [{ type: "text"; text: "" }];
}

export interface VideoBlock {
  type: "video";
  video: {
    name: string;
    alternativeText?: string | null;
    url: string;
    caption?: string | null;
    width: number;
    height: number;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    previewUrl?: string | null;
    provider: string;
    provider_metadata?: unknown;
    createdAt: string;
    updatedAt: string;
  };
  children: [{ type: "text"; text: "" }];
}

export interface LinkBlock {
  type: "link";
  url: string;
  children: InlineNode[];
}

export type InlineNode = TextNode | LinkInline;

export interface TextNode {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface LinkInline {
  type: "link";
  url: string;
  children: TextNode[];
}

export interface BaseParams {
  [key: string]: string | string[] | undefined;
}

export interface RouteParams extends BaseParams {
  documentId?: string;
}

export type Params = Promise<RouteParams>;
export type SearchParams = Promise<BaseParams>;

export type TMenuLink = {
  id: number;
  title: string;
  url: string;
}

export type TLink = {
  id: number;
  href: string;
  label: string;
  isExternal?: boolean;
};

export type TImage = {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption?: string | null;
  mime?: string;
};

export type TVideo = {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption?: string | null;
  mime?: string;
};

export type TMedia = TImage | TVideo;

export type TMainMenu = {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  MainMenuItems: IMainMenuItems[];
};

export type THomePage = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: (IHeroSectionProps | IInfoSectionProps)[];
};

export type THeader = {
  logoText: TLink;
  ctaButton: TLink[];
};

export type TFooter = {
  logoText: TLink;
  text: string;
  socialLink: TLink[];
};

export type TGlobal = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  header: THeader;
  footer: TFooter;
};

export type TMetaData = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export type TAuthUser = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  credits?: number;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export type TAboutUs = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: TAboutUsPageBlocks[];
};

export type TAboutUsPageBlocks = IHeroSectionProps | IInfoSectionProps;

export type TContactUs = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: TContactUsPageBlocks[];
};

export type TContactUsPageBlocks = IHeroSectionProps | IInfoSectionProps;

export type TFoodAndDrinkMenu = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: TFoodAndDrinkMenuBlocks[];
};

export type TFoodAndDrinkMenuBlocks = IHeroSectionProps | IInfoSectionProps;

export type TGallery = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: TGalleryPageBlocks[];
};

export type TGalleryPageBlocks = IHeroSectionProps | IGallerySectionProps;

export type TGalleryBlocks = IGallerySectionProps;

export type THoursAndLocation = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: THoursAndLocationPageBlocks[];
};

export type THoursAndLocationPageBlocks = IHeroSectionProps | IInfoSectionProps;

export type TSpecial = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: TSpecialBlocks[];
};

export type TSpecialBlocks = IHeroSectionProps | IInfoSectionProps;

export type TSpecialPageBlocks = TSpecialBlocks;

export interface IGallerySectionProps {
  __component: "layout.gallery-section";
  id: number;
  heading: string;
  subHeading: string;
  description: string;
  images: TImage[];
}

// Union type for all layout blocks
export type LayoutBlock =
  | IHeroSectionProps
  | IInfoSectionProps
  | IGallerySectionProps;

export type TStrapiResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    status: number;
    name: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  status: number;
};