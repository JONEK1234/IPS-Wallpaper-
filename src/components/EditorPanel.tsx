import React, { useState, useRef } from 'react';
import { GridItem, BackgroundPreset, UserPhoto } from '../types';
import { IconPicker } from './IconPicker';
import { LucideIcon } from './LucideIcon';
import { getItem, setItem } from '../utils/db';
import { 
  Upload, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  Settings2, 
  RefreshCw, 
  AppWindow,
  RotateCcw,
  Sparkles,
  Link2,
  FileImage,
  Layers,
  Volume2,
  Tv,
  Download,
  Eye,
  EyeOff,
  Clipboard,
  Maximize,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

// Helper to compress/resize custom uploaded image files to prevent LocalStorage quota crashes
const compressImage = (dataUrl: string, maxWidth: number, maxHeight: number, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions keeping aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // If PNG background is transparent, we preserve transparency using PNG
        const hasAlpha = dataUrl.startsWith('data:image/png') || dataUrl.startsWith('data:image/gif');
        const format = hasAlpha ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(format, format === 'image/jpeg' ? quality : undefined));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
  });
};

interface EditorPanelProps {
  gridItems: GridItem[];
  dockItems: GridItem[];
  selectedItem: GridItem | { type: 'empty'; row: number; col: number; isDock: boolean } | null;
  backgroundUrl: string;
  userPhotos: UserPhoto[];
  backgroundPresets: BackgroundPreset[];
  isEditMode: boolean;
  onUpdateBackground: (url: string) => void;
  onUpdateItem: (item: GridItem) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: GridItem) => void;
  onAddUserPhoto: (photo: UserPhoto) => void;
  onDeleteUserPhoto: (id: string) => void;
  onResetToDefault: () => void;
  onToggleEditMode: () => void;
  isFullscreenDisplay: boolean;
  onToggleFullscreenDisplay: () => void;
  onExportOfflineHtml: () => void;
  isExporting: boolean;
  onImportConfigHtml?: (file: File) => void;
  alwaysFullscreen?: boolean;
  onToggleAlwaysFullscreen?: () => void;
}

