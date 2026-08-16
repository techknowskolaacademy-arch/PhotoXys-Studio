/**
 * PhotoXys Studio Application Controller
 * Manages UI Docks, Templates Library, Layer Inspector, Filters, Export, and Theme switching.
 */

// Sample Stock Images (Creative Commons high quality gradients & abstract photos)
const SAMPLE_ASSETS = [
  {
    name: 'Neon Cyberpunk',
    category: 'abstract',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%236d28d9"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g1)"/><circle cx="400" cy="300" r="180" fill="none" stroke="%2338bdf8" stroke-width="8" opacity="0.8"/><polygon points="400,160 520,380 280,380" fill="none" stroke="%23f43f5e" stroke-width="6" opacity="0.9"/></svg>'
  },
  {
    name: 'Modern Gradient Mesh',
    category: 'gradient',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="%232563eb"/><stop offset="50%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g2)"/><circle cx="600" cy="200" r="220" fill="%233b82f6" opacity="0.4"/><circle cx="200" cy="450" r="260" fill="%2310b981" opacity="0.35"/></svg>'
  },
  {
    name: 'Minimalist Dark Studio',
    category: 'abstract',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23090d16"/><circle cx="400" cy="300" r="240" fill="%231e293b"/><rect x="250" y="150" width="300" height="300" rx="20" fill="none" stroke="%233b82f6" stroke-width="4" opacity="0.5"/></svg>'
  },
  {
    name: 'Golden Sunset Horizon',
    category: 'nature',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23f97316"/><stop offset="60%" stop-color="%23facc15"/><stop offset="100%" stop-color="%231e1b4b"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g3)"/><circle cx="400" cy="340" r="140" fill="%23fef08a" opacity="0.9"/></svg>'
  }
];

// Pre-built Design Templates (Canva style editable projects)
const TEMPLATES_LIBRARY = [
  {
    id: 'template_summer_sale',
    name: 'Summer Flash Sale',
    category: 'marketing',
    width: 1080,
    height: 1080,
    backgroundColor: '#0f172a',
    layers: [
      {
        type: 'shape',
        name: 'Background Card',
        shapeType: 'roundedRect',
        x: 60,
        y: 60,
        width: 960,
        height: 960,
        cornerRadius: 32,
        fill: '#1e293b',
        stroke: '#3b82f6',
        strokeWidth: 3
      },
      {
        type: 'shape',
        name: 'Badge Shape',
        shapeType: 'roundedRect',
        x: 390,
        y: 180,
        width: 300,
        height: 64,
        cornerRadius: 32,
        fill: '#f59e0b',
        stroke: 'transparent'
      },
      {
        type: 'text',
        name: 'Badge Text',
        text: 'LIMITED TIME OFFER',
        fontSize: 22,
        fontWeight: 800,
        font: 'Outfit',
        fill: '#0f172a',
        x: 390,
        y: 180,
        width: 300,
        height: 64,
        align: 'center'
      },
      {
        type: 'text',
        name: 'Main Headline',
        text: 'SUMMER MEGA SALE',
        fontSize: 72,
        fontWeight: 800,
        font: 'Outfit',
        fill: '#f8fafc',
        x: 100,
        y: 280,
        width: 880,
        height: 100,
        align: 'center'
      },
      {
        type: 'text',
        name: 'Discount Text',
        text: 'UP TO 50% OFF',
        fontSize: 96,
        fontWeight: 800,
        font: 'Outfit',
        fill: '#38bdf8',
        x: 100,
        y: 410,
        width: 880,
        height: 120,
        align: 'center'
      },
      {
        type: 'shape',
        name: 'CTA Button',
        shapeType: 'roundedRect',
        x: 340,
        y: 720,
        width: 400,
        height: 80,
        cornerRadius: 40,
        fill: '#2563eb',
        stroke: '#60a5fa',
        strokeWidth: 2
      },
      {
        type: 'text',
        name: 'CTA Text',
        text: 'SHOP NOW ➔',
        fontSize: 28,
        fontWeight: 800,
        font: 'Outfit',
        fill: '#ffffff',
        x: 340,
        y: 720,
        width: 400,
        height: 80,
        align: 'center'
      }
    ]
  },
  {
    id: 'template_youtube_tech',
    name: 'Tech YouTube Thumbnail',
    category: 'social',
    width: 1280,
    height: 720,
    backgroundColor: '#090d16',
    layers: [
      {
        type: 'shape',
        name: 'Accent Pill',
        shapeType: 'roundedRect',
        x: 80,
        y: 120,
        width: 260,
        height: 54,
        cornerRadius: 12,
        fill: '#dc2626',
        stroke: 'transparent'
      },
      {
        type: 'text',
        name: 'Pill Text',
        text: 'FULL GUIDE 2026',
        fontSize: 22,
        fontWeight: 800,
        font: 'JetBrains Mono',
        fill: '#ffffff',
        x: 80,
        y: 120,
        width: 260,
        height: 54,
        align: 'center'
      },
      {
        type: 'text',
        name: 'Main Title',
        text: 'BUILD AI APPS IN 10 MINS!',
        fontSize: 68,
        fontWeight: 800,
        font: 'Outfit',
        fill: '#ffffff',
        x: 80,
        y: 210,
        width: 800,
        height: 180,
        align: 'left'
      },
      {
        type: 'shape',
        name: 'Feature Box',
        shapeType: 'roundedRect',
        x: 80,
        y: 440,
        width: 420,
        height: 80,
        cornerRadius: 16,
        fill: '#1e293b',
        stroke: '#3b82f6',
        strokeWidth: 2
      },
      {
        type: 'text',
        name: 'Feature Text',
        text: '⚡ Zero Code to Production',
        fontSize: 26,
        fontWeight: 700,
        font: 'Plus Jakarta Sans',
        fill: '#38bdf8',
        x: 80,
        y: 440,
        width: 420,
        height: 80,
        align: 'center'
      }
    ]
  },
  {
    id: 'template_cyberpunk_art',
    name: 'Cyberpunk Neon Cover',
    category: 'music',
    width: 1080,
    height: 1080,
    backgroundColor: '#05070d',
    layers: [
      {
        type: 'shape',
        name: 'Neon Star',
        shapeType: 'star',
        x: 390,
        y: 240,
        width: 300,
        height: 300,
        fill: 'transparent',
        stroke: '#ec4899',
        strokeWidth: 8
      },
      {
        type: 'text',
        name: 'Album Title',
        text: 'SYNTHWAVE 2099',
        fontSize: 64,
        fontWeight: 800,
        font: 'Outfit',
        fill: '#22d3ee',
        x: 100,
        y: 620,
        width: 880,
        height: 90,
        align: 'center'
      },
      {
        type: 'text',
        name: 'Artist Subtext',
        text: 'ORIGINAL MOTION SOUNDTRACK',
        fontSize: 24,
        fontWeight: 600,
        font: 'JetBrains Mono',
        fill: '#f43f5e',
        x: 100,
        y: 720,
        width: 880,
        height: 50,
        align: 'center'
      }
    ]
  }
];

