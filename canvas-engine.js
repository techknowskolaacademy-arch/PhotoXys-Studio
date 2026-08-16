/**
 * PhotoXys Core Multi-Layer Canvas Engine
 * Object-oriented rendering, selection bounding box, 8-handle transformation, 
 * freehand drawing, layer stack, undo/redo snapshots, zoom & pan.
 */

class PhotoXysEngine {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    // Virtual Document Canvas Dimensions
    this.docWidth = options.width || 1080;
    this.docHeight = options.height || 1080;
    this.backgroundColor = options.backgroundColor || '#ffffff';

    // Viewport Navigation (Zoom & Pan)
    this.zoom = 0.6;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    // Layers Stack
    this.layers = [];
    this.selectedLayerId = null;
    this.hoveredHandle = null; // null | 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr' | 'rot' | 'body'

    // Interaction State
    this.isDragging = false;
    this.isTransforming = false;
    this.transformMode = null; // 'drag' | 'resize' | 'rotate'
    this.activeHandle = null;
    this.dragStart = { x: 0, y: 0 };
    this.initialLayerState = null;

    // Drawing / Brush Tool State
    this.activeTool = 'select'; // 'select' | 'brush' | 'eraser' | 'crop' | 'pan'
    this.brushSettings = {
      size: 10,
      color: '#4f46e5',
      opacity: 1,
      type: 'pen' // 'pen' | 'highlighter' | 'neon'
    };
    this.currentDrawingPath = null;

    // Magic Eraser State
    this.eraserSettings = { size: 30 };
    this.isErasing = false;
    this.eraseStroke = null;

    // Crop Tool State
    this.cropRect = null; // { x, y, w, h } in document coords
    this.cropStart = null;
    this.isCropping = false;

    // History Stack
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 35;

    // Snap Alignment Guides
    this.snapGuides = { x: null, y: null };
    this.snapThreshold = 8;

    // Callbacks
    this.onSelectionChange = options.onSelectionChange || (() => {});
    this.onLayersChange = options.onLayersChange || (() => {});
    this.onHistoryChange = options.onHistoryChange || (() => {});
    this.onCropDrawn = options.onCropDrawn || (() => {});
    this.onToolNotice = options.onToolNotice || (() => {});