export function EditorPanel({
  gridItems,
  dockItems,
  selectedItem,
  backgroundUrl,
  userPhotos,
  backgroundPresets,
  isEditMode,
  onUpdateBackground,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onAddUserPhoto,
  onDeleteUserPhoto,
  onResetToDefault,
  onToggleEditMode,
  isFullscreenDisplay,
  onToggleFullscreenDisplay,
  onExportOfflineHtml,
  isExporting,
  onImportConfigHtml,
  alwaysFullscreen,
  onToggleAlwaysFullscreen,
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'selected' | 'background' | 'photos'>('selected');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [bgInput, setBgInput] = useState(backgroundUrl);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [copiedVercelLink, setCopiedVercelLink] = useState(false);

  const handleCopyVercelFullscreenLink = () => {
    const currentOrigin = window.location.origin;
    const fullscreenUrl = `${currentOrigin}/?fullscreen=true`;
    navigator.clipboard.writeText(fullscreenUrl);
    setCopiedVercelLink(true);
    setTimeout(() => setCopiedVercelLink(false), 2500);
  };

  const handleDownloadLauncherHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>iPhone iScreen - Schermo Intero</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }
    .card {
      text-align: center;
      padding: 2.2rem 1.8rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      backdrop-filter: blur(24px);
      max-width: 380px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .icon-box {
      width: 68px;
      height: 68px;
      background: linear-gradient(135deg, #0d9488, #0284c7);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.4);
    }
    h1 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    p { font-size: 0.88rem; color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.45; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 0.9rem 1.5rem;
      background: #0284c7;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: 14px;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }
    .btn:hover { background: #0369a1; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 2 0 0 0-2 2v3m18 0V5a2 2 2 0 0 0-2-2h-3m0 18h3a2 2 2 0 0 0 2-2v-3M3 16v3a2 2 2 0 0 0 2 2h3"/></svg>
    </div>
    <h1>iPhone iScreen</h1>
    <p>Apertura automatica su Vercel in modalità Schermo Intero in corso...</p>
    <a id="launchBtn" href="https://ios-wallpaper.vercel.app/?fullscreen=true" class="btn">
      Apri a Schermo Intero
    </a>
  </div>

  <script>
    const targetUrl = "https://ios-wallpaper.vercel.app/?fullscreen=true";
    window.location.replace(targetUrl);
    document.getElementById('launchBtn').addEventListener('click', function() {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apri-schermo-intero-vercel.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportConfigHtml) {
      onImportConfigHtml(file);
      e.target.value = '';
    }
  };

  // States for selected item form fields
  const [appLabel, setAppLabel] = useState('');
  const [appToken, setAppToken] = useState('');
  const [appWeatherBgUrl, setAppWeatherBgUrl] = useState('');
  const [appWeatherBgFit, setAppWeatherBgFit] = useState<'cover' | 'contain' | 'stretch'>('cover');
  const [appWeatherBgOverlayOpacity, setAppWeatherBgOverlayOpacity] = useState<number>(60);
  const [appIconName, setAppIconName] = useState('AppWindow');
  const [appIconType, setAppIconType] = useState<'lucide' | 'custom'>('lucide');
  const [appIconUrl, setAppIconUrl] = useState('');
  const [appAudioUrl, setAppAudioUrl] = useState('');
  const [appAudioStartOffset, setAppAudioStartOffset] = useState<number>(0);
  const [appTransparentIconBg, setAppTransparentIconBg] = useState(false);
  const [appCustomSize, setAppCustomSize] = useState<number>(58);
  const [soundMode, setSoundMode] = useState<'preset' | 'custom'>('preset');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // States and refs for custom starting point preview
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Record<string, HTMLAudioElement>>({});
  const lastSyncedItemRef = useRef<GridItem | null>(null);
  const lastSelectedIdRef = useRef<string | null>(null);

  const [widgetTitle, setWidgetTitle] = useState('iScreen');
  const [widgetType, setWidgetType] = useState<'photo' | 'weather' | 'clock' | 'stocks' | 'polaroid'>('photo');
  const [widgetImages, setWidgetImages] = useState<string[]>([]);

  // Polaroid configuration states
  const [polaroidFullPhoto, setPolaroidFullPhoto] = useState<boolean>(false);
  const [polaroidLabels, setPolaroidLabels] = useState<string[]>(['MEMORIA', 'ESTATE', 'SOGNO']);
  const [polaroidHideLabels, setPolaroidHideLabels] = useState<boolean>(false);

  // Cleanup preview audio on changes or unmount
  React.useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setIsPreviewPlaying(false);
    };
  }, [appAudioUrl, appAudioStartOffset, selectedItem]);

  // Sync item form state when selected item changes
  React.useEffect(() => {
    if (selectedItem && 'id' in selectedItem) {
      // ONLY reset local state if the user actually clicked on a DIFFERENT item
      if (lastSelectedIdRef.current === selectedItem.id) {
        // Just update the sync ref, but do NOT override form states
        lastSyncedItemRef.current = selectedItem;
        return;
      }

      setAppLabel(selectedItem.label || '');
      setAppToken(selectedItem.token || '');
      setAppWeatherBgUrl(selectedItem.weatherBgUrl || '');
      setAppWeatherBgFit(selectedItem.weatherBgFit || 'cover');
      setAppWeatherBgOverlayOpacity(selectedItem.weatherBgOverlayOpacity !== undefined ? selectedItem.weatherBgOverlayOpacity : 60);
      setAppIconName(selectedItem.iconName || 'AppWindow');
      setAppIconType(selectedItem.iconName === 'custom' ? 'custom' : 'lucide');
      setAppIconUrl(selectedItem.iconUrl || '');
      setAppAudioUrl(selectedItem.audioUrl || '');
      setAppAudioStartOffset(selectedItem.audioStartOffset || 0);
      setAppTransparentIconBg(selectedItem.transparentIconBg || false);
      
      const defaultSize = selectedItem.type === 'app' ? 58 : (selectedItem.type === 'widget_small' ? 120 : 250);
      setAppCustomSize(selectedItem.customSize || defaultSize);
      
      // Determine if selected sound is custom or preset
      const isCustomSound = selectedItem.audioUrl && !selectedItem.audioUrl.startsWith('preset:');
      setSoundMode(isCustomSound ? 'custom' : 'preset');

      setWidgetTitle(selectedItem.title || 'iScreen');
      setWidgetType(selectedItem.widgetType || 'photo');
      setWidgetImages(selectedItem.images || []);

      setPolaroidFullPhoto(selectedItem.polaroidFullPhoto || false);
      setPolaroidLabels(selectedItem.polaroidLabels || ['MEMORIA', 'ESTATE', 'SOGNO']);
      setPolaroidHideLabels(selectedItem.polaroidHideLabels || false);

      // Keep reference to exact item we just synced from to guard sync-back
      lastSyncedItemRef.current = selectedItem;
      lastSelectedIdRef.current = selectedItem.id;
    } else {
      lastSyncedItemRef.current = null;
      lastSelectedIdRef.current = null;
    }
  }, [selectedItem]);

  // Auto-sync form changes back to parent in real-time
  React.useEffect(() => {
    if (!selectedItem || !('id' in selectedItem)) return;

    // Guard: Only sync back if we are modifying the SAME item that we already loaded into the form states
    if (!lastSyncedItemRef.current || selectedItem.id !== lastSyncedItemRef.current.id) {
      return;
    }

    // Check if any value actually changed to avoid infinite render loops
    const hasLabelChanged = appLabel !== (selectedItem.label || '');
    const currentIconName = appIconType === 'custom' ? 'custom' : appIconName;
    const hasIconNameChanged = currentIconName !== (selectedItem.iconName || 'AppWindow');
    const currentIconUrl = appIconType === 'custom' ? appIconUrl : undefined;
    const hasIconUrlChanged = currentIconUrl !== selectedItem.iconUrl;
    const currentAudioUrl = appAudioUrl || undefined;
    const hasAudioUrlChanged = currentAudioUrl !== selectedItem.audioUrl;
    const currentAudioStartOffset = appAudioStartOffset || undefined;
    const hasAudioStartOffsetChanged = currentAudioStartOffset !== selectedItem.audioStartOffset;
    const hasTransparentChanged = appTransparentIconBg !== (selectedItem.transparentIconBg || false);
    const hasTokenChanged = appToken !== (selectedItem.token || '');
    const hasWeatherBgUrlChanged = appWeatherBgUrl !== (selectedItem.weatherBgUrl || '');
    const hasWeatherBgFitChanged = appWeatherBgFit !== (selectedItem.weatherBgFit || 'cover');
    const hasWeatherBgOverlayOpacityChanged = appWeatherBgOverlayOpacity !== (selectedItem.weatherBgOverlayOpacity !== undefined ? selectedItem.weatherBgOverlayOpacity : 60);
    
    const defaultSize = selectedItem.type === 'app' ? 58 : (selectedItem.type === 'widget_small' ? 120 : 250);
    const currentSize = appCustomSize || defaultSize;
    const hasSizeChanged = currentSize !== (selectedItem.customSize || defaultSize);
    
    const hasWidgetTitleChanged = widgetTitle !== (selectedItem.title || 'iScreen');
    const hasWidgetTypeChanged = widgetType !== (selectedItem.widgetType || 'photo');
    const hasWidgetImagesChanged = JSON.stringify(widgetImages) !== JSON.stringify(selectedItem.images || []);
    const hasPolaroidFullPhotoChanged = polaroidFullPhoto !== (selectedItem.polaroidFullPhoto || false);
    const hasPolaroidLabelsChanged = JSON.stringify(polaroidLabels) !== JSON.stringify(selectedItem.polaroidLabels || ['MEMORIA', 'ESTATE', 'SOGNO']);
    const hasPolaroidHideLabelsChanged = polaroidHideLabels !== (selectedItem.polaroidHideLabels || false);

    console.log('[AUTO-SYNC DEBUG]', {
      id: selectedItem.id,
      hasLabelChanged,
      hasIconNameChanged,
      hasIconUrlChanged,
      hasAudioUrlChanged,
      hasAudioStartOffsetChanged,
      hasTransparentChanged,
      hasTokenChanged,
      hasSizeChanged,
      hasWidgetTitleChanged,
      hasWidgetTypeChanged,
      hasWidgetImagesChanged,
      hasPolaroidFullPhotoChanged,
      hasPolaroidLabelsChanged,
      hasPolaroidHideLabelsChanged,
      appLabel, selectedItemLabel: selectedItem.label,
      currentSize, selectedItemCustomSize: selectedItem.customSize,
      appAudioStartOffset, selectedItemAudioStartOffset: selectedItem.audioStartOffset,
    });

    if (
      hasLabelChanged ||
      hasIconNameChanged ||
      hasIconUrlChanged ||
      hasAudioUrlChanged ||
      hasAudioStartOffsetChanged ||
      hasTransparentChanged ||
      hasTokenChanged ||
      hasWeatherBgUrlChanged ||
      hasWeatherBgFitChanged ||
      hasWeatherBgOverlayOpacityChanged ||
      hasSizeChanged ||
      hasWidgetTitleChanged ||
      hasWidgetTypeChanged ||
      hasWidgetImagesChanged ||
      hasPolaroidFullPhotoChanged ||
      hasPolaroidLabelsChanged ||
      hasPolaroidHideLabelsChanged
    ) {
      const updated: GridItem = {
        ...selectedItem,
        label: appLabel,
        iconName: currentIconName,
        iconUrl: currentIconUrl,
        audioUrl: currentAudioUrl,
        audioStartOffset: currentAudioStartOffset,
        transparentIconBg: appTransparentIconBg,
        token: appToken || undefined,
        weatherBgUrl: appWeatherBgUrl || undefined,
        weatherBgFit: appWeatherBgFit,
        weatherBgOverlayOpacity: appWeatherBgOverlayOpacity,
        customSize: currentSize,
        title: widgetTitle,
        widgetType,
        images: widgetImages,
        polaroidFullPhoto,
        polaroidLabels,
        polaroidHideLabels
      };
      onUpdateItem(updated);
    }
  }, [
    appLabel,
    appToken,
    appWeatherBgUrl,
    appWeatherBgFit,
    appWeatherBgOverlayOpacity,
    appIconName,
    appIconType,
    appIconUrl,
    appAudioUrl,
    appAudioStartOffset,
    appTransparentIconBg,
    appCustomSize,
    widgetTitle,
    widgetType,
    widgetImages,
    polaroidFullPhoto,
    polaroidLabels,
    polaroidHideLabels,
    selectedItem,
    onUpdateItem
  ]);

  // Handle local image file upload to "My Photos"
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const rawUrl = event.target.result as string;
            // Compress photo to maximum of 600px width/height for widgets
            const compressed = await compressImage(rawUrl, 600, 600, 0.75);
            const newPhoto: UserPhoto = {
              id: Date.now().toString(),
              name: file.name.substring(0, 15),
              url: compressed
            };
            onAddUserPhoto(newPhoto);
          } catch (err) {
            console.error('Errore compressione foto:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom custom icon photo upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const rawUrl = event.target.result as string;
            // Compress custom icon to 150px maximum with quality 0.8
            const compressed = await compressImage(rawUrl, 150, 150, 0.8);
            setAppIconType('custom');
            setAppIconName('custom');
            setAppIconUrl(compressed);
          } catch (err) {
            console.error('Errore compressione icona:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom audio file upload for app sound triggering
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedItem && 'id' in selectedItem) {
      // Limit to 20MB to support full high-quality audio tracks of any size without any bugs,
      // now stored in high-capacity IndexedDB!
      if (file.size > 20 * 1024 * 1024) {
        alert("Il file audio selezionato è troppo grande (supera i 20MB).\n\nSeleziona un file audio o una canzone più breve per garantire un caricamento istantaneo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const base64Data = event.target.result as string;
          const dbKey = `db:audio_${selectedItem.id}`;
          try {
            await setItem(dbKey, base64Data);
            setAppAudioUrl(dbKey);
          } catch (err) {
            console.error('Failed to save audio to IndexedDB:', err);
            // Fallback to direct state storage if DB fails
            setAppAudioUrl(base64Data);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom wallpaper upload from local machine
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const rawUrl = event.target.result as string;
            // Compress background image to maximum 1000px width/height
            const compressed = await compressImage(rawUrl, 1000, 1000, 0.7);
            setBgInput(compressed);
            onUpdateBackground(compressed);
          } catch (err) {
            console.error('Errore compressione sfondo:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a photo from URL input
  const handleAddPhotoFromUrl = () => {
    if (customPhotoInput.trim()) {
      const newPhoto: UserPhoto = {
        id: Date.now().toString(),
        name: `Foto ${userPhotos.length + 1}`,
        url: customPhotoInput.trim()
      };
      onAddUserPhoto(newPhoto);
      setCustomPhotoInput('');
    }
  };

  // Save selected item changes
  const handleSaveItemChanges = () => {
    if (!selectedItem || !('id' in selectedItem)) return;

    const updated: GridItem = {
      ...selectedItem,
      label: appLabel,
      iconName: appIconType === 'custom' ? 'custom' : appIconName,
      iconUrl: appIconType === 'custom' ? appIconUrl : undefined,
      audioUrl: appAudioUrl || undefined,
      audioStartOffset: appAudioStartOffset || undefined,
      transparentIconBg: appTransparentIconBg,
      customSize: appCustomSize,
      title: widgetTitle,
      widgetType,
      images: widgetImages
    };

    onUpdateItem(updated);

    // Play test audio so they can hear it immediately as feedback
    if (appAudioUrl) {
      try {
        if (appAudioUrl.startsWith('preset:')) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;
            if (appAudioUrl === 'preset:bell') {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, now);
              osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
              gain.gain.setValueAtTime(0.3, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now);
              osc.stop(now + 1.2);
            } else if (appAudioUrl === 'preset:digital') {
              const osc1 = ctx.createOscillator();
              const gain1 = ctx.createGain();
              osc1.type = 'triangle';
              osc1.frequency.setValueAtTime(1100, now);
              gain1.gain.setValueAtTime(0.15, now);
              gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
              osc1.connect(gain1);
              gain1.connect(ctx.destination);
              osc1.start(now);
              osc1.stop(now + 0.1);

              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = 'triangle';
              osc2.frequency.setValueAtTime(1400, now + 0.08);
              gain2.gain.setValueAtTime(0.15, now + 0.08);
              gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.start(now + 0.08);
              osc2.stop(now + 0.25);
            } else if (appAudioUrl === 'preset:marimba') {
              const notes = [523.25, 659.25, 783.99, 1046.50];
              notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.2, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.2);
              });
            } else if (appAudioUrl === 'preset:retro') {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(300, now);
              osc.frequency.exponentialRampToValueAtTime(1100, now + 0.25);
              gain.gain.setValueAtTime(0.08, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now);
              osc.stop(now + 0.3);
            } else if (appAudioUrl === 'preset:sci-fi') {
              const osc = ctx.createOscillator();
              const osc2 = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(120, now);
              osc.frequency.exponentialRampToValueAtTime(750, now + 0.4);
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(240, now);
              osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.4);
              gain.gain.setValueAtTime(0.06, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
              osc.connect(gain);
              osc2.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now);
              osc2.start(now);
              osc.stop(now + 0.45);
              osc2.stop(now + 0.45);
            }
          }
        } else {
          const playAudioSrc = async () => {
            let actualSrc = appAudioUrl;
            if (appAudioUrl.startsWith('db:audio_')) {
              const saved = await getItem<string | null>(appAudioUrl, null);
              if (saved) actualSrc = saved;
            }
            
            let playTest = audioCacheRef.current[actualSrc];
            if (!playTest) {
              playTest = new Audio(actualSrc);
              playTest.preload = "auto";
              audioCacheRef.current[actualSrc] = playTest;
            }
            const playWithOffset = () => {
              if (appAudioStartOffset > 0) {
                playTest.currentTime = appAudioStartOffset;
              } else {
                playTest.currentTime = 0;
              }
              playTest.play().catch(e => console.warn(e));
            };
            if (playTest.readyState >= 1) {
              playWithOffset();
            } else {
              playTest.addEventListener('loadedmetadata', playWithOffset, { once: true });
              playTest.load();
            }
          };
          playAudioSrc();
        }
      } catch (e) {
        console.warn('Playback error during save:', e);
      }
    }

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  // Add a new App or Widget into an empty space
  const handleAddNewItem = (type: 'app' | 'widget_small' | 'widget_medium') => {
    if (!selectedItem || 'id' in selectedItem) return;

    const { row, col, isDock } = selectedItem;
    const baseId = `item-${Date.now()}`;

    let newItem: GridItem;

    if (isDock) {
      // Dock can only take App Icons (1x1)
      newItem = {
        id: baseId,
        row: 99, // dummy dock row
        col,
        w: 1,
        h: 1,
        type: 'app',
        label: 'App',
        iconName: 'AppWindow'
      };
    } else {
      if (type === 'app') {
        newItem = {
          id: baseId,
          row,
          col,
          w: 1,
          h: 1,
          type: 'app',
          label: 'Nuova App',
          iconName: 'AppWindow'
        };
      } else if (type === 'widget_small') {
        // 2x2 widget
        newItem = {
          id: baseId,
          row,
          col,
          w: 2,
          h: 2,
          type: 'widget_small',
          widgetType: 'photo',
          title: 'iScreen',
          images: userPhotos.length > 0 ? [userPhotos[0].url] : []
        };
      } else {
        // 4x2 widget
        newItem = {
          id: baseId,
          row,
          col,
          w: 4,
          h: 2,
          type: 'widget_medium',
          widgetType: 'polaroid',
          title: 'iScreen',
          images: userPhotos.slice(0, 3).map((p) => p.url)
        };
      }
    }

    onAddItem(newItem);
  };

  // Assign a photo to the widget image slots
  const setWidgetPhotoIndex = (photoUrl: string, index: number) => {
    const updatedImages = [...widgetImages];
    updatedImages[index] = photoUrl;
    setWidgetImages(updatedImages);
  };

  return (
    <div className="flex-1 max-w-lg bg-slate-900/60 backdrop-blur-md border border-slate-850 rounded-3xl p-6 flex flex-col justify-between shadow-xl text-slate-100 overflow-hidden min-h-[620px] h-full max-h-[720px] select-none">
      
      {/* Top Header & Dynamic Modes */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings2 className="text-cyan-400 animate-pulse" size={22} />
            Configuratore iOS
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Crea il tuo iScreen personalizzato</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDefault}
            title="Ripristina layout iniziale"
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 hover:text-cyan-400 text-slate-400 border border-slate-700/50 transition-all shadow-sm"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Primary Simulator controls (Fullscreen display, Edit toggle) */}
      <div className="grid grid-cols-2 gap-2 mt-3.5 mb-2">
        <button
          onClick={onToggleEditMode}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 border
            ${isEditMode 
              ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40' 
              : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
        >
          <Sparkles size={13} className={isEditMode ? 'animate-bounce' : ''} />
          {isEditMode ? 'Edit Mode: ATTIVO' : 'Edit Mode: DISATTIVO'}
        </button>

        <button
          onClick={onToggleFullscreenDisplay}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 border
            ${isFullscreenDisplay 
              ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/40' 
              : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
        >
          <Tv size={13} />
          {isFullscreenDisplay ? 'Schermo Intero: ON' : 'Schermo Intero: OFF'}
        </button>
      </div>

      {/* Immersive Persistent Fullscreen Trigger */}
      <button
        onClick={onToggleAlwaysFullscreen}
        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md flex flex-col items-center justify-center gap-0.5 border mb-3.5 cursor-pointer
          ${alwaysFullscreen 
            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40' 
            : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
      >
        <div className="flex items-center gap-1.5">
          <Maximize size={13} className={alwaysFullscreen ? 'animate-pulse text-amber-400' : ''} />
          <span>{alwaysFullscreen ? 'Avvio Schermo Intero: ATTIVO' : 'Attiva Schermo Intero Automatico'}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-normal">
          {alwaysFullscreen 
            ? "Premi l'orario 5 volte per uscire" 
            : "Entra a schermo intero ogni volta che usi l'app"
          }
        </span>
      </button>

      {/* Vercel HTML Link Direct Fullscreen Launcher Helper */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 mb-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <ExternalLink size={12} className="text-cyan-400" />
            Link Vercel Schermo Intero
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadLauncherHtml}
              className="text-[10px] font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Scarica file HTML pronto da aprire"
            >
              <Download size={11} className="text-cyan-400" />
              Scarica HTML
            </button>
            <button
              onClick={handleCopyVercelFullscreenLink}
              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              {copiedVercelLink ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copiedVercelLink ? 'Copiato!' : 'Copia Link'}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Utilizzando l'URL con <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">?fullscreen=true</code> (es. dal file HTML scaricabile sopra o un reindirizzamento), l'app si aprirà direttamente a schermo intero solo per quel link.
        </p>
      </div>

      {/* Standalone Fully Immersive Offline Downloader & Importer Action Buttons */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <button
          onClick={onExportOfflineHtml}
          disabled={isExporting}
          className="col-span-3 py-2.5 px-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-[11px] rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 border border-emerald-400/20 cursor-pointer transition-all"
        >
          <Download size={13} className={isExporting ? 'animate-spin' : 'animate-bounce'} />
          {isExporting ? 'Generazione...' : 'Scarica App (.html)'}
        </button>

        <button
          onClick={() => importFileInputRef.current?.click()}
          className="col-span-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 hover:text-cyan-400 text-slate-300 font-extrabold text-[11px] rounded-xl shadow-md flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
        >
          <Upload size={13} />
          Carica HTML
        </button>
        <input
          type="file"
          ref={importFileInputRef}
          onChange={handleImportChange}
          accept=".html"
          className="hidden"
        />
      </div>

      {/* Main tab navigations */}
      <div className="flex gap-1.5 p-1 bg-slate-950/40 border border-slate-850 rounded-xl mb-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('selected')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center
            ${activeTab === 'selected' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Selezionato
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center
            ${activeTab === 'background' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Sfondi
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center
            ${activeTab === 'photos' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Le mie Foto ({userPhotos.length})
        </button>
      </div>

      {/* Tab Contents Scrollable container */}
      <div className="flex-1 overflow-y-auto pr-1 text-sm space-y-4">
        
        {/* TAB 1: SELECTED ELEMENT CONFIGURATOR */}
        {activeTab === 'selected' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {selectedItem ? (
              'id' in selectedItem ? (
                /* ACTUAL GRID ITEM CONFIGURE */
                <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl space-y-4">
                  
                  {/* Info Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                        {selectedItem.type === 'app' ? 'App Icon' : selectedItem.type === 'widget_small' ? 'Widget 2x2' : 'Widget 4x2'}
                      </span>
                      <h4 className="text-white font-bold text-base mt-1.5">
                        {selectedItem.type === 'app' ? appLabel || 'App Icon' : widgetTitle || 'Widget iScreen'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Posizione: Riga {selectedItem.row + 1}, Colonna {selectedItem.col + 1}</p>
                    </div>

                    <button
                      onClick={() => onDeleteItem(selectedItem.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all flex items-center gap-1 text-xs font-semibold"
                    >
                      <Trash2 size={14} />
                      Rimuovi
                    </button>
                  </div>

                  <hr className="border-slate-850" />

                  {/* FORM FIELDS BASED ON TYPE */}
                  {selectedItem.type === 'app' && (
                    <div className="space-y-4">
                      {/* App Label */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Nome App</label>
                        <input
                          type="text"
                          value={appLabel}
                          onChange={(e) => setAppLabel(e.target.value)}
                          placeholder="Inserisci nome..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* App Icon Picker Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 block">Metodo Icona</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setAppIconType('lucide'); setAppIconName('AppWindow'); }}
                            className={`flex-1 py-1.5 rounded-xl border text-xs font-medium transition-all
                              ${appIconType === 'lucide' 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40' 
                                : 'bg-slate-800/40 text-slate-400 border-slate-800'
                              }`}
                          >
                            Vettore Standard
                          </button>
                          <button
                            onClick={() => { setAppIconType('custom'); }}
                            className={`flex-1 py-1.5 rounded-xl border text-xs font-medium transition-all
                              ${appIconType === 'custom' 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40' 
                                : 'bg-slate-800/40 text-slate-400 border-slate-800'
                              }`}
                          >
                            Mia Foto / Custom
                          </button>
                        </div>
                      </div>

                      {appIconType === 'lucide' ? (
                        <div className="flex gap-3 items-center bg-slate-800/30 border border-slate-800 p-3 rounded-xl">
                          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white">
                            <LucideIcon name={appIconName} size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-300">Glyph: {appIconName}</p>
                            <button
                              onClick={() => setShowIconPicker(true)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold mt-1 underline"
                            >
                              Sfoglia Libreria Icone
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-slate-800/30 border border-slate-800 p-3 rounded-xl">
                          <p className="text-xs font-bold text-slate-300">Carica foto per icona</p>

                          {/* Live Icon Preview */}
                          {appIconUrl && (
                            <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/50 flex items-center justify-center shrink-0">
                                <img src={appIconUrl} alt="Anteprima" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Anteprima Icona</span>
                                <span className="text-[9px] text-slate-500 block truncate">{appIconUrl.startsWith('data:') ? 'Immagine Caricata' : appIconUrl}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={appIconUrl}
                              onChange={(e) => setAppIconUrl(e.target.value)}
                              placeholder="URL immagine..."
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                            
                            <button
                              onClick={() => iconFileInputRef.current?.click()}
                              className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1"
                              title="Carica da file"
                            >
                              <Upload size={13} />
                            </button>
                            <input 
                              type="file" 
                              ref={iconFileInputRef} 
                              onChange={handleIconUpload} 
                              accept="image/*" 
                              className="hidden" 
                            />
                          </div>

                          {/* Pre-select from "My Photos" list */}
                          {userPhotos.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Seleziona dalle tue foto:</p>
                              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                                {userPhotos.map((photo) => (
                                  <button
                                    key={photo.id}
                                    onClick={() => setAppIconUrl(photo.url)}
                                    className={`w-9 h-9 rounded-lg overflow-hidden border-2 shrink-0 transition-all
                                      ${appIconUrl === photo.url ? 'border-cyan-400 scale-95' : 'border-slate-800 hover:border-slate-600'}`}
                                  >
                                    <img src={photo.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TABS 1 SOUND SELECTOR: CHOOSE FILE OR SPECIFY SOUND URL */}
                      <div className="space-y-3 bg-slate-800/30 border border-slate-800 p-3 rounded-xl">
                        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Volume2 size={14} className="text-cyan-400" />
                            Associa Suono all'Icona
                          </span>
                          <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/50 font-mono">
                            {(appAudioUrl && appAudioUrl.startsWith('preset:')) ? 'Preset Sicuro' : appAudioUrl ? 'Audio Personalizzato' : 'Nessun Suono'}
                          </span>
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Riproduce un effetto acustico personalizzato quando clicchi l'icona sul telefono!
                        </p>
                        
                        {/* Selector for sound type */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSoundMode('preset');
                              // If they don't have a preset currently, set a default preset
                              if (!appAudioUrl || !appAudioUrl.startsWith('preset:')) {
                                setAppAudioUrl('preset:marimba');
                              }
                            }}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border ${
                              soundMode === 'preset'
                                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/70'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            Suoni Predefiniti (0 KB)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSoundMode('custom');
                              // If it's currently a preset, clear it so they can add custom
                              if (appAudioUrl && appAudioUrl.startsWith('preset:')) {
                                setAppAudioUrl('');
                              }
                            }}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border ${
                              soundMode === 'custom'
                                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/70'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            Personalizzato (File/URL)
                          </button>
                        </div>

                        {/* Rendering presets vs custom fields */}
                        {soundMode === 'preset' ? (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 block font-medium">Scegli una suoneria/effetto:</span>
                            <div className="grid grid-cols-2 gap-1">
                              {[
                                { id: 'preset:marimba', name: '🎵 Marimba iOS' },
                                { id: 'preset:bell', name: '🔔 Campanella Cosmo' },
                                { id: 'preset:digital', name: '🤖 Trillo Digitale' },
                                { id: 'preset:retro', name: '🎮 Arcade Retro' },
                                { id: 'preset:sci-fi', name: '👽 Sirena Sci-Fi' }
                              ].map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => setAppAudioUrl(preset.id)}
                                  className={`py-1 px-2 rounded text-[10.5px] text-left transition-all truncate border ${
                                    appAudioUrl === preset.id
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                                      : 'bg-slate-900/60 text-slate-300 border-slate-800/60 hover:bg-slate-800/55'
                                  }`}
                                >
                                  {preset.name}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setAppAudioUrl('')}
                                className={`py-1 px-2 rounded text-[10.5px] text-left transition-all border ${
                                  appAudioUrl === ''
                                    ? 'bg-slate-700 text-slate-200 border-slate-500 font-semibold'
                                    : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:bg-slate-850'
                                }`}
                              >
                                🔇 Disattiva Suono
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={appAudioUrl && appAudioUrl.startsWith('preset:') ? '' : (appAudioUrl || '')}
                                onChange={(e) => setAppAudioUrl(e.target.value)}
                                placeholder="Incolla URL audio (mp3)..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 min-w-0"
                              />

                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    // Try reading from modern clipboard API
                                    const text = await navigator.clipboard.readText();
                                    if (text && text.trim()) {
                                      setAppAudioUrl(text.trim());
                                    } else {
                                      const pasted = prompt("Incolla qui l'URL del file audio (es. link mp3):");
                                      if (pasted && pasted.trim()) {
                                        setAppAudioUrl(pasted.trim());
                                      }
                                    }
                                  } catch (err) {
                                    // Fallback when clipboard permissions are blocked in sandbox iframe
                                    const pasted = prompt("Incolla qui l'URL del file audio (es. link mp3):");
                                    if (pasted && pasted.trim()) {
                                      setAppAudioUrl(pasted.trim());
                                    }
                                  }
                                }}
                                className="px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1 shrink-0 transition-all hover:text-cyan-300 hover:border-cyan-800"
                                title="Incolla URL dagli appunti"
                              >
                                <Clipboard size={12} className="text-cyan-400" />
                                <span>Incolla</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => audioFileInputRef.current?.click()}
                                className="px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1 shrink-0 transition-all hover:text-cyan-300 hover:border-cyan-800"
                                title="Carica file audio (max 20MB)"
                              >
                                <Upload size={12} />
                              </button>
                              <input 
                                type="file" 
                                ref={audioFileInputRef} 
                                onChange={handleAudioUpload} 
                                accept="audio/*" 
                                className="hidden" 
                              />
                            </div>
                            <span className="text-[9px] text-slate-500 block">
                              Carica una canzone o file audio (fino a 20MB) o incolla un link mp3 esterno.
                            </span>

                            {/* Start offset selection */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/60 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-medium">Inizio della riproduzione:</span>
                                <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30">
                                  {String(Math.floor(appAudioStartOffset / 60)).padStart(2, '0')}:{String(appAudioStartOffset % 60).padStart(2, '0')} ({appAudioStartOffset}s)
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3.5 pt-1">
                                <div className="space-y-1">
                                  <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wider">Minuti</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={Math.floor(appAudioStartOffset / 60)}
                                    onChange={(e) => {
                                      const mins = Math.max(0, parseInt(e.target.value) || 0);
                                      const secs = appAudioStartOffset % 60;
                                      setAppAudioStartOffset(mins * 60 + secs);
                                    }}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-2.5 text-center text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wider">Secondi</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={appAudioStartOffset % 60}
                                    onChange={(e) => {
                                      const mins = Math.floor(appAudioStartOffset / 60);
                                      const secs = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                      setAppAudioStartOffset(mins * 60 + secs);
                                    }}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-2.5 text-center text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 items-center pt-1.5">
                                <input
                                  type="range"
                                  min="0"
                                  max="600"
                                  step="1"
                                  value={appAudioStartOffset}
                                  onChange={(e) => setAppAudioStartOffset(Number(e.target.value))}
                                  className="flex-1 accent-cyan-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <span className="text-[9px] text-slate-500 block">
                                Seleziona l'istante preciso (minuti e secondi) da cui far partire la tua canzone personalizzata.
                              </span>
                            </div>
                          </div>
                        )}

                        {appAudioUrl && (
                          <div className="flex items-center justify-between text-[11px] bg-cyan-950/45 border border-cyan-800/30 px-2 py-1 rounded mt-2">
                            <span className="text-cyan-400 font-medium truncate max-w-[200px]">
                              {appAudioUrl.startsWith('preset:') 
                                ? `Suono: ${appAudioUrl.replace('preset:', '').toUpperCase()}`
                                : 'Suono personalizzato pronto'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  // Call local audio preset player
                                  if (appAudioUrl.startsWith('preset:')) {
                                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                                    if (!AudioContextClass) return;
                                    const ctx = new AudioContextClass();
                                    const now = ctx.currentTime;
                                    
                                    if (appAudioUrl === 'preset:bell') {
                                      const osc = ctx.createOscillator();
                                      const gain = ctx.createGain();
                                      osc.type = 'sine';
                                      osc.frequency.setValueAtTime(880, now);
                                      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
                                      gain.gain.setValueAtTime(0.3, now);
                                      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                                      osc.connect(gain);
                                      gain.connect(ctx.destination);
                                      osc.start(now);
                                      osc.stop(now + 1.2);
                                    } else if (appAudioUrl === 'preset:digital') {
                                      const osc1 = ctx.createOscillator();
                                      const gain1 = ctx.createGain();
                                      osc1.type = 'triangle';
                                      osc1.frequency.setValueAtTime(1100, now);
                                      gain1.gain.setValueAtTime(0.15, now);
                                      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                                      osc1.connect(gain1);
                                      gain1.connect(ctx.destination);
                                      osc1.start(now);
                                      osc1.stop(now + 0.1);

                                      const osc2 = ctx.createOscillator();
                                      const gain2 = ctx.createGain();
                                      osc2.type = 'triangle';
                                      osc2.frequency.setValueAtTime(1400, now + 0.08);
                                      gain2.gain.setValueAtTime(0.15, now + 0.08);
                                      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                                      osc2.connect(gain2);
                                      gain2.connect(ctx.destination);
                                      osc2.start(now + 0.08);
                                      osc2.stop(now + 0.25);
                                    } else if (appAudioUrl === 'preset:marimba') {
                                      const notes = [523.25, 659.25, 783.99, 1046.50];
                                      notes.forEach((freq, idx) => {
                                        const osc = ctx.createOscillator();
                                        const gain = ctx.createGain();
                                        osc.type = 'sine';
                                        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                                        gain.gain.setValueAtTime(0.2, now + idx * 0.07);
                                        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);
                                        osc.connect(gain);
                                        gain.connect(ctx.destination);
                                        osc.start(now + idx * 0.07);
                                        osc.stop(now + idx * 0.07 + 0.2);
                                      });
                                    } else if (appAudioUrl === 'preset:retro') {
                                      const osc = ctx.createOscillator();
                                      const gain = ctx.createGain();
                                      osc.type = 'square';
                                      osc.frequency.setValueAtTime(300, now);
                                      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.25);
                                      gain.gain.setValueAtTime(0.08, now);
                                      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                                      osc.connect(gain);
                                      gain.connect(ctx.destination);
                                      osc.start(now);
                                      osc.stop(now + 0.3);
                                    } else if (appAudioUrl === 'preset:sci-fi') {
                                      const osc = ctx.createOscillator();
                                      const osc2 = ctx.createOscillator();
                                      const gain = ctx.createGain();
                                      osc.type = 'sawtooth';
                                      osc.frequency.setValueAtTime(120, now);
                                      osc.frequency.exponentialRampToValueAtTime(750, now + 0.4);
                                      osc2.type = 'sine';
                                      osc2.frequency.setValueAtTime(240, now);
                                      osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.4);
                                      gain.gain.setValueAtTime(0.06, now);
                                      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                                      osc.connect(gain);
                                      osc2.connect(gain);
                                      gain.connect(ctx.destination);
                                      osc.start(now);
                                      osc2.start(now);
                                      osc.stop(now + 0.45);
                                      osc2.stop(now + 0.45);
                                    }
                                  } else {
                                    if (previewAudioRef.current) {
                                      previewAudioRef.current.pause();
                                      previewAudioRef.current = null;
                                      setIsPreviewPlaying(false);
                                    } else {
                                      let playTest = audioCacheRef.current[appAudioUrl];
                                      if (!playTest) {
                                        playTest = new Audio(appAudioUrl);
                                        playTest.preload = "auto";
                                        audioCacheRef.current[appAudioUrl] = playTest;
                                      }
                                      previewAudioRef.current = playTest;
                                      setIsPreviewPlaying(true);
                                      
                                      playTest.onended = () => {
                                        if (previewAudioRef.current === playTest) {
                                          previewAudioRef.current = null;
                                          setIsPreviewPlaying(false);
                                        }
                                      };
                                      
                                      const playWithOffset = () => {
                                        if (appAudioStartOffset > 0) {
                                          playTest.currentTime = appAudioStartOffset;
                                        } else {
                                          playTest.currentTime = 0;
                                        }
                                        playTest.play().catch(e => {
                                          console.warn('Audio preview play blocked:', e);
                                          if (previewAudioRef.current === playTest) {
                                            previewAudioRef.current = null;
                                            setIsPreviewPlaying(false);
                                          }
                                        });
                                      };

                                      if (playTest.readyState >= 1) {
                                        playWithOffset();
                                      } else {
                                        playTest.addEventListener('loadedmetadata', playWithOffset, { once: true });
                                        playTest.load();
                                      }
                                    }
                                  }
                                } catch (e) {
                                  console.warn('Audio preview play blocked:', e);
                                }
                              }}
                              className={`text-[11px] px-2 py-1 rounded transition-all font-semibold select-none flex items-center gap-1 ${
                                appAudioUrl.startsWith('preset:')
                                  ? 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/30'
                                  : isPreviewPlaying
                                  ? 'text-red-400 bg-red-950/40 hover:bg-red-900/40 border border-red-800/30 animate-pulse'
                                  : 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/30'
                              }`}
                            >
                              {appAudioUrl.startsWith('preset:') ? (
                                'Ascolta Preset'
                              ) : isPreviewPlaying ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
                                  <span>Stop Anteprima</span>
                                </>
                              ) : (
                                <span>Anteprima (da {appAudioStartOffset}s)</span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* TABS 1 TRANSPARENCY TOGGLE FOR PNGs */}
                      <div className="flex items-center gap-2.5 bg-slate-800/30 border border-slate-800 p-3 rounded-xl">
                        <input
                          id="transparentIconBg"
                          type="checkbox"
                          checked={appTransparentIconBg}
                          onChange={(e) => setAppTransparentIconBg(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-800 cursor-pointer"
                        />
                        <label 
                          htmlFor="transparentIconBg" 
                          className="text-xs font-semibold text-slate-300 cursor-pointer select-none flex-1"
                        >
                          Sfondo Trasparente Icona (Ottimo per PNG senza sfondo)
                        </label>
                      </div>

                      {/* TABS 1 SPECIAL TOKEN CODES */}
                      <div className="space-y-2 bg-slate-900/60 border border-cyan-950 p-3.5 rounded-xl">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            Codice Token Speciale (App/Funzione)
                          </label>
                          <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-1.5 py-0.5 rounded font-bold uppercase">
                            Opzionale
                          </span>
                        </div>
                        
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Inserisci un codice token speciale fornito per installare funzioni o mini-app interattive all'interno di questa icona!
                        </p>

                        <div className="relative mt-1">
                          <input
                            type="text"
                            value={appToken}
                            onChange={(e) => setAppToken(e.target.value.toUpperCase())}
                            placeholder="Inserisci Token (es: MOTIVA-METEO)..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                          />
                        </div>

                        {appToken === 'MOTIVA-METEO' ? (
                          <div className="space-y-3">
                            <div className="text-[10px] bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg text-emerald-300 flex flex-col gap-1">
                              <span className="font-bold flex items-center gap-1">✓ Token sbloccato correttamente!</span>
                              <span>Questa icona ora aprirà una speciale App di Meteo Motivazionale cruda con lo sfondo da te scelto.</span>
                            </div>

                            {/* Weather background customizer */}
                            <div className="space-y-2.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                                Personalizza Sfondo App Meteo
                              </span>
                              
                              {/* Text Input URL */}
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 uppercase font-bold">Link Immagine o Base64</label>
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={appWeatherBgUrl}
                                    onChange={(e) => setAppWeatherBgUrl(e.target.value)}
                                    placeholder="Incolla link immagine o lascia vuoto..."
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                  />
                                  {appWeatherBgUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setAppWeatherBgUrl('')}
                                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] rounded text-slate-400 font-bold transition-all"
                                    >
                                      Reset
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Quick selector from My Photos */}
                              {userPhotos.length > 0 && (
                                <div className="space-y-1 pt-1.5 border-t border-slate-800/50">
                                  <label className="text-[9px] text-slate-500 uppercase font-bold block">Oppure usa una delle tue foto</label>
                                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mt-1">
                                    {userPhotos.map((photo) => {
                                      const isSelected = appWeatherBgUrl === photo.url;
                                      return (
                                        <button
                                          key={photo.id}
                                          type="button"
                                          onClick={() => setAppWeatherBgUrl(photo.url)}
                                          className={`w-9 h-9 rounded overflow-hidden border-2 shrink-0 transition-all
                                            ${isSelected ? 'border-emerald-400 scale-95' : 'border-slate-800 hover:border-slate-600'}`}
                                        >
                                          <img src={photo.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Fit Mode Selector */}
                              <div className="space-y-1.5 pt-1.5 border-t border-slate-800/50">
                                <label className="text-[9px] text-slate-500 uppercase font-bold block">Adattamento Immagine (Fit)</label>
                                <div className="grid grid-cols-3 gap-1">
                                  {(['cover', 'contain', 'stretch'] as const).map((fit) => {
                                    const labels = { cover: 'Riempi', contain: 'Adatta', stretch: 'Allunga' };
                                    const isSelected = appWeatherBgFit === fit;
                                    return (
                                      <button
                                        key={fit}
                                        type="button"
                                        onClick={() => setAppWeatherBgFit(fit)}
                                        className={`py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/15'
                                            : 'bg-slate-950 text-slate-400 hover:bg-slate-900'
                                        }`}
                                      >
                                        {labels[fit]}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Overlay Opacity Slider */}
                              <div className="space-y-1 pt-1.5 border-t border-slate-800/50">
                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
                                  <span>Intensità Scurimento (Overlay)</span>
                                  <span className="text-cyan-400 font-mono">{appWeatherBgOverlayOpacity}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={appWeatherBgOverlayOpacity}
                                  onChange={(e) => setAppWeatherBgOverlayOpacity(parseInt(e.target.value))}
                                  className="w-full accent-cyan-500 cursor-pointer bg-slate-950 h-1.5 rounded-lg appearance-none"
                                />
                                <p className="text-[9px] text-slate-500">
                                  Riduci lo scurimento per far brillare lo sfondo; aumentalo per leggere meglio le scritte.
                                </p>
                              </div>

                              {/* Current Background Status / Preview */}
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Stato:</span>
                                {appWeatherBgUrl ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span className="text-[10px] text-emerald-400 font-bold">Sfondo Personalizzato Attivo</span>
                                    {appWeatherBgUrl.startsWith('data:image') && (
                                      <span className="text-[8px] text-slate-500">(Caricata)</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    <span className="text-[10px] text-amber-400 font-bold">Predefinito (https://imagetourl.cloud/3mcy8k95.jpg)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg text-slate-500 flex flex-col gap-2.5">
                            <span className="font-semibold text-slate-400">Token sblocco disponibili:</span>
                            <div className="border-b border-slate-800/50 pb-2">
                              <span className="font-mono text-cyan-400 select-all text-xs font-bold block mb-0.5">MOTIVA-METEO</span>
                              <span>Sblocca un'app meteo con frasi motivazionali crude, dirette e cariche di energia, con sfondo personalizzato.</span>
                            </div>
                            <div>
                              <span className="font-mono text-cyan-400 select-all text-xs font-bold block mb-0.5">728</span>
                              <span>Sblocca la <strong>Galleria Trappola Segreta</strong>: un'app galleria fotografica indipendente con i propri caricamenti, foto, preferiti e album completamente isolati dal rullino della fotocamera.</span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* 2X2 OR 4X2 WIDGET CONFIGURE */}
                  {(selectedItem.type === 'widget_small' || selectedItem.type === 'widget_medium') && (
                    <div className="space-y-4">
                      {/* Widget Title Label */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Etichetta Sotto Widget</label>
                        <input
                          type="text"
                          value={widgetTitle}
                          onChange={(e) => setWidgetTitle(e.target.value)}
                          placeholder="Inserisci etichetta (es: iScreen)..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Widget Style Type */}
                      {selectedItem.type === 'widget_small' ? (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Tipo Widget 2x2</label>
                          <select
                            value={widgetType}
                            onChange={(e) => setWidgetType(e.target.value as any)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="photo">Foto Personalizzata (iScreen)</option>
                            <option value="clock">Orologio / Ora Locale</option>
                            <option value="weather">Meteo (Roma)</option>
                            <option value="stocks">Borsa Azioni (AAPL)</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Tipo Widget 4x2</label>
                          <select
                            value={widgetType}
                            onChange={(e) => setWidgetType(e.target.value as any)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="polaroid">Album 3 Polaroid Polaroid-iScreen</option>
                          </select>
                        </div>
                      )}

                      {/* Photo Assignments based on Type */}
                      {widgetType === 'photo' && (
                        <div className="space-y-2.5 bg-slate-800/30 border border-slate-800 p-3 rounded-xl">
                          <p className="text-xs font-bold text-slate-300">Seleziona la foto da visualizzare</p>
                          
                          {userPhotos.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                              {userPhotos.map((photo) => {
                                const isSelected = widgetImages[0] === photo.url;
                                return (
                                  <button
                                    key={photo.id}
                                    onClick={() => setWidgetPhotoIndex(photo.url, 0)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                                      ${isSelected ? 'border-cyan-400 scale-95 shadow-md' : 'border-slate-800 hover:border-slate-600'}`}
                                  >
                                    <img src={photo.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">Nessuna foto disponibile. Vai sulla scheda "Le mie foto" per caricarne alcune!</p>
                          )}
                        </div>
                      )}

                      {widgetType === 'polaroid' && (
                        <div className="space-y-3.5 bg-slate-800/30 border border-slate-800 p-3 rounded-xl">
                          <p className="text-xs font-bold text-white flex items-center gap-1">
                            <Layers className="text-cyan-400" size={14} />
                            Configura Album 3 Polaroid
                          </p>

                          {/* Appearance Selector */}
                          <div className="space-y-1.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                            <label className="text-[10px] font-bold text-slate-400 block uppercase">Stile Layout Polaroid</label>
                            <div className="grid grid-cols-2 gap-1.5 mt-1">
                              <button
                                type="button"
                                onClick={() => setPolaroidFullPhoto(false)}
                                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all ${
                                  !polaroidFullPhoto
                                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 shadow-md shadow-cyan-950/30'
                                    : 'bg-slate-800/40 text-slate-400 border border-slate-800 hover:text-slate-300'
                                }`}
                              >
                                Cornice Bianca Classica
                              </button>
                              <button
                                type="button"
                                onClick={() => setPolaroidFullPhoto(true)}
                                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all ${
                                  polaroidFullPhoto
                                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 shadow-md shadow-cyan-950/30'
                                    : 'bg-slate-800/40 text-slate-400 border border-slate-800 hover:text-slate-300'
                                }`}
                              >
                                Foto Intera (Senza Cornice)
                              </button>
                            </div>
                          </div>

                          {/* Text under Photo controls */}
                          {!polaroidFullPhoto && (
                            <div className="space-y-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Scritte sotto le foto</label>
                                <button
                                  type="button"
                                  onClick={() => setPolaroidHideLabels(!polaroidHideLabels)}
                                  className={`text-[10px] px-2 py-0.5 rounded font-medium transition-all ${
                                    polaroidHideLabels 
                                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/30' 
                                      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/30'
                                  }`}
                                >
                                  {polaroidHideLabels ? 'Nessuna Scritta' : 'Scritte Attive'}
                                </button>
                              </div>

                              {!polaroidHideLabels && (
                                <div className="space-y-1.5 pt-1.5 border-t border-slate-800/60 mt-1.5">
                                  {[0, 1, 2].map((idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono text-slate-500 w-12 font-bold uppercase">Foto {idx + 1}:</span>
                                      <input
                                        type="text"
                                        maxLength={15}
                                        value={polaroidLabels[idx] !== undefined ? polaroidLabels[idx] : ''}
                                        onChange={(e) => {
                                          const updated = [...polaroidLabels];
                                          updated[idx] = e.target.value;
                                          setPolaroidLabels(updated);
                                        }}
                                        placeholder={`Testo foto ${idx + 1}`}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded py-1 px-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Seleziona Immagini Polaroid</label>
                            {[0, 1, 2].map((slotIndex) => {
                              const currentUrl = widgetImages[slotIndex];
                              return (
                                <div key={slotIndex} className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Slot {slotIndex + 1}</span>
                                  
                                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mt-1">
                                    {userPhotos.map((photo) => {
                                      const isSelected = currentUrl === photo.url;
                                      return (
                                        <button
                                          key={photo.id}
                                          type="button"
                                          onClick={() => setWidgetPhotoIndex(photo.url, slotIndex)}
                                          className={`w-9 h-9 rounded overflow-hidden border-2 shrink-0 transition-all
                                            ${isSelected ? 'border-cyan-400 scale-95' : 'border-slate-800 hover:border-slate-600'}`}
                                        >
                                          <img src={photo.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DYNAMIC PIXEL / SCALE RESIZING SLIDER */}
                  <div className="space-y-2.5 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Maximize className="text-cyan-400" size={14} />
                        Dimensioni Elemento (px)
                      </label>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/30">
                        {appCustomSize} px
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase select-none">Min</span>
                      <input
                        type="range"
                        min={selectedItem.type === 'app' ? 20 : (selectedItem.type === 'widget_small' ? 40 : 100)}
                        max={selectedItem.type === 'app' ? 200 : (selectedItem.type === 'widget_small' ? 300 : 500)}
                        value={appCustomSize}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setAppCustomSize(val);
                          
                          // Auto-update live preview in real-time
                          onUpdateItem({
                            ...selectedItem,
                            customSize: val
                          });
                        }}
                        className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="text-[10px] text-slate-500 font-bold uppercase select-none">Max</span>
                    </div>

                    <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
                      {selectedItem.type === 'app' 
                        ? "Modifica i pixel dell'icona (Default: 58px). Icone e scritte si scaleranno in tempo reale."
                        : "Modifica la scala del widget in tempo reale mantenendo intatte le proporzioni."
                      }
                    </p>
                  </div>

                  <hr className="border-slate-850" />

                  {showSaveSuccess && (
                    <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded-xl px-3 py-1.5 text-center text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-inner">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                      ✓ Modifiche salvate con successo!
                    </div>
                  )}

                  {/* Save changes button */}
                  <button
                    onClick={handleSaveItemChanges}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-cyan-500/20 active:scale-[0.99]"
                  >
                    Salva Modifiche Elemento
                  </button>
                </div>
              ) : (
                /* EMPTY CELL SELECTED - SHOW ADD OPTIONS */
                <div className="bg-slate-950/20 border border-slate-850 p-5 rounded-2xl space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mx-auto">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Spazio Vuoto Selezionato</h4>
                    <p className="text-xs text-slate-400 mt-1">Riga {selectedItem.row + 1}, Colonna {selectedItem.col + 1} {selectedItem.isDock ? ' (Nel Dock)' : ''}</p>
                  </div>

                  <p className="text-xs text-slate-400">
                    {selectedItem.isDock 
                      ? "Il dock inferiore dell'iPhone accetta solo icone di applicazioni standard."
                      : "Aggiungi una nuova applicazione trasparente, un widget iScreen piccolo oppure un widget Polaroid largo."
                    }
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => handleAddNewItem('app')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <AppWindow size={14} className="text-cyan-400" />
                      Aggiungi App Icon
                    </button>

                    {!selectedItem.isDock && (
                      <>
                        <button
                          onClick={() => handleAddNewItem('widget_small')}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <ImageIcon size={14} className="text-cyan-400" />
                          Aggiungi Widget iScreen 2x2
                        </button>

                        {/* Enable Medium Widget only if there is sufficient space */}
                        {selectedItem.col === 0 ? (
                          <button
                            onClick={() => handleAddNewItem('widget_medium')}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <Layers size={14} className="text-cyan-400" />
                            Aggiungi Widget Polaroid 4x2
                          </button>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">
                            *I widget Polaroid 4x2 richiedono di essere piazzati nella colonna 1 (sinistra) per estendersi correttamente.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            ) : (
              /* NO SELECTION HEADER */
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-850 rounded-2xl bg-slate-950/10">
                <ImageIcon className="mx-auto text-slate-600 mb-2.5" size={28} />
                <p className="text-sm font-semibold text-slate-400">Nessun elemento selezionato</p>
                <p className="text-xs text-slate-500 mt-1">
                  {isEditMode 
                    ? "Clicca su qualsiasi applicazione o spazio tratteggiato nel telefono per personalizzarlo!" 
                    : "Attiva l'Edit Mode in alto per sbloccare la modifica e la creazione della schermata!"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BACKGROUND OPTIONS */}
        {activeTab === 'background' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Upload Wallpaper via File chooser */}
            <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Upload className="text-cyan-400" size={14} />
                Carica Sfondo Personalizzato dal Dispositivo
              </label>
              
              <button
                onClick={() => bgFileInputRef.current?.click()}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl py-2 px-3 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon size={14} className="text-cyan-400 animate-pulse" />
                Scegli File Immagine Sfondo
              </button>
              <input
                type="file"
                ref={bgFileInputRef}
                onChange={handleBackgroundUpload}
                accept="image/*"
                className="hidden"
              />
              <p className="text-[10px] text-slate-500">Seleziona una foto dal tuo computer o smartphone per cambiare all'istante lo sfondo dell'iPhone.</p>
            </div>

            {/* Input direct URL background */}
            <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Link2 className="text-cyan-400" size={14} />
                Imposta Sfondo tramite URL Web
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bgInput}
                  onChange={(e) => {
                    setBgInput(e.target.value);
                    onUpdateBackground(e.target.value);
                  }}
                  placeholder="Incolla l'URL dello sfondo..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Preset Consigliati</label>
              
              <div className="grid grid-cols-2 gap-3">
                {backgroundPresets.map((preset) => {
                  const isCurrent = backgroundUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setBgInput(preset.url);
                        onUpdateBackground(preset.url);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-[9/16] h-[130px] w-full border-2 transition-all group flex flex-col justify-end p-2 text-left
                        ${isCurrent ? 'border-cyan-400 scale-[0.98]' : 'border-slate-800 hover:border-slate-600'}`}
                    >
                      <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="text-[10px] font-bold text-white relative truncate w-full drop-shadow">
                        {preset.name}
                      </span>
                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 bg-cyan-500 text-white p-0.5 rounded-full text-[8px] font-bold px-1.5 shadow">
                          ATTIVO
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USER PHOTOS LIBRARY */}
        {activeTab === 'photos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Upload or Link Photo Box */}
            <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl space-y-4">
              <h4 className="text-white font-bold text-xs flex items-center gap-1">
                <FileImage className="text-cyan-400" size={14} />
                Aggiungi Foto alla Libreria
              </h4>

              {/* Upload button */}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={14} className="text-cyan-400" />
                  Carica File Immagine
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase">Oppure tramite link</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* URL field */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Incolla URL della foto..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAddPhotoFromUrl}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-3 rounded-lg text-xs transition-all"
                >
                  Carica
                </button>
              </div>
            </div>

            {/* Photos List Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Libreria Immagini</label>
              
              <div className="grid grid-cols-3 gap-2.5">
                {userPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group/photo relative aspect-square bg-slate-800/40 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center hover:border-slate-600 transition-all"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.name} 
                      className="w-full h-full object-cover group-hover/photo:scale-105 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover delete overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-all flex items-center justify-center">
                      <button
                        onClick={() => onDeleteUserPhoto(photo.id)}
                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-transform hover:scale-110 shadow-lg"
                        title="Rimuovi foto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[8px] py-0.5 px-1 truncate text-center">
                      {photo.name}
                    </div>
                  </div>
                ))}

                {userPhotos.length === 0 && (
                  <div className="col-span-3 py-10 text-center text-xs text-slate-500 italic">
                    Nessuna foto salvata. Carica o linka delle immagini sopra!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Persistent Information / Guideline bottom bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={13} />
          <span>Trascina gli elementi per riordinarli e personalizzarli</span>
        </div>
        <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider">v2.0 PRO</span>
      </div>

      {/* Dynamically shown Icon Picker */}
      {showIconPicker && (
        <IconPicker
          currentIcon={appIconName}
          onSelectIcon={(icon) => setAppIconName(icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}

    </div>
  );
}
