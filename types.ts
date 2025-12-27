
export interface IconLayer {
  size: number;
  blob: Blob;
  url: string;
}

export type IconFormat = 'ICO' | 'ICNS';

export type AppTab = 'CONVERT' | 'AI';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}