class PhotoXysApp {
  constructor() {
    this.canvasEl = document.getElementById('studioCanvas');
    this.engine = null;
    this.activeTab = 'templates'; // 'templates' | 'elements' | 'text' | 'photos' | 'filters' | 'draw'
    this.theme = localStorage.getItem('photoxys_theme') || 'dark';

    this.activeImageLayer = null; // Layer currently being edited in Photoshop Adjustments tab
    this.editTool = 'select'; // 'select' | 'eraser' | 'crop'
    this.currentAdjustments = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      warmth: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      invert: 0,
      hueRotate: 0
    };

    this.init();
  }

  init() {
    this.applyTheme(this.theme);

    // Initialize Canvas Engine (white default canvas)
    this.engine = new PhotoXysEngine(this.canvasEl, {
      width: 1080,
      height: 1080,
      backgroundColor: '#ffffff',
      onSelectionChange: (layer) => this.handleSelectionChange(layer),
      onLayersChange: (layers) => this.renderLayersList(layers),
      onHistoryChange: (historyState) => this.updateHistoryUI(historyState),
      onCropDrawn: () => this.showCropToolbar(),
      onToolNotice: (msg) => this.showToolNotice(msg)
    });

    this.bindEvents();
    this.renderTemplatesList();
    this.renderStockPhotosList();
    this.renderLobby();
    this.showLobby();
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('photoxys_theme', theme);

    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.innerHTML = theme === 'dark' 
        ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    }
  }

  toggleTheme() {
    this.applyTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  bindEvents() {
    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

    // Home Lobby Navigation
    document.getElementById('lobbyOpenEditorBtn')?.addEventListener('click', () => this.enterStudio());
    document.getElementById('lobbyCreateBlankBtn')?.addEventListener('click', () => this.createBlankCanvas(1080, 1080, 'Instagram Post'));
    document.getElementById('lobbyTemplatesBtn')?.addEventListener('click', () => {
      document.getElementById('lobbyTemplatesGrid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.getElementById('homeBtn')?.addEventListener('click', () => this.showLobby());

    // Left Toolbar Dock Tabs Switcher
    document.querySelectorAll('.dock-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Topbar Canvas Sizing Presets
    const sizeSelect = document.getElementById('canvasSizePresetSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'sq1080') this.engine.setDocDimensions(1080, 1080);
        else if (val === 'story') this.engine.setDocDimensions(1080, 1920);
        else if (val === 'yt') this.engine.setDocDimensions(1280, 720);
        else if (val === 'tw') this.engine.setDocDimensions(1500, 500);
        else if (val === 'fb') this.engine.setDocDimensions(1200, 630);
      });
    }

    // Topbar Zoom Controls
    document.getElementById('zoomInBtn')?.addEventListener('click', () => {
      this.engine.setZoom(this.engine.zoom * 1.25);
      this.updateZoomDisplay();
    });
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
      this.engine.setZoom(this.engine.zoom * 0.8);
      this.updateZoomDisplay();
    });
    document.getElementById('zoomFitBtn')?.addEventListener('click', () => {
      this.engine.fitToScreen();
      this.updateZoomDisplay();
    });

    // Undo / Redo Buttons
    document.getElementById('undoBtn')?.addEventListener('click', () => this.engine.undo());
    document.getElementById('redoBtn')?.addEventListener('click', () => this.engine.redo());

    // Export Modal Triggers
    const exportBtn = document.getElementById('exportModalBtn');
    const exportModal = document.getElementById('exportModal');
    const closeExportModal = document.getElementById('closeExportModal');

    if (exportBtn && exportModal) {
      exportBtn.addEventListener('click', () => exportModal.classList.remove('hidden'));
    }
    if (closeExportModal && exportModal) {
      closeExportModal.addEventListener('click', () => exportModal.classList.add('hidden'));
    }
    document.getElementById('confirmDownloadBtn')?.addEventListener('click', () => this.handleDownload());

    // Add Shape Buttons in Elements Dock
    document.querySelectorAll('.add-shape-card').forEach(card => {
      card.addEventListener('click', () => {
        const shapeType = card.dataset.shape;
        this.engine.addLayer({
          type: 'shape',
          name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
          shapeType,
          width: 220,
          height: 220,
          fill: '#3b82f6',
          stroke: 'transparent',
          strokeWidth: 0,
          cornerRadius: 16
        });
      });
    });

    // Add Sticker & Badge Cards in Stickers Dock
    document.querySelectorAll('.sticker-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.stickerType;
        if (type === 'emoji') {
          this.engine.addLayer({
            type: 'sticker',
            name: `${card.dataset.emoji} Sticker`,
            emoji: card.dataset.emoji,
            width: 150,
            height: 150
          });
        } else if (type === 'badge') {
          this.engine.addLayer({
            type: 'sticker',
            name: `${card.dataset.badgeText} Badge`,
            stickerText: card.dataset.badgeText,
            fill: card.dataset.color,
            width: 240,
            height: 96
          });
        }
      });
    });

    // Sticker Search Filter
    const stickerSearchInput = document.getElementById('stickerSearchInput');
    if (stickerSearchInput) {
      stickerSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.sticker-item-card').forEach(card => {
          const name = (card.dataset.name || '').toLowerCase();
          card.style.display = name.includes(q) ? '' : 'none';
        });
      });
    }

    // Add Typography Blocks in Text Dock
    document.querySelectorAll('.add-text-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const textType = btn.dataset.textType;
        if (textType === 'heading') {
          this.engine.addLayer({
            type: 'text',
            name: 'Main Headline',
            text: 'Add a heading',
            fontSize: 56,
            fontWeight: 800,
            font: 'Outfit',
            fill: '#f8fafc',
            width: 500,
            height: 70
          });
        } else if (textType === 'subheading') {
          this.engine.addLayer({
            type: 'text',
            name: 'Subheading',
            text: 'Add a captivating subheading',
            fontSize: 32,
            fontWeight: 600,
            font: 'Plus Jakarta Sans',
            fill: '#94a3b8',
            width: 460,
            height: 50
          });
        } else if (textType === 'neon') {
          this.engine.addLayer({
            type: 'text',
            name: 'Neon Glow Text',
            text: 'NEON LIGHTS',
            fontSize: 48,
            fontWeight: 800,
            font: 'Outfit',
            fill: '#ec4899',
            stroke: '#ffffff',
            strokeWidth: 2,
            shadow: { color: '#ec4899', blur: 16, x: 0, y: 0 },
            width: 440,
            height: 65
          });
        } else {
          this.engine.addLayer({
            type: 'text',
            name: 'Body Text',
            text: 'Type your message or paragraph text here.',
            fontSize: 22,
            fontWeight: 500,
            font: 'Plus Jakarta Sans',
            fill: '#cbd5e1',
            width: 400,
            height: 40
          });
        }
      });
    });

    // Custom File Upload Input
    const uploadInput = document.getElementById('imageUploadInput');
    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const maxDim = 600;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                const ratio = w / h;
                if (w > h) {
                  w = maxDim;
                  h = maxDim / ratio;
                } else {
                  h = maxDim;
                  w = maxDim * ratio;
                }
              }

              this.engine.addLayer({
                type: 'image',
                name: file.name.replace(/\.[^/.]+$/, ''),
                imageElement: img,
                src: event.target.result,
                width: w,
                height: h
              });
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Brush Tool Controls in Draw Dock
    const brushSizeSlider = document.getElementById('brushSizeSlider');
    const brushColorPicker = document.getElementById('brushColorPicker');
    const brushTypeSelect = document.getElementById('brushTypeSelect');

    if (brushSizeSlider) {
      brushSizeSlider.addEventListener('input', (e) => {
        this.engine.brushSettings.size = parseInt(e.target.value, 10);
        document.getElementById('brushSizeLabel').textContent = `${e.target.value}px`;
      });
    }
    if (brushColorPicker) {
      brushColorPicker.addEventListener('input', (e) => {
        this.engine.brushSettings.color = e.target.value;
      });
    }
    if (brushTypeSelect) {
      brushTypeSelect.addEventListener('change', (e) => {
        this.engine.brushSettings.type = e.target.value;
      });
    }

    // AI Image Generator Controls
    const generateBtn = document.getElementById('generateImageBtn');
    const generatePromptInput = document.getElementById('generatePromptInput');
    if (generateBtn) generateBtn.addEventListener('click', () => this.handleGenerateImage());
    if (generatePromptInput) {
      generatePromptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleGenerateImage();
      });
    }

    // Magic Eraser Tool
    document.getElementById('magicEraserBtn')?.addEventListener('click', () => {
      this.editTool = 'eraser';
      this.engine.activeTool = 'eraser';
      this.engine.cropRect = null;
      document.getElementById('cropToolbar')?.classList.add('hidden');
      this.updateEditToolUI();
      this.engine.render();
    });

    // Crop Tool
    document.getElementById('cropToolBtn')?.addEventListener('click', () => {
      this.editTool = 'crop';
      this.engine.activeTool = 'crop';
      this.updateEditToolUI();
      this.engine.render();
    });

    // Eraser Size Slider
    const eraserSizeSlider = document.getElementById('eraserSizeSlider');
    if (eraserSizeSlider) {
      eraserSizeSlider.addEventListener('input', (e) => {
        this.engine.eraserSettings.size = parseInt(e.target.value, 10);
        document.getElementById('eraserSizeLabel').textContent = `${e.target.value}px`;
      });
    }

    // Crop Toolbar Buttons
    document.getElementById('cropApplyBtn')?.addEventListener('click', () => this.applyCropTool());
    document.getElementById('cropCancelBtn')?.addEventListener('click', () => this.cancelCropTool());

    // Photoshop Adjustments Sliders Binding
    const adjKeys = ['brightness', 'contrast', 'saturation', 'exposure', 'warmth', 'blur', 'sepia', 'grayscale', 'invert', 'hueRotate'];
    adjKeys.forEach(key => {
      const slider = document.getElementById(`adj_${key}`);
      const label = document.getElementById(`lbl_${key}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.currentAdjustments[key] = parseFloat(e.target.value);
          if (label) label.textContent = e.target.value;
          this.applyLivePhotoshopAdjustments();
        });
      }
    });

    // Filter LUT Preset Buttons
    document.querySelectorAll('.preset-filter-card').forEach(card => {
      card.addEventListener('click', () => {
        const presetKey = card.dataset.preset;
        this.applyFilterPreset(presetKey);
      });
    });

    // Inspector Inputs Binding
    this.bindInspectorControls();
  }

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.dock-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.dock-drawer-panel').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `dockPanel_${tab}`);
    });

    // Switch tool in engine
    if (tab === 'draw') {
      this.engine.activeTool = 'brush';
    } else if (tab === 'edit') {
      this.engine.activeTool = this.editTool;
    } else {
      this.engine.activeTool = 'select';
      this.engine.cropRect = null;
      document.getElementById('cropToolbar')?.classList.add('hidden');
    }
    this.updateEditToolUI();
    this.engine.render();
  }

  updateEditToolUI() {
    const tool = this.engine.activeTool;
    document.getElementById('magicEraserBtn')?.classList.toggle('active', tool === 'eraser');
    document.getElementById('cropToolBtn')?.classList.toggle('active', tool === 'crop');
    document.getElementById('eraserSizeField')?.classList.toggle('hidden', tool !== 'eraser');

    const hint = document.getElementById('editHint');
    if (!hint) return;

    if (tool === 'eraser') {
      const hasImage = this.engine.layers.some(l => l.type === 'image' && l.visible);
      hint.textContent = hasImage
        ? 'Drag directly over a photo in the canvas to erase its pixels.'
        : 'No image layers yet. Add one from the Photos tab (📁 Upload or Stock) first, then erase.';
    } else if (tool === 'crop') {
      hint.textContent = 'Drag on the canvas to draw a crop rectangle, then press Apply Crop.';
    } else {
      hint.textContent = 'Select a tool above, then use it on the canvas.';
    }
  }

  showToolNotice(msg) {
    const hint = document.getElementById('editHint');
    if (!hint) return;
    hint.textContent = msg;
    hint.style.borderColor = 'var(--brand-amber)';
    hint.style.color = 'var(--text-primary)';
    setTimeout(() => {
      hint.style.borderColor = '';
      hint.style.color = '';
      this.updateEditToolUI();
    }, 2500);
  }

  showCropToolbar() {
    document.getElementById('cropToolbar')?.classList.remove('hidden');
  }

  applyCropTool() {
    this.engine.applyCrop();
    this.editTool = 'select';
    document.getElementById('cropToolbar')?.classList.add('hidden');
    this.updateEditToolUI();
  }

  cancelCropTool() {
    this.engine.clearCrop();
    this.engine.activeTool = 'select';
    this.editTool = 'select';
    document.getElementById('cropToolbar')?.classList.add('hidden');
    this.updateEditToolUI();
  }

  updateZoomDisplay() {
    const zoomText = document.getElementById('zoomPercentageText');
    if (zoomText) zoomText.textContent = `${Math.round(this.engine.zoom * 100)}%`;
  }

  updateHistoryUI({ canUndo, canRedo }) {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = !canUndo;
    if (redoBtn) redoBtn.disabled = !canRedo;
  }

  // ==========================================
  // HOME LOBBY
  // ==========================================
  renderLobby() {
    const presets = [
      { id: 'sq1080', label: 'Instagram Post', w: 1080, h: 1080, icon: '⬛' },
      { id: 'story', label: 'Story / Reel', w: 1080, h: 1920, icon: '📱' },
      { id: 'yt', label: 'YouTube Thumbnail', w: 1280, h: 720, icon: '▶️' },
      { id: 'tw', label: 'X / Twitter Header', w: 1500, h: 500, icon: '🐦' },
      { id: 'fb', label: 'Facebook Post', w: 1200, h: 630, icon: '👍' }
    ];

    const grid = document.getElementById('lobbyProjectGrid');
    if (grid) {
      grid.innerHTML = presets.map(p => `
        <button class="lobby-project-card" data-size="${p.id}">
          <div class="lobby-canvas-preview" style="aspect-ratio: ${p.w}/${p.h};">
            <span class="lobby-canvas-icon">${p.icon}</span>
          </div>
          <strong>${p.label}</strong>
          <span class="lobby-canvas-dims">${p.w} × ${p.h}</span>
        </button>
      `).join('');
      grid.querySelectorAll('.lobby-project-card').forEach(card => {
        card.addEventListener('click', () => {
          const preset = presets.find(p => p.id === card.dataset.size);
          if (preset) this.createBlankCanvas(preset.w, preset.h, preset.label);
        });
      });
    }

    const tgrid = document.getElementById('lobbyTemplatesGrid');
    if (tgrid) {
      tgrid.innerHTML = TEMPLATES_LIBRARY.map(tmpl => `
        <button class="lobby-template-card" data-template-id="${tmpl.id}">
          <div class="lobby-template-preview" style="background: ${tmpl.backgroundColor}">
            <span>${tmpl.name}</span>
          </div>
          <div class="lobby-template-info">
            <strong>${tmpl.name}</strong>
            <span>${tmpl.width} × ${tmpl.height}</span>
          </div>
        </button>
      `).join('');
      tgrid.querySelectorAll('.lobby-template-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.templateId;
          this.loadTemplate(id);
          this.enterStudio();
        });
      });
    }
  }

  createBlankCanvas(w, h, label) {
    this.engine.setDocDimensions(w, h);
    this.engine.backgroundColor = '#ffffff';
    this.engine.layers = [];
    this.engine.selectedLayerId = null;
    this.engine.saveState();
    this.engine.render();
    this.renderLayersList(this.engine.layers);
    this.handleSelectionChange(null);
    this.enterStudio();
  }

  showLobby() {
    document.getElementById('homeLobby')?.classList.remove('hidden');
    document.querySelector('.studio-wrapper')?.classList.add('hidden');
  }

  enterStudio() {
    document.getElementById('homeLobby')?.classList.add('hidden');
    document.querySelector('.studio-wrapper')?.classList.remove('hidden');
    this.engine.resizeViewport();
    this.engine.fitToScreen();
    this.updateZoomDisplay();
    this.updateHistoryUI({ canUndo: this.engine.canUndo(), canRedo: this.engine.canRedo() });
  }

  // ==========================================
  // TEMPLATES & ASSET RENDERING
  // ==========================================
  renderTemplatesList() {
    const container = document.getElementById('templatesListContainer');
    if (!container) return;

    container.innerHTML = TEMPLATES_LIBRARY.map(tmpl => `
      <div class="template-card" data-template-id="${tmpl.id}">
        <div class="template-card-preview" style="background: ${tmpl.backgroundColor}">
          <span style="font-weight: 800; font-size: 1rem; color: #fff;">${tmpl.name}</span>
        </div>
        <div class="template-card-info">
          <strong>${tmpl.name}</strong>
          <span>${tmpl.width} × ${tmpl.height}</span>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.templateId;
        this.loadTemplate(id);
      });
    });
  }

  renderStockPhotosList() {
    const container = document.getElementById('stockPhotosListContainer');
    if (!container) return;

    container.innerHTML = SAMPLE_ASSETS.map((asset, idx) => `
      <div class="stock-photo-card" data-asset-idx="${idx}">
        <img src="${asset.url}" alt="${asset.name}" class="stock-img-thumb" />
        <span class="stock-name-lbl">${asset.name}</span>
      </div>
    `).join('');

    container.querySelectorAll('.stock-photo-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.assetIdx, 10);
        const asset = SAMPLE_ASSETS[idx];
        const img = new Image();
        img.onload = () => {
          this.engine.addLayer({
            type: 'image',
            name: asset.name,
            imageElement: img,
            src: asset.url,
            width: 500,
            height: 375
          });
        };
        img.src = asset.url;
      });
    });
  }

  // ==========================================
  // AI IMAGE GENERATOR
  // ==========================================
  async handleGenerateImage() {
    const input = document.getElementById('generatePromptInput');
    const prompt = (input?.value || '').trim();
    const style = document.getElementById('generateStyleSelect')?.value || 'auto';
    const status = document.getElementById('generateStatus');
    const btn = document.getElementById('generateImageBtn');

    if (btn) btn.disabled = true;
    if (status) status.textContent = '🎨 Rendering your image…';

    // Yield so the button/status updates paint before heavy rendering
    await new Promise(resolve => setTimeout(resolve, 30));

    try {
      const canvas = PhotoXysGenerator.generate(prompt, style);
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        this.engine.addLayer({
          type: 'image',
          name: prompt ? `AI: ${prompt.slice(0, 24)}` : 'AI Generated Image',
          imageElement: img,
          src: dataUrl,
          width: 640,
          height: 640
        });
        if (status) status.textContent = '✅ Image added to canvas!';
      };
      img.src = dataUrl;
    } catch (e) {
      if (status) status.textContent = '⚠️ Failed to render. Try again.';
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  loadTemplate(templateId) {
    const tmpl = TEMPLATES_LIBRARY.find(t => t.id === templateId);
    if (!tmpl) return;

    this.engine.docWidth = tmpl.width;
    this.engine.docHeight = tmpl.height;
    this.engine.backgroundColor = tmpl.backgroundColor || '#ffffff';
    this.engine.layers = [];

    tmpl.layers.forEach(layerData => {
      this.engine.addLayer(layerData, false);
    });

    this.engine.fitToScreen();
    this.updateZoomDisplay();
    this.engine.saveState();
  }

  // ==========================================
  // PHOTOSHOP ADJUSTMENTS & FILTERS
  // ==========================================
  applyLivePhotoshopAdjustments() {
    const selected = this.engine.getSelectedLayer();
    if (!selected || selected.type !== 'image' || !selected.imageElement) return;

    const processed = PhotoXysFilterEngine.processImage(selected.imageElement, this.currentAdjustments);
    selected.processedCanvas = processed;
    selected.adjustments = { ...this.currentAdjustments };
    this.engine.render();
  }

  applyFilterPreset(presetKey) {
    const selected = this.engine.getSelectedLayer();
    if (!selected || selected.type !== 'image' || !selected.imageElement) {
      alert('Please select an Image Layer to apply Photoshop adjustments.');
      return;
    }

    const presets = PhotoXysFilterEngine.getPresets();
    const preset = presets[presetKey] || presets.none;

    // Reset sliders
    Object.assign(this.currentAdjustments, {
      brightness: 0, contrast: 0, saturation: 0, exposure: 0,
      warmth: 0, blur: 0, sepia: 0, grayscale: 0, invert: 0, hueRotate: 0,
      ...preset.adjustments
    });

    // Update UI sliders
    for (const [k, v] of Object.entries(this.currentAdjustments)) {
      const slider = document.getElementById(`adj_${k}`);
      const lbl = document.getElementById(`lbl_${k}`);
      if (slider) slider.value = v;
      if (lbl) lbl.textContent = v;
    }

    this.applyLivePhotoshopAdjustments();
  }

  // ==========================================
  // INSPECTOR & PROPERTY CONTROLS
  // ==========================================
  bindInspectorControls() {
    // Fill color
    const fillColorInput = document.getElementById('inspectorFillColor');
    if (fillColorInput) {
      fillColorInput.addEventListener('input', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer) this.engine.updateLayer(layer.id, { fill: e.target.value });
      });
    }

    // Stroke color & width
    const strokeColorInput = document.getElementById('inspectorStrokeColor');
    const strokeWidthSlider = document.getElementById('inspectorStrokeWidth');
    if (strokeColorInput) {
      strokeColorInput.addEventListener('input', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer) this.engine.updateLayer(layer.id, { stroke: e.target.value });
      });
    }
    if (strokeWidthSlider) {
      strokeWidthSlider.addEventListener('input', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer) this.engine.updateLayer(layer.id, { strokeWidth: parseInt(e.target.value, 10) });
      });
    }

    // Opacity
    const opacitySlider = document.getElementById('inspectorOpacitySlider');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer) {
          const val = parseFloat(e.target.value);
          this.engine.updateLayer(layer.id, { opacity: val });
          document.getElementById('inspectorOpacityLabel').textContent = `${Math.round(val * 100)}%`;
        }
      });
    }

    // Blend mode
    const blendModeSelect = document.getElementById('inspectorBlendMode');
    if (blendModeSelect) {
      blendModeSelect.addEventListener('change', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer) this.engine.updateLayer(layer.id, { blendMode: e.target.value });
      });
    }

    // Text properties
    const textContentInput = document.getElementById('inspectorTextContent');
    const fontSelect = document.getElementById('inspectorFontFamily');
    const fontSizeInput = document.getElementById('inspectorFontSize');
    const textAlignSelect = document.getElementById('inspectorTextAlign');

    if (textContentInput) {
      textContentInput.addEventListener('input', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer && layer.type === 'text') {
          this.engine.updateLayer(layer.id, { text: e.target.value });
        }
      });
    }
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer && layer.type === 'text') {
          this.engine.updateLayer(layer.id, { font: e.target.value });
        }
      });
    }
    if (fontSizeInput) {
      fontSizeInput.addEventListener('input', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer && layer.type === 'text') {
          this.engine.updateLayer(layer.id, { fontSize: parseInt(e.target.value, 10) });
        }
      });
    }
    if (textAlignSelect) {
      textAlignSelect.addEventListener('change', (e) => {
        const layer = this.engine.getSelectedLayer();
        if (layer && layer.type === 'text') {
          this.engine.updateLayer(layer.id, { align: e.target.value });
        }
      });
    }

    // Layer Order buttons
    document.getElementById('bringFrontBtn')?.addEventListener('click', () => {
      if (this.engine.selectedLayerId) this.engine.moveLayer(this.engine.selectedLayerId, 'top');
    });
    document.getElementById('sendBackBtn')?.addEventListener('click', () => {
      if (this.engine.selectedLayerId) this.engine.moveLayer(this.engine.selectedLayerId, 'bottom');
    });
    document.getElementById('duplicateSelectedBtn')?.addEventListener('click', () => {
      if (this.engine.selectedLayerId) this.engine.duplicateLayer(this.engine.selectedLayerId);
    });
    document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
      if (this.engine.selectedLayerId) this.engine.deleteLayer(this.engine.selectedLayerId);
    });
    document.getElementById('deleteSelectedBigBtn')?.addEventListener('click', () => {
      if (this.engine.selectedLayerId) this.engine.deleteLayer(this.engine.selectedLayerId);
    });
  }

  handleSelectionChange(layer) {
    const emptyInspector = document.getElementById('inspectorEmptyState');
    const activeInspector = document.getElementById('inspectorActiveState');
    const textGroup = document.getElementById('inspectorTextGroup');
    const shapeGroup = document.getElementById('inspectorShapeGroup');
    const deleteGroup = document.getElementById('inspectorDeleteGroup');

    if (!layer) {
      emptyInspector?.classList.remove('hidden');
      activeInspector?.classList.add('hidden');
      deleteGroup?.classList.add('hidden');
      return;
    }

    emptyInspector?.classList.add('hidden');
    activeInspector?.classList.remove('hidden');

    // Prominent Delete button for text / photo / drawing layers
    if (layer.type === 'text' || layer.type === 'image' || layer.type === 'drawing') {
      deleteGroup?.classList.remove('hidden');
    } else {
      deleteGroup?.classList.add('hidden');
    }

    // Populate common properties
    document.getElementById('inspectorLayerName').textContent = layer.name;
    document.getElementById('inspectorFillColor').value = layer.fill || '#3b82f6';
    document.getElementById('inspectorStrokeColor').value = layer.stroke || '#000000';
    document.getElementById('inspectorStrokeWidth').value = layer.strokeWidth || 0;
    document.getElementById('inspectorOpacitySlider').value = layer.opacity !== undefined ? layer.opacity : 1;
    document.getElementById('inspectorOpacityLabel').textContent = `${Math.round((layer.opacity !== undefined ? layer.opacity : 1) * 100)}%`;
    document.getElementById('inspectorBlendMode').value = layer.blendMode || 'source-over';

    // Type specific inspector sections
    if (layer.type === 'text') {
      textGroup?.classList.remove('hidden');
      shapeGroup?.classList.add('hidden');
      document.getElementById('inspectorTextContent').value = layer.text || '';
      document.getElementById('inspectorFontFamily').value = layer.font || 'Plus Jakarta Sans';
      document.getElementById('inspectorFontSize').value = layer.fontSize || 36;
      document.getElementById('inspectorTextAlign').value = layer.align || 'center';
    } else if (layer.type === 'shape') {
      textGroup?.classList.add('hidden');
      shapeGroup?.classList.remove('hidden');
    } else {
      textGroup?.classList.add('hidden');
      shapeGroup?.classList.add('hidden');
    }

    // Highlight active layer in Layers panel
    this.renderLayersList(this.engine.layers);
  }

  // ==========================================
  // LAYERS PANEL LIST
  // ==========================================
  renderLayersList(layers) {
    const container = document.getElementById('layersStackList');
    if (!container) return;

    if (layers.length === 0) {
      container.innerHTML = `<div class="empty-layers-msg">No layers in document</div>`;
      return;
    }

    // Render layers from top to bottom
    const reversed = [...layers].reverse();
    container.innerHTML = reversed.map(layer => {
      const isSelected = layer.id === this.engine.selectedLayerId;
      return `
        <div class="layer-item-row ${isSelected ? 'selected' : ''}" data-layer-id="${layer.id}">
          <div class="layer-item-title-box">
            <span class="layer-type-icon">${this.getLayerIcon(layer.type)}</span>
            <span class="layer-item-name">${layer.name}</span>
          </div>
          <div class="layer-item-actions">
            <button class="layer-action-btn toggle-vis" title="${layer.visible ? 'Hide' : 'Show'}">
              ${layer.visible ? '👁️' : '🕶️'}
            </button>
            <button class="layer-action-btn toggle-lock" title="${layer.locked ? 'Unlock' : 'Lock'}">
              ${layer.locked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind layer item row events
    container.querySelectorAll('.layer-item-row').forEach(row => {
      const id = row.dataset.layerId;

      row.addEventListener('click', (e) => {
        if (!e.target.closest('.layer-action-btn')) {
          this.engine.selectLayer(id);
        }
      });

      row.querySelector('.toggle-vis')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.toggleVisibility(id);
      });

      row.querySelector('.toggle-lock')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.toggleLock(id);
      });
    });
  }

  getLayerIcon(type) {
    if (type === 'text') return '🔤';
    if (type === 'image') return '🖼️';
    if (type === 'drawing') return '🖌️';
    return '🔷';
  }

  // ==========================================
  // EXPORT & DOWNLOAD
  // ==========================================
  handleDownload() {
    const format = document.getElementById('exportFormatSelect').value; // 'png' | 'jpeg' | 'webp'
    const scale = parseInt(document.getElementById('exportScaleSelect').value, 10) || 1;
    const mimeType = format === 'jpeg' ? 'image/jpeg' : (format === 'webp' ? 'image/webp' : 'image/png');
    const quality = 0.95;

    const dataUrl = this.engine.exportAsDataURL(mimeType, quality, scale);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `PhotoXys-Design-${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    document.getElementById('exportModal')?.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.photoXysApp = new PhotoXysApp();
});
