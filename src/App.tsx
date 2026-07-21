import React, { useState, useEffect } from 'react';
import { GridItem, BackgroundPreset, UserPhoto } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { EditorPanel } from './components/EditorPanel';
import { generateOfflineHtml } from './utils/exportTemplate';
import { getItem, setItem } from './utils/db';
import { 
  DEFAULT_BG_PRESETS, 
  DEFAULT_USER_PHOTOS, 
  INITIAL_GRID_ITEMS, 
  INITIAL_DOCK_ITEMS 
} from './defaultConfig';
import { 
  Sparkles, 
  Smartphone, 
  Heart, 
  Settings2, 
  HelpCircle,
  Eye,
  Camera,
  X,
  Volume2,
  Minimize2,
  Download,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';

export default function App() {
  const [backgroundUrl, setBackgroundUrl] = useState<string>(DEFAULT_BG_PRESETS[0].url);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedHtml, setExportedHtml] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>(DEFAULT_USER_PHOTOS);
  const [gridItems, setGridItems] = useState<GridItem[]>(INITIAL_GRID_ITEMS);
  const [dockItems, setDockItems] = useState<GridItem[]>(INITIAL_DOCK_ITEMS);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // NEW STATES FOR FULLSCREEN & PAGINATION
  const [isFullscreenDisplay, setIsFullscreenDisplay] = useState<boolean>(false);
  const [alwaysFullscreen, setAlwaysFullscreen] = useState<boolean>(false);

  // Initialize alwaysFullscreen from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('iscreen_always_fullscreen');
    if (saved === 'true') {
      setAlwaysFullscreen(true);
      setIsFullscreenDisplay(true);
      setIsEditMode(false);
    }
  }, []);

  // Global event listener to trigger actual HTML fullscreen on any user gesture if alwaysFullscreen is enabled
  useEffect(() => {
    if (!alwaysFullscreen) return;

    const handleUserGesture = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .then(() => {
            console.log("HTML Fullscreen requested successfully via user gesture.");
          })
          .catch((err) => {
            console.warn("Could not enter HTML Fullscreen: might be blocked inside an iframe.", err);
          });
      }
    };

    window.addEventListener('click', handleUserGesture, { capture: true });
    window.addEventListener('touchstart', handleUserGesture, { capture: true });

    // Try immediately
    handleUserGesture();

    return () => {
      window.removeEventListener('click', handleUserGesture, { capture: true });
      window.removeEventListener('touchstart', handleUserGesture, { capture: true });
    };
  }, [alwaysFullscreen]);

  const [activePage, setActivePage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(2);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedEmptyCell, setSelectedEmptyCell] = useState<{ row: number; col: number; isDock: boolean } | null>(null);

  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    async function loadSavedData() {
      try {
        const bg = await getItem<string>('ios_custom_background', DEFAULT_BG_PRESETS[0].url);
        setBackgroundUrl(bg);

        const photos = await getItem<UserPhoto[]>('ios_custom_photos', DEFAULT_USER_PHOTOS);
        setUserPhotos(photos);

        const items = await getItem<GridItem[]>('ios_custom_grid_items', INITIAL_GRID_ITEMS);
        setGridItems(items);

        const dock = await getItem<GridItem[]>('ios_custom_dock_items', INITIAL_DOCK_ITEMS);
        setDockItems(dock);

        const edit = await getItem<boolean>('ios_custom_edit_mode', false);
        setIsEditMode(edit);

        const pages = await getItem<number>('ios_custom_total_pages', 2);
        setTotalPages(pages);
      } catch (err) {
        console.error('Error loading custom iScreen data from DB:', err);
      } finally {
        setIsDbLoaded(true);
      }
    }
    loadSavedData();
  }, []);

  // Persistence hooks using IndexedDB
  useEffect(() => {
    if (!isDbLoaded) return;
    setItem('ios_custom_background', backgroundUrl);
  }, [backgroundUrl, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setItem('ios_custom_photos', userPhotos);
  }, [userPhotos, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setItem('ios_custom_grid_items', gridItems);
  }, [gridItems, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setItem('ios_custom_dock_items', dockItems);
  }, [dockItems, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setItem('ios_custom_edit_mode', isEditMode);
  }, [isEditMode, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setItem('ios_custom_total_pages', totalPages);
  }, [totalPages, isDbLoaded]);

  // Handle click selection on phone simulator elements
  const handleSelectItem = (
    item: GridItem | { type: 'empty'; row: number; col: number; isDock: boolean }
  ) => {
    if (isFullscreenDisplay) return; // Prevent editing in Fullscreen simulator display

    // Turn edit mode ON on selection automatically
    if (!isEditMode) {
      setIsEditMode(true);
    }

    if ('id' in item) {
      setSelectedItemId(item.id);
      setSelectedEmptyCell(null);
    } else {
      setSelectedItemId(null);
      setSelectedEmptyCell({ row: item.row, col: item.col, isDock: item.isDock });
    }
  };

  // Update a grid or dock item with new changes
  const handleUpdateItem = (updated: GridItem) => {
    if (updated.row === 99) {
      setDockItems(dockItems.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      setGridItems(gridItems.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  // Delete an icon or widget
  const handleDeleteItem = (id: string) => {
    setGridItems(gridItems.filter((item) => item.id !== id));
    setDockItems(dockItems.filter((item) => item.id !== id));
    setSelectedItemId(null);
  };

  // Add a new icon or widget to the ACTIVE PAGE
  const handleAddItem = (item: GridItem) => {
    if (item.row === 99) {
      if (dockItems.length >= 4) {
        alert('Il dock dell\'iPhone può contenere al massimo 4 applicazioni.');
        return;
      }
      setDockItems([...dockItems, item]);
    } else {
      // Pin item to current page!
      const itemWithPage = { ...item, page: activePage };
      setGridItems([...gridItems, itemWithPage]);
    }
    setSelectedItemId(item.id);
    setSelectedEmptyCell(null);
  };

  // Add a new screen page
  const handleAddPage = () => {
    setTotalPages((prev) => prev + 1);
    setActivePage(totalPages); // Instantly swipe to newly created page
  };

  // Delete current page and shift items
  const handleDeletePage = (pageIndexToDelete: number) => {
    if (totalPages <= 1) return;
    
    // Remove all grid items on the deleted page
    const updatedGridItems = gridItems
      .filter((item) => (item.page || 0) !== pageIndexToDelete)
      // Decrement page numbers for all subsequent pages to prevent array indexing gaps
      .map((item) => {
        const itemPage = item.page || 0;
        if (itemPage > pageIndexToDelete) {
          return { ...item, page: itemPage - 1 };
        }
        return item;
      });

    setGridItems(updatedGridItems);
    setTotalPages((prev) => Math.max(1, prev - 1));
    setActivePage((prev) => Math.max(0, Math.min(prev, totalPages - 2)));
    setSelectedItemId(null);
    setSelectedEmptyCell(null);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Sei sicuro di voler ripristinare il layout iniziale dell\'iPhone? Tutti i tuoi elementi personalizzati andranno persi.')) {
      setGridItems(INITIAL_GRID_ITEMS);
      setDockItems(INITIAL_DOCK_ITEMS);
      setBackgroundUrl(DEFAULT_BG_PRESETS[0].url);
      setUserPhotos(DEFAULT_USER_PHOTOS);
      setSelectedItemId(null);
      setSelectedEmptyCell(null);
      setTotalPages(2);
      setActivePage(0);
      setIsEditMode(true);
      setIsFullscreenDisplay(false);
    }
  };

  // User Photos management
  const handleAddUserPhoto = (photo: UserPhoto) => {
    setUserPhotos([photo, ...userPhotos]);
  };

  const handleDeleteUserPhoto = (id: string) => {
    setUserPhotos(userPhotos.filter((p) => p.id !== id));
  };

  // Pack item helper for editor selection
  const getSelectedData = () => {
    if (selectedItemId) {
      const gridMatch = gridItems.find((i) => i.id === selectedItemId);
      if (gridMatch) return gridMatch;
      const dockMatch = dockItems.find((i) => i.id === selectedItemId);
      if (dockMatch) return dockMatch;
    }
    if (selectedEmptyCell) {
      return { type: 'empty', ...selectedEmptyCell };
    }
    return null;
  };

  // Fullscreen toggle: Tapping it locks/unlocks the editor sidebar
  const handleToggleFullscreenDisplay = () => {
    const nextState = !isFullscreenDisplay;
    setIsFullscreenDisplay(nextState);
    if (nextState) {
      setIsEditMode(false); // Disable layout edits while on fullscreen
    } else {
      setIsEditMode(true);
    }
  };

  // Toggle the Always Fullscreen Mode
  const handleToggleAlwaysFullscreen = () => {
    const nextState = !alwaysFullscreen;
    setAlwaysFullscreen(nextState);
    localStorage.setItem('iscreen_always_fullscreen', nextState ? 'true' : 'false');
    
    if (nextState) {
      setIsFullscreenDisplay(true);
      setIsEditMode(false);
      
      // Request HTML fullscreen immediately on this click gesture
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .then(() => {
            alert("Schermo intero automatico ATTIVATO!\nOgni volta che entrerai nell'app sarai a schermo intero.\n\nPer disattivare questa modalità, clicca 5 volte l'orario in alto sul telefono.");
          })
          .catch(() => {
            alert("Schermo intero automatico ATTIVATO!\n\nNota: Se sei all'interno dell'anteprima di AI Studio, apri il sito in una Nuova Scheda (in alto a destra) per sbloccare la modalità immersiva completa di HTML.\n\nPer disattivare questa modalità, clicca 5 volte l'orario in alto sul telefono.");
          });
      }
    } else {
      setIsFullscreenDisplay(false);
      setIsEditMode(true);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      alert("Schermo intero automatico DISATTIVATO.");
    }
  };

  // Exit function triggered by clicking clock 5 times in PhoneSimulator
  const handleExitAlwaysFullscreen = () => {
    setAlwaysFullscreen(false);
    localStorage.setItem('iscreen_always_fullscreen', 'false');
    setIsFullscreenDisplay(false);
    setIsEditMode(true);
    
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    alert("Modalità schermo intero permanente DISATTIVATA con successo!");
  };

  // Export fully client-side single HTML application file download
  const handleExportOfflineHtml = async () => {
    setIsExporting(true);
    setExportedHtml(null);
    setIsCopied(false);
    try {
      const fetchAsDataUri = async (url: string): Promise<string> => {
        if (!url) return '';
        if (url.startsWith('data:') || url.startsWith('preset:')) {
          return url;
        }
        try {
          const res = await fetch(url, { mode: 'cors' });
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          const blob = await res.blob();
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn(`Could not convert url to Data URI: ${url}`, error);
          return url; // fallback to original URL
        }
      };

      // 1. Convert background
      const base64Bg = await fetchAsDataUri(backgroundUrl);

      // 2. Convert grid items
      const processedGrid = await Promise.all(gridItems.map(async (item) => {
        const newItem = { ...item };
        if (newItem.iconName === 'custom' && newItem.iconUrl) {
          newItem.iconUrl = await fetchAsDataUri(newItem.iconUrl);
        }
        if (newItem.images && newItem.images.length > 0) {
          newItem.images = await Promise.all(newItem.images.map(img => fetchAsDataUri(img)));
        }
        if (newItem.audioUrl && newItem.audioUrl.startsWith('db:audio_')) {
          const saved = await getItem<string | null>(newItem.audioUrl, null);
          if (saved) {
            newItem.audioUrl = saved;
          }
        } else if (newItem.audioUrl && !newItem.audioUrl.startsWith('preset:')) {
          newItem.audioUrl = await fetchAsDataUri(newItem.audioUrl);
        }
        if (newItem.weatherBgUrl) {
          newItem.weatherBgUrl = await fetchAsDataUri(newItem.weatherBgUrl);
        }
        return newItem;
      }));

      // 3. Convert dock items
      const processedDock = await Promise.all(dockItems.map(async (item) => {
        const newItem = { ...item };
        if (newItem.iconName === 'custom' && newItem.iconUrl) {
          newItem.iconUrl = await fetchAsDataUri(newItem.iconUrl);
        }
        if (newItem.audioUrl && newItem.audioUrl.startsWith('db:audio_')) {
          const saved = await getItem<string | null>(newItem.audioUrl, null);
          if (saved) {
            newItem.audioUrl = saved;
          }
        } else if (newItem.audioUrl && !newItem.audioUrl.startsWith('preset:')) {
          newItem.audioUrl = await fetchAsDataUri(newItem.audioUrl);
        }
        if (newItem.weatherBgUrl) {
          newItem.weatherBgUrl = await fetchAsDataUri(newItem.weatherBgUrl);
        }
        return newItem;
      }));

      const gridItemsJson = JSON.stringify(processedGrid).replace(/</g, '\\u003c');
      const dockItemsJson = JSON.stringify(processedDock).replace(/</g, '\\u003c');
      const backgroundUrlEscaped = base64Bg.replace(/"/g, '&quot;');
      
      const htmlContent = generateOfflineHtml(
        gridItemsJson,
        dockItemsJson,
        totalPages,
        backgroundUrlEscaped
      );
      // Cleaned up dummyUnusedHtml to avoid file bloat



    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = 'iphone_iscreen_offline.html';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 8000);

    setExportedHtml(htmlContent);
    } catch (err) {
      console.error("Export offline app failed:", err);
      alert("Errore durante l'esportazione: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  // Import configuration from exported offline HTML file
  const handleImportConfigHtml = async (file: File) => {
    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

      // Match the backup data inside the script tag
      const match = text.match(/<script id="iscreen-import-data" type="application\/json">([\s\S]*?)<\/script>/);
      if (!match) {
        throw new Error("Il file caricato non sembra essere un file HTML valido di iPhone iScreen Maker contenente dati di configurazione compatibili.");
      }

      const jsonStr = match[1].trim();
      const parsed = JSON.parse(jsonStr);

      if (!parsed.gridItems || !parsed.dockItems) {
        throw new Error("I dati di configurazione estratti non sono completi o sono corrotti.");
      }

      // Restore elements & background
      setGridItems(parsed.gridItems);
      setDockItems(parsed.dockItems);
      
      if (parsed.backgroundUrl) {
        setBackgroundUrl(parsed.backgroundUrl);
      }
      if (typeof parsed.totalPages === 'number') {
        setTotalPages(parsed.totalPages);
      }

      // Extract custom photos embedded inside the configuration so they populate the editor's My Photos palette
      const collectedPhotos: UserPhoto[] = [];
      const addPhotoIfBase64 = (url?: string) => {
        if (url && url.startsWith('data:image')) {
          if (!collectedPhotos.some(p => p.url === url) && !userPhotos.some(p => p.url === url)) {
            collectedPhotos.push({
              id: 'imported_' + Math.random().toString(36).substring(2, 9),
              name: `Importata ${collectedPhotos.length + 1}`,
              url: url
            });
          }
        }
      };

      // Extract background if it is custom
      addPhotoIfBase64(parsed.backgroundUrl);

      // Extract from grid items
      parsed.gridItems.forEach((item: any) => {
        if (item.iconName === 'custom' && item.iconUrl) {
          addPhotoIfBase64(item.iconUrl);
        }
        if (item.images && Array.isArray(item.images)) {
          item.images.forEach((img: string) => addPhotoIfBase64(img));
        }
        if (item.weatherBgUrl) {
          addPhotoIfBase64(item.weatherBgUrl);
        }
      });

      // Extract from dock items
      parsed.dockItems.forEach((item: any) => {
        if (item.iconName === 'custom' && item.iconUrl) {
          addPhotoIfBase64(item.iconUrl);
        }
        if (item.weatherBgUrl) {
          addPhotoIfBase64(item.weatherBgUrl);
        }
      });

      if (collectedPhotos.length > 0) {
        setUserPhotos(prev => [...collectedPhotos, ...prev]);
      }

      setSelectedItemId(null);
      setSelectedEmptyCell(null);
      setActivePage(0);
      setIsEditMode(true);

      alert("Configurazione caricata con successo! Tutte le tue app, widget polaroid personalizzate e sfondi sono stati ripristinati.");
    } catch (err) {
      console.error("Import failed:", err);
      alert("Errore durante l'importazione: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Dynamic compiler progress overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center gap-4 text-center p-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          <h3 className="text-xl font-bold text-white tracking-tight">Compilazione iScreen in corso...</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Stiamo scaricando e convertendo tutte le tue icone personalizzate, immagini Polaroid, sfondi e canzoni in un unico file offline super ottimizzato.
          </p>
          <span className="text-xs text-cyan-400 font-mono animate-pulse uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-full mt-2">
            Attendere prego...
          </span>
        </div>
      )}
      
      {/* Decorative ambient blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Primary Header: Hidden in Fullscreen view to make the app look like an actual phone on full view */}
      {!isFullscreenDisplay && (
        <header className="w-full border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 z-40 relative flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Smartphone size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">iPhone iScreen Maker</h1>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/50 border border-cyan-800/55 px-1.5 py-0.5 rounded-full">v2.0 PRO</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Disegna e personalizza la tua homescreen iOS con widget Polaroid, suoni e trasparenze</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="bg-slate-900 border border-slate-800/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-slate-300">
              <span>Made with</span>
              <Heart size={12} className="text-red-500 fill-red-500 animate-bounce" />
            </div>
          </div>
        </header>
      )}

      {/* Main Grid Playground Layout */}
      <main className={`flex-1 w-full max-w-6xl mx-auto px-4 flex z-20 relative items-center justify-center
        ${isFullscreenDisplay 
          ? 'py-4 min-h-screen' 
          : 'py-8 flex-col md:flex-row gap-8 md:gap-12'
        }`}
      >
        
        {/* Left Side: iPhone Simulator mockup wrapper */}
        <div 
          className={`flex flex-col items-center gap-4 shrink-0 transition-all duration-500
            ${isFullscreenDisplay 
              ? 'fixed inset-0 z-40 bg-black/95 justify-center' 
              : ''
            }`}
        >
          
          {/* Mode Indicator banner */}
          {!isFullscreenDisplay && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-full text-xs font-medium backdrop-blur-sm shadow-md">
              {isEditMode ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-cyan-300">Edit Mode attiva: Clicca le app o gli spazi vuoti!</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400">Modalità Anteprima. Clicca un'icona per ascoltare il suono!</span>
                </>
              )}
            </div>
          )}

          <PhoneSimulator
            gridItems={gridItems}
            dockItems={dockItems}
            backgroundUrl={backgroundUrl}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
            isEditMode={isEditMode}
            activePage={activePage}
            setActivePage={setActivePage}
            totalPages={totalPages}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            isFullscreenDisplay={isFullscreenDisplay}
            onToggleFullscreenDisplay={handleToggleFullscreenDisplay}
            alwaysFullscreen={alwaysFullscreen}
            onExitAlwaysFullscreen={handleExitAlwaysFullscreen}
          />

          {!isFullscreenDisplay && (
            <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
              iPhone Simulator Mockup (Pagina {activePage + 1} di {totalPages})
            </span>
          )}
        </div>

        {/* Right Side: Configuration Sidebar - Hidden completely in Fullscreen Display mode */}
        {!isFullscreenDisplay && (
          <div className="w-full flex justify-center md:justify-start">
            <EditorPanel
              gridItems={gridItems}
              dockItems={dockItems}
              selectedItem={getSelectedData()}
              backgroundUrl={backgroundUrl}
              userPhotos={userPhotos}
              backgroundPresets={DEFAULT_BG_PRESETS}
              isEditMode={isEditMode}
              onUpdateBackground={setBackgroundUrl}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onAddUserPhoto={handleAddUserPhoto}
              onDeleteUserPhoto={handleDeleteUserPhoto}
              onResetToDefault={handleResetToDefault}
              onToggleEditMode={() => setIsEditMode(!isEditMode)}
              isFullscreenDisplay={isFullscreenDisplay}
              onToggleFullscreenDisplay={handleToggleFullscreenDisplay}
              onExportOfflineHtml={handleExportOfflineHtml}
              isExporting={isExporting}
              onImportConfigHtml={handleImportConfigHtml}
              alwaysFullscreen={alwaysFullscreen}
              onToggleAlwaysFullscreen={handleToggleAlwaysFullscreen}
            />
          </div>
        )}

      </main>

      {/* Aesthetic Footer - Hidden in Fullscreen Display mode */}
      {!isFullscreenDisplay && (
        <footer className="w-full border-t border-slate-900 bg-slate-950/50 py-3 text-center text-[10px] text-slate-500 z-40 relative flex flex-col sm:flex-row justify-between items-center px-6 gap-2">
          <p>© 2026 iScreen Premium iOS Customizer. Scegli, personalizza e posiziona le tue foto preferite.</p>
          <p className="flex items-center gap-1">
            <Sparkles size={11} className="text-cyan-500" />
            Progettato su misura in base alla tua foto e alle tue richieste.
          </p>
        </footer>
      )}

    </div>
  );
}
