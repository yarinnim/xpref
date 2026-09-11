type OpenGrapType = 'website' | 'article' | 'product' | 'profile'
  | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station'
  | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

export type MovieSubTag = 'video.actor:role' | 'video:director' | 'video:writer'
  | 'video:duration' | 'video:release_date' | 'video:tag';

export type MusicSubTag = 'music:duration' | 'music:album' | 'music:album:disc'
  | 'music:album:track' | 'music:musician';

export type SeoProps = {
  siteName: string,
  title: string,
  description: string | null,
  imageUrl: string,
  canonicalUrl: string,

  mediaType?: OpenGrapType,
};
