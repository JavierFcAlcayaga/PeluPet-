import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import './custom.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Efecto ripple para botones con clase .btn-ripple (ligero y no intrusivo)
window.addEventListener('DOMContentLoaded', () => {
  const attachRipple = (btn) => {
    btn.addEventListener('click', (e) => {
      const r = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.className = 'ripple';
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size / 2) + 'px';
      r.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
      btn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  };

  document.querySelectorAll('.btn-ripple').forEach(attachRipple);
});

// Efecto de nieve aleatoria en el hero mediante canvas (inicialización robusta)
(() => {
  const initSnowFor = (overlay) => {
    if (!overlay || overlay.dataset.snowInit === 'true') return false;
    const canvas = document.createElement('canvas');
    overlay.innerHTML = '';
    overlay.appendChild(canvas);
    overlay.dataset.snowInit = 'true';
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = overlay.getBoundingClientRect();
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    // Ajustar también si el overlay cambia de tamaño sin evento de ventana (por carga de imagen, fuentes, etc.)
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => resize());
      ro.observe(overlay);
    }

    const COUNT = Math.max(120, Math.floor(canvas.width / 7));
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (1 + Math.random() * 2.4) * dpr,
      // Velocidad vertical constante en px/seg (compensada por DPR)
      vy: (30 + Math.random() * 60) * dpr,
      // Deriva horizontal (px/seg) con fase independiente
      drift: (15 + Math.random() * 25) * dpr,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.6 + Math.random() * 1.0, // rad/seg
      alpha: 0.8 + Math.random() * 0.2,
    }));

    let lastTs = performance.now();
    const step = (ts) => {
      const dt = Math.min(0.05, Math.max(0.0, (ts - lastTs) / 1000)); // segundos
      lastTs = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        // Caída a velocidad constante usando dt
        p.y += p.vy * dt;
        // Deriva suave horizontal con fase independiente
        p.phase += p.phaseSpeed * dt;
        p.x += Math.sin(p.phase) * p.drift * dt;
        if (p.y > canvas.height + 6) {
          p.y = -10 * dpr;
          p.x = Math.random() * canvas.width;
          p.vy = (30 + Math.random() * 60) * dpr;
          p.r = (1 + Math.random() * 2.4) * dpr;
          p.alpha = 0.8 + Math.random() * 0.2;
          p.phase = Math.random() * Math.PI * 2;
          p.phaseSpeed = 0.6 + Math.random() * 1.0;
          p.drift = (15 + Math.random() * 25) * dpr;
        }
        if (p.x > canvas.width + 6) p.x = -6;
        if (p.x < -6) p.x = canvas.width + 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return true;
  };
  const whenReady = () => {
    const overlays = document.querySelectorAll('.hero-snow-overlay');
    let initialized = false;
    overlays.forEach((el) => { initialized = initSnowFor(el) || initialized; });
    if (initialized) return;
    requestAnimationFrame(whenReady);
  };
  window.addEventListener('load', whenReady);
  whenReady();
})();

// Aura sutil que sigue al cursor en toda la web
window.addEventListener('mousemove', (e) => {
  const root = document.documentElement;
  root.style.setProperty('--cursor-x', e.clientX + 'px');
  root.style.setProperty('--cursor-y', e.clientY + 'px');
});