    this.init();
  }

  init() {
    this.resizeViewport();
    this.bindEvents();
    this.fitToScreen();
    this.saveState();
    this.render();
  }

  resizeViewport() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    this.render();
  }

  fitToScreen() {
    const padding = 60;
    const availW = this.canvas.width - padding * 2;
    const availH = this.canvas.height - padding * 2;

    const scaleX = availW / this.docWidth;
    const scaleY = availH / this.docHeight;
    this.zoom = Math.min(Math.min(scaleX, scaleY), 1.2);

    this.panX = (this.canvas.width - this.docWidth * this.zoom) / 2;
    this.panY = (this.canvas.height - this.docHeight * this.zoom) / 2;
    this.render();
  }

  setZoom(newZoom, centerX = this.canvas.width / 2, centerY = this.canvas.height / 2) {
    const clamped = Math.max(0.15, Math.min(4.0, newZoom));
    const factor = clamped / this.zoom;
    this.panX = centerX - (centerX - this.panX) * factor;
    this.panY = centerY - (centerY - this.panY) * factor;
    this.zoom = clamped;
    this.render();
  }

  setDocDimensions(w, h) {
    this.docWidth = w;
    this.docHeight = h;
    this.fitToScreen();
    this.saveState();
  }

  // ==========================================
  // COORDINATE TRANSFORMATIONS
  // ==========================================
  screenToDoc(screenX, screenY) {
    return {
      x: (screenX - this.panX) / this.zoom,
      y: (screenY - this.panY) / this.zoom
    };
  }

  docToScreen(docX, docY) {
    return {
      x: docX * this.zoom + this.panX,
      y: docY * this.zoom + this.panY
    };
  }

  // ==========================================
  // LAYER MANAGEMENT
  // ==========================================
  addLayer(layerData, selectImmediately = true) {
    const id = `layer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const layer = {
      id,
      name: layerData.name || `Layer ${this.layers.length + 1}`,
      type: layerData.type || 'shape', // 'shape' | 'text' | 'image' | 'drawing'
      x: layerData.x !== undefined ? layerData.x : this.docWidth / 2 - 100,
      y: layerData.y !== undefined ? layerData.y : this.docHeight / 2 - 100,
      width: layerData.width || 200,
      height: layerData.height || 200,
      rotation: layerData.rotation || 0,
      opacity: layerData.opacity !== undefined ? layerData.opacity : 1,
      blendMode: layerData.blendMode || 'source-over',
      visible: true,
      locked: false,
      shadow: layerData.shadow || { color: 'rgba(0,0,0,0)', blur: 0, x: 0, y: 0 },
      ...layerData
    };

    this.layers.push(layer);
    if (selectImmediately) {
      this.selectLayer(layer.id);
    }

    this.saveState();
    this.onLayersChange(this.layers);
    this.render();
    return layer;
  }

  getSelectedLayer() {
    return this.layers.find(l => l.id === this.selectedLayerId) || null;
  }

  selectLayer(id) {
    this.selectedLayerId = id;
    this.onSelectionChange(this.getSelectedLayer());
    this.render();
  }

  deselectAll() {
    this.selectedLayerId = null;
    this.onSelectionChange(null);
    this.render();
  }

  updateLayer(id, updates, commitHistory = true) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer || layer.locked) return;

    Object.assign(layer, updates);
    if (commitHistory) {
      this.saveState();
    }
    this.onSelectionChange(layer);
    this.onLayersChange(this.layers);
    this.render();
  }

  deleteLayer(id) {
    const idx = this.layers.findIndex(l => l.id === id);
    if (idx === -1) return;

    this.layers.splice(idx, 1);
    if (this.selectedLayerId === id) {
      this.selectedLayerId = null;
      this.onSelectionChange(null);
    }

    this.saveState();
    this.onLayersChange(this.layers);
    this.render();
  }

  duplicateLayer(id) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;

    const clone = JSON.parse(JSON.stringify(layer));
    clone.id = `layer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    clone.name = `${layer.name} Copy`;
    clone.x += 25;
    clone.y += 25;

    // Deep clone image reference if applicable
    if (layer.type === 'image' && layer.imageElement) {
      clone.imageElement = layer.imageElement;
      clone.processedCanvas = layer.processedCanvas;
    }

    this.layers.push(clone);
    this.selectLayer(clone.id);
    this.saveState();
    this.onLayersChange(this.layers);
    this.render();
  }

  moveLayer(id, direction) {
    const idx = this.layers.findIndex(l => l.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx < this.layers.length - 1) {
      const temp = this.layers[idx];
      this.layers[idx] = this.layers[idx + 1];
      this.layers[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = this.layers[idx];
      this.layers[idx] = this.layers[idx - 1];
      this.layers[idx - 1] = temp;
    } else if (direction === 'top') {
      const [layer] = this.layers.splice(idx, 1);
      this.layers.push(layer);
    } else if (direction === 'bottom') {
      const [layer] = this.layers.splice(idx, 1);
      this.layers.unshift(layer);
    }

    this.saveState();
    this.onLayersChange(this.layers);
    this.render();
  }

  toggleVisibility(id) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;
    layer.visible = !layer.visible;
    if (!layer.visible && this.selectedLayerId === id) {
      this.deselectAll();
    }
    this.saveState();
    this.onLayersChange(this.layers);
    this.render();
  }

  toggleLock(id) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;
    layer.locked = !layer.locked;
    this.saveState();
    this.onLayersChange(this.layers);
    this.render();
  }

  // ==========================================
  // UNDO / REDO HISTORY
  // ==========================================
  saveState() {
    // Drop future states if undone
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Serialize layers (strip non-serializable elements safely)
    const snapshot = {
      docWidth: this.docWidth,
      docHeight: this.docHeight,
      backgroundColor: this.backgroundColor,
      layers: this.layers.map(l => {
        const copy = { ...l };
        if (copy.imageElement) delete copy.imageElement;
        if (copy.processedCanvas) delete copy.processedCanvas;
        return copy;
      })
    };

    this.history.push(JSON.stringify(snapshot));
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }

    this.onHistoryChange({ canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return;
    this.historyIndex--;
    this.loadState(this.history[this.historyIndex]);
  }

  redo() {
    if (!this.canRedo()) return;
    this.historyIndex++;
    this.loadState(this.history[this.historyIndex]);
  }

  loadState(jsonString) {
    try {
      const state = JSON.parse(jsonString);
      this.docWidth = state.docWidth;
      this.docHeight = state.docHeight;
      this.backgroundColor = state.backgroundColor || '#ffffff';

      // Restore layers with re-attached image sources
      this.layers = state.layers.map(l => {
        if (l.type === 'image' && l.src) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = l.src;
          l.imageElement = img;
        }
        return l;
      });

      this.onLayersChange(this.layers);
      this.onSelectionChange(this.getSelectedLayer());
      this.onHistoryChange({ canUndo: this.canUndo(), canRedo: this.canRedo() });
      this.render();
    } catch (e) {
      console.error('Failed to load history state:', e);
    }
  }

  // ==========================================
  // EVENT BINDINGS & HIT TESTING
  // ==========================================
  bindEvents() {
    window.addEventListener('resize', () => this.resizeViewport());

    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    window.addEventListener('mouseup', (e) => this.handlePointerUp(e));

    // Mouse wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY < 0 ? 1.12 : 0.89;
      this.setZoom(this.zoom * delta, mouseX, mouseY);
    }, { passive: false });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.redo();
        else this.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
        return;
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (this.selectedLayerId) this.duplicateLayer(this.selectedLayerId);
        return;
      }

      // Delete Layer
      if (['Delete', 'Backspace'].includes(e.key)) {
        if (this.selectedLayerId) {
          e.preventDefault();
          this.deleteLayer(this.selectedLayerId);
        }
        return;
      }

      // Nudge position with arrows
      if (this.selectedLayerId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const layer = this.getSelectedLayer();
        if (!layer || layer.locked) return;

        if (e.key === 'ArrowUp') layer.y -= step;
        if (e.key === 'ArrowDown') layer.y += step;
        if (e.key === 'ArrowLeft') layer.x -= step;
        if (e.key === 'ArrowRight') layer.x += step;

        this.render();
        this.onSelectionChange(layer);
        return;
      }
    });
  }

  handlePointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const docPos = this.screenToDoc(clientX, clientY);

    // Pan mode or space pressed / middle mouse click
    if (this.activeTool === 'pan' || e.button === 1 || e.spaceKey) {
      this.isPanning = true;
      this.panStart = { x: clientX - this.panX, y: clientY - this.panY };
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    // Brush drawing mode
    if (this.activeTool === 'brush') {
      this.isDragging = true;
      this.currentDrawingPath = {
        id: `brush_${Date.now()}`,
        type: 'drawing',
        name: 'Brush Stroke',
        color: this.brushSettings.color,
        size: this.brushSettings.size,
        opacity: this.brushSettings.opacity,
        brushType: this.brushSettings.type,
        points: [{ x: docPos.x, y: docPos.y }]
      };
      this.render();
      return;
    }

    // Magic Eraser mode
    if (this.activeTool === 'eraser') {
      let target = null;
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const layer = this.layers[i];
        if (!layer.visible || layer.locked) continue;
        if (layer.type !== 'image' && layer.type !== 'drawing') continue;
        if (this.hitTestLayer(docPos.x, docPos.y, layer)) {
          target = layer;
          break;
        }
      }
      if (target) {
        if (this.selectedLayerId !== target.id) this.selectLayer(target.id);
        this.ensureMask(target);
        this.isErasing = true;
        this.eraseStroke = { layerId: target.id, last: null };
        this.applyErasePoint(target, docPos.x, docPos.y, true);
        this.render();
      } else {
        const hasEraseable = this.layers.some(l => (l.type === 'image' || l.type === 'drawing') && l.visible);
        this.onToolNotice(
          hasEraseable
            ? 'Nothing to erase under the cursor. Click and drag directly on a photo or pen stroke.'
            : 'No photos or pen strokes in this document yet. Add one first to use the Magic Eraser.'
        );
      }
      return;
    }

    // Crop mode
    if (this.activeTool === 'crop') {
      this.isCropping = true;
      this.cropStart = { x: docPos.x, y: docPos.y };
      this.cropRect = { x: docPos.x, y: docPos.y, w: 0, h: 0 };
      this.render();
      return;
    }

    // Check Handle Click on active selected layer
    const selected = this.getSelectedLayer();
    if (selected && !selected.locked) {
      const handleHit = this.hitTestHandles(clientX, clientY, selected);
      if (handleHit) {
        this.isTransforming = true;
        this.activeHandle = handleHit;
        this.dragStart = { x: docPos.x, y: docPos.y };
        this.initialLayerState = {
          x: selected.x,
          y: selected.y,
          width: selected.width,
          height: selected.height,
          rotation: selected.rotation || 0
        };
        return;
      }
    }

    // Check Layer Click (Top-to-bottom in stack)
    let clickedLayer = null;
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (!layer.visible) continue;
      if (this.hitTestLayer(docPos.x, docPos.y, layer)) {
        clickedLayer = layer;
        break;
      }
    }

    if (clickedLayer) {
      this.selectLayer(clickedLayer.id);
      if (!clickedLayer.locked) {
        this.isDragging = true;
        this.transformMode = 'drag';
        this.dragStart = { x: docPos.x, y: docPos.y };
        this.initialLayerState = { x: clickedLayer.x, y: clickedLayer.y };
      }
    } else {
      this.deselectAll();
    }
  }

  handlePointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const docPos = this.screenToDoc(clientX, clientY);

    if (this.isPanning) {
      this.panX = clientX - this.panStart.x;
      this.panY = clientY - this.panStart.y;
      this.render();
      return;
    }

    if (this.activeTool === 'brush' && this.isDragging && this.currentDrawingPath) {
      this.currentDrawingPath.points.push({ x: docPos.x, y: docPos.y });
      this.render();
      return;
    }

    if (this.activeTool === 'eraser' && this.isErasing) {
      const layer = this.getSelectedLayer();
      if (layer && layer.type === 'image' && layer.maskCanvas) {
        this.applyErasePoint(layer, docPos.x, docPos.y, false);
        this.render();
      }
      return;
    }

    if (this.activeTool === 'crop' && this.isCropping) {
      const start = this.cropStart;
      const x = Math.min(start.x, docPos.x);
      const y = Math.min(start.y, docPos.y);
      const w = Math.abs(docPos.x - start.x);
      const h = Math.abs(docPos.y - start.y);
      this.cropRect = { x, y, w, h };
      this.render();
      return;
    }

    const selected = this.getSelectedLayer();

    // Transforming active handle
    if (this.isTransforming && selected && this.initialLayerState) {
      const dx = docPos.x - this.dragStart.x;
      const dy = docPos.y - this.dragStart.y;

      if (this.activeHandle === 'rot') {
        // Rotation handle
        const centerX = selected.x + selected.width / 2;
        const centerY = selected.y + selected.height / 2;
        const angle = Math.atan2(docPos.y - centerY, docPos.x - centerX);
        let deg = (angle * 180) / Math.PI - 90;
        if (e.shiftKey) deg = Math.round(deg / 15) * 15; // 15-deg snap
        selected.rotation = deg;
      } else {
        // Resizing handles (8 directions)
        const init = this.initialLayerState;
        let newW = init.width;
        let newH = init.height;
        let newX = init.x;
        let newY = init.y;

        if (this.activeHandle.includes('r')) newW = Math.max(20, init.width + dx);
        if (this.activeHandle.includes('l')) {
          const clampedDx = Math.min(dx, init.width - 20);
          newW = init.width - clampedDx;
          newX = init.x + clampedDx;
        }
        if (this.activeHandle.includes('b')) newH = Math.max(20, init.height + dy);
        if (this.activeHandle.includes('t')) {
          const clampedDy = Math.min(dy, init.height - 20);
          newH = init.height - clampedDy;
          newY = init.y + clampedDy;
        }

        // Maintain aspect ratio with Shift
        if (e.shiftKey || selected.type === 'image' || selected.type === 'text') {
          const ratio = init.width / init.height;
          if (newW / ratio > newH) newH = newW / ratio;
          else newW = newH * ratio;
        }

        selected.x = newX;
        selected.y = newY;
        selected.width = newW;
        selected.height = newH;
      }

      this.onSelectionChange(selected);
      this.render();
      return;
    }

    // Dragging layer position
    if (this.isDragging && selected && this.initialLayerState) {
      let targetX = this.initialLayerState.x + (docPos.x - this.dragStart.x);
      let targetY = this.initialLayerState.y + (docPos.y - this.dragStart.y);

      // Snap guides (Center horizontal & vertical)
      this.snapGuides = { x: null, y: null };
      const centerX = targetX + selected.width / 2;
      const centerY = targetY + selected.height / 2;
      const docCenterX = this.docWidth / 2;
      const docCenterY = this.docHeight / 2;

      if (Math.abs(centerX - docCenterX) < this.snapThreshold) {
        targetX = docCenterX - selected.width / 2;
        this.snapGuides.x = docCenterX;
      }
      if (Math.abs(centerY - docCenterY) < this.snapThreshold) {
        targetY = docCenterY - selected.height / 2;
        this.snapGuides.y = docCenterY;
      }

      selected.x = targetX;
      selected.y = targetY;

      this.onSelectionChange(selected);
      this.render();
      return;
    }

    // Update Hover Cursor
    if (this.activeTool === 'select' && selected && !selected.locked) {
      const handle = this.hitTestHandles(clientX, clientY, selected);
      this.hoveredHandle = handle;
      if (handle === 'rot') this.canvas.style.cursor = 'grab';
      else if (['tl', 'br'].includes(handle)) this.canvas.style.cursor = 'nwse-resize';
      else if (['tr', 'bl'].includes(handle)) this.canvas.style.cursor = 'nesw-resize';
      else if (['ml', 'mr'].includes(handle)) this.canvas.style.cursor = 'ew-resize';
      else if (['tm', 'bm'].includes(handle)) this.canvas.style.cursor = 'ns-resize';
      else if (this.hitTestLayer(docPos.x, docPos.y, selected)) this.canvas.style.cursor = 'move';
      else this.canvas.style.cursor = 'default';
    } else if (this.activeTool === 'brush' || this.activeTool === 'eraser') {
      this.canvas.style.cursor = 'crosshair';
    } else if (this.activeTool === 'crop') {
      this.canvas.style.cursor = 'crosshair';
    } else if (this.activeTool === 'pan') {
      this.canvas.style.cursor = 'grab';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  handlePointerUp() {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = 'default';
    }

    if (this.activeTool === 'eraser' && this.isErasing) {
      this.isErasing = false;
      const layer = this.getSelectedLayer();
      if (layer && (layer.type === 'image' || layer.type === 'drawing')) {
        this.bakeEraseResult(layer);
        this.saveState();
      }
      this.eraseStroke = null;
      this.render();
    }

    if (this.activeTool === 'crop' && this.isCropping) {
      this.isCropping = false;
      if (this.cropRect) {
        this.cropRect = this.clampCropRect(this.cropRect);
        if (this.cropRect.w < 20 || this.cropRect.h < 20) {
          this.cropRect = null;
        } else {
          this.onCropDrawn(this.cropRect);
        }
      }
      this.render();
    }

    if (this.activeTool === 'brush' && this.currentDrawingPath) {
      const path = this.currentDrawingPath;
      if (path.points.length > 1) {
        // Compute true bounds so the stroke box encloses the pen marks
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const p of path.points) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
        const pad = (path.size || 8) * 1.5 + 4;
        path.x = minX - pad;
        path.y = minY - pad;
        path.width = Math.max(20, maxX - minX + pad * 2);
        path.height = Math.max(20, maxY - minY + pad * 2);
        this.addLayer(path);
      }
      this.currentDrawingPath = null;
    }

    if (this.isDragging || this.isTransforming) {
      this.isDragging = false;
      this.isTransforming = false;
      this.snapGuides = { x: null, y: null };
      this.saveState();
    }

    this.render();
  }

  // Check if point is inside layer bounds (with rotation)
  hitTestLayer(docX, docY, layer) {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    const rad = -((layer.rotation || 0) * Math.PI) / 180;

    // Untransform point
    const dx = docX - cx;
    const dy = docY - cy;
    const unrotX = dx * Math.cos(rad) - dy * Math.sin(rad) + cx;
    const unrotY = dx * Math.sin(rad) + dy * Math.cos(rad) + cy;

    return (
      unrotX >= layer.x &&
      unrotX <= layer.x + layer.width &&
      unrotY >= layer.y &&
      unrotY <= layer.y + layer.height
    );
  }

  // Hit test transform handles in screen space
  hitTestHandles(screenX, screenY, layer) {
    const handles = this.getScreenHandles(layer);
    const hitRadius = 10;

    for (const [key, pt] of Object.entries(handles)) {
      const dist = Math.hypot(screenX - pt.x, screenY - pt.y);
      if (dist <= hitRadius) return key;
    }
    return null;
  }

  getScreenHandles(layer) {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    const rad = ((layer.rotation || 0) * Math.PI) / 180;

    const transformPoint = (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + cx;
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + cy;
      return this.docToScreen(rx, ry);
    };

    const l = layer.x;
    const r = layer.x + layer.width;
    const t = layer.y;
    const b = layer.y + layer.height;
    const mx = layer.x + layer.width / 2;
    const my = layer.y + layer.height / 2;

    return {
      tl: transformPoint(l, t),
      tr: transformPoint(r, t),
      bl: transformPoint(l, b),
      br: transformPoint(r, b),
      tm: transformPoint(mx, t),
      bm: transformPoint(mx, b),
      ml: transformPoint(l, my),
      mr: transformPoint(r, my),
      rot: transformPoint(mx, t - 28 / this.zoom)
    };
  }

  // ==========================================
  // MAGIC ERASER
  // ==========================================
  ensureMask(layer) {
    if (layer.type === 'image') {
      const source = layer.processedCanvas || layer.imageElement;
      if (!source) return;
      const sw = source.width || source.naturalWidth;
      const sh = source.height || source.naturalHeight;
      if (!sw || !sh) return;
      if (!layer.maskCanvas || layer.maskCanvas.width !== sw || layer.maskCanvas.height !== sh) {
        layer.maskCanvas = document.createElement('canvas');
        layer.maskCanvas.width = sw;
        layer.maskCanvas.height = sh;
      }
    } else if (layer.type === 'drawing') {
      const w = Math.max(1, Math.ceil(layer.width || 20));
      const h = Math.max(1, Math.ceil(layer.height || 20));
      if (!layer.maskCanvas || layer.maskCanvas.width !== w || layer.maskCanvas.height !== h) {
        layer.maskCanvas = document.createElement('canvas');
        layer.maskCanvas.width = w;
        layer.maskCanvas.height = h;
      }
    }
  }

  applyErasePoint(layer, docX, docY, first) {
    if (!layer.maskCanvas) return;

    let imgX, imgY, radius;
    if (layer.type === 'image') {
      const source = layer.processedCanvas || layer.imageElement;
      if (!source) return;
      const sw = source.width || source.naturalWidth;
      const sh = source.height || source.naturalHeight;
      if (!sw || !sh) return;
      imgX = ((docX - layer.x) / layer.width) * sw;
      imgY = ((docY - layer.y) / layer.height) * sh;
      radius = (this.eraserSettings.size / layer.width) * sw;
    } else {
      const mw = layer.maskCanvas.width;
      const mh = layer.maskCanvas.height;
      imgX = ((docX - layer.x) / layer.width) * mw;
      imgY = ((docY - layer.y) / layer.height) * mh;
      radius = (this.eraserSettings.size / layer.width) * mw;
    }

    const mctx = layer.maskCanvas.getContext('2d');
    mctx.globalCompositeOperation = 'source-over';
    mctx.lineCap = 'round';
    mctx.lineJoin = 'round';
    mctx.strokeStyle = 'rgba(0,0,0,1)';
    mctx.lineWidth = Math.max(3, radius * 2);

    if (first) {
      mctx.beginPath();
      mctx.arc(imgX, imgY, Math.max(2, radius), 0, Math.PI * 2);
      mctx.fillStyle = 'rgba(0,0,0,1)';
      mctx.fill();
    } else if (this.eraseStroke && this.eraseStroke.last) {
      mctx.beginPath();
      mctx.moveTo(this.eraseStroke.last.x, this.eraseStroke.last.y);
      mctx.lineTo(imgX, imgY);
      mctx.stroke();
    }

    if (this.eraseStroke) this.eraseStroke.last = { x: imgX, y: imgY };
  }

  bakeEraseResult(layer) {
    try {
      if (layer.type === 'image') {
        const source = layer.processedCanvas || layer.imageElement;
        if (!source) return;
        const composite = document.createElement('canvas');
        composite.width = source.width;
        composite.height = source.height;
        const cctx = composite.getContext('2d');
        cctx.drawImage(source, 0, 0);
        if (layer.maskCanvas) {
          cctx.globalCompositeOperation = 'destination-out';
          cctx.drawImage(layer.maskCanvas, 0, 0);
        }
        layer.src = composite.toDataURL('image/png');
      } else if (layer.type === 'drawing') {
        // Rasterize the pen stroke + mask into an image layer so the erase is preserved in history
        const composite = this.rasterizeDrawing(layer);
        layer.processedCanvas = composite;
        layer.imageElement = composite;
        layer.maskCanvas = null;
        layer.type = 'image';
        layer.name = `${layer.name} (erased)`;
        layer.src = composite.toDataURL('image/png');
      }
    } catch (e) {}
  }

  rasterizeDrawing(layer) {
    const w = Math.max(1, Math.ceil(layer.width));
    const h = Math.max(1, Math.ceil(layer.height));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cctx = c.getContext('2d');

    const pts = layer.points;
    if (pts && pts.length >= 2) {
      cctx.strokeStyle = layer.color || '#4f46e5';
      cctx.lineWidth = layer.size || 8;
      cctx.lineCap = 'round';
      cctx.lineJoin = 'round';
      if (layer.brushType === 'neon') {
        cctx.shadowColor = layer.color;
        cctx.shadowBlur = 12;
      }
      cctx.beginPath();
      cctx.moveTo(pts[0].x - layer.x, pts[0].y - layer.y);
      for (let i = 1; i < pts.length; i++) {
        const p1 = pts[i - 1];
        const p2 = pts[i];
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        cctx.quadraticCurveTo(p1.x - layer.x, p1.y - layer.y, mid.x - layer.x, mid.y - layer.y);
      }
      cctx.stroke();
    }

    if (layer.maskCanvas) {
      cctx.globalCompositeOperation = 'destination-out';
      cctx.drawImage(layer.maskCanvas, 0, 0);
    }
    return c;
  }

  // ==========================================
  // CROP TOOL
  // ==========================================
  clampCropRect(rect) {
    if (!rect) return null;
    const x = Math.max(0, Math.min(rect.x, this.docWidth));
    const y = Math.max(0, Math.min(rect.y, this.docHeight));
    const w = Math.max(0, Math.min(rect.w, this.docWidth - x));
    const h = Math.max(0, Math.min(rect.h, this.docHeight - y));
    return { x, y, w, h };
  }

  applyCrop() {
    const rect = this.cropRect;
    if (!rect || rect.w < 20 || rect.h < 20) return;

    const { x: cx, y: cy, w: cw, h: ch } = rect;
    const keptLayers = [];

    for (const layer of this.layers) {
      const lx = layer.x - cx;
      const ly = layer.y - cy;
      const right = lx + layer.width;
      const bottom = ly + layer.height;

      if (right <= 0 || bottom <= 0 || lx >= cw || ly >= ch) continue;

      layer.x = Math.max(0, lx);
      layer.y = Math.max(0, ly);
      layer.width = Math.max(20, Math.min(right, cw) - layer.x);
      layer.height = Math.max(20, Math.min(bottom, ch) - layer.y);
      keptLayers.push(layer);
    }

    this.layers = keptLayers;
    this.docWidth = Math.round(cw);
    this.docHeight = Math.round(ch);
    this.cropRect = null;
    this.activeTool = 'select';

    this.fitToScreen();
    this.saveState();
    this.onLayersChange(this.layers);
    this.onSelectionChange(this.getSelectedLayer());
    this.render();
  }

  clearCrop() {
    this.cropRect = null;
    this.render();
  }

  // ==========================================
  // RENDERING PIPELINE
  // ==========================================
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Checkerboard background for workspace
    this.ctx.fillStyle = '#0e1526';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Draw Canvas Document Drop Shadow & Surface
    const docScreen = this.docToScreen(0, 0);
    const docW = this.docWidth * this.zoom;
    const docH = this.docHeight * this.zoom;

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    this.ctx.shadowBlur = 24;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 8;
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(docScreen.x, docScreen.y, docW, docH);
    this.ctx.restore();

    // 3. Clip to Document Canvas Bounds for rendering layers
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(docScreen.x, docScreen.y, docW, docH);
    this.ctx.clip();

    // Apply global canvas zoom & pan matrix
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // 4. Render Layers Stack (Bottom to Top)
    for (const layer of this.layers) {
      if (!layer.visible) continue;
      this.renderLayer(layer);
    }

    // Render in-progress brush stroke if active
    if (this.currentDrawingPath) {
      this.renderLayer(this.currentDrawingPath);
    }

    this.ctx.restore();

    // 5. Draw Snap Alignment Guides
    if (this.snapGuides.x !== null) {
      const p = this.docToScreen(this.snapGuides.x, 0);
      this.ctx.strokeStyle = '#ec4899';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, docScreen.y);
      this.ctx.lineTo(p.x, docScreen.y + docH);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    if (this.snapGuides.y !== null) {
      const p = this.docToScreen(0, this.snapGuides.y);
      this.ctx.strokeStyle = '#ec4899';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.moveTo(docScreen.x, p.y);
      this.ctx.lineTo(docScreen.x + docW, p.y);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // 6. Draw Selected Layer Bounding Box & Transform Handles
    const selected = this.getSelectedLayer();
    if (selected && !selected.locked && this.activeTool === 'select') {
      this.renderTransformOverlay(selected);
    }

    // 7. Draw Crop Selection Overlay
    if (this.activeTool === 'crop' && this.cropRect) {
      this.renderCropOverlay(this.cropRect);
    }
  }

  renderCropOverlay(rect) {
    const p = this.docToScreen(rect.x, rect.y);
    const w = rect.w * this.zoom;
    const h = rect.h * this.zoom;

    this.ctx.save();

    // Dim the area outside the crop rectangle
    this.ctx.fillStyle = 'rgba(6, 9, 16, 0.55)';
    this.ctx.fillRect(0, 0, this.canvas.width, p.y);
    this.ctx.fillRect(0, p.y + h, this.canvas.width, this.canvas.height - (p.y + h));
    this.ctx.fillRect(0, p.y, p.x, h);
    this.ctx.fillRect(p.x + w, p.y, this.canvas.width - (p.x + w), h);

    // Border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(p.x, p.y, w, h);

    // Rule-of-thirds guides
    this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    this.ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const tx = p.x + (w / 3) * i;
      const ty = p.y + (h / 3) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(tx, p.y);
      this.ctx.lineTo(tx, p.y + h);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, ty);
      this.ctx.lineTo(p.x + w, ty);
      this.ctx.stroke();
    }

    // Corner handles
    const hh = 8;
    const corners = [[p.x, p.y], [p.x + w, p.y], [p.x, p.y + h], [p.x + w, p.y + h]];
    for (const [hx, hy] of corners) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#2563eb';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(hx - hh / 2, hy - hh / 2, hh, hh);
      this.ctx.strokeRect(hx - hh / 2, hy - hh / 2, hh, hh);
    }

    this.ctx.restore();
  }

  renderLayer(layer) {
    this.ctx.save();

    this.ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
    this.ctx.globalCompositeOperation = layer.blendMode || 'source-over';

    // Apply drop shadow
    if (layer.shadow && layer.shadow.blur > 0) {
      this.ctx.shadowColor = layer.shadow.color || 'rgba(0,0,0,0.3)';
      this.ctx.shadowBlur = layer.shadow.blur;
      this.ctx.shadowOffsetX = layer.shadow.x || 0;
      this.ctx.shadowOffsetY = layer.shadow.y || 0;
    }

    // Transform layer position and rotation
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    this.ctx.translate(cx, cy);
    if (layer.rotation) {
      this.ctx.rotate((layer.rotation * Math.PI) / 180);
    }
    this.ctx.translate(-cx, -cy);

    // Render Specific Layer Type
    if (layer.type === 'shape') {
      this.drawShape(layer);
    } else if (layer.type === 'sticker') {
      this.drawSticker(layer);
    } else if (layer.type === 'text') {
      this.drawText(layer);
    } else if (layer.type === 'image') {
      this.drawImage(layer);
    } else if (layer.type === 'drawing') {
      this.drawPath(layer);
    }

    this.ctx.restore();
  }

  drawShape(layer) {
    const { x, y, width: w, height: h, shapeType, fill, stroke, strokeWidth = 0, cornerRadius = 8 } = layer;
    this.ctx.fillStyle = fill || '#3b82f6';
    this.ctx.strokeStyle = stroke || 'transparent';
    this.ctx.lineWidth = strokeWidth;

    this.ctx.beginPath();

    if (shapeType === 'rect') {
      this.ctx.rect(x, y, w, h);
    } else if (shapeType === 'roundedRect') {
      this.ctx.roundRect(x, y, w, h, cornerRadius);
    } else if (shapeType === 'circle') {
      this.ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else if (shapeType === 'triangle') {
      this.ctx.moveTo(x + w / 2, y);
      this.ctx.lineTo(x + w, y + h);
      this.ctx.lineTo(x, y + h);
      this.ctx.closePath();
    } else if (shapeType === 'diamond') {
      this.ctx.moveTo(x + w / 2, y);
      this.ctx.lineTo(x + w, y + h / 2);
      this.ctx.lineTo(x + w / 2, y + h);
      this.ctx.lineTo(x, y + h / 2);
      this.ctx.closePath();
    } else if (shapeType === 'pentagon') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
    } else if (shapeType === 'hexagon') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i * 2 * Math.PI) / 6;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
    } else if (shapeType === 'octagon') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      for (let i = 0; i < 8; i++) {
        const a = (i * 2 * Math.PI) / 8 + Math.PI / 8;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
    } else if (shapeType === 'star') {
      const spikes = 5;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.45;
      const cx = x + w / 2;
      const cy = y + h / 2;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      this.ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        let px = cx + Math.cos(rot) * outerR;
        let py = cy + Math.sin(rot) * outerR;
        this.ctx.lineTo(px, py);
        rot += step;

        px = cx + Math.cos(rot) * innerR;
        py = cy + Math.sin(rot) * innerR;
        this.ctx.lineTo(px, py);
        rot += step;
      }
      this.ctx.closePath();
    } else if (shapeType === 'badgeBurst') {
      const spikes = 12;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.78;
      const cx = x + w / 2;
      const cy = y + h / 2;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      this.ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        let px = cx + Math.cos(rot) * outerR;
        let py = cy + Math.sin(rot) * outerR;
        this.ctx.lineTo(px, py);
        rot += step;

        px = cx + Math.cos(rot) * innerR;
        py = cy + Math.sin(rot) * innerR;
        this.ctx.lineTo(px, py);
        rot += step;
      }
      this.ctx.closePath();
    } else if (shapeType === 'arrowRight') {
      const bodyH = h * 0.4;
      const bodyY = y + (h - bodyH) / 2;
      const headW = w * 0.4;
      this.ctx.moveTo(x, bodyY);
      this.ctx.lineTo(x + w - headW, bodyY);
      this.ctx.lineTo(x + w - headW, y);
      this.ctx.lineTo(x + w, y + h / 2);
      this.ctx.lineTo(x + w - headW, y + h);
      this.ctx.lineTo(x + w - headW, bodyY + bodyH);
      this.ctx.lineTo(x, bodyY + bodyH);
      this.ctx.closePath();
    } else if (shapeType === 'arrowLeft') {
      const bodyH = h * 0.4;
      const bodyY = y + (h - bodyH) / 2;
      const headW = w * 0.4;
      this.ctx.moveTo(x + w, bodyY);
      this.ctx.lineTo(x + headW, bodyY);
      this.ctx.lineTo(x + headW, y);
      this.ctx.lineTo(x, y + h / 2);
      this.ctx.lineTo(x + headW, y + h);
      this.ctx.lineTo(x + headW, bodyY + bodyH);
      this.ctx.lineTo(x + w, bodyY + bodyH);
      this.ctx.closePath();
    } else if (shapeType === 'speechBubble') {
      const r = 16;
      const tailW = 24;
      const tailH = 20;
      const mainH = h - tailH;
      this.ctx.roundRect(x, y, w, mainH, r);
      this.ctx.moveTo(x + 30, y + mainH);
      this.ctx.lineTo(x + 45, y + h);
      this.ctx.lineTo(x + 30 + tailW, y + mainH);
    } else if (shapeType === 'shield') {
      this.ctx.moveTo(x + w / 2, y);
      this.ctx.lineTo(x + w, y + h * 0.2);
      this.ctx.lineTo(x + w, y + h * 0.6);
      this.ctx.bezierCurveTo(x + w, y + h * 0.85, x + w / 2, y + h, x + w / 2, y + h);
      this.ctx.bezierCurveTo(x + w / 2, y + h, x, y + h * 0.85, x, y + h * 0.6);
      this.ctx.lineTo(x, y + h * 0.2);
      this.ctx.closePath();
    } else if (shapeType === 'heart') {
      const topY = y + h * 0.3;
      this.ctx.moveTo(x + w / 2, y + h);
      this.ctx.bezierCurveTo(x, y + h * 0.7, x, y, x + w / 2, topY);
      this.ctx.bezierCurveTo(x + w, y, x + w, y + h * 0.7, x + w / 2, y + h);
    } else {
      this.ctx.rect(x, y, w, h);
    }

    if (fill && fill !== 'transparent') this.ctx.fill();
    if (strokeWidth > 0 && stroke && stroke !== 'transparent') this.ctx.stroke();
  }

  drawSticker(layer) {
    const { x, y, width: w, height: h, emoji, stickerText, fill = '#3b82f6' } = layer;

    if (emoji) {
      this.ctx.font = `${Math.min(w, h) * 0.75}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(emoji, x + w / 2, y + h / 2);
    } else if (stickerText) {
      // Render Graphic Badge Sticker (e.g. 50% OFF, NEW, HOT, BESTSELLER)
      this.ctx.fillStyle = fill;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, w, h, 14);
      this.ctx.fill();

      this.ctx.font = `800 ${Math.min(w * 0.16, h * 0.45)}px "Outfit", sans-serif`;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(stickerText, x + w / 2, y + h / 2);
    }
  }

  drawText(layer) {
    const { x, y, width: w, height: h, text, font = 'Plus Jakarta Sans', fontSize = 36, fontWeight = 700, fill = '#ffffff', align = 'center', stroke, strokeWidth = 0 } = layer;

    this.ctx.font = `${fontWeight} ${fontSize}px "${font}", sans-serif`;
    this.ctx.fillStyle = fill;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';

    let posX = x + w / 2;
    if (align === 'left') posX = x;
    if (align === 'right') posX = x + w;

    if (strokeWidth > 0 && stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.strokeText(text, posX, y + h / 2);
    }

    this.ctx.fillText(text, posX, y + h / 2);
  }

  drawImage(layer) {
    const { x, y, width: w, height: h, imageElement, processedCanvas, maskCanvas } = layer;
    const source = processedCanvas || imageElement;
    if (source && (source.complete || source instanceof HTMLCanvasElement)) {
      this.ctx.drawImage(source, x, y, w, h);
      if (maskCanvas) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.drawImage(maskCanvas, x, y, w, h);
        this.ctx.restore();
      }
    }
  }

  drawPath(layer) {
    if (!layer.points || layer.points.length < 2) return;

    this.ctx.strokeStyle = layer.color || '#4f46e5';
    this.ctx.lineWidth = layer.size || 8;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (layer.brushType === 'neon') {
      this.ctx.shadowColor = layer.color;
      this.ctx.shadowBlur = 12;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(layer.points[0].x, layer.points[0].y);

    for (let i = 1; i < layer.points.length; i++) {
      const p1 = layer.points[i - 1];
      const p2 = layer.points[i];
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      this.ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
    }
    this.ctx.stroke();

    // Apply Magic Eraser mask (destination-out erases the stroke where painted)
    if (layer.maskCanvas) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.drawImage(layer.maskCanvas, layer.x, layer.y, layer.width, layer.height);
      this.ctx.restore();
    }
  }

  // 6. Draw Interactive Transform Handles Overlay
  renderTransformOverlay(layer) {
    const handles = this.getScreenHandles(layer);

    this.ctx.save();
    this.ctx.strokeStyle = '#2563eb';
    this.ctx.lineWidth = 1.5;

    // Draw Bounding Outline
    this.ctx.beginPath();
    this.ctx.moveTo(handles.tl.x, handles.tl.y);
    this.ctx.lineTo(handles.tr.x, handles.tr.y);
    this.ctx.lineTo(handles.br.x, handles.br.y);
    this.ctx.lineTo(handles.bl.x, handles.bl.y);
    this.ctx.closePath();
    this.ctx.stroke();

    // Line connecting to rotation handle
    this.ctx.beginPath();
    this.ctx.moveTo(handles.tm.x, handles.tm.y);
    this.ctx.lineTo(handles.rot.x, handles.rot.y);
    this.ctx.stroke();

    // Draw Handles (White filled squares with blue border)
    const drawHandle = (pt, isRot = false) => {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#2563eb';
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      if (isRot) {
        this.ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
      } else {
        this.ctx.rect(pt.x - 4.5, pt.y - 4.5, 9, 9);
      }
      this.ctx.fill();
      this.ctx.stroke();
    };

    drawHandle(handles.tl);
    drawHandle(handles.tr);
    drawHandle(handles.bl);
    drawHandle(handles.br);
    drawHandle(handles.tm);
    drawHandle(handles.bm);
    drawHandle(handles.ml);
    drawHandle(handles.mr);
    drawHandle(handles.rot, true);

    this.ctx.restore();
  }

  // ==========================================
  // EXPORT PIPELINE
  // ==========================================
  exportAsDataURL(format = 'image/png', quality = 0.95, multiplier = 1) {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.docWidth * multiplier;
    exportCanvas.height = this.docHeight * multiplier;
    const expCtx = exportCanvas.getContext('2d');

    // Fill document background (or transparent if PNG with transparent setting)
    if (format === 'image/jpeg' || this.backgroundColor !== 'transparent') {
      expCtx.fillStyle = this.backgroundColor || '#ffffff';
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    expCtx.scale(multiplier, multiplier);

    // Render layers
    for (const layer of this.layers) {
      if (!layer.visible) continue;

      expCtx.save();
      expCtx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
      expCtx.globalCompositeOperation = layer.blendMode || 'source-over';

      if (layer.shadow && layer.shadow.blur > 0) {
        expCtx.shadowColor = layer.shadow.color;
        expCtx.shadowBlur = layer.shadow.blur;
        expCtx.shadowOffsetX = layer.shadow.x;
        expCtx.shadowOffsetY = layer.shadow.y;
      }

      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      expCtx.translate(cx, cy);
      if (layer.rotation) expCtx.rotate((layer.rotation * Math.PI) / 180);
      expCtx.translate(-cx, -cy);

      if (layer.type === 'shape') {
        const prevCtx = this.ctx;
        this.ctx = expCtx;
        this.drawShape(layer);
        this.ctx = prevCtx;
      } else if (layer.type === 'text') {
        const prevCtx = this.ctx;
        this.ctx = expCtx;
        this.drawText(layer);
        this.ctx = prevCtx;
      } else if (layer.type === 'image') {
        const prevCtx = this.ctx;
        this.ctx = expCtx;
        this.drawImage(layer);
        this.ctx = prevCtx;
      } else if (layer.type === 'drawing') {
        const prevCtx = this.ctx;
        this.ctx = expCtx;
        this.drawPath(layer);
        this.ctx = prevCtx;
      }

      expCtx.restore();
    }

    return exportCanvas.toDataURL(format, quality);
  }
}

window.PhotoXysEngine = PhotoXysEngine;
