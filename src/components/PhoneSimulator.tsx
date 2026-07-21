import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from './LucideIcon';
import { GridItem } from '../types';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Plus, 
  Trash2, 
  Edit2,
  Edit3, 
  Sun, 
  CloudSun,
  TrendingUp,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  Flame,
  Zap,
  Thermometer,
  Wind,
  RotateCw,
  ArrowLeft,
  Camera,
  Moon,
  Video,
  Grid3X3,
  SlidersHorizontal,
  Pencil,
  Check,
  Folder,
  FolderPlus,
  Heart,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Music
} from 'lucide-react';
import { getItem, setItem } from '../utils/db';

interface PhoneSimulatorProps {
  gridItems: GridItem[];
  dockItems: GridItem[];
  backgroundUrl: string;
  selectedItemId: string | null;
  onSelectItem: (item: GridItem | { type: 'empty'; row: number; col: number; isDock: boolean }) => void;
  isEditMode: boolean;
  activePage: number;
  setActivePage: (p: number) => void;
  totalPages: number;
  onAddPage: () => void;
  onDeletePage: (pageIndex: number) => void;
  isFullscreenDisplay: boolean;
  onToggleFullscreenDisplay?: () => void;
  alwaysFullscreen?: boolean;
  onExitAlwaysFullscreen?: () => void;
}

