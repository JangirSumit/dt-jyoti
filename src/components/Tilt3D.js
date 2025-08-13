import React, { useRef } from 'react';
import { Box } from '@mui/material';

// Lightweight 3D tilt without dependencies. Use sparingly for hero cards, service tiles, etc.
export default function Tilt3D({ children, maxTilt = 10, glare = true, style, sx, ...props }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const tiltX = (py - 0.5) * -2 * maxTilt;
    const tiltY = (px - 0.5) * 2 * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    if (glare) {
      const g = el.querySelector('[data-glare]');
      if (g) {
        const angle = Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2));
        const deg = (angle * 180) / Math.PI + 180;
        g.style.background = `linear-gradient(${deg}deg, rgba(255,255,255,0.25), transparent 60%)`;
        g.style.opacity = '1';
      }
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    const g = el.querySelector('[data-glare]');
    if (g) g.style.opacity = '0';
  };

  return (
    <Box
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      ref={ref}
      style={{ transformStyle: 'preserve-3d', transition: 'transform .15s ease', ...style }}
      sx={{ position: 'relative', willChange: 'transform', ...sx }}
      {...props}
    >
      {glare && (
        <Box data-glare aria-hidden sx={{ pointerEvents: 'none', position: 'absolute', inset: 0, borderRadius: 'inherit', opacity: 0, transition: 'opacity .2s ease' }} />
      )}
      {children}
    </Box>
  );
}
