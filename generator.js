/**
 * PhotoXys AI Image Generator
 * Procedural offline image synthesis from a text prompt.
 */

class PhotoXysGenerator {
  static withAlpha(hex, a) {
    if (!hex || /^rgba?\(/i.test(hex)) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  static pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static parsePromptColors(prompt) {
    const colorMap = {
      red: 'red', crimson: 'red', scarlet: 'red',
      orange: 'orange', amber: 'orange', peach: 'orange',
      yellow: 'yellow', gold: 'gold', golden: 'gold',
      green: 'green', emerald: 'green', mint: 'green',
      teal: 'teal', cyan: 'cyan', aqua: 'cyan', sky: 'cyan', blue: 'blue',
      navy: 'indigo', indigo: 'indigo', violet: 'purple', purple: 'purple', lavender: 'purple',
      pink: 'pink', magenta: 'magenta', fuchsia: 'magenta', rose: 'pink',
      white: 'white', black: 'black', dark: 'black', silver: 'white',
      ocean: 'ocean', sunset: 'sunset', neon: 'neon', cyberpunk: 'cyber'
    };
    const text = prompt.toLowerCase();
    for (const [word, key] of Object.entries(colorMap)) {
      if (text.includes(word)) return key;
    }
    return null;
  }

  static getPalette(prompt) {
    const palettes = {
      red: ['#450a0a', '#dc2626', '#fb7185'],
      orange: ['#431407', '#ea580c', '#fdba74'],
      yellow: ['#422006', '#eab308', '#fef08a'],
      green: ['#052e16', '#16a34a', '#86efac'],
      teal: ['#042f2e', '#0d9488', '#5eead4'],
      cyan: ['#082f49', '#06b6d4', '#7dd3fc'],
      blue: ['#172554', '#2563eb', '#93c5fd'],
      indigo: ['#1e1b4b', '#4f46e5', '#a5b4fc'],
      purple: ['#2e1065', '#7c3aed', '#c4b5fd'],
      pink: ['#4a044e', '#db2777', '#f9a8d4'],
      magenta: ['#4a044e', '#c026d3', '#f0abfc'],
      gold: ['#451a03', '#d97706', '#fcd34d'],
      white: ['#1e293b', '#e2e8f0', '#ffffff'],
      black: ['#020617', '#1e293b', '#64748b'],
      sunset: ['#431407', '#f97316', '#fbbf24'],
      ocean: ['#082f49', '#0ea5e9', '#67e8f9'],
      neon: ['#020617', '#a3e635', '#22d3ee'],
      cyber: ['#0f172a', '#06b6d4', '#ec4899']
    };
    const key = this.parsePromptColors(prompt);
    if (key && palettes[key]) return palettes[key];
    return this.pickRandom([
      ['#1e1b4b', '#7c3aed', '#ec4899'],
      ['#082f49', '#06b6d4', '#67e8f9'],
      ['#431407', '#ea580c', '#fbbf24'],
      ['#2e1065', '#4f46e5', '#22d3ee'],
      ['#052e16', '#0d9488', '#bef264'],
      ['#3b0764', '#c026d3', '#f0abfc']
    ]);
  }

  static detectSubject(prompt) {
    const t = prompt.toLowerCase();
    if (/(galaxy|space|star|cosmos|nebula|universe|planet)/.test(t)) return 'galaxy';
    if (/(sunset|dusk|dawn|horizon|sunrise)/.test(t)) return 'sunset';
    if (/(ocean|sea|beach|water|wave|surf)/.test(t)) return 'waves';
    if (/(mountain|peak|hill|alps|snowcap)/.test(t)) return 'mountain';
    if (/(city|cyberpunk|neon|night|retro|synthwave|skyline)/.test(t)) return 'cyber';
    if (/(fire|flame|flames|burn|blaze)/.test(t)) return 'fire';
    if (/(flower|rose|blossom|botanical|garden|tulip)/.test(t)) return 'flower';
    if (/(heart|love)/.test(t)) return 'heart';
    if (/(forest|tree|jungle|leaf|woods)/.test(t)) return 'forest';
    if (/(desert|sand|dune)/.test(t)) return 'desert';
    if (/(geometry|geometric|pattern|art deco)/.test(t)) return 'geometric';
    return null;
  }

  static generate(prompt, style = 'auto') {
    const canvas = document.createElement('canvas');
    const S = 1024;
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');

    const styleMap = {
      abstract: 'abstract', gradient: 'gradient', geometric: 'geometric',
      waves: 'waves', galaxy: 'galaxy', cyberpunk: 'cyber', sunset: 'sunset',
      mountain: 'mountain', ocean: 'waves', auto: null
    };
    let subject = styleMap[style] ?? null;
    if (!subject) subject = this.detectSubject(prompt);

    const palette = this.getPalette(prompt);

    switch (subject) {
      case 'galaxy': this.drawGalaxy(ctx, S, palette); break;
      case 'sunset': this.drawSunset(ctx, S, palette); break;
      case 'waves': this.drawWaves(ctx, S, palette); break;
      case 'mountain': this.drawMountain(ctx, S, palette); break;
      case 'cyber': this.drawCyber(ctx, S, palette); break;
      case 'fire': this.drawFire(ctx, S, palette); break;
      case 'flower': this.drawFlower(ctx, S, palette); break;
      case 'heart': this.drawHearts(ctx, S, palette); break;
      case 'forest': this.drawForest(ctx, S, palette); break;
      case 'desert': this.drawDesert(ctx, S, palette); break;
      case 'gradient': this.drawGradient(ctx, S, palette); break;
      case 'geometric': this.drawGeometric(ctx, S, palette); break;
      default: this.drawAbstract(ctx, S, palette);
    }

    this.applyVignette(ctx, S);
    return canvas;
  }

  static drawGradient(ctx, S, p) {
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, p[0]);
    g.addColorStop(0.55, p[1]);
    g.addColorStop(1, p[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    const glow = ctx.createRadialGradient(S * 0.28, S * 0.3, 0, S * 0.28, S * 0.3, S * 0.75);
    glow.addColorStop(0, 'rgba(255,255,255,0.35)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, S, S);
  }

  static drawAbstract(ctx, S, p) {
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 7; i++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      const r = S * (0.2 + Math.random() * 0.35);
      const col = p[i % 3];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, this.withAlpha(col, 0.9));
      g.addColorStop(0.6, this.withAlpha(col, 0.35));
      g.addColorStop(1, this.withAlpha(col, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);
    }
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      const len = S * (0.1 + Math.random() * 0.3);
      const ang = Math.random() * Math.PI;
      ctx.strokeStyle = p[i % 3];
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  static drawGeometric(ctx, S, p) {
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, S, S);
    const grid = 8;
    const cell = S / grid;
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const cx = i * cell + cell / 2;
        const cy = j * cell + cell / 2;
        const col = p[(i + j) % 3];
        const kind = (i * 7 + j * 13) % 4;
        const r = cell * 0.32;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.random() * Math.PI);
        ctx.globalAlpha = 0.75 + ((i + j) % 3) * 0.1;
        ctx.fillStyle = col;
        ctx.beginPath();
        if (kind === 0) {
          ctx.fillRect(-r, -r, r * 2, r * 2);
        } else if (kind === 1) {
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
        } else if (kind === 2) {
          ctx.moveTo(0, -r);
          ctx.lineTo(r, r);
          ctx.lineTo(-r, r);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.moveTo(0, -r);
          ctx.lineTo(r, 0);
          ctx.lineTo(0, r);
          ctx.lineTo(-r, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  static drawGalaxy(ctx, S, p) {
    const bg = ctx.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#05060f');
    bg.addColorStop(1, '#0b0f2a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);

    const core = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.45);
    core.addColorStop(0, this.withAlpha(p[2], 0.5));
    core.addColorStop(0.5, this.withAlpha(p[1], 0.18));
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, S, S);

    for (let arm = 0; arm < 3; arm++) {
      ctx.strokeStyle = this.withAlpha(p[arm % 3], 0.25);
      ctx.lineWidth = S * 0.02;
      ctx.beginPath();
      const armAngle = (arm / 3) * Math.PI * 2;
      for (let t = 0; t < 1; t += 0.02) {
        const a = armAngle + t * Math.PI * 4;
        const radius = t * S * 0.55;
        const x = S / 2 + Math.cos(a) * radius;
        const y = S / 2 + Math.sin(a) * radius;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let i = 0; i < 300; i++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      const r = Math.random() * 2.4 + 0.3;
      ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.75})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static drawSunset(ctx, S, p) {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[0]);
    g.addColorStop(0.5, p[1]);
    g.addColorStop(1, p[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    const sunY = S * 0.6;
    const sun = ctx.createRadialGradient(S / 2, sunY, 0, S / 2, sunY, S * 0.28);
    sun.addColorStop(0, '#fffbe6');
    sun.addColorStop(0.45, this.withAlpha(p[2], 0.95));
    sun.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(S / 2, sunY, S * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.withAlpha(p[0], 0.92);
    ctx.fillRect(0, S * 0.68, S, S * 0.32);

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * S;
      const y = S * (0.25 + Math.random() * 0.3);
      const w = S * (0.2 + Math.random() * 0.35);
      ctx.beginPath();
      ctx.ellipse(x, y, w, w * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static drawWaves(ctx, S, p) {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[0]);
    g.addColorStop(1, p[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    const layers = 7;
    for (let i = 0; i < layers; i++) {
      const baseY = S * (0.08 + (i / layers) * 0.92);
      const amp = S * (0.012 + Math.random() * 0.02);
      const freq = 0.005 + Math.random() * 0.006;
      const phase = Math.random() * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, S);
      ctx.lineTo(0, baseY);
      for (let x = 0; x <= S; x += 8) {
        const y = baseY + Math.sin(x * freq + phase) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(S, S);
      ctx.closePath();
      ctx.fillStyle = this.withAlpha(p[(i + 1) % 3], 0.35 + (i / layers) * 0.55);
      ctx.fill();
    }

    const sun = ctx.createRadialGradient(S * 0.5, S * 0.25, 0, S * 0.5, S * 0.25, S * 0.22);
    sun.addColorStop(0, 'rgba(255,255,255,0.75)');
    sun.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, S, S);
  }

  static drawMountain(ctx, S, p) {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[1]);
    g.addColorStop(1, p[0]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    ctx.fillStyle = this.withAlpha(p[2], 0.95);
    ctx.beginPath();
    ctx.arc(S * 0.74, S * 0.28, S * 0.07, 0, Math.PI * 2);
    ctx.fill();

    this.mountainRange(ctx, S, this.withAlpha(p[2], 0.55), S * 0.42, S * 0.34, 1.6);
    this.mountainRange(ctx, S, p[0], S * 0.58, S * 0.26, 2.9);
    this.mountainRange(ctx, S, '#0a1020', S * 0.8, S * 0.32, 0.7);
  }

  static mountainRange(ctx, S, color, baseY, amp, seed) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, S);
    const steps = 24;
    const stepW = S / steps;
    for (let i = 0; i <= steps; i++) {
      const x = i * stepW;
      const noise = Math.abs(Math.sin(x * 0.0016 + seed) * Math.sin(x * 0.0031 + seed * 3));
      const y = baseY - noise * amp * 2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(S, S);
    ctx.closePath();
    ctx.fill();
  }

  static drawCyber(ctx, S, p) {
    ctx.fillStyle = '#070a14';
    ctx.fillRect(0, 0, S, S);
    const horizon = S * 0.55;

    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#0b1030');
    sky.addColorStop(1, p[0]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, S, horizon);

    const sun = ctx.createRadialGradient(S / 2, horizon, 0, S / 2, horizon, S * 0.32);
    sun.addColorStop(0, p[2]);
    sun.addColorStop(0.35, this.withAlpha(p[2], 0.8));
    sun.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, S, S);

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 0; y < horizon; y += 4) {
      ctx.fillRect(0, y, S, 1);
    }

    ctx.strokeStyle = this.withAlpha(p[1], 0.6);
    ctx.lineWidth = 2;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(S / 2 + i * 70, horizon);
      ctx.lineTo(S / 2 + i * 950, S);
      ctx.stroke();
    }
    for (let j = 0; j < 9; j++) {
      const y = horizon + j * j * S * 0.016;
      const half = (y - horizon) * 0.85;
      ctx.beginPath();
      ctx.moveTo(S / 2 - half, y);
      ctx.lineTo(S / 2 + half, y);
      ctx.stroke();
    }

    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.7})`;
      ctx.fillRect(Math.random() * S, Math.random() * horizon, 2, 2);
    }
  }

  static drawFire(ctx, S, p) {
    const g = ctx.createLinearGradient(0, S, 0, 0);
    g.addColorStop(0, '#1c0505');
    g.addColorStop(0.55, p[0]);
    g.addColorStop(1, p[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    for (let i = 0; i < 8; i++) {
      const x = S * (0.2 + Math.random() * 0.6);
      const y = S * (0.15 + Math.random() * 0.5);
      const r = S * (0.12 + Math.random() * 0.2);
      const fg = ctx.createRadialGradient(x, y, 0, x, y, r);
      fg.addColorStop(0, this.withAlpha(p[2], 0.85));
      fg.addColorStop(1, this.withAlpha(p[2], 0));
      ctx.fillStyle = fg;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * 0.6 - 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(254,215,170,${0.3 + Math.random() * 0.7})`;
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, Math.random() * 3 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static drawFlower(ctx, S, p) {
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, S, S);
    const cx = S / 2;
    const cy = S / 2;
    for (let ring = 0; ring < 2; ring++) {
      const n = 8 * (ring + 1);
      const rr = S * 0.24 * (1 + ring * 0.6);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.3;
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a);
        ctx.fillStyle = p[(ring + 1) % 3];
        ctx.beginPath();
        ctx.ellipse(0, 0, rr * 0.4, rr * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.fillStyle = p[2];
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawHearts(ctx, S, p) {
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 16; i++) {
      const x = S * (0.08 + Math.random() * 0.84);
      const y = S * (0.08 + Math.random() * 0.84);
      const s = S * (0.04 + Math.random() * 0.08);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI * 2);
      ctx.fillStyle = p[i % 3];
      ctx.beginPath();
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s * 1.1, -s * 0.4, -s * 0.3, -s * 1.1, 0, -s * 0.2);
      ctx.bezierCurveTo(s * 0.3, -s * 1.1, s * 1.1, -s * 0.4, 0, s * 0.4);
      ctx.fill();
      ctx.restore();
    }
  }

  static drawForest(ctx, S, p) {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[1]);
    g.addColorStop(1, p[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    const moon = ctx.createRadialGradient(S * 0.22, S * 0.2, 0, S * 0.22, S * 0.2, S * 0.09);
    moon.addColorStop(0, '#fef9c3');
    moon.addColorStop(1, 'rgba(254,249,195,0)');
    ctx.fillStyle = moon;
    ctx.beginPath();
    ctx.arc(S * 0.22, S * 0.2, S * 0.09, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 10; i++) {
      const x = S * (0.04 + Math.random() * 0.92);
      const base = S * (0.68 + Math.random() * 0.26);
      const hgt = S * (0.26 + Math.random() * 0.34);
      const col = i % 2 ? p[0] : '#166534';
      ctx.fillStyle = col;
      ctx.fillRect(x - 9, base, 18, S - base);
      for (let j = 0; j < 3; j++) {
        const y = base - hgt * (0.18 + j * 0.28);
        ctx.beginPath();
        ctx.arc(x, y, hgt * (0.14 + j * 0.05), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  static drawDesert(ctx, S, p) {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, '#fbbf24');
    g.addColorStop(0.65, '#ea580c');
    g.addColorStop(1, '#7c2d12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.arc(S * 0.76, S * 0.26, S * 0.08, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      const yOff = i * 0.12;
      ctx.fillStyle = this.withAlpha(p[i % 3], 0.55);
      ctx.beginPath();
      ctx.moveTo(0, S * (0.55 + yOff));
      ctx.quadraticCurveTo(S * 0.3, S * (0.42 + yOff), S * 0.6, S * (0.55 + yOff));
      ctx.quadraticCurveTo(S * 0.85, S * (0.64 + yOff), S, S * (0.5 + yOff));
      ctx.lineTo(S, S);
      ctx.lineTo(0, S);
      ctx.closePath();
      ctx.fill();
    }
  }

  static applyVignette(ctx, S) {
    const v = ctx.createRadialGradient(S / 2, S / 2, S * 0.35, S / 2, S / 2, S * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, S, S);
  }
}

window.PhotoXysGenerator = PhotoXysGenerator;
