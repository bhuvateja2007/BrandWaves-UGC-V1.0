import React, { useEffect, useRef } from 'react';

interface Archetype {
  type: string;
  hair: string;
  hat: string | null;
  glasses: boolean;
  clothing: string;
  beard: boolean;
}

const ARCHETYPES: Archetype[] = [
  { type: 'afro_turtleneck', hair: 'afro', hat: null, glasses: false, clothing: 'turtleneck', beard: false },
  { type: 'beanie_scarf', hair: 'short', hat: 'beanie', glasses: true, clothing: 'heavy_coat', beard: true },
  { type: 'ponytail_collar', hair: 'ponytail', hat: null, glasses: false, clothing: 'collar', beard: false },
  { type: 'beret_chic', hair: 'bob', hat: 'beret', glasses: true, clothing: 'striped_crew', beard: false },
  { type: 'messy_hoodie', hair: 'messy', hat: null, glasses: false, clothing: 'hoodie', beard: false },
  { type: 'fedora_overcoat', hair: 'crop', hat: 'fedora', glasses: false, clothing: 'overcoat', beard: true },
  { type: 'tall_bun', hair: 'topbun', hat: null, glasses: true, clothing: 'crew', beard: false },
  { type: 'headphones_jacket', hair: 'wavy', hat: 'headphones', glasses: false, clothing: 'bomber', beard: false },
  { type: 'slick_tie', hair: 'slick', hat: null, glasses: true, clothing: 'suit_tie', beard: true },
  { type: 'cap_street', hair: 'short', hat: 'baseball_cap', glasses: false, clothing: 'puffer', beard: false },
  { type: 'curly_bob', hair: 'curls', hat: null, glasses: false, clothing: 'vneck', beard: false },
  { type: 'long_drapes', hair: 'long_straight', hat: null, glasses: false, clothing: 'cloak', beard: false }
];

class CharacterInstance {
  scale = 1;
  layer = 1;
  yOffset = 0;
  speedFactor = 1;
  direction = 1;
  baseSpeed = 30;
  speed = 30;
  bobFrequency = 2.5;
  bobAmplitude = 3;
  bobPhase = 0;
  x = 0;
  y = 0;
  baseY = 0;
  archetype: Archetype;
  expressionSeed = 0.5;
  tilt = 0;
  stride = 0;
  currentBob = 0;
  headSway = 0;

  constructor(width: number, height: number, initialX: number | null = null, forceDirection: number | null = null) {
    this.archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    this.reset(width, height, initialX, forceDirection);
  }

  reset(width: number, height: number, xOverride: number | null = null, forceDirection: number | null = null) {
    const layerRand = Math.random();
    if (layerRand < 0.35) {
      this.layer = 0; // background
      this.scale = 0.72 + Math.random() * 0.12;
      this.yOffset = -height * 0.22 - Math.random() * (height * 0.20);
      this.speedFactor = 0.55 + Math.random() * 0.35;
    } else if (layerRand < 0.72) {
      this.layer = 1; // midground
      this.scale = 0.90 + Math.random() * 0.15;
      this.yOffset = -height * 0.10 - Math.random() * (height * 0.15);
      this.speedFactor = 0.85 + Math.random() * 0.40;
    } else {
      this.layer = 2; // foreground
      this.scale = 1.15 + Math.random() * 0.25;
      this.yOffset = 0 + Math.random() * 15;
      this.speedFactor = 1.25 + Math.random() * 0.50;
    }

    this.direction = forceDirection !== null ? forceDirection : (Math.random() > 0.52 ? 1 : -1);
    this.baseSpeed = (24 + Math.random() * 28) * this.speedFactor;
    this.speed = this.baseSpeed * this.direction;

    this.bobFrequency = (2.2 + Math.random() * 1.4);
    this.bobAmplitude = (2.2 + Math.random() * 2.5) * this.scale;
    this.bobPhase = Math.random() * Math.PI * 2;

    const margin = 140 * this.scale;
    if (xOverride !== null) {
      this.x = xOverride;
    } else {
      this.x = this.direction === 1 ? -margin - Math.random() * 300 : width + margin + Math.random() * 300;
    }

    this.baseY = height + 10;
    this.y = this.baseY + this.yOffset;
    this.archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    this.expressionSeed = Math.random();
    this.tilt = (Math.random() - 0.5) * 0.08;
    this.stride = 0;
  }

