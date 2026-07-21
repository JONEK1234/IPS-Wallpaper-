import { GridItem, BackgroundPreset, UserPhoto } from './types';

// Predefined high-quality backgrounds that match the theme of their photos
export const DEFAULT_BG_PRESETS: BackgroundPreset[] = [
  {
    id: 'bg-1',
    name: 'Abisso Avatar (Bioluminescente)',
    url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'bg-2',
    name: 'Barriera Corallina Turchese',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'bg-3',
    name: 'Oceano Profondo Smeraldo',
    url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'bg-4',
    name: 'Cyberpunk Neon Teal',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200'
  }
];

// Pre-loaded high-quality Unsplash photos that match the styles of uploaded pictures
export const DEFAULT_USER_PHOTOS: UserPhoto[] = [
  {
    id: 'photo-1',
    name: 'Avatar Marina',
    url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'photo-2',
    name: 'Profilo Taglio',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'photo-3',
    name: 'Tatuaggio Rosa',
    url: 'https://images.unsplash.com/photo-1560707303-4e980c876ad2?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'photo-4',
    name: 'Aesthetic Fitness',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600'
  }
];

// Replicates the user's uploaded homescreen image with 100% precision
export const INITIAL_GRID_ITEMS: GridItem[] = [
  // Page 0 (First page)
  {
    id: 'grid-avatar-widget',
    row: 0,
    col: 0,
    w: 2,
    h: 2,
    type: 'widget_small',
    widgetType: 'photo',
    title: 'iScreen',
    images: ['https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600'],
    page: 0
  },
  {
    id: 'grid-weather',
    row: 0,
    col: 2,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Weather',
    iconName: 'Cloud',
    page: 0
  },
  {
    id: 'grid-stocks',
    row: 0,
    col: 3,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Stocks',
    iconName: 'TrendingUp',
    page: 0
  },
  {
    id: 'grid-books',
    row: 1,
    col: 2,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Books',
    iconName: 'BookOpen',
    page: 0
  },
  {
    id: 'grid-itunes',
    row: 1,
    col: 3,
    w: 1,
    h: 1,
    type: 'app',
    label: 'iTunes Store',
    iconName: 'Star',
    page: 0
  },
  {
    id: 'grid-polaroid-widget',
    row: 2,
    col: 0,
    w: 4,
    h: 2,
    type: 'widget_medium',
    widgetType: 'polaroid',
    title: 'iScreen',
    images: [
      'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1560707303-4e980c876ad2?auto=format&fit=crop&q=80&w=600'
    ],
    page: 0
  },
  {
    id: 'grid-findmy',
    row: 4,
    col: 0,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Find My',
    iconName: 'Compass',
    page: 0
  },
  {
    id: 'grid-home',
    row: 4,
    col: 1,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Home',
    iconName: 'Home',
    page: 0
  },
  {
    id: 'grid-files',
    row: 5,
    col: 0,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Files',
    iconName: 'Folder',
    page: 0
  },
  {
    id: 'grid-translate',
    row: 5,
    col: 1,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Translate',
    iconName: 'Languages',
    page: 0
  },
  {
    id: 'grid-avatar-widget-bottom',
    row: 4,
    col: 2,
    w: 2,
    h: 2,
    type: 'widget_small',
    widgetType: 'photo',
    title: 'iScreen',
    images: ['https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600'],
    page: 0
  },

  // Page 1 (Second page template layout)
  {
    id: 'grid-app-settings',
    row: 0,
    col: 0,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Impostazioni',
    iconName: 'Settings',
    page: 1
  },
  {
    id: 'grid-app-camera',
    row: 0,
    col: 1,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Fotocamera',
    iconName: 'Camera',
    page: 1
  },
  {
    id: 'grid-clock-widget-p1',
    row: 0,
    col: 2,
    w: 2,
    h: 2,
    type: 'widget_small',
    widgetType: 'clock',
    title: 'Orologio',
    page: 1
  }
];

export const INITIAL_DOCK_ITEMS: GridItem[] = [
  {
    id: 'dock-phone',
    row: 99,
    col: 0,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Telefono',
    iconName: 'Phone'
  },
  {
    id: 'dock-messages',
    row: 99,
    col: 1,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Messaggi',
    iconName: 'MessageSquare'
  },
  {
    id: 'dock-google',
    row: 99,
    col: 2,
    w: 1,
    h: 1,
    type: 'app',
    label: 'Google',
    iconName: 'Search'
  },
  {
    id: 'dock-whatsapp',
    row: 99,
    col: 3,
    w: 1,
    h: 1,
    type: 'app',
    label: 'WhatsApp',
    iconName: 'MessageCircle'
  }
];
