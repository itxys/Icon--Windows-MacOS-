
export interface IconLayer {
  size: number;
  blob: Blob;
  url: string;
}

export enum AppTab {
  CONVERT = 'CONVERT',
  GENERATE = 'GENERATE'
}

export interface GeneratedImage {
  url: string;
  base64: string;
  mimeType: string;
}

export type IconFormat = 'ICO' | 'ICNS';

export type AIProvider = 'gemini' | 'openai' | 'doubao' | 'qwen';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}
