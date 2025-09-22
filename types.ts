export type GenerationMode = 'idea' | 'image';

export type Language = 'Português (Brasil)' | 'Português (Portugal)' | 'English' | 'Français' | 'Deutsch' | 'Español' | 'Nederlands';

export interface SocialContent {
  caption: string;
  imagePrompt?: string;
  hashtags: string[];
  postingTime?: string;
  postVariations?: string[];
  soundtrack?: string;
}
