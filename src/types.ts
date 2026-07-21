export interface GridItem {
  id: string;
  row: number; // 0 to 5
  col: number; // 0 to 3
  w: number;   // 1 to 4
  h: number;   // 1 to 4
  type: 'app' | 'widget_small' | 'widget_medium' | 'widget_large';
  label?: string;
  iconName?: string; // Lucide icon name or 'custom'
  iconUrl?: string;  // Custom image URL or base64 data for the icon
  transparentIconBg?: boolean; // Toggles whether the app icon background is transparent
  audioUrl?: string; // Base64 data or link to an audio file played on click
  audioStartOffset?: number; // Starting offset in seconds for custom audio playback
  customSize?: number; // Custom size in px (e.g. 58px for icons, scale/px representation)
  page?: number; // Multi-page support (0, 1, 2...)
  
  // Widget config
  widgetType?: 'photo' | 'weather' | 'clock' | 'stocks' | 'polaroid';
  images?: string[]; // Array of image URLs/base64 for photo/polaroid widgets
  title?: string;     // Custom title for the widget (e.g. "iScreen")
  themeColor?: string; // Accent tint
  polaroidFullPhoto?: boolean; // Show full photo with no polaroid frame border
  polaroidLabels?: string[];   // Custom text labels under the 3 polaroid slots
  polaroidHideLabels?: boolean; // Completely hide labels or leave them blank
  token?: string;              // Custom token code for special embedded app functions
  weatherBgUrl?: string;       // Custom background URL/image for MOTIVA-METEO token app
  weatherBgFit?: 'cover' | 'contain' | 'stretch'; // Background image fit mode
  weatherBgOverlayOpacity?: number; // Intensity of the dark overlay gradient (0 to 100)
}

export interface BackgroundPreset {
  id: string;
  name: string;
  url: string;
}

export interface UserPhoto {
  id: string;
  name: string;
  url: string;
}
