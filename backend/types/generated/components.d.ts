import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsDealItem extends Struct.ComponentSchema {
  collectionName: 'components_components_deal_items';
  info: {
    description: 'An individual item included in a combo deal';
    displayName: 'Deal Item';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    quantity: Schema.Attribute.String & Schema.Attribute.DefaultTo<'1'>;
  };
}

export interface ComponentsInfoWithMedia extends Struct.ComponentSchema {
  collectionName: 'components_components_info_with_medias';
  info: {
    displayName: 'Info with Media';
  };
  attributes: {
    heading: Schema.Attribute.String;
    info: Schema.Attribute.Blocks;
    media: Schema.Attribute.Media<'images' | 'videos'>;
    orientation: Schema.Attribute.Enumeration<
      ['MEDIA_LEFT', 'MEDIA_RIGHT', 'MEDIA_TOP']
    > &
      Schema.Attribute.DefaultTo<'MEDIA_LEFT'>;
  };
}

export interface ComponentsLink extends Struct.ComponentSchema {
  collectionName: 'components_components_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean;
    label: Schema.Attribute.String;
  };
}

export interface ComponentsOperatingHours extends Struct.ComponentSchema {
  collectionName: 'components_components_operating_hours';
  info: {
    description: 'Operating hours for a single day of the week';
    displayName: 'Operating Hours';
  };
  attributes: {
    closeTime: Schema.Attribute.String;
    day: Schema.Attribute.Enumeration<
      [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]
    > &
      Schema.Attribute.Required;
    isClosed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    openTime: Schema.Attribute.String;
  };
}

export interface LayoutDealsSection extends Struct.ComponentSchema {
  collectionName: 'components_layout_deals_sections';
  info: {
    description: 'A section displaying featured deals in a card grid layout';
    displayName: 'Deals Section';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<"Today's Specials">;
    subHeading: Schema.Attribute.String;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    logoText: Schema.Attribute.Component<'components.link', false>;
    socialLink: Schema.Attribute.Component<'components.link', true>;
    text: Schema.Attribute.String;
  };
}

export interface LayoutGallerySection extends Struct.ComponentSchema {
  collectionName: 'components_layout_gallery_sections';
  info: {
    displayName: 'Gallery Section';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    images: Schema.Attribute.Media<'images', true>;
    subHeading: Schema.Attribute.String;
  };
}

export interface LayoutHeader extends Struct.ComponentSchema {
  collectionName: 'components_layout_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'components.link', true>;
    logoText: Schema.Attribute.Component<'components.link', false>;
  };
}

export interface LayoutHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_layout_hero_sections';
  info: {
    displayName: 'Hero Section';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    link: Schema.Attribute.Component<'components.link', true>;
    media: Schema.Attribute.Media<'images' | 'videos'>;
    onHomepage: Schema.Attribute.Boolean;
    subHeading: Schema.Attribute.String;
  };
}

export interface LayoutInfoSection extends Struct.ComponentSchema {
  collectionName: 'components_layout_info_sections';
  info: {
    displayName: 'Info Section';
  };
  attributes: {
    description: Schema.Attribute.Text;
    features: Schema.Attribute.Component<'components.info-with-media', true>;
    heading: Schema.Attribute.String;
    subHeading: Schema.Attribute.String;
  };
}

export interface LayoutLocationSection extends Struct.ComponentSchema {
  collectionName: 'components_layout_location_sections';
  info: {
    description: 'Restaurant location with map, address, hours, and contact info';
    displayName: 'Location Section';
  };
  attributes: {
    city: Schema.Attribute.String & Schema.Attribute.Required;
    country: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Canada'>;
    googleMapsUrl: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Find Us'>;
    latitude: Schema.Attribute.Float & Schema.Attribute.Required;
    longitude: Schema.Attribute.Float & Schema.Attribute.Required;
    operatingHours: Schema.Attribute.Component<
      'components.operating-hours',
      true
    >;
    parkingInfo: Schema.Attribute.Text;
    phoneNumber: Schema.Attribute.String & Schema.Attribute.Required;
    postcode: Schema.Attribute.String & Schema.Attribute.Required;
    streetAddress: Schema.Attribute.String & Schema.Attribute.Required;
    subHeading: Schema.Attribute.String;
  };
}

export interface LayoutReviewsSection extends Struct.ComponentSchema {
  collectionName: 'components_layout_reviews_sections';
  info: {
    description: 'Section for embedding third-party review widgets.';
    displayName: 'Reviews Section';
    icon: 'star';
  };
  attributes: {
    googlePlaceId: Schema.Attribute.String;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'What Our Customers Say'>;
    subHeading: Schema.Attribute.String;
    tripAdvisorUrl: Schema.Attribute.String;
    widgetEmbedCode: Schema.Attribute.Text;
    widgetType: Schema.Attribute.Enumeration<
      ['google', 'tripadvisor', 'elfsight', 'custom']
    > &
      Schema.Attribute.DefaultTo<'elfsight'>;
  };
}

export interface MenuDropdown extends Struct.ComponentSchema {
  collectionName: 'components_menu_dropdowns';
  info: {
    displayName: 'Dropdown';
  };
  attributes: {
    sections: Schema.Attribute.Relation<'oneToMany', 'api::section.section'>;
    title: Schema.Attribute.String;
  };
}

export interface MenuMenuLink extends Struct.ComponentSchema {
  collectionName: 'components_menu_menu_links';
  info: {
    displayName: 'Menu Link';
  };
  attributes: {
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.deal-item': ComponentsDealItem;
      'components.info-with-media': ComponentsInfoWithMedia;
      'components.link': ComponentsLink;
      'components.operating-hours': ComponentsOperatingHours;
      'layout.deals-section': LayoutDealsSection;
      'layout.footer': LayoutFooter;
      'layout.gallery-section': LayoutGallerySection;
      'layout.header': LayoutHeader;
      'layout.hero-section': LayoutHeroSection;
      'layout.info-section': LayoutInfoSection;
      'layout.location-section': LayoutLocationSection;
      'layout.reviews-section': LayoutReviewsSection;
      'menu.dropdown': MenuDropdown;
      'menu.menu-link': MenuMenuLink;
    }
  }
}
