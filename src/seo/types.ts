export type OpenGraphType = 'website' | 'article' | 'product' | 'profile'
  | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station'
  | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

export type ArticleSubTag = 'article:published_time' | 'article:modified_time'
  | 'article:expiration_time' | 'article:author' | 'article:section' | 'article:tag';

export type ProfileSubTag = 'profile:first_name' | 'profile:last_name'
  | 'profile:username' | 'profile:gender';

export type ProductSubTag = 'product:brand' | 'product:availability' | 'product:condition'
  | 'product:price:amount' | 'product:price:currency' | 'product:retailer_item_id'
  | 'product:item_group_id' | 'product:sale_price:amount' | 'product:sale_price:currency'
  | 'product:sale_price_dates:start' | 'product:sale_price_dates:end' | 'product:category'
  | 'product:color' | 'product:material' | 'product:size' | 'product:pattern'
  | 'product:gender' | 'product:age_group' | 'product:plural_title'
  | 'product:weight:value' | 'product:weight:units'
  | 'product:shipping_weight:value' | 'product:shipping_weight:units'
  | 'product:shipping_cost:amount' | 'product:shipping_cost:currency'
  | 'product:original_price:amount' | 'product:original_price:currency'
  | 'product:pretax_price:amount' | 'product:pretax_price:currency'
  | 'product:custom_label_0' | 'product:custom_label_1' | 'product:custom_label_2'
  | 'product:custom_label_3' | 'product:custom_label_4';

export type MovieSubTag = 'video:actor' | 'video:actor:role' | 'video:director'
  | 'video:writer' | 'video:duration' | 'video:release_date' | 'video:tag' | 'video:series';

export type MusicSubTag = 'music:duration' | 'music:album' | 'music:album:disc'
  | 'music:album:track' | 'music:musician' | 'music:song' | 'music:song:disc'
  | 'music:song:track' | 'music:release_date' | 'music:creator';

type SeoTemplateData = {
  title: string,
  description: string | null,
  imageUrl: string,

  siteName?: string,
  canonicalUrl?: string,
  mediaType?: OpenGraphType,
  redirectUrlJson?: string,
  template?: string,
};

export type SeoData = SeoTemplateData | Promise<SeoTemplateData>;

export type SeoProps = {
  templatePath?: string,

  site: {
    name: string,
    title: string,
    description: string,
    imageUrl: string,
    keywords: string,
  },
};
