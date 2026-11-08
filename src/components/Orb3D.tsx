import React, { useEffect, useRef } from 'react';
import { VoiceState } from '../types';

interface Orb3DProps {
  state: VoiceState;
  audioLevel?: number; // 0.0 to 1.0
  size?: number; // diameter in px
  onClick?: () => void;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  angleTheta: number;
  anglePhi: number;
  size: number;
  color: string;
  speed: number;
}

export const Orb3D: React.FC<Orb3DProps> = ({
  state,
  audioLevel = 0,
  size = 280,
  onClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let pulseAngle = 0;

    // Create 3D particle sphere
    const particleCount = 140;
    const sphereRadius = size * 0.32;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angleTheta = Math.random() * Math.PI * 2;
      const anglePhi = Math.acos(Math.random() * 2 - 1);
      particles.push({
        x: 0,
        y: 0,
        z: 0,
        baseRadius: sphereRadius + (Math.random() - 0.5) * 16,
        angleTheta,
        anglePhi,
        size: Math.random() * 2.5 + 1.2,
        color: '#a855f7',
        speed: (Math.random() * 0.005 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Update state-based dynamics
      let speedMult = 1;
      let targetGlow = '#8b5cf6';
      let targetCore = '#c084fc';
      let stateAudioReaction = audioLevel;

      switch (state) {
        case 'listening':
          speedMult = 2.2;
          targetGlow = '#06b6d4'; // Cyan
          targetCore = '#38bdf8';
          stateAudioReaction = Math.max(audioLevel, 0.25);
          break;
        case 'processing':
          speedMult = 4.0;
          targetGlow = '#d946ef'; // Magenta
          targetCore = '#f472b6';
          break;
        case 'speaking':
          speedMult = 1.8;
          targetGlow = '#ec4899'; // Pink/Rose
          targetCore = '#fbbf24'; // Warm Gold core
          stateAudioReaction = 0.35 + Math.sin(pulseAngle * 3) * 0.2;
          break;
        case 'interrupted':
          speedMult = 0.5;
          targetGlow = '#f59e0b'; // Amber
          targetCore = '#fbbf24';
          break;
        case 'error':
          speedMult = 0.8;
          targetGlow = '#ef4444'; // Red
          targetCore = '#f87171';
          break;
        case 'idle':
        default:
          speedMult = 0.8;
          targetGlow = '#8b5cf6'; // Indigo/Purple
          targetCore = '#a855f7';
          break;
      }

      rotation += 0.008 * speedMult;
      pulseAngle += 0.04 * speedMult;

      const breathingScale = 1 + Math.sin(pulseAngle) * 0.05 + stateAudioReaction * 0.22;
      const currentRadius = sphereRadius * breathingScale;

      // Draw background ambient glow
      const bgGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        currentRadius * 0.1,
        centerX,
        centerY,
        currentRadius * 1.8
      );
      bgGlow.addColorStop(0, `${targetGlow}55`);
      bgGlow.addColorStop(0.5, `${targetGlow}22`);
      bgGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Outer ripple rings for listening or speaking
      if (state === 'listening' || state === 'speaking') {
        const rippleCount = 2;
        for (let r = 1; r <= rippleCount; r++) {
          const rippleRadius = currentRadius * (1.2 + r * 0.25 + (pulseAngle % 1) * 0.3);
          const rippleAlpha = Math.max(0, 0.4 - r * 0.15);
          ctx.strokeStyle = `${targetGlow}${Math.floor(rippleAlpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw inner glowing core
      const coreGrad = ctx.createRadialGradient(
        centerX - currentRadius * 0.2,
        centerY - currentRadius * 0.2,
        currentRadius * 0.05,
        centerX,
        centerY,
        currentRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.2, targetCore);
      coreGrad.addColorStop(0.7, targetGlow);
      coreGrad.addColorStop(1, '#050711');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Project & Render 3D particles on sphere
      particles.forEach((p) => {
        p.angleTheta += p.speed * speedMult;

        // Spherical to 3D Cartesian
        const rad = p.baseRadius * breathingScale;
        const x3d = rad * Math.sin(p.anglePhi) * Math.cos(p.angleTheta + rotation);
        const y3d = rad * Math.sin(p.anglePhi) * Math.sin(p.angleTheta + rotation);
        const z3d = rad * Math.cos(p.anglePhi);

        // Rotate along Y & X axis
        const rotY = x3d * Math.cos(rotation * 0.7) - z3d * Math.sin(rotation * 0.7);
        const rotZ = x3d * Math.sin(rotation * 0.7) + z3d * Math.cos(rotation * 0.7);

        // Perspective projection
        const fov = 350;
        const scale = fov / (fov + rotZ + 100);
        const projX = centerX + rotY * scale;
        const projY = centerY + y3d * scale;
        const alpha = Math.max(0.1, (rotZ + sphereRadius) / (sphereRadius * 2));

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central luminous spark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(centerX - currentRadius * 0.25, centerY - currentRadius * 0.25, 4, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, audioLevel, size]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
      style={{ width: size, height: size }}
      title="Tap to speak or interrupt Madhuri"
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};
