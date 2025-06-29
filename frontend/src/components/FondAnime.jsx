import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import HeaderGlobal from './HeaderGlobal';
import { useTheme } from '../theme/ThemeContext';

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
`;

const EMOJIS = ['🌱', '🌿', '🌵', '🌳', '🌴', '🌲', '🪴'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

const MAX_PLANTS = 8;

export default function FondAnime() {
  const canvasRef = useRef();
  const plants = useRef([]);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    function spawnPlant() {
      if (plants.current.length < MAX_PLANTS) {
        plants.current.push({
          x: randomBetween(0, width),
          y: -40,
          size: randomBetween(24, 40),
          speed: randomBetween(0.5, 1.2),
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          drift: randomBetween(-0.4, 0.4),
          rotation: randomBetween(-15, 15)
        });
      }
    }

    let gridOffset = 0;
    function drawGrid() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 2;
      const spacing = 48;
      gridOffset = (gridOffset + 0.5) % spacing;
      for (let x = -spacing; x < width + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + gridOffset, 0);
        ctx.lineTo(x + gridOffset, height);
        ctx.stroke();
      }
      for (let y = -spacing; y < height + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + gridOffset);
        ctx.lineTo(width, y + gridOffset);
        ctx.stroke();
      }
      ctx.restore();
    }

    function animate() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      drawGrid();
      plants.current.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        ctx.save();
        ctx.translate(p.x + p.size/2, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.font = `${p.size}px serif`;
        ctx.globalAlpha = 0.65;
        ctx.fillText(p.emoji, -p.size/2, 0);
        ctx.globalAlpha = 1;
        ctx.restore();
      });
      plants.current = plants.current.filter((p) => p.y < height + 80);
      if (Math.random() < 0.02) spawnPlant();
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
    return () => {
      plants.current = [];
    };
  }, [theme]);

  return <Canvas ref={canvasRef} />;
} 