export function PhoneSimulator({
  gridItems,
  dockItems,
  backgroundUrl,
  selectedItemId,
  onSelectItem,
  isEditMode,
  activePage,
  setActivePage,
  totalPages,
  onAddPage,
  onDeletePage,
  isFullscreenDisplay,
  onToggleFullscreenDisplay,
  alwaysFullscreen,
  onExitAlwaysFullscreen
}: PhoneSimulatorProps) {
  const [currentTime, setCurrentTime] = useState('23:19');
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [activeAppToken, setActiveAppToken] = useState<GridItem | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [pageDirection, setPageDirection] = useState<number>(1);
  const prevPageRef = React.useRef<number>(activePage);

  useEffect(() => {
    if (activePage !== prevPageRef.current) {
      if (activePage > prevPageRef.current) {
        setPageDirection(1);
      } else {
        setPageDirection(-1);
      }
      prevPageRef.current = activePage;
    }
  }, [activePage]);

  const [motivationalIndex, setMotivationalIndex] = useState(0);

  // States and handler for exit always-fullscreen on clock 5x click
  const [clockClickCount, setClockClickCount] = useState<number>(0);
  const clockClickTimerRef = React.useRef<any>(null);

  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFullscreenDisplay) {
      if (onToggleFullscreenDisplay) {
        onToggleFullscreenDisplay();
      }
      try {
        playAudio('preset:digital', 0);
      } catch (err) {}
      return;
    }

    const nextCount = clockClickCount + 1;
    if (nextCount >= 5) {
      setClockClickCount(0);
      if (onExitAlwaysFullscreen) {
        onExitAlwaysFullscreen();
      }
    } else {
      setClockClickCount(nextCount);
      
      if (clockClickTimerRef.current) {
        clearTimeout(clockClickTimerRef.current);
      }
      
      clockClickTimerRef.current = setTimeout(() => {
        setClockClickCount(0);
      }, 3000);
    }

    try {
      playAudio('preset:digital', 0);
    } catch (err) {}
  };

  React.useEffect(() => {
    return () => {
      if (clockClickTimerRef.current) {
        clearTimeout(clockClickTimerRef.current);
      }
    };
  }, []);

  // Camera App State Variables
  const [cameraZoom, setCameraZoom] = useState<'0.5x' | '1x' | '2x' | '5x'>('1x');
  const [cameraMode, setCameraMode] = useState<'NIGHT' | 'VIDEO' | 'FOTO' | 'RITRATTO' | 'PANORAMICA'>('FOTO');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isNightModeOn, setIsNightModeOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isCameraFront, setIsCameraFront] = useState(false);
  const [isCameraGridOn, setIsCameraGridOn] = useState(false);
  const [cameraExposure, setCameraExposure] = useState(0);
  const [cameraFilter, setCameraFilter] = useState<'normal' | 'mono' | 'warm' | 'cool' | 'dramatic'>('normal');
  const [cameraShutterFlash, setCameraShutterFlash] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Standalone hidden Galleria App States (Token: 728)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("galleryPhotos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [
      "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560707303-4e980c876ad2?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
    ];
  });

  const [galleryAlbums, setGalleryAlbums] = useState<{ id: string; name: string; photos: string[] }[]>(() => {
    try {
      const saved = localStorage.getItem("galleryAlbums");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "all", name: "Libreria Galleria", photos: [] },
      { id: "favorites", name: "Preferiti Galleria", photos: [] }
    ];
  });

  const [selectedGalleryAlbumId, setSelectedGalleryAlbumId] = useState<string>("all");

  const [galleryMirroredPhotos, setGalleryMirroredPhotos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("galleryMirroredPhotos");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [isGallerySelectMode, setIsGallerySelectMode] = useState(false);
  const [selectedGalleryPhotoIndexes, setSelectedGalleryPhotoIndexes] = useState<number[]>([]);
  const [lastSelectedGalleryIndex, setLastSelectedGalleryIndex] = useState<number | null>(null);
  const [showCreateGalleryAlbumModal, setShowCreateGalleryAlbumModal] = useState(false);
  const [newGalleryAlbumName, setNewGalleryAlbumName] = useState("");
  const [showAddToGalleryAlbumModal, setShowAddToGalleryAlbumModal] = useState(false);
  const [fullscreenGalleryPhotoIndex, setFullscreenGalleryPhotoIndex] = useState<number | null>(null);
  const [showGalleryAlbumsManager, setShowGalleryAlbumsManager] = useState(false);
  const [renamingGalleryAlbumId, setRenamingGalleryAlbumId] = useState<string | null>(null);
  const [renamingGalleryAlbumName, setRenamingGalleryAlbumName] = useState("");
  const [deletingCameraAlbumId, setDeletingCameraAlbumId] = useState<string | null>(null);
  const [deletingGalleryAlbumId, setDeletingGalleryAlbumId] = useState<string | null>(null);

  // Initialize camera photos list with beautiful default images, loading from localStorage if present
  const [cameraPhotos, setCameraPhotos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cameraPhotos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80"
    ];
  });

  // Camera swipe/viewer index within the main viewfinder view:
  // null means showing the LIVE viewfinder (initial state / live camera).
  // 0 means showing the most recent cameraPhotos[0].
  // 1 means cameraPhotos[1], and so on.
  const [viewfinderPhotoIndex, setViewfinderPhotoIndex] = useState<number | null>(null);

  // Home screen swipe/drag navigation for paginated pages
  const homeSwipeStartXRef = React.useRef<number | null>(null);

  const handleHomeTouchStart = (e: React.TouchEvent) => {
    if (activeAppToken) return;
    homeSwipeStartXRef.current = e.touches[0].clientX;
  };

  const handleHomeTouchEnd = (e: React.TouchEvent) => {
    if (homeSwipeStartXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - homeSwipeStartXRef.current;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        if (activePage > 0) {
          setActivePage(activePage - 1);
          playAudio('preset:digital', 0);
        }
      } else {
        if (activePage < totalPages - 1) {
          setActivePage(activePage + 1);
          playAudio('preset:digital', 0);
        }
      }
    }
    homeSwipeStartXRef.current = null;
  };

  const handleHomeMouseDown = (e: React.MouseEvent) => {
    if (activeAppToken) return;
    homeSwipeStartXRef.current = e.clientX;
  };

  const handleHomeMouseUp = (e: React.MouseEvent) => {
    if (homeSwipeStartXRef.current === null) return;
    const endX = e.clientX;
    const diffX = endX - homeSwipeStartXRef.current;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        if (activePage > 0) {
          setActivePage(activePage - 1);
          playAudio('preset:digital', 0);
        }
      } else {
        if (activePage < totalPages - 1) {
          setActivePage(activePage + 1);
          playAudio('preset:digital', 0);
        }
      }
    }
    homeSwipeStartXRef.current = null;
  };

  // Swipe start ref for tracking touch and mouse drag gestures
  const swipeStartXRef = React.useRef<number | null>(null);

  const navigateViewfinder = (direction: 'left' | 'right') => {
    if (cameraPhotos.length === 0) return;
    
    if (direction === 'left') {
      // Swiping/switching left goes "back" (older photos, incrementing the index)
      setViewfinderPhotoIndex((prev) => {
        if (prev === null) {
          playAudio('preset:digital', 0);
          return 0; // Show newest photo
        }
        if (prev < cameraPhotos.length - 1) {
          playAudio('preset:digital', 0);
          return prev + 1; // Go to older photo
        }
        return prev; // At the oldest photo, can't go further left
      });
    } else {
      // Swiping/switching right goes "forward" (newer photos, decrementing the index towards Live view)
      setViewfinderPhotoIndex((prev) => {
        if (prev === null) return null; // Already at live view
        if (prev === 0) {
          playAudio('preset:digital', 0);
          return null; // Go back to Live viewfinder!
        }
        playAudio('preset:digital', 0);
        return prev - 1; // Go to newer photo
      });
    }
  };

  const handleTouchStartSwipe = (e: React.TouchEvent) => {
    swipeStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEndSwipe = (e: React.TouchEvent) => {
    if (swipeStartXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - swipeStartXRef.current;
    const threshold = 35; // minimum 35px drag
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Drag right -> Swipe right (goes forward/newer, towards Live view)
        navigateViewfinder('right');
      } else {
        // Drag left -> Swipe left (goes back/older, into the cameraPhotos)
        navigateViewfinder('left');
      }
    }
    swipeStartXRef.current = null;
  };

  const handleMouseDownSwipe = (e: React.MouseEvent) => {
    swipeStartXRef.current = e.clientX;
  };

  const handleMouseUpSwipe = (e: React.MouseEvent) => {
    if (swipeStartXRef.current === null) return;
    const endX = e.clientX;
    const diffX = endX - swipeStartXRef.current;
    const threshold = 35; // minimum 35px drag
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        navigateViewfinder('right');
      } else {
        navigateViewfinder('left');
      }
    }
    swipeStartXRef.current = null;
  };

  // Albums state
  const [albums, setAlbums] = useState<{ id: string; name: string; photos: string[] }[]>(() => {
    try {
      const saved = localStorage.getItem("cameraAlbums");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "all", name: "Tutte le foto", photos: [] },
      { id: "favorites", name: "Preferiti", photos: [] }
    ];
  });

  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("all");

  // Mirrored photos list state
  const [mirroredPhotos, setMirroredPhotos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("mirroredPhotos");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [newAlbumName, setNewAlbumName] = useState("");
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [showAddToAlbumModal, setShowAddToAlbumModal] = useState(false);
  const [showCameraAlbumsManager, setShowCameraAlbumsManager] = useState(false);
  const [renamingCameraAlbumId, setRenamingCameraAlbumId] = useState<string | null>(null);
  const [renamingCameraAlbumName, setRenamingCameraAlbumName] = useState("");

  // Filtered photos based on selected album
  const displayedPhotos = useMemo(() => {
    if (selectedAlbumId === "all") {
      return cameraPhotos;
    }
    const album = albums.find(a => a.id === selectedAlbumId);
    if (!album) return cameraPhotos;
    return cameraPhotos.filter(photo => album.photos.includes(photo));
  }, [selectedAlbumId, cameraPhotos, albums]);

  // Filtered gallery photos for the standalone Gallery
  const displayedGalleryPhotos = useMemo(() => {
    if (selectedGalleryAlbumId === "all") {
      return galleryPhotos;
    }
    const album = galleryAlbums.find(a => a.id === selectedGalleryAlbumId);
    if (!album) return galleryPhotos;
    return galleryPhotos.filter(photo => album.photos.includes(photo));
  }, [selectedGalleryAlbumId, galleryPhotos, galleryAlbums]);

  const [selectedGalleryPhotoIndex, setSelectedGalleryPhotoIndex] = useState<number | null>(null);
  const selectedGalleryPhoto = selectedGalleryPhotoIndex !== null ? displayedPhotos[selectedGalleryPhotoIndex] : null;

  // Keyboard controls for photo browsing inside camera and gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      // Standalone Gallery Navigation (Token: 728)
      const isGalleryActive = activeAppToken && activeAppToken.token === '728';
      if (isGalleryActive && fullscreenGalleryPhotoIndex !== null) {
        if (e.key === 'ArrowLeft') {
          setFullscreenGalleryPhotoIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
          playAudio('preset:digital', 0);
        } else if (e.key === 'ArrowRight') {
          setFullscreenGalleryPhotoIndex(prev => (prev !== null && prev < displayedGalleryPhotos.length - 1 ? prev + 1 : prev));
          playAudio('preset:digital', 0);
        }
        return;
      }

      // Camera Navigation
      const isCameraActive = activeAppToken && typeof activeAppToken.token === 'string' && /^\d+$/.test(activeAppToken.token) && activeAppToken.token !== '728';
      if (!isCameraActive) return;

      if (galleryOpen && selectedGalleryPhotoIndex !== null) {
        if (e.key === 'ArrowLeft') {
          setSelectedGalleryPhotoIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
          playAudio('preset:digital', 0);
        } else if (e.key === 'ArrowRight') {
          setSelectedGalleryPhotoIndex(prev => (prev !== null && prev < displayedPhotos.length - 1 ? prev + 1 : prev));
          playAudio('preset:digital', 0);
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        navigateViewfinder('left');
      } else if (e.key === 'ArrowRight') {
        navigateViewfinder('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAppToken, cameraPhotos, galleryOpen, selectedGalleryPhotoIndex, displayedPhotos, fullscreenGalleryPhotoIndex, displayedGalleryPhotos]);

  // Viewfinder custom image state & multi-select states
  const [customViewfinderUrl, setCustomViewfinderUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem("customViewfinderUrl");
    } catch (e) {
      console.error(e);
      return null;
    }
  });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotoIndexes, setSelectedPhotoIndexes] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Refs for tracking long-press without click interference
  const longPressTriggeredRef = React.useRef(false);
  const pressTimerRef = React.useRef<any>(null);

  const lastTapRef = React.useRef<number>(0);

  const handleTouchEnd = () => {
    if (isFullscreenDisplay) return;
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      if (isFullscreenDisplay && onToggleFullscreenDisplay) {
        onToggleFullscreenDisplay();
      }
    }
    lastTapRef.current = now;
  };

  const handleDoubleClick = () => {
    if (isFullscreenDisplay) return;
    if (isFullscreenDisplay && onToggleFullscreenDisplay) {
      onToggleFullscreenDisplay();
    }
  };

  // Photo uploader handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileList = Array.from(files);
    const readPromises = fileList.map((file: any) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(newImages => {
      setCameraPhotos(prev => [...newImages, ...prev]);
      playAudio('preset:digital', 0);
    });
  };

  // Gallery Click & Long Press handlers
  const handleLongPress = (idx: number) => {
    if (!isSelectMode) {
      setIsSelectMode(true);
      setSelectedPhotoIndexes([idx]);
      setLastSelectedIndex(idx);
      playAudio('preset:bell', 0);
    } else {
      // In select mode, if there is a last index, select the range!
      if (lastSelectedIndex !== null && lastSelectedIndex !== idx) {
        const start = Math.min(lastSelectedIndex, idx);
        const end = Math.max(lastSelectedIndex, idx);
        const rangeIndexes: number[] = [];
        for (let i = start; i <= end; i++) {
          rangeIndexes.push(i);
        }
        setSelectedPhotoIndexes(prev => {
          const next = [...prev];
          rangeIndexes.forEach(itemIdx => {
            if (!next.includes(itemIdx)) {
              next.push(itemIdx);
            }
          });
          return next;
        });
        setLastSelectedIndex(idx);
        playAudio('preset:bell', 0);
      } else {
        // Toggle selection of idx
        setSelectedPhotoIndexes(prev => {
          if (prev.includes(idx)) {
            const next = prev.filter(i => i !== idx);
            if (next.length === 0) {
              setIsSelectMode(false);
              setLastSelectedIndex(null);
            } else {
              setLastSelectedIndex(next[next.length - 1]);
            }
            return next;
          } else {
            setLastSelectedIndex(idx);
            return [...prev, idx];
          }
        });
        playAudio('preset:digital', 0);
      }
    }
  };

  const handlePhotoClick = (idx: number) => {
    if (!isSelectMode) {
      setSelectedGalleryPhotoIndex(idx);
      playAudio('preset:digital', 0);
    } else {
      setSelectedPhotoIndexes(prev => {
        if (prev.includes(idx)) {
          const next = prev.filter(i => i !== idx);
          if (next.length === 0) {
            setIsSelectMode(false);
            setLastSelectedIndex(null);
          } else {
            setLastSelectedIndex(next[next.length - 1]);
          }
          return next;
        } else {
          setLastSelectedIndex(idx);
          return [...prev, idx];
        }
      });
      playAudio('preset:digital', 0);
    }
  };

  // Touch and mouse helpers for long-press
  const startPress = (idx: number) => {
    longPressTriggeredRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      handleLongPress(idx);
    }, 550); // 550ms threshold
  };

  const endPress = (idx: number) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!longPressTriggeredRef.current) {
      handlePhotoClick(idx);
    }
  };

  const cancelPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Albums creation and management functions
  const createAlbum = (name: string) => {
    if (!name.trim()) return;
    const id = "album_" + Date.now();
    const newAlbum = { id, name: name.trim(), photos: [] };
    setAlbums(prev => [...prev, newAlbum]);
    setNewAlbumName("");
    setShowCreateAlbumModal(false);
    playAudio('preset:digital', 0);
  };

  const deleteCameraAlbum = (albumId: string) => {
    setAlbums(prev => prev.filter(a => a.id !== albumId));
    if (selectedAlbumId === albumId) {
      setSelectedAlbumId("all");
    }
    playAudio('preset:marimba', 0);
  };

  const renameCameraAlbum = (albumId: string, newName: string) => {
    if (!newName.trim()) return;
    setAlbums(prev => prev.map(a => {
      if (a.id === albumId) {
        return { ...a, name: newName.trim() };
      }
      return a;
    }));
    setRenamingCameraAlbumId(null);
    setRenamingCameraAlbumName("");
    playAudio('preset:digital', 0);
  };

  const addSelectedToAlbum = (albumId: string) => {
    const urlsToAdd = selectedPhotoIndexes.map(idx => displayedPhotos[idx]);
    setAlbums(prev => prev.map(album => {
      if (album.id === albumId) {
        const updatedPhotos = [...album.photos];
        urlsToAdd.forEach(url => {
          if (!updatedPhotos.includes(url)) {
            updatedPhotos.push(url);
          }
        });
        return { ...album, photos: updatedPhotos };
      }
      return album;
    }));

    setSelectedPhotoIndexes([]);
    setIsSelectMode(false);
    setLastSelectedIndex(null);
    playAudio('preset:bell', 0);
  };

  const deleteSelectedPhotos = () => {
    const urlsToDelete = selectedPhotoIndexes.map(idx => displayedPhotos[idx]);
    setCameraPhotos(prev => prev.filter(photo => !urlsToDelete.includes(photo)));
    
    // Also remove from custom albums
    setAlbums(prev => prev.map(album => ({
      ...album,
      photos: album.photos.filter(photo => !urlsToDelete.includes(photo))
    })));

    setSelectedPhotoIndexes([]);
    setIsSelectMode(false);
    setLastSelectedIndex(null);
    playAudio('preset:marimba', 0);
  };

  // Standalone Galleria Helper Functions (Token: 728)
  const handleGalleryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileList = Array.from(files);
    const readPromises = fileList.map((file: any) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(newImages => {
      setGalleryPhotos(prev => [...newImages, ...prev]);
      if (selectedGalleryAlbumId !== 'all') {
        setGalleryAlbums(prev => prev.map(album => {
          if (album.id === selectedGalleryAlbumId) {
            return {
              ...album,
              photos: [...newImages, ...album.photos]
            };
          }
          return album;
        }));
      }
      playAudio('preset:digital', 0);
    });
  };

  const createGalleryAlbum = (name: string) => {
    if (!name.trim()) return;
    const id = "gal_album_" + Date.now();
    const newAlbum = { id, name: name.trim(), photos: [] };
    setGalleryAlbums(prev => [...prev, newAlbum]);
    setNewGalleryAlbumName("");
    setShowCreateGalleryAlbumModal(false);
    playAudio('preset:digital', 0);
  };

  const deleteGalleryAlbum = (albumId: string) => {
    // Delete the album from the list of albums
    setGalleryAlbums(prev => prev.filter(a => a.id !== albumId));
    // If the currently selected album is the deleted one, switch back to 'all'
    if (selectedGalleryAlbumId === albumId) {
      setSelectedGalleryAlbumId("all");
    }
    playAudio('preset:marimba', 0);
  };

  const renameGalleryAlbum = (albumId: string, newName: string) => {
    if (!newName.trim()) return;
    setGalleryAlbums(prev => prev.map(a => {
      if (a.id === albumId) {
        return { ...a, name: newName.trim() };
      }
      return a;
    }));
    setRenamingGalleryAlbumId(null);
    setRenamingGalleryAlbumName("");
    playAudio('preset:digital', 0);
  };

  const addSelectedToGalleryAlbum = (albumId: string) => {
    const urlsToAdd = selectedGalleryPhotoIndexes.map(idx => displayedGalleryPhotos[idx]);
    setGalleryAlbums(prev => {
      return prev.map(album => {
        if (album.id === albumId) {
          const updatedPhotos = [...album.photos];
          urlsToAdd.forEach(url => {
            if (!updatedPhotos.includes(url)) {
              updatedPhotos.push(url);
            }
          });
          return { ...album, photos: updatedPhotos };
        }
        return album;
      });
    });

    setSelectedGalleryPhotoIndexes([]);
    setIsGallerySelectMode(false);
    setLastSelectedGalleryIndex(null);
    playAudio('preset:bell', 0);
  };

  const deleteSelectedGalleryPhotos = () => {
    const urlsToDelete = selectedGalleryPhotoIndexes.map(idx => displayedGalleryPhotos[idx]);
    setGalleryPhotos(prev => prev.filter(photo => !urlsToDelete.includes(photo)));
    
    // Also remove from custom gallery albums
    setGalleryAlbums(prev => prev.map(album => ({
      ...album,
      photos: album.photos.filter(photo => !urlsToDelete.includes(photo))
    })));

    setSelectedGalleryPhotoIndexes([]);
    setIsGallerySelectMode(false);
    setLastSelectedGalleryIndex(null);
    playAudio('preset:marimba', 0);
  };

  const handleGalleryLongPress = (idx: number) => {
    if (!isGallerySelectMode) {
      setIsGallerySelectMode(true);
      setSelectedGalleryPhotoIndexes([idx]);
      setLastSelectedGalleryIndex(idx);
      playAudio('preset:bell', 0);
    } else {
      if (lastSelectedGalleryIndex !== null && lastSelectedGalleryIndex !== idx) {
        const start = Math.min(lastSelectedGalleryIndex, idx);
        const end = Math.max(lastSelectedGalleryIndex, idx);
        const rangeIndexes: number[] = [];
        for (let i = start; i <= end; i++) {
          rangeIndexes.push(i);
        }
        setSelectedGalleryPhotoIndexes(prev => {
          const next = [...prev];
          rangeIndexes.forEach(itemIdx => {
            if (!next.includes(itemIdx)) {
              next.push(itemIdx);
            }
          });
          return next;
        });
        setLastSelectedGalleryIndex(idx);
        playAudio('preset:bell', 0);
      } else {
        setSelectedGalleryPhotoIndexes(prev => {
          if (prev.includes(idx)) {
            const next = prev.filter(i => i !== idx);
            if (next.length === 0) {
              setIsGallerySelectMode(false);
              setLastSelectedGalleryIndex(null);
            } else {
              setLastSelectedGalleryIndex(next[next.length - 1]);
            }
            return next;
          } else {
            setLastSelectedGalleryIndex(idx);
            return [...prev, idx];
          }
        });
        playAudio('preset:digital', 0);
      }
    }
  };

  const handleGalleryPhotoClick = (idx: number) => {
    if (!isGallerySelectMode) {
      setFullscreenGalleryPhotoIndex(idx);
      playAudio('preset:digital', 0);
    } else {
      setSelectedGalleryPhotoIndexes(prev => {
        if (prev.includes(idx)) {
          const next = prev.filter(i => i !== idx);
          if (next.length === 0) {
            setIsGallerySelectMode(false);
            setLastSelectedGalleryIndex(null);
          } else {
            setLastSelectedGalleryIndex(next[next.length - 1]);
          }
          return next;
        } else {
          setLastSelectedGalleryIndex(idx);
          return [...prev, idx];
        }
      });
      playAudio('preset:digital', 0);
    }
  };

  const startGalleryPress = (idx: number) => {
    longPressTriggeredRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      handleGalleryLongPress(idx);
    }, 550);
  };

  const endGalleryPress = (idx: number) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!longPressTriggeredRef.current) {
      handleGalleryPhotoClick(idx);
    }
  };

  // Swipe support for fullscreen gallery preview
  const fullscreenSwipeStartXRef = React.useRef<number | null>(null);

  const handleTouchStartFull = (e: React.TouchEvent) => {
    fullscreenSwipeStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEndFull = (e: React.TouchEvent) => {
    if (fullscreenSwipeStartXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - fullscreenSwipeStartXRef.current;
    const threshold = 40; // minimum 40px drag
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe Right -> Show PREVIOUS photo
        setSelectedGalleryPhotoIndex(prev => {
          if (prev !== null && prev > 0) {
            playAudio('preset:digital', 0);
            return prev - 1;
          }
          return prev;
        });
      } else {
        // Swipe Left -> Show NEXT photo
        setSelectedGalleryPhotoIndex(prev => {
          if (prev !== null && prev < displayedPhotos.length - 1) {
            playAudio('preset:digital', 0);
            return prev + 1;
          }
          return prev;
        });
      }
    }
    fullscreenSwipeStartXRef.current = null;
  };

  const handleMouseDownFull = (e: React.MouseEvent) => {
    fullscreenSwipeStartXRef.current = e.clientX;
  };

  const handleMouseUpFull = (e: React.MouseEvent) => {
    if (fullscreenSwipeStartXRef.current === null) return;
    const endX = e.clientX;
    const diffX = endX - fullscreenSwipeStartXRef.current;
    const threshold = 40;
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        setSelectedGalleryPhotoIndex(prev => {
          if (prev !== null && prev > 0) {
            playAudio('preset:digital', 0);
            return prev - 1;
          }
          return prev;
        });
      } else {
        setSelectedGalleryPhotoIndex(prev => {
          if (prev !== null && prev < displayedPhotos.length - 1) {
            playAudio('preset:digital', 0);
            return prev + 1;
          }
          return prev;
        });
      }
    }
    fullscreenSwipeStartXRef.current = null;
  };

  // Keep track of active audio and its URL
  const activeAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const activeAudioUrlRef = React.useRef<string | null>(null);
  const audioCacheRef = React.useRef<Record<string, HTMLAudioElement>>({});

  // Update clock in real-time
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, '0');
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => {
      clearInterval(interval);
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
    };
  }, []);

  // Camera video recording timer effect
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Load stored photos and albums from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [
          savedGalleryPhotos,
          savedGalleryAlbums,
          savedGalleryMirrored,
          savedCameraPhotos,
          savedCameraAlbums,
          savedMirroredPhotos,
          savedCustomViewfinder,
        ] = await Promise.all([
          getItem<string[] | null>("galleryPhotos", null),
          getItem<any[] | null>("galleryAlbums", null),
          getItem<string[] | null>("galleryMirroredPhotos", null),
          getItem<string[] | null>("cameraPhotos", null),
          getItem<any[] | null>("cameraAlbums", null),
          getItem<string[] | null>("mirroredPhotos", null),
          getItem<string | null>("customViewfinderUrl", null),
        ]);

        if (!isMounted) return;
        if (savedGalleryPhotos && Array.isArray(savedGalleryPhotos) && savedGalleryPhotos.length > 0) {
          setGalleryPhotos(savedGalleryPhotos);
        }
        if (savedGalleryAlbums && Array.isArray(savedGalleryAlbums) && savedGalleryAlbums.length > 0) {
          setGalleryAlbums(savedGalleryAlbums);
        }
        if (savedGalleryMirrored && Array.isArray(savedGalleryMirrored)) {
          setGalleryMirroredPhotos(savedGalleryMirrored);
        }
        if (savedCameraPhotos && Array.isArray(savedCameraPhotos) && savedCameraPhotos.length > 0) {
          setCameraPhotos(savedCameraPhotos);
        }
        if (savedCameraAlbums && Array.isArray(savedCameraAlbums) && savedCameraAlbums.length > 0) {
          setAlbums(savedCameraAlbums);
        }
        if (savedMirroredPhotos && Array.isArray(savedMirroredPhotos)) {
          setMirroredPhotos(savedMirroredPhotos);
        }
        if (savedCustomViewfinder) {
          setCustomViewfinderUrl(savedCustomViewfinder);
        }
      } catch (err) {
        // Fallback handled
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Save camera photos list to IndexedDB whenever it changes
  useEffect(() => {
    setItem("cameraPhotos", cameraPhotos).catch(() => {});
  }, [cameraPhotos]);

  // Save camera albums to IndexedDB whenever they change
  useEffect(() => {
    setItem("cameraAlbums", albums).catch(() => {});
  }, [albums]);

  // Save mirrored photos list to IndexedDB whenever it changes
  useEffect(() => {
    setItem("mirroredPhotos", mirroredPhotos).catch(() => {});
  }, [mirroredPhotos]);

  // Save gallery photos list to IndexedDB whenever it changes
  useEffect(() => {
    setItem("galleryPhotos", galleryPhotos).catch(() => {});
  }, [galleryPhotos]);

  // Save gallery albums to IndexedDB whenever they change
  useEffect(() => {
    setItem("galleryAlbums", galleryAlbums).catch(() => {});
  }, [galleryAlbums]);

  // Save gallery mirrored photos list to IndexedDB whenever it changes
  useEffect(() => {
    setItem("galleryMirroredPhotos", galleryMirroredPhotos).catch(() => {});
  }, [galleryMirroredPhotos]);

  // Save custom viewfinder url to IndexedDB whenever it changes
  useEffect(() => {
    setItem("customViewfinderUrl", customViewfinderUrl || null).catch(() => {});
  }, [customViewfinderUrl]);

  // Play audio helper with toggle play/pause/resume and custom starting point capabilities
  const playAudio = async (audioUrl?: string, startOffset?: number) => {
    if (!audioUrl) return;
    try {
      if (audioUrl.startsWith('preset:')) {
        const presetDurations: Record<string, number> = {
          'preset:bell': 1200,
          'preset:digital': 250,
          'preset:marimba': 500,
          'preset:retro': 300,
          'preset:sci-fi': 450
        };

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        
        if (audioUrl === 'preset:bell') {
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
        } else if (audioUrl === 'preset:digital') {
          // Double digital beep
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
        } else if (audioUrl === 'preset:marimba') {
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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
        } else if (audioUrl === 'preset:retro') {
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
        } else if (audioUrl === 'preset:sci-fi') {
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
        return;
      }

      // 1. If we already have this exact song assigned in ref
      if (activeAudioRef.current && activeAudioUrlRef.current === audioUrl) {
        const audio = activeAudioRef.current;
        if (!audio.paused) {
          // It's currently playing, let's PAUSE it
          audio.pause();
          setIsAudioPlaying(false);
        } else {
          // It's currently paused, let's RESUME it from where it was
          audio.play().then(() => setIsAudioPlaying(true)).catch((e) => console.warn('Audio resume failed:', e));
        }
        return;
      }

      // 2. If a different song is playing, stop it completely
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
        activeAudioUrlRef.current = null;
        setIsAudioPlaying(false);
      }

      // 3. Play from scratch or custom startOffset, using caching to avoid recreate/network fetch lag
      let resolvedUrl = audioUrl;
      if (audioUrl.startsWith('db:audio_')) {
        const saved = await getItem<string | null>(audioUrl, null);
        if (saved) resolvedUrl = saved;
      }

      let audio = audioCacheRef.current[resolvedUrl];
      if (!audio) {
        audio = new Audio(resolvedUrl);
        audio.preload = "auto";
        audioCacheRef.current[resolvedUrl] = audio;
      }

      audio.volume = 1.0;
      activeAudioRef.current = audio;
      activeAudioUrlRef.current = audioUrl;

      audio.onplay = () => setIsAudioPlaying(true);
      audio.onpause = () => setIsAudioPlaying(false);

      const playWithOffset = () => {
        if (startOffset && startOffset > 0) {
          audio.currentTime = startOffset;
        } else {
          audio.currentTime = 0;
        }
        audio.play().then(() => {
          setIsAudioPlaying(true);
        }).catch((e) => {
          console.warn('Audio play failed:', e);
          setIsAudioPlaying(false);
          if (activeAudioRef.current === audio) {
            activeAudioRef.current = null;
            activeAudioUrlRef.current = null;
          }
        });
      };

      // Set event handler for completion
      audio.onended = () => {
        setIsAudioPlaying(false);
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null;
          activeAudioUrlRef.current = null;
        }
      };

      // Play immediately if ready, or wait for metadata to seek smoothly with zero delay/lag
      if (audio.readyState >= 1) { // HAVE_METADATA or greater
        playWithOffset();
      } else {
        const onMetadataLoaded = () => {
          playWithOffset();
        };
        audio.addEventListener('loadedmetadata', onMetadataLoaded, { once: true });
        audio.load(); // Force loading
      }
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  };

  // Filter gridItems belonging strictly to the ACTIVE PAGE
  const pageGridItems = gridItems.filter((item) => (item.page || 0) === activePage);

  // Grid layout helper: 4 columns, 6 rows (0-5)
  const renderGrid = () => {
    const gridMatrix: (string | null)[][] = Array(6)
      .fill(null)
      .map(() => Array(4).fill(null));

    // Populate matrix with item IDs to detect overlapping and filled cells
    pageGridItems.forEach((item) => {
      for (let r = item.row; r < Math.min(item.row + item.h, 6); r++) {
        for (let c = item.col; c < Math.min(item.col + item.w, 4); c++) {
          gridMatrix[r][c] = item.id;
        }
      }
    });

    const cells: React.ReactNode[] = [];

    // Render cells sequentially to preserve layout
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const itemId = gridMatrix[r][c];

        if (itemId === null) {
          // Empty cell
          cells.push(
            <div
              key={`empty-${activePage}-${r}-${c}`}
              onClick={() => {
                if (!isFullscreenDisplay) {
                  onSelectItem({ type: 'empty', row: r, col: c, isDock: false });
                }
              }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative group
                ${isEditMode && !isFullscreenDisplay
                  ? 'border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 cursor-pointer' 
                  : 'pointer-events-none opacity-0'
                }`}
            >
              {isEditMode && !isFullscreenDisplay && (
                <Plus className="text-white/30 group-hover:text-white/75 group-hover:scale-110 transition-all" size={20} />
              )}
            </div>
          );
        } else {
          // Find the item
          const item = pageGridItems.find((i) => i.id === itemId);
          if (!item) continue;

          // Only render the item from its top-left cell origin to avoid double rendering
          if (item.row === r && item.col === c) {
            const isSelected = selectedItemId === item.id;
            
            // Check widget / item spanning classes
            let spanClass = 'col-span-1 row-span-1 aspect-square';
            if (item.w === 2 && item.h === 2) {
              spanClass = 'col-span-2 row-span-2 aspect-square';
            } else if (item.w === 4 && item.h === 2) {
              spanClass = 'col-span-4 row-span-2 h-[145px]';
            } else if (item.w === 4 && item.h === 4) {
              spanClass = 'col-span-4 row-span-4 h-[300px]';
            }

            cells.push(
              <motion.div
                key={`item-${item.id}`}
                layoutId={`item-layout-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  
                  if (item.token) {
                    setActiveAppToken(item);
                  }
                  
                  // In fullscreen viewing mode (or non-edit mode), tapping app plays sound
                  if (item.type === 'app' && item.audioUrl) {
                    playAudio(item.audioUrl, item.audioStartOffset);
                  }

                  // Selection trigger
                  if (!isFullscreenDisplay) {
                    onSelectItem(item);
                  }
                }}
                className={`relative cursor-pointer select-none group flex flex-col justify-between transition-all duration-300
                  ${spanClass}
                  ${isSelected && !isFullscreenDisplay ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 rounded-3xl scale-[0.98]' : ''}
                `}
                style={{
                  gridColumnStart: item.col + 1,
                  gridColumnEnd: item.col + item.w + 1,
                  gridRowStart: item.row + 1,
                  gridRowEnd: item.row + item.h + 1,
                }}
              >
                {/* Render corresponding element based on type */}
                {item.type === 'app' && renderAppIcon(item)}
                {item.type === 'widget_small' && renderSmallWidget(item)}
                {item.type === 'widget_medium' && renderMediumWidget(item)}

                {/* Edit badge */}
                {isEditMode && !isFullscreenDisplay && (
                  <div className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-white rounded-full p-1 shadow-md z-10 scale-90 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={10} />
                  </div>
                )}
              </motion.div>
            );
          }
        }
      }
    }

    return cells;
  };

  // 1. RENDER APP ICON
  const renderAppIcon = (item: GridItem) => {
    const isCustomImage = item.iconName === 'custom' && item.iconUrl;
    const isTransparent = item.transparentIconBg;
    const sizeVal = item.customSize || 58;
    const innerIconSize = Math.max(10, Math.round(sizeVal * (26 / 58)));

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-1">
        <div 
          className={`rounded-2xl flex items-center justify-center text-white relative transition-all overflow-hidden
            ${isTransparent 
              ? 'bg-transparent border border-white/5 shadow-none' 
              : 'bg-white/12 backdrop-blur-md border border-white/20 shadow-lg hover:brightness-110'
            }
            active:scale-95`}
          style={{ width: `${sizeVal}px`, height: `${sizeVal}px` }}
        >
          {/* Frosted inner glow only if not transparent */}
          {!isTransparent && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />}
          
          {isCustomImage ? (
            <img 
              src={item.iconUrl} 
              alt={item.label} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fail-safe for broken image URLs
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100';
              }}
            />
          ) : (
            <LucideIcon name={item.iconName || 'AppWindow'} className="text-white drop-shadow-sm" size={innerIconSize} />
          )}

          {/* Sound icon badge if has sound attached */}
          {item.audioUrl && (
            <div className="absolute bottom-1 right-1 bg-black/40 p-0.5 rounded-full text-white/80">
              <Volume2 size={Math.max(6, Math.round(sizeVal * (8 / 58)))} />
            </div>
          )}
        </div>
        <span 
          className="text-white font-sans font-medium text-center mt-1.5 truncate w-full drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.6)]"
          style={{ 
            fontSize: `${Math.max(8, Math.min(14, Math.round(sizeVal * (10.5 / 58))))}px`,
            maxWidth: `${sizeVal + 12}px` 
          }}
        >
          {item.label}
        </span>
      </div>
    );
  };

  // 2. RENDER SMALL WIDGET (2x2)
  const renderSmallWidget = (item: GridItem) => {
    const showImage = item.widgetType === 'photo' && item.images && item.images[0];
    const isClock = item.widgetType === 'clock';
    const isWeather = item.widgetType === 'weather';
    const isStocks = item.widgetType === 'stocks';

    const sizeVal = item.customSize || 120;
    const scale = sizeVal / 120;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-1">
        <div 
          onClick={(e) => {
            if (showImage && item.images && item.images[0]) {
              e.stopPropagation();
              setFullscreenPhoto(item.images[0]);
            }
          }}
          className="w-full aspect-square rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden flex flex-col relative group/widget"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          {showImage ? (
            <img 
              src={item.images![0]} 
              alt={item.title || 'Widget image'} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
              referrerPolicy="no-referrer"
            />
          ) : isClock ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-2">
              <span className="text-xs uppercase font-semibold text-cyan-200 tracking-wider">Ora Locale</span>
              <span className="text-3xl font-bold tracking-tight mt-1">{currentTime}</span>
              <span className="text-[10px] text-white/60 font-mono mt-0.5">iOS Simulator</span>
            </div>
          ) : isWeather ? (
            <div className="w-full h-full flex flex-col justify-between text-white p-3.5">
              <div className="flex justify-between items-start">
                <CloudSun className="text-amber-200 drop-shadow-md" size={32} />
                <span className="text-2xl font-bold font-sans">24°</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/90">Roma</p>
                <p className="text-[10px] text-white/60">Parzialmente Nuvoloso</p>
              </div>
            </div>
          ) : isStocks ? (
            <div className="w-full h-full flex flex-col justify-between text-white p-3.5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold font-mono bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded">AAPL</span>
                <TrendingUp className="text-emerald-400" size={18} />
              </div>
              <div>
                <p className="text-xl font-bold font-mono">$189.84</p>
                <p className="text-[10px] text-emerald-400 font-semibold">+1.48% (Oggi)</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
              Widget 2x2
            </div>
          )}
        </div>
        {item.title && (
          <span 
            className="text-white/60 font-sans font-semibold uppercase tracking-wider text-center mt-1 truncate w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            style={{ fontSize: `${Math.max(7, Math.min(12, Math.round(9 * scale)))}px` }}
          >
            {item.title}
          </span>
        )}
      </div>
    );
  };

  // 3. RENDER MEDIUM WIDGET (4x2) - Polaroids Widget
  const renderMediumWidget = (item: GridItem) => {
    const isPolaroid = item.widgetType === 'polaroid';
    const photos = item.images || [];

    const sizeVal = item.customSize || 250;
    const scale = sizeVal / 250;

    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-1">
        <div 
          className="w-full h-[126px] rounded-[26px] bg-white/8 backdrop-blur-lg border border-white/18 shadow-xl flex items-center justify-around p-2.5 overflow-hidden relative"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          <div className="absolute -bottom-10 inset-x-0 h-16 bg-cyan-400/10 blur-xl pointer-events-none" />

          {isPolaroid ? (
            <>
              {/* Polaroid 1 (Left tilt) */}
              <div 
                onClick={(e) => {
                  if (photos[0]) {
                    e.stopPropagation();
                    setFullscreenPhoto(photos[0]);
                  }
                }}
                className={`w-[28%] transition-all duration-300 flex flex-col justify-between aspect-[3/4] cursor-zoom-in hover:rotate-0 hover:scale-105 hover:z-20
                  ${item.polaroidFullPhoto 
                    ? 'rounded-lg overflow-hidden shadow-xl border border-white/15 rotate-[-5deg] translate-y-1' 
                    : 'bg-white p-1 pb-3 shadow-md rounded-[2px] rotate-[-5deg] translate-y-1'}`}
              >
                <div className={`w-full aspect-square bg-neutral-100 overflow-hidden relative ${item.polaroidFullPhoto ? '' : 'border border-black/5'}`}>
                  {photos[0] ? (
                    <img 
                      src={photos[0]} 
                      alt="Polaroid 1" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-neutral-200 to-neutral-300">
                      <Plus className="text-neutral-400" size={14} />
                    </div>
                  )}
                </div>
                {!item.polaroidFullPhoto && (
                  <div className="h-2 w-full flex items-center justify-center">
                    {!item.polaroidHideLabels && (
                      <span className="text-[6px] font-semibold text-neutral-400 tracking-wide font-sans uppercase truncate px-0.5">
                        {item.polaroidLabels?.[0] !== undefined ? item.polaroidLabels[0] : "MEMORIA"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Polaroid 2 (Straight / Centered) */}
              <div 
                onClick={(e) => {
                  if (photos[1]) {
                    e.stopPropagation();
                    setFullscreenPhoto(photos[1]);
                  }
                }}
                className={`w-[28%] transition-all duration-300 flex flex-col justify-between aspect-[3/4] z-10 cursor-zoom-in hover:scale-105 hover:z-20
                  ${item.polaroidFullPhoto 
                    ? 'rounded-lg overflow-hidden shadow-2xl border border-white/15 translate-y-[-2px]' 
                    : 'bg-white p-1 pb-3 shadow-lg rounded-[2px] translate-y-[-2px]'}`}
              >
                <div className={`w-full aspect-square bg-neutral-100 overflow-hidden relative ${item.polaroidFullPhoto ? '' : 'border border-black/5'}`}>
                  {photos[1] ? (
                    <img 
                      src={photos[1]} 
                      alt="Polaroid 2" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-neutral-200 to-neutral-300">
                      <Plus className="text-neutral-400" size={14} />
                    </div>
                  )}
                </div>
                {!item.polaroidFullPhoto && (
                  <div className="h-2 w-full flex items-center justify-center">
                    {!item.polaroidHideLabels && (
                      <span className="text-[6px] font-semibold text-neutral-400 tracking-wide font-sans uppercase truncate px-0.5">
                        {item.polaroidLabels?.[1] !== undefined ? item.polaroidLabels[1] : "ESTATE"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Polaroid 3 (Right tilt) */}
              <div 
                onClick={(e) => {
                  if (photos[2]) {
                    e.stopPropagation();
                    setFullscreenPhoto(photos[2]);
                  }
                }}
                className={`w-[28%] transition-all duration-300 flex flex-col justify-between aspect-[3/4] cursor-zoom-in hover:rotate-0 hover:scale-105 hover:z-20
                  ${item.polaroidFullPhoto 
                    ? 'rounded-lg overflow-hidden shadow-xl border border-white/15 rotate-[5deg] translate-y-1' 
                    : 'bg-white p-1 pb-3 shadow-md rounded-[2px] rotate-[5deg] translate-y-1'}`}
              >
                <div className={`w-full aspect-square bg-neutral-100 overflow-hidden relative ${item.polaroidFullPhoto ? '' : 'border border-black/5'}`}>
                  {photos[2] ? (
                    <img 
                      src={photos[2]} 
                      alt="Polaroid 3" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-neutral-200 to-neutral-300">
                      <Plus className="text-neutral-400" size={14} />
                    </div>
                  )}
                </div>
                {!item.polaroidFullPhoto && (
                  <div className="h-2 w-full flex items-center justify-center">
                    {!item.polaroidHideLabels && (
                      <span className="text-[6px] font-semibold text-neutral-400 tracking-wide font-sans uppercase truncate px-0.5">
                        {item.polaroidLabels?.[2] !== undefined ? item.polaroidLabels[2] : "SOGNO"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-sans">
              Widget 4x2
            </div>
          )}
        </div>
        {item.title && (
          <span className="text-white/60 text-[9.5px] font-sans font-semibold uppercase tracking-wider text-center mt-1 truncate w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            {item.title}
          </span>
        )}
      </div>
    );
  };

  // Dot navigations
  const handlePrevPage = () => {
    if (activePage > 0) setActivePage(activePage - 1);
  };

  const handleNextPage = () => {
    if (activePage < totalPages - 1) setActivePage(activePage + 1);
  };

  return (
    <div 
      id="iphone-wrapper"
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      className={`bg-black relative flex flex-col transition-all duration-500 overflow-hidden select-none
        ${isFullscreenDisplay 
          ? 'fixed inset-0 w-full h-full sm:max-w-[430px] sm:h-[92%] sm:rounded-[52px] sm:border-[8px] sm:border-slate-850 sm:shadow-2xl sm:m-auto rounded-none border-0 ring-0 shadow-none z-40' 
          : 'rounded-[52px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-4 ring-slate-800/50 w-[335px] h-[700px]'
        }`}
    >
      {/* High-fidelity background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url("${backgroundUrl}")` }}
      />
      
      {/* Dynamic/Dark shading overlay */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* Dynamic Island / Notch */}
      <motion.div 
        animate={{ 
          width: isAudioPlaying ? 115 : 90, 
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="absolute top-2.5 left-1/2 transform -translate-x-1/2 h-[25px] bg-black rounded-full z-[51] flex items-center justify-between px-2.5 shadow-lg border border-white/10 overflow-hidden"
      >
        <div className="w-2.5 h-2.5 bg-neutral-900 border border-neutral-800 rounded-full flex-shrink-0" />
        
        {isAudioPlaying && (
          <div className="flex items-center gap-1.5 px-1">
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[2px] bg-green-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-3" />
              <span className="w-[2px] bg-green-400 rounded-full animate-[bounce_0.8s_infinite_300ms] h-2" />
              <span className="w-[2px] bg-green-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-2.5" />
            </div>
            <Music size={10} className="text-green-400 animate-pulse" />
          </div>
        )}

        <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full flex-shrink-0" />
      </motion.div>

      {/* Status Bar: Only has the battery icon symbol, NO text percent like "58%" as requested! */}
      <div className={`px-6 flex justify-between items-end pb-1.5 text-white font-sans text-[12px] font-semibold z-50 relative select-none
        ${isFullscreenDisplay ? 'pt-5 h-14' : 'h-10'}`}
      >
        <button 
          onClick={handleClockClick}
          className="cursor-pointer border-0 bg-transparent text-[12px] font-semibold text-white p-0 m-0 outline-none select-none hover:opacity-90 active:opacity-75 transition-opacity"
        >
          <span>{currentTime}</span>
          {clockClickCount > 0 && (
            <span className="text-[9px] text-amber-400 bg-amber-950/80 border border-amber-800/40 px-1 rounded-sm animate-pulse ml-1 font-mono">
              {clockClickCount}/5
            </span>
          )}
        </button>
        <div className="flex items-center gap-1.5">
          <Signal size={12} className="text-white" />
          <Wifi size={12} className="text-white" />
          <div className="flex items-center gap-0.5">
            {/* Battery symbol ONLY, no percentage string! */}
            <Battery size={15} className="text-white" />
          </div>
        </div>
      </div>

      {/* Main Home Screen Grid container - with fluid spring swipe animation & gesture physics */}
      <div className="flex-1 px-4 pt-2 pb-4 overflow-hidden z-20 relative flex flex-col justify-between">
        <AnimatePresence mode="popLayout" custom={pageDirection} initial={false}>
          <motion.div 
            key={`page-${activePage}`}
            custom={pageDirection}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 320 : -320,
                opacity: 0,
                scale: 0.94,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
              },
              exit: (dir: number) => ({
                x: dir < 0 ? 320 : -320,
                opacity: 0,
                scale: 0.94,
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 320, damping: 30 },
              opacity: { duration: 0.22 },
              scale: { duration: 0.25 }
            }}
            drag={!activeAppToken && totalPages > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeThreshold = 40;
              if (offset.x < -swipeThreshold || velocity.x < -250) {
                if (activePage < totalPages - 1) {
                  setPageDirection(1);
                  setActivePage(activePage + 1);
                  try { playAudio('preset:digital', 0); } catch(err){}
                }
              } else if (offset.x > swipeThreshold || velocity.x > 250) {
                if (activePage > 0) {
                  setPageDirection(-1);
                  setActivePage(activePage - 1);
                  try { playAudio('preset:digital', 0); } catch(err){}
                }
              }
            }}
            className="w-full h-full flex flex-col justify-between cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <div className={`grid grid-cols-4 grid-rows-6 gap-x-2.5 gap-y-4 ${isFullscreenDisplay ? 'h-full flex-grow py-2' : 'h-[440px]'}`}>
              {renderGrid()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Overlay Arrows for easier navigation on desktop */}
      {totalPages > 1 && !isFullscreenDisplay && (
        <>
          {activePage > 0 && (
            <button
              onClick={handlePrevPage}
              className="absolute left-1.5 top-[40%] transform -translate-y-1/2 bg-black/40 hover:bg-black/60 border border-white/10 text-white p-1.5 rounded-full z-30 transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {activePage < totalPages - 1 && (
            <button
              onClick={handleNextPage}
              className="absolute right-1.5 top-[40%] transform -translate-y-1/2 bg-black/40 hover:bg-black/60 border border-white/10 text-white p-1.5 rounded-full z-30 transition-all active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </>
      )}

      {/* Paginated dots (aesthetic, animated & fully clickable!) */}
      <div className="h-5 flex items-center justify-center gap-1.5 z-20 relative select-none">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const isActive = activePage === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                if (idx !== activePage) {
                  setPageDirection(idx > activePage ? 1 : -1);
                  setActivePage(idx);
                  try { playAudio('preset:digital', 0); } catch(err){}
                }
              }}
              className="relative p-1 focus:outline-none cursor-pointer"
              title={`Vai a pagina ${idx + 1}`}
            >
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-white scale-125 shadow-sm' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
              {isActive && (
                <motion.div
                  layoutId="activePageDotHighlight"
                  className="absolute inset-0 rounded-full border border-white/80"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}

        {/* "+" Button to add a page instantly in Edit Mode */}
        {isEditMode && !isFullscreenDisplay && (
          <button
            onClick={onAddPage}
            className="w-4 h-4 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold border border-cyan-500/30 transition-all ml-1"
            title="Aggiungi nuova pagina"
          >
            +
          </button>
        )}

        {/* "-" Button to remove current empty/stale page */}
        {isEditMode && totalPages > 1 && !isFullscreenDisplay && (
          <button
            onClick={() => onDeletePage(activePage)}
            className="w-4 h-4 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 flex items-center justify-center text-[10px] font-bold border border-red-500/30 transition-all ml-0.5"
            title="Elimina questa pagina"
          >
            -
          </button>
        )}
      </div>

      {/* Dock container */}
      <div className="p-3 pb-4 z-20 relative select-none">
        <div className="w-full h-[78px] rounded-[28px] bg-white/12 backdrop-blur-xl border border-white/18 shadow-xl flex justify-around items-center px-2">
          {dockItems.map((item, index) => {
            const isSelected = selectedItemId === item.id;
            const isCustomImage = item.iconName === 'custom' && item.iconUrl;
            const isTransparent = item.transparentIconBg;
            const sizeVal = item.customSize || 58;
            const innerIconSize = Math.max(10, Math.round(sizeVal * (26 / 58)));

            return (
              <motion.div
                key={item.id}
                layoutId={`dock-layout-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();

                  if (item.token) {
                    setActiveAppToken(item);
                  }

                  // Play sound on click in preview/fullscreen or normal modes
                  if (item.audioUrl) {
                    playAudio(item.audioUrl, item.audioStartOffset);
                  }

                  if (!isFullscreenDisplay) {
                    onSelectItem(item);
                  }
                }}
                className={`relative flex flex-col items-center justify-center cursor-pointer group rounded-2xl shadow-md transition-all overflow-hidden
                  ${isTransparent
                    ? 'bg-transparent border border-white/5 shadow-none'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 hover:brightness-115'
                  }
                  active:scale-95
                  ${isSelected && !isFullscreenDisplay ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 scale-95' : ''}
                `}
                style={{ width: `${sizeVal}px`, height: `${sizeVal}px` }}
              >
                {isCustomImage ? (
                  <img 
                    src={item.iconUrl} 
                    alt={item.label} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <LucideIcon name={item.iconName || 'AppWindow'} className="text-white drop-shadow-sm" size={innerIconSize} />
                )}

                {/* Sound icon badge */}
                {item.audioUrl && (
                  <div className="absolute bottom-1 right-1 bg-black/40 p-0.5 rounded-full text-white/80">
                    <Volume2 size={Math.max(6, Math.round(sizeVal * (8 / 58)))} />
                  </div>
                )}

                {/* Edit badge */}
                {isEditMode && !isFullscreenDisplay && (
                  <div className="absolute top-1 right-1 bg-cyan-500 text-white rounded-full p-0.5 shadow z-10 scale-75 opacity-90">
                    <Edit3 size={8} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Render empty dock slots if under 4 items */}
          {Array(Math.max(0, 4 - dockItems.length))
            .fill(null)
            .map((_, i) => {
              const colIndex = dockItems.length + i;
              return (
                <div
                  key={`dock-empty-${colIndex}`}
                  onClick={() => {
                    if (!isFullscreenDisplay) {
                      onSelectItem({ type: 'empty', row: 99, col: colIndex, isDock: true });
                    }
                  }}
                  className={`w-[58px] h-[58px] rounded-2xl flex items-center justify-center transition-all border border-dashed border-white/20 bg-white/5 hover:bg-white/10
                    ${isFullscreenDisplay ? 'pointer-events-none opacity-0' : 'cursor-pointer'}`}
                >
                  {isEditMode && !isFullscreenDisplay && <Plus className="text-white/30" size={16} />}
                </div>
              );
            })}
        </div>
      </div>

      {/* Home Indicator Bar */}
      <div 
        onClick={activeAppToken ? () => {
          setActiveAppToken(null);
          try {
            playAudio('preset:digital', 0);
          } catch (e) {}
        } : undefined}
        className={`h-5 flex items-center justify-center pb-2 z-30 relative select-none
          ${activeAppToken ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all' : ''}`}
        title={activeAppToken ? "Torna alla Schermata Home" : undefined}
      >
        <div className="w-[110px] h-1.5 bg-white/80 rounded-full" />
      </div>

      {/* INTERACTIVE FULLSCREEN PHOTO PREVIEW OVERLAY */}
      <AnimatePresence>
        {fullscreenPhoto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
          >
            {/* Img Container that fills the screen perfectly */}
            <img
              src={fullscreenPhoto}
              alt="Fullscreen iOS Image"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />

            {/* Premium, translucent circular floating close button below notch & status bar */}
            <button
              onClick={() => setFullscreenPhoto(null)}
              className="absolute top-14 right-4 bg-black/60 hover:bg-black/85 text-white/90 hover:text-white rounded-full p-2.5 backdrop-blur-md border border-white/10 shadow-xl transition-all active:scale-90 z-[60]"
              title="Chiudi anteprima"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOTIVATIONAL WEATHER APP OVERLAY (MOTIVA-METEO TOKEN) */}
      <AnimatePresence>
        {activeAppToken && activeAppToken.token === 'MOTIVA-METEO' && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-black z-45 overflow-hidden flex flex-col justify-between"
            style={{ borderRadius: isFullscreenDisplay ? '42px' : '42px' }}
          >
            {/* Custom Background Photo */}
            <img 
              src={activeAppToken.weatherBgUrl || "https://imagetourl.cloud/3mcy8k95.jpg"} 
              alt="Meteo Background" 
              className={`absolute inset-0 w-full h-full transition-all ${
                activeAppToken.weatherBgFit === 'contain' 
                  ? 'object-contain bg-slate-950/90' 
                  : activeAppToken.weatherBgFit === 'stretch' 
                    ? 'object-fill' 
                    : 'object-cover'
              }`}
              referrerPolicy="no-referrer"
            />
            
            {/* Ambient Dark/Reddish overlay for dramatic motivational mood */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/45 to-black/95 pointer-events-none transition-opacity duration-350" 
              style={{ opacity: activeAppToken.weatherBgOverlayOpacity !== undefined ? activeAppToken.weatherBgOverlayOpacity / 100 : 0.60 }}
            />

            {/* Simulated app notch space & status bar */}
            <div className="h-10 shrink-0 z-10 relative pointer-events-none" />

            {/* App Header (Back arrow & Title) */}
            <div className="px-5 py-2 flex items-center justify-between z-10 relative">
              <button
                onClick={() => {
                  setActiveAppToken(null);
                  // Play standard preset exit sound
                  playAudio('preset:digital', 0);
                }}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
                title="Torna indietro alla Schermata Home"
              >
                <ArrowLeft size={18} />
              </button>
              
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-red-500 font-extrabold block">METEO DI FERRO</span>
                <span className="text-xs font-bold text-white tracking-tight">Cielo Reale</span>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-red-500">
                <Flame size={18} className="animate-pulse" />
              </div>
            </div>

            {/* Scrollable / Interactive Weather App Content */}
            <div className="flex-1 px-5 pt-4 pb-2 flex flex-col justify-between z-10 relative overflow-y-auto scrollbar-none">
              
              {/* Dynamic Weather Condition Card */}
              <div className="bg-black/60 backdrop-blur-md border border-red-500/30 p-4.5 rounded-3xl text-center space-y-3 shadow-xl">
                <div className="flex justify-center items-center gap-3">
                  <span className="text-4xl font-black text-white font-mono tracking-tighter">
                    {[
                      "14°C", "38°C", "32°C", "12°C", "19°C", 
                      "8°C", "41°C", "35°C", "16°C", "-4°C"
                    ][motivationalIndex]}
                  </span>
                  
                  <div className="text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">Condizione</span>
                    <span className="text-sm font-black text-white uppercase tracking-tight">
                      {[
                        "Pioggia di Ferro", "Tempesta Elettrica", "Sole Spietato", 
                        "Diluvio Purificatore", "Vento di Guerra", "Nebbia per Codardi", 
                        "Caldo Inferno", "Afa Distruttiva", "Cielo Grigio D'acciaio", "Gelo Polare"
                      ][motivationalIndex]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 bg-red-950/40 border border-red-900/40 py-1.5 px-3 rounded-xl max-w-xs mx-auto">
                  {motivationalIndex % 4 === 0 && <Wind size={14} className="text-cyan-400 animate-pulse" />}
                  {motivationalIndex % 4 === 1 && <Zap size={14} className="text-yellow-400 animate-pulse" />}
                  {motivationalIndex % 4 === 2 && <Flame size={14} className="text-red-400 animate-bounce" />}
                  {motivationalIndex % 4 === 3 && <CloudSun size={14} className="text-orange-400 animate-bounce" />}
                  
                  <span className="text-[10px] font-mono font-bold text-red-200 uppercase tracking-widest">
                    STATO ENERGETICO: MAX
                  </span>
                </div>
              </div>

              {/* Huge RAW Motivational Quote Block */}
              <div className="my-auto py-4 flex flex-col justify-center items-center text-center space-y-4">
                <span className="text-red-500 text-[10px] font-extrabold tracking-widest uppercase bg-red-950/60 border border-red-800/40 px-3 py-1 rounded-full">
                  IL METEO NON HA PIETÀ
                </span>
                
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight uppercase tracking-tight select-text">
                  "{[
                    "ALZATI E SPINGI! Il divano non paga le tue bollette e la pioggia è solo un'altra scusa per i deboli.",
                    "PIOMBO O FUOCO? Oggi non hai scuse. Fai quel cazzo di allenamento o guarda gli altri vincere.",
                    "32°C DI PURO SANGUE E SUDORE. Il meteo dice caldo, la tua mente deve dire: bruciamo tutto!",
                    "Sta piovendo fuori? Ottimo. È l'acqua perfetta per lavare via le tue patetiche scuse.",
                    "C'è vento? Spingi più forte. Diventa la tempesta che spazza via ogni ostacolo.",
                    "Cielo grigio? Chi se ne fotte del sole. Il fuoco devi avercelo dentro le vene, non in cielo.",
                    "La temperatura sale, ma la tua determinazione deve salire ancora più in alto. Muovi il culo!",
                    "Umidità al 90%. Altri stanno morendo dal caldo, tu stai per far bruciare la concorrenza.",
                    "NESSUN AIUTO ARRIVERÀ. Sei solo tu contro te stesso. Sotto la pioggia o sotto il sole spietato, combatti.",
                    "C'è ghiaccio sulle strade? Buono, la tua disciplina deve essere ancora più fredda e affilata."
                  ][motivationalIndex]}"
                </h2>
                
                <div className="w-12 h-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-full" />
              </div>

              {/* Bottom Interactive Trigger to Cycle Quote */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    // Play a quick digital sound beep
                    playAudio('preset:digital', 0);
                    // Cycle through index
                    setMotivationalIndex((prev) => (prev + 1) % 10);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 border border-red-400/30 cursor-pointer transition-all"
                >
                  <RotateCw size={13} className="animate-spin duration-1000" />
                  CARICA DI ADRENALINA
                </button>

                <p className="text-[9px] text-center text-slate-500 uppercase tracking-wider">
                  Clicca per cambiare meteo e frase motivazionale
                </p>
              </div>

            </div>

            {/* Custom Bottom Home bar spacing */}
            <div className="h-6 shrink-0 z-10 relative pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GALLERIA TRAPPOLA APP OVERLAY (TOKEN 728) */}
      <AnimatePresence>
        {activeAppToken && activeAppToken.token === '728' && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-neutral-950 z-45 overflow-hidden flex flex-col justify-between text-white"
            style={{ borderRadius: isFullscreenDisplay ? '42px' : '42px' }}
          >
            {/* Simulated app notch space & status bar */}
            <div className="h-10 shrink-0 z-10 relative pointer-events-none" />

            {/* Galleria Header */}
            <div className="px-4 py-2 flex items-center justify-between z-10 relative bg-neutral-900 border-b border-white/5 shrink-0">
              <button
                onClick={() => {
                  setActiveAppToken(null);
                  setFullscreenGalleryPhotoIndex(null);
                  setIsGallerySelectMode(false);
                  setSelectedGalleryPhotoIndexes([]);
                  setLastSelectedGalleryIndex(null);
                  playAudio('preset:digital', 0);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                title="Chiudi Galleria"
              >
                <X size={16} />
              </button>

              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-extrabold block">Galleria Segreta</span>
                <span className="text-xs font-bold text-white/90 tracking-tight block max-w-[120px] truncate">
                  {galleryAlbums.find(a => a.id === selectedGalleryAlbumId)?.name || "Cassaforte"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="file"
                  id="gallery-trap-photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryPhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => {
                    setShowGalleryAlbumsManager(true);
                    playAudio('preset:digital', 0);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-yellow-400 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                  title="Vedi e Gestisci Album"
                >
                  <Folder size={15} />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('gallery-trap-photo-upload')?.click();
                    playAudio('preset:digital', 0);
                  }}
                  className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                  title="Carica Foto in Galleria"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Selection Toolbar Banner for Galleria */}
            {isGallerySelectMode && (
              <div className="bg-neutral-900 border-b border-yellow-500/20 py-2 px-4 flex justify-between items-center text-xs shrink-0 z-10 relative animate-fade-in">
                <span className="text-yellow-400 font-bold font-mono">{selectedGalleryPhotoIndexes.length} selezionate</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setShowAddToGalleryAlbumModal(true);
                      playAudio('preset:digital', 0);
                    }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-yellow-400 hover:text-yellow-300 px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer border border-white/5"
                    title="Aggiungi all'album"
                  >
                    <FolderPlus size={11} />
                    Album
                  </button>

                  {selectedGalleryAlbumId !== 'all' && (
                    <button
                      onClick={() => {
                        const urlsToRemove = selectedGalleryPhotoIndexes.map(idx => displayedGalleryPhotos[idx]);
                        setGalleryAlbums(prev => prev.map(album => {
                          if (album.id === selectedGalleryAlbumId) {
                            return {
                              ...album,
                              photos: album.photos.filter(photo => !urlsToRemove.includes(photo))
                            };
                          }
                          return album;
                        }));
                        setSelectedGalleryPhotoIndexes([]);
                        setIsGallerySelectMode(false);
                        setLastSelectedGalleryIndex(null);
                        playAudio('preset:marimba', 0);
                      }}
                      className="bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer border border-amber-500/20"
                      title="Rimuovi da questo album"
                    >
                      Rimuovi
                    </button>
                  )}

                  <button
                    onClick={deleteSelectedGalleryPhotos}
                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 size={11} />
                    Elimina
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGalleryPhotoIndexes([]);
                      setIsGallerySelectMode(false);
                      setLastSelectedGalleryIndex(null);
                      playAudio('preset:digital', 0);
                    }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1 rounded font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}

            {/* Grid list of Galleria Pictures */}
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-1 z-10 relative scrollbar-none bg-neutral-950">
              {displayedGalleryPhotos.map((photo, idx) => {
                const isSelected = selectedGalleryPhotoIndexes.includes(idx);
                const isMirrored = galleryMirroredPhotos.includes(photo);
                return (
                  <div
                    key={idx}
                    onTouchStart={() => startGalleryPress(idx)}
                    onTouchEnd={() => endGalleryPress(idx)}
                    onTouchCancel={cancelPress}
                    onMouseDown={() => startGalleryPress(idx)}
                    onMouseUp={() => endGalleryPress(idx)}
                    onMouseLeave={cancelPress}
                    className={`aspect-square bg-neutral-900 border overflow-hidden rounded-xl relative cursor-pointer group select-none transition-all duration-200 ${
                      isSelected 
                        ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-95' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Gallery Photo ${idx}`}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none ${
                        isMirrored ? 'scale-x-[-1]' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Multi-selection Checkbox indicator */}
                    {isGallerySelectMode && (
                      <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full border border-white/60 flex items-center justify-center bg-black/60 z-10">
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-scale-up" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {displayedGalleryPhotos.length === 0 && (
                <div className="col-span-3 py-16 text-center text-xs text-white/40 flex flex-col items-center justify-center gap-3">
                  <ImageIcon size={24} className="text-white/20 animate-pulse" />
                  <span>Nessuna foto in questa galleria segreta.</span>
                </div>
              )}
            </div>

            {/* Custom home space */}
            <div className="h-6 shrink-0 z-10 relative pointer-events-none" />

            {/* CREATE GALLERY ALBUM MODAL */}
            <AnimatePresence>
              {showCreateGalleryAlbumModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-5 w-full max-w-[280px] space-y-4 shadow-2xl"
                  >
                    <div className="text-center space-y-1">
                      <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FolderPlus size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nuovo Album Galleria</h3>
                      <p className="text-[10px] text-neutral-400">Inserisci il nome del nuovo album</p>
                    </div>

                    <input
                      type="text"
                      autoFocus
                      value={newGalleryAlbumName}
                      onChange={(e) => setNewGalleryAlbumName(e.target.value)}
                      placeholder="Nome album..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          createGalleryAlbum(newGalleryAlbumName);
                        } else if (e.key === 'Escape') {
                          setShowCreateGalleryAlbumModal(false);
                          setNewGalleryAlbumName("");
                        }
                      }}
                    />

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <button
                        onClick={() => {
                          setShowCreateGalleryAlbumModal(false);
                          setNewGalleryAlbumName("");
                          playAudio('preset:digital', 0);
                        }}
                        className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-all cursor-pointer"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => createGalleryAlbum(newGalleryAlbumName)}
                        className="py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all cursor-pointer"
                      >
                        Crea
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ADD TO GALLERY ALBUM MODAL */}
            <AnimatePresence>
              {showAddToGalleryAlbumModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-5 w-full max-w-[280px] space-y-4 shadow-2xl"
                  >
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Aggiungi ad Album Galleria</h3>
                      <p className="text-[10px] text-neutral-400">Seleziona album di destinazione</p>
                    </div>

                    <div className="max-h-[160px] overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                      {galleryAlbums.filter(a => a.id !== 'all').map(album => (
                        <button
                          key={album.id}
                          onClick={() => {
                            addSelectedToGalleryAlbum(album.id);
                            setShowAddToGalleryAlbumModal(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-between border border-white/5 transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            {album.id === 'favorites' ? <Heart size={12} className="fill-red-500 text-red-500" /> : <Folder size={12} className="text-cyan-400" />}
                            {album.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">({album.photos.length})</span>
                        </button>
                      ))}
                      {galleryAlbums.filter(a => a.id !== 'all').length === 0 && (
                        <p className="text-[11px] text-neutral-500 text-center py-4">Nessun album Galleria disponibile.</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowAddToGalleryAlbumModal(false);
                        playAudio('preset:digital', 0);
                      }}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Chiudi
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GESTIONE TUTTI GLI ALBUM GALLERIA (MANAGER) */}
            <AnimatePresence>
              {showGalleryAlbumsManager && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-5 w-full max-w-[290px] max-h-[80vh] flex flex-col justify-between shadow-2xl"
                  >
                    <div className="space-y-1 shrink-0 mb-3 text-center">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider text-cyan-400">Gestisci Album</h3>
                      <p className="text-[10px] text-neutral-400">Seleziona, rinomina o crea nuovi album</p>
                    </div>

                    {/* Quick Create Album button inside the list */}
                    <button
                      onClick={() => {
                        setShowCreateGalleryAlbumModal(true);
                        playAudio('preset:digital', 0);
                      }}
                      className="w-full mb-3 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.98]"
                    >
                      <FolderPlus size={13} />
                      <span>Crea Nuovo Album</span>
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none my-1">
                      {galleryAlbums.map((album) => {
                        const isSystemAlbum = album.id === 'all' || album.id === 'favorites';
                        const isRenaming = renamingGalleryAlbumId === album.id;

                        return (
                          <div 
                            key={album.id}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 transition-all"
                          >
                            {isRenaming ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  type="text"
                                  value={renamingGalleryAlbumName}
                                  onChange={(e) => setRenamingGalleryAlbumName(e.target.value)}
                                  className="flex-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      renameGalleryAlbum(album.id, renamingGalleryAlbumName);
                                    } else if (e.key === 'Escape') {
                                      setRenamingGalleryAlbumId(null);
                                      setRenamingGalleryAlbumName("");
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => renameGalleryAlbum(album.id, renamingGalleryAlbumName)}
                                  className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                                  title="Salva"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    setRenamingGalleryAlbumId(null);
                                    setRenamingGalleryAlbumName("");
                                    playAudio('preset:digital', 0);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                                  title="Annulla"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <button
                                  onClick={() => {
                                    setSelectedGalleryAlbumId(album.id);
                                    setShowGalleryAlbumsManager(false);
                                    setFullscreenGalleryPhotoIndex(null);
                                    setIsGallerySelectMode(false);
                                    setSelectedGalleryPhotoIndexes([]);
                                    setLastSelectedGalleryIndex(null);
                                    playAudio('preset:digital', 0);
                                  }}
                                  className="flex-1 text-left flex items-center gap-2 group cursor-pointer"
                                  title="Seleziona e vedi foto"
                                >
                                  <div className="text-neutral-400 group-hover:text-cyan-400 transition-colors">
                                    {album.id === 'all' && <ImageIcon size={14} />}
                                    {album.id === 'favorites' && <Heart size={14} className={album.photos.length > 0 ? "fill-red-500 text-red-500" : ""} />}
                                    {album.id !== 'all' && album.id !== 'favorites' && <Folder size={14} className="text-cyan-400" />}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                      {album.name}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-mono">
                                      {album.id === 'all' ? galleryPhotos.length : album.photos.length} foto
                                    </span>
                                  </div>
                                </button>

                                {!isSystemAlbum && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    {/* Rename */}
                                    <button
                                      onClick={() => {
                                        setRenamingGalleryAlbumId(album.id);
                                        setRenamingGalleryAlbumName(album.name);
                                        playAudio('preset:digital', 0);
                                      }}
                                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
                                      title="Rinomina Album"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    {/* Delete */}
                                    <button
                                      onClick={() => {
                                        if (deletingGalleryAlbumId === album.id) {
                                          deleteGalleryAlbum(album.id);
                                          setDeletingGalleryAlbumId(null);
                                        } else {
                                          setDeletingGalleryAlbumId(album.id);
                                          playAudio('preset:digital', 0);
                                        }
                                      }}
                                      className={`h-7 px-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-90 ${
                                        deletingGalleryAlbumId === album.id
                                          ? "bg-red-600 text-white font-bold animate-pulse"
                                          : "bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white"
                                      }`}
                                      title={deletingGalleryAlbumId === album.id ? "Clicca di nuovo per confermare l'eliminazione" : "Elimina Album"}
                                    >
                                      {deletingGalleryAlbumId === album.id ? (
                                        <span className="text-[9px] uppercase tracking-wider">Sicuro?</span>
                                      ) : (
                                        <Trash2 size={12} />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setShowGalleryAlbumsManager(false);
                        setRenamingGalleryAlbumId(null);
                        setRenamingGalleryAlbumName("");
                        playAudio('preset:digital', 0);
                      }}
                      className="w-full mt-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      Chiudi
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FULL SCREEN PHOTO VIEWER WITHIN GALLERY TRAPPOLA */}
            <AnimatePresence>
              {fullscreenGalleryPhotoIndex !== null && displayedGalleryPhotos[fullscreenGalleryPhotoIndex] && (
                <motion.div
                  initial={{ opacity: 0, y: '5%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '5%' }}
                  className="absolute inset-0 bg-black z-50 flex flex-col justify-between"
                >
                  <div className="pt-10 pb-4 px-4 bg-black/60 backdrop-blur-md flex justify-between items-center z-10">
                    <button
                      onClick={() => {
                        setFullscreenGalleryPhotoIndex(null);
                        playAudio('preset:digital', 0);
                      }}
                      className="text-xs bg-white/15 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold cursor-pointer"
                    >
                      Indietro
                    </button>
                    
                    <div className="flex gap-2">
                      {/* Mirror Button (Specchio) */}
                      <button
                        onClick={() => {
                          const currentPhoto = displayedGalleryPhotos[fullscreenGalleryPhotoIndex];
                          setGalleryMirroredPhotos(prev => {
                            if (prev.includes(currentPhoto)) {
                              return prev.filter(u => u !== currentPhoto);
                            } else {
                              return [...prev, currentPhoto];
                            }
                          });
                          playAudio('preset:digital', 0);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all flex items-center gap-1 border ${
                          galleryMirroredPhotos.includes(displayedGalleryPhotos[fullscreenGalleryPhotoIndex])
                            ? 'bg-yellow-400 text-black border-yellow-400'
                            : 'bg-white/10 hover:bg-white/20 text-white border-white/5'
                        }`}
                        title="Specchia immagine"
                      >
                        <RefreshCw size={11} className={galleryMirroredPhotos.includes(displayedGalleryPhotos[fullscreenGalleryPhotoIndex]) ? "rotate-180 duration-500" : ""} />
                        Specchia
                      </button>

                      {/* Favorite button */}
                      <button
                        onClick={() => {
                          const currentPhoto = displayedGalleryPhotos[fullscreenGalleryPhotoIndex];
                          setGalleryAlbums(prev => prev.map(a => {
                            if (a.id === 'favorites') {
                              const isFav = a.photos.includes(currentPhoto);
                              return {
                                ...a,
                                photos: isFav 
                                  ? a.photos.filter(p => p !== currentPhoto)
                                  : [...a.photos, currentPhoto]
                              };
                            }
                            return a;
                          }));
                          playAudio('preset:bell', 0);
                        }}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all flex items-center gap-1 border border-white/5"
                      >
                        <Heart 
                          size={11} 
                          className={galleryAlbums.find(a => a.id === 'favorites')?.photos.includes(displayedGalleryPhotos[fullscreenGalleryPhotoIndex]) ? "fill-red-500 text-red-500" : "text-white"} 
                        />
                        Preferito
                      </button>
                    </div>
                  </div>

                  {/* Centered Image display with optional mirror transformation */}
                  <div className="flex-1 flex items-center justify-center p-2 select-none relative">
                    <motion.img
                      key={fullscreenGalleryPhotoIndex}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      src={displayedGalleryPhotos[fullscreenGalleryPhotoIndex]}
                      alt="Full Screen Gallery View"
                      className={`max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 ${
                        galleryMirroredPhotos.includes(displayedGalleryPhotos[fullscreenGalleryPhotoIndex]) ? 'scale-x-[-1]' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Actions footer bar */}
                  <div className="pb-8 pt-4 px-6 bg-black/60 backdrop-blur-md flex justify-between items-center z-10">
                    <div /> {/* spacing placeholder */}

                    <button
                      onClick={() => {
                        const currentPhoto = displayedGalleryPhotos[fullscreenGalleryPhotoIndex];
                        // Permanently remove from gallery roll and all gallery albums
                        setGalleryPhotos(prev => prev.filter(p => p !== currentPhoto));
                        setGalleryAlbums(prev => prev.map(a => ({
                          ...a,
                          photos: a.photos.filter(p => p !== currentPhoto)
                        })));

                        // Close preview
                        setFullscreenGalleryPhotoIndex(null);
                        playAudio('preset:marimba', 0);
                      }}
                      className="text-xs bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white px-3.5 py-1.5 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1 border border-red-500/20"
                    >
                      <Trash2 size={11} />
                      Elimina
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* CAMERA SIMULATOR APP OVERLAY (NUMERIC TOKEN) */}
      <AnimatePresence>
        {activeAppToken && typeof activeAppToken.token === 'string' && /^\d+$/.test(activeAppToken.token) && activeAppToken.token !== '728' && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-black z-45 overflow-hidden flex flex-col justify-between text-white"
            style={{ borderRadius: isFullscreenDisplay ? '42px' : '42px' }}
          >
            {/* Simulated app notch space & status bar */}
            <div className="h-9 shrink-0 z-10 relative pointer-events-none" />

            {/* Top Bar Controls */}
            <div className="px-4 py-2 flex items-center justify-between z-10 relative bg-black/40 backdrop-blur-sm shrink-0">
              <button
                onClick={() => {
                  setActiveAppToken(null);
                  setIsRecording(false);
                  setViewfinderPhotoIndex(null);
                  playAudio('preset:digital', 0);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                title="Chiudi Fotocamera"
              >
                <X size={16} />
              </button>

              {/* Central indicators */}
              <div className="flex items-center gap-3">
                {/* Flash Toggle */}
                <button
                  onClick={() => {
                    setIsFlashOn(!isFlashOn);
                    playAudio('preset:digital', 0);
                  }}
                  className={`p-1.5 rounded-full transition-all ${isFlashOn ? 'bg-yellow-400 text-black animate-pulse' : 'bg-white/10 text-white'}`}
                  title="Flash"
                >
                  <Zap size={14} />
                </button>

                {/* Night Mode Toggle */}
                <button
                  onClick={() => {
                    setIsNightModeOn(!isNightModeOn);
                    playAudio('preset:digital', 0);
                  }}
                  className={`p-1.5 rounded-full transition-all ${isNightModeOn ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}
                  title="Modalità Notte"
                >
                  <Moon size={14} />
                </button>

                {/* Grid Lines Toggle */}
                <button
                  onClick={() => {
                    setIsCameraGridOn(!isCameraGridOn);
                    playAudio('preset:digital', 0);
                  }}
                  className={`p-1.5 rounded-full transition-all ${isCameraGridOn ? 'bg-cyan-400 text-black' : 'bg-white/10 text-white'}`}
                  title="Griglia dei Terzi"
                >
                  <Grid3X3 size={14} />
                </button>
              </div>

              {/* Custom Selector for Filter */}
              <button
                onClick={() => {
                  const filters: ('normal' | 'mono' | 'warm' | 'cool' | 'dramatic')[] = ['normal', 'mono', 'warm', 'cool', 'dramatic'];
                  const nextIdx = (filters.indexOf(cameraFilter) + 1) % filters.length;
                  setCameraFilter(filters[nextIdx]);
                  playAudio('preset:digital', 0);
                }}
                className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/10 border border-white/20 flex items-center gap-1 hover:bg-white/20 cursor-pointer"
                title="Filtro Fotocamera"
              >
                <SlidersHorizontal size={10} />
                <span className="uppercase">{cameraFilter === 'normal' ? 'Originale' : cameraFilter}</span>
              </button>
            </div>

            {/* Viewfinder Main Area */}
            <div 
              onTouchStart={handleTouchStartSwipe}
              onTouchEnd={handleTouchEndSwipe}
              onMouseDown={handleMouseDownSwipe}
              onMouseUp={handleMouseUpSwipe}
              className="flex-1 relative bg-neutral-950 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
            >
              {/* Camera Preview Image */}
              <img
                src={
                  viewfinderPhotoIndex !== null && cameraPhotos[viewfinderPhotoIndex]
                    ? cameraPhotos[viewfinderPhotoIndex]
                    : (customViewfinderUrl || activeAppToken.weatherBgUrl || "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800")
                }
                alt="Camera Viewfinder"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-300 pointer-events-none"
                style={{
                  filter: viewfinderPhotoIndex !== null ? 'none' : (() => {
                    let base = '';
                    if (cameraFilter === 'mono') base += 'grayscale(1) contrast(1.2) ';
                    else if (cameraFilter === 'warm') base += 'sepia(0.35) saturate(1.4) hue-rotate(-10deg) ';
                    else if (cameraFilter === 'cool') base += 'saturate(1.2) hue-rotate(15deg) brightness(1.05) ';
                    else if (cameraFilter === 'dramatic') base += 'contrast(1.5) brightness(0.9) saturate(1.3) ';
                    
                    if (isNightModeOn) base += 'brightness(1.3) contrast(0.9) saturate(1.1) ';
                    if (cameraExposure !== 0) base += `brightness(${1 + cameraExposure * 0.15}) `;
                    return base || 'none';
                  })(),
                  transform: viewfinderPhotoIndex !== null 
                    ? (isCameraFront ? 'scaleX(-1)' : 'none') 
                    : `scale(${
                        cameraZoom === '0.5x' ? 0.75 : cameraZoom === '2x' ? 1.5 : cameraZoom === '5x' ? 2.5 : 1.0
                      }) ${isCameraFront ? 'scaleX(-1)' : ''}`,
                }}
                referrerPolicy="no-referrer"
              />

              {/* Shutter flash overlay effect */}
              <AnimatePresence>
                {cameraShutterFlash && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 bg-white z-20 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* 3x3 Rule of Thirds Grid overlay */}
              {isCameraGridOn && viewfinderPhotoIndex === null && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10">
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-white/25" />
                  <div className="border-r border-white/25" />
                  <div className="border-none" />
                </div>
              )}

              {/* Central Yellow Focus Reticle with Exposure Slider */}
              {viewfinderPhotoIndex === null && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
                  {cameraExposure !== 0 && (
                    <span className="text-[9px] font-mono font-bold bg-black/60 px-1 py-0.5 rounded text-yellow-400 mt-1 animate-pulse">
                      EV {cameraExposure > 0 ? `+${cameraExposure}` : cameraExposure}
                    </span>
                  )}
                </div>
              )}

              {/* Video Recording Timer banner */}
              {cameraMode === 'VIDEO' && isRecording && viewfinderPhotoIndex === null && (
                <div className="absolute top-4 bg-red-600/95 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-20 animate-pulse border border-red-500 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  REC {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                </div>
              )}

              {/* Floating Zoom Badges */}
              {viewfinderPhotoIndex === null && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/55 backdrop-blur-md px-3 py-1 rounded-full z-20 border border-white/10">
                  {(['0.5x', '1x', '2x', '5x'] as const).map((z) => (
                    <button
                      key={z}
                      onClick={() => {
                        setCameraZoom(z);
                        playAudio('preset:digital', 0);
                      }}
                      className={`text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        cameraZoom === z 
                          ? 'bg-yellow-400 text-black scale-110 shadow-md font-extrabold' 
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {z.replace('x', '')}
                    </button>
                  ))}
                </div>
              )}

              {/* Exposure interactive controls */}
              {viewfinderPhotoIndex === null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 bg-black/50 p-1.5 rounded-full border border-white/10 z-10">
                  <button 
                    onClick={() => setCameraExposure(p => Math.min(2, p + 1))} 
                    className="w-5 h-5 text-[10px] font-bold flex items-center justify-center hover:bg-white/10 rounded-full cursor-pointer"
                  >
                    +
                  </button>
                  <div className="w-0.5 h-12 bg-white/20 relative rounded-full">
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full transition-all"
                      style={{ bottom: `${(cameraExposure + 2) * 25}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => setCameraExposure(p => Math.max(-2, p - 1))} 
                    className="w-5 h-5 text-[10px] font-bold flex items-center justify-center hover:bg-white/10 rounded-full cursor-pointer"
                  >
                    -
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Swiper & Controls Section */}
            <div className="bg-black py-4 px-6 flex flex-col justify-between shrink-0 select-none z-10 relative">
              {/* Mode Slider / Selector */}
              <div className="flex justify-center items-center gap-6 overflow-x-auto py-1 mb-3.5 border-b border-white/5 scrollbar-none scroll-smooth">
                {(['NIGHT', 'VIDEO', 'FOTO', 'RITRATTO', 'PANORAMICA'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCameraMode(m);
                      setIsRecording(false);
                      playAudio('preset:digital', 0);
                    }}
                    className={`text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 ${
                      cameraMode === m 
                        ? 'text-yellow-400 font-black scale-105 underline underline-offset-4 decoration-2' 
                        : 'text-white/45 hover:text-white/85'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Controls Shutter line */}
              <div className="flex items-center justify-between px-2">
                {/* Photo Gallery square thumbnail */}
                <button
                  onClick={() => {
                    setGalleryOpen(true);
                    playAudio('preset:digital', 0);
                  }}
                  className="w-11 h-11 rounded-xl bg-neutral-900 border border-white/25 overflow-hidden active:scale-90 transition-all cursor-pointer flex items-center justify-center shadow-lg group"
                  title="Apri Galleria"
                >
                  {cameraPhotos.length > 0 ? (
                    <img
                      src={cameraPhotos[0]}
                      alt="Gallery Preview"
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white/40 text-[9px]">
                      Vuoto
                    </div>
                  )}
                </button>

                {/* Shutter Button */}
                <button
                  onClick={() => {
                    if (cameraMode === 'VIDEO') {
                      setIsRecording(!isRecording);
                      playAudio('preset:marimba', 0);
                    } else {
                      // Trigger shutter click!
                      setCameraShutterFlash(true);
                      playAudio('preset:digital', 0);
                      setTimeout(() => setCameraShutterFlash(false), 120);

                      // Capture snapshot
                      const currentImg = (viewfinderPhotoIndex !== null && cameraPhotos[viewfinderPhotoIndex])
                        ? cameraPhotos[viewfinderPhotoIndex]
                        : (customViewfinderUrl || activeAppToken.weatherBgUrl || "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800");
                      setCameraPhotos(prev => [currentImg, ...prev]);
                      setViewfinderPhotoIndex(null); // Return to live viewfinder
                    }
                  }}
                  className={`relative flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer ${
                    cameraMode === 'VIDEO'
                      ? 'w-[68px] h-[68px] border-[4px] border-white bg-transparent'
                      : 'w-[68px] h-[68px] border-[4px] border-white bg-white'
                  }`}
                  title={cameraMode === 'VIDEO' ? (isRecording ? 'Interrompi Registrazione' : 'Avvia Registrazione') : 'Scatta Foto'}
                >
                  {cameraMode === 'VIDEO' ? (
                    <div className={`transition-all duration-300 ${isRecording ? 'w-5 h-5 bg-red-600 rounded-sm' : 'w-10 h-10 bg-red-600 rounded-full animate-pulse'}`} />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-full border border-black/10 bg-white" />
                  )}
                </button>

                {/* Camera Flip Button */}
                <button
                  onClick={() => {
                    setIsCameraFront(!isCameraFront);
                    playAudio('preset:retro', 0);
                  }}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/18 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md"
                  title="Inverti Fotocamera"
                >
                  <RotateCw size={18} className={`transition-transform duration-500 ${isCameraFront ? 'rotate-180 text-yellow-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Home indicator bar padding */}
            <div className="h-6 shrink-0 z-10 relative pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING GALLERY MODAL FOR CAMERA APP */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-neutral-950 z-50 overflow-hidden flex flex-col justify-between"
            style={{ borderRadius: isFullscreenDisplay ? '42px' : '42px' }}
          >
            {/* Gallery Header */}
            <div className="pt-10 pb-3 px-4 bg-neutral-900 border-b border-white/5 flex justify-between items-center z-10 relative">
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-neutral-400 block uppercase">Fotocamera</span>
                <h2 className="text-sm font-bold text-white tracking-tight">Rullino Foto ({displayedPhotos.length})</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="camera-photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => {
                    document.getElementById('camera-photo-upload')?.click();
                    playAudio('preset:digital', 0);
                  }}
                  className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-full font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                  title="Carica nuove foto"
                >
                  <Plus size={12} />
                  Carica
                </button>
                <button
                  onClick={() => {
                    setGalleryOpen(false);
                    setSelectedGalleryPhotoIndex(null);
                    setIsSelectMode(false);
                    setSelectedPhotoIndexes([]);
                    setLastSelectedIndex(null);
                    playAudio('preset:digital', 0);
                  }}
                  className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-white font-semibold cursor-pointer active:scale-95 transition-all"
                >
                  Chiudi
                </button>
              </div>
            </div>

            {/* Albums horizontal scroll row */}
            <div className="bg-neutral-900 px-4 py-2.5 border-b border-white/5 flex gap-2 items-center overflow-x-auto scrollbar-none shrink-0 z-10 relative">
              {albums.map((album) => {
                const isActive = selectedAlbumId === album.id;
                return (
                  <button
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbumId(album.id);
                      setSelectedGalleryPhotoIndex(null);
                      setIsSelectMode(false);
                      setSelectedPhotoIndexes([]);
                      setLastSelectedIndex(null);
                      playAudio('preset:digital', 0);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                      isActive 
                        ? 'bg-white text-black border-white shadow-md' 
                        : 'bg-white/5 text-white/75 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {album.id === 'all' && <ImageIcon size={11} />}
                    {album.id === 'favorites' && <Heart size={11} className={album.photos.length > 0 ? "fill-red-500 text-red-500" : ""} />}
                    {album.id !== 'all' && album.id !== 'favorites' && <Folder size={11} />}
                    <span>{album.name}</span>
                    <span className={`text-[9px] font-mono opacity-60 ${isActive ? 'text-black/80' : 'text-white/60'}`}>
                      ({album.id === 'all' ? cameraPhotos.length : album.photos.length})
                    </span>
                  </button>
                );
              })}
              
              <button
                onClick={() => {
                  setShowCreateAlbumModal(true);
                  playAudio('preset:digital', 0);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/15 flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95"
                title="Crea nuovo album"
              >
                <FolderPlus size={12} />
                <span>+ Album</span>
              </button>

              <button
                onClick={() => {
                  setShowCameraAlbumsManager(true);
                  playAudio('preset:digital', 0);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-white/10 flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95"
                title="Gestisci o elimina album"
              >
                <SlidersHorizontal size={12} />
                <span>Gestisci</span>
              </button>
            </div>

            {/* Selection Toolbar Banner */}
            {isSelectMode && (
              <div className="bg-neutral-900 border-b border-yellow-500/20 py-2 px-4 flex justify-between items-center text-xs shrink-0 z-10 relative animate-fade-in">
                <span className="text-yellow-400 font-bold font-mono">{selectedPhotoIndexes.length} selezionate</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setShowAddToAlbumModal(true);
                      playAudio('preset:digital', 0);
                    }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-yellow-400 hover:text-yellow-300 px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer border border-white/5"
                    title="Aggiungi all'album"
                  >
                    <FolderPlus size={11} />
                    Album
                  </button>

                  {selectedAlbumId !== 'all' && (
                    <button
                      onClick={() => {
                        const urlsToRemove = selectedPhotoIndexes.map(idx => displayedPhotos[idx]);
                        setAlbums(prev => prev.map(album => {
                          if (album.id === selectedAlbumId) {
                            return {
                              ...album,
                              photos: album.photos.filter(photo => !urlsToRemove.includes(photo))
                            };
                          }
                          return album;
                        }));
                        setSelectedPhotoIndexes([]);
                        setIsSelectMode(false);
                        setLastSelectedIndex(null);
                        playAudio('preset:marimba', 0);
                      }}
                      className="bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer border border-amber-500/20"
                      title="Rimuovi da questo album"
                    >
                      Rimuovi
                    </button>
                  )}

                  {selectedPhotoIndexes.length === 1 && (
                    <button
                      onClick={() => {
                        const selectedPhoto = displayedPhotos[selectedPhotoIndexes[0]];
                        setCustomViewfinderUrl(selectedPhoto);
                        playAudio('preset:digital', 0);
                        setIsSelectMode(false);
                        setSelectedPhotoIndexes([]);
                        setLastSelectedIndex(null);
                      }}
                      className="bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer border border-cyan-500/25"
                      title="Imposta sfondo fotocamera"
                    >
                      <Pencil size={11} />
                      Sfondo
                    </button>
                  )}
                  <button
                    onClick={deleteSelectedPhotos}
                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 size={11} />
                    Elimina
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPhotoIndexes([]);
                      setIsSelectMode(false);
                      setLastSelectedIndex(null);
                      playAudio('preset:digital', 0);
                    }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1 rounded font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}

            {/* Grid list of pictures */}
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-1 z-10 relative scrollbar-none bg-neutral-950">
              {displayedPhotos.map((photo, idx) => {
                const isSelected = selectedPhotoIndexes.includes(idx);
                const isMirrored = mirroredPhotos.includes(photo);
                return (
                  <div
                    key={idx}
                    onTouchStart={() => startPress(idx)}
                    onTouchEnd={() => endPress(idx)}
                    onTouchCancel={cancelPress}
                    onMouseDown={() => startPress(idx)}
                    onMouseUp={() => endPress(idx)}
                    onMouseLeave={cancelPress}
                    className={`aspect-square bg-neutral-900 border overflow-hidden rounded-xl relative cursor-pointer group select-none transition-all duration-200 ${
                      isSelected 
                        ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-95' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${idx}`}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none ${
                        isMirrored ? 'scale-x-[-1]' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Multi-selection Checkbox indicator */}
                    {isSelectMode && (
                      <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full border border-white/60 flex items-center justify-center bg-black/60 z-10">
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-scale-up" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {displayedPhotos.length === 0 && (
                <div className="col-span-3 py-16 text-center text-xs text-white/40 flex flex-col items-center justify-center gap-3">
                  <ImageIcon size={24} className="text-white/20 animate-pulse" />
                  <span>Nessuna foto in questo album.</span>
                </div>
              )}
            </div>

            {/* Custom home space */}
            <div className="h-6 shrink-0 z-10 relative pointer-events-none" />

            {/* CREATE ALBUM OVERLAY */}
            <AnimatePresence>
              {showCreateAlbumModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-5 w-full max-w-[280px] space-y-4 shadow-2xl"
                  >
                    <div className="text-center space-y-1">
                      <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FolderPlus size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nuovo Album</h3>
                      <p className="text-[10px] text-neutral-400">Inserisci il nome del nuovo album</p>
                    </div>

                    <input
                      type="text"
                      autoFocus
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Nome album..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          createAlbum(newAlbumName);
                        } else if (e.key === 'Escape') {
                          setShowCreateAlbumModal(false);
                          setNewAlbumName("");
                        }
                      }}
                    />

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <button
                        onClick={() => {
                          setShowCreateAlbumModal(false);
                          setNewAlbumName("");
                          playAudio('preset:digital', 0);
                        }}
                        className="py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-all cursor-pointer"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => createAlbum(newAlbumName)}
                        className="py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all cursor-pointer"
                      >
                        Crea
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ADD TO ALBUM OVERLAY */}
            <AnimatePresence>
              {showAddToAlbumModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-5 w-full max-w-[280px] space-y-4 shadow-2xl"
                  >
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Aggiungi ad Album</h3>
                      <p className="text-[10px] text-neutral-400">Seleziona album di destinazione</p>
                    </div>

                    <div className="max-h-[160px] overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                      {albums.filter(a => a.id !== 'all').map(album => (
                        <button
                          key={album.id}
                          onClick={() => {
                            addSelectedToAlbum(album.id);
                            setShowAddToAlbumModal(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-between border border-white/5 transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            {album.id === 'favorites' ? <Heart size={12} className="fill-red-500 text-red-500" /> : <Folder size={12} className="text-cyan-400" />}
                            {album.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">({album.photos.length})</span>
                        </button>
                      ))}
                      {albums.filter(a => a.id !== 'all').length === 0 && (
                        <p className="text-[11px] text-neutral-500 text-center py-4">Nessun album custom disponibile.</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowAddToAlbumModal(false);
                        playAudio('preset:digital', 0);
                      }}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Chiudi
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GESTIONE TUTTI GLI ALBUM FOTOCAMERA (MANAGER) */}
            <AnimatePresence>
              {showCameraAlbumsManager && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-5 w-full max-w-[290px] max-h-[80vh] flex flex-col justify-between shadow-2xl"
                  >
                    <div className="space-y-1 shrink-0 mb-3 text-center">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider text-cyan-400">Gestisci Album</h3>
                      <p className="text-[10px] text-neutral-400">Modifica il nome o elimina i tuoi album organizzati</p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none my-1">
                      {albums.map((album) => {
                        const isSystemAlbum = album.id === 'all' || album.id === 'favorites';
                        const isRenaming = renamingCameraAlbumId === album.id;

                        return (
                          <div 
                            key={album.id}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 transition-all"
                          >
                            {isRenaming ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  type="text"
                                  value={renamingCameraAlbumName}
                                  onChange={(e) => setRenamingCameraAlbumName(e.target.value)}
                                  className="flex-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      renameCameraAlbum(album.id, renamingCameraAlbumName);
                                    } else if (e.key === 'Escape') {
                                      setRenamingCameraAlbumId(null);
                                      setRenamingCameraAlbumName("");
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => renameCameraAlbum(album.id, renamingCameraAlbumName)}
                                  className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                                  title="Salva"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    setRenamingCameraAlbumId(null);
                                    setRenamingCameraAlbumName("");
                                    playAudio('preset:digital', 0);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                                  title="Annulla"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <button
                                  onClick={() => {
                                    setSelectedAlbumId(album.id);
                                    setShowCameraAlbumsManager(false);
                                    setSelectedGalleryPhotoIndex(null);
                                    setIsSelectMode(false);
                                    setSelectedPhotoIndexes([]);
                                    setLastSelectedIndex(null);
                                    playAudio('preset:digital', 0);
                                  }}
                                  className="flex-1 text-left flex items-center gap-2 group cursor-pointer"
                                  title="Seleziona e vedi foto"
                                >
                                  <div className="text-neutral-400 group-hover:text-cyan-400 transition-colors">
                                    {album.id === 'all' && <ImageIcon size={14} />}
                                    {album.id === 'favorites' && <Heart size={14} className={album.photos.length > 0 ? "fill-red-500 text-red-500" : ""} />}
                                    {album.id !== 'all' && album.id !== 'favorites' && <Folder size={14} className="text-cyan-400" />}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                      {album.name}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-mono">
                                      {album.id === 'all' ? cameraPhotos.length : album.photos.length} foto
                                    </span>
                                  </div>
                                </button>

                                {!isSystemAlbum && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    {/* Rename */}
                                    <button
                                      onClick={() => {
                                        setRenamingCameraAlbumId(album.id);
                                        setRenamingCameraAlbumName(album.name);
                                        playAudio('preset:digital', 0);
                                      }}
                                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
                                      title="Rinomina Album"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    {/* Delete */}
                                    <button
                                      onClick={() => {
                                        if (deletingCameraAlbumId === album.id) {
                                          deleteCameraAlbum(album.id);
                                          setDeletingCameraAlbumId(null);
                                        } else {
                                          setDeletingCameraAlbumId(album.id);
                                          playAudio('preset:digital', 0);
                                        }
                                      }}
                                      className={`h-7 px-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-90 ${
                                        deletingCameraAlbumId === album.id
                                          ? "bg-red-600 text-white font-bold animate-pulse"
                                          : "bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white"
                                      }`}
                                      title={deletingCameraAlbumId === album.id ? "Clicca di nuovo per confermare l'eliminazione" : "Elimina Album"}
                                    >
                                      {deletingCameraAlbumId === album.id ? (
                                        <span className="text-[9px] uppercase tracking-wider">Sicuro?</span>
                                      ) : (
                                        <Trash2 size={12} />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setShowCameraAlbumsManager(false);
                        setRenamingCameraAlbumId(null);
                        setRenamingCameraAlbumName("");
                        playAudio('preset:digital', 0);
                      }}
                      className="w-full mt-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      Chiudi
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FULL SCREEN PHOTO VIEWER WITHIN GALLERY */}
            <AnimatePresence>
              {selectedGalleryPhoto && (
                <motion.div
                  initial={{ opacity: 0, y: '5%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '5%' }}
                  className="absolute inset-0 bg-black z-50 flex flex-col justify-between"
                  onTouchStart={handleTouchStartFull}
                  onTouchEnd={handleTouchEndFull}
                  onMouseDown={handleMouseDownFull}
                  onMouseUp={handleMouseUpFull}
                >
                  <div className="pt-10 pb-4 px-4 bg-black/60 backdrop-blur-md flex justify-between items-center z-10">
                    <button
                      onClick={() => {
                        setSelectedGalleryPhotoIndex(null);
                        playAudio('preset:digital', 0);
                      }}
                      className="text-xs bg-white/15 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold cursor-pointer"
                    >
                      Indietro
                    </button>
                    
                    <div className="flex gap-2">
                      {/* Mirror Button (Specchio) */}
                      <button
                        onClick={() => {
                          setMirroredPhotos(prev => {
                            if (prev.includes(selectedGalleryPhoto)) {
                              return prev.filter(u => u !== selectedGalleryPhoto);
                            } else {
                              return [...prev, selectedGalleryPhoto];
                            }
                          });
                          playAudio('preset:digital', 0);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all flex items-center gap-1 border ${
                          mirroredPhotos.includes(selectedGalleryPhoto)
                            ? 'bg-yellow-400 text-black border-yellow-400'
                            : 'bg-white/10 hover:bg-white/20 text-white border-white/5'
                        }`}
                        title="Specchia immagine"
                      >
                        <RefreshCw size={11} className={mirroredPhotos.includes(selectedGalleryPhoto) ? "rotate-180 duration-500" : ""} />
                        Specchia
                      </button>

                      {/* Favorite button (Aggiungi a Preferiti) */}
                      <button
                        onClick={() => {
                          setAlbums(prev => prev.map(a => {
                            if (a.id === 'favorites') {
                              const isFav = a.photos.includes(selectedGalleryPhoto);
                              return {
                                ...a,
                                photos: isFav 
                                  ? a.photos.filter(p => p !== selectedGalleryPhoto)
                                  : [...a.photos, selectedGalleryPhoto]
                              };
                            }
                            return a;
                          }));
                          playAudio('preset:bell', 0);
                        }}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all flex items-center gap-1 border border-white/5"
                      >
                        <Heart 
                          size={11} 
                          className={albums.find(a => a.id === 'favorites')?.photos.includes(selectedGalleryPhoto) ? "fill-red-500 text-red-500" : "text-white"} 
                        />
                        Preferito
                      </button>
                    </div>
                  </div>

                  {/* Centered Image display with optional mirror transformation */}
                  <div className="flex-1 flex items-center justify-center p-2 select-none relative">
                    <motion.img
                      key={selectedGalleryPhotoIndex}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      src={selectedGalleryPhoto}
                      alt="Full Screen View"
                      className={`max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 ${
                        mirroredPhotos.includes(selectedGalleryPhoto) ? 'scale-x-[-1]' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Actions footer bar */}
                  <div className="pb-8 pt-4 px-6 bg-black/60 backdrop-blur-md flex justify-between items-center z-10">
                    <button
                      onClick={() => {
                        setCustomViewfinderUrl(selectedGalleryPhoto);
                        playAudio('preset:digital', 0);
                        setSelectedGalleryPhotoIndex(null);
                      }}
                      className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-1.5 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1"
                      title="Imposta come sfondo fotocamera"
                    >
                      <Pencil size={11} />
                      Sfondo
                    </button>

                    <button
                      onClick={() => {
                        if (selectedGalleryPhotoIndex !== null) {
                          const photoUrl = displayedPhotos[selectedGalleryPhotoIndex];
                          
                          // Permanently remove from camera roll and all albums
                          setCameraPhotos(prev => prev.filter(p => p !== photoUrl));
                          setAlbums(prev => prev.map(a => ({
                            ...a,
                            photos: a.photos.filter(p => p !== photoUrl)
                          })));

                          // Close preview
                          setSelectedGalleryPhotoIndex(null);
                        }
                        playAudio('preset:marimba', 0);
                      }}
                      className="text-xs bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white px-3.5 py-1.5 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1 border border-red-500/20"
                    >
                      <Trash2 size={11} />
                      Elimina
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
