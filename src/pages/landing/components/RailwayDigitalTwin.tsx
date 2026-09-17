import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function RailwayDigitalTwin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Track definitions (y fraction of height)
    const tracks = [
      { y: 0.28, color: 'rgba(29,78,216,0.18)', label: 'UP LINE' },
      { y: 0.45, color: 'rgba(13,148,136,0.15)', label: 'DOWN LINE' },
      { y: 0.62, color: 'rgba(27,107,69,0.12)', label: 'GOODS' },
    ];

    // Node definitions
    const nodes = [
      { xf: 0.18, yf: 0.28, type: 'signal', label: 'SIGNAL', color: '#1B6B45' },
      { xf: 0.42, yf: 0.28, type: 'ohe',    label: 'OHE',    color: '#D97706' },
      { xf: 0.70, yf: 0.28, type: 'signal', label: 'SIGNAL', color: '#1B6B45' },
      { xf: 0.25, yf: 0.45, type: 'st',     label: 'S&T',    color: '#7C3AED' },
      { xf: 0.55, yf: 0.45, type: 'maint',  label: '',       color: '#059669' },
      { xf: 0.78, yf: 0.45, type: 'st',     label: 'S&T',    color: '#7C3AED' },
      { xf: 0.15, yf: 0.62, type: 'eng',    label: 'ENG',    color: '#059669' },
      { xf: 0.40, yf: 0.62, type: 'eng',    label: '',       color: '#059669' },
      { xf: 0.65, yf: 0.62, type: 'eng',    label: 'TRACK',  color: '#059669' },
      // AI core
      { xf: 0.80, yf: 0.42, type: 'ai',     label: 'AI',     color: '#0D9488' },
    ];

    // Trains
    const trains = [
      { track: 0, x: -0.08, len: 0.14, speed: 0.00028, color: '#1B6B45' },
      { track: 1, x: 0.4,   len: 0.10, speed: 0.00020, color: '#0D9488' },
      { track: 2, x: 0.65,  len: 0.12, speed: 0.00024, color: '#1B6B45' },
    ];

    // Block window
    interface Particle { x: number; y: number; tx: number; ty: number; t: number; color: string; }
    const particles: Particle[] = [];
    let frame = 0;
    let blockAlpha = 0.06;
    let blockPulse = 0.002;
    let scanAngle = 0;

    const spawnParticle = () => {
      if (particles.length > 18) return;
      // from a source node toward AI node
      const src = nodes[Math.floor(Math.random() * (nodes.length - 1))];
      const ai = nodes[nodes.length - 1];
      particles.push({
        x: src.xf * W(),
        y: src.yf * H(),
        tx: ai.xf * W(),
        ty: ai.yf * H(),
        t: 0,
        color: src.color,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      frame++;

      // ── Subtle grid ──
      ctx.strokeStyle = 'rgba(29,78,216,0.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W(); gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H()); ctx.stroke();
      }
      for (let gy = 0; gy < H(); gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W(), gy); ctx.stroke();
      }

      // ── Railway tracks ──
      tracks.forEach((t) => {
        const y = t.y * H();
        // Track bed (subtle)
        const grad = ctx.createLinearGradient(0, y, W(), y);
        grad.addColorStop(0, 'rgba(29,78,216,0)');
        grad.addColorStop(0.12, t.color);
        grad.addColorStop(0.88, t.color);
        grad.addColorStop(1, 'rgba(29,78,216,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W(), y); ctx.stroke();

        // Rail ties
        ctx.strokeStyle = 'rgba(29,78,216,0.06)';
        ctx.lineWidth = 1;
        for (let rx = 4; rx < W(); rx += 22) {
          ctx.beginPath(); ctx.moveTo(rx, y - 5); ctx.lineTo(rx, y + 5); ctx.stroke();
        }

        // Track label
        ctx.fillStyle = 'rgba(29,78,216,0.35)';
        ctx.font = '500 8px JetBrains Mono, monospace';
        ctx.fillText(t.label, 8, y - 8);
      });

      // ── Block window highlight ──
      if (!reducedMotion) { blockAlpha += blockPulse; if (blockAlpha > 0.1 || blockAlpha < 0.03) blockPulse *= -1; }
      const bx = 0.30 * W(); const bw = 0.26 * W();
      const by = 0.22 * H(); const bh = 0.46 * H();
      ctx.fillStyle = `rgba(217,119,6,${blockAlpha})`;
      ctx.strokeStyle = `rgba(217,119,6,${blockAlpha * 4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
      // Block label
      ctx.fillStyle = `rgba(217,119,6,${blockAlpha * 8})`;
      ctx.font = '700 8px JetBrains Mono';
      ctx.fillText('BLOCK WINDOW  01:30 — 03:15', bx + 8, by + 15);

      // ── Connection lines between nodes ──
      ctx.setLineDash([4, 7]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(29,78,216,0.1)';
      const aiNode = nodes[nodes.length - 1];
      nodes.slice(0, -1).forEach((n) => {
        ctx.beginPath();
        ctx.moveTo(n.xf * W(), n.yf * H());
        ctx.lineTo(aiNode.xf * W(), aiNode.yf * H());
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // ── Trains ──
      trains.forEach((train) => {
        if (!reducedMotion) { train.x += train.speed; if (train.x > 1.1) train.x = -train.len - 0.05; }
        const ty = tracks[train.track].y * H();
        const x1 = train.x * W();
        const x2 = (train.x + train.len) * W();
        // Glow trail
        const tg = ctx.createLinearGradient(x1, 0, x2, 0);
        tg.addColorStop(0, `${train.color}00`);
        tg.addColorStop(0.4, `${train.color}66`);
        tg.addColorStop(1, `${train.color}CC`);
        ctx.strokeStyle = tg;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x1, ty); ctx.lineTo(x2, ty); ctx.stroke();
        // Head
        ctx.beginPath(); ctx.arc(x2, ty, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = train.color; ctx.fill();
        ctx.beginPath(); ctx.arc(x2, ty, 8, 0, Math.PI * 2);
        ctx.fillStyle = `${train.color}25`; ctx.fill();
      });

      // ── Particles ──
      if (!reducedMotion && frame % 22 === 0) spawnParticle();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += 0.012;
        if (p.t >= 1) { particles.splice(i, 1); continue; }
        const alpha = Math.sin(p.t * Math.PI);
        const cx = p.x + (p.tx - p.x) * p.t;
        const cy = p.y + (p.ty - p.y) * p.t;
        ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── Nodes ──
      nodes.forEach((node) => {
        const nx = node.xf * W();
        const ny = node.yf * H();
        const c = node.color;
        const isAI = node.type === 'ai';
        const r = isAI ? 14 : 7;
        const t2 = frame / 60;
        const pulse = 0.7 + 0.3 * Math.sin(t2 * 2.2 + node.xf * 6);

        // Outer glow ring
        const radGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 3.5);
        radGrad.addColorStop(0, `${c}18`);
        radGrad.addColorStop(1, `${c}00`);
        ctx.beginPath(); ctx.arc(nx, ny, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = radGrad; ctx.fill();

        // Circle
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; ctx.fill();
        ctx.strokeStyle = c; ctx.lineWidth = isAI ? 2 : 1.5;
        ctx.stroke();

        // Core dot
        ctx.beginPath(); ctx.arc(nx, ny, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.globalAlpha = pulse;
        ctx.fill();
        ctx.globalAlpha = 1;

        // AI scanner
        if (isAI && !reducedMotion) {
          scanAngle += 0.018;
          ctx.save();
          ctx.translate(nx, ny);
          ctx.rotate(scanAngle);
          const sg = ctx.createLinearGradient(0, 0, r * 3, 0);
          sg.addColorStop(0, 'rgba(29,78,216,0.3)');
          sg.addColorStop(1, 'rgba(29,78,216,0)');
          ctx.beginPath(); ctx.moveTo(0, 0);
          ctx.arc(0, 0, r * 3.5, -0.5, 0.5);
          ctx.closePath(); ctx.fillStyle = sg; ctx.fill();
          ctx.restore();
        }

        // Labels
        if (node.label) {
          ctx.fillStyle = c;
          ctx.font = `600 8px JetBrains Mono, monospace`;
          ctx.globalAlpha = 0.75;
          ctx.fillText(node.label, nx + r + 4, ny + 4);
          ctx.globalAlpha = 1;
        }
      });

      if (!reducedMotion) rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current); };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="Railway digital twin visualization"
      role="img"
    />
  );
}