  update(dt: number, width: number, height: number) {
    this.x += this.speed * dt;
    this.stride += dt * this.bobFrequency * Math.PI * 2;
    this.currentBob = Math.sin(this.stride + this.bobPhase) * this.bobAmplitude;
    this.headSway = Math.cos(this.stride * 0.5 + this.bobPhase) * 0.035;

    const margin = 160 * this.scale;
    if (this.direction === 1 && this.x > width + margin) {
      this.reset(width, height, -margin - (Math.random() * 120), 1);
    } else if (this.direction === -1 && this.x < -margin) {
      this.reset(width, height, width + margin + (Math.random() * 120), -1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const drawY = this.y + this.currentBob;
    ctx.translate(this.x, drawY);
    ctx.scale(this.direction * this.scale, this.scale);
    ctx.rotate(this.tilt + this.headSway);

    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';

    // 1. Torso & Clothing
    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.quadraticCurveTo(-48, -48, -25, -60);
    ctx.quadraticCurveTo(0, -68, 25, -60);
    ctx.quadraticCurveTo(48, -48, 45, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Costume details
    if (this.archetype.clothing === 'turtleneck') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(-16, -74, 32, 18, [4, 4, 2, 2]);
      } else {
        ctx.rect(-16, -74, 32, 18);
      }
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-12, -65);
      ctx.lineTo(12, -65);
      ctx.stroke();
    } else if (this.archetype.clothing === 'hoodie') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -60, 20, 0.4, Math.PI - 0.4, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6, -55);
      ctx.lineTo(-6, -35);
      ctx.moveTo(6, -55);
      ctx.lineTo(6, -37);
      ctx.stroke();
    } else if (this.archetype.clothing === 'collar' || this.archetype.clothing === 'suit_tie') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(-14, -68);
      ctx.lineTo(-3, -68);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(14, -68);
      ctx.lineTo(3, -68);
      ctx.closePath();
      ctx.fill();

      if (this.archetype.clothing === 'suit_tie') {
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3, -56);
        ctx.lineTo(3, -56);
        ctx.lineTo(5, -28);
        ctx.lineTo(0, -20);
        ctx.lineTo(-5, -28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (this.archetype.clothing === 'striped_crew') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      for (let s = -48; s <= -15; s += 10) {
        ctx.beginPath();
        ctx.moveTo(-36, s);
        ctx.lineTo(36, s);
        ctx.stroke();
      }
    }

    // 2. Neck & Head
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;

    // Neck
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.rect(-10, -78, 20, 16);
    ctx.fill();
    ctx.stroke();

    // Head Oval
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, -96, 22, 27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Eyes, Nose, Mouth
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;

    if (this.archetype.glasses) {
      ctx.lineWidth = 2.2;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-7, -97, 6.5, 0, Math.PI * 2);
      ctx.arc(7, -97, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.5, -97);
      ctx.lineTo(0.5, -97);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-6, -97, 1.8, 0, Math.PI * 2);
      ctx.arc(8, -97, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (this.expressionSeed > 0.6) {
        ctx.beginPath();
        ctx.arc(-7, -97, 2.2, 0, Math.PI * 2);
        ctx.arc(7, -97, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.expressionSeed > 0.3) {
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-10, -97);
        ctx.lineTo(-4, -96);
        ctx.moveTo(4, -96);
        ctx.lineTo(10, -97);
        ctx.stroke();
      } else {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-7, -96, 3, Math.PI, 0, false);
        ctx.arc(7, -96, 3, Math.PI, 0, false);
        ctx.stroke();
      }
    }

    // Eyebrows
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -104);
    ctx.lineTo(-4, -103);
    ctx.moveTo(4, -103);
    ctx.lineTo(11, -104);
    ctx.stroke();

    // Nose
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(1, -95);
    ctx.lineTo(2, -90);
    ctx.lineTo(-1, -88);
    ctx.stroke();

    // Mouth
    ctx.beginPath();
    if (this.expressionSeed > 0.5) {
      ctx.moveTo(-5, -82);
      ctx.lineTo(5, -82);
    } else {
      ctx.arc(0, -84, 5, 0.2, Math.PI - 0.2, false);
    }
    ctx.stroke();

    // Beard
    if (this.archetype.beard) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, -84, 15, 0.1, Math.PI - 0.1, false);
      ctx.lineTo(0, -74);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Hair & Headwear
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;

    const h = this.archetype.hair;
    const hat = this.archetype.hat;

    if (hat === 'beanie') {
      ctx.beginPath();
      ctx.ellipse(0, -112, 22, 17, 0, Math.PI, 0, true);
      ctx.quadraticCurveTo(24, -103, 0, -103);
      ctx.quadraticCurveTo(-24, -103, -22, -112);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-18, -107);
      ctx.lineTo(18, -107);
      ctx.stroke();
    } else if (hat === 'beret') {
      ctx.beginPath();
      ctx.moveTo(-24, -108);
      ctx.quadraticCurveTo(-20, -128, 12, -124);
      ctx.quadraticCurveTo(30, -116, 18, -106);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, -126);
      ctx.lineTo(4, -131);
      ctx.stroke();
    } else if (hat === 'fedora') {
      ctx.beginPath();
      ctx.ellipse(0, -108, 38, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-18, -108);
      ctx.lineTo(-14, -126);
      ctx.quadraticCurveTo(0, -130, 14, -126);
      ctx.lineTo(18, -108);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hat === 'baseball_cap') {
      ctx.beginPath();
      ctx.arc(0, -110, 22, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, -106);
      ctx.quadraticCurveTo(38, -104, 34, -98);
      ctx.quadraticCurveTo(16, -99, 10, -104);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hat === 'headphones') {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -102, 26, Math.PI * 0.9, Math.PI * 0.1, false);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-25, -103, 6, 14);
      ctx.rect(19, -103, 6, 14);
      ctx.fill();
      ctx.stroke();
    }

    if (!hat || hat === 'headphones') {
      if (h === 'afro') {
        ctx.beginPath();
        ctx.arc(0, -108, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (h === 'topbun') {
        ctx.beginPath();
        ctx.ellipse(0, -108, 22, 14, 0, Math.PI, 0, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -132, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (h === 'bob') {
        ctx.beginPath();
        ctx.moveTo(-24, -86);
        ctx.lineTo(-24, -114);
        ctx.quadraticCurveTo(0, -125, 24, -114);
        ctx.lineTo(24, -86);
        ctx.quadraticCurveTo(18, -96, 16, -106);
        ctx.quadraticCurveTo(0, -108, -16, -106);
        ctx.quadraticCurveTo(-18, -96, -24, -86);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (h === 'curls') {
        ctx.beginPath();
        ctx.arc(-16, -112, 12, 0, Math.PI * 2);
        ctx.arc(0, -122, 13, 0, Math.PI * 2);
        ctx.arc(16, -112, 12, 0, Math.PI * 2);
        ctx.arc(-22, -98, 10, 0, Math.PI * 2);
        ctx.arc(22, -98, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (h === 'messy') {
        ctx.beginPath();
        ctx.moveTo(-20, -104);
        ctx.lineTo(-26, -120);
        ctx.lineTo(-12, -124);
        ctx.lineTo(-2, -132);
        ctx.lineTo(8, -122);
        ctx.lineTo(22, -126);
        ctx.lineTo(22, -104);
        ctx.quadraticCurveTo(0, -108, -20, -104);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (h === 'long_straight') {
        ctx.beginPath();
        ctx.moveTo(-24, -40);
        ctx.lineTo(-24, -114);
        ctx.quadraticCurveTo(0, -124, 24, -114);
        ctx.lineTo(24, -40);
        ctx.lineTo(19, -40);
        ctx.lineTo(19, -96);
        ctx.quadraticCurveTo(0, -106, -19, -96);
        ctx.lineTo(-19, -40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -108, 23, 14, 0, Math.PI, 0, true);
        ctx.quadraticCurveTo(23, -103, 0, -105);
        ctx.quadraticCurveTo(-23, -103, -23, -108);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

export const CrowdAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let characters: CharacterInstance[] = [];
    let animationFrameId: number;
    let lastTime = performance.now();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx!.scale(dpr, dpr);

      if (characters.length === 0) {
        initCharacters();
      } else {
        characters.forEach((c) => {
          c.baseY = height + 10;
        });
      }
    }

    function initCharacters() {
      characters = [];
      const baseCount = Math.max(26, Math.min(62, Math.floor(width / 26)));

      for (let i = 0; i < baseCount; i++) {
        const initialX = (i / baseCount) * (width + 300) - 150 + (Math.random() - 0.5) * 80;
        const char = new CharacterInstance(width, height, initialX);
        characters.push(char);
      }

      sortCharacters();
    }

    function sortCharacters() {
      characters.sort((a, b) => {
        if (a.layer !== b.layer) {
          return a.layer - b.layer;
        }
        return a.yOffset - b.yOffset;
      });
    }

    function render(currentTime: number) {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx!.clearRect(0, 0, width, height);

      // Draw Lower Subtle Horizon / Ground Baseline
      ctx!.strokeStyle = 'rgba(17, 45, 78, 0.2)';
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      ctx!.moveTo(0, height - 1);
      ctx!.lineTo(width, height - 1);
      ctx!.stroke();

      // Update & Draw Characters
      for (let i = 0; i < characters.length; i++) {
        if (!prefersReducedMotion) {
          characters[i].update(dt, width, height);
        }
        characters[i].draw(ctx!);
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      render(performance.now());
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-10">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
