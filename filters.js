/**
 * PhotoXys Image Processing & Filter Engine
 * Fast pixel-level manipulation for Brightness, Contrast, Saturation, Exposure, Blur, and Creative LUTs.
 */

class PhotoXysFilterEngine {
  /**
   * Apply parametric adjustment sliders to an image or canvas element
   * @param {HTMLImageElement|HTMLCanvasElement} sourceImage 
   * @param {Object} adjustments { brightness, contrast, saturation, exposure, warmth, blur, sepia, grayscale, invert, hueRotate }
   * @returns {HTMLCanvasElement} Processed canvas
   */
  static processImage(sourceImage, adjustments = {}) {
    const {
      brightness = 0,    // -100 to 100
      contrast = 0,      // -100 to 100
      saturation = 0,    // -100 to 100
      exposure = 0,      // -100 to 100
      warmth = 0,        // -100 to 100 (tint)
      blur = 0,          // 0 to 20 px
      sepia = 0,         // 0 to 100 %
      grayscale = 0,     // 0 to 100 %
      invert = 0,        // 0 to 100 %
      hueRotate = 0      // 0 to 360 deg
    } = adjustments;

    const canvas = document.createElement('canvas');
    const width = sourceImage.naturalWidth || sourceImage.width || 800;
    const height = sourceImage.naturalHeight || sourceImage.height || 600;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Use fast hardware CSS filters on canvas draw when possible
    let filterString = [];
    if (brightness !== 0) filterString.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) filterString.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filterString.push(`saturate(${100 + saturation}%)`);
    if (blur > 0) filterString.push(`blur(${blur}px)`);
    if (sepia > 0) filterString.push(`sepia(${sepia}%)`);
    if (grayscale > 0) filterString.push(`grayscale(${grayscale}%)`);
    if (invert > 0) filterString.push(`invert(${invert}%)`);
    if (hueRotate !== 0) filterString.push(`hue-rotate(${hueRotate}deg)`);

    ctx.filter = filterString.length > 0 ? filterString.join(' ') : 'none';
    ctx.drawImage(sourceImage, 0, 0, width, height);
    ctx.filter = 'none';

    // Pixel-level adjustments for warmth / exposure if needed
    if (warmth !== 0 || exposure !== 0) {
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const expFactor = (exposure / 100) * 128;
        const warmthR = warmth > 0 ? warmth * 0.4 : 0;
        const warmthB = warmth < 0 ? Math.abs(warmth) * 0.4 : 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue; // Skip transparent pixels

          // Exposure
          let r = data[i] + expFactor;
          let g = data[i + 1] + expFactor;
          let b = data[i + 2] + expFactor;

          // Warmth / Cool tint
          r += warmthR;
          b += warmthB;

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        // Cross-origin fallback
      }
    }

    return canvas;
  }

  /**
   * Preset Filter Definitions (Canva/Photoshop LUTs)
   */
  static getPresets() {
    return {
      none: { name: 'Normal', adjustments: {} },
      vivid: { name: 'Vivid HDR', adjustments: { contrast: 25, saturation: 35, brightness: 5 } },
      vintage: { name: 'Vintage 70s', adjustments: { sepia: 30, contrast: 15, saturation: -15, warmth: 25 } },
      cyberpunk: { name: 'Cyberpunk', adjustments: { contrast: 30, saturation: 50, hueRotate: 310, brightness: -5 } },
      golden: { name: 'Golden Hour', adjustments: { warmth: 45, brightness: 8, saturation: 20, contrast: 10 } },
      dramaticBW: { name: 'Dramatic B&W', adjustments: { grayscale: 100, contrast: 45, brightness: -5 } },
      emerald: { name: 'Emerald Matte', adjustments: { hueRotate: 140, saturation: 20, contrast: 15 } },
      cinematic: { name: 'Cinematic Teal', adjustments: { contrast: 20, saturation: 10, warmth: -20, brightness: -5 } },
      retroGlow: { name: 'Retro Glow', adjustments: { brightness: 15, saturation: 25, contrast: -10, blur: 0.5 } }
    };
  }

  /**
   * Apply preset to an image element and return canvas
   */
  static applyPreset(sourceImage, presetKey) {
    const presets = this.getPresets();
    const preset = presets[presetKey] || presets.none;
    return this.processImage(sourceImage, preset.adjustments);
  }
}

window.PhotoXysFilterEngine = PhotoXysFilterEngine;
