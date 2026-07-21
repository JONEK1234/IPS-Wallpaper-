export function generateOfflineHtml(
  gridItemsJson: string,
  dockItemsJson: string,
  totalPages: number,
  backgroundUrlEscaped: string
): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <!-- iScreen Backup State for Import -->
  <script id="iscreen-import-data" type="application/json">
    {
      "gridItems": ${gridItemsJson},
      "dockItems": ${dockItemsJson},
      "totalPages": ${totalPages},
      "backgroundUrl": "${backgroundUrlEscaped}"
    }
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>iPhone iScreen - App Offline</title>
  <!-- Google Fonts Pairing -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body {
      background-color: #0c111d;
      color: #f3f4f6;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    /* Custom scrollbar elimination */
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    
    /* Continuous page container transition */
    .pages-slider {
      display: flex;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      height: 100%;
    }
    .page-screen {
      min-width: 100%;
      height: 100%;
    }

    #iphone-wrapper {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: #000;
      transition: all 0.5s ease;
    }

    /* On Desktop screens, display centered device frame mockup */
    @media (min-width: 1024px) {
      #iphone-wrapper {
        position: relative;
        width: 390px;
        height: 844px;
        border: 11px solid #1e293b;
        border-radius: 52px;
        box-shadow: 0 25px 60px -15px rgba(0,0,0,0.95);
        outline: 4px solid rgba(30,41,59,0.5);
      }
      #mock-notch {
        display: flex;
      }
    }

    /* On Tablets and Mobile, fill screen completely */
    @media (max-width: 1023px) {
      #iphone-wrapper {
        border: none;
        border-radius: 0px;
        outline: none;
        box-shadow: none;
      }
      #mock-notch {
        display: none;
      }
    }

    /* Slide-up transition for app overlays */
    .app-overlay {
      position: absolute;
      inset: 0;
      background-color: #000;
      z-index: 45;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
      opacity: 0;
      pointer-events: none;
    }
    .app-overlay.active {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
  </style>
</head>
<body class="fixed inset-0 w-screen h-screen m-0 p-0 flex items-center justify-center select-none overflow-hidden">

  <!-- Immersive Blurred Wallpaper Backdrop on Desktop -->
  <div class="absolute inset-0 bg-cover bg-center filter blur-3xl brightness-[0.25] scale-110 pointer-events-none" style="background-image: url('${backgroundUrlEscaped}');"></div>
  <div class="absolute inset-0 bg-black/35 pointer-events-none"></div>

  <!-- Responsive Navigation Arrows on Desktop -->
  <button onclick="prevPage()" class="absolute left-6 md:left-[calc(50%-260px)] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white/80 p-3.5 rounded-full z-30 transition-all active:scale-90 hidden lg:block shadow-xl border border-white/5 backdrop-blur-md">
    <i data-lucide="chevron-left" class="w-5 h-5"></i>
  </button>
  <button onclick="nextPage()" class="absolute right-6 md:right-[calc(50%-260px)] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white/80 p-3.5 rounded-full z-30 transition-all active:scale-90 hidden lg:block shadow-xl border border-white/5 backdrop-blur-md">
    <i data-lucide="chevron-right" class="w-5 h-5"></i>
  </button>

  <!-- Centered high-fidelity simulated phone -->
  <div id="iphone-wrapper">
    <!-- Solid Wallpaper background inside simulator -->
    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${backgroundUrlEscaped}');"></div>
    <div class="absolute inset-0 bg-black/15 pointer-events-none"></div>

    <!-- Dynamic Island / Notch -->
    <div id="mock-notch" class="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-full z-40 flex items-center justify-between px-3">
      <div class="w-2.5 h-2.5 bg-neutral-900 border border-neutral-800 rounded-full"></div>
      <div class="w-1.5 h-1.5 bg-neutral-950 rounded-full"></div>
    </div>

    <!-- Status Bar -->
    <div class="px-6 flex justify-between items-end pb-1.5 text-white font-sans text-[12px] font-semibold z-30 relative select-none pt-5 h-14">
      <span id="live-time">12:00</span>
      <div class="flex items-center gap-1.5">
        <i data-lucide="signal" class="w-3 h-3"></i>
        <i data-lucide="wifi" class="w-3 h-3"></i>
        <i data-lucide="battery" class="w-4 h-4"></i>
      </div>
    </div>

    <!-- Main Screens View Slider -->
    <div class="flex-grow px-2 overflow-hidden z-20 relative h-[calc(100%-150px)]">
      <div id="pages-slider-container" class="pages-slider">
        <!-- Injected via javascript -->
      </div>
    </div>

    <!-- Swiper dots -->
    <div id="dots-container" class="h-5 flex items-center justify-center gap-1.5 z-20 relative select-none mb-1">
      <!-- Injected via javascript -->
    </div>

    <!-- Bottom Dock -->
    <div class="p-3 pb-3 z-20 relative select-none">
      <div id="dock-container" class="w-full h-[78px] rounded-[28px] bg-white/12 backdrop-blur-xl border border-white/18 shadow-xl flex justify-around items-center px-2">
        <!-- Injected via javascript -->
      </div>
    </div>

    <!-- Apple style Home Indicator -->
    <div class="h-5 pb-2.5 flex items-center justify-center z-30 relative select-none">
      <div class="w-[110px] h-1 bg-white/80 rounded-full"></div>
    </div>

    <!-- Immersive Photo Overlays Inside mockup (zoom) -->
    <div id="photo-overlay" class="absolute inset-0 bg-black/95 z-50 flex items-center justify-center overflow-hidden hidden" onclick="closePhotoOverlay()">
      <img id="overlay-img" src="" class="w-full h-full object-contain pointer-events-none">
      <button onclick="closePhotoOverlay(); event.stopPropagation();" class="absolute top-14 right-4 bg-black/60 hover:bg-black/85 text-white/90 rounded-full p-2.5 border border-white/10 z-[60]">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- MOTIVATIONAL WEATHER APP OVERLAY (MOTIVA-METEO TOKEN) -->
    <div id="motivational-overlay" class="app-overlay">
      <!-- Custom Background Photo -->
      <img id="motivational-bg-img" src="" alt="Meteo Background" class="absolute inset-0 w-full h-full transition-all">
      
      <!-- Ambient Dark/Reddish overlay for dramatic motivational mood -->
      <div id="motivational-overlay-opacity" class="absolute inset-0 bg-gradient-to-b from-black/90 via-black/45 to-black/95 pointer-events-none transition-opacity duration-350"></div>

      <!-- Simulated app notch space & status bar -->
      <div class="h-10 shrink-0 z-10 relative pointer-events-none"></div>

      <!-- App Header (Back arrow & Title) -->
      <div class="px-5 py-2 flex items-center justify-between z-10 relative">
        <button
          onclick="closeMotivationalApp()"
          class="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
          title="Torna indietro alla Schermata Home"
        >
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
        </button>
        
        <div class="text-center">
          <span class="text-[10px] uppercase tracking-widest text-red-500 font-extrabold block">METEO DI FERRO</span>
          <span class="text-xs font-bold text-white tracking-tight">Cielo Reale</span>
        </div>

        <div class="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-red-500">
          <i data-lucide="flame" class="w-4 h-4 animate-pulse"></i>
        </div>
      </div>

      <!-- Scrollable / Interactive Weather App Content -->
      <div class="flex-grow px-5 pt-4 pb-2 flex flex-col justify-between z-10 relative overflow-y-auto scrollbar-none">
        
        <!-- Dynamic Weather Condition Card -->
        <div class="bg-black/60 backdrop-blur-md border border-red-500/30 p-4 rounded-3xl text-center space-y-3 shadow-xl">
          <div class="flex justify-center items-center gap-3">
            <span id="motivational-temp" class="text-4xl font-black text-white font-mono tracking-tighter">14°C</span>
            
            <div class="text-left">
              <span class="text-[11px] font-bold uppercase tracking-wider text-red-400 block">Condizione</span>
              <span id="motivational-cond" class="text-sm font-black text-white uppercase tracking-tight">Pioggia di Ferro</span>
            </div>
          </div>

          <div class="flex items-center justify-center gap-2 bg-red-950/40 border border-red-900/40 py-1.5 px-3 rounded-xl max-w-xs mx-auto">
            <i id="motivational-icon" data-lucide="wind" class="w-3.5 h-3.5 text-cyan-400"></i>
            <span class="text-[10px] font-mono font-bold text-red-200 uppercase tracking-widest">STATO ENERGETICO: MAX</span>
          </div>
        </div>

        <!-- Huge RAW Motivational Quote Block -->
        <div class="my-auto py-4 flex flex-col justify-center items-center text-center space-y-4">
          <span class="text-red-500 text-[10px] font-extrabold tracking-widest uppercase bg-red-950/60 border border-red-800/40 px-3 py-1 rounded-full">
            IL METEO NON HA PIETÀ
          </span>
          
          <h2 id="motivational-quote-text" class="text-lg sm:text-xl font-black text-white leading-tight uppercase tracking-tight select-text">
            "ALZATI E SPINGI! Il divano non paga le tue bollette e la pioggia è solo un'altra scusa per i deboli."
          </h2>
          
          <div class="w-12 h-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-full"></div>
        </div>

        <!-- Bottom Interactive Trigger to Cycle Quote -->
        <div class="space-y-3 pt-2">
          <button
            onclick="cycleMotivationalQuote()"
            class="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 border border-red-400/30 cursor-pointer transition-all"
          >
            <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
            CARICA DI ADRENALINA
          </button>

          <p class="text-[9px] text-center text-slate-500 uppercase tracking-wider">
            Clicca per cambiare meteo e frase motivazionale
          </p>
        </div>

      </div>

      <!-- Custom Bottom Home bar spacing -->
      <div class="h-6 shrink-0 z-10 relative pointer-events-none"></div>
    </div>

    <!-- CAMERA SIMULATOR APP OVERLAY -->
    <div id="camera-overlay" class="app-overlay text-white">
      <!-- Simulated app notch space & status bar -->
      <div class="h-9 shrink-0 z-10 relative pointer-events-none"></div>

      <!-- Top Bar Controls -->
      <div class="px-4 py-2 flex items-center justify-between z-10 relative bg-black/40 backdrop-blur-sm shrink-0">
        <button
          onclick="closeCameraApp()"
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
          title="Chiudi Fotocamera"
        >
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>

        <!-- Central indicators -->
        <div class="flex items-center gap-3">
          <!-- Flash Toggle -->
          <button
            id="camera-btn-flash"
            onclick="toggleCameraFlash()"
            class="p-1.5 rounded-full transition-all bg-white/10 text-white cursor-pointer"
            title="Flash"
          >
            <i data-lucide="zap" class="w-3.5 h-3.5"></i>
          </button>

          <!-- Night Mode Toggle -->
          <button
            id="camera-btn-night"
            onclick="toggleCameraNight()"
            class="p-1.5 rounded-full transition-all bg-white/10 text-white cursor-pointer"
            title="Modalità Notte"
          >
            <i data-lucide="moon" class="w-3.5 h-3.5"></i>
          </button>

          <!-- Grid Lines Toggle -->
          <button
            id="camera-btn-grid"
            onclick="toggleCameraGrid()"
            class="p-1.5 rounded-full transition-all bg-white/10 text-white cursor-pointer"
            title="Griglia dei Terzi"
          >
            <i data-lucide="grid-3x3" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Custom Selector for Filter -->
        <button
          onclick="cycleCameraFilter()"
          class="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/10 border border-white/20 flex items-center gap-1 hover:bg-white/20 cursor-pointer"
          title="Filtro Fotocamera"
        >
          <i data-lucide="sliders-horizontal" class="w-3 h-3"></i>
          <span id="camera-filter-label" class="uppercase">ORIGINALE</span>
        </button>
      </div>

      <!-- Viewfinder Main Area -->
      <div class="flex-1 relative bg-neutral-950 flex items-center justify-center overflow-hidden">
        <!-- Camera Preview Image -->
        <img
          id="camera-viewfinder-img"
          src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800"
          alt="Camera Viewfinder"
          class="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          referrerPolicy="no-referrer"
        />

        <!-- Shutter flash overlay effect -->
        <div id="camera-shutter-flash" class="absolute inset-0 bg-white z-20 pointer-events-none opacity-0 transition-opacity duration-100"></div>

        <!-- 3x3 Rule of Thirds Grid overlay -->
        <div id="camera-grid-lines" class="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 hidden">
          <div class="border-r border-b border-white/25"></div>
          <div class="border-r border-b border-white/25"></div>
          <div class="border-b border-white/25"></div>
          <div class="border-r border-b border-white/25"></div>
          <div class="border-r border-b border-white/25"></div>
          <div class="border-b border-white/25"></div>
          <div class="border-r border-white/25"></div>
          <div class="border-r border-white/25"></div>
          <div class="border-none"></div>
        </div>

        <!-- Central Yellow Focus Reticle -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
          <span id="camera-exposure-badge" class="text-[9px] font-mono font-bold bg-black/60 px-1 py-0.5 rounded text-yellow-400 mt-1 hidden animate-pulse">EV 0</span>
        </div>

        <!-- Video Recording Timer banner -->
        <div id="camera-rec-banner" class="absolute top-4 bg-red-600/95 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-20 hidden border border-red-500 shadow-lg">
          <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
          REC <span id="camera-rec-timer">00:00</span>
        </div>

        <!-- Floating Zoom Badges -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/55 backdrop-blur-md px-3 py-1 rounded-full z-20 border border-white/10">
          <button onclick="setCameraZoom('0.5x')" id="zoom-btn-0.5x" class="text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer text-white/80 hover:text-white">0.5</button>
          <button onclick="setCameraZoom('1x')" id="zoom-btn-1x" class="text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer bg-yellow-400 text-black scale-110 shadow-md font-extrabold">1</button>
          <button onclick="setCameraZoom('2x')" id="zoom-btn-2x" class="text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer text-white/80 hover:text-white">2</button>
          <button onclick="setCameraZoom('5x')" id="zoom-btn-5x" class="text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer text-white/80 hover:text-white">5</button>
        </div>

        <!-- Exposure interactive controls -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 bg-black/50 p-1.5 rounded-full border border-white/10 z-10">
          <button onclick="changeCameraExposure(1)" class="w-5 h-5 text-[10px] font-bold flex items-center justify-center hover:bg-white/10 rounded-full cursor-pointer">+</button>
          <div class="w-0.5 h-12 bg-white/20 relative rounded-full">
            <div id="camera-exposure-dot" class="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full transition-all" style="bottom: 50%;"></div>
          </div>
          <button onclick="changeCameraExposure(-1)" class="w-5 h-5 text-[10px] font-bold flex items-center justify-center hover:bg-white/10 rounded-full cursor-pointer">-</button>
        </div>
      </div>

      <!-- Bottom Swiper & Controls Section -->
      <div class="bg-black py-4 px-6 flex flex-col justify-between shrink-0 select-none z-10 relative">
        <!-- Mode Slider / Selector -->
        <div class="flex justify-center items-center gap-6 overflow-x-auto py-1 mb-3.5 border-b border-white/5 scrollbar-none scroll-smooth">
          <button onclick="setCameraMode('NIGHT')" id="mode-btn-NIGHT" class="text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 text-white/45 hover:text-white/85">NIGHT</button>
          <button onclick="setCameraMode('VIDEO')" id="mode-btn-VIDEO" class="text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 text-white/45 hover:text-white/85">VIDEO</button>
          <button onclick="setCameraMode('FOTO')" id="mode-btn-FOTO" class="text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 text-yellow-400 font-black scale-105 underline underline-offset-4 decoration-2">FOTO</button>
          <button onclick="setCameraMode('RITRATTO')" id="mode-btn-RITRATTO" class="text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 text-white/45 hover:text-white/85">RITRATTO</button>
          <button onclick="setCameraMode('PANORAMICA')" id="mode-btn-PANORAMICA" class="text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 text-white/45 hover:text-white/85">PANORAMICA</button>
        </div>

        <!-- Controls Shutter line -->
        <div class="flex items-center justify-between px-2">
          <!-- Photo Gallery square thumbnail -->
          <button
            onclick="openExportGallery()"
            class="w-11 h-11 rounded-xl bg-neutral-900 border border-white/25 overflow-hidden active:scale-90 transition-all cursor-pointer flex items-center justify-center shadow-lg group"
            title="Apri Galleria"
          >
            <img
              id="camera-gallery-thumb"
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600"
              alt="Gallery Preview"
              class="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
            />
          </button>

          <!-- Shutter Button -->
          <button
            id="camera-shutter-btn"
            onclick="triggerCameraShutter()"
            class="relative flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer w-[68px] h-[68px] border-[4px] border-white bg-white"
            title="Scatta Foto"
          >
            <div id="camera-shutter-inner" class="w-[52px] h-[52px] rounded-full border border-black/10 bg-white"></div>
          </button>

          <!-- Camera Flip Button -->
          <button
            onclick="flipCameraSource()"
            class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/18 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md"
            title="Inverti Fotocamera"
          >
            <i id="camera-flip-icon" data-lucide="rotate-cw" class="w-4 h-4 transition-transform duration-500"></i>
          </button>
        </div>
      </div>

      <!-- Home indicator bar padding -->
      <div class="h-6 shrink-0 z-10 relative pointer-events-none"></div>
    </div>

    <!-- FLOATING GALLERY MODAL FOR CAMERA APP -->
    <div id="camera-gallery-overlay" class="app-overlay bg-neutral-950 z-50 overflow-hidden flex flex-col justify-between">
      <!-- Gallery Header -->
      <div class="pt-10 pb-3 px-4 bg-neutral-900 border-b border-white/5 flex justify-between items-center z-10 relative">
        <div class="flex flex-col">
          <span class="text-[10px] font-black tracking-widest text-neutral-400 block uppercase">Fotocamera</span>
          <h2 id="camera-gallery-title" class="text-sm font-bold text-white tracking-tight">Rullino Foto (4)</h2>
        </div>
        <div class="flex items-center gap-2">
          <input
            type="file"
            id="camera-photo-upload"
            accept="image/*"
            multiple
            onchange="handleExportPhotoUpload(event)"
            class="hidden"
          />
          <button
            onclick="document.getElementById('camera-photo-upload').click(); playAudio('preset:digital', 0);"
            class="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-full font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1"
            title="Carica nuove foto"
          >
            <i data-lucide="plus" class="w-3 h-3"></i>
            Carica
          </button>
          <button
            onclick="closeExportGallery()"
            class="text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-white font-semibold cursor-pointer active:scale-95 transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>

      <!-- Selection Toolbar Banner -->
      <div id="camera-select-banner" class="bg-neutral-900 border-b border-yellow-500/20 py-2 px-4 flex justify-between items-center text-xs shrink-0 z-10 relative hidden">
        <span id="camera-select-count" class="text-yellow-400 font-bold font-mono">0 selezionate</span>
        <div class="flex gap-1.5">
          <button id="camera-btn-setbg" onclick="setCameraBgFromSelected()" class="bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer border border-cyan-500/25" title="Imposta sfondo fotocamera">
            <i data-lucide="pencil" class="w-3 h-3"></i> Sfondo
          </button>
          <button onclick="deleteSelectedPhotos()" class="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold active:scale-95 transition-all cursor-pointer">
            <i data-lucide="trash-2" class="w-3 h-3"></i> Elimina
          </button>
          <button onclick="cancelMultiSelect()" class="bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1 rounded font-semibold active:scale-95 transition-all cursor-pointer">
            Annulla
          </button>
        </div>
      </div>

      <!-- Grid list of pictures -->
      <div id="camera-gallery-grid" class="flex-grow overflow-y-auto p-2 grid grid-cols-3 gap-1 z-10 relative scrollbar-none">
        <!-- Injected via JS -->
      </div>

      <!-- Custom home space -->
      <div class="h-6 shrink-0 z-10 relative pointer-events-none"></div>
    </div>

    <!-- FULL SCREEN PHOTO VIEWER WITHIN GALLERY -->
    <div id="camera-photo-viewer" class="app-overlay bg-black z-50 flex flex-col justify-between">
      <div class="pt-10 pb-4 px-4 bg-black/60 backdrop-blur-md flex justify-between items-center z-10">
        <button
          onclick="closeCameraPhotoViewer()"
          class="text-xs bg-white/15 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold cursor-pointer"
        >
          Indietro
        </button>
        <span class="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">Anteprima</span>
        <div class="flex gap-1.5">
          <button
            onclick="setCameraBgFromViewer()"
            class="text-xs bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all flex items-center gap-1 border border-cyan-500/20"
            title="Imposta come sfondo per la fotocamera"
          >
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            Sfondo
          </button>
          <button
            onclick="deleteCameraPhoto()"
            class="text-xs bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all"
          >
            Elimina
          </button>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center p-2">
        <img
          id="camera-viewer-large-img"
          src=""
          alt="Full Screen View"
          class="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
        />
      </div>

      <div class="py-4 px-6 text-center bg-black/60 backdrop-blur-sm">
        <span class="text-[10px] text-white/50 font-mono">
          Visualizzatore Fotocamera iPhone Simulator
        </span>
      </div>
    </div>
  </div>

  <script>
    const gridItems = ${gridItemsJson};
    const dockItems = ${dockItemsJson};
    const totalPages = ${totalPages};
    let activePage = 0;
    let activeAudio = null;
    let activeAudioUrl = null;
    const audioCache = {};

    function toKebabCase(str) {
      if (!str) return 'app-window';
      return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('live-time').innerText = hours + ':' + minutes;
      
      const widgetClocks = document.querySelectorAll('.widget-clock-time');
      widgetClocks.forEach(c => {
        c.innerText = hours + ':' + minutes;
      });
    }

    function renderSimulator() {
      const slider = document.getElementById('pages-slider-container');
      slider.innerHTML = '';
      
      for (let p = 0; p < totalPages; p++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-screen grid grid-cols-4 grid-rows-6 gap-x-2.5 gap-y-4 px-4 h-full';
        
        const pageItems = gridItems.filter(item => (item.page || 0) === p);
        const matrix = Array(6).fill(null).map(() => Array(4).fill(null));
        
        pageItems.forEach(item => {
          for (let r = item.row; r < Math.min(item.row + item.h, 6); r++) {
            for (let c = item.col; c < Math.min(item.col + item.w, 4); c++) {
              matrix[r][c] = item.id;
            }
          }
        });

        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 4; c++) {
            const itemId = matrix[r][c];
            if (itemId === null) {
              const cell = document.createElement('div');
              cell.className = 'aspect-square opacity-0 pointer-events-none';
              cell.style.gridColumnStart = c + 1;
              cell.style.gridRowStart = r + 1;
              pageDiv.appendChild(cell);
            } else {
              const item = pageItems.find(i => i.id === itemId);
              if (item && item.row === r && item.col === c) {
                const itemDiv = document.createElement('div');
                itemDiv.style.gridColumnStart = item.col + 1;
                itemDiv.style.gridColumnEnd = item.col + item.w + 1;
                itemDiv.style.gridRowStart = item.row + 1;
                itemDiv.style.gridRowEnd = item.row + item.h + 1;
                itemDiv.className = 'relative select-none flex flex-col justify-between h-full';

                if (item.token || item.audioUrl) {
                  itemDiv.className += ' cursor-pointer';
                  itemDiv.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                    if (item.token) {
                      if (/^\d+$/.test(item.token)) {
                        openCameraApp(item);
                      } else {
                        openMotivationalApp(item);
                      }
                    }
                    if (item.audioUrl) {
                      playAudio(item.audioUrl, item.audioStartOffset);
                    }
                  });
                }

                if (item.type === 'app') {
                  const isTransparent = item.transparentIconBg;

                  const sizeVal = item.customSize || 58;
                  const innerIconSize = Math.max(10, Math.round(sizeVal * (26 / 58)));
                  const fontSizeVal = Math.max(8, Math.min(14, Math.round(sizeVal * (10.5 / 58))));
                  const maxTextWidth = sizeVal + 12;

                  const iconKebab = toKebabCase(item.iconName || 'app-window');
                  const imgHtml = item.iconName === 'custom' && item.iconUrl 
                    ? '<img src="' + item.iconUrl + '" class="w-full h-full object-cover rounded-2xl">' 
                    : '<div class="text-white"><i data-lucide="' + iconKebab + '" style="width: ' + innerIconSize + 'px; height: ' + innerIconSize + 'px;"></i></div>';

                  itemDiv.innerHTML = \`
                    <div class="w-full h-full flex flex-col items-center justify-center p-1">
                      <div class="rounded-2xl flex items-center justify-center text-white relative active:scale-95 transition-all overflow-hidden \${isTransparent ? 'bg-transparent border border-white/5' : 'bg-white/12 backdrop-blur-md border border-white/20 shadow-lg'}" style="width: \${sizeVal}px; height: \${sizeVal}px;">
                        \${!isTransparent ? '<div class="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>' : ''}
                        \${imgHtml}
                        \${item.audioUrl ? '<div class="absolute bottom-1 right-1 bg-black/40 p-0.5 rounded-full text-white/80"><i data-lucide="volume-2" style="width: ' + Math.max(6, Math.round(sizeVal * (8 / 58))) + 'px; height: ' + Math.max(6, Math.round(sizeVal * (8 / 58))) + 'px;"></i></div>' : ''}
                      </div>
                      <span class="text-white font-medium text-center mt-1.5 truncate w-full drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.6)]" style="font-size: \${fontSizeVal}px; max-width: \${maxTextWidth}px;">\${item.label || ''}</span>
                    </div>
                  \`;
                } else if (item.type === 'widget_small') {
                  const isPhoto = item.widgetType === 'photo' && item.images && item.images[0];
                  const isClock = item.widgetType === 'clock';
                  const isWeather = item.widgetType === 'weather';
                  const isStocks = item.widgetType === 'stocks';
                  const sizeVal = item.customSize || 120;
                  const scale = sizeVal / 120;

                  let widgetInner = '<div class="w-full h-full flex items-center justify-center text-white/50 text-xs">Widget</div>';
                  if (isPhoto) {
                    widgetInner = '<img src="' + item.images[0] + '" class="w-full h-full object-cover cursor-zoom-in" onclick="openPhotoOverlay(\\\'' + item.images[0] + '\\\')">';
                  } else if (isClock) {
                    widgetInner = \`<div class="w-full h-full flex flex-col items-center justify-center text-white p-2">
                      <span class="text-[9px] uppercase font-bold text-cyan-200">Ora Locale</span>
                      <span class="text-2xl font-bold tracking-tight mt-1 widget-clock-time">--:--</span>
                    </div>\`;
                  } else if (isWeather) {
                    widgetInner = \`<div class="w-full h-full flex flex-col justify-between text-white p-3">
                      <i data-lucide="cloud-sun" class="text-amber-200 w-8 h-8"></i>
                      <div><p class="text-[11px] font-semibold">Roma</p><p class="text-[10px] text-white/60">Parzialmente Nuvoloso</p></div>
                    </div>\`;
                  } else if (isStocks) {
                    widgetInner = \`<div class="w-full h-full flex flex-col justify-between text-white p-3">
                      <span class="text-[9px] font-bold font-mono bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded w-max">AAPL</span>
                      <div><p class="text-lg font-bold font-mono">$189.84</p><p class="text-[10px] text-emerald-400 font-semibold">+1.48%</p></div>
                    </div>\`;
                  }

                  itemDiv.innerHTML = \`
                    <div class="w-full h-full flex flex-col items-center justify-center p-1">
                      <div class="w-full aspect-square rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden flex flex-col relative" style="transform: scale(\${scale}); transform-origin: center;">
                        \${widgetInner}
                      </div>
                      \${item.title ? \`<span class="text-white/60 text-[9px] font-semibold uppercase tracking-wider text-center mt-1 truncate w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" style="font-size: \${Math.max(7, Math.min(12, Math.round(9 * scale)))}px">\${item.title}</span>\` : ''}
                    </div>
                  \`;
                } else if (item.type === 'widget_medium') {
                  const photos = item.images || [];
                  const photo0 = photos[0] ? '<img src="' + photos[0] + '" class="w-full h-full object-cover cursor-zoom-in" onclick="openPhotoOverlay(\\\'' + photos[0] + '\\\')">' : '<div class="w-full h-full bg-neutral-300"></div>';
                  const photo1 = photos[1] ? '<img src="' + photos[1] + '" class="w-full h-full object-cover cursor-zoom-in" onclick="openPhotoOverlay(\\\'' + photos[1] + '\\\')">' : '<div class="w-full h-full bg-neutral-300"></div>';
                  const photo2 = photos[2] ? '<img src="' + photos[2] + '" class="w-full h-full object-cover cursor-zoom-in" onclick="openPhotoOverlay(\\\'' + photos[2] + '\\\')">' : '<div class="w-full h-full bg-neutral-300"></div>';
                  const sizeVal = item.customSize || 250;
                  const scale = sizeVal / 250;

                  const isFull = item.polaroidFullPhoto || false;
                  const hideLabels = item.polaroidHideLabels || false;
                  const labels = item.polaroidLabels || ["MEMORIA", "ESTATE", "SOGNO"];
                  const lbl0 = labels[0] !== undefined ? labels[0] : "MEMORIA";
                  const lbl1 = labels[1] !== undefined ? labels[1] : "ESTATE";
                  const lbl2 = labels[2] !== undefined ? labels[2] : "SOGNO";

                  const pClass0 = isFull ? 'rounded-lg overflow-hidden shadow-xl border border-white/15 rotate-[-5deg] translate-y-1' : 'bg-white p-1 pb-2.5 shadow-md rounded-[2px] rotate-[-5deg] translate-y-1';
                  const pClass1 = isFull ? 'rounded-lg overflow-hidden shadow-2xl border border-white/15 translate-y-[-2px]' : 'bg-white p-1 pb-2.5 shadow-lg rounded-[2px] translate-y-[-2px]';
                  const pClass2 = isFull ? 'rounded-lg overflow-hidden shadow-xl border border-white/15 rotate-[5deg] translate-y-1' : 'bg-white p-1 pb-2.5 shadow-md rounded-[2px] rotate-[5deg] translate-y-1';

                  const photoBorder0 = isFull ? '' : 'border border-black/5';
                  const photoBorder1 = isFull ? '' : 'border border-black/5';
                  const photoBorder2 = isFull ? '' : 'border border-black/5';

                  const labelHtml0 = (!isFull && !hideLabels) ? '<span class="text-[5px] font-semibold text-neutral-400 text-center uppercase tracking-wide truncate w-full px-0.5 mt-0.5">' + lbl0 + '</span>' : '';
                  const labelHtml1 = (!isFull && !hideLabels) ? '<span class="text-[5px] font-semibold text-neutral-400 text-center uppercase tracking-wide truncate w-full px-0.5 mt-0.5">' + lbl1 + '</span>' : '';
                  const labelHtml2 = (!isFull && !hideLabels) ? '<span class="text-[5px] font-semibold text-neutral-400 text-center uppercase tracking-wide truncate w-full px-0.5 mt-0.5">' + lbl2 + '</span>' : '';

                  itemDiv.innerHTML = \`
                    <div class="w-full h-full flex flex-col items-center justify-between p-1">
                      <div class="w-full h-[126px] rounded-[26px] bg-white/8 backdrop-blur-lg border border-white/18 shadow-xl flex items-center justify-around p-2.5 overflow-hidden" style="transform: scale(\${scale}); transform-origin: center;">
                        <div class="\${pClass0} w-[28%] aspect-[3/4] flex flex-col justify-between cursor-zoom-in">
                          <div class="w-full aspect-square bg-neutral-100 overflow-hidden \${photoBorder0}">\${photo0}</div>
                          \${labelHtml0}
                        </div>
                        <div class="\text-white \${pClass1} w-[28%] aspect-[3/4] flex flex-col justify-between z-10 cursor-zoom-in">
                          <div class="w-full aspect-square bg-neutral-100 overflow-hidden \${photoBorder1}">\${photo1}</div>
                          \${labelHtml1}
                        </div>
                        <div class="\${pClass2} w-[28%] aspect-[3/4] flex flex-col justify-between cursor-zoom-in">
                          <div class="w-full aspect-square bg-neutral-100 overflow-hidden \${photoBorder2}">\${photo2}</div>
                          \${labelHtml2}
                        </div>
                      </div>
                      \${item.title ? \`<span class="text-white/60 text-[9.5px] font-semibold uppercase tracking-wider text-center mt-1 truncate w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" style="font-size: \${Math.max(7, Math.min(12, Math.round(9.5 * scale)))}px">\${item.title}</span>\` : ''}
                    </div>
                  \`;
                }

                pageDiv.appendChild(itemDiv);
              }
            }
          }
        }
        slider.appendChild(pageDiv);
      }

      // Render Dock
      const dockContainer = document.getElementById('dock-container');
      dockContainer.innerHTML = '';
      dockItems.forEach(item => {
        const dockItem = document.createElement('div');
        const isTransparent = item.transparentIconBg;
        dockItem.className = 'relative flex flex-col items-center justify-center cursor-pointer w-[58px] h-[58px] rounded-2xl active:scale-95 transition-all overflow-hidden ' + 
          (isTransparent ? 'bg-transparent border border-white/5 shadow-none' : 'bg-white/10 backdrop-blur-md border border-white/20 shadow-md');
        
        dockItem.addEventListener('click', () => {
          if (item.token) {
            if (/^\d+$/.test(item.token)) {
              openCameraApp(item);
            } else {
              openMotivationalApp(item);
            }
          }
          if (item.audioUrl) {
            playAudio(item.audioUrl, item.audioStartOffset);
          }
        });

        const iconKebab = toKebabCase(item.iconName || 'app-window');
        const iconHtml = item.iconName === 'custom' && item.iconUrl
          ? '<img src="' + item.iconUrl + '" class="w-full h-full object-cover">'
          : '<i data-lucide="' + iconKebab + '" class="text-white w-6 h-6"></i>';

        dockItem.innerHTML = iconHtml;
        dockContainer.appendChild(dockItem);
      });
      
      // If under 4 dock items, render empty slots
      for (let i = dockItems.length; i < 4; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'w-[58px] h-[58px] rounded-2xl border border-dashed border-white/10 bg-white/5';
        dockContainer.appendChild(emptySlot);
      }

      renderDots();
      updatePagePosition();
      lucide.createIcons();
    }

    // Render Dots
    function renderDots() {
      const dotsContainer = document.getElementById('dots-container');
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'w-2 h-2 rounded-full transition-all duration-300 ' + (activePage === i ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60');
        dot.addEventListener('click', () => {
          activePage = i;
          updatePagePosition();
        });
        dotsContainer.appendChild(dot);
      }
    }

    // Update Page Position
    function updatePagePosition() {
      const slider = document.getElementById('pages-slider-container');
      slider.style.transform = 'translateX(-' + (activePage * 100) + '%)';
      
      // Update dots visual state
      const dots = document.getElementById('dots-container').children;
      for (let i = 0; i < dots.length; i++) {
        if (i === activePage) {
          dots[i].className = 'w-2 h-2 rounded-full transition-all duration-300 bg-white scale-125';
        } else {
          dots[i].className = 'w-2 h-2 rounded-full transition-all duration-300 bg-white/40 hover:bg-white/60';
        }
      }
    }

    window.prevPage = function() {
      if (activePage > 0) {
        activePage--;
        updatePagePosition();
      }
    }

    window.nextPage = function() {
      if (activePage < totalPages - 1) {
        activePage++;
        updatePagePosition();
      }
    }

    // Play Audio helper with exact zero-latency synth or custom sound urls
    function playAudio(url, startOffset) {
      if (!url) return;
      try {
        if (url.startsWith('preset:')) {
          if (activeAudioUrl === url) {
            activeAudioUrl = null;
            return;
          }

          activeAudioUrl = url;

          const presetDurations = {
            'preset:bell': 1200,
            'preset:digital': 250,
            'preset:marimba': 500,
            'preset:retro': 300,
            'preset:sci-fi': 450
          };
          const duration = presetDurations[url] || 1000;
          setTimeout(() => {
            if (activeAudioUrl === url) {
              activeAudioUrl = null;
            }
          }, duration);

          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          const ctx = new AudioContextClass();
          const now = ctx.currentTime;
          
          if (url === 'preset:bell') {
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
          } else if (url === 'preset:digital') {
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
          } else if (url === 'preset:marimba') {
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
          } else if (url === 'preset:retro') {
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
          } else if (url === 'preset:sci-fi') {
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

        if (activeAudio && activeAudioUrl === url) {
          if (!activeAudio.paused) {
            activeAudio.pause();
          } else {
            activeAudio.play().catch(e => console.warn('Audio resume failed:', e));
          }
          return;
        }

        if (activeAudio) {
          activeAudio.pause();
          activeAudio = null;
          activeAudioUrl = null;
        }

        let a = audioCache[url];
        if (!a) {
          a = new Audio(url);
          a.preload = "auto";
          audioCache[url] = a;
        }

        a.volume = 1.0;
        activeAudio = a;
        activeAudioUrl = url;

        const playWithOffset = () => {
          if (startOffset && startOffset > 0) {
            a.currentTime = startOffset;
          } else {
            a.currentTime = 0;
          }
          a.play().catch(e => {
            console.warn('Audio play failed:', e);
            if (activeAudio === a) {
              activeAudio = null;
              activeAudioUrl = null;
            }
          });
        };

        a.onended = function() {
          if (activeAudio === a) {
            activeAudio = null;
            activeAudioUrl = null;
          }
        };

        if (a.readyState >= 1) {
          playWithOffset();
        } else {
          a.addEventListener('loadedmetadata', playWithOffset, { once: true });
          a.load();
        }
      } catch(err) {
        console.error('Audio play error:', err);
      }
    }

    // Photo Overlay
    window.openPhotoOverlay = function(src) {
      document.getElementById('overlay-img').src = src;
      document.getElementById('photo-overlay').classList.remove('hidden');
    }

    window.closePhotoOverlay = function() {
      document.getElementById('photo-overlay').classList.add('hidden');
    }

    // --- CAMERA APP SIMULATOR VARIABLES & FUNCTIONS ---
    let cameraPhotos = [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600"
    ];

    try {
      const savedPhotos = localStorage.getItem("cameraPhotos");
      if (savedPhotos) {
        const parsed = JSON.parse(savedPhotos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cameraPhotos = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load camera photos from localStorage", e);
    }

    function saveCameraPhotos() {
      try {
        localStorage.setItem("cameraPhotos", JSON.stringify(cameraPhotos));
      } catch (e) {
        // Silently catch quota exceeded error
      }
    }

    let customViewfinderUrl = null;
    try {
      customViewfinderUrl = localStorage.getItem("customViewfinderUrl") || null;
    } catch (e) {
      console.error(e);
    }
    let selectedPhotoIndexes = [];
    let isSelectMode = false;
    let lastSelectedIndex = null;

    let activeCameraItem = null;
    let cameraZoom = '1x';
    let cameraMode = 'FOTO';
    let isFlashOn = false;
    let isNightModeOn = false;
    let isCameraGridOn = false;
    let cameraExposure = 0;
    let isCameraFront = false;
    let cameraFilter = 'normal';
    const cameraFilters = ['normal', 'mono', 'warm', 'cool', 'dramatic'];
    let isRecording = false;
    let recordingSeconds = 0;
    let recordingInterval = null;
    let selectedViewerPhotoIndex = null;

    window.openCameraApp = function(item) {
      activeCameraItem = item;
      const overlay = document.getElementById('camera-overlay');
      const viewfinder = document.getElementById('camera-viewfinder-img');
      
      viewfinder.src = customViewfinderUrl || item.weatherBgUrl || "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800";
      
      overlay.classList.add('active');
      applyCameraStyles();
    };

    window.closeCameraApp = function() {
      const overlay = document.getElementById('camera-overlay');
      overlay.classList.remove('active');
      if (isRecording) {
        stopVideoRecording();
      }
      playAudio('preset:digital', 0);
    };

    window.toggleCameraFlash = function() {
      isFlashOn = !isFlashOn;
      const btn = document.getElementById('camera-btn-flash');
      if (isFlashOn) {
        btn.className = "p-1.5 rounded-full transition-all bg-yellow-400 text-black animate-pulse cursor-pointer";
      } else {
        btn.className = "p-1.5 rounded-full transition-all bg-white/10 text-white cursor-pointer";
      }
      playAudio('preset:digital', 0);
    };

    window.toggleCameraNight = function() {
      isNightModeOn = !isNightModeOn;
      const btn = document.getElementById('camera-btn-night');
      if (isNightModeOn) {
        btn.className = "p-1.5 rounded-full transition-all bg-amber-400 text-black cursor-pointer";
      } else {
        btn.className = "p-1.5 rounded-full transition-all bg-white/10 text-white cursor-pointer";
      }
      playAudio('preset:digital', 0);
      applyCameraStyles();
    };

    window.toggleCameraGrid = function() {
      isCameraGridOn = !isCameraGridOn;
      const btn = document.getElementById('camera-btn-grid');
      const gridLines = document.getElementById('camera-grid-lines');
      if (isCameraGridOn) {
        btn.className = "p-1.5 rounded-full transition-all bg-cyan-400 text-black cursor-pointer";
        gridLines.classList.remove('hidden');
      } else {
        btn.className = "p-1.5 rounded-full transition-all bg-white/10 text-white cursor-pointer";
        gridLines.classList.add('hidden');
      }
      playAudio('preset:digital', 0);
    };

    window.cycleCameraFilter = function() {
      const currIdx = cameraFilters.indexOf(cameraFilter);
      const nextIdx = (currIdx + 1) % cameraFilters.length;
      cameraFilter = cameraFilters[nextIdx];
      
      const label = document.getElementById('camera-filter-label');
      label.innerText = cameraFilter === 'normal' ? 'ORIGINALE' : cameraFilter.toUpperCase();
      
      playAudio('preset:digital', 0);
      applyCameraStyles();
    };

    window.setCameraZoom = function(z) {
      cameraZoom = z;
      ['0.5x', '1x', '2x', '5x'].forEach(zoomVal => {
        const btn = document.getElementById('zoom-btn-' + zoomVal);
        if (zoomVal === z) {
          btn.className = "text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer bg-yellow-400 text-black scale-110 shadow-md font-extrabold";
        } else {
          btn.className = "text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer text-white/80 hover:text-white";
        }
      });
      playAudio('preset:digital', 0);
      applyCameraStyles();
    };

    window.changeCameraExposure = function(dir) {
      cameraExposure = Math.max(-2, Math.min(2, cameraExposure + dir));
      const dot = document.getElementById('camera-exposure-dot');
      dot.style.bottom = ((cameraExposure + 2) * 25) + "%";
      
      const badge = document.getElementById('camera-exposure-badge');
      if (cameraExposure !== 0) {
        badge.innerText = 'EV ' + (cameraExposure > 0 ? '+' + cameraExposure : cameraExposure);
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
      applyCameraStyles();
    };

    window.setCameraMode = function(m) {
      cameraMode = m;
      if (isRecording) {
        stopVideoRecording();
      }
      
      ['NIGHT', 'VIDEO', 'FOTO', 'RITRATTO', 'PANORAMICA'].forEach(modeVal => {
        const btn = document.getElementById('mode-btn-' + modeVal);
        if (modeVal === m) {
          btn.className = "text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 text-yellow-400 font-black scale-105 underline underline-offset-4 decoration-2";
        } else {
          btn.className = "text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase shrink-0 text-white/45 hover:text-white/85";
        }
      });

      const shutterInner = document.getElementById('camera-shutter-inner');
      const shutterBtn = document.getElementById('camera-shutter-btn');
      
      if (m === 'VIDEO') {
        shutterBtn.className = "relative flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer w-[68px] h-[68px] border-[4px] border-white bg-transparent";
        shutterInner.className = "w-10 h-10 bg-red-600 rounded-full";
        shutterBtn.title = "Avvia Registrazione";
      } else {
        shutterBtn.className = "relative flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer w-[68px] h-[68px] border-[4px] border-white bg-white";
        shutterInner.className = "w-[52px] h-[52px] rounded-full border border-black/10 bg-white";
        shutterBtn.title = "Scatta Foto";
      }

      playAudio('preset:digital', 0);
    };

    window.triggerCameraShutter = function() {
      if (cameraMode === 'VIDEO') {
        if (!isRecording) {
          startVideoRecording();
        } else {
          stopVideoRecording();
        }
      } else {
        // Take Photo
        const flashOverlay = document.getElementById('camera-shutter-flash');
        flashOverlay.style.opacity = '1';
        playAudio('preset:digital', 0);
        setTimeout(function() {
          flashOverlay.style.opacity = '0';
        }, 120);

        const currentImg = customViewfinderUrl || (activeCameraItem && activeCameraItem.weatherBgUrl) || "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800";
        cameraPhotos.unshift(currentImg);
        saveCameraPhotos();
        
        const thumb = document.getElementById('camera-gallery-thumb');
        if (thumb) thumb.src = currentImg;
      }
    };

    function startVideoRecording() {
      isRecording = true;
      recordingSeconds = 0;
      document.getElementById('camera-rec-banner').classList.remove('hidden');
      document.getElementById('camera-rec-timer').innerText = "00:00";
      
      const shutterInner = document.getElementById('camera-shutter-inner');
      shutterInner.className = "w-5 h-5 bg-red-600 rounded-sm animate-pulse";
      
      playAudio('preset:marimba', 0);
      
      recordingInterval = setInterval(function() {
        recordingSeconds++;
        const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
        const secs = String(recordingSeconds % 60).padStart(2, '0');
        document.getElementById('camera-rec-timer').innerText = mins + ':' + secs;
      }, 1000);
    }

    function stopVideoRecording() {
      isRecording = false;
      clearInterval(recordingInterval);
      document.getElementById('camera-rec-banner').classList.add('hidden');
      
      const shutterInner = document.getElementById('camera-shutter-inner');
      shutterInner.className = "w-10 h-10 bg-red-600 rounded-full";
      
      playAudio('preset:marimba', 0);
    }

    window.flipCameraSource = function() {
      isCameraFront = !isCameraFront;
      const icon = document.getElementById('camera-flip-icon');
      if (isCameraFront) {
        icon.classList.add('rotate-180', 'text-yellow-400');
      } else {
        icon.classList.remove('rotate-180', 'text-yellow-400');
      }
      playAudio('preset:retro', 0);
      applyCameraStyles();
    };

    function applyCameraStyles() {
      const img = document.getElementById('camera-viewfinder-img');
      if (!img) return;
      
      // Filters
      let filterStr = '';
      if (cameraFilter === 'mono') filterStr += 'grayscale(1) contrast(1.2) ';
      else if (cameraFilter === 'warm') filterStr += 'sepia(0.35) saturate(1.4) hue-rotate(-10deg) ';
      else if (cameraFilter === 'cool') filterStr += 'saturate(1.2) hue-rotate(15deg) brightness(1.05) ';
      else if (cameraFilter === 'dramatic') filterStr += 'contrast(1.5) brightness(0.9) saturate(1.3) ';
      
      if (isNightModeOn) filterStr += 'brightness(1.3) contrast(0.9) saturate(1.1) ';
      if (cameraExposure !== 0) filterStr += 'brightness(' + (1 + cameraExposure * 0.15) + ') ';
      
      img.style.filter = filterStr || 'none';

      // Zoom and front flip
      let scaleVal = 1.0;
      if (cameraZoom === '0.5x') scaleVal = 0.75;
      else if (cameraZoom === '2x') scaleVal = 1.5;
      else if (cameraZoom === '5x') scaleVal = 2.5;
      
      let transformStr = 'scale(' + scaleVal + ')';
      if (isCameraFront) {
        transformStr += ' scaleX(-1)';
      }
      img.style.transform = transformStr;
    }

    window.openExportGallery = function() {
      const overlay = document.getElementById('camera-gallery-overlay');
      overlay.classList.add('active');
      renderExportGallery();
      playAudio('preset:digital', 0);
    };

    window.closeExportGallery = function() {
      const overlay = document.getElementById('camera-gallery-overlay');
      overlay.classList.remove('active');
      cancelMultiSelect();
      playAudio('preset:digital', 0);
    };

    window.handleExportPhotoUpload = function(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      const fileList = Array.from(files);
      let loadedCount = 0;
      const newImages = [];
      
      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          newImages.push(e.target.result);
          loadedCount++;
          if (loadedCount === fileList.length) {
            cameraPhotos = [...newImages, ...cameraPhotos];
            saveCameraPhotos();
            const thumb = document.getElementById('camera-gallery-thumb');
            if (thumb && cameraPhotos[0]) {
              thumb.src = cameraPhotos[0];
            }
            renderExportGallery();
            playAudio('preset:digital', 0);
          }
        };
        reader.readAsDataURL(file);
      });
    };

    let pressTimer = null;
    let longPressTriggered = false;

    window.startPress = function(idx) {
      longPressTriggered = false;
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = setTimeout(function() {
        longPressTriggered = true;
        handleLongPress(idx);
      }, 550);
    };

    window.endPress = function(idx) {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      if (!longPressTriggered) {
        handlePhotoClick(idx);
      }
    };

    window.cancelPress = function() {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    function handleLongPress(idx) {
      if (!isSelectMode) {
        isSelectMode = true;
        selectedPhotoIndexes = [idx];
        lastSelectedIndex = idx;
        playAudio('preset:bell', 0);
      } else {
        // Range select!
        if (lastSelectedIndex !== null && lastSelectedIndex !== idx) {
          const start = Math.min(lastSelectedIndex, idx);
          const end = Math.max(lastSelectedIndex, idx);
          for (let i = start; i <= end; i++) {
            if (!selectedPhotoIndexes.includes(i)) {
              selectedPhotoIndexes.push(i);
            }
          }
          lastSelectedIndex = idx;
          playAudio('preset:bell', 0);
        } else {
          toggleIndex(idx);
        }
      }
      updateSelectionUI();
    }

    function handlePhotoClick(idx) {
      if (!isSelectMode) {
        openCameraPhotoViewer(idx);
      } else {
        toggleIndex(idx);
      }
    }

    function toggleIndex(idx) {
      const pos = selectedPhotoIndexes.indexOf(idx);
      if (pos > -1) {
        selectedPhotoIndexes.splice(pos, 1);
        if (selectedPhotoIndexes.length === 0) {
          isSelectMode = false;
          lastSelectedIndex = null;
        } else {
          lastSelectedIndex = selectedPhotoIndexes[selectedPhotoIndexes.length - 1];
        }
      } else {
        selectedPhotoIndexes.push(idx);
        lastSelectedIndex = idx;
      }
      playAudio('preset:digital', 0);
      updateSelectionUI();
    }

    function updateSelectionUI() {
      const banner = document.getElementById('camera-select-banner');
      const countLabel = document.getElementById('camera-select-count');
      const btnSetBg = document.getElementById('camera-btn-setbg');
      
      if (isSelectMode) {
        banner.classList.remove('hidden');
        countLabel.innerText = selectedPhotoIndexes.length + " selezionate";
        if (selectedPhotoIndexes.length === 1) {
          btnSetBg.classList.remove('hidden');
        } else {
          btnSetBg.classList.add('hidden');
        }
      } else {
        banner.classList.add('hidden');
      }
      renderExportGallery();
    }

    window.cancelMultiSelect = function() {
      selectedPhotoIndexes = [];
      isSelectMode = false;
      lastSelectedIndex = null;
      updateSelectionUI();
      playAudio('preset:digital', 0);
    };

    window.deleteSelectedPhotos = function() {
      if (selectedPhotoIndexes.length === 0) return;
      cameraPhotos = cameraPhotos.filter((_, idx) => !selectedPhotoIndexes.includes(idx));
      saveCameraPhotos();
      selectedPhotoIndexes = [];
      isSelectMode = false;
      lastSelectedIndex = null;
      updateSelectionUI();
      
      const thumb = document.getElementById('camera-gallery-thumb');
      if (thumb) {
        thumb.src = cameraPhotos[0] || '';
      }
      playAudio('preset:marimba', 0);
    };

    window.setCameraBgFromSelected = function() {
      if (selectedPhotoIndexes.length !== 1) return;
      const photo = cameraPhotos[selectedPhotoIndexes[0]];
      setCameraBg(photo);
      cancelMultiSelect();
    };

    window.setCameraBgFromViewer = function() {
      if (selectedViewerPhotoIndex === null) return;
      const photo = cameraPhotos[selectedViewerPhotoIndex];
      setCameraBg(photo);
    };

    function setCameraBg(photo) {
      customViewfinderUrl = photo;
      try {
        if (photo) {
          localStorage.setItem("customViewfinderUrl", photo);
        } else {
          localStorage.removeItem("customViewfinderUrl");
        }
      } catch (e) {
        // Silently catch storage error
      }
      const viewfinder = document.getElementById('camera-viewfinder-img');
      if (viewfinder) viewfinder.src = photo || '';
      playAudio('preset:digital', 0);
    }

    function renderExportGallery() {
      document.getElementById('camera-gallery-title').innerText = "Rullino Foto (" + cameraPhotos.length + ")";
      const grid = document.getElementById('camera-gallery-grid');
      grid.innerHTML = '';
      
      cameraPhotos.forEach((photo, idx) => {
        const isSelected = selectedPhotoIndexes.includes(idx);
        
        const cell = document.createElement('div');
        cell.className = "aspect-square bg-neutral-900 border overflow-hidden rounded relative cursor-pointer group select-none transition-all duration-200 " + 
          (isSelected ? "border-yellow-400 ring-2 ring-yellow-400/50 scale-95" : "border-white/5 hover:border-white/20");
        
        cell.setAttribute('onmousedown', 'startPress(' + idx + ')');
        cell.setAttribute('onmouseup', 'endPress(' + idx + ')');
        cell.setAttribute('onmouseleave', 'cancelPress()');
        cell.setAttribute('ontouchstart', 'startPress(' + idx + ')');
        cell.setAttribute('ontouchend', 'endPress(' + idx + ')');
        cell.setAttribute('ontouchcancel', 'cancelPress()');
        
        const img = document.createElement('img');
        img.src = photo;
        img.className = "w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300";
        img.referrerPolicy = "no-referrer";
        
        cell.appendChild(img);
        
        if (isSelectMode) {
          const indicator = document.createElement('div');
          indicator.className = "absolute top-1.5 left-1.5 w-4 h-4 rounded-full border border-white/60 flex items-center justify-center bg-black/60 z-10";
          if (isSelected) {
            const inner = document.createElement('div');
            inner.className = "w-2 h-2 rounded-full bg-yellow-400";
            indicator.appendChild(inner);
          }
          cell.appendChild(indicator);
        }
        
        grid.appendChild(cell);
      });
    }

    function openCameraPhotoViewer(idx) {
      selectedViewerPhotoIndex = idx;
      const photo = cameraPhotos[idx];
      document.getElementById('camera-viewer-large-img').src = photo;
      document.getElementById('camera-photo-viewer').classList.add('active');
      playAudio('preset:digital', 0);
    }

    window.closeCameraPhotoViewer = function() {
      document.getElementById('camera-photo-viewer').classList.remove('active');
      selectedViewerPhotoIndex = null;
      playAudio('preset:digital', 0);
    };

    window.deleteCameraPhoto = function() {
      if (selectedViewerPhotoIndex !== null) {
        cameraPhotos = cameraPhotos.filter((_, idx) => idx !== selectedViewerPhotoIndex);
        saveCameraPhotos();
      }
      closeCameraPhotoViewer();
      renderExportGallery();
      
      const thumb = document.getElementById('camera-gallery-thumb');
      if (thumb) {
        thumb.src = cameraPhotos[0] || '';
      }
      playAudio('preset:marimba', 0);
    };

    // --- MOTIVATIONAL APP TOKEN FUNCTIONS ---
    let currentMotivationalIndex = 0;
    const motivationalQuotes = [
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
    ];
    const motivationalTemps = [
      "14°C", "38°C", "32°C", "12°C", "19°C", "8°C", "41°C", "35°C", "16°C", "-4°C"
    ];
    const motivationalConds = [
      "Pioggia di Ferro", "Tempesta Elettrica", "Sole Spietato", 
      "Diluvio Purificatore", "Vento di Guerra", "Nebbia per Codardi", 
      "Caldo Inferno", "Afa Distruttiva", "Cielo Grigio D'acciaio", "Gelo Polare"
    ];
    const motivationalIcons = [
      "wind", "zap", "flame", "cloud-rain", "wind", "cloud", "flame", "sun", "cloud", "snowflake"
    ];

    window.openMotivationalApp = function(item) {
      if (item.token !== 'MOTIVA-METEO') return;
      
      const overlay = document.getElementById('motivational-overlay');
      const bgImg = document.getElementById('motivational-bg-img');
      const opacityDiv = document.getElementById('motivational-overlay-opacity');
      
      bgImg.src = item.weatherBgUrl || "https://imagetourl.cloud/3mcy8k95.jpg";
      
      if (item.weatherBgFit === 'contain') {
        bgImg.className = "absolute inset-0 w-full h-full object-contain bg-slate-950/90 transition-all";
      } else if (item.weatherBgFit === 'stretch') {
        bgImg.className = "absolute inset-0 w-full h-full object-fill transition-all";
      } else {
        bgImg.className = "absolute inset-0 w-full h-full object-cover transition-all";
      }
      
      const opacityVal = item.weatherBgOverlayOpacity !== undefined ? item.weatherBgOverlayOpacity / 100 : 0.60;
      opacityDiv.style.opacity = opacityVal;
      
      overlay.classList.add('active');
      updateMotivationalUI();
    };

    window.closeMotivationalApp = function() {
      const overlay = document.getElementById('motivational-overlay');
      overlay.classList.remove('active');
      playAudio('preset:digital', 0);
    };

    window.cycleMotivationalQuote = function() {
      playAudio('preset:digital', 0);
      currentMotivationalIndex = (currentMotivationalIndex + 1) % 10;
      updateMotivationalUI();
    };

    function updateMotivationalUI() {
      document.getElementById('motivational-temp').innerText = motivationalTemps[currentMotivationalIndex];
      document.getElementById('motivational-cond').innerText = motivationalConds[currentMotivationalIndex];
      document.getElementById('motivational-quote-text').innerText = '"' + motivationalQuotes[currentMotivationalIndex] + '"';
      
      const oldIcon = document.getElementById('motivational-icon');
      if (oldIcon) {
        const iconName = motivationalIcons[currentMotivationalIndex];
        const newIcon = document.createElement('i');
        newIcon.id = 'motivational-icon';
        newIcon.setAttribute('data-lucide', iconName);
        newIcon.className = 'w-3.5 h-3.5 text-cyan-400';
        oldIcon.replaceWith(newIcon);
        lucide.createIcons();
      }
    }

    // Swipe gestures for touch screens
    let touchStartX = 0;
    let touchEndX = 0;
    
    const wrapper = document.getElementById('iphone-wrapper');
    wrapper.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    wrapper.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const overlay = document.getElementById('photo-overlay');
      if (overlay && !overlay.classList.contains('hidden')) {
        return;
      }
      const threshold = 45;
      if (touchEndX < touchStartX - threshold) {
        nextPage();
      } else if (touchEndX > touchStartX + threshold) {
        prevPage();
      }
    }

    window.onload = function() {
      renderSimulator();
      updateClock();
      setInterval(updateClock, 1000);
    }
  </script>
  <script id="iscreen-import-data" type="application/json">
    {
      "gridItems": ${gridItemsJson},
      "dockItems": ${dockItemsJson},
      "totalPages": ${totalPages},
      "backgroundUrl": "${backgroundUrlEscaped}"
    }
  </script>
</body>
</html>`;
}
