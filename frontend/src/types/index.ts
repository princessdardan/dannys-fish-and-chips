import { IMainMenuItems } from "@/app/(site)/main-menu";
import { IHeroSectionProps } from "@/components/custom/layout/hero-section";
import { IInfoSectionProps } from "@/components/custom/layout/info-section";
import { ILocationSectionProps, IOperatingHours } from "@/components/custom/layout/location-section";

export type { IHeroSectionProps, IInfoSectionProps, ILocationSectionProps, IOperatingHours };


// Block Rich Text Types
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
  blocks: LayoutBlock[];
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
  blocks: LayoutBlock[];
};

export type TContactUs = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
};

export type TFoodAndDrinkMenu = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
};

export type TGallery = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
};

export type TGalleryBlocks = IGallerySectionProps;

export type THoursAndLocation = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
};

export type TSpecial = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
};

export type TGenericPage = {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
};

export interface IDealItem {
  id: number;
  name: string;
  quantity: string;
}

export type TSpecialDeal = {
  id: number;
  documentId: string;
  name: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  image: TImage | null;
  itemsIncluded: IDealItem[];
  isActive: boolean;
  sortOrder: number;
};

export interface IDealsSectionProps {
  __component: "layout.deals-section";
  id: number;
  documentId?: string;
  heading: string;
  subHeading?: string;
  description?: string;
  deals?: TSpecialDeal[];
}

export type TSpecialBlocks = IHeroSectionProps | IInfoSectionProps | IDealsSectionProps;

export type TSpecialPageBlocks = TSpecialBlocks;

export interface IGallerySectionProps {
  __component: "layout.gallery-section";
  id: number;
  documentId?: string;
  heading: string;
  subHeading: string;
  description: string;
  images: TImage[];
}

// Union type for all layout blocks
export type LayoutBlock =
  | IHeroSectionProps
  | IInfoSectionProps
  | IGallerySectionProps
  | ILocationSectionProps
  | IDealsSectionProps
  | IReviewsSectionProps
  | IStandfirstSectionProps;

export type TApiResponse<T = null> = {
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

// Email Subscriber types
export type TEmailSubscriber = {
  id: number;
  documentId: string;
  email: string;
  subscribedAt: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
};

export type TEmailSubscriberPayload = {
  data: {
    email: string;
    subscribedAt?: string;
    source?: string;
  };
};

export type TMailingListFormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

// Contact Submission types
export type TContactSubmission = {
  id: number;
  documentId: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  submittedAt: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
};

export type TContactSubmissionPayload = {
  data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    submittedAt?: string;
    source?: string;
  };
};

export type TContactFormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

// Announcement Banner types
export type TAnnouncementPage = {
  documentId: string;
  title: string;
  description: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  showOnHomepage: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
};

export type TAnnouncement = {
  id: number;
  documentId: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  isDismissible: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

// Reviews Section types
export interface IReviewsSectionProps {
  id: number;
  documentId?: string;
  __component: "layout.reviews-section";
  heading: string;
  subHeading?: string;
  widgetType: "google" | "tripadvisor" | "elfsight" | "custom";
  widgetEmbedCode?: string;
  googlePlaceId?: string;
  tripAdvisorUrl?: string;
}

// Elfsight widget global type augmentation
declare global {
  interface Window {
    eapps?: {
      instance?: {
        initWidgets: () => void;
      };
    };
  }
}

// Standfirst Section types
export interface IStandfirstSectionProps {
  id: number;
  __component: "layout.standfirst-section";
  heading: string;
  kicker?: string;
  standfirst: string;
  media?: TMedia;
  link?: TLink;
  mediaPosition: "left" | "right";
  variant: "featured" | "compact";
  documentId?: string;
}