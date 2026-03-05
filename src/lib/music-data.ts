
export interface Track {
  id: string;
  title: string;
  album: string;
  duration: string;
  genre: string;
  lyricsExcerpt?: string;
  coverUrl: string;
}

export const MORE_INK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Shadows',
    album: 'Resonance',
    duration: '4:12',
    genre: 'Alternative Rock',
    lyricsExcerpt: 'In the pulse of the midnight rain, we find the ink that writes our name...',
    coverUrl: 'https://picsum.photos/seed/ink8/500/500'
  },
  {
    id: '2',
    title: 'Liquid Silence',
    album: 'Resonance',
    duration: '3:55',
    genre: 'Art Pop',
    lyricsExcerpt: 'Floating through the quiet deep, secrets that we never keep...',
    coverUrl: 'https://picsum.photos/seed/ink9/500/500'
  },
  {
    id: '3',
    title: 'Electric Pulse',
    album: 'Single',
    duration: '5:02',
    genre: 'Electronic Rock',
    lyricsExcerpt: 'Surge of light across the wire, burning with a cold desire...',
    coverUrl: 'https://picsum.photos/seed/ink10/500/500'
  }
];
