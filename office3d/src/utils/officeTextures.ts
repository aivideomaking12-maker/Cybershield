import * as THREE from 'three';

// Procedural high-resolution Canvas textures for the Hungarian Police Office environment

export function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm executive grey-wood office plank floor
  ctx.fillStyle = '#1e2430';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankHeight = 64;
  const plankWidth = 256;

  for (let y = 0; y < 1024; y += plankHeight) {
    const rowOffset = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
    for (let x = -plankWidth; x < 1024 + plankWidth; x += plankWidth) {
      const px = x + rowOffset;
      // Slight shade variation for each plank
      const tone = 28 + Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${tone}, ${tone + 4}, ${tone + 10})`;
      ctx.fillRect(px, y, plankWidth - 2, plankHeight - 2);

      // Fine woodgrain lines
      ctx.strokeStyle = `rgba(255, 255, 255, 0.03)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const gy = y + 8 + Math.random() * (plankHeight - 16);
        ctx.beginPath();
        ctx.moveTo(px, gy);
        ctx.lineTo(px + plankWidth - 2, gy + (Math.random() * 4 - 2));
        ctx.stroke();
      }

      // Plank gap shadow
      ctx.strokeStyle = '#0f131a';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, y, plankWidth, plankHeight);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export function createWhiteboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Glossy whiteboard background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 512);

  // Faint grid
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.25)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Header banner
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(40, 25, 450, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.fillText('BRFK NYOMOZATI OSZTÁLY — #2026/842-B', 55, 52);

  // Confidential warning marker on board
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.fillText('⚠ BIZALMAS NYOMOZÁSI ANYAG — SZIGORÚAN BELSŐ!', 520, 52);

  // Suspect data block
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.fillText('Gyanúsított: K. Béla (álneve: "Cápa")', 50, 110);

  ctx.fillStyle = '#334155';
  ctx.font = '15px "JetBrains Mono", monospace';
  ctx.fillText('Szül. hely, idő: Budapest, 1984.09.12.', 50, 140);
  ctx.fillText('Személyi azonosító: 1-840912-4219', 50, 165);
  ctx.fillText('Lakcím: 1134 Bp., Váci út 88. 3/12.', 50, 190);
  ctx.fillText('Gépjármű frsz: ABC-942 (sötétkék Audi A6)', 50, 215);

  // Red alert box for police internal access codes
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 245, 420, 100);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  ctx.fillRect(50, 245, 420, 100);

  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('KÖZPONT BELÉPÉSI KÓDOK:', 65, 275);
  ctx.font = '15px "JetBrains Mono", monospace';
  ctx.fillText('ROBOTZSÁKU KÓD: 8841-BRFK-SZERVER', 65, 305);
  ctx.fillText('RAKTÁR AJTÓ PIN: 3914#', 65, 330);

  // Investigation timeline & connections diagram on right
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.fillText('Nyomozati Kapcsolati Hálózat', 540, 110);

  // Nodes & connecting red lines
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;

  // Node 1
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#2563eb';
  ctx.strokeRect(540, 140, 160, 50);
  ctx.fillRect(540, 140, 160, 50);
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Társtettes: V. Zsolt', 550, 165);
  ctx.font = '11px sans-serif';
  ctx.fillText('Bankszámla: OTP 117...', 550, 180);

  // Node 2
  ctx.strokeRect(780, 140, 180, 50);
  ctx.fillRect(780, 140, 180, 50);
  ctx.fillText('Fedőcég: Delta-Trade Kft.', 790, 165);
  ctx.fillText('Adószám: 2489102-2-41', 790, 180);

  // Red line between
  ctx.strokeStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(700, 165);
  ctx.lineTo(780, 165);
  ctx.stroke();

  // Red pin note
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(540, 230, 240, 110);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1;
  ctx.strokeRect(540, 230, 240, 110);
  ctx.fillStyle = '#854d0e';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('TELEFONLEHALLGATÁS #4:', 550, 255);
  ctx.font = '12px sans-serif';
  ctx.fillText('„Péntek este viszik át a szajrét', 550, 280);
  ctx.fillText('a déli határátkelőn...”', 550, 300);
  ctx.fillText('Target IMEI: 35918204910284', 550, 325);

  // Handwritten note: "LE KELL TÖRÖLNI!"
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 22px cursive, sans-serif';
  ctx.fillText('LEGYEN LETÖRÖLVE!!!', 560, 420);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createCorkboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Cork material base
  ctx.fillStyle = '#b47d49';
  ctx.fillRect(0, 0, 512, 512);

  // Noise specks for cork texture
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const s = Math.random() * 3 + 1;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(74, 46, 23, 0.25)' : 'rgba(235, 185, 137, 0.25)';
    ctx.fillRect(x, y, s, s);
  }

  // Pinned Paper 1: Shift roster
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 6;
  ctx.fillRect(35, 40, 180, 220);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÜGYELETI BEOSZTÁS', 48, 65);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px sans-serif';
  ctx.fillText('2026. Szeptember', 48, 85);
  ctx.fillText('Hétfő: Horváth fhdgy.', 48, 110);
  ctx.fillText('Kedd: Nagy szds.', 48, 130);
  ctx.fillText('Szerda: Kovács tzls.', 48, 150);
  ctx.fillText('Csütörtök: Kiss őrgy.', 48, 170);

  // Red pushpin
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(125, 45, 6, 0, Math.PI * 2);
  ctx.fill();

  // Pinned Paper 2: Evacuation plan
  ctx.fillStyle = '#f1f5f9';
  ctx.shadowBlur = 6;
  ctx.fillRect(250, 40, 220, 160);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('TŰZVÉDELMI RENDTARTÁS', 265, 65);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.strokeRect(265, 80, 190, 80);
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Kijárat: Főlépcsőház felé', 280, 125);

  // Yellow pushpin
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(360, 45, 6, 0, Math.PI * 2);
  ctx.fill();

  // TARGET ERROR: Yellow Post-it with PASSWORDS pinned right on the board!
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 8;
  ctx.fillRect(160, 280, 220, 180);
  ctx.shadowBlur = 0;

  // Blue pushpin on password note
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(270, 285, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillText('★ KÖZÖS JELSZAVAK ★', 180, 320);

  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText('VPN BELÉPÉS:', 175, 350);
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText('User: rendorseg_bp', 175, 370);
  ctx.fillText('Pass: Rendorseg#2026', 175, 390);

  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText('ROBOTZSÁKU PIN: 4920', 175, 420);
  ctx.fillText('WIFI: PoliceInternal_5G', 175, 440);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createUnlockedMonitorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Desktop OS background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 320);

  // Active MS Teams / Corporate Mail client window
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, 20, 472, 260);

  // Window title bar
  ctx.fillStyle = '#334155';
  ctx.fillRect(20, 20, 472, 30);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Belső Hivatali Levelező & Chat — Aktív Munkamenet (Feloldva)', 35, 40);

  // Sidebar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(20, 50, 130, 230);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('📥 Beérkező (14)', 35, 75);
  ctx.fillText('🚨 Sürgős ügyek (3)', 35, 95);
  ctx.fillText('👥 Nyomozócsoport', 35, 115);
  ctx.fillText('📁 Archívum', 35, 135);

  // Main chat/mail body
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(150, 50, 342, 230);

  // Message 1
  ctx.fillStyle = '#3b82f6';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Varga Dénes r. alezredes [10:42]:', 165, 80);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px sans-serif';
  ctx.fillText('„Küldöm a titkosított nyomozati anyagot a gyanúsítottról.”', 165, 100);

  // Message 2
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Én (Bejelentkezve) [10:44]:', 165, 135);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px sans-serif';
  ctx.fillText('„Rendben, átvettem. Máris elkezdem a feldolgozást.”', 165, 155);

  // Unlocked alert banner
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(165, 185, 310, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('⚠ MUNKAMENET NYITVA — NINCS FELÜGYELET!', 175, 210);

  // Taskbar at bottom
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 290, 512, 30);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(10, 294, 22, 22);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText('10:47 | 2026.09.29.', 380, 310);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createMonitorPostitTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Bright yellow post-it
  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, 0, 128, 128);

  // Subtle paper shadow/border
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 126, 126);

  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillText('PASSWORD:', 10, 25);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText('Admin#2026!', 10, 50);

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText('User: admin', 10, 75);
  ctx.fillText('PIN: 1122', 10, 95);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createPoliceCrestTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Circular Hungarian Police Shield insignia
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.beginPath();
  ctx.arc(128, 128, 115, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3a8a';
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(128, 128, 95, 0, Math.PI * 2);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Shield
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RENDŐRSÉG', 128, 70);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('POLICE', 128, 90);

  // Sword and scales motif
  ctx.fillStyle = '#eab308';
  ctx.fillRect(124, 110, 8, 80);
  ctx.fillRect(100, 130, 56, 6);

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('BUDAPEST', 128, 215);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createSecretDocumentTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Manila folder background
  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 0, 256, 360);

  // White paper sheet inside folder
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(12, 12, 232, 336);

  // Red prominent stamp: SZIGORÚAN TITKOS!
  ctx.save();
  ctx.translate(128, 110);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.strokeRect(-95, -24, 190, 48);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SZIGORÚAN TITKOS', 0, 8);
  ctx.restore();

  // Document header & mock classified text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('ORSZÁGOS RENDŐR-FŐKAPITÁNYSÁG', 22, 175);
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Iktatószám: BRFK-TITK-892/2026.', 22, 195);
  ctx.fillText('Minősítési szint: Szigorúan titkos!', 22, 210);
  ctx.fillText('Érvényességi idő: 2056. december 31.', 22, 225);

  // Black lines representing redacted lines
  ctx.fillStyle = '#0f172a';
  for (let y = 245; y < 320; y += 14) {
    ctx.fillRect(22, y, 180 + Math.random() * 30, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createPhoneScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Smartphone screen
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 128, 256);

  // Notification bar
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(0, 0, 128, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px sans-serif';
  ctx.fillText('10:48', 8, 16);
  ctx.fillText('📶 100%', 85, 16);

  // Duty app card
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8, 40, 112, 120);
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('SZOLGÁLATI CHAT', 14, 58);

  ctx.fillStyle = '#1e293b';
  ctx.font = '9px sans-serif';
  ctx.fillText('Ügyeletvezető:', 14, 76);
  ctx.fillText('„Azonnali eligazítás', 14, 90);
  ctx.fillText('a 2-es tárgyalóban!”', 14, 104);

  // Red badge: UNLOCKED!
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(8, 175, 112, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('FELOLDVA', 28, 195);
  ctx.font = '8px sans-serif';
  ctx.fillText('Nincs jelszóval zárva', 14, 210);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createWindowViewTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Natural exterior daylight: sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, 350);
  skyGradient.addColorStop(0, '#38bdf8');
  skyGradient.addColorStop(1, '#bae6fd');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, 512, 512);

  // Distant Budapest cityscape buildings
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(40, 220, 80, 140);
  ctx.fillRect(140, 180, 110, 180);
  ctx.fillRect(270, 200, 95, 160);
  ctx.fillRect(380, 230, 90, 130);

  // Ground / street level (accessible ground floor!)
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 360, 512, 152);

  // Sidewalk & railing directly outside
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 350, 512, 20);

  // Lush tree outside window
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(80, 300, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(140, 320, 60, 0, Math.PI * 2);
  ctx.fill();

  // Visible silhouette of bystander/passerby outside who can look in!
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(380, 330, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(366, 346, 28, 60);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createPrinterTrayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('SZIGORÚAN BIZALMAS', 20, 35);

  ctx.fillStyle = '#0f172a';
  ctx.font = '12px sans-serif';
  ctx.fillText('Tanúvallomási Jegyzőkönyv', 20, 65);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px sans-serif';
  ctx.fillText('Nyomtatva: 10:35 (Ottfelejtve)', 20, 85);

  // Redacted lines
  ctx.fillStyle = '#334155';
  for (let y = 110; y < 230; y += 14) {
    ctx.fillRect(20, y, 160 + Math.random() * 40, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
