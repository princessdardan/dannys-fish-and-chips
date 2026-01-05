import type { Schema, Struct } from '@strapi/strapi';

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
      'components.info-with-media': ComponentsInfoWithMedia;
      'components.link': ComponentsLink;
      'layout.footer': LayoutFooter;
      'layout.gallery-section': LayoutGallerySection;
      'layout.header': LayoutHeader;
      'layout.hero-section': LayoutHeroSection;
      'layout.info-section': LayoutInfoSection;
      'menu.dropdown': MenuDropdown;
      'menu.menu-link': MenuMenuLink;
    }
  }
}
