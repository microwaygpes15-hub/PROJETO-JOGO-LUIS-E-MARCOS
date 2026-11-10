
/* =====================================================================
   EXTENSÃO: HISTÓRIA, FASES 2 e 3, NOVAS HABILIDADES, CHEFES E CORREÇÕES
   ===================================================================== */
const TAU=Math.PI*2;
let DPR=1;
let curPhase=1,unlocked=1,floorBuiltFor=0,lastCardPhase=0;
function saveProgress(){writeSave({u:unlocked,v:2});}
function loadProgress(){const s=readSave();unlocked=s&&Number.isInteger(s.u)?Math.max(1,Math.min(4,s.u)):1;try{localStorage.removeItem('kayzen_unlocked');}catch(_){}}

const PHASE_DEF={
  1:{name:'Distrito Neon',mix:['atk','hyb','def','atk','hyb','atk','def'],count:24,boss:null,legend:['atk','def','hyb'],
     emblems:['#ff5a3c','#3da5ff','#b86bff'],start:[WW/2,WH/2],color:'#00e5ff',
     card:{lead:'As ruas da última cidade da Terra foram tomadas pelo enxame do Véu.',
       goal:'Destrua os malwares e derrote o chefe. Só então o PORTAL abre para a próxima fase.',
       foes:'Atacantes (investem), Defensores (escudo) e Híbridos.',
       ability:'SOBRECARGA (Q) — raio em área com recarga curta',
       abilityTouch:'SOBRECARGA — raio em área com recarga curta'}},
  2:{name:'Fundição Rubra',mix:['atk','kam','tur','kam','atk','tur','hyb'],count:16,boss:'forja',legend:['atk','kam','tur','hyb'],
     emblems:['#ff8a1f','#ffd34e','#ff3b3b'],start:[430,WH-400],color:'#ff8a1f',
     card:{lead:'Erguida sobre os campos de lava do Despertar, a fundição que aquecia a cidade agora fabrica malwares.',
       goal:'Destrua os robôs e derrote o chefe. Pule sobre a lava para não se queimar.',
       foes:'Torretas (atiram brasas) e Kamikazes (piscam e explodem).',
       ability:'NOVA: DASH DO DRAGÃO (Shift) — avanço rápido e invulnerável que deixa um rastro de fogo',
       abilityTouch:'NOVA: DASH DO DRAGÃO — avanço rápido e invulnerável que deixa um rastro de fogo'}},
  3:{name:'Cripta Glacial',mix:['spc','ice','hyb','spc','ice','def'],count:16,boss:'vexx',legend:['spc','ice','hyb','def'],
     emblems:['#8ff3ff','#c9a6ff','#e9fbff'],start:[430,400],color:'#8ff3ff',
     card:{lead:'No norte congelado pelo Inverno de Cinzas, Vexx esconde o coração do Núcleo. O chão é escorregadio.',
       goal:'Elimine os inimigos e derrote VEXX para libertar o Núcleo. O chão escorrega!',
       foes:'Espectros (se teletransportam) e Sentinelas (gelo que deixa lento).',
       ability:'NOVA: ESCUDO CRIO (F) — bloqueia tiros e dano por 4,5 s e congela quem estiver perto',
       abilityTouch:'NOVA: ESCUDO CRIO — bloqueia tiros e dano por 4,5 s e congela quem estiver perto'}},
  4:{name:'Fenda do Multiverso',mix:['egb','enr','epx','egb','enr','epx','egb'],count:18,boss:'omega',legend:['egb','enr','epx'],
     emblems:['#ff3bd0','#e6e6e6','#7cff3a'],start:[430,400],color:'#ff3bd0',
     card:{lead:'Num último golpe, Vexx rasgou a realidade. Versões de Kayzen de outros universos atravessam a Fenda.',
       goal:'Limpe os 4 universos e derrote KAYZEN ÔMEGA, o seu eco corrompido.',
       foes:'Ecos de Kayzen: Gibi (investe), Noir (atira de longe) e Pixel (se divide em dois).',
       ability:'NOVA: ECO ALIADO (V) — chama um Kayzen de outro universo para lutar ao seu lado por 7 s',
       abilityTouch:'NOVA: ECO ALIADO — chama um Kayzen de outro universo para lutar ao seu lado por 7 s'}}
};
const BOSS={
  forja:{name:'FORJA-X',title:'O Colosso da Fundição',tag:'CHEFE',color:'#ff6a1f',hp:800,r:44,dmg:16,scale:2.6,speed:0,sight:620},
  vexx:{name:'VEXX',title:'A Rainha do Véu',tag:'CHEFE',color:'#b88cff',hp:950,r:30,dmg:12,scale:2.2,speed:0,sight:620}
};
const ABIL={dash:{cd:3,dur:0.2,speed:980,trail:1.3,dmg:18},shield:{cd:12,dur:4.5,radius:80,pulse:160,pulseDmg:25}};
let abil={dashCd:0,dashT:0,dx:1,dy:0,shieldCd:0,shieldT:0,deny:0,sdeny:0,dashId:0,trailAcc:0,allyCd:0,adeny:0};
let trails=[],dashHits={},ebolts=[],hazards=[],boss=null,bossBanner=0,endingDelay=0,weather=[],lavaMsgT=0;
const hasDash=()=>unlocked>=2||curPhase>=2;
const hasShield=()=>unlocked>=3||curPhase>=3;

Object.assign(SFX,{
  eshot:()=>{tone('sawtooth',420,160,.16,.16);noiseBurst(.12,.12,2200,400);},
  ice:()=>{tone('triangle',1600,700,.14,.14);tone('sine',2400,1400,.1,.08,.02);},
  arm:()=>{tone('square',880,880,.06,.16);tone('square',880,880,.06,.16,.12);tone('square',1180,1180,.06,.16,.24);},
  blink:()=>{tone('sine',1200,300,.22,.14);noiseBurst(.18,.1,6000,800);},
  dash:()=>{noiseBurst(.22,.35,5000,300);tone('sawtooth',220,90,.22,.22);},
  shield:()=>{tone('sine',300,1200,.35,.28);tone('triangle',600,1800,.3,.18,.05);noiseBurst(.4,.25,7000,1200);},
  shieldHit:()=>{tone('triangle',1100,800,.14,.25);tone('sine',1700,1200,.1,.14,.02);},
  roar:()=>{tone('sawtooth',90,40,1.1,.5);noiseBurst(1,.5,900,60);tone('square',60,30,1,.3,.1);},
  charge:()=>{tone('sawtooth',80,420,.7,.22);},
  bigboom:()=>{noiseBurst(1.4,.8,3000,40);tone('sine',120,20,1.4,.8);tone('sawtooth',600,40,.9,.3);},
  tick:()=>{tone('square',1300,1300,.012,.025);},
  select:()=>{tone('triangle',660,990,.12,.2);}
});

/* ---------- Tela em alta resolução (nítida em monitores HD e celulares) ---------- */
function setupCanvas(){
  DPR=Math.max(1,Math.min(window.devicePixelRatio||1,2));
  cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);
}

/* ---------- Pausa (também para o som de recarga) ---------- */
function setPaused(v){
  if(state!=='play'&&v)return;
  paused=v;
  if(paused){skill.aiming=false;closePortalUI();mouse.down=false;mobileFire=false;pauseReloadSnd();}
  else resumeReloadAudio();
}
function resumeReloadAudio(){if(muted||paused||!P||P.reloadT<=0||state!=='play')return;startLoopSnd();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state==='play'&&!intro.on&&!pcard.on)setPaused(true);pauseReloadSnd();}if(document.hidden&&intro.on)iaStopAll(0.2);});
addEventListener('pointerdown',audioInit);addEventListener('touchend',audioInit,{passive:true});addEventListener('click',audioInit);

/* ---------- Mira automática no celular ---------- */
function setMobileAim(){
  if(!P)return;
  let best=null,bd=560;
  for(const m of enemies){
    if(m.dead||(m.boss&&m.alpha<0.5)||m.fade>0)continue;
    if(m.x<cam.x-20||m.x>cam.x+VW+20||m.y<cam.y-20||m.y>cam.y+VH+60)continue;
    const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<bd){bd=d;best=m;}
  }
  if(best){mouse.x=best.x-cam.x;mouse.y=best.y-(best.boss?50:22)-cam.y;return;}
  let dx=P.face*320,dy=0;
  if(P.walkDir==='up'&&P.moving){dx=0;dy=-320;}else if(P.walkDir==='down'&&P.moving){dx=0;dy=320;}
  if(joystick.x||joystick.y){const l=Math.hypot(joystick.x,joystick.y)||1;dx=joystick.x/l*320;dy=joystick.y/l*320;}
  mouse.x=P.x-cam.x+dx;mouse.y=P.y-cam.y-34+dy;
}

/* ---------- Mapas por fase ---------- */
function inLava(x,y,pad){for(const h of hazards){const a=(x-h.x)/(h.rx+pad),b=(y-h.y)/(h.ry+pad);if(a*a+b*b<1)return h;}return null;}
function loadMap(id){
  walls.length=0;lights.length=0;hazards=[];
  walls.push([0,-40,WW,40],[0,WH,WW,40],[-40,0,40,WH],[WW,0,40,WH]);
  if(id===1){
    for(let ty=0;ty<MAP_SCALE;ty++)for(let tx=0;tx<MAP_SCALE;tx++){
      const ox=tx*TILE_W,oy=ty*TILE_H;
      baseWalls.forEach(([x,y,w,h])=>walls.push([x+ox,y+oy,w,h]));
      baseLights.forEach(([x,y])=>lights.push([x+ox,y+oy]));
    }
    return;
  }
  const R=rng(id===2?77707:id===4?40404:90901),cx=WW/2,cy=WH/2,S=PHASE_DEF[id].start;
  const free=(x,y,w,h,pad)=>{
    if(x<90||y<90||x+w>WW-90||y+h>WH-90)return false;
    const nx=Math.max(x,Math.min(cx,x+w)),ny=Math.max(y,Math.min(cy,y+h));if(Math.hypot(nx-cx,ny-cy)<640)return false;
    const sx=Math.max(x,Math.min(S[0],x+w)),sy=Math.max(y,Math.min(S[1],y+h));if(Math.hypot(sx-S[0],sy-S[1])<280)return false;
    for(let i=4;i<walls.length;i++){const [a,b,c,d]=walls[i];if(x<a+c+pad&&x+w+pad>a&&y<b+d+pad&&y+h+pad>b)return false;}
    return true;};
  let n=0,t=0;const target=id===2?36:id===4?38:40;
  while(n<target&&t++<6000){
    let w,h;const k=R();
    if(id===2){if(k<.4){w=170+R()*150;h=120+R()*70;}else if(k<.75){w=90+R()*40;h=90+R()*40;}else{w=260+R()*200;h=54;}}
    else if(id===4){if(k<.5){w=150+R()*140;h=110+R()*90;}else{w=96+R()*40;h=200+R()*120;}}
    else{if(k<.55){if(R()<.5){w=62;h=220+R()*160;}else{w=220+R()*160;h=62;}}else{w=90+R()*70;h=90+R()*70;}}
    w=Math.round(w);h=Math.round(h);
    const x=Math.round(R()*(WW-w)),y=Math.round(R()*(WH-h));
    if(free(x,y,w,h,130)){walls.push([x,y,w,h]);n++;}
  }
  // colunas de cobertura na arena do chefe
  for(let i=0;i<6;i++){const a=i/6*TAU+0.5,px=cx+Math.cos(a)*440,py=cy+Math.sin(a)*300;walls.push([Math.round(px-36),Math.round(py-36),72,72]);}
  for(let i=0;i<70;i++)lights.push([R()*WW,R()*WH]);
  if(id===2){
    let m=0,tt=0;
    while(m<24&&tt++<4000){
      const x=160+R()*(WW-320),y=160+R()*(WH-320),rx=70+R()*110,ry=40+R()*55;
      if(Math.hypot(x-S[0],y-S[1])<420)continue;
      if(Math.hypot((x-cx)/1.35,y-cy)<520)continue;
      if(hitsWall(x,y,Math.max(rx,ry)+30))continue;
      if(hazards.some(o=>Math.hypot(o.x-x,o.y-y)<o.rx+rx+70))continue;
      hazards.push({x,y,rx,ry,ph:R()*6});m++;
    }
    hazards.push({x:cx-300,y:cy+170,rx:90,ry:44,ph:1},{x:cx+310,y:cy-160,rx:90,ry:44,ph:2});
  }
}
function ensureFloor(){if(!floorCanvas){floorCanvas=document.createElement('canvas');floorCanvas.width=WW;floorCanvas.height=WH;}return floorCanvas.getContext('2d');}
function buildFloor(){if(curPhase===2)buildFloorForge();else if(curPhase===3)buildFloorIce();else if(curPhase===4)buildFloorMulti();else buildFloorCity();}

function buildFloorForge(){
  const g=ensureFloor(),R=rng(5150),cx=WW/2,cy=WH/2;
  g.fillStyle='#16100e';g.fillRect(0,0,WW,WH);
  for(let y=0;y<WH;y+=96)for(let x=0;x<WW;x+=96){
    const v=R();g.fillStyle=v<.33?'#1d1512':v<.66?'#191210':'#221814';g.fillRect(x+1,y+1,94,94);
    g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x,y,96,2);g.fillRect(x,y,2,96);
    g.fillStyle='rgba(255,170,110,.09)';g.fillRect(x+7,y+7,3,3);g.fillRect(x+86,y+7,3,3);g.fillRect(x+7,y+86,3,3);g.fillRect(x+86,y+86,3,3);
  }
  for(let i=0;i<1100;i++){const x=R()*WW,y=R()*WH;g.fillStyle=R()<.5?'rgba(140,60,20,.08)':'rgba(0,0,0,.12)';g.beginPath();g.ellipse(x,y,8+R()*40,3+R()*14,R()*3,0,TAU);g.fill();}
  // rachaduras incandescentes
  g.lineCap='round';
  for(let i=0;i<140;i++){let x=R()*WW,y=R()*WH;g.strokeStyle='rgba(255,'+(90+Math.floor(R()*80))+',30,.22)';g.lineWidth=1+R()*2;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(R()-.5)*60;y+=(R()-.5)*60;g.lineTo(x,y);}g.stroke();}
  // faixas de perigo ao redor da arena
  g.save();g.lineWidth=18;g.setLineDash([28,28]);g.strokeStyle='rgba(235,175,40,.30)';g.beginPath();g.arc(cx,cy,650,0,TAU);g.stroke();
  g.setLineDash([]);g.lineWidth=3;g.strokeStyle='rgba(255,120,40,.22)';g.beginPath();g.arc(cx,cy,560,0,TAU);g.stroke();g.restore();
  g.save();g.translate(cx,cy);g.strokeStyle='rgba(255,140,60,.10)';g.lineWidth=2;for(let r=120;r<540;r+=70){g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();}
  for(let a=0;a<12;a++){g.rotate(TAU/12);g.beginPath();g.moveTo(0,90);g.lineTo(0,540);g.stroke();}g.restore();
  for(const [x,y] of lights){const gr=g.createRadialGradient(x,y,3,x,y,150);gr.addColorStop(0,'rgba(255,120,40,.11)');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(x-150,y-150,300,300);}
  // poças de lava (base; o brilho animado é desenhado por cima a cada quadro)
  for(const h of hazards){
    g.save();g.translate(h.x,h.y);
    g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.ellipse(4,6,h.rx+18,h.ry+14,0,0,TAU);g.fill();
    g.fillStyle='#2b130b';g.beginPath();g.ellipse(0,0,h.rx+14,h.ry+11,0,0,TAU);g.fill();
    const gr=g.createRadialGradient(0,0,4,0,0,Math.max(h.rx,h.ry));gr.addColorStop(0,'#ffe27a');gr.addColorStop(.45,'#ff7a12');gr.addColorStop(1,'#a51b00');
    g.fillStyle=gr;g.beginPath();g.ellipse(0,0,h.rx,h.ry,0,0,TAU);g.fill();
    for(let k=0;k<7;k++){g.fillStyle='rgba(60,18,6,.55)';g.beginPath();g.ellipse((R()-.5)*h.rx*1.4,(R()-.5)*h.ry*1.3,6+R()*16,3+R()*7,R()*3,0,TAU);g.fill();}
    g.restore();
  }
  walls.forEach(([x,y,w,h],i)=>{
    if(y<0||x<0||x>=WW||y>=WH){g.fillStyle='#0b0706';g.fillRect(x,y,w,h);return;}
    g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x+8,y+10,w,h);
    g.fillStyle='#2e2522';g.fillRect(x,y,w,h);g.fillStyle='#231b18';g.fillRect(x+5,y+5,w-10,h-10);
    g.strokeStyle='rgba(255,140,60,.28)';g.lineWidth=2;g.strokeRect(x+3,y+3,w-6,h-6);
    if(h<=56||w<=56){ // esteira / tubulação
      g.fillStyle='#14100e';g.fillRect(x+6,y+8,w-12,h-16);
      for(let xx=x+10;xx<x+w-10;xx+=18){g.fillStyle='rgba(255,190,90,.12)';g.fillRect(xx,y+10,8,h-20);}
      g.fillStyle='rgba(235,175,40,.5)';for(let xx=x+4;xx<x+w-14;xx+=28){g.beginPath();g.moveTo(xx,y);g.lineTo(xx+14,y);g.lineTo(xx+4,y+6);g.lineTo(xx-10,y+6);g.fill();}
    }else if(w<145&&h<145){ // caixote de aço
      g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=5;g.beginPath();g.moveTo(x+8,y+8);g.lineTo(x+w-8,y+h-8);g.moveTo(x+w-8,y+8);g.lineTo(x+8,y+h-8);g.stroke();
      g.strokeStyle='rgba(255,170,110,.18)';g.lineWidth=2;g.stroke();
      g.fillStyle='rgba(255,170,110,.25)';[[x+9,y+9],[x+w-12,y+9],[x+9,y+h-12],[x+w-12,y+h-12]].forEach(([a,b])=>g.fillRect(a,b,4,4));
    }else{ // fornalha
      g.fillStyle='#1a1311';g.fillRect(x+12,y+h-48,w-24,36);
      for(let xx=x+20;xx<x+w-26;xx+=22){const gr=g.createLinearGradient(0,y+h-44,0,y+h-16);gr.addColorStop(0,'#ffd36b');gr.addColorStop(1,'#c2370a');g.fillStyle=gr;g.fillRect(xx,y+h-42,12,26);}
      g.fillStyle='#120d0c';[[x+26,y+22],[x+w-46,y+22]].forEach(([a,b])=>{g.beginPath();g.arc(a+10,b+10,14,0,TAU);g.fill();g.strokeStyle='rgba(255,140,60,.35)';g.stroke();});
      g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=2;for(let yy=y+50;yy<y+h-56;yy+=22){g.beginPath();g.moveTo(x+10,yy);g.lineTo(x+w-10,yy);g.stroke();}
    }
  });
}
function buildFloorIce(){
  const g=ensureFloor(),R=rng(31337),cx=WW/2,cy=WH/2;
  g.fillStyle='#0a1520';g.fillRect(0,0,WW,WH);
  for(let y=0;y<WH;y+=80)for(let x=0;x<WW;x+=80){const v=R();g.fillStyle=v<.33?'#0d1b29':v<.66?'#0b1824':'#102131';g.fillRect(x+1,y+1,78,78);
    g.fillStyle='rgba(170,230,255,.06)';g.fillRect(x,y,80,1);g.fillRect(x,y,1,80);}
  for(let i=0;i<500;i++){const x=R()*WW,y=R()*WH,r=20+R()*90;const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,'rgba(220,245,255,.09)');gr.addColorStop(1,'rgba(220,245,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  g.lineCap='round';
  for(let i=0;i<220;i++){let x=R()*WW,y=R()*WH;g.strokeStyle='rgba(200,240,255,'+(0.08+R()*0.14)+')';g.lineWidth=1+R()*1.5;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-.5)*70;y+=(R()-.5)*70;g.lineTo(x,y);}g.stroke();}
  for(let i=0;i<260;i++){g.fillStyle='rgba(235,248,255,'+(0.04+R()*0.06)+')';g.beginPath();g.ellipse(R()*WW,R()*WH,20+R()*60,6+R()*18,R()*3,0,TAU);g.fill();}
  // círculo rúnico da arena de Vexx
  g.save();g.translate(cx,cy);g.strokeStyle='rgba(184,140,255,.22)';g.lineWidth=4;g.beginPath();g.arc(0,0,560,0,TAU);g.stroke();
  g.strokeStyle='rgba(143,243,255,.16)';g.lineWidth=2;g.beginPath();g.arc(0,0,520,0,TAU);g.stroke();g.beginPath();g.arc(0,0,250,0,TAU);g.stroke();
  for(let i=0;i<6;i++){const a=i/6*TAU,b=(i+2)/6*TAU;g.beginPath();g.moveTo(Math.cos(a)*520,Math.sin(a)*520);g.lineTo(Math.cos(b)*520,Math.sin(b)*520);g.stroke();}
  g.font='bold 22px serif';g.fillStyle='rgba(184,140,255,.22)';g.textAlign='center';for(let i=0;i<24;i++){g.save();g.rotate(i/24*TAU);g.fillText('ᚱᚢᛁᛟ'[i%4],0,-538);g.restore();}
  g.restore();
  for(const [x,y] of lights){const gr=g.createRadialGradient(x,y,3,x,y,140);gr.addColorStop(0,'rgba(120,220,255,.10)');gr.addColorStop(1,'rgba(120,220,255,0)');g.fillStyle=gr;g.fillRect(x-140,y-140,280,280);}
  walls.forEach(([x,y,w,h])=>{
    if(y<0||x<0||x>=WW||y>=WH){g.fillStyle='#050b11';g.fillRect(x,y,w,h);return;}
    g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x+8,y+10,w,h);
    if(w<=64||h<=64){ // rack de servidores congelado
      g.fillStyle='#121c27';g.fillRect(x,y,w,h);g.fillStyle='#0b131c';g.fillRect(x+4,y+4,w-8,h-8);
      const vert=h>w;
      for(let k=8;k<(vert?h:w)-8;k+=14){
        if(vert){g.fillStyle='#16232f';g.fillRect(x+8,y+k,w-16,10);g.fillStyle=R()<.7?'rgba(110,230,255,.8)':'rgba(184,140,255,.8)';g.fillRect(x+12,y+k+3,4,4);g.fillStyle='rgba(120,255,170,.6)';if(R()<.5)g.fillRect(x+20,y+k+3,3,4);}
        else{g.fillStyle='#16232f';g.fillRect(x+k,y+8,10,h-16);g.fillStyle=R()<.7?'rgba(110,230,255,.8)':'rgba(184,140,255,.8)';g.fillRect(x+k+3,y+12,4,4);}
      }
      g.fillStyle='rgba(235,250,255,.55)';g.fillRect(x,y,w,4);g.fillRect(x,y,4,h);
      g.strokeStyle='rgba(143,243,255,.35)';g.lineWidth=2;g.strokeRect(x+1,y+1,w-2,h-2);
    }else{ // bloco de cristal
      g.fillStyle='#132a3e';g.fillRect(x,y,w,h);
      const n=4+Math.floor(R()*4);
      for(let k=0;k<n;k++){const bx=x+12+R()*(w-24),by=y+h-10-R()*(h*0.35),hh=h*(0.45+R()*0.45),ww=10+R()*18;
        const gr=g.createLinearGradient(bx,by-hh,bx,by);gr.addColorStop(0,'rgba(235,252,255,.95)');gr.addColorStop(1,'rgba(90,170,230,.55)');
        g.fillStyle=gr;g.beginPath();g.moveTo(bx-ww/2,by);g.lineTo(bx,by-hh);g.lineTo(bx+ww/2,by);g.closePath();g.fill();
        g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;g.beginPath();g.moveTo(bx,by-hh);g.lineTo(bx+ww*0.15,by);g.stroke();}
      g.strokeStyle='rgba(143,243,255,.45)';g.lineWidth=2;g.strokeRect(x+1,y+1,w-2,h-2);
    }
  });
}

/* ---------- Reinício de fase / progressão ---------- */
function extReset(){
  abil={dashCd:0,dashT:0,dx:1,dy:0,shieldCd:0,shieldT:0,deny:0,sdeny:0,dashId:0,trailAcc:0,allyCd:0,adeny:0};
  ally=null;ostrikes=[];oportals=[];comicFX=[];zoneNow=-1;zoneBanner=0;glitchT=0;progReset();
  trails=[];dashHits={};ebolts=[];boss=null;bossBanner=0;endingDelay=0;weather=[];
}
function refreshPhases(){
  for(let i=0;i<4;i++){const id=i+1;PHASES[i].open=id<=unlocked;PHASES[i].sub=PHASES[i].open?PHASE_DEF[id].name:'Vença a Fase '+i+' para liberar';}
}
function startPhase(id){
  curPhase=id;
  if(floorBuiltFor!==id){loadMap(id);buildFloor();floorBuiltFor=id;}
  reset();
  if(lastCardPhase!==id)showPhaseCard(id);
}
function restartPhase(){startPhase(curPhase);}
function goNextPhase(){
  if(curPhase>=3||ptravel)return;
  ptravel={phase:'in',t:0,dur:0.9,px:P.x,py:P.y-34,dest:curPhase+1};sfx('portalGo');shake=Math.max(shake,8);
}
function onRetry(src){
  if(ptravel||endingDelay>0)return;
  if(state==='dead')restartPhase();
  else if(state==='win'){if(src==='r'||curPhase>=3)restartPhase();else goNextPhase();}
}

/* ---------- Inimigos novos ---------- */
function slowF(m){return abil.shieldT>0&&Math.hypot(m.x-P.x,m.y-P.y)<ABIL.shield.pulse+20?0.4:1;}
function eMove(m,dx,dy,sp,dt){
  const f=slowF(m)*DIFF().spd;m.kx*=Math.max(0,1-dt*8);m.ky*=Math.max(0,1-dt*8);
  moveEntity(m,(dx*sp*f+m.kx)*dt,(dy*sp*f+m.ky)*dt);
  for(const o of enemies){if(o===m||o.dead)continue;const ex=m.x-o.x,ey=m.y-o.y,dist=Math.hypot(ex,ey);if(dist>0&&dist<(m.r+o.r)*0.9)moveEntity(m,ex/dist*40*dt,ey/dist*40*dt);}
}
function wander(m,dt){
  m.wait-=dt;
  if(m.wait<=0){m.tx=m.x+(Math.random()-.5)*220;m.ty=m.y+(Math.random()-.5)*220;m.wait=1.5+Math.random()*2;}
  const dd=Math.hypot(m.tx-m.x,m.ty-m.y);
  if(dd>8&&m.t.speed>0)eMove(m,(m.tx-m.x)/dd*.45,(m.ty-m.y)/dd*.45,CFG.malwareSpeed*m.t.speed,dt);
}
function fireBolt(x,y,a,spd,kind,dmg){ebolts.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,t:3.4,r:kind==='void'?8:7,kind,dmg:Math.round(dmg*DIFF().dmg)});}
function kamBoom(m){
  if(m.dead)return;m.dead=true;kills++;shake=Math.max(shake,9);sfx('boom',m.x,m.y);
  burst(m.x,m.y-14,'#ff8a1f',26);burst(m.x,m.y-14,'#ffe27a',14);
  if(state==='play'&&Math.hypot(P.x-m.x,P.y-m.y)<92&&(P.z||0)<22)hurtPlayer(14,m);
}
const EXT_AI={
  tur(m,dt){
    m.kx=m.ky=0;m.face=P.x>m.x?1:-1;m.aim=Math.atan2((P.y-30)-(m.y-26),P.x-m.x);
    const d=Math.hypot(P.x-m.x,P.y-m.y);m.cool-=dt;
    if(m.charge>0){m.charge-=dt;if(m.charge<=0){m.charge=0;fireBolt(m.x+Math.cos(m.aim)*26,m.y-26+Math.sin(m.aim)*26,m.aim,270,'fire',10);sfx('eshot',m.x,m.y);m.cool=1.8+Math.random()*0.7;}}
    else if(state==='play'&&(d<560||m.alert>0)&&m.cool<=0)m.charge=0.5;
  },
  kam(m,dt){
    m.face=P.x>m.x?1:-1;
    if(m.arm>0){m.arm-=dt;if(m.arm<=0)kamBoom(m);return;}
    const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));
    if(state==='play'&&(d<430||m.alert>0)){eMove(m,(P.x-m.x)/d,(P.y-m.y)/d,CFG.malwareSpeed*m.t.speed,dt);if(d<64){m.arm=0.55;sfx('arm',m.x,m.y);}}
    else wander(m,dt);
  },
  spc(m,dt){
    m.face=P.x>m.x?1:-1;
    if(m.fade>0){
      m.fade-=dt;
      if(m.fade<=0&&m.fadeDir===-1){
        for(let k=0;k<8;k++){const a=Math.random()*TAU,r=150+Math.random()*90,tx=P.x+Math.cos(a)*r,ty=P.y+Math.sin(a)*r;
          if(tx>60&&ty>60&&tx<WW-60&&ty<WH-60&&!hitsWall(tx,ty,m.r+4)){m.x=tx;m.y=ty;break;}}
        m.fadeDir=1;m.fade=0.35;burst(m.x,m.y-20,'#8ff3ff',10);
      }else if(m.fade<=0)m.fadeDir=0;
      return;
    }
    const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));m.blinkCd-=dt;
    if(state==='play'&&(d<470||m.alert>0)){
      if(m.blinkCd<=0&&d>130){m.fade=0.35;m.fadeDir=-1;m.blinkCd=2.6+Math.random()*1.6;sfx('blink',m.x,m.y);burst(m.x,m.y-20,'#8ff3ff',10);return;}
      eMove(m,(P.x-m.x)/d,(P.y-m.y)/d,CFG.malwareSpeed*m.t.speed,dt);
    }else wander(m,dt);
  },
  ice(m,dt){
    const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));m.face=P.x>m.x?1:-1;
    m.aim=Math.atan2((P.y-30)-(m.y-34),P.x-m.x);
    if(state==='play'&&(d<600||m.alert>0)){
      const dx=(P.x-m.x)/d,dy=(P.y-m.y)/d,k=d>320?1:d<240?-1:0,sx=-dy*m.strafe,sy=dx*m.strafe;
      eMove(m,dx*k+sx*0.6,dy*k+sy*0.6,CFG.malwareSpeed*m.t.speed,dt);
      if(Math.random()<dt*0.35)m.strafe=-m.strafe;
      m.cool-=dt;
      if(m.charge>0){m.charge-=dt;if(m.charge<=0){m.charge=0;for(const s of[-0.2,0,0.2])fireBolt(m.x,m.y-34,m.aim+s,300,'ice',7);sfx('ice',m.x,m.y);m.cool=2.4+Math.random()*0.6;}}
      else if(m.cool<=0)m.charge=0.55;
    }else wander(m,dt);
  }
};

/* ---------- Chefes ---------- */
function spawnBoss(kind){
  const B=BOSS[kind],b=newMalware(WW/2,WH/2,'atk');
  Object.assign(b,{boss:kind,type:'boss',t:B,r:B.r,hp:B.hp,maxHp:B.hp,hpG:B.hp,dmg:B.dmg,awake:false,act:'walk',actT:1.5,rage:false,seq:0,stun:0,alpha:1,cdx:1,cdy:0,spinA:0,volley:0});
  enemies.push(b);boss=b;
}
function countMinions(){let n=0;for(const o of enemies)if(!o.dead&&!o.boss)n++;return n;}
function spawnMinion(type,x,y){
  for(let k=0;k<12;k++){const a=Math.random()*TAU,r=70+Math.random()*80,tx=x+Math.cos(a)*r,ty=y+Math.sin(a)*r;
    if(tx>60&&ty>60&&tx<WW-60&&ty<WH-60&&!hitsWall(tx,ty,20)){const m=newMalware(tx,ty,type);m.alert=6;enemies.push(m);burst(tx,ty-20,ETYPES[type].color,14);return;}}
}
function updateBoss(m,dt){
  const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));
  if(!m.awake){
    if(state==='play'&&(d<620||m.alert>0)){m.awake=true;m.actT=1.4;bossBanner=2.8;sfx('roar');shake=16;}
    else{m.face=P.x>m.x?1:-1;return;}
  }
  if(state!=='play')return;
  m.rage=m.hp<m.maxHp*0.5;m.kx=m.ky=0;
  if(m.boss==='forja')forjaAI(m,dt,d);else if(m.boss==='omega')omegaAI(m,dt,d);else if(m.boss==='queen')queenAI(m,dt,d);else vexxAI(m,dt,d);
}
function forjaAI(m,dt,d){
  m.actT-=dt;const R=m.rage;
  switch(m.act){
    case 'walk':{
      const dx=(P.x-m.x)/d,dy=(P.y-m.y)/d;if(d>130)eMove(m,dx,dy,R?82:64,dt);m.face=dx>0?1:-1;
      if(m.actT<=0){const pick=m.seq++%3;
        if(pick===0){m.act='ringT';m.actT=0.85;sfx('charge',m.x,m.y);}
        else if(pick===1){m.act='chargeT';m.actT=0.9;m.cdx=dx;m.cdy=dy;sfx('charge',m.x,m.y);}
        else if(countMinions()<8){m.act='summon';m.actT=0.75;}
        else{m.act='ringT';m.actT=0.85;}}
      break;}
    case 'ringT':
      if(m.actT<=0){const n=R?20:14,off=Math.random();for(let i=0;i<n;i++)fireBolt(m.x,m.y-60,off+i/n*TAU,R?235:205,'fire',10);
        sfx('boom',m.x,m.y);shake=Math.max(shake,7);burst(m.x,m.y-60,'#ffd34e',18);
        if(R){m.act='ring2';m.actT=0.5;m.off=off;}else{m.act='walk';m.actT=1.9;}}
      break;
    case 'ring2':
      if(m.actT<=0){const n=22;for(let i=0;i<n;i++)fireBolt(m.x,m.y-60,m.off+(i+0.5)/n*TAU,220,'fire',10);sfx('boom',m.x,m.y);m.act='walk';m.actT=1.4;}
      break;
    case 'chargeT':
      if(m.actT>0.35){m.cdx=(P.x-m.x)/d;m.cdy=(P.y-m.y)/d;m.face=m.cdx>0?1:-1;}
      if(m.actT<=0){m.act='charge';m.actT=0.8;sfx('dash',m.x,m.y);}
      break;
    case 'charge':{
      const sp=R?640:560,ox=m.x,oy=m.y;moveEntity(m,m.cdx*sp*dt,m.cdy*sp*dt);
      if(Math.random()<0.7)sparks.push({x:m.x+(Math.random()-.5)*50,y:m.y-10-Math.random()*40,vx:-m.cdx*120,vy:-m.cdy*120-30,t:0.4,c:'#ff8a1f'});
      if(d<m.r+P.r+8&&(P.z||0)<16)hurtPlayer(18,m);
      if(Math.hypot(m.x-ox,m.y-oy)<sp*dt*0.4){m.act='stun';m.actT=1.7;m.stun=1.7;shake=18;sfx('boom',m.x,m.y);burst(m.x,m.y-40,'#ffd34e',26);
        floaters.push({x:m.x,y:m.y-150,t:1.4,txt:'ATORDOADO! DANO x2',c:'#ffd34e'});}
      else if(m.actT<=0){m.act='walk';m.actT=1.5;}
      break;}
    case 'stun':m.stun=Math.max(0,m.actT);if(m.actT<=0){m.act='walk';m.actT=1.0;m.stun=0;}break;
    case 'summon':
      if(m.actT<=0){for(let k=0;k<(R?4:3);k++)spawnMinion('kam',m.x,m.y);sfx('roar');m.act='walk';m.actT=1.8;}
      break;
  }
}
function vexxAI(m,dt,d){
  m.actT-=dt;const R=m.rage;m.face=P.x>m.x?1:-1;
  const orbit=(sp)=>{const dx=(P.x-m.x)/d,dy=(P.y-m.y)/d,k=d>360?1:d<260?-1:0;eMove(m,dx*k-dy*0.7,dy*k+dx*0.7,sp,dt);};
  switch(m.act){
    case 'walk':
      orbit(R?150:120);
      if(m.actT<=0){const pick=m.seq++%4;
        if(pick===0){m.act='spiral';m.actT=R?3:2.4;m.spinA=Math.random()*TAU;m.volley=0;sfx('charge',m.x,m.y);}
        else if(pick===1){m.act='fanT';m.actT=0.7;m.volley=R?4:3;sfx('charge',m.x,m.y);}
        else if(pick===2){m.act='teleOut';m.actT=0.45;sfx('blink',m.x,m.y);}
        else{if(countMinions()<8){m.act='summon';m.actT=0.8;}else{m.act='fanT';m.actT=0.7;m.volley=3;}}}
      break;
    case 'spiral':
      orbit(40);m.volley-=dt;
      if(m.volley<=0){m.volley=R?0.075:0.1;m.spinA+=R?0.32:0.27;const arms=R?3:2;
        for(let i=0;i<arms;i++)fireBolt(m.x,m.y-70,m.spinA+i/arms*TAU,R?210:185,'void',9);}
      if(m.actT<=0){m.act='walk';m.actT=1.4;}
      break;
    case 'fanT':
      if(m.actT<=0){const a=Math.atan2((P.y-30)-(m.y-70),P.x-m.x),n=R?7:5;
        for(let i=0;i<n;i++)fireBolt(m.x,m.y-70,a+(i-(n-1)/2)*0.16,330,'ice',8);sfx('ice',m.x,m.y);
        m.volley--;if(m.volley>0)m.actT=0.38;else{m.act='walk';m.actT=1.5;}}
      break;
    case 'teleOut':
      m.alpha=Math.max(0,m.actT/0.45);
      if(m.actT<=0){for(let k=0;k<14;k++){const a=Math.random()*TAU,r=260+Math.random()*140,tx=P.x+Math.cos(a)*r,ty=P.y+Math.sin(a)*r;
          if(tx>120&&ty>120&&tx<WW-120&&ty<WH-120&&!hitsWall(tx,ty,m.r+10)){m.x=tx;m.y=ty;break;}}
        m.act='teleIn';m.actT=0.45;burst(m.x,m.y-60,'#b88cff',24);}
      break;
    case 'teleIn':
      m.alpha=1-Math.max(0,m.actT/0.45);
      if(m.actT<=0){m.alpha=1;const n=R?18:12;for(let i=0;i<n;i++)fireBolt(m.x,m.y-70,i/n*TAU,200,'void',9);m.act='walk';m.actT=1.1;}
      break;
    case 'summon':
      orbit(60);
      if(m.actT<=0){spawnMinion('spc',m.x,m.y);spawnMinion(R?'ice':'spc',m.x,m.y);sfx('blink');m.act='walk';m.actT=1.6;}
      break;
  }
}
function bossDown(m){
  shake=30;sfx('bigboom');
  for(let k=0;k<5;k++)burst(m.x+(Math.random()-.5)*80,m.y-40-Math.random()*80,k%2?m.t.color:'#ffffff',26);
  floaters.push({x:m.x,y:m.y-160,t:2.2,txt:m.t.name+' DERROTADO!',c:m.t.color});
  for(const o of enemies)if(!o.dead&&o!==m){o.dead=true;kills++;burst(o.x,o.y-14,o.t.color,14);}
  ebolts=[];boss=null;
}

/* ---------- Habilidades novas ---------- */
function moveInput(){
  let ax=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joystick.x;
  let ay=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+joystick.y;
  const l=Math.hypot(ax,ay);return l>0.15?{x:ax/l,y:ay/l}:null;
}
function abilityBlocked(){return !P||state!=='play'||paused||ptravel||pmenu.open||intro.on||pcard.on;}
function doDash(){
  if(!hasDash()||abilityBlocked())return;
  if(abil.dashCd>0){abil.deny=0.3;sfx('deny');return;}
  const mv=moveInput();let dx,dy;
  if(mv){dx=mv.x;dy=mv.y;}else if(P.walkDir==='up'){dx=0;dy=-1;}else if(P.walkDir==='down'){dx=0;dy=1;}else{dx=P.face;dy=0;}
  abil.dx=dx;abil.dy=dy;abil.dashT=ABIL.dash.dur;abil.dashCd=ABIL.dash.cd;abil.dashId++;dashHits[abil.dashId]=new Set();
  P.inv=Math.max(P.inv,ABIL.dash.dur+0.12);if(Math.abs(dx)>.1)P.face=dx>0?1:-1;sfx('dash');shake=Math.max(shake,4);
}
function doShield(){
  if(!hasShield()||abilityBlocked())return;
  if(abil.shieldCd>0){abil.sdeny=0.3;sfx('deny');return;}
  abil.shieldT=ABIL.shield.dur;abil.shieldCd=ABIL.shield.cd;sfx('shield');shake=Math.max(shake,6);
  burst(P.x,P.y-30,'#8ff3ff',30);burst(P.x,P.y-30,'#ffffff',12);
  for(const m of enemies){if(m.dead)continue;const dd=Math.hypot(m.x-P.x,m.y-P.y);
    if(dd<ABIL.shield.pulse+m.r){const a=Math.atan2(m.y-P.y,m.x-P.x);hitMalware(m,ABIL.shield.pulseDmg,{x:m.x,y:m.y-10,vx:Math.cos(a),vy:Math.sin(a),skill:true});
      if(!m.dead&&!m.boss&&m.type!=='tur'){m.kx=Math.cos(a)*CFG.knockback*1.3;m.ky=Math.sin(a)*CFG.knockback*1.3;}}}
}
function extMove(dt,ax,ay,sp){
  if(P.slowT>0)P.slowT-=dt;
  const sl=P.slowT>0?0.55:1;let tx=ax*sp*sl,ty=ay*sp*sl;
  if(curPhase===3){const k=Math.min(1,dt*4.5);P.mvx=(P.mvx||0)+(tx-(P.mvx||0))*k;P.mvy=(P.mvy||0)+(ty-(P.mvy||0))*k;tx=P.mvx;ty=P.mvy;}
  if(abil.dashT>0){tx=abil.dx*ABIL.dash.speed;ty=abil.dy*ABIL.dash.speed;}
  P.vx=tx+P.kx_;P.vy=ty+P.ky_;
}
function updateExt(dt){
  abil.dashCd=Math.max(0,abil.dashCd-dt);abil.shieldCd=Math.max(0,abil.shieldCd-dt);abil.deny=Math.max(0,abil.deny-dt);abil.sdeny=Math.max(0,abil.sdeny-dt);
  abil.shieldT=Math.max(0,abil.shieldT-dt);bossBanner=Math.max(0,bossBanner-dt);lavaMsgT=Math.max(0,lavaMsgT-dt);
  if(abil.dashT>0){
    abil.dashT=Math.max(0,abil.dashT-dt);abil.trailAcc+=dt;
    while(abil.trailAcc>0.016){abil.trailAcc-=0.016;trails.push({x:P.x,y:P.y,t:ABIL.dash.trail,id:abil.dashId});}
  }
  for(const tr of trails){
    tr.t-=dt;if(tr.t<=0)continue;
    const hit=dashHits[tr.id];if(!hit)continue;
    for(const m of enemies){if(m.dead||hit.has(m)||(m.boss&&m.alpha<0.5))continue;
      if(Math.hypot(m.x-tr.x,m.y-tr.y)<m.r+24){hit.add(m);hitMalware(m,ABIL.dash.dmg,{x:m.x,y:m.y-10,vx:m.x-tr.x||1,vy:m.y-tr.y,skill:true});burst(m.x,m.y-10,'#ff8a1f',10);}}
  }
  trails=trails.filter(t=>t.t>0);
  if(trails.length===0)for(const k in dashHits)if(+k!==abil.dashId)delete dashHits[k];
  // projéteis inimigos
  for(const b of ebolts){
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;
    if(b.t<=0||b.x<0||b.y<0||b.x>WW||b.y>WH||hitsWall(b.x,b.y+30,3)){b.t=0;burst(b.x,b.y,b.kind==='fire'?'#ff8a1f':b.kind==='ice'?'#8ff3ff':b.kind==='plasma'?'#ff2050':b.kind==='ink'?'#cccccc':'#b88cff',4);continue;}
    if(!P||state!=='play'||ptravel)continue;
    const hx=P.x,hy=P.y-30;
    if(abil.shieldT>0&&Math.hypot(b.x-hx,b.y-hy)<ABIL.shield.radius){b.t=0;burst(b.x,b.y,'#e9fbff',6);continue;}
    if(Math.hypot(b.x-hx,b.y-hy)<P.r+b.r+6&&(P.z||0)<26){b.t=0;
      if(P.inv<=0&&abil.shieldT<=0&&b.kind==='ice'){P.slowT=1.7;floaters.push({x:P.x,y:P.y-90,t:0.8,txt:'LENTO',c:'#8ff3ff'});}
      hurtPlayer(b.dmg,b);}
  }
  ebolts=ebolts.filter(b=>b.t>0);
  // lava
  if(curPhase===2&&state==='play'&&P&&!ptravel&&(P.z||0)<8&&abil.dashT<=0){
    const h=inLava(P.x,P.y,-8);
    if(h&&P.inv<=0&&abil.shieldT<=0){hurtPlayer(8,{x:h.x,y:h.y});burst(P.x,P.y-6,'#ff8a1f',10);if(lavaMsgT<=0){floaters.push({x:P.x,y:P.y-95,t:1,txt:'LAVA! PULE (Espaço)',c:'#ffb347'});lavaMsgT=2.5;}}
  }
  if(endingDelay>0){endingDelay-=dt;if(endingDelay<=0)startStory(endingSet);}
  updateMulti(dt);updateProgress(dt);
}

/* ---------- Desenho: inimigos novos e chefes ---------- */
function drawEHealth(m){
  drawFrozen(m);if(m.hp>=m.maxHp)return;
  const T=m.t,sc=T.scale;
  const w=Math.round(34+sc*10),h=7,x=Math.round(m.x-w/2),y=Math.round(m.y-6-30*sc-16),ratio=Math.max(0,m.hp/m.maxHp);
  ctx.fillStyle='rgba(4,8,20,.85)';ctx.fillRect(x-2,y-2,w+4,h+4);
  ctx.strokeStyle=T.color;ctx.lineWidth=1.5;ctx.strokeRect(x-2,y-2,w+4,h+4);
  ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(x,y,w*Math.max(0,m.hpG/m.maxHp),h);
  ctx.fillStyle=T.color;ctx.fillRect(x,y,w*ratio,h);
  ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(x,y,w*ratio,h*0.4);
}
function shadowAt(x,y,rx,ry,a){ctx.fillStyle='rgba(0,0,0,'+(a||.35)+')';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
const EXT_DRAW={
  tur(m){
    shadowAt(m.x,m.y+4,26,9);
    ctx.save();ctx.translate(m.x,m.y-8);
    ctx.fillStyle='#2b221e';ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU+Math.PI/8;ctx.lineTo(Math.cos(a)*24,Math.sin(a)*14);}ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,179,71,.55)';ctx.lineWidth=2;ctx.stroke();
    ctx.restore();
    ctx.save();ctx.translate(m.x,m.y-26);
    if(m.flash>0)ctx.filter='brightness(2.5)';
    ctx.fillStyle='#3a2e28';ctx.fillRect(-12,8,24,12);
    ctx.rotate(m.aim||0);
    ctx.fillStyle='#1c1512';ctx.fillRect(4,-6,28,12);ctx.fillStyle='#55463d';ctx.fillRect(4,-6,28,4);ctx.fillStyle='#ffb347';ctx.fillRect(28,-6,4,12);
    ctx.fillStyle='#4a3a30';ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.fill();ctx.strokeStyle='#ffd34e';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#ff6a1f';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();
    if(m.charge>0){const k=1-m.charge/0.5;ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(34,0,1,34,0,8+k*16);g.addColorStop(0,'rgba(255,240,170,1)');g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(34,0,8+k*16,0,TAU);ctx.fill();}
    ctx.restore();
  },
  kam(m){
    const bob=Math.sin(time*9+m.bob)*3,y=m.y-18+bob,armed=m.arm>0;
    shadowAt(m.x,m.y+3,15,6);
    if(armed){const k=1-m.arm/0.55;ctx.save();ctx.fillStyle='rgba(255,60,40,'+(0.12+0.2*k)+')';ctx.beginPath();ctx.ellipse(m.x,m.y,92,92*0.45,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(255,90,60,.9)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.ellipse(m.x,m.y,92,92*0.45,0,0,TAU);ctx.stroke();ctx.restore();}
    ctx.save();ctx.translate(m.x,y);ctx.rotate(time*(armed?14:4));
    ctx.fillStyle='#5a1a0a';for(let i=0;i<8;i++){ctx.save();ctx.rotate(i/8*TAU);ctx.beginPath();ctx.moveTo(-4,-11);ctx.lineTo(0,-20);ctx.lineTo(4,-11);ctx.fill();ctx.restore();}
    ctx.restore();
    const blink=armed&&Math.floor(time*16)%2===0;
    ctx.fillStyle=blink||m.flash>0?'#ffffff':'#3a0d05';ctx.beginPath();ctx.arc(m.x,y,13,0,TAU);ctx.fill();
    ctx.save();ctx.globalCompositeOperation='lighter';const p=0.6+0.4*Math.sin(time*(armed?30:6));
    const g=ctx.createRadialGradient(m.x,y,1,m.x,y,12);g.addColorStop(0,'rgba(255,240,170,'+p+')');g.addColorStop(.6,'rgba(255,120,20,'+(0.7*p)+')');g.addColorStop(1,'rgba(255,60,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,y,12,0,TAU);ctx.fill();ctx.restore();
    ctx.fillStyle='#ffd34e';ctx.fillRect(m.x-1,y-20,2,5);if(Math.random()<.5){ctx.fillStyle='#fff3b0';ctx.fillRect(m.x-2+Math.random()*4,y-24,2,2);}
  },
  spc(m){
    let a=1;if(m.fade>0)a=m.fadeDir===-1?m.fade/0.35:1-m.fade/0.35;
    a*=0.62+0.18*Math.sin(time*7+m.bob);
    shadowAt(m.x,m.y+4,m.r+2,m.r*0.38,0.25*a);
    const bob=Math.sin(time*4+m.bob)*5;
    ctx.save();ctx.globalAlpha=a*0.45;ctx.globalCompositeOperation='lighter';
    drawSheet('m_spc',Math.floor(m.anim)%4,m.x-m.face*8,m.y-8+bob,m.t.scale*1.08,m.face>0);
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=a;
    ctx.imageSmoothingEnabled=false;if(m.flash>0)ctx.filter='brightness(3)';
    drawSheet('m_spc',Math.floor(m.anim)%4,m.x,m.y-6+bob,m.t.scale,m.face>0);
    ctx.restore();ctx.imageSmoothingEnabled=true;
  },
  ice(m){
    const bob=Math.sin(time*3+m.bob)*4,y=m.y-36+bob;
    shadowAt(m.x,m.y+4,16,6);
    ctx.save();ctx.translate(m.x,y);
    if(m.flash>0)ctx.filter='brightness(2.2)';
    const g=ctx.createLinearGradient(0,-28,0,24);g.addColorStop(0,'#f2fdff');g.addColorStop(.5,'#8fdcff');g.addColorStop(1,'#3a5fd8');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(15,-2);ctx.lineTo(0,24);ctx.lineTo(-15,-2);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(4,-2);ctx.lineTo(0,24);ctx.stroke();
    ctx.fillStyle='#b88cff';ctx.fillRect(-7,-5,14,3);
    ctx.filter='none';
    for(let i=0;i<3;i++){const a=time*2+i/3*TAU;ctx.save();ctx.translate(Math.cos(a)*24,Math.sin(a)*10);ctx.rotate(a);ctx.fillStyle='rgba(200,240,255,.85)';ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(3,0);ctx.lineTo(0,6);ctx.lineTo(-3,0);ctx.fill();ctx.restore();}
    if(m.charge>0){const k=1-m.charge/0.55;ctx.globalCompositeOperation='lighter';const gg=ctx.createRadialGradient(0,0,2,0,0,14+k*22);gg.addColorStop(0,'rgba(220,250,255,.9)');gg.addColorStop(1,'rgba(120,220,255,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,14+k*22,0,TAU);ctx.fill();}
    ctx.restore();
  }
};
function drawForja(m){
  const st=m.act,x=m.x,y=m.y,R=m.rage,f=m.face<0?-1:1,walk=st==='walk'||st==='charge';
  shadowAt(x,y+4,60,18,.45);
  if(st==='ringT'){const k=1-m.actT/0.85;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,180,60,'+(0.3+0.6*k)+')';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y-60,40+k*90,0,TAU);ctx.stroke();ctx.restore();}
  if(st==='chargeT'){ctx.save();const L=560;ctx.translate(x,y-20);ctx.rotate(Math.atan2(m.cdy,m.cdx));const k=1-m.actT/0.9;
    ctx.fillStyle='rgba(255,60,40,'+(0.12+0.22*k)+')';ctx.fillRect(0,-m.r,L,m.r*2);ctx.strokeStyle='rgba(255,90,60,.8)';ctx.lineWidth=2;ctx.setLineDash([12,10]);ctx.strokeRect(0,-m.r,L,m.r*2);ctx.restore();}
  ctx.save();ctx.translate(x,y);
  if(m.flash>0)ctx.filter='brightness(2)';
  const step=walk?Math.sin(time*8)*5:0;
  ctx.fillStyle='#231c19';ctx.fillRect(-38,-34+step,24,34-step);ctx.fillRect(14,-34-step,24,34+step);
  ctx.fillStyle='rgba(255,120,30,.6)';ctx.fillRect(-32,-24+step,12,3);ctx.fillRect(20,-24-step,12,3);
  const tg=ctx.createLinearGradient(0,-120,0,-30);tg.addColorStop(0,'#4a3c35');tg.addColorStop(1,'#1d1714');
  ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(-56,-118);ctx.lineTo(56,-118);ctx.lineTo(44,-32);ctx.lineTo(-44,-32);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#0d0908';ctx.lineWidth=3;ctx.stroke();
  ctx.strokeStyle='rgba(255,140,60,.25)';ctx.lineWidth=2;for(let yy=-100;yy<-40;yy+=14){ctx.beginPath();ctx.moveTo(-40,yy);ctx.lineTo(-22,yy);ctx.moveTo(22,yy);ctx.lineTo(40,yy);ctx.stroke();}
  const p=0.75+0.25*Math.sin(time*(R?12:5));
  ctx.save();ctx.globalCompositeOperation='lighter';const cg=ctx.createRadialGradient(0,-76,2,0,-76,30);
  cg.addColorStop(0,'rgba(255,250,200,'+p+')');cg.addColorStop(.45,R?'rgba(255,60,30,'+p+')':'rgba(255,140,30,'+p+')');cg.addColorStop(1,'rgba(160,20,0,0)');
  ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,-76,30,0,TAU);ctx.fill();ctx.restore();
  ctx.strokeStyle='#120c0a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-76,20,0,TAU);ctx.stroke();
  for(const s of[-1,1]){
    ctx.fillStyle='#3d312b';ctx.beginPath();ctx.ellipse(s*64,-110,24,18,0,0,TAU);ctx.fill();ctx.strokeStyle='#0d0908';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='rgba(255,170,110,.35)';ctx.fillRect(s*64-10,-118,3,3);ctx.fillRect(s*64+7,-118,3,3);
    const sw=walk?Math.sin(time*8+(s>0?Math.PI:0))*6:0;
    ctx.fillStyle='#2b221e';ctx.fillRect(s*70-10,-100+sw,20,52);
    ctx.fillStyle='#3d312b';ctx.beginPath();ctx.arc(s*70,-44+sw,15,0,TAU);ctx.fill();ctx.strokeStyle='#0d0908';ctx.stroke();
  }
  ctx.fillStyle='#2e2521';ctx.fillRect(-22,-146,44,30);ctx.strokeStyle='#0d0908';ctx.lineWidth=2;ctx.strokeRect(-22,-146,44,30);
  ctx.fillStyle='#120c0a';ctx.fillRect(-17,-138,34,10);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=R?'#ff3b3b':'#ffb347';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;
  ctx.fillRect(-14+f*2,-136,9,5);ctx.fillRect(5+f*2,-136,9,5);ctx.restore();
  ctx.fillStyle='#1a1311';ctx.fillRect(-46,-160,12,44);ctx.fillRect(34,-160,12,44);
  ctx.restore();
  if(Math.random()<0.3)sparks.push({x:x+(Math.random()<.5?-40:40),y:y-162,vx:(Math.random()-.5)*20,vy:-50-Math.random()*40,t:0.7,c:'rgba(120,110,105,.8)'});
  if(st==='stun'){ctx.save();ctx.fillStyle='#ffd34e';ctx.font='bold 20px system-ui';ctx.textAlign='center';for(let i=0;i<3;i++){const a=time*4+i/3*TAU;ctx.fillText('★',x+Math.cos(a)*36,y-170+Math.sin(a)*8);}ctx.restore();}
}
function drawVexx(m){
  const x=m.x,fl=Math.sin(time*2)*8,y=m.y-30+fl,R=m.rage,a=m.alpha;
  shadowAt(m.x,m.y+4,34-fl*0.6,11,.35*a);
  ctx.save();ctx.globalAlpha=a;
  if(m.act==='spiral'){ctx.save();ctx.translate(x,m.y);ctx.rotate(time*2);ctx.strokeStyle='rgba(184,140,255,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,70,0,TAU);ctx.stroke();
    for(let i=0;i<6;i++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(10,-56);ctx.lineTo(-10,-56);ctx.closePath();ctx.stroke();}ctx.restore();}
  if(m.act==='fanT'){const k=1-m.actT/0.7,aa=Math.atan2((P.y-30)-(m.y-70),P.x-m.x),n=R?7:5;ctx.save();ctx.strokeStyle='rgba(143,243,255,'+(0.2+0.5*k)+')';ctx.lineWidth=2;ctx.setLineDash([10,8]);
    for(let i=0;i<n;i++){const b=aa+(i-(n-1)/2)*0.16;ctx.beginPath();ctx.moveTo(x,m.y-70);ctx.lineTo(x+Math.cos(b)*420,m.y-70+Math.sin(b)*420);ctx.stroke();}ctx.restore();}
  ctx.save();ctx.globalCompositeOperation='lighter';const ag=ctx.createRadialGradient(x,y-60,4,x,y-60,90);ag.addColorStop(0,R?'rgba(255,80,200,.35)':'rgba(184,140,255,.35)');ag.addColorStop(1,'rgba(184,140,255,0)');ctx.fillStyle=ag;ctx.beginPath();ctx.arc(x,y-60,90,0,TAU);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(x,y);if(m.flash>0)ctx.filter='brightness(2)';
  const cg=ctx.createLinearGradient(0,-120,0,0);cg.addColorStop(0,'#2a1747');cg.addColorStop(1,'#0b0616');
  ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(0,-128);ctx.quadraticCurveTo(30,-110,34,-70);
  for(let i=0;i<=6;i++){const xx=40-i*(80/6),yy=-4+Math.sin(time*5+i)*5+(i%2?6:0);ctx.lineTo(xx,yy);}
  ctx.lineTo(-34,-70);ctx.quadraticCurveTo(-30,-110,0,-128);ctx.closePath();ctx.fill();
  ctx.strokeStyle=R?'#ff6bd6':'#b88cff';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='rgba(143,243,255,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-18,-60);ctx.lineTo(-10,-40);ctx.lineTo(-18,-20);ctx.moveTo(18,-60);ctx.lineTo(10,-40);ctx.lineTo(18,-20);ctx.moveTo(0,-56);ctx.lineTo(0,-14);ctx.stroke();
  ctx.fillStyle='#05030a';ctx.beginPath();ctx.ellipse(0,-100,15,18,0,0,TAU);ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=R?'#ff6bd6':'#8ff3ff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;ctx.fillRect(-9,-104,6,3);ctx.fillRect(3,-104,6,3);ctx.restore();
  for(let i=0;i<5;i++){const xx=-16+i*8,hh=i===2?24:14+((i%2)*4);const g=ctx.createLinearGradient(0,-126-hh,0,-122);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#8fdcff');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(xx-4,-122);ctx.lineTo(xx,-126-hh);ctx.lineTo(xx+4,-122);ctx.fill();}
  ctx.restore();
  for(let i=0;i<4;i++){const b=time*1.6+i/4*TAU;ctx.save();ctx.translate(x+Math.cos(b)*62,y-60+Math.sin(b)*22);ctx.rotate(b);const g=ctx.createLinearGradient(0,-12,0,12);g.addColorStop(0,'#ffffff');g.addColorStop(1,R?'#ff6bd6':'#8fdcff');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(6,0);ctx.lineTo(0,12);ctx.lineTo(-6,0);ctx.fill();ctx.restore();}
  ctx.restore();
}
function drawBoss(m){if(m.boss==='forja')drawForja(m);else if(m.boss==='omega')drawOmega(m);else if(m.boss==='queen')drawQueen(m);else drawVexx(m);}

function drawHazards(){
  if(curPhase!==2||!hazards.length)return;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const h of hazards){
    if(h.x+h.rx<cam.x-40||h.x-h.rx>cam.x+VW+40||h.y+h.ry<cam.y-40||h.y-h.ry>cam.y+VH+40)continue;
    const p=0.5+0.5*Math.sin(uiT*2+h.ph);
    const g=ctx.createRadialGradient(h.x,h.y,4,h.x,h.y,Math.max(h.rx,h.ry)*1.25);g.addColorStop(0,'rgba(255,200,80,'+(0.18+0.14*p)+')');g.addColorStop(1,'rgba(255,90,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(h.x,h.y,h.rx*1.25,h.ry*1.25,0,0,TAU);ctx.fill();
    for(let k=0;k<3;k++){const ph=(uiT*0.7+k/3+h.ph)%1,bx=h.x+Math.sin(h.ph*7+k*2.3)*h.rx*0.6,by=h.y+Math.cos(h.ph*5+k*1.7)*h.ry*0.5;
      ctx.fillStyle='rgba(255,230,140,'+(0.6*(1-ph))+')';ctx.beginPath();ctx.arc(bx,by-ph*6,2+ph*5,0,TAU);ctx.fill();}
  }
  ctx.restore();
}
function drawTrails(){
  if(!trails.length)return;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const t of trails){const k=t.t/ABIL.dash.trail,r=10+8*k+Math.sin(uiT*20+t.x)*2;
    const g=ctx.createRadialGradient(t.x,t.y-4,1,t.x,t.y-4,r*1.6);g.addColorStop(0,'rgba(255,240,170,'+(0.7*k)+')');g.addColorStop(.5,'rgba(255,120,20,'+(0.5*k)+')');g.addColorStop(1,'rgba(255,60,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(t.x,t.y-4,r*1.6,0,TAU);ctx.fill();}
  ctx.restore();
  if(abil.dashT>0){ctx.save();ctx.globalAlpha=0.35;ctx.translate(-abil.dx*26,-abil.dy*26);drawPlayer();ctx.restore();}
}
function drawEBolts(){
  if(!ebolts.length)return;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const b of ebolts){
    if(b.x<cam.x-30||b.x>cam.x+VW+30||b.y<cam.y-30||b.y>cam.y+VH+30)continue;
    if(b.kind==='ink'){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.globalCompositeOperation='source-over';ctx.fillStyle='#0a0a0a';ctx.beginPath();ctx.ellipse(0,0,11,6,0,0,TAU);ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();ctx.restore();ctx.globalCompositeOperation='lighter';continue;}
    if(b.kind==='acid'){const g=ctx.createRadialGradient(b.x,b.y,1,b.x,b.y,b.r*2.2);g.addColorStop(0,'rgba(240,255,220,1)');g.addColorStop(.45,'rgba(124,255,58,.85)');g.addColorStop(1,'rgba(60,200,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r*2.2,0,TAU);ctx.fill();continue;}
    if(b.kind==='plasma'){const g=ctx.createRadialGradient(b.x,b.y,1,b.x,b.y,b.r*2.2);g.addColorStop(0,'rgba(255,240,245,1)');g.addColorStop(.4,'rgba(255,32,80,.85)');g.addColorStop(1,'rgba(255,32,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r*2.2,0,TAU);ctx.fill();continue;}
    if(b.kind==='ice'){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.fillStyle='rgba(120,220,255,.35)';ctx.beginPath();ctx.ellipse(-6,0,16,7,0,0,TAU);ctx.fill();
      ctx.fillStyle='#e9fbff';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(0,5);ctx.lineTo(-10,0);ctx.lineTo(0,-5);ctx.closePath();ctx.fill();ctx.restore();continue;}
    const c=b.kind==='fire'?['rgba(255,245,190,1)','rgba(255,130,20,.75)','rgba(255,60,0,0)']:['rgba(255,220,255,1)','rgba(184,110,255,.75)','rgba(120,40,220,0)'];
    const g=ctx.createRadialGradient(b.x,b.y,1,b.x,b.y,b.r*2);g.addColorStop(0,c[0]);g.addColorStop(.45,c[1]);g.addColorStop(1,c[2]);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r*2,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function drawShieldFX(){
  if(!P)return;
  if(P.slowT>0&&state==='play'){ctx.save();ctx.strokeStyle='rgba(143,243,255,.6)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(P.x,P.y+2,26,10,0,0,TAU);ctx.stroke();ctx.restore();}
  if(abil.shieldT<=0)return;
  const k=Math.min(1,abil.shieldT/0.4),R=ABIL.shield.radius*(1+0.03*Math.sin(uiT*9)),cy=P.y-34;
  ctx.save();ctx.globalAlpha=k*(abil.shieldT<1.2&&Math.floor(uiT*10)%2===0?0.4:1);
  const g=ctx.createRadialGradient(P.x,cy,R*0.55,P.x,cy,R);g.addColorStop(0,'rgba(143,243,255,0)');g.addColorStop(.85,'rgba(143,243,255,.22)');g.addColorStop(1,'rgba(233,251,255,.55)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(P.x,cy,R,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(233,251,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,cy,R,0,TAU);ctx.stroke();
  ctx.strokeStyle='rgba(143,243,255,.5)';ctx.beginPath();for(let i=0;i<6;i++){const a=uiT*0.8+i/6*TAU;ctx.moveTo(P.x+Math.cos(a)*R*0.6,cy+Math.sin(a)*R*0.6);ctx.lineTo(P.x+Math.cos(a)*R,cy+Math.sin(a)*R);}ctx.stroke();
  ctx.restore();
}
function drawWeather(){
  if(curPhase===1||curPhase===4)return;
  const n=curPhase===2?55:90;
  while(weather.length<n)weather.push({x:Math.random()*VW,y:Math.random()*VH,s:0.4+Math.random(),o:Math.random()*6});
  ctx.save();
  for(const w of weather){
    if(curPhase===2){w.y-=(18+30*w.s)*0.016;w.x+=Math.sin(uiT+w.o)*0.3;if(w.y<-5){w.y=VH+5;w.x=Math.random()*VW;}
      ctx.fillStyle='rgba(255,'+(120+Math.floor(80*w.s))+',40,'+(0.35+0.4*Math.abs(Math.sin(uiT*3+w.o)))+')';ctx.fillRect(w.x,w.y,2*w.s+1,2*w.s+1);}
    else{w.y+=(25+40*w.s)*0.016;w.x+=Math.sin(uiT*0.8+w.o)*0.5-0.2;if(w.y>VH+5){w.y=-5;w.x=Math.random()*VW;}if(w.x<-5)w.x=VW+5;
      ctx.fillStyle='rgba(235,248,255,'+(0.35+0.4*w.s)+')';ctx.beginPath();ctx.arc(w.x,w.y,1+1.6*w.s,0,TAU);ctx.fill();}
  }
  ctx.restore();
}
function drawBossBar(){
  if(bossBanner>0&&boss){
    const a=Math.min(1,bossBanner*1.5,(2.8-bossBanner)*3);ctx.save();ctx.globalAlpha=a;
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,VH/2-70,VW,120);
    ctx.textAlign='center';ctx.fillStyle=boss.t.color;ctx.shadowColor=boss.t.color;ctx.shadowBlur=20;ctx.font='bold 54px system-ui,Arial';ctx.fillText(boss.t.name,VW/2,VH/2);
    ctx.shadowBlur=0;ctx.fillStyle='#f2f2f2';ctx.font='italic 20px Georgia,serif';ctx.fillText(boss.t.title,VW/2,VH/2+32);ctx.restore();
  }
  if(!boss||boss.dead||!boss.awake)return;
  const w=400,h=14,x=VW/2-w/2,y=VH-120,r=Math.max(0,boss.hp/boss.maxHp),rg=Math.max(0,boss.hpG/boss.maxHp);
  ctx.save();ctx.fillStyle='rgba(5,6,14,.82)';ctx.fillRect(x-6,y-24,w+12,h+32);
  ctx.strokeStyle=boss.t.color;ctx.lineWidth=2;ctx.shadowColor=boss.t.color;ctx.shadowBlur=10;ctx.strokeRect(x-6,y-24,w+12,h+32);ctx.shadowBlur=0;
  ctx.font='bold 13px system-ui,Arial';ctx.textAlign='left';ctx.fillStyle=boss.t.color;ctx.fillText(boss.t.name,x,y-8);
  ctx.textAlign='right';ctx.fillStyle='#cfd6e6';ctx.font='12px system-ui,Arial';ctx.fillText(boss.rage?'FÚRIA!':boss.t.title,x+w,y-8);
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x,y,w,h);
  ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(x,y,w*rg,h);
  const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,boss.rage?'#ff3b3b':boss.t.color);g.addColorStop(1,'#ffffff');ctx.fillStyle=g;ctx.fillRect(x,y,w*r,h);
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x+w/2-1,y,2,h);
  if(boss.stun>0){ctx.textAlign='center';ctx.fillStyle='#ffd34e';ctx.font='bold 12px system-ui';ctx.fillText('ATORDOADO — DANO EM DOBRO',VW/2,y+h+12);}
  ctx.restore();
}

/* ---------- Ícones das habilidades novas (computador) ---------- */
const AICON={dash:{x:24,y:VH-288,s:64},shield:{x:24,y:VH-376,s:64},ally:{x:108,y:VH-112,s:64},weapon:{x:108,y:VH-200,s:64}};
function overAbil(k){if(touchDevice)return false;if(k==='dash'&&!hasDash())return false;if(k==='shield'&&!hasShield())return false;if(k==='ally'&&!hasAlly())return false;if(k==='weapon'&&!wpn.owned)return false;
  const I=AICON[k],cx=I.x+I.s/2,cy=I.y+I.s/2;return Math.hypot(mouse.x-cx,mouse.y-cy)<=I.s/2;}
function drawAbilIcon(k,label,key,cd,max,deny,col,glyph){
  const I=AICON[k],cx=I.x+I.s/2,cy=I.y+I.s/2,s=I.s,ready=cd<=0;
  ctx.save();if(deny>0)ctx.translate(Math.sin(deny*70)*3,0);
  ctx.beginPath();ctx.arc(cx,cy,s/2,0,TAU);ctx.fillStyle='#070b16';ctx.fill();
  glyph(cx,cy,ready);
  if(!ready){ctx.save();ctx.beginPath();ctx.arc(cx,cy,s/2,0,TAU);ctx.clip();ctx.fillStyle='rgba(0,0,0,.66)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,s/2,-Math.PI/2,-Math.PI/2+TAU*(cd/max));ctx.closePath();ctx.fill();ctx.restore();
    ctx.fillStyle='#fff';ctx.font='bold 22px system-ui,Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(Math.ceil(cd),cx,cy);ctx.textBaseline='alphabetic';}
  ctx.beginPath();ctx.arc(cx,cy,s/2-1,0,TAU);ctx.strokeStyle=deny>0?'#ff3b6b':ready?col:'#68738d';ctx.shadowColor=col;ctx.shadowBlur=ready?10+6*Math.sin(uiT*4):0;ctx.lineWidth=2.5;ctx.stroke();ctx.shadowBlur=0;
  ctx.beginPath();ctx.arc(I.x+s-9,I.y+s-8,10,0,TAU);ctx.fillStyle='#050a18';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=col;ctx.font='bold 9px system-ui,Arial';ctx.textAlign='center';ctx.fillText(key,I.x+s-9,I.y+s-5);
  ctx.fillStyle=ready?col:'#6c7190';ctx.font='bold 10px system-ui,Arial';ctx.fillText(label,cx,I.y+s+14);
  ctx.restore();
  if(Math.hypot(mouse.x-cx,mouse.y-cy)<=s/2)cv.style.cursor='pointer';
}
function drawAbilityIcons(){
  if(hasDash())drawAbilIcon('dash','DASH','⇧',abil.dashCd,ABIL.dash.cd,abil.deny,'#ff8a1f',(cx,cy)=>{
    ctx.save();ctx.translate(cx,cy);const g=ctx.createLinearGradient(-20,0,20,0);g.addColorStop(0,'rgba(255,60,0,0)');g.addColorStop(1,'#ffd34e');
    ctx.fillStyle=g;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-22+i*8,-14+i*4);ctx.lineTo(18,0);ctx.lineTo(-22+i*8,14-i*4);ctx.lineTo(-10+i*8,0);ctx.closePath();ctx.fill();}ctx.restore();});
  if(hasShield())drawAbilIcon('shield','ESCUDO','F',abil.shieldCd,ABIL.shield.cd,abil.sdeny,'#8ff3ff',(cx,cy)=>{
    ctx.save();ctx.translate(cx,cy);const g=ctx.createRadialGradient(0,0,4,0,0,22);g.addColorStop(0,'rgba(233,251,255,.9)');g.addColorStop(1,'rgba(90,170,230,.25)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(17,-11);ctx.lineTo(14,10);ctx.lineTo(0,21);ctx.lineTo(-14,10);ctx.lineTo(-17,-11);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#e9fbff';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,12);ctx.moveTo(-9,-6);ctx.lineTo(9,6);ctx.moveTo(9,-6);ctx.lineTo(-9,6);ctx.stroke();ctx.restore();});
  if(hasAlly())drawAbilIcon('ally','ECO','V',abil.allyCd,15,abil.adeny,'#ffd34e',(cx,cy)=>{
    ctx.save();ctx.translate(cx,cy);for(const [o,c] of[[-5,'rgba(255,59,208,.8)'],[5,'rgba(0,229,255,.8)'],[0,'#ffd34e']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(o,-8,8,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(o-12,18);ctx.quadraticCurveTo(o,-6,o+12,18);ctx.closePath();ctx.fill();}ctx.restore();});
  if(wpn.owned){const W=WPN[curPhase];drawAbilIcon('weapon','ARMA','G',wpn.cd,W.cd,wpn.deny,W.col,(cx,cy)=>{
    ctx.save();ctx.translate(cx,cy);ctx.fillStyle=W.col;ctx.shadowColor=W.col;ctx.shadowBlur=wpn.cd<=0?12:0;ctx.font='bold 30px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',0,1);ctx.restore();});
    if(wpn.cd<=0&&wpn.act<=0&&wpn.charge<=0){ctx.save();ctx.globalAlpha=0.5+0.5*Math.sin(uiT*6);ctx.strokeStyle=W.col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(AICON.weapon.x+32,AICON.weapon.y+32,38,0,TAU);ctx.stroke();ctx.restore();}}
}
function aimMsgY(){return boss&&boss.awake&&!boss.dead?34:34;}
function drawTouchHints(){
  const msg=skill.aiming?'Toque e arraste no alvo · solte para lançar · toque em SOBRECARGA para cancelar':pAim?'Toque onde o portal deve abrir · toque em PORTAL para cancelar':'';
  if(!msg)return;
  ctx.save();ctx.textAlign='center';ctx.font='bold 15px system-ui,Arial';ctx.fillStyle='rgba(0,0,0,.6)';
  const w=ctx.measureText(msg).width+30;ctx.fillRect(VW/2-w/2,74,w,28);
  ctx.fillStyle=skill.aiming?'#ffd34e':'#9dff4d';ctx.fillText(msg,VW/2,93);ctx.restore();
}

/* ---------- Telas de estado (pausa, derrota, vitória) ---------- */
function drawStateOverlay(){
  if(!(paused||state!=='play'))return;
  if(state==='win'&&(ptravel||endingDelay>0)){
    if(endingDelay>0){ctx.save();ctx.textAlign='center';ctx.fillStyle='#e9fbff';ctx.shadowColor='#b88cff';ctx.shadowBlur=20;ctx.font='bold 46px system-ui,Arial';ctx.fillText(curPhase===4?'A FENDA SE FECHA…':'O VÉU SE DESFAZ…',VW/2,VH/2-120);ctx.restore();}
    return;
  }
  ctx.fillStyle='rgba(2,4,12,.72)';ctx.fillRect(0,0,VW,VH);ctx.textAlign='center';ctx.shadowBlur=18;
  const sub=(t)=>{ctx.shadowBlur=0;ctx.font='16px system-ui,Arial';ctx.fillStyle='#cfeaff';ctx.fillText(t,VW/2,VH/2+36);};
  if(paused&&state==='play'){ctx.fillStyle='#00e5ff';ctx.shadowColor='#00e5ff';ctx.font='bold 44px system-ui,Arial';ctx.fillText('PAUSADO',VW/2,VH/2);
    sub(touchDevice?'Toque na tela para continuar':'Pressione P (ou clique) para continuar');}
  else if(state==='dead'){ctx.fillStyle='#ff3b6b';ctx.shadowColor='#ff3b6b';ctx.font='bold 48px system-ui,Arial';ctx.fillText('SISTEMA COMPROMETIDO',VW/2,VH/2);
    sub(touchDevice?'Toque na tela para tentar novamente':'Pressione R, Enter ou clique para tentar novamente');}
  else if(state==='win'){ctx.fillStyle='#00ff9c';ctx.shadowColor='#00ff9c';ctx.font='bold 48px system-ui,Arial';ctx.fillText('ÁREA LIMPA',VW/2,VH/2);
    if(curPhase<3){sub('Fase '+(curPhase+1)+' — '+PHASE_DEF[curPhase+1].name+' liberada!');ctx.fillStyle='#ffd34e';ctx.font='bold 17px system-ui,Arial';
      ctx.fillText(touchDevice?'Toque na tela para viajar pelo portal':'Enter ou clique: viajar para a próxima fase · R: jogar esta fase de novo',VW/2,VH/2+66);}
    else sub(touchDevice?'Toque na tela para jogar de novo':'Pressione R para jogar de novo');}
  ctx.shadowBlur=0;
}

/* ---------- Cartão de apresentação de cada fase ---------- */
const pcard={on:false,id:1,t:0};
function showPhaseCard(id){pcard.on=true;pcard.id=id;pcard.t=0;lastCardPhase=id;mouse.down=false;mobileFire=false;}
function closeCard(){if(!pcard.on||pcard.t<0.35)return;pcard.on=false;sfx('select');}
function wrapText(txt,x,y,maxW,lh){const words=txt.split(' ');let line='',yy=y;for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line,x,yy);line=w;yy+=lh;}else line=t;}if(line)ctx.fillText(line,x,yy);return yy;}
function drawPhaseCard(){
  const D=PHASE_DEF[pcard.id],C=D.card,k=Math.min(1,pcard.t*3);
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle='rgba(2,4,12,'+(0.78*k)+')';ctx.fillRect(0,0,VW,VH);
  ctx.globalAlpha=k;ctx.translate(0,(1-k)*20);
  const w=760,h=430,x=VW/2-w/2,y=VH/2-h/2;
  ctx.fillStyle='rgba(8,12,24,.95)';rrect(x,y,w,h,14);ctx.fill();ctx.strokeStyle=D.color;ctx.lineWidth=2.5;ctx.shadowColor=D.color;ctx.shadowBlur=18;ctx.stroke();ctx.shadowBlur=0;
  ctx.textAlign='center';ctx.fillStyle=D.color;ctx.font='bold 15px system-ui,Arial';ctx.fillText('FASE '+pcard.id+' DE 4',VW/2,y+38);
  ctx.fillStyle='#ffffff';ctx.font='bold 40px '+MENU_FONT;ctx.fillText(D.name.toUpperCase(),VW/2,y+84);
  ctx.fillStyle='#cfd8ea';ctx.font='italic 16px Georgia,serif';ctx.fillText(C.lead,VW/2,y+114);
  ctx.textAlign='left';const lx=x+44,mw=w-88;let yy=y+156;
  const row=(lab,txt,col)=>{ctx.fillStyle=col;ctx.font='bold 13px system-ui,Arial';ctx.fillText(lab,lx,yy);ctx.fillStyle='#eef3ff';ctx.font='15px system-ui,Arial';yy=wrapText(txt,lx+108,yy,mw-108,20)+30;};
  const W=WPN[pcard.id];row('OBJETIVO',C.goal,'#ffd34e');row('INIMIGOS',C.foes,'#ff7a7a');row('CHEFE',PHASE_BOSS_TXT[pcard.id],'#ff3b6b');
  row('ARMA FINAL',W.name+' — '+W.desc+'. Aparece quando os malwares acabam ('+(touchDevice?'botão ARMA':'tecla G')+').',W.col);row('HABILIDADE',touchDevice?C.abilityTouch:C.ability,D.color);
  ctx.textAlign='center';const p=0.6+0.4*Math.sin(uiT*4);ctx.globalAlpha=k*(pcard.t>0.35?p:0.3);ctx.fillStyle='#ffffff';ctx.font='bold 17px system-ui,Arial';
  ctx.fillText(touchDevice?'Toque na tela para começar':'Clique ou pressione qualquer tecla para começar',VW/2,y+h-22);
  ctx.restore();
}

/* ---------- História (abertura e final) ---------- */
const STORY={
  intro:[
    {scene:'old',title:'2069 — O MUNDO DE ANTES',text:'Há trinta anos, o céu ainda era azul. Cidades limpas, florestas e mares calmos. Ninguém prestava atenção nos vulcões adormecidos.'},
    {scene:'quake',title:'14 DE MARÇO DE 2071 — O DESPERTAR',text:'Sem aviso, a Terra acordou. Um terremoto nunca visto rachou os continentes, e cidades inteiras vieram abaixo em poucos minutos.'},
    {scene:'eruption',title:'A FÚRIA DOS VULCÕES',text:'Os vulcões explodiram ao mesmo tempo. Rios de lava engoliram o sul, e uma nuvem de cinzas do tamanho de um continente apagou o sol.'},
    {scene:'winter',title:'O INVERNO DE CINZAS',text:'Sem luz, o norte congelou. Por anos caíram cinza e neve sem parar. Metade da humanidade se perdeu entre o fogo e o gelo.'},
    {scene:'neon',title:'NEO-AKARI — A ÚLTIMA CIDADE',text:'Os sobreviventes ergueram Neo-Akari sob cúpulas de luz. A lava do sul gera a energia, o gelo do norte resfria os servidores, e tudo é controlado pela inteligência artificial NÚCLEO.'},
    {scene:'virus',title:'2099 — O VÉU',text:'Até que a hacker VEXX invadiu o Núcleo e liberou o VÉU, um vírus que transforma qualquer máquina em MALWARE. A cidade passou a caçar os próprios moradores.'},
    {scene:'hero',title:'KAYZEN RYUU',text:'Ex-agente da divisão Ryuu, Kayzen sobreviveu ao ataque com seu canhão de plasma, a energia SOBRECARGA e um dispositivo capaz de abrir portais.'},
    {scene:'map',title:'A MISSÃO',text:'Limpe o Distrito Neon, atravesse a Fundição Rubra nos campos de lava e desça até a Cripta Glacial, no norte congelado, onde Vexx protege o coração do Núcleo.'},
    {scene:'title',title:'',text:'Reinicie o Núcleo. Salve Neo-Akari.',final:true}
  ],
  end:[
    {scene:'restore',title:'VEXX DERROTADA',text:'Sem a sua criadora, o Véu se desfaz. Kayzen alcança o coração do Núcleo e começa a reinicialização.'},
    {scene:'dawn',title:'O PRIMEIRO AMANHECER',text:'Pela primeira vez desde o Despertar, um raio de sol atravessa as cinzas. Mas, no fundo do código, um sinal desconhecido continua piscando…'},
    {scene:'rift',title:'A FENDA',text:'O sinal era a última armadilha de Vexx. A realidade se rasga sobre Neo-Akari, e por ela atravessam outras versões de Kayzen, vindas de universos que ninguém imaginava existir.'},
    {scene:'title',title:'FIM DO CAPÍTULO 1',text:'Capítulo 2 liberado: a Fenda do Multiverso.',final:true,end:true}
  ],
  end2:[
    {scene:'mended',title:'O MULTIVERSO EM PAZ',text:'Kayzen Ômega cai, e cada eco volta para o seu próprio universo. Antes de partir, o Eco Gibi acena: "a gente se vê por aí, parceiro".'},
    {scene:'dawn',title:'NEO-AKARI, MANHÃ',text:'A Fenda se fecha. Mas agora Kayzen sabe: existem infinitos mundos lá fora — e alguns deles ainda precisam de ajuda.'},
    {scene:'title',title:'FIM DO CAPÍTULO 2',text:'Obrigado por jogar! Você completou as quatro fases.',final:true,end:true}
  ]
};
function drawCredits(y,size,align,x){ctx.save();ctx.textAlign=align||'center';ctx.font='italic '+(size||14)+'px Georgia,"Times New Roman",serif';ctx.fillStyle='rgba(235,242,255,.92)';ctx.shadowColor='#000';ctx.shadowBlur=6;
  ctx.fillText('Criadores: Luis Henrique e Marcos',x==null?VW/2:x,y);ctx.font='italic '+Math.round((size||14)*0.86)+'px Georgia,"Times New Roman",serif';ctx.fillStyle='rgba(141,245,255,.85)';ctx.fillText('Projeto exclusivo de Luis Henrique e Marcos Thz',x==null?VW/2:x,y+Math.round((size||14)*1.25));ctx.restore();}
const intro={on:false,gate:false,set:'intro',slide:0,t:0,pt:0,chars:0,btns:[],key:'',parts:[],fired:'',seed:1};
function startStory(set,gate){
  intro.on=true;intro.gate=!!gate;intro.set=set;intro.slide=0;intro.t=0;intro.pt=0;intro.chars=0;intro.btns=[];intro.fired='';intro.key='';
  paused=false;skill.aiming=false;pAim=false;pmenu.open=false;mouse.down=false;mobileFire=false;stopWeaponReloadAudio();
}
function openGate(){if(!intro.gate)return;audioInit();unlockMobileAudio();narrUnlock();intro.gate=false;intro.t=0;intro.pt=0;intro.fired='';sfx('select');}
function curSlide(){return STORY[intro.set][intro.slide];}
function goSlide(i){narrStop();intro.slide=i;intro.t=0;intro.pt=0;intro.chars=0;}
function storyNext(){
  const s=curSlide();
  if(intro.chars<s.text.length){intro.chars=s.text.length;return;}
  if(!s.final){goSlide(intro.slide+1);sfx('select');}
}
function storySkip(){const L=STORY[intro.set].length-1;if(intro.slide!==L)goSlide(L);else intro.chars=curSlide().text.length;}
function finishStory(choice){
  intro.on=false;iaStopAll(0.8);narrStop();sfx('select');lastCardPhase=0;
  if(intro.set==='end'||intro.set==='end2'){startPhase(choice==='phase4'?4:1);return;}
  startPhase(choice==='continue'?unlocked:1);
}
function storyTap(){
  if(intro.gate){openGate();return;}
  for(const b of intro.btns)if(mouse.x>=b.x&&mouse.x<=b.x+b.w&&mouse.y>=b.y&&mouse.y<=b.y+b.h){b.act();return;}
  if(!curSlide().final)storyNext();else if(intro.chars<curSlide().text.length)intro.chars=curSlide().text.length;
}
function updateIntro(dt){
  intro.t+=dt;if(intro.gate)return;
  const s=curSlide(),before=Math.floor(intro.chars);
  const k=intro.set+':'+intro.slide;if(intro.fired!==k){intro.fired=k;sceneAudio(s.scene);narrate(s);}
  intro.chars=Math.min(s.text.length,intro.chars+dt*(NARR.speaking?16:40));
  if(NARR.autoAt&&intro.t>=NARR.autoAt&&NARR.slideKey===k){NARR.autoAt=0;if(!s.final&&intro.chars>=s.text.length)storyNext();}
  if(Math.floor(intro.chars)>before&&Math.floor(intro.chars)%3===0&&s.text[Math.floor(intro.chars)-1]!==' ')sfx('tick');
}

/* ---------- Trilha e efeitos da abertura (sintetizados, sem arquivos externos) ---------- */
const IA={nodes:[],bus:null,nbuf:null,timers:[]};
function iaReady(){if(!actx||muted)return false;if(actx.state==='suspended'){try{actx.resume();}catch(_){}}
  if(!IA.bus){IA.bus=actx.createGain();IA.bus.gain.value=1.2;IA.bus.connect(master);}return true;}
function iaNoiseBuf(){if(IA.nbuf)return IA.nbuf;const n=actx.sampleRate*2,b=actx.createBuffer(1,n,actx.sampleRate),d=b.getChannelData(0);let last=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=w*0.6+last*3;}IA.nbuf=b;return b;}
function iaStopAll(fade){
  IA.timers.forEach(clearTimeout);IA.timers=[];
  if(!actx){IA.nodes=[];return;}
  const t=actx.currentTime,f=fade==null?0.6:fade;
  for(const n of IA.nodes){try{n.g.gain.cancelScheduledValues(t);n.g.gain.setValueAtTime(n.g.gain.value,t);n.g.gain.linearRampToValueAtTime(0.0001,t+f);n.stop.forEach(s=>s.stop(t+f+0.05));}catch(_){}}
  IA.nodes=[];
}
function iaAt(sec,fn){IA.timers.push(setTimeout(()=>{if(intro.on&&!intro.gate&&!paused)try{fn();}catch(_){}},sec*1000));}
// ruído contínuo filtrado (vento, tremor, lava) com oscilação lenta
function iaNoise(vol,type,freq,q,lfoRate,lfoDepth,attack){
  if(!iaReady())return;const t=actx.currentTime;
  const s=actx.createBufferSource();s.buffer=iaNoiseBuf();s.loop=true;
  const f=actx.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q||0.7;
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(attack||1));
  s.connect(f);f.connect(g);g.connect(IA.bus);s.start(t);const stop=[s];
  if(lfoRate){const l=actx.createOscillator(),lg=actx.createGain();l.frequency.value=lfoRate;lg.gain.value=lfoDepth;l.connect(lg);lg.connect(f.frequency);l.start(t);stop.push(l);
    const l2=actx.createOscillator(),lg2=actx.createGain();l2.frequency.value=lfoRate*0.63;lg2.gain.value=vol*0.45;l2.connect(lg2);lg2.connect(g.gain);l2.start(t);stop.push(l2);}
  IA.nodes.push({g,stop});
}
// nota sustentada (trilha)
function iaPad(freqs,type,vol,cut,attack){
  if(!iaReady())return;const t=actx.currentTime;
  const f=actx.createBiquadFilter();f.type='lowpass';f.frequency.value=cut||900;
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(attack||1.6));f.connect(g);g.connect(IA.bus);
  const stop=[];
  freqs.forEach((fr,i)=>{for(const dt of[-4,4]){const o=actx.createOscillator();o.type=type||'sine';o.frequency.value=fr;o.detune.value=dt+i;o.connect(f);o.start(t);stop.push(o);}});
  const l=actx.createOscillator(),lg=actx.createGain();l.frequency.value=0.15;lg.gain.value=(cut||900)*0.35;l.connect(lg);lg.connect(f.frequency);l.start(t);stop.push(l);
  IA.nodes.push({g,stop});
}
// sirene que sobe e desce
function iaSiren(vol,lo,hi,rate,delay){
  if(!iaReady())return;const t=actx.currentTime+(delay||0);
  const o=actx.createOscillator();o.type='sawtooth';o.frequency.value=(lo+hi)/2;
  const l=actx.createOscillator(),lg=actx.createGain();l.frequency.value=rate;lg.gain.value=(hi-lo)/2;l.connect(lg);lg.connect(o.frequency);
  const f=actx.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=1.2;
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+1.2);
  o.connect(f);f.connect(g);g.connect(IA.bus);o.start(t);l.start(t);IA.nodes.push({g,stop:[o,l]});
}
function iaBoom(v){sv=1;noiseBurst(1.6,0.9*v,2600,35);tone('sine',95,22,1.6,0.9*v);tone('sawtooth',420,40,0.8,0.25*v);}
function iaCrack(v){sv=1;noiseBurst(0.35,0.7*v,6000,300);tone('square',180,60,0.25,0.25*v);}
function iaHeart(){sv=1;tone('sine',62,40,0.18,0.55);tone('sine',58,36,0.2,0.45,0.22);}
function sceneAudio(sc){
  if(!actx)return;
  iaStopAll(0.9);
  switch(sc){
    case 'old':
      iaPad([261.6,329.6,392,523.3],'sine',0.05,1400,2);iaNoise(0.035,'highpass',2500,0.5,0.08,800,2);   // brisa
      for(let i=0;i<7;i++)iaAt(0.6+i*0.9+Math.random()*0.5,()=>{sv=1;const f=2400+Math.random()*900;tone('sine',f,f*1.35,0.09,0.06);tone('sine',f*1.2,f*0.9,0.08,0.05,0.1);});   // pássaros
      break;
    case 'quake':
      iaNoise(0.55,'lowpass',90,1,0.9,40,0.5);iaNoise(0.18,'lowpass',260,1,1.7,120,1.2);
      iaPad([110,116.5],'sawtooth',0.035,420,2.5);
      [0.35,1.1,1.9,2.6,3.4,4.3,5.2].forEach((s,i)=>iaAt(s,()=>iaCrack(0.7+0.3*Math.random())));
      iaAt(2.2,()=>iaBoom(0.6));iaSiren(0.06,520,860,0.35,1.8);
      break;
    case 'eruption':
      iaAt(0.15,()=>iaBoom(1.1));iaAt(1.8,()=>iaBoom(0.7));iaAt(3.6,()=>iaBoom(0.85));iaAt(5.4,()=>iaBoom(0.6));
      iaNoise(0.5,'lowpass',70,1,0.6,30,0.3);iaNoise(0.12,'bandpass',3200,0.8,2.3,1200,1.5);   // tremor + lava chiando
      iaPad([73.4,77.8,110],'sawtooth',0.04,380,2);
      for(let i=0;i<6;i++)iaAt(1+i*0.8,()=>{sv=1;tone('sawtooth',300+Math.random()*200,60,0.6,0.08);noiseBurst(0.5,0.12,4000,500);});   // bolas de fogo
      break;
    case 'winter':
      iaNoise(0.32,'bandpass',420,1.1,0.13,260,1.5);iaNoise(0.12,'bandpass',1300,2,0.21,500,2);   // vento
      iaPad([220,261.6,329.6],'triangle',0.04,900,3);
      [1.4,3.1,4.7].forEach(s=>iaAt(s,()=>{sv=1;tone('triangle',2200,900,0.18,0.08);tone('sine',3200,1800,0.12,0.05,0.03);}));   // gelo trincando
      break;
    case 'neon':
      iaPad([196,293.7,392,493.9],'sine',0.045,1500,1.5);iaNoise(0.04,'bandpass',120,4,0.5,20,1);
      sv=1;tone('sawtooth',55,440,1.6,0.12);
      [0.8,1.0,1.2,1.4,2.0,2.2,2.4,2.6,3.2,3.4,3.6,3.8].forEach((s,i)=>iaAt(s,()=>{sv=1;const n=[392,493.9,587.3,784][i%4];tone('triangle',n,n,0.16,0.07);}));
      break;
    case 'virus':
      iaPad([138.6,146.8],'sawtooth',0.04,600,1);iaSiren(0.08,640,980,1.4,0.4);
      for(let i=0;i<10;i++)iaAt(0.3+i*0.55+Math.random()*0.3,()=>{sv=1;tone('square',200+Math.random()*1400,80+Math.random()*300,0.07,0.08);noiseBurst(0.08,0.14,8000,1500);});
      break;
    case 'hero':
      iaPad([146.8,220,293.7],'sine',0.05,1100,2);iaNoise(0.07,'bandpass',300,3,0.7,120,1.5);   // zumbido do portal
      for(let i=0;i<7;i++)iaAt(0.4+i*1.0,iaHeart);
      break;
    case 'map':
      iaPad([164.8,246.9,329.6],'sine',0.045,1200,1.5);
      [0.05,0.55,1.05].forEach((s,i)=>iaAt(s,()=>{sv=1;const f=[523.3,659.3,784][i];tone('sine',f,f,0.35,0.12);tone('triangle',f*2,f*2,0.2,0.05,0.02);}));
      break;
    case 'title':
      sv=1;tone('sawtooth',40,900,1.2,0.07);noiseBurst(1.2,0.25,300,6000);
      iaAt(1.15,()=>{iaBoom(0.8);sv=1;[130.8,196,261.6,329.6].forEach(f=>tone('triangle',f,f,2.2,0.12));});
      iaPad([130.8,196,261.6],'sine',0.04,1000,3);
      break;
    case 'restore':
      iaPad([146.8,174.6],'sawtooth',0.035,500,1);
      [0.3,0.8,1.2].forEach(s=>iaAt(s,()=>{sv=1;tone('square',300+Math.random()*900,80,0.08,0.08);noiseBurst(0.08,0.12,7000,1200);}));
      iaAt(1.6,()=>{sv=1;tone('sine',110,880,1.2,0.16);});iaAt(2.6,()=>iaPad([261.6,329.6,392],'sine',0.05,1500,2));
      break;
    case 'rift':
      iaNoise(0.4,'lowpass',80,1,0.7,40,0.4);iaPad([116.5,123.5,155.6],'sawtooth',0.04,700,1.5);
      sv=1;tone('sawtooth',60,900,1.4,0.12);noiseBurst(1.4,0.35,300,7000);
      for(let i=0;i<9;i++)iaAt(0.4+i*0.6+Math.random()*0.3,()=>{sv=1;tone('square',300+Math.random()*1500,100,0.07,0.08);noiseBurst(0.07,0.14,8000,1500);});
      iaAt(1.5,()=>iaBoom(0.8));
      break;
    case 'mended':
      iaPad([261.6,329.6,392,523.3],'triangle',0.05,1600,1.5);
      [0.2,0.5,0.8,1.1,1.6,2.1].forEach((s,i)=>iaAt(s,()=>{sv=1;const f=[523.3,659.3,784,1046.5,784,1046.5][i];tone('sine',f,f,0.4,0.1);}));
      break;
    case 'dawn':
      iaPad([261.6,329.6,392,493.9],'sine',0.055,1800,2.5);iaNoise(0.03,'highpass',2500,0.5,0.08,800,3);
      [1,2.4,3.6].forEach(s=>iaAt(s,()=>{sv=1;const f=2600+Math.random()*700;tone('sine',f,f*1.3,0.09,0.05);}));
      break;
  }
}

/* ---------- Cenários da abertura (desenhados com código) ---------- */
let skyCache=null;
function skyline(){
  if(skyCache)return skyCache;
  const c=document.createElement('canvas');c.width=Math.round(VW*DPR);c.height=Math.round(VH*DPR);const g=c.getContext('2d'),R=rng(4242);g.scale(DPR,DPR);
  for(let layer=0;layer<3;layer++){
    const base=VH*(0.52+layer*0.1),col=['#0d1430','#0a0f24','#060915'][layer];
    let x=-20;while(x<VW+20){const w=30+R()*70,h=60+R()*(220-layer*50);g.fillStyle=col;g.fillRect(x,base-h,w,h+VH);
      for(let yy=base-h+8;yy<base-6;yy+=10)for(let xx=x+5;xx<x+w-6;xx+=9)if(R()<0.33){g.fillStyle=R()<.7?'rgba(120,220,255,'+(0.25+layer*0.15)+')':'rgba(255,90,200,.35)';g.fillRect(xx,yy,4,5);}
      if(R()<0.25&&layer>0){g.fillStyle=R()<.5?'#ff3bd0':'#00e5ff';g.fillRect(x+6,base-h+14,Math.min(36,w-12),4);}
      x+=w+2+R()*8;}
  }
  skyCache=c;return c;
}
function drawSky(){ctx.drawImage(skyline(),0,0,VW,VH);}
function sceneBG(top,bot){const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(-30,-30,VW+60,VH+60);}
function lerpC(a,b,k){const pa=a.match(/\w\w/g).map(h=>parseInt(h,16)),pb=b.match(/\w\w/g).map(h=>parseInt(h,16));return'rgb('+pa.map((v,i)=>Math.round(v+(pb[i]-v)*k)).join(',')+')';}
function rain(n,col){ctx.save();ctx.strokeStyle=col||'rgba(160,210,255,.25)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<n;i++){const x=(i*97.3+intro.t*240*(1+(i%3)*0.3))%(VW+60)-30,y=(i*53.7+intro.t*620*(1+(i%5)*0.1))%(VH+40)-20;ctx.moveTo(x,y);ctx.lineTo(x-6,y+16);}ctx.stroke();ctx.restore();}
// cidade "do mundo antigo"
const OLDCITY=(()=>{const R=rng(777),a=[];let x=390;while(x<VW+40){const w=36+R()*46,h=90+R()*190;a.push({x,w,h,fall:R()<0.6,dir:R()<.5?-1:1,at:0.6+R()*3.2,seed:R()});x+=w+6+R()*14;}return a;})();
function drawOldCity(t,k,dark){   // k: 0 = intacta, >0 = desabando
  const base=VH*0.65;
  for(const b of OLDCITY){
    let ang=0,drop=0;
    if(k>0&&b.fall){const f=Math.max(0,t-b.at);ang=Math.min(1.1,f*f*0.35)*b.dir;drop=Math.min(b.h*0.55,f*f*30);}
    ctx.save();ctx.translate(b.x+b.w/2,base+drop);ctx.rotate(ang);
    const g=ctx.createLinearGradient(-b.w/2,0,b.w/2,0);
    g.addColorStop(0,lerpC('dfe9f2','3a3330',dark));g.addColorStop(1,lerpC('9fb4c8','1e1a19',dark));
    ctx.fillStyle=g;ctx.fillRect(-b.w/2,-b.h,b.w,b.h);
    for(let yy=-b.h+10;yy<-10;yy+=14)for(let xx=-b.w/2+6;xx<b.w/2-8;xx+=11){ctx.fillStyle=dark>0.5?((xx*7+yy)%5===0?'rgba(255,150,60,.75)':'rgba(20,16,15,.7)'):'rgba(120,170,215,.55)';ctx.fillRect(xx,yy,6,8);}
    ctx.restore();
  }
}
function drawVolcano(x,base,w,h,col,glow){
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w/2,base);ctx.lineTo(x-w*0.09,base-h);ctx.lineTo(x+w*0.09,base-h);ctx.lineTo(x+w/2,base);ctx.closePath();ctx.fill();
  if(glow>0){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,base-h,4,x,base-h,w*0.35);g.addColorStop(0,'rgba(255,220,120,'+glow+')');g.addColorStop(.4,'rgba(255,90,10,'+(glow*0.7)+')');g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,base-h,w*0.35,0,TAU);ctx.fill();ctx.restore();}
}
function introParts(dt,max,spawn,step,draw){
  const P=intro.parts;if(P.length<max&&spawn)for(let i=0;i<spawn;i++)P.push(step(null));
  for(let i=P.length-1;i>=0;i--){const p=P[i];if(!step(p,dt)){P.splice(i,1);continue;}draw(p);}
}
function drawTower(cx,col,col2,glitch){
  ctx.save();const t=intro.t;
  ctx.fillStyle='#070a18';ctx.beginPath();ctx.moveTo(cx-70,VH);ctx.lineTo(cx-34,120);ctx.lineTo(cx+34,120);ctx.lineTo(cx+70,VH);ctx.fill();
  ctx.strokeStyle=col;ctx.globalAlpha=0.6;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-34,120);ctx.lineTo(cx-70,VH);ctx.moveTo(cx+34,120);ctx.lineTo(cx+70,VH);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalCompositeOperation='lighter';
  const p=1+0.08*Math.sin(t*3),g=ctx.createRadialGradient(cx,110,4,cx,110,120*p);g.addColorStop(0,'#ffffff');g.addColorStop(.2,col);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,110,120*p,0,TAU);ctx.fill();
  ctx.strokeStyle=col2;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,110,70+i*26,18+i*6,Math.sin(t*0.7+i)*0.3,0,TAU);ctx.stroke();}
  for(let i=0;i<6;i++){const a=t*0.5+i/6*TAU;ctx.globalAlpha=0.25;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx,110);ctx.lineTo(cx+Math.cos(a)*600,110+Math.sin(a)*600);ctx.lineTo(cx+Math.cos(a+0.05)*600,110+Math.sin(a+0.05)*600);ctx.fill();}
  ctx.restore();
  if(glitch){ctx.save();ctx.setTransform(1,0,0,1,0,0);for(let i=0;i<8;i++){if(Math.random()<0.5)continue;const y=Math.random()*cv.height,h=(4+Math.random()*18)*DPR;ctx.drawImage(cv,0,y,cv.width,h,(Math.random()-.5)*30*DPR,y,cv.width,h);}ctx.restore();}
}
function drawStoryScene(sc){
  const t=intro.t,dt=Math.max(0,Math.min(0.05,t-intro.pt));intro.pt=t;
  const key=intro.set+':'+intro.slide;if(intro.key!==key){intro.key=key;intro.parts=[];}
  if(sc==='old'||sc==='quake'){
    const k=sc==='quake'?Math.min(1,t/3.2):0;
    sceneBG(lerpC('5fb4f0','5a2e1e',k),lerpC('dff2ff','c9783c',k));
    // sol e nuvens
    ctx.save();ctx.globalCompositeOperation='lighter';const sg=ctx.createRadialGradient(780,110,10,780,110,120);sg.addColorStop(0,'rgba(255,250,220,'+(0.9-0.6*k)+')');sg.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=sg;ctx.fillRect(640,0,300,260);ctx.restore();
    ctx.fillStyle=lerpC('fff6d8','ffb070',k);ctx.beginPath();ctx.arc(780,110,36,0,TAU);ctx.fill();
    ctx.fillStyle=k>0?'rgba(150,120,110,'+(0.85-0.3*k)+')':'rgba(255,255,255,.85)';for(let i=0;i<5;i++){const x=((i*230+t*12)%(VW+260))-130,y=50+i*18;ctx.beginPath();for(const [dx,dy,r] of[[0,0,26],[24,-8,30],[52,0,24],[26,8,22],[-20,6,18],[74,6,18]]){ctx.moveTo(x+dx+r,y+dy);ctx.arc(x+dx,y+dy,r,0,TAU);}ctx.fill();}
    // montanhas e vulcões adormecidos
    ctx.fillStyle=lerpC('86aac6','4a2a22',k);ctx.beginPath();ctx.moveTo(-20,VH*0.57);for(let x=-20;x<=VW+20;x+=40)ctx.lineTo(x,VH*0.51-Math.sin(x*0.011)*40-Math.sin(x*0.027)*18);ctx.lineTo(VW+20,VH);ctx.lineTo(-20,VH);ctx.fill();
    drawVolcano(190,VH*0.57,360,190,lerpC('6f8fa8','3a1d16',k),k>0.3?(k-0.3)*0.8:0);
    drawVolcano(520,VH*0.57,240,120,lerpC('7c98ae','3f211a',k),k>0.6?(k-0.6)*0.9:0);
    if(k>0)introParts(dt,60,1,(p,d)=>{if(!p)return{x:190+(Math.random()-.5)*30,y:VH*0.57-190,vx:(Math.random()-.5)*14,vy:-20-Math.random()*20,r:8,a:0.6};p.x+=p.vx*d+6*d;p.y+=p.vy*d;p.r+=d*14;p.a-=d*0.12;return p.a>0;},
      p=>{ctx.fillStyle='rgba(70,60,58,'+p.a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();});
    // chão e árvores
    ctx.fillStyle=lerpC('4f9a6a','3b2620',k);ctx.fillRect(-30,VH*0.57,VW+60,VH);
    ctx.fillStyle=lerpC('3d7f56','2b1b17',k);ctx.fillRect(-30,VH*0.65,VW+60,VH);
    for(let i=0;i<14;i++){const x=20+i*27,y=VH*0.61+(i%3)*6;ctx.fillStyle=lerpC('2f6e46','2a1c18',k);ctx.beginPath();ctx.arc(x,y,13,0,TAU);ctx.fill();ctx.fillStyle=lerpC('5a3a24','201410',k);ctx.fillRect(x-2,y+8,4,10);}
    drawOldCity(t,k,k);
    if(sc==='old'){
      for(let i=0;i<5;i++){const x=((i*150+t*55)%(VW+80))-40,y=150+Math.sin(t*2+i)*14+i*12,w=7+Math.sin(t*9+i*2)*3;ctx.strokeStyle='rgba(30,40,55,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-8,y-w*0.5);ctx.lineTo(x,y);ctx.lineTo(x+8,y-w*0.5);ctx.stroke();}
    }else{
      // rachaduras no chão
      ctx.save();const cr=Math.min(1,t/2.5);ctx.lineCap='round';
      const R=rng(99);for(let c=0;c<5;c++){let x=80+c*190,y=VH*0.655;ctx.strokeStyle='rgba(15,8,6,.9)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y);
        const steps=Math.floor(8*cr);for(let s=0;s<steps;s++){x+=(R()-.5)*60;y+=9+R()*6;ctx.lineTo(x,y);}ctx.stroke();
        if(k>0.6){ctx.strokeStyle='rgba(255,120,30,'+(k-0.6)*1.5+')';ctx.lineWidth=2;ctx.stroke();}}
      ctx.restore();
      // poeira e destroços
      introParts(dt,90,2,(p,d)=>{if(!p){const b=OLDCITY[Math.floor(Math.random()*OLDCITY.length)];return{x:b.x+Math.random()*b.w,y:VH*0.65-Math.random()*b.h*0.6,vx:(Math.random()-.5)*60,vy:-30-Math.random()*60,r:2+Math.random()*4,a:0.9,dust:Math.random()<0.5};}
          p.vy+=(p.dust?-5:240)*d;p.x+=p.vx*d;p.y+=p.vy*d;if(p.dust)p.r+=d*18;p.a-=d*(p.dust?0.35:0.5);return p.a>0&&p.y<VH+20;},
        p=>{ctx.fillStyle=p.dust?'rgba(150,120,100,'+(p.a*0.4)+')':'rgba(60,50,45,'+p.a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();});
    }
  }else if(sc==='eruption'){
    sceneBG('#1a0606','#5a1408');
    // nuvem de cinzas crescendo e apagando o céu
    const ck=Math.min(1,t/5);
    ctx.fillStyle='rgba(255,120,60,'+(0.35*(1-ck))+')';ctx.beginPath();ctx.arc(780,110,34,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(30,24,24,'+(0.6+0.35*ck)+')';ctx.beginPath();
    for(let i=0;i<18;i++){const r=30+ck*(60+((i*37)%50)),x=300+(i-6)*ck*70+Math.sin(t*0.6+i)*10,y=VH*0.66-250-ck*(40+((i*53)%90))+Math.cos(t*0.5+i)*6;ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU);}
    ctx.fill();
    // vulcão em erupção
    const VB=VH*0.66,VX=300,VHh=230;
    const cg=ctx.createLinearGradient(0,VB-VHh,0,VB);cg.addColorStop(0,'#5a2a1c');cg.addColorStop(.5,'#3a1a12');cg.addColorStop(1,'#1c0c08');
    ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(VX-290,VB);ctx.quadraticCurveTo(VX-150,VB-90,VX-46,VB-VHh);ctx.lineTo(VX+46,VB-VHh);ctx.quadraticCurveTo(VX+150,VB-90,VX+290,VB);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,140,60,.45)';ctx.lineWidth=2;ctx.stroke();
    ctx.save();ctx.globalCompositeOperation='lighter';
    const cr=ctx.createRadialGradient(VX,VB-VHh,4,VX,VB-VHh,150);cr.addColorStop(0,'rgba(255,240,180,.95)');cr.addColorStop(.25,'rgba(255,120,20,.7)');cr.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=cr;ctx.beginPath();ctx.arc(VX,VB-VHh,150,0,TAU);ctx.fill();
    const fl=Math.min(1,t/2.6);
    for(const [dir,wig] of[[-1,0],[1,1],[-1,2],[1,3]]){
      ctx.beginPath();ctx.moveTo(VX+dir*(18+wig*6),VB-VHh+4);
      const n=Math.floor(12*fl);for(let s=1;s<=n;s++){const u=s/12,x=VX+dir*(18+wig*6+u*(150+wig*30))+Math.sin(u*9+wig+t*2)*8,y=VB-VHh+4+u*(VHh-6)*(0.95-wig*0.08);ctx.lineTo(x,y);}
      ctx.strokeStyle='rgba(255,80,10,.75)';ctx.lineWidth=12-wig*2;ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle='rgba(255,220,120,.95)';ctx.lineWidth=4-wig*0.6;ctx.stroke();}
    ctx.restore();
    // chafariz de lava e bolas de fogo
    introParts(dt,170,4,(p,d)=>{if(!p){const big=Math.random()<0.08;return{x:300+(Math.random()-.5)*40,y:VH*0.66-232,vx:(Math.random()-.5)*(big?380:200),vy:-(180+Math.random()*(big?360:240)),r:big?6:2+Math.random()*3,big,a:1};}
        p.vy+=260*d;p.x+=p.vx*d;p.y+=p.vy*d;p.a-=d*0.25;if(p.big&&Math.random()<0.5)intro.parts.push({x:p.x,y:p.y,vx:0,vy:-10,r:4,a:0.5,smoke:true});return p.a>0&&p.y<VH*0.68;},
      p=>{if(p.smoke){ctx.fillStyle='rgba(60,40,38,'+p.a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r+=0.3,0,TAU);ctx.fill();return;}
        ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);g.addColorStop(0,'rgba(255,240,170,'+p.a+')');g.addColorStop(.4,'rgba(255,110,20,'+(p.a*0.8)+')');g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*3,0,TAU);ctx.fill();ctx.restore();});
    // cidade em chamas (à direita)
    ctx.fillStyle='#120807';ctx.fillRect(-30,VH*0.66,VW+60,VH);
    const R=rng(5);for(let i=0;i<10;i++){const x=560+i*42,h=40+R()*120,w=30+R()*14,tilt=(R()-.5)*0.4;ctx.save();ctx.translate(x,VH*0.68);ctx.rotate(tilt);ctx.fillStyle='#1b0d0b';ctx.fillRect(-w/2,-h,w,h);
      ctx.fillStyle='rgba(255,'+(110+Math.floor(60*Math.sin(t*9+i)))+',30,.8)';for(let yy=-h+8;yy<-6;yy+=14)if(R()<.6)ctx.fillRect(-w/2+5,yy,5,6);ctx.restore();
      ctx.save();ctx.globalCompositeOperation='lighter';const fg=ctx.createRadialGradient(x,VH*0.68-h,2,x,VH*0.68-h,30+8*Math.sin(t*6+i));fg.addColorStop(0,'rgba(255,200,80,.55)');fg.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.arc(x,VH*0.68-h,40,0,TAU);ctx.fill();ctx.restore();}
    ctx.strokeStyle='rgba(255,120,30,.75)';ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<VW;x+=60){ctx.moveTo(x,VH*0.68);ctx.lineTo(x+30,VH*0.72);ctx.lineTo(x+18,VH*0.78);}ctx.stroke();
    // cinza caindo
    for(let i=0;i<70;i++){const x=(i*71.3+t*20)%VW,y=(i*37.9+t*(30+(i%5)*8))%VH;ctx.fillStyle='rgba(120,110,105,.45)';ctx.fillRect(x,y,2,2);}
  }else if(sc==='winter'){
    sceneBG('#2c3640','#a9b5c0');
    ctx.fillStyle='rgba(230,235,240,.25)';ctx.beginPath();ctx.arc(700,120,40,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(60,70,80,.35)';for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(120+i*170,80+(i%2)*30,160,40,0,0,TAU);ctx.fill();}
    // ruínas cobertas de neve
    const R=rng(31);for(let i=0;i<12;i++){const x=20+i*82+R()*20,h=50+R()*150,w=40+R()*30,tilt=(R()-.5)*0.35;ctx.save();ctx.translate(x,VH*0.78);ctx.rotate(tilt);
      ctx.fillStyle='#3b4652';ctx.fillRect(-w/2,-h,w,h);ctx.fillStyle='#2e3842';for(let yy=-h+10;yy<-8;yy+=16)ctx.fillRect(-w/2+6,yy,w-12,6);
      ctx.fillStyle='#eef6fb';ctx.beginPath();ctx.moveTo(-w/2-4,-h);ctx.quadraticCurveTo(0,-h-12,w/2+4,-h);ctx.lineTo(w/2+4,-h+6);ctx.lineTo(-w/2-4,-h+6);ctx.fill();ctx.restore();}
    // gelo avançando pelo chão
    const ik=Math.min(1,t/4);ctx.fillStyle='#c6dbe8';ctx.fillRect(-30,VH*0.78,VW+60,VH);
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.moveTo(-30,VH);for(let x=-30;x<=VW+30;x+=30)ctx.lineTo(x,VH*0.78-ik*40-Math.abs(Math.sin(x*0.05))*18*ik);ctx.lineTo(VW+30,VH);ctx.fill();
    ctx.save();ctx.strokeStyle='rgba(140,200,235,.8)';ctx.lineWidth=2;for(let i=0;i<9;i++){const x=40+i*110,h=30+((i*37)%50);ctx.beginPath();ctx.moveTo(x,VH*0.8);ctx.lineTo(x+6,VH*0.8-h*ik);ctx.lineTo(x+12,VH*0.8);ctx.stroke();}ctx.restore();
    // neve e cinza ao vento
    for(let i=0;i<160;i++){const s=(i%4)+1,x=((i*61.7-t*(70+s*30))%(VW+60)+VW+60)%(VW+60)-30,y=(i*43.3+t*(40+s*22))%(VH+20)-10;ctx.fillStyle=i%3?'rgba(245,250,255,.85)':'rgba(130,130,135,.6)';ctx.beginPath();ctx.arc(x,y,0.8+s*0.6,0,TAU);ctx.fill();}
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<14;i++){const y=(i*41+t*30)%VH,x=((i*137-t*400)%(VW+300)+VW+300)%(VW+300)-150;ctx.moveTo(x,y);ctx.lineTo(x+120,y-8);}ctx.stroke();
  }else if(sc==='neon'){
    sceneBG('#0b0f2e','#1a0b2a');drawSky();
    drawTower(VW/2,'#00e5ff','rgba(0,229,255,.6)',false);
    // cúpulas de luz
    ctx.save();for(const [x,r] of[[200,210],[VW/2,260],[770,200]]){const g=ctx.createRadialGradient(x,VH*0.86,r*0.6,x,VH*0.86,r);g.addColorStop(0,'rgba(0,229,255,0)');g.addColorStop(.9,'rgba(0,229,255,.10)');g.addColorStop(1,'rgba(150,240,255,.35)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,VH*0.86,r,Math.PI,0);ctx.fill();ctx.strokeStyle='rgba(150,240,255,.45)';ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();
    // energia: lava do sul (esquerda) e gelo do norte (direita) chegando ao Núcleo
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineWidth=4;
    for(const [x0,col] of[[-20,'255,120,30'],[VW+20,'143,243,255']]){ctx.strokeStyle='rgba('+col+',.35)';ctx.beginPath();ctx.moveTo(x0,VH*0.95);ctx.quadraticCurveTo(VW/2+(x0<0?-200:200),VH*0.9,VW/2,140);ctx.stroke();
      for(let i=0;i<6;i++){const u=((t*0.35+i/6)%1),bx=(1-u)*(1-u)*x0+2*(1-u)*u*(VW/2+(x0<0?-200:200))+u*u*VW/2,by=(1-u)*(1-u)*VH*0.95+2*(1-u)*u*VH*0.9+u*u*140;ctx.fillStyle='rgba('+col+',.9)';ctx.beginPath();ctx.arc(bx,by,4,0,TAU);ctx.fill();}}
    ctx.restore();
    ctx.font='bold 12px system-ui';ctx.fillStyle='rgba(255,150,80,.85)';ctx.textAlign='left';ctx.fillText('◀ LAVA DO SUL',20,VH*0.6);ctx.fillStyle='rgba(143,243,255,.85)';ctx.textAlign='right';ctx.fillText('GELO DO NORTE ▶',VW-20,VH*0.6);
    for(let i=0;i<40;i++){const x=(i*91.3+t*8)%VW,y=(i*53.1+t*14)%VH;ctx.fillStyle='rgba(140,140,150,.3)';ctx.fillRect(x,y,2,2);}
  }else if(sc==='virus'||sc==='restore'){
    const restoring=sc==='restore',k=restoring?Math.min(1,t/3):0;
    sceneBG(restoring?'#06102a':'#1a0620','#02040c');drawSky();
    drawTower(VW/2,restoring&&k>0.5?'#00e5ff':'#b03cff',restoring&&k>0.5?'rgba(0,229,255,.6)':'rgba(255,60,120,.6)',!restoring||k<0.5);
    if(!restoring&&IMG.malware){for(let i=0;i<14;i++){const a=t*0.6+i*0.9,r=150+(i%4)*60,x=VW/2+Math.cos(a)*r*1.6,y=150+Math.sin(a)*r*0.5+i*6;
      const key=['m_atk','m_hyb','m_def'][i%3];if(IMG[key]){drawSheet(key,Math.floor(t*10+i)%4,x,y,1.4,Math.cos(a)>0);}}
      if(Math.floor(t*2)%2===0){ctx.fillStyle='rgba(255,0,60,.12)';ctx.fillRect(0,0,VW,VH);}}
    if(restoring){ctx.save();ctx.globalAlpha=Math.max(0,1-k*1.5);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,VW,VH);ctx.restore();}
  }else if(sc==='rift'||sc==='mended'){
    const mend=sc==='mended',open=mend?Math.max(0,1-t/3.5):Math.min(1,t/1.6);
    sceneBG('#0b0f2e','#1a0b2a');drawSky();
    ctx.save();ctx.translate(VW/2,190);const W=150*open+4;
    ctx.beginPath();const r=rng(21);ctx.moveTo(0,-200);for(let i=0;i<=10;i++)ctx.lineTo(W*(0.6+0.4*r())*(i%2?1:0.7),-200+i*40);for(let i=10;i>=0;i--)ctx.lineTo(-W*(0.6+0.4*r())*(i%2?0.7:1),-200+i*40);ctx.closePath();
    ctx.save();ctx.clip();
    for(let q=0;q<4;q++){ctx.fillStyle=['#ff3bd0','#e6e6e6','#2fae3c','#00e5ff'][q];ctx.fillRect(-300,-200+q*100,600,100);}
    ctx.fillStyle='rgba(10,0,8,.35)';for(let y=-200;y<220;y+=12)for(let x=-300+(y/12%2)*6;x<300;x+=12){ctx.beginPath();ctx.arc(x,y,2.5,0,TAU);ctx.fill();}
    ctx.restore();
    for(const [c,o] of[['rgba(255,59,208,.9)',-5],['rgba(0,229,255,.9)',5],['#ffffff',0]]){ctx.save();ctx.translate(o,0);ctx.strokeStyle=c;ctx.lineWidth=o?5:2.5;ctx.stroke();ctx.restore();}
    ctx.restore();
    if(!mend&&IMG.e_gib_walk){const vs=['gib','noir','pix'];for(let i=0;i<6;i++){const u=((t*0.35+i/6)%1),x=VW/2+(i%2?1:-1)*(40+u*260+i*20),y=60+u*330,rot=(i%2?1:-1)*u*1.2;
      ctx.save();ctx.translate(x,y);ctx.rotate(rot);drawSheet('e_'+vs[i%3]+'_walk',1,0,0,0.9,i%2===0);ctx.restore();}}
    if(mend){for(let i=0;i<50;i++){const a=i*2.4+t,rr=(t*90+i*9)%300;ctx.fillStyle=['#ff3bd0','#ffd34e','#7cff3a','#00e5ff'][i%4];ctx.fillRect(VW/2+Math.cos(a)*rr,190+Math.sin(a)*rr*0.6,3,3);}}
    if(!mend&&Math.random()<0.1){ctx.fillStyle='rgba(255,59,208,.12)';ctx.fillRect(0,0,VW,VH);}
  }else if(sc==='dawn'){
    const k=Math.min(1,t/4);
    sceneBG(lerpC('0b0f2e','f0a868',k*0.8),lerpC('1a0b2a','ffd9a0',k*0.6));
    ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(VW*0.7,VH*0.55,4,VW*0.7,VH*0.55,300*k+40);g.addColorStop(0,'rgba(255,240,200,'+(0.8*k)+')');g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    for(let i=0;i<5;i++){const a=-0.4-i*0.18;ctx.fillStyle='rgba(255,230,170,'+(0.12*k)+')';ctx.beginPath();ctx.moveTo(VW*0.7,VH*0.55);ctx.lineTo(VW*0.7+Math.cos(a)*900,VH*0.55+Math.sin(a)*900);ctx.lineTo(VW*0.7+Math.cos(a-0.05)*900,VH*0.55+Math.sin(a-0.05)*900);ctx.fill();}ctx.restore();
    ctx.globalAlpha=1-k*0.4;drawSky();ctx.globalAlpha=1;
    for(let i=0;i<30;i++){const x=(i*91.3+t*8)%VW,y=(i*53.1+t*10)%VH;ctx.fillStyle='rgba(140,140,150,'+(0.3*(1-k))+')';ctx.fillRect(x,y,2,2);}
  }else if(sc==='hero'){
    sceneBG('#05070f','#0b1020');
    ctx.fillStyle='#0a0d18';ctx.fillRect(0,VH*0.62,VW,VH);
    ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(330,330,10,330,330,260);g.addColorStop(0,'rgba(0,229,255,.25)');g.addColorStop(1,'rgba(0,229,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);ctx.restore();
    if(portalImg.complete&&portalImg.naturalWidth){ctx.save();ctx.translate(640,250);ctx.rotate(Math.sin(t)*0.05);const s=1+0.03*Math.sin(t*4);ctx.shadowColor='#7cff3a';ctx.shadowBlur=30;ctx.drawImage(portalImg,-80*s,-129*s,160*s,258*s);
      ctx.shadowBlur=0;ctx.beginPath();ctx.ellipse(0,0,54*s,88*s,0,0,TAU);ctx.clip();ctx.rotate(t*0.9);ctx.globalAlpha=0.5;ctx.drawImage(portalImg,-96,-155,192,309);ctx.restore();}
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(330,372,70,14,0,0,TAU);ctx.fill();
    if(IMG.idle)drawSheet('idle',Math.floor(t*5)%4,330,380,2.6,false);
    rain(70,'rgba(160,210,255,.18)');
  }else if(sc==='map'){
    sceneBG('#050814','#0b0f22');
    ctx.strokeStyle='rgba(120,170,255,.08)';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<VW;x+=40){ctx.moveTo(x,0);ctx.lineTo(x,VH);}for(let y=0;y<VH;y+=40){ctx.moveTo(0,y);ctx.lineTo(VW,y);}ctx.stroke();
    const pts=[[180,250,'#00e5ff','DISTRITO NEON','Fase 1 · a cidade'],[480,170,'#ff8a1f','FUNDIÇÃO RUBRA','Fase 2 · campos de lava · FORJA-X'],[780,260,'#8ff3ff','CRIPTA GLACIAL','Fase 3 · norte congelado · VEXX']];
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.setLineDash([10,10]);ctx.lineDashOffset=-t*30;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[2][0],pts[2][1]);ctx.stroke();ctx.restore();
    pts.forEach(([x,y,c,n,f],i)=>{if(t<i*0.5)return;const p=1+0.06*Math.sin(t*3+i);
      ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,4,x,y,70*p);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,70*p,0,TAU);ctx.fill();ctx.restore();
      ctx.beginPath();ctx.arc(x,y,26,0,TAU);ctx.fillStyle='#070b16';ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle=c;ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText(String(i+1),x,y+6);
      ctx.fillStyle='#fff';ctx.font='bold 16px system-ui';ctx.fillText(n,x,y+52);ctx.fillStyle='#9fb2d0';ctx.font='13px system-ui';ctx.fillText(f,x,y+70);});
  }else if(sc==='title'){
    sceneBG('#05060f','#120a24');ctx.globalAlpha=0.5;drawSky();ctx.globalAlpha=1;
    for(let i=0;i<40;i++){const x=(i*91.3+t*8)%VW,y=(i*53.1+t*14)%VH;ctx.fillStyle='rgba(140,140,150,.35)';ctx.fillRect(x,y,2,2);}
    const k=Math.min(1,t/1.15),pop=t<1.15?0:Math.max(0,1-(t-1.15)*3);
    ctx.save();ctx.textAlign='center';ctx.globalAlpha=k;ctx.translate(VW/2,150);ctx.scale(1+pop*0.15,1+pop*0.15);ctx.fillStyle='#e9fbff';ctx.shadowColor='#00e5ff';ctx.shadowBlur=26+pop*40;ctx.font='bold 74px '+MENU_FONT;ctx.fillText('KAYZEN RYUU',0,0);ctx.restore();
    ctx.save();ctx.textAlign='center';ctx.globalAlpha=k;ctx.fillStyle='#8df5ff';ctx.font='bold 16px system-ui';ctx.fillText(intro.set==='end'?'CAPÍTULO 1 — CONCLUÍDO':intro.set==='end2'?'CAPÍTULO 2 — CONCLUÍDO':'CAPÍTULO 1 — O VÉU DE NEO-AKARI',VW/2,182);ctx.restore();
    if(IMG.idle)drawSheet('idle',Math.floor(t*5)%4,VW/2,392,1.15,false);
  }
}
function drawGate(){
  sceneBG('#03040a','#0b0f22');ctx.globalAlpha=0.35;drawSky();ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.fillStyle='#e9fbff';ctx.shadowColor='#00e5ff';ctx.shadowBlur=22;ctx.font='bold 58px '+MENU_FONT;ctx.fillText('KAYZEN RYUU',VW/2,200);ctx.shadowBlur=0;
  ctx.fillStyle='#8df5ff';ctx.font='bold 15px system-ui';ctx.fillText('O VÉU DE NEO-AKARI',VW/2,230);
  ctx.fillStyle='rgba(220,230,255,.75)';ctx.font='16px system-ui';ctx.fillText('🎧  Melhor com o som ligado — a história é narrada',VW/2,300);
  const p=0.55+0.45*Math.sin(uiT*4);ctx.globalAlpha=p;ctx.fillStyle='#ffffff';ctx.font='bold 22px system-ui';
  ctx.fillText(touchDevice?'Toque na tela para começar':'Clique ou pressione qualquer tecla para começar',VW/2,380);ctx.globalAlpha=1;
  drawCredits(470,17);
}
function introButton(x,y,w,h,label,col,act){
  const hov=!touchDevice&&mouse.x>=x&&mouse.x<=x+w&&mouse.y>=y&&mouse.y<=y+h;
  ctx.save();rrect(x,y,w,h,10);ctx.fillStyle=hov?'rgba(255,255,255,.16)':'rgba(8,12,24,.85)';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.shadowColor=col;ctx.shadowBlur=hov?18:8;ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#fff';ctx.font='bold 17px system-ui,Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x+w/2,y+h/2+1);ctx.textBaseline='alphabetic';ctx.restore();
  intro.btns.push({x,y,w,h,act});if(hov)cv.style.cursor='pointer';
}
function drawIntro(){
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,VW,VH);cv.style.cursor='';
  intro.btns=[];
  if(intro.gate){drawGate();return;}
  const s=curSlide();
  const sh=(s.scene==='quake'?Math.min(1,intro.t/1.2)*7:s.scene==='eruption'?(intro.t<0.8?10*(1-intro.t/0.8)+2:2.5):0);
  ctx.save();if(sh)ctx.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
  drawStoryScene(s.scene);ctx.restore();
  const fade=Math.min(1,intro.t*2.5);ctx.fillStyle='rgba(0,0,0,'+(1-fade)+')';ctx.fillRect(0,0,VW,VH);
  if(!s.final){
    ctx.fillStyle='rgba(0,0,0,.9)';ctx.fillRect(0,0,VW,26);
    const g=ctx.createLinearGradient(0,VH-170,0,VH);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.35,'rgba(2,4,12,.88)');g.addColorStop(1,'rgba(2,4,12,.96)');ctx.fillStyle=g;ctx.fillRect(0,VH-170,VW,170);
    ctx.textAlign='left';ctx.fillStyle='#00e5ff';ctx.shadowColor='#00e5ff';ctx.shadowBlur=10;ctx.font='bold 24px '+MENU_FONT;ctx.fillText(s.title,60,VH-112);ctx.shadowBlur=0;
    ctx.fillStyle='#eef3ff';ctx.font='18px system-ui,Arial';wrapText(s.text.slice(0,Math.floor(intro.chars)),60,VH-80,VW-120,26);
    const done=intro.chars>=s.text.length;
    ctx.textAlign='right';ctx.font='bold 13px system-ui,Arial';ctx.fillStyle='rgba(141,245,255,'+(done?0.6+0.4*Math.sin(uiT*4):0.35)+')';
    ctx.fillText((touchDevice?'Toque para continuar':'Clique, Enter ou Espaço para continuar')+'  ›',VW-40,VH-18);
    ctx.textAlign='left';ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillText((intro.slide+1)+' / '+(STORY[intro.set].length-1),60,VH-18);
    ctx.save();ctx.textAlign='center';ctx.font='italic 12px Georgia,serif';ctx.fillStyle='rgba(220,230,255,.6)';ctx.fillText('Um projeto de Luis Henrique e Marcos Thz',VW/2,VH-18);ctx.restore();
    introButton(VW-142,36,112,38,'PULAR  »','#8df5ff',storySkip);
    if(NARR.ok)introButton(30,36,180,38,NARR.on?'🔊 NARRAÇÃO: SIM':'🔇 NARRAÇÃO: NÃO',NARR.on?'#ffd34e':'#68738d',narrToggle);
  }else{
    ctx.textAlign='center';ctx.fillStyle='#eef3ff';ctx.font='italic 20px Georgia,serif';ctx.fillText(s.text.slice(0,Math.floor(intro.chars)),VW/2,s.end?222:222);
    if(intro.chars>=s.text.length||intro.t>0.6){
      if(s.end&&intro.set==='end'){introButton(VW/2-320,420,300,52,'ENTRAR NA FENDA — FASE 4','#ff3bd0',()=>finishStory('phase4'));introButton(VW/2+20,420,300,52,'JOGAR DE NOVO (FASE 1)','#00ff9c',()=>finishStory('start'));}
      else if(s.end){introButton(VW/2-150,420,300,52,'JOGAR DE NOVO (FASE 1)','#00ff9c',()=>finishStory('start'));}
      else if(unlocked>1){introButton(VW/2-320,420,300,52,'NOVO JOGO — FASE 1','#00e5ff',()=>finishStory('start'));introButton(VW/2+20,420,300,52,'CONTINUAR — FASE '+unlocked,'#ffd34e',()=>finishStory('continue'));}
      else introButton(VW/2-150,420,300,52,'INICIAR MISSÃO','#00e5ff',()=>finishStory('start'));
      ctx.textAlign='center';ctx.font='12px system-ui';ctx.fillStyle='rgba(200,220,255,.55)';
      if(!touchDevice)ctx.fillText(s.end?(intro.set==='end'?'Enter: entrar na Fenda':'Enter: jogar de novo'):unlocked>1?'Enter: novo jogo · C: continuar':'Enter: iniciar',VW/2,500);
    }
    drawCredits(250,14);
    if(!s.end){ctx.textAlign='center';ctx.font='11px system-ui';ctx.fillStyle='rgba(200,220,255,.4)';ctx.fillText('Arte do Malware: "Dregfly" por Emcee Flesher (OpenGameArt, CC-BY/OGA-BY 3.0)',VW/2,VH-10);}
  }
}

/* ---------- Teclado: telas especiais e habilidades novas ---------- */
function extKey(e){
  if(e.repeat&&(intro.on||pcard.on))return true;
  if(intro.on&&!intro.gate&&e.code==='KeyN'&&!e.repeat){narrToggle();return true;}
  if(intro.on&&intro.gate){if(!/^(Shift|Control|Alt|Meta|Tab)/.test(e.key)){e.preventDefault();openGate();}return true;}
  if(intro.on){
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    const s=curSlide();
    if(e.code==='Escape'){storySkip();return true;}
    if(s.final){if(e.code==='Enter'||e.code==='NumpadEnter'||e.code==='Space')finishStory(s.end&&intro.set==='end'?'phase4':'start');else if(e.code==='KeyC'&&unlocked>1&&!s.end)finishStory('continue');return true;}
    if(['Enter','NumpadEnter','Space','ArrowRight'].includes(e.code))storyNext();
    return true;
  }
  if(pcard.on){if(e.code==='Space')e.preventDefault();if(!/^(Shift|Control|Alt|Meta)/.test(e.key))closeCard();return true;}
  if(state==='win'&&!ptravel&&(e.code==='Enter'||e.code==='NumpadEnter')){onRetry('enter');return true;}
  if(state==='dead'&&(e.code==='Enter'||e.code==='NumpadEnter')){onRetry('enter');return true;}
  if(!e.repeat&&state==='play'){
    if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyK'){doDash();return false;}
    if(e.code==='KeyF'){doShield();return false;}
    if(e.code==='KeyV'){doAlly();return false;}
    if(e.code==='KeyG'){useWeapon();return false;}
    if(pmenu.open&&(e.code==='Digit4'||e.code==='Numpad4')){chooseMenuCard(3);return true;}
    if(pmenu.open&&(e.code==='Digit2'||e.code==='Numpad2')){chooseMenuCard(1);return true;}
    if(pmenu.open&&(e.code==='Digit3'||e.code==='Numpad3')){chooseMenuCard(2);return true;}
  }
  return false;
}
function overlayBlocking(){return intro.on||pcard.on||paused||state!=='play';}
// toque/clique nas telas especiais (história, cartão da fase, pausa, derrota, vitória)
cv.addEventListener('pointerdown',e=>{
  if(!(intro.on||pcard.on||paused||(state!=='play'&&!ptravel)))return;
  e.preventDefault();audioInit();setMouse(e);
  if(intro.on)storyTap();
  else if(pcard.on)closeCard();
  else if(paused&&state==='play')setPaused(false);
  else if(state==='dead'||state==='win')onRetry('tap');
});
cv.addEventListener('pointermove',e=>{if(intro.on&&e.pointerType==='mouse')setMouse(e);});

/* ---------- Botões novos do celular ---------- */
const mobileSkillBtn=document.getElementById('mobileSkill'),mobilePortalBtn=document.getElementById('mobilePortal'),
      mobileDashBtn=document.getElementById('mobileDash'),mobileShieldBtn=document.getElementById('mobileShield'),mobilePauseBtn=document.getElementById('mobilePause'),mobileAllyBtn=document.getElementById('mobileAlly'),mobileWeaponBtn=document.getElementById('mobileWeapon');
const extBtns=[mobileSkillBtn,mobilePortalBtn,mobileDashBtn,mobileShieldBtn,mobilePauseBtn,mobileAllyBtn,mobileWeaponBtn];
if(!touchDevice)extBtns.forEach(b=>b.style.display='none');
else{
  const on=(b,f)=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();audioInit();f();});
  on(mobileSkillBtn,()=>toggleAim());
  on(mobilePortalBtn,()=>togglePortalMenu());
  on(mobileDashBtn,()=>doDash());
  on(mobileShieldBtn,()=>doShield());
  on(mobileAllyBtn,()=>doAlly());
  on(mobileWeaponBtn,()=>useWeapon());
  on(mobilePauseBtn,()=>{if(state==='play'&&!intro.on&&!pcard.on)setPaused(!paused);});
  extBtns.concat([mobileFireBtn,mobileReloadBtn,mobileJumpBtn]).forEach(b=>b.addEventListener('contextmenu',e=>e.preventDefault()));
}
const touchUI={};
function setBtn(b,key,html,cls){const k=html+'|'+cls;if(touchUI[key]===k)return;touchUI[key]=k;b.innerHTML=html;b.className='mobile-control '+cls;}
function updateTouchUI(){
  if(!touchDevice)return;
  const ov=intro.on||pcard.on||pmenu.open;if(touchUI.ov!==ov){touchUI.ov=ov;document.body.classList.toggle('overlay',ov);}
  setBtn(mobileSkillBtn,'skill',skill.cd>0?String(Math.ceil(skill.cd)):'SOBRE-<br>CARGA',skill.aiming?'active':skill.cd>0?'cd':'');
  setBtn(mobilePortalBtn,'portal',pcd>0?String(Math.ceil(pcd)):'PORTAL',!cleared?'hidden':(pAim||pmenu.open)?'active':pcd>0?'cd':'');
  setBtn(mobileWeaponBtn,'weapon',wpn.cd>0?String(Math.ceil(wpn.cd)):'ARMA',!wpn.owned?'hidden':(wpn.act>0||wpn.charge>0)?'active':wpn.cd>0?'cd':'');
  setBtn(mobileDashBtn,'dash',abil.dashCd>0?String(Math.ceil(abil.dashCd)):'DASH',!hasDash()?'hidden':abil.dashCd>0?'cd':'');
  setBtn(mobileShieldBtn,'shield',abil.shieldCd>0?String(Math.ceil(abil.shieldCd)):'ESCUDO',!hasShield()?'hidden':abil.shieldT>0?'active':abil.shieldCd>0?'cd':'');
  setBtn(mobilePauseBtn,'pause',paused?'▶':'II','');
  setBtn(mobileAllyBtn,'ally',abil.allyCd>0?String(Math.ceil(abil.allyCd)):'ECO',!hasAlly()?'hidden':ally?'active':abil.allyCd>0?'cd':'');
  setBtn(mobileReloadBtn,'reload',P&&P.reloadT>0?String(Math.ceil(P.reloadT)):'RECARGA',P&&P.reloadT>0?'cd':'');
}

/* ---------- Partida ---------- */
function start(){
  loadProgress();setupCanvas();refreshPhases();curPhase=1;loadMap(1);buildFloor();floorBuiltFor=1;reset();
  makeEcoSheets();upscaleSprites();startStory('intro',true);requestAnimationFrame(loop);
}
(function loadingScreen(){try{ctx.fillStyle='#05060d';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#8df5ff';ctx.font='bold 22px system-ui,Arial';ctx.textAlign='center';ctx.fillText('Carregando…',cv.width/2,cv.height/2);}catch(_){}})();

/* ---------- Áudio mais confiável (iPhone/Android): sons decodificados no Web Audio ---------- */
const ABUF={};let abufReq=false,loopSrc=null,sfxOut=null;
function outNode(){if(!sfxOut){sfxOut=actx.createGain();sfxOut.gain.value=1;sfxOut.connect(actx.destination);}sfxOut.gain.value=muted?0:1;return sfxOut;}
function playBuf(k,vol){
  if(!actx||muted||!ABUF[k])return false;
  try{if(actx.state==='suspended')actx.resume();const s=actx.createBufferSource(),g=actx.createGain();s.buffer=ABUF[k];g.gain.value=vol;s.connect(g);g.connect(outNode());s.start();return true;}catch(_){return false;}
}
function startLoopSnd(){
  stopLoopSnd();if(muted)return;
  if(actx&&ABUF.reload){try{loopSrc=actx.createBufferSource();loopSrc.buffer=ABUF.reload;loopSrc.loop=true;const g=actx.createGain();g.gain.value=0.9;loopSrc.connect(g);g.connect(outNode());loopSrc.start();return;}catch(_){loopSrc=null;}}
  try{reloadLoopAudio.loop=true;const p=reloadLoopAudio.play();if(p&&p.catch)p.catch(()=>{});}catch(_){}
}
function stopLoopSnd(){if(loopSrc){try{loopSrc.stop();}catch(_){}loopSrc=null;}try{reloadLoopAudio.pause();}catch(_){}}
function pauseReloadSnd(){stopLoopSnd();}
function tryReload(){
  if(!P||paused||pmenu.open||state!=='play'||intro.on||pcard.on)return;
  if(P.reloadT>0)return;
  if(P.ammo>=CFG.ammoMax){sfx('deny');floaters.push({x:P.x,y:P.y-90,t:0.9,txt:'Munição cheia',c:'#ffd34e'});return;}
  P.reloadT=CFG.reloadTime;sfx('reload');startWeaponReloadAudio();
}
let queuedShot=null;

/* ---------- Sprites nítidos: amplia a pixel art 4x (sem borrar) ---------- */
function upscaleSprites(){
  const K=4;
  for(const k in SPR){
    const img=IMG[k];if(!img||SPR[k].k)continue;
    const w=img.width||img.naturalWidth,h=img.height||img.naturalHeight;if(!w||!h)continue;
    if(/^(idle|walk|backwalk|frontwalk|shoot|jump)$|^e_/.test(k)){try{   // centro do corpo de cada folha (média dos quadros)
      const c0=document.createElement('canvas');c0.width=w;c0.height=h;const g0=c0.getContext('2d');g0.drawImage(img,0,0);const d=g0.getImageData(0,0,w,h).data,S=SPR[k];let sum=0,n=0;
      for(let f=0;f<S.n;f++){let fs=0,fn=0;for(let y=0;y<h;y+=2)for(let x=0;x<S.w;x+=1){if(d[(y*w+f*S.w+x)*4+3]>40){fs+=x;fn++;}}if(fn){sum+=fs/fn;n++;}}
      if(n)S.cx=sum/n;}catch(_){}}
    try{const c=document.createElement('canvas');c.width=w*K;c.height=h*K;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0,w*K,h*K);IMG[k]=c;SPR[k].k=K;}catch(_){}
  }
}

/* ---------- Progresso salvo com assinatura (impede editar a fase liberada) ---------- */
const SAVE_KEY='kz_save_v2',SAVE_SALT='Kz9#Ryuu$Veu-2099/NeoAkari';
function kzHash(s){let h1=0xdeadbeef^s.length,h2=0x41c6ce57^s.length;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(36);}
function kzXor(s){let o='';for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^SAVE_SALT.charCodeAt(i%SAVE_SALT.length));return o;}
function writeSave(o){try{const j=JSON.stringify(o);localStorage.setItem(SAVE_KEY,btoa(kzXor(j))+'.'+kzHash(j+SAVE_SALT));}catch(_){}}
function readSave(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const p=raw.split('.');if(p.length!==2)return null;
  const j=kzXor(atob(p[0]));if(kzHash(j+SAVE_SALT)!==p[1])return null;const o=JSON.parse(j);return o&&typeof o==='object'?o:null;}catch(_){return null;}}


/* =====================================================================
   FASE 4 — FENDA DO MULTIVERSO (ecos de Kayzen, 4 universos, Kayzen Ômega)
   ===================================================================== */
const ZONES=[
  {name:'UNIVERSO GIBI',sub:'tudo vira história em quadrinhos',col:'#ff3bd0'},
  {name:'UNIVERSO NOIR',sub:'um mundo sem cores',col:'#e6e6e6'},
  {name:'UNIVERSO 8-BIT',sub:'a realidade em pixels',col:'#7cff3a'},
  {name:'UNIVERSO NEON',sub:'a Neo-Akari de outra linha do tempo',col:'#00e5ff'}
];
function zoneOf(x,y){return(x<WW/2?0:1)+(y<WH/2?0:2);}
let ally=null,ostrikes=[],oportals=[],comicFX=[],zoneNow=-1,zoneBanner=0,glitchT=0,halfPat=null,endingSet='end';
const hasAlly=()=>unlocked>=4||curPhase>=4;
const COMIC_HIT=['POW!','ZAP!','BAM!','WHAM!','ZIP!'],COMIC_KILL=['KRAK!','BOOM!','KA-POW!','SPLAT!'];
function extOnHit(m,dmg){if(curPhase!==4||Math.random()>0.45)return;comicFX.push({x:m.x+(Math.random()-.5)*30,y:m.y-60-Math.random()*20,t:0.7,txt:COMIC_HIT[Math.floor(Math.random()*COMIC_HIT.length)],col:['#ffd34e','#ff3bd0','#00e5ff'][Math.floor(Math.random()*3)],rot:(Math.random()-.5)*0.5,big:false});}
function extOnKill(m){
  inhalerDrop(m);
  if(curPhase===4)comicFX.push({x:m.x,y:m.y-70,t:1,txt:COMIC_KILL[Math.floor(Math.random()*COMIC_KILL.length)],col:'#ffd34e',rot:(Math.random()-.5)*0.4,big:true});
  if(m.type==='epx'){for(const s of[-1,1]){const e=newMalware(m.x+s*22,m.y,'epm');e.alert=6;e.kx=s*180;e.sInv=0.5;enemies.push(e);burst(e.x,e.y-20,'#7cff3a',8);}}
}

/* ---------- Folhas de sprite dos ecos (recoloridas a partir do Kayzen) ---------- */
const ECO_PAL={
  gib:['#2a0a3a','#b0187a','#ff3bd0','#ffd34e','#fff6c0'],
  noir:null,
  pix:['#06180b','#14501f','#2fae3c','#7cff3a','#e6ffd0'],
  omega:['#0a0004','#3a0010','#a0001e','#ff2040','#ffd0d8'],
  ally:['#2a1a00','#7a4a00','#d08a10','#ffd34e','#fff8d8']
};
function hexRGB(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function makeEcoSheets(){
  for(const v in ECO_PAL){
    const pal=ECO_PAL[v]?ECO_PAL[v].map(hexRGB):null;
    for(const base of['walk','shoot']){
      const src=IMG[base];if(!src)continue;
      try{
        const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');
        if(v==='pix'){const t=document.createElement('canvas');t.width=Math.ceil(src.width/3);t.height=Math.ceil(src.height/3);const tg=t.getContext('2d');tg.drawImage(src,0,0,t.width,t.height);g.imageSmoothingEnabled=false;g.drawImage(t,0,0,c.width,c.height);}
        else g.drawImage(src,0,0);
        const id=g.getImageData(0,0,c.width,c.height),d=id.data;
        for(let i=0;i<d.length;i+=4){
          if(d[i+3]<20){d[i+3]=0;continue;}
          if(v==='pix')d[i+3]=255;
          const l=(0.3*d[i]+0.59*d[i+1]+0.11*d[i+2])/255;
          if(!pal){const q=Math.max(0,Math.min(255,(l-0.42)*1.9*255+128));d[i]=d[i+1]=d[i+2]=q;continue;}
          const glow=d[i+1]>150&&d[i+2]>150&&d[i]<120;   // detalhes que brilham (ciano) viram destaque
          const k=glow?4:Math.min(3,Math.floor(Math.pow(l,0.8)*4.2));const c2=pal[k];d[i]=c2[0];d[i+1]=c2[1];d[i+2]=c2[2];
        }
        g.putImageData(id,0,0);
        // contorno de tinta (estilo gibi)
        if(v==='gib'||v==='omega'){const o=document.createElement('canvas');o.width=c.width;o.height=c.height;const og=o.getContext('2d');
          for(const [dx,dy] of[[-1,0],[1,0],[0,-1],[0,1]])og.drawImage(c,dx,dy);og.globalCompositeOperation='source-in';og.fillStyle='#0a0008';og.fillRect(0,0,o.width,o.height);og.globalCompositeOperation='source-over';og.drawImage(c,0,0);
          IMG['e_'+v+'_'+base]=o;}else IMG['e_'+v+'_'+base]=c;
        SPR['e_'+v+'_'+base]={w:SPR[base].w,h:SPR[base].h,n:SPR[base].n};
      }catch(_){}
    }
  }
}
const ECO_OF={egb:'gib',enr:'noir',epx:'pix',epm:'pix',ecl:'omega'};
function drawEcoBody(m,v,sc,alpha){
  ctx.save();if(alpha!=null)ctx.globalAlpha=alpha;if(m.flash>0)ctx.filter='brightness(2.4)';
  const y=m.y+6;
  if(m.shootAnim>0){const t=1-m.shootAnim/0.28,seq=[2,3,4,5,0];drawSheet('e_'+v+'_shoot',seq[Math.min(4,Math.floor(t*5))],m.x,y,sc,m.face<0);}
  else drawSheet('e_'+v+'_walk',m.moving?Math.floor(m.anim)%4:0,m.x,y,sc,m.face<0);
  ctx.restore();
}
function drawEco(m){
  const v=ECO_OF[m.type],sc=m.type==='epm'?0.5:0.72;
  shadowAt(m.x,m.y+3,16*sc/0.72,6,0.35);
  ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle=m.t.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,m.y+3,20*sc/0.72,8,0,0,TAU);ctx.stroke();ctx.restore();
  if(m.ghosts)for(const gh of m.ghosts){ctx.save();ctx.globalAlpha=gh.t*0.8;drawSheet('e_'+v+'_walk',1,gh.x,gh.y+6,sc,gh.f<0);ctx.restore();}
  if(m.charge>0&&m.type==='egb'){ctx.save();ctx.strokeStyle='rgba(255,59,208,.8)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(m.x,m.y-20);ctx.lineTo(m.x+m.lx*330,m.y-20+m.ly*330);ctx.stroke();ctx.restore();}
  drawEcoBody(m,v,sc);
  if(m.charge>0&&m.type!=='egb'){const k=1-m.charge/0.45;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(m.x+m.face*24,m.y-40,1,m.x+m.face*24,m.y-40,6+k*14);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x+m.face*24,m.y-40,6+k*14,0,TAU);ctx.fill();ctx.restore();}
}
function ecoCommon(m,dt){m.sInv=Math.max(0,(m.sInv||0)-dt);m.shootAnim=Math.max(0,(m.shootAnim||0)-dt);if(m.ghosts){for(const g of m.ghosts)g.t-=dt*2.2;m.ghosts=m.ghosts.filter(g=>g.t>0);}}
Object.assign(EXT_AI,{
  egb(m,dt){ // ECO GIBI: investida com rastro
    ecoCommon(m,dt);const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));m.moving=false;m.lungeCd=Math.max(0,m.lungeCd-dt);
    if(m.dashT>0){m.dashT-=dt;m.moving=true;const ox=m.x;moveEntity(m,m.lx*640*dt*slowF(m),m.ly*640*dt*slowF(m));(m.ghosts=m.ghosts||[]).push({x:m.x,y:m.y,f:m.face,t:0.5});if(Math.abs(m.x-ox)<0.5&&Math.abs(m.lx)>0.5)m.dashT=0;return;}
    if(m.charge>0){m.charge-=dt;if(m.charge<=0){m.dashT=0.38;sfx('dash',m.x,m.y);}return;}
    if(state==='play'&&(d<480||m.alert>0)){
      m.face=P.x>m.x?1:-1;
      if(d<300&&m.lungeCd<=0){m.lx=(P.x-m.x)/d;m.ly=(P.y-m.y)/d;m.charge=0.45;m.lungeCd=2.6+Math.random();return;}
      m.moving=true;eMove(m,(P.x-m.x)/d,(P.y-m.y)/d,CFG.malwareSpeed*m.t.speed,dt);
    }else{m.moving=true;wander(m,dt);}
  },
  enr(m,dt){ // ECO NOIR: atira de longe
    ecoCommon(m,dt);const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));m.moving=false;
    if(state==='play'&&(d<600||m.alert>0)){
      m.face=P.x>m.x?1:-1;const dx=(P.x-m.x)/d,dy=(P.y-m.y)/d,k=d>380?1:d<260?-1:0;
      if(m.charge<=0){m.moving=true;eMove(m,dx*k-dy*m.strafe*0.6,dy*k+dx*m.strafe*0.6,CFG.malwareSpeed*m.t.speed,dt);if(Math.random()<dt*0.4)m.strafe=-m.strafe;}
      m.cool-=dt;
      if(m.charge>0){m.charge-=dt;if(m.charge<=0){const a=Math.atan2((P.y-30)-(m.y-40),P.x-m.x);fireBolt(m.x+m.face*24,m.y-40,a,400,'ink',9);m.shootAnim=0.28;sfx('eshot',m.x,m.y);m.cool=1.5+Math.random()*0.6;}}
      else if(m.cool<=0)m.charge=0.45;
    }else{m.moving=true;wander(m,dt);}
  },
  epx(m,dt){EXT_AI.epm(m,dt);},
  epm(m,dt){ // ECO PIXEL: persegue (o grande se divide em dois ao cair)
    ecoCommon(m,dt);const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));m.moving=true;
    if(state==='play'&&(d<520||m.alert>0)){m.face=P.x>m.x?1:-1;eMove(m,(P.x-m.x)/d,(P.y-m.y)/d,CFG.malwareSpeed*m.t.speed,dt);}else wander(m,dt);
  },
  ecl(m,dt){ // CLONE ÔMEGA
    ecoCommon(m,dt);const d=Math.max(1,Math.hypot(P.x-m.x,P.y-m.y));m.moving=true;m.face=P.x>m.x?1:-1;
    const dx=(P.x-m.x)/d,dy=(P.y-m.y)/d,k=d>340?1:d<240?-1:0;eMove(m,dx*k-dy*0.7,dy*k+dx*0.7,CFG.malwareSpeed*m.t.speed,dt);
    m.cool-=dt;if(m.cool<=0){const a=Math.atan2((P.y-30)-(m.y-40),P.x-m.x);for(const s of[-0.18,0,0.18])fireBolt(m.x,m.y-40,a+s,320,'plasma',8);m.shootAnim=0.28;sfx('eshot',m.x,m.y);m.cool=1.9+Math.random()*0.6;}
  }
});
for(const k of['egb','enr','epx','epm','ecl'])EXT_DRAW[k]=drawEco;

/* ---------- Chefe: KAYZEN ÔMEGA ---------- */
BOSS.omega={name:'KAYZEN ÔMEGA',title:'O Eco Corrompido',tag:'CHEFE',color:'#ff2050',hp:1100,r:22,dmg:12,scale:1.7,speed:0,sight:620};
function omegaAI(m,dt,d){
  m.actT-=dt;const R=m.rage;m.shootAnim=Math.max(0,(m.shootAnim||0)-dt);m.face=P.x>m.x?1:-1;m.moving=false;
  if(m.ghosts){for(const g of m.ghosts)g.t-=dt*2;m.ghosts=m.ghosts.filter(g=>g.t>0);}
  if(R&&!m.cloned){m.cloned=true;for(let i=0;i<2;i++)spawnMinion('ecl',m.x,m.y);sfx('roar');shake=18;comicFX.push({x:m.x,y:m.y-150,t:1.4,txt:'DIVISÃO!',col:'#ff2050',rot:-0.1,big:true});}
  const orbit=(sp)=>{const dx=(P.x-m.x)/d,dy=(P.y-m.y)/d,k=d>380?1:d<260?-1:0;m.moving=true;eMove(m,dx*k-dy*0.75,dy*k+dx*0.75,sp,dt);};
  switch(m.act){
    case 'walk':
      orbit(R?170:140);
      if(m.actT<=0){const pick=m.seq++%4;
        if(pick===0){m.act='fanT';m.actT=0.6;m.volley=R?4:3;sfx('charge',m.x,m.y);}
        else if(pick===1){m.act='dashT';m.actT=0.75;sfx('charge',m.x,m.y);}
        else if(pick===2){m.act='strike';m.actT=1.3;const n=R?6:4;for(let i=0;i<n;i++){const a=i/n*TAU+Math.random(),r=i===0?0:90+Math.random()*120;ostrikes.push({x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r,t:1.15,r:70});}sfx('cast');}
        else{if(countMinions()<7){m.act='portals';m.actT=0.6;for(let i=0;i<2;i++){const a=Math.random()*TAU,x=m.x+Math.cos(a)*170,y=m.y+Math.sin(a)*120;if(!hitsWall(x,y,30))oportals.push({x,y,t:1.1,type:Math.random()<.5?'egb':'enr'});}sfx('portalOpen');}else{m.act='fanT';m.actT=0.6;m.volley=3;}}}
      break;
    case 'fanT':
      if(m.actT<=0){const a=Math.atan2((P.y-30)-(m.y-50),P.x-m.x),n=R?7:5;for(let i=0;i<n;i++)fireBolt(m.x+m.face*30,m.y-50,a+(i-(n-1)/2)*0.15,360,'plasma',9);
        m.shootAnim=0.28;sfx('eshot',m.x,m.y);m.volley--;if(m.volley>0)m.actT=0.42;else{m.act='walk';m.actT=1.3;}}
      break;
    case 'dashT':
      if(m.actT>0.3){m.cdx=(P.x-m.x)/d;m.cdy=(P.y-m.y)/d;}
      if(m.actT<=0){m.act='dash';m.actT=0.42;sfx('dash',m.x,m.y);}
      break;
    case 'dash':{
      m.moving=true;const ox=m.x,oy=m.y;moveEntity(m,m.cdx*(R?1000:900)*dt,m.cdy*(R?1000:900)*dt);(m.ghosts=m.ghosts||[]).push({x:m.x,y:m.y,f:m.face,t:0.5});
      if(Math.hypot(P.x-m.x,P.y-m.y)<m.r+P.r+10&&(P.z||0)<16)hurtPlayer(16,m);
      if(m.actT<=0||Math.hypot(m.x-ox,m.y-oy)<1){m.act='walk';m.actT=R?0.9:1.3;}
      break;}
    case 'strike':orbit(60);if(m.actT<=0){m.act='walk';m.actT=1.1;}break;
    case 'portals':if(m.actT<=0){m.act='walk';m.actT=1.6;}break;
  }
}
function drawOmega(m){
  const sc=1.15,x=m.x,y=m.y;
  ctx.save();ctx.globalCompositeOperation='lighter';const ag=ctx.createRadialGradient(x,y-50,4,x,y-50,110);ag.addColorStop(0,m.rage?'rgba(255,32,80,.45)':'rgba(255,32,80,.28)');ag.addColorStop(1,'rgba(255,32,80,0)');ctx.fillStyle=ag;ctx.beginPath();ctx.arc(x,y-50,110,0,TAU);ctx.fill();ctx.restore();
  shadowAt(x,y+4,34,11,.45);
  if(m.act==='dashT'){ctx.save();const k=1-m.actT/0.75;ctx.translate(x,y-30);ctx.rotate(Math.atan2(m.cdy,m.cdx));ctx.fillStyle='rgba(255,32,80,'+(0.12+0.25*k)+')';ctx.fillRect(0,-26,620,52);ctx.strokeStyle='rgba(255,90,120,.9)';ctx.lineWidth=2;ctx.setLineDash([12,10]);ctx.strokeRect(0,-26,620,52);ctx.restore();}
  if(m.act==='fanT'){const k=1-m.actT/0.6;ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,80,120,'+(0.4+0.5*k)+')';ctx.beginPath();ctx.arc(x+m.face*30,y-50,8+k*16,0,TAU);ctx.fill();ctx.restore();}
  if(m.ghosts)for(const gh of m.ghosts){ctx.save();ctx.globalAlpha=gh.t*0.7;drawSheet('e_omega_walk',1,gh.x,gh.y+6,sc,gh.f<0);ctx.restore();}
  const gl=m.rage||Math.random()<0.06;
  if(gl){ctx.save();ctx.globalAlpha=0.35;drawSheet('e_omega_walk',m.moving?Math.floor(m.anim)%4:0,x+5,y+6,sc,m.face<0);drawSheet('e_omega_walk',m.moving?Math.floor(m.anim)%4:0,x-5,y+6,sc,m.face<0);ctx.restore();}
  ctx.save();if(m.flash>0)ctx.filter='brightness(2.2)';
  if(m.shootAnim>0){const t=1-m.shootAnim/0.28,seq=[2,3,4,5,0];drawSheet('e_omega_shoot',seq[Math.min(4,Math.floor(t*5))],x,y+6,sc,m.face<0);}
  else drawSheet('e_omega_walk',m.moving?Math.floor(m.anim)%4:0,x,y+6,sc,m.face<0);
  ctx.restore();
  ctx.save();ctx.fillStyle='#ff2050';ctx.shadowColor='#ff2050';ctx.shadowBlur=12;ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText('Ω',x,y-128);ctx.restore();
}
function updateOmegaFX(dt){
  for(const s of ostrikes){s.t-=dt;if(s.t<=0&&!s.done){s.done=true;s.fx=0.35;shake=Math.max(shake,8);sfx('boom',s.x,s.y);burst(s.x,s.y,'#ff2050',16);burst(s.x,s.y,'#ffd0d8',8);
      if(state==='play'&&Math.hypot(P.x-s.x,P.y-s.y)<s.r+P.r&&(P.z||0)<20)hurtPlayer(15,s);}
    if(s.done)s.fx-=dt;}
  ostrikes=ostrikes.filter(s=>!s.done||s.fx>0);
  for(const o of oportals){o.t-=dt;if(o.t<=0&&!o.done){o.done=true;const e=newMalware(o.x,o.y,o.type);e.alert=6;enemies.push(e);burst(o.x,o.y-20,'#7cff3a',16);o.fx=0.5;}if(o.done)o.fx-=dt;}
  oportals=oportals.filter(o=>!o.done||o.fx>0);
}
function drawOmegaFX(){
  for(const s of ostrikes){
    if(!s.done){const k=1-s.t/1.15;ctx.save();ctx.fillStyle='rgba(255,32,80,'+(0.1+0.2*k)+')';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,80,120,'+(0.25+0.35*k)+')';ctx.beginPath();ctx.arc(s.x,s.y,s.r*k,0,TAU);ctx.fill();
      ctx.strokeStyle='#ff2050';ctx.lineWidth=3;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.stroke();ctx.restore();}
    else{const k=s.fx/0.35;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*1.3);g.addColorStop(0,'rgba(255,255,255,'+k+')');g.addColorStop(.5,'rgba(255,32,80,'+(0.7*k)+')');g.addColorStop(1,'rgba(255,32,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,s.r*1.3,0,TAU);ctx.fill();
      const bw=30*k+4;ctx.fillStyle='rgba(255,180,200,'+(0.8*k)+')';ctx.fillRect(s.x-bw/2,s.y-300,bw,300);ctx.restore();}
  }
  for(const o of oportals){const k=o.done?Math.max(0,o.fx/0.5):Math.min(1,(1.1-o.t)*3);if(pImgOK()){ctx.save();ctx.globalAlpha=k;ctx.translate(o.x,o.y-30);ctx.rotate(uiT*2);ctx.drawImage(portalImg,-28,-45,56,90);ctx.restore();}}
}

/* ---------- Habilidade nova: ECO ALIADO ---------- */
function doAlly(){
  if(!hasAlly()||abilityBlocked())return;
  if(abil.allyCd>0){abil.adeny=0.3;sfx('deny');return;}
  ally={x:P.x-P.face*60,y:P.y+6,t:7,fireT:0.4,face:P.face,anim:0,shootAnim:0,moving:false};abil.allyCd=15;
  sfx('portalArrive');burst(ally.x,ally.y-30,'#ffd34e',24);burst(ally.x,ally.y-30,'#ffffff',10);
  if(curPhase===4)comicFX.push({x:ally.x,y:ally.y-110,t:1,txt:'ECO!',col:'#ffd34e',rot:-0.12,big:true});
}
function updateAlly(dt){
  abil.allyCd=Math.max(0,abil.allyCd-dt);abil.adeny=Math.max(0,abil.adeny-dt);
  if(!ally)return;
  ally.t-=dt;if(ally.t<=0||state!=='play'){burst(ally.x,ally.y-30,'#ffd34e',18);ally=null;return;}
  const tx=P.x-P.face*60,ty=P.y+8,dd=Math.hypot(tx-ally.x,ty-ally.y);ally.moving=dd>8;
  ally.x+=(tx-ally.x)*Math.min(1,dt*5);ally.y+=(ty-ally.y)*Math.min(1,dt*5);ally.anim+=dt*(ally.moving?10:4);ally.shootAnim=Math.max(0,ally.shootAnim-dt);
  let best=null,bd=520;for(const m of enemies){if(m.dead||(m.boss&&m.alpha<0.5)||m.fade>0)continue;const d=Math.hypot(m.x-ally.x,m.y-ally.y);if(d<bd){bd=d;best=m;}}
  if(best){ally.face=best.x>ally.x?1:-1;ally.fireT-=dt;
    if(ally.fireT<=0){const sx=ally.x+ally.face*28,sy=ally.y-34,a=Math.atan2((best.y-(best.boss?50:22))-sy,best.x-sx);
      bolts.push({x:sx,y:sy,vx:Math.cos(a)*CFG.boltSpeed,vy:Math.sin(a)*CFG.boltSpeed,t:CFG.boltLife,a});ally.fireT=0.32;ally.shootAnim=0.28;sv=0.7;tone('square',900,500,.05,.08);}}
  else ally.face=P.face;
}
function drawAlly(){
  if(!ally)return;const a=Math.min(1,ally.t*2);
  shadowAt(ally.x,ally.y+3,18,6,0.3*a);
  ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(ally.x,ally.y-36,4,ally.x,ally.y-36,60);g.addColorStop(0,'rgba(255,211,78,.28)');g.addColorStop(1,'rgba(255,211,78,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(ally.x,ally.y-36,60,0,TAU);ctx.fill();ctx.restore();
  const m={x:ally.x,y:ally.y,face:ally.face,shootAnim:ally.shootAnim,moving:ally.moving,anim:ally.anim,flash:0};
  drawEcoBody(m,'ally',0.72,0.92*a);
  ctx.save();ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffd34e';ctx.fillText('ECO '+Math.ceil(ally.t),ally.x,ally.y-82);ctx.restore();
}

/* ---------- Mapa e cenário da Fase 4 ---------- */
function buildFloorMulti(){
  const g=ensureFloor(),R=rng(4444),hw=WW/2,hh=WH/2,cx=hw,cy=hh;
  // UNIVERSO GIBI (sup. esquerdo): magenta escuro com retícula
  g.fillStyle='#3a1240';g.fillRect(0,0,hw,hh);
  for(let y=0;y<hh;y+=14)for(let x=(y/14%2)*7;x<hw;x+=14){const r=1.2+2.2*(0.5+0.5*Math.sin(x*0.004+y*0.003));g.fillStyle='rgba(255,59,208,.22)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  for(let i=0;i<22;i++){const x=R()*hw,y=R()*hh,s=60+R()*90;g.save();g.translate(x,y);g.rotate(R()*TAU);g.strokeStyle='rgba(255,211,78,.25)';g.lineWidth=3;g.beginPath();for(let k=0;k<12;k++){const a=k/12*TAU,rr=k%2?s*0.45:s;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.stroke();g.restore();}
  // UNIVERSO NOIR (sup. direito): preto e branco, hachuras
  g.fillStyle='#161616';g.fillRect(hw,0,hw,hh);
  g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;g.beginPath();for(let k=-hh;k<hw;k+=12){g.moveTo(hw+k,0);g.lineTo(hw+k+hh,hh);}g.stroke();
  for(let i=0;i<40;i++){const x=hw+R()*hw,y=R()*hh;g.fillStyle='rgba(255,255,255,'+(0.03+R()*0.05)+')';g.beginPath();g.ellipse(x,y,30+R()*90,8+R()*20,R()*3,0,TAU);g.fill();}
  // UNIVERSO 8-BIT (inf. esquerdo): xadrez de pixels
  for(let y=hh;y<WH;y+=32)for(let x=0;x<hw;x+=32){g.fillStyle=((x+y)/32)%2?'#0e2a16':'#123a1e';g.fillRect(x,y,32,32);if(R()<0.05){g.fillStyle='#1f6a30';g.fillRect(x+8,y+8,8,8);}}
  // UNIVERSO NEON (inf. direito)
  g.fillStyle='#120a26';g.fillRect(hw,hh,hw,hh);
  g.strokeStyle='rgba(0,229,255,.08)';g.lineWidth=1;g.beginPath();for(let x=hw;x<WW;x+=64){g.moveTo(x,hh);g.lineTo(x,WH);}for(let y=hh;y<WH;y+=64){g.moveTo(hw,y);g.lineTo(WW,y);}g.stroke();
  for(let i=0;i<34;i++){let x=hw+R()*hw,y=hh+R()*hh;g.strokeStyle=R()<.5?'rgba(255,59,208,.35)':'rgba(0,229,255,.35)';g.lineWidth=3+R()*4;g.lineCap='round';g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(R()-.5)*120;y+=(R()-.5)*80;g.lineTo(x,y);}g.stroke();}
  // arena central: mosaico dos 4 universos + fenda
  const cols=['#ff3bd0','#e6e6e6','#7cff3a','#00e5ff'];
  for(let r=560;r>40;r-=70){for(let q=0;q<4;q++){g.fillStyle=q%2?'rgba(10,6,20,.9)':'rgba(20,10,30,.9)';g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,r,q*Math.PI/2+Math.PI,(q+1)*Math.PI/2+Math.PI);g.closePath();g.fill();}
    g.strokeStyle=cols[(r/70|0)%4];g.globalAlpha=0.35;g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();g.globalAlpha=1;}
  g.save();g.translate(cx,cy);g.lineJoin='round';
  for(const [col,o] of[['rgba(255,59,208,.7)',-4],['rgba(0,229,255,.7)',4],['rgba(255,255,255,.95)',0]]){g.strokeStyle=col;g.lineWidth=o?6:3;g.beginPath();let y=-240,x=o;g.moveTo(x,y);const r2=rng(7);while(y<240){x=o+(r2()-.5)*60;y+=30;g.lineTo(x,y);}g.stroke();}
  g.restore();
  // costuras entre universos
  g.save();g.lineJoin='round';
  const seam=(x0,y0,x1,y1,seed)=>{const r3=rng(seed);for(const [col,w,o] of[['rgba(255,59,208,.55)',8,-3],['rgba(0,229,255,.55)',8,3],['rgba(255,255,255,.8)',2,0]]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();const n=60;for(let i=0;i<=n;i++){const u=i/n,x=x0+(x1-x0)*u+(x0===x1?(r3()-.5)*26+o:0),y=y0+(y1-y0)*u+(y0===y1?(r3()-.5)*26+o:0);i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}};
  seam(hw,0,hw,hh-560,11);seam(hw,hh+560,hw,WH,12);seam(0,hh,hw-560,hh,13);seam(hw+560,hh,WW,hh,14);
  g.restore();
  for(const [x,y] of lights){const z=zoneOf(x,y);if(z===1)continue;const c=['255,59,208','0,0,0','124,255,58','0,229,255'][z];const gr=g.createRadialGradient(x,y,3,x,y,130);gr.addColorStop(0,'rgba('+c+',.10)');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(x-130,y-130,260,260);}
  // paredes no estilo de cada universo
  walls.forEach(([x,y,w,h])=>{
    if(y<0||x<0||x>=WW||y>=WH){g.fillStyle='#05030a';g.fillRect(x,y,w,h);return;}
    const z=zoneOf(x+w/2,y+h/2);
    g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x+8,y+10,w,h);
    if(z===0){g.fillStyle='#ffd34e';g.fillRect(x,y,w,h);for(let yy=y+6;yy<y+h;yy+=10)for(let xx=x+6+((yy-y)/10%2)*5;xx<x+w;xx+=10){g.fillStyle='rgba(255,59,208,.55)';g.beginPath();g.arc(xx,yy,2.4,0,TAU);g.fill();}
      g.strokeStyle='#0a0008';g.lineWidth=5;g.strokeRect(x+2,y+2,w-4,h-4);g.lineWidth=2;g.beginPath();g.moveTo(x+12,y+h*0.62);g.lineTo(x+w-12,y+h*0.62);g.stroke();}
    else if(z===1){g.fillStyle='#e8e8e8';g.fillRect(x,y,w,h);g.fillStyle='#111';g.fillRect(x+6,y+6,w-12,h-12);
      g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;g.beginPath();for(let k=0;k<w+h;k+=8){g.moveTo(x+6+Math.min(k,w-12),y+6+Math.max(0,k-(w-12)));g.lineTo(x+6+Math.max(0,k-(h-12)),y+6+Math.min(k,h-12));}g.stroke();
      for(let yy=y+16;yy<y+h-16;yy+=28)for(let xx=x+16;xx<x+w-20;xx+=26){g.fillStyle=R()<.3?'#f2f2f2':'#2a2a2a';g.fillRect(xx,yy,12,14);}}
    else if(z===2){for(let yy=y;yy<y+h;yy+=16)for(let xx=x;xx<x+w;xx+=16){g.fillStyle=((xx-x)/16+(yy-y)/16)%2?'#2fae3c':'#27933a';g.fillRect(xx,yy,Math.min(16,x+w-xx),Math.min(16,y+h-yy));}
      g.fillStyle='#7cff3a';g.fillRect(x,y,w,4);g.fillRect(x,y,4,h);g.fillStyle='#06180b';g.fillRect(x,y+h-4,w,4);g.fillRect(x+w-4,y,4,h);}
    else{g.fillStyle='#1c1238';g.fillRect(x,y,w,h);g.strokeStyle='rgba(0,229,255,.8)';g.lineWidth=2;g.strokeRect(x+3,y+3,w-6,h-6);g.strokeStyle='rgba(255,59,208,.6)';g.strokeRect(x+8,y+8,w-16,h-16);
      for(let yy=y+16;yy<y+h-14;yy+=20)for(let xx=x+14;xx<x+w-16;xx+=22){g.fillStyle=R()<.4?'rgba(0,229,255,.6)':'rgba(255,59,208,.35)';g.fillRect(xx,yy,10,8);}}
  });
}
function halftone(){if(halfPat)return halfPat;const c=document.createElement('canvas');c.width=c.height=10;const g=c.getContext('2d');g.fillStyle='rgba(255,59,208,1)';g.beginPath();g.arc(5,5,2,0,TAU);g.fill();halfPat=ctx.createPattern(c,'repeat');return halfPat;}
function updateMulti(dt){
  updateAlly(dt);
  if(curPhase!==4)return;
  updateOmegaFX(dt);
  for(const f of comicFX)f.t-=dt;comicFX=comicFX.filter(f=>f.t>0);
  zoneBanner=Math.max(0,zoneBanner-dt);glitchT-=dt;
  if(P&&state==='play'){const z=zoneOf(P.x,P.y);if(z!==zoneNow){if(zoneNow!==-1){zoneBanner=2;sv=1;noiseBurst(0.4,0.25,6000,300);tone('triangle',880,1320,0.25,0.12);}zoneNow=z;glitchT=0.25;}}
}
function drawMultiFX(){
  if(curPhase!==4)return;
  // efeitos de mundo (posição no mapa)
  ctx.save();ctx.translate(-cam.x,-cam.y);
  for(const f of comicFX){const k=Math.min(1,f.t*3),s=f.big?1.25:0.9;ctx.save();ctx.translate(f.x,f.y-(1-f.t)*20);ctx.rotate(f.rot);ctx.scale(s*(0.8+0.2*k),s*(0.8+0.2*k));ctx.globalAlpha=k;
    ctx.font='900 '+(f.big?30:22)+'px Impact,"Arial Black",system-ui';ctx.textAlign='center';ctx.lineJoin='round';
    const w=ctx.measureText(f.txt).width;ctx.fillStyle='#fff';ctx.beginPath();for(let i=0;i<14;i++){const a=i/14*TAU,r=(i%2?0.55:0.75)*(w*0.8+18);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.6-8);}ctx.closePath();ctx.fill();ctx.strokeStyle='#0a0008';ctx.lineWidth=3;ctx.stroke();
    ctx.lineWidth=6;ctx.strokeStyle='#0a0008';ctx.strokeText(f.txt,0,0);ctx.fillStyle=f.col;ctx.fillText(f.txt,0,0);ctx.restore();}
  ctx.restore();
  // filtros de tela de cada universo
  const z=zoneNow;
  if(z===1){ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.fillRect(0,0,VW,VH);ctx.globalCompositeOperation='source-over';
    const vg=ctx.createRadialGradient(VW/2,VH/2,VH*0.3,VW/2,VH/2,VW*0.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vg;ctx.fillRect(0,0,VW,VH);
    ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<40;i++){const x=(i*97+uiT*600)%VW,y=(i*53+uiT*900)%VH;ctx.moveTo(x,y);ctx.lineTo(x-4,y+14);}ctx.stroke();ctx.restore();}
  else if(z===0){ctx.save();ctx.globalAlpha=0.07;ctx.fillStyle=halftone();ctx.fillRect(0,0,VW,VH);ctx.restore();
    ctx.save();ctx.strokeStyle='#0a0008';ctx.lineWidth=10;ctx.strokeRect(5,5,VW-10,VH-10);ctx.restore();}
  else if(z===2){ctx.save();ctx.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<VH;y+=3)ctx.fillRect(0,y,VW,1);ctx.restore();}
  // falha de realidade (separação RGB) de vez em quando
  if(glitchT<=0&&Math.random()<0.004)glitchT=0.18;
  if(glitchT>0){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.22;ctx.drawImage(cv,6*DPR,0);ctx.drawImage(cv,-6*DPR,0);ctx.restore();
    ctx.save();ctx.setTransform(1,0,0,1,0,0);for(let i=0;i<4;i++){const y=Math.random()*cv.height,h=(6+Math.random()*16)*DPR;ctx.drawImage(cv,0,y,cv.width,h,(Math.random()-.5)*24*DPR,y,cv.width,h);}ctx.restore();}
  if(zoneBanner>0&&zoneNow>=0){const Z=ZONES[zoneNow],a=Math.min(1,zoneBanner*2,(2-zoneBanner)*4);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
    ctx.font='900 36px Impact,"Arial Black",system-ui';ctx.lineJoin='round';ctx.lineWidth=8;ctx.strokeStyle='#0a0008';ctx.strokeText(Z.name,VW/2,96);ctx.fillStyle=Z.col;ctx.fillText(Z.name,VW/2,96);
    ctx.font='italic 15px Georgia,serif';ctx.lineWidth=4;ctx.strokeText(Z.sub,VW/2,118);ctx.fillStyle='#fff';ctx.fillText(Z.sub,VW/2,118);ctx.restore();}
}


/* =====================================================================
   PROGRESSÃO: chefe no fim de cada fase, arma lendária, portal só no final,
   dificuldade crescente, tela mais limpa e som de tiro garantido
   ===================================================================== */
const DIFF_T={1:{hp:1,dmg:1,spd:1},2:{hp:1.2,dmg:1.15,spd:1.05},3:{hp:1.4,dmg:1.3,spd:1.1},4:{hp:1.6,dmg:1.45,spd:1.15}};
function DIFF(){return DIFF_T[curPhase]||DIFF_T[1];}
BOSS.forja.hp=900;BOSS.vexx.hp=1100;BOSS.omega.hp=1300;
BOSS.queen={name:'RAINHA DO ENXAME',title:'A Mãe dos Malwares',tag:'CHEFE',color:'#7cff3a',hp:650,r:34,dmg:10,scale:3.2,speed:0,sight:700};
PHASE_DEF[1].boss='queen';
PHASE_DEF[1].count=20;PHASE_DEF[2].count=18;PHASE_DEF[3].count=20;PHASE_DEF[4].count=22;
const PHASE_BOSS_TXT={1:'RAINHA DO ENXAME — laser giratório, chuva ácida e invoca drones',2:'FORJA-X — anel de brasas e investida (bata ele na parede!)',3:'VEXX — espiral de energia, leque de gelo e teletransporte',4:'KAYZEN ÔMEGA — usa as suas armas contra você e se divide em clones'};
const WPN={
  1:{id:'rail',name:'CANHÃO DE PLASMA',desc:'um raio que atravessa tudo pela frente',cd:22,col:'#00e5ff'},
  2:{id:'meteor',name:'CHUVA DE METEOROS',desc:'meteoros caem onde você mirar',cd:28,col:'#ff8a1f'},
  3:{id:'zero',name:'ZERO ABSOLUTO',desc:'congela e fere todos ao redor',cd:32,col:'#8ff3ff'},
  4:{id:'arsenal',name:'ARSENAL DO MULTIVERSO',desc:'6 s de tiros teleguiados sem parar',cd:36,col:'#ffd34e'}
};
let wpn={owned:false,cd:0,deny:0,act:0,charge:0,acc:0},crate=null,bossSpawned=false,cleared=false,bossWarn=0,meteors=[],beams=[],announce=null,frostFX=0,helpT=0;
function progReset(){inhalers=[];inhSpawned=false;wpn={owned:false,cd:0,deny:0,act:0,charge:0,acc:0};crate=null;bossSpawned=false;cleared=false;bossWarn=0;meteors=[];beams=[];announce=null;frostFX=0;helpT=12;}
function announceMsg(txt,sub,col,t){announce={txt,sub:sub||'',col:col||'#ffd34e',t:t||3,max:t||3};}

/* ---------- Chefe só no fim + arma lendária ---------- */
function freeSpotNear(x,y,dmin,dmax,r){
  const cx=WW/2,cy=WH/2,base=Math.atan2(cy-y,cx-x);
  for(let k=0;k<40;k++){const a=base+(Math.random()-.5)*(k<20?1.6:6.2),d=dmin+Math.random()*(dmax-dmin),tx=x+Math.cos(a)*d,ty=y+Math.sin(a)*d;
    if(tx>r+60&&ty>r+60&&tx<WW-r-60&&ty<WH-r-60&&!hitsWall(tx,ty,r)&&!inLava(tx,ty,r))return{x:tx,y:ty};}
  return{x:Math.max(200,Math.min(WW-200,x+300)),y:Math.max(200,Math.min(WH-200,y))};
}
function extCheckClear(){
  if(state!=='play'||cleared||ptravel)return;
  if(!bossSpawned){
    if(countMinions()===0&&bossWarn<=0){
      bossWarn=1.8;bossSpawned=true;ebolts=[];
      const s=freeSpotNear(P.x,P.y,70,110,26);crate={x:s.x,y:s.y,t:0};
      sv=1;tone('sawtooth',300,900,0.6,0.16);tone('sawtooth',300,900,0.6,0.16,0.7);
      announceMsg('⚠ ALERTA: CHEFE A CAMINHO','Pegue a ARMA LENDÁRIA que apareceu perto de você!','#ff3b6b',2.6);
    }
  }else if(bossWarn<=0&&enemies.length===0)phaseWon();
}
function spawnPhaseBoss(){
  const kind=PHASE_DEF[curPhase].boss,B=BOSS[kind],s=freeSpotNear(P.x,P.y,380,520,B.r+20);
  spawnBoss(kind);boss.x=s.x;boss.y=s.y;boss.px=s.x;boss.py=s.y;boss.awake=true;boss.actT=1.6;bossBanner=2.8;
  sfx('roar');shake=18;burst(s.x,s.y-40,B.color,36);burst(s.x,s.y-40,'#ffffff',16);
}
function updateProgress(dt){
  updateInhalers(dt);
  if(announce){announce.t-=dt;if(announce.t<=0)announce=null;}
  helpT=Math.max(0,helpT-dt);frostFX=Math.max(0,frostFX-dt);
  if(bossWarn>0&&state==='play'){bossWarn-=dt;if(bossWarn<=0)spawnPhaseBoss();}
  if(crate){crate.t+=dt;if(P&&state==='play'&&Math.hypot(P.x-crate.x,P.y-crate.y)<48){pickCrate();}}
  updateWeapon(dt);
}
function pickCrate(){
  const W=WPN[curPhase];crate=null;wpn.owned=true;wpn.cd=0;
  sfx('ready');sv=1;tone('triangle',523,1046,0.4,0.18);tone('triangle',784,1568,0.4,0.14,0.12);
  burst(P.x,P.y-40,W.col,30);burst(P.x,P.y-40,'#ffffff',12);
  announceMsg('NOVA ARMA: '+W.name,(touchDevice?'Botão ARMA':'Tecla G ou ícone ARMA')+' — '+W.desc,W.col,3.2);
}
function phaseWon(){
  stopWeaponReloadAudio();mouse.down=false;mobileFire=false;ebolts=[];ostrikes=[];
  cleared=true;sfx('win');P.hp=CFG.playerHP;
  if(curPhase<3){
    unlocked=Math.max(unlocked,curPhase+1);saveProgress();refreshPhases();
    announceMsg('ÁREA LIMPA! PORTAL LIBERADO',(touchDevice?'Toque em PORTAL':'Aperte E')+', abra o portal e entre nele para ir à Fase '+(curPhase+1),'#9dff4d',6);
  }else{
    state='win';unlocked=4;saveProgress();refreshPhases();endingDelay=2.8;endingSet=curPhase===3?'end':'end2';
  }
}

/* ---------- Armas lendárias ---------- */
function weaponAim(){
  if(!touchDevice)return{x:mouse.x+cam.x,y:mouse.y+cam.y};
  let best=null,bd=900;for(const m of enemies){if(m.dead||(m.boss&&m.alpha<0.5))continue;const d=Math.hypot(m.x-P.x,m.y-P.y)-(m.boss?200:0);if(d<bd){bd=d;best=m;}}
  if(best)return{x:best.x,y:best.y-(best.boss?40:16)};
  return{x:P.x+P.face*300,y:P.y-34};
}
const WSND={
  railCharge(){sv=1;tone('sine',180,2400,0.45,0.16);tone('sawtooth',90,1200,0.45,0.08);noiseBurst(0.45,0.08,800,9000);},
  railFire(){sv=1;noiseBurst(0.25,0.55,12000,2000);tone('sine',2600,90,0.35,0.3);tone('square',140,40,0.5,0.25);tone('sine',55,30,0.6,0.5);},
  meteorCall(){sv=1;tone('sawtooth',70,45,1.2,0.22);tone('sine',140,90,1.2,0.12);noiseBurst(1.2,0.18,500,120);},
  meteorWhistle(d){sv=1;tone('sine',2200,350,0.6,0.07,d);},
  meteorHit(x,y){sv=Math.max(0.2,1-Math.hypot(x-P.x,y-P.y)/900);noiseBurst(0.45,0.5,1400,60);tone('sine',90,28,0.5,0.45);tone('square',260,70,0.18,0.12);},
  zero(){sv=1;[2093,2637,3136,4186].forEach((f,i)=>tone('triangle',f,f*0.97,0.9,0.08,i*0.05));tone('sine',3000,300,0.9,0.18);noiseBurst(1,0.25,14000,4000);tone('sine',90,60,0.6,0.25,0.05);},
  zeroCrack(){sv=1;tone('triangle',1600,600,0.12,0.1);noiseBurst(0.1,0.12,9000,3000);},
  arsenalStart(){sv=1;[523,659,784,1046,1318].forEach((f,i)=>tone('square',f,f,0.08,0.09,i*0.06));tone('sawtooth',100,800,0.4,0.1);},
  arsenalShot(){sv=0.7;const f=1700+Math.random()*500;tone('triangle',f,f*0.45,0.05,0.07);},
  arsenalEnd(){sv=1;tone('square',1046,180,0.45,0.12);}
};
function useWeapon(){
  if(!wpn.owned||abilityBlocked())return;
  if(wpn.cd>0||wpn.act>0||wpn.charge>0){wpn.deny=0.3;sfx('deny');return;}
  const W=WPN[curPhase];wpn.cd=W.cd;
  const T=weaponAim();P.face=T.x>=P.x?1:-1;P.shootAnim=0.28;
  if(W.id==='rail'){wpn.charge=0.45;WSND.railCharge();}
  else if(W.id==='meteor'){for(let i=0;i<9;i++){const a=Math.random()*TAU,r=Math.random()*150;meteors.push({x:T.x+Math.cos(a)*r,y:T.y+Math.sin(a)*r,t:0.7+i*0.2,max:0.7+i*0.2,done:false,fx:0});WSND.meteorWhistle(0.1+i*0.2);}WSND.meteorCall();}
  else if(W.id==='zero'){
    frostFX=0.8;shake=14;WSND.zero();burst(P.x,P.y-30,'#e9fbff',40);let nfz=0;
    for(const m of enemies){if(m.dead)continue;const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<700){m.frozen=m.boss?2.5:4;if(nfz++<6)setTimeout(WSND.zeroCrack,120+nfz*70);hitMalware(m,50,{x:m.x,y:m.y-10,vx:m.x-P.x||1,vy:m.y-P.y,skill:true});}}
  }else if(W.id==='arsenal'){wpn.act=6;WSND.arsenalStart();if(curPhase===4)comicFX.push({x:P.x,y:P.y-110,t:1.2,txt:'ARSENAL!',col:'#ffd34e',rot:-0.1,big:true});}
}
function segDist(px,py,x,y,a,L){const dx=Math.cos(a),dy=Math.sin(a),t=Math.max(0,Math.min(L,(px-x)*dx+(py-y)*dy));return Math.hypot(px-(x+dx*t),py-(y+dy*t));}
function updateWeapon(dt){
  wpn.cd=Math.max(0,wpn.cd-dt);wpn.deny=Math.max(0,wpn.deny-dt);
  for(const b of beams)b.t-=dt;beams=beams.filter(b=>b.t>0);
  if(!P||state!=='play')return;
  if(wpn.charge>0){wpn.charge-=dt;P.shootAnim=0.28;
    if(wpn.charge<=0){const T=weaponAim(),x=P.x+P.face*24,y=P.y-34,a=Math.atan2(T.y-y,T.x-x),L=1500;P.face=Math.cos(a)>=0?1:-1;
      beams.push({x,y,a,L,t:0.5});shake=16;WSND.railFire();
      for(const m of enemies){if(m.dead)continue;if(segDist(m.x,m.y-20,x,y,a,L)<m.r+26)hitMalware(m,150,{x:m.x,y:m.y-10,vx:Math.cos(a),vy:Math.sin(a),skill:true});}}}
  for(const mt of meteors){if(mt.done){mt.fx-=dt;continue;}mt.t-=dt;
    if(mt.t<=0){mt.done=true;mt.fx=0.4;shake=Math.max(shake,9);WSND.meteorHit(mt.x,mt.y);burst(mt.x,mt.y,'#ff8a1f',18);burst(mt.x,mt.y,'#ffe27a',8);
      for(const m of enemies){if(m.dead)continue;if(Math.hypot(m.x-mt.x,m.y-mt.y)<80+m.r*0.5){const a=Math.atan2(m.y-mt.y,m.x-mt.x);hitMalware(m,55,{x:m.x,y:m.y-10,vx:Math.cos(a),vy:Math.sin(a),skill:true});}}}}
  meteors=meteors.filter(m=>!m.done||m.fx>0);
  if(wpn.act>0){wpn.act-=dt;wpn.acc+=dt;if(wpn.act<=0)WSND.arsenalEnd();
    while(wpn.acc>0.075){wpn.acc-=0.075;
      let best=null,bd=650;for(const m of enemies){if(m.dead||(m.boss&&m.alpha<0.5))continue;const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<bd){bd=d;best=m;}}
      const sx=P.x+P.face*28,sy=P.y-34,a=best?Math.atan2((best.y-(best.boss?45:20))-sy,best.x-sx)+(Math.random()-.5)*0.12:(P.face>0?0:Math.PI)+(Math.random()-.5)*0.3;
      bolts.push({x:sx,y:sy,vx:Math.cos(a)*CFG.boltSpeed*1.15,vy:Math.sin(a)*CFG.boltSpeed*1.15,t:CFG.boltLife,a});P.shootAnim=0.28;WSND.arsenalShot();}}
}
function drawFrozen(m){
  if(!(m.frozen>0))return;const s=(m.boss?2:1)*(m.r+16),k=Math.min(1,m.frozen*2);
  ctx.save();ctx.globalAlpha=0.55*k;const g=ctx.createLinearGradient(m.x,m.y-s*2,m.x,m.y);g.addColorStop(0,'rgba(233,251,255,.9)');g.addColorStop(1,'rgba(120,200,255,.6)');
  ctx.fillStyle=g;rrect(m.x-s,m.y-s*2.2,s*2,s*2.3,8);ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function drawWeaponWorld(){
  if(crate){const b=Math.sin(crate.t*4)*5,W=WPN[curPhase];
    ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(crate.x,crate.y-20,4,crate.x,crate.y-20,70);g.addColorStop(0,'rgba(255,211,78,.5)');g.addColorStop(1,'rgba(255,211,78,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(crate.x,crate.y-20,70,0,TAU);ctx.fill();
    for(let i=0;i<3;i++){const a=crate.t*2+i*2.1;ctx.fillStyle=W.col;ctx.fillRect(crate.x+Math.cos(a)*34,crate.y-24+Math.sin(a)*12,3,3);}ctx.restore();
    shadowAt(crate.x,crate.y+2,24,7,0.4);
    ctx.save();ctx.translate(crate.x,crate.y-24+b);ctx.fillStyle='#2a2316';rrect(-22,-16,44,32,5);ctx.fill();ctx.strokeStyle='#ffd34e';ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle=W.col;ctx.fillRect(-22,-3,44,6);ctx.fillStyle='#ffd34e';ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText('★',0,6);ctx.restore();
    ctx.save();ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.strokeText('ARMA LENDÁRIA',crate.x,crate.y-56+b);ctx.fillStyle='#ffd34e';ctx.fillText('ARMA LENDÁRIA',crate.x,crate.y-56+b);ctx.restore();}
  for(const mt of meteors){
    if(!mt.done){const k=1-mt.t/mt.max;ctx.save();ctx.strokeStyle='rgba(255,138,31,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(mt.x,mt.y,80,0,TAU);ctx.stroke();ctx.fillStyle='rgba(255,138,31,'+(0.08+0.2*k)+')';ctx.beginPath();ctx.arc(mt.x,mt.y,80*k,0,TAU);ctx.fill();
      if(mt.t<0.6){const h=mt.t/0.6*500,mx=mt.x+h*0.35,my=mt.y-h;ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(mx,my,2,mx,my,26);g.addColorStop(0,'rgba(255,245,200,1)');g.addColorStop(.5,'rgba(255,120,20,.9)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(mx,my,26,0,TAU);ctx.fill();
        ctx.strokeStyle='rgba(255,160,60,.5)';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+60,my-170);ctx.stroke();}ctx.restore();}
    else{const k=mt.fx/0.4;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(mt.x,mt.y,0,mt.x,mt.y,110);g.addColorStop(0,'rgba(255,255,220,'+k+')');g.addColorStop(.4,'rgba(255,120,20,'+(0.8*k)+')');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(mt.x,mt.y,110,0,TAU);ctx.fill();ctx.restore();}
  }
  if(wpn.charge>0&&P){const k=1-wpn.charge/0.45,T=weaponAim(),x=P.x+P.face*24,y=P.y-34,a=Math.atan2(T.y-y,T.x-x);ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(x,y,2,x,y,14+k*30);g.addColorStop(0,'rgba(220,255,255,1)');g.addColorStop(1,'rgba(0,229,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,14+k*30,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(0,229,255,'+(0.2+0.5*k)+')';ctx.lineWidth=2;ctx.setLineDash([12,8]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*1500,y+Math.sin(a)*1500);ctx.stroke();ctx.restore();}
  for(const b of beams){const k=b.t/0.5;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(b.x,b.y);ctx.rotate(b.a);
    const g=ctx.createLinearGradient(0,-40,0,40);g.addColorStop(0,'rgba(0,229,255,0)');g.addColorStop(.5,'rgba(220,255,255,'+k+')');g.addColorStop(1,'rgba(0,229,255,0)');ctx.fillStyle=g;ctx.fillRect(0,-40*k-6,b.L,(40*k+6)*2);
    ctx.fillStyle='rgba(255,255,255,'+k+')';ctx.fillRect(0,-4,b.L,8);ctx.restore();}
  if(wpn.act>0&&P){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,211,78,'+(0.4+0.3*Math.sin(uiT*20))+')';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(P.x,P.y+2,34,12,0,0,TAU);ctx.stroke();ctx.restore();}
}
function drawProgressHUD(){
  drawInhalerMap();
  drawBossArrow();
  if(frostFX>0){ctx.save();ctx.globalAlpha=frostFX/0.8*0.5;const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.2,VW/2,VH/2,VW*0.65);g.addColorStop(0,'rgba(233,251,255,0)');g.addColorStop(1,'rgba(200,240,255,1)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);ctx.restore();}
  if(bossWarn>0&&Math.floor(uiT*6)%2===0){ctx.save();ctx.strokeStyle='rgba(255,59,107,.7)';ctx.lineWidth=14;ctx.strokeRect(7,7,VW-14,VH-14);ctx.restore();}
  if(announce){const a=Math.min(1,announce.t*2,(announce.max-announce.t)*4);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
    ctx.font='bold 26px system-ui,Arial';const w=Math.max(ctx.measureText(announce.txt).width,announce.sub?ctx.measureText(announce.sub).width*0.6:0)+60;
    ctx.fillStyle='rgba(4,6,14,.82)';rrect(VW/2-w/2,140,w,announce.sub?74:50,10);ctx.fill();ctx.strokeStyle=announce.col;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=announce.col;ctx.shadowColor=announce.col;ctx.shadowBlur=12;ctx.fillText(announce.txt,VW/2,174);ctx.shadowBlur=0;
    if(announce.sub){ctx.fillStyle='#eef3ff';ctx.font='15px system-ui,Arial';ctx.fillText(announce.sub,VW/2,200);}ctx.restore();}
  else if(cleared&&state==='play'&&!pmenu.open&&!ptravel&&!portal){ctx.save();ctx.textAlign='center';ctx.font='bold 15px system-ui,Arial';ctx.globalAlpha=0.6+0.4*Math.sin(uiT*4);ctx.fillStyle='#9dff4d';
    ctx.fillText(touchDevice?'PORTAL LIBERADO — toque em PORTAL, depois na tela, e entre nele':'PORTAL LIBERADO — aperte E, clique para abrir e entre nele',VW/2,34);ctx.restore();}
  if(!touchDevice&&helpT>0&&state==='play'){ctx.save();ctx.globalAlpha=Math.min(1,helpT/2)*0.85;ctx.textAlign='right';ctx.fillStyle='#9fb8d8';ctx.font='12px system-ui,Arial';
    ctx.fillText('WASD mover · Mouse mirar · Clique atirar · R recarregar · Espaço pular · P pausa · M som',VW-20,VH-16);ctx.restore();}
}
function drawBossArrow(){
  const tg=boss&&!boss.dead&&boss.awake?{x:boss.x,y:boss.y-50,c:boss.t.color,l:'CHEFE'}:crate?{x:crate.x,y:crate.y-24,c:'#ffd34e',l:'ARMA'}:null;
  if(!tg||state!=='play')return;
  const sx=tg.x-cam.x,sy=tg.y-cam.y,m=46;if(sx>m&&sx<VW-m&&sy>m&&sy<VH-m)return;
  const cx=VW/2,cy=VH/2,a=Math.atan2(sy-cy,sx-cx),k=Math.min((VW/2-m)/Math.abs(Math.cos(a)||1e-6),(VH/2-m)/Math.abs(Math.sin(a)||1e-6)),x=cx+Math.cos(a)*k,y=cy+Math.sin(a)*k;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=0.65+0.35*Math.sin(uiT*6);ctx.fillStyle=tg.c;ctx.shadowColor=tg.c;ctx.shadowBlur=12;
  ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-10,-13);ctx.lineTo(-4,0);ctx.lineTo(-10,13);ctx.closePath();ctx.fill();ctx.restore();
  ctx.shadowBlur=0;ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(tg.l,-Math.cos(a)*30,-Math.sin(a)*30+4);ctx.restore();
}
function hudCountText(){
  if(!bossSpawned)return'Malwares restantes: '+countMinions();
  if(bossWarn>0)return'⚠ CHEFE A CAMINHO';
  if(boss&&!boss.dead)return'CHEFE: '+boss.t.name+(countMinions()?'  ·  ajudantes: '+countMinions():'');
  return cleared?'Área limpa — portal liberado':'Derrote os inimigos restantes';
}

/* ---------- Chefe da Fase 1: RAINHA DO ENXAME ---------- */
function queenAI(m,dt,d){
  m.actT-=dt;const R=m.rage;m.face=P.x>m.x?1:-1;
  const hover=(sp)=>{const dx=(P.x-m.x)/d,dy=(P.y-m.y)/d,k=d>360?1:d<240?-1:0;eMove(m,dx*k-dy*0.5,dy*k+dx*0.5,sp,dt);};
  switch(m.act){
    case 'walk':hover(R?95:75);
      if(m.actT<=0){const pick=m.seq++%3;
        if(pick===0){m.act='laserT';m.actT=0.9;m.ldir=Math.random()<.5?1:-1;m.la0=Math.atan2(P.y-m.y,P.x-m.x)-0.9*m.ldir;m.la=m.la0;sfx('charge',m.x,m.y);}
        else if(pick===1){m.act='spit';m.actT=0.2;m.volley=R?4:3;}
        else{if(countMinions()<8){m.act='swarm';m.actT=0.8;}else{m.act='spit';m.actT=0.2;m.volley=3;}}}
      break;
    case 'laserT':if(m.actT<=0){m.act='laser';m.actT=R?1.1:1.4;sv=1;tone('sawtooth',200,600,1.2,0.14);}break;
    case 'laser':{const k=1-m.actT/(R?1.1:1.4);m.la=m.la0+k*1.8*m.ldir;
      if(segDist(P.x,P.y-24,m.x,m.y-50,m.la,720)<22&&state==='play')hurtPlayer(Math.round(12*DIFF().dmg),m);
      if(m.actT<=0){m.act='walk';m.actT=1.4;}break;}
    case 'spit':if(m.actT<=0){const n=R?12:9,o=Math.random();for(let i=0;i<n;i++)fireBolt(m.x,m.y-50,o+i/n*TAU,190,'acid',9);sfx('eshot',m.x,m.y);m.volley--;if(m.volley>0)m.actT=0.5;else{m.act='walk';m.actT=1.5;}}break;
    case 'swarm':if(m.actT<=0){for(let i=0;i<(R?4:3);i++)spawnMinion('atk',m.x,m.y);sfx('roar');m.act='walk';m.actT=1.8;}break;
  }
}
function drawQueen(m){
  const x=m.x,fl=Math.sin(time*2.4)*7,y=m.y-20+fl;
  ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y-40,4,x,y-40,120);g.addColorStop(0,m.rage?'rgba(255,80,60,.35)':'rgba(124,255,58,.3)');g.addColorStop(1,'rgba(124,255,58,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-40,120,0,TAU);ctx.fill();ctx.restore();
  shadowAt(x,m.y+4,48-fl*0.4,14,.4);
  if(m.act==='laserT'||m.act==='laser'){ctx.save();ctx.translate(x,m.y-50);ctx.rotate(m.la);
    if(m.act==='laserT'){ctx.strokeStyle='rgba(124,255,58,.7)';ctx.lineWidth=2;ctx.setLineDash([12,10]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(720,0);ctx.stroke();
      ctx.rotate(1.8*m.ldir);ctx.globalAlpha=0.35;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(720,0);ctx.stroke();}
    else{ctx.globalCompositeOperation='lighter';const g2=ctx.createLinearGradient(0,-26,0,26);g2.addColorStop(0,'rgba(124,255,58,0)');g2.addColorStop(.5,'rgba(230,255,200,1)');g2.addColorStop(1,'rgba(124,255,58,0)');ctx.fillStyle=g2;ctx.fillRect(0,-26,720,52);ctx.fillStyle='#ffffff';ctx.fillRect(0,-4,720,8);}
    ctx.restore();}
  ctx.save();if(m.flash>0)ctx.filter='brightness(2.2)';drawSheet('m_hyb',Math.floor(m.anim)%4,x,y,m.t.scale,m.face>0);ctx.restore();
  ctx.save();ctx.fillStyle='#ffd34e';ctx.strokeStyle='#5a3a00';ctx.lineWidth=2;ctx.translate(x,y-92);ctx.beginPath();ctx.moveTo(-30,8);for(let i=0;i<5;i++){ctx.lineTo(-30+i*15,-10-(i%2?0:8));ctx.lineTo(-22+i*15,4);}ctx.lineTo(30,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}

/* ---------- Som do tiro garantido + desbloqueio no iPhone ---------- */
function b64Buf(src){const b=atob(src.slice(src.indexOf(',')+1)),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer;}
function loadAudioBuffers(){
  if(abufReq||!actx)return;abufReq=true;
  [['shot',weaponShotAudio],['reload',reloadLoopAudio],['bolt',lightningStrikeAudio]].forEach(([k,a])=>{
    try{const done=buf=>{ABUF[k]=buf;},p=actx.decodeAudioData(b64Buf(a.src),done,()=>{});if(p&&p.catch)p.catch(()=>{});}catch(_){}
  });
}
function shotSynth(){if(!actx||muted)return;sv=1;tone('square',1500,280,0.07,0.07);tone('sawtooth',700,120,0.09,0.05);noiseBurst(0.06,0.09,6000,900);}
let iosUnlocked=false;
function unlockMobileAudio(){
  if(iosUnlocked)return;iosUnlocked=true;
  try{  // áudio silencioso em loop: faz o iPhone tocar o som mesmo com a chave de silêncio ligada
    const n=800,b=new Uint8Array(44+n),v=new DataView(b.buffer),w=(o,s)=>{for(let i=0;i<s.length;i++)b[o+i]=s.charCodeAt(i);};
    w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);b.fill(128,44);
    let s='';for(let i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);
    const a=new Audio('data:audio/wav;base64,'+btoa(s));a.loop=true;a.volume=0.01;a.setAttribute('playsinline','');const p=a.play();if(p&&p.catch)p.catch(()=>{});
  }catch(_){}
  for(const a of[weaponShotAudio,reloadLoopAudio,lightningStrikeAudio]){try{a.muted=true;const p=a.play();if(p&&p.then)p.then(()=>{a.pause();a.currentTime=0;a.muted=false;}).catch(()=>{a.muted=false;});else{a.pause();a.muted=false;}}catch(_){}}
  if(actx&&actx.state!=='running'){try{actx.resume();}catch(_){}}
}
addEventListener('touchend',unlockMobileAudio,{passive:true});addEventListener('click',unlockMobileAudio);addEventListener('keydown',unlockMobileAudio);

/* ---------- INALADOR: item que recupera a vida ---------- */
const INH={heal:30,dropChance:0.12,life:16,mapCount:3};
let inhalers=[],inhSpawned=false;
function placeInhaler(x,y,life){inhalers.push({x,y,t:0,life:life||0,bob:Math.random()*6});}
function inhalerDrop(m){
  if(m.boss||!P)return;
  const lowLife=P.hp<CFG.playerHP*0.4;   // com pouca vida a chance dobra
  if(Math.random()<INH.dropChance*(lowLife?2:1)&&inhalers.length<6)placeInhaler(m.x,m.y,INH.life);
}
function updateInhalers(dt){
  if(!P||state!=='play')return;
  if(!inhSpawned){inhSpawned=true;   // alguns já ficam espalhados pelo mapa
    for(let i=0,t=0;i<INH.mapCount&&t<300;t++){const x=200+Math.random()*(WW-400),y=200+Math.random()*(WH-400);
      if(hitsWall(x,y,30)||inLava(x,y,40)||Math.hypot(x-P.x,y-P.y)<500||inhalers.some(o=>Math.hypot(o.x-x,o.y-y)<900))continue;placeInhaler(x,y,0);i++;}}
  if(boss&&boss.rage&&!boss.inhDrop&&!boss.dead){boss.inhDrop=true;const s=freeSpotNear(P.x,P.y,90,160,24);placeInhaler(s.x,s.y,0);
    floaters.push({x:s.x,y:s.y-60,t:1.6,txt:'INALADOR!',c:'#7dffb0'});}
  for(const h of inhalers){h.t+=dt;
    if(Math.hypot(P.x-h.x,P.y-h.y)<38&&(P.z||0)<30){
      if(P.hp>=CFG.playerHP){if(!h.full){h.full=1;floaters.push({x:h.x,y:h.y-50,t:0.8,txt:'Vida cheia',c:'#9fb8d8'});}continue;}
      const heal=Math.min(INH.heal,CFG.playerHP-P.hp);P.hp+=heal;P.hpG=Math.max(P.hpG,P.hp);h.taken=true;
      floaters.push({x:P.x,y:P.y-80,t:1.1,txt:'+'+heal+' VIDA',c:'#7dffb0'});burst(P.x,P.y-40,'#7dffb0',16);burst(P.x,P.y-40,'#ffffff',8);
      sv=1;noiseBurst(0.45,0.22,9000,1800);tone('sine',300,520,0.3,0.12,0.05);tone('triangle',660,990,0.25,0.1,0.32);   // "pssst" + brilho
    }else h.full=0;}
  inhalers=inhalers.filter(h=>!h.taken&&!(h.life&&h.t>h.life));
}
function drawInhalers(){
  for(const h of inhalers){
    if(h.x<cam.x-40||h.x>cam.x+VW+40||h.y<cam.y-60||h.y>cam.y+VH+40)continue;
    if(h.life&&h.t>h.life-3&&Math.floor(h.t*8)%2===0)continue;   // pisca antes de sumir
    const b=Math.sin(h.t*3+h.bob)*4,y=h.y-22+b;
    ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(h.x,y,2,h.x,y,40);g.addColorStop(0,'rgba(125,255,176,.45)');g.addColorStop(1,'rgba(125,255,176,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(h.x,y,40,0,TAU);ctx.fill();ctx.restore();
    shadowAt(h.x,h.y+2,14,5,0.35);
    ctx.save();ctx.translate(h.x,y);ctx.rotate(-0.15);
    // corpo do inalador (tubo + bocal), cartucho e cruz
    ctx.fillStyle='#e9f6ff';rrect(-8,-20,16,30,5);ctx.fill();ctx.strokeStyle='#2a3a4a';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#e9f6ff';rrect(-8,4,26,12,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#1fbf6a';rrect(-6,-26,12,9,3);ctx.fill();ctx.strokeStyle='#0d5a32';ctx.stroke();
    ctx.fillStyle='#1fbf6a';ctx.fillRect(-2,-13,4,12);ctx.fillRect(-6,-9,12,4);
    ctx.fillStyle='#2a3a4a';ctx.fillRect(14,7,3,6);
    ctx.restore();
    if(Math.random()<0.08)sparks.push({x:h.x+(Math.random()-.5)*20,y:y-10,vx:0,vy:-30,t:0.5,c:'#7dffb0'});
  }
}
function drawInhalerMap(){
  if(!inhalers.length||state!=='play')return;
  const mw=190,mh=119,mx=VW-mw-18,my=50;
  ctx.save();ctx.fillStyle='#7dffb0';for(const h of inhalers){const x=mx+h.x/WW*mw,y=my+h.y/WH*mh;ctx.fillRect(x-1,y-3,2,6);ctx.fillRect(x-3,y-1,6,2);}ctx.restore();
}

/* ---------- NARRAÇÃO da história (voz em português do próprio aparelho) ---------- */
const NARR={ok:'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined',on:true,voice:null,speaking:false,autoAt:0,slideKey:'',unlocked:false};
try{if(localStorage.getItem('kz_narr')==='0')NARR.on=false;}catch(_){}
const SAY_FIX=[[/KAYZEN RYUU/gi,'Kêizen Riú'],[/Kayzen/g,'Kêizen'],[/Ryuu/g,'Riú'],[/VEXX/g,'Véqs'],[/Vexx/g,'Véqs'],[/MALWARES?/gi,m=>m.length>7?'mauéres':'mauér'],
  [/Neo-Akari/gi,'Néo Akári'],[/NÚCLEO/g,'Núcleo'],[/VÉU/g,'Véu'],[/SOBRECARGA/g,'Sobrecarga'],[/FORJA-X/g,'Forja Xis'],[/—/g,','],[/…/g,'.']];
function sayText(s){let t=(s.title?s.title+'. ':'')+s.text;for(const [a,b] of SAY_FIX)t=t.replace(a,b);return t;}
function pickVoice(){
  if(!NARR.ok)return null;const vs=speechSynthesis.getVoices()||[];if(!vs.length)return null;
  const pt=vs.filter(v=>/^pt[-_]BR/i.test(v.lang)),pt2=pt.length?pt:vs.filter(v=>/^pt/i.test(v.lang));if(!pt2.length)return null;
  const pref=[/natural/i,/neural/i,/google/i,/luciana/i,/felipe/i,/antonio/i,/francisca/i,/maria/i,/daniel/i];
  for(const r of pref){const v=pt2.find(v=>r.test(v.name));if(v)return v;}
  return pt2.find(v=>v.localService)||pt2[0];
}
if(NARR.ok){try{speechSynthesis.onvoiceschanged=()=>{NARR.voice=pickVoice();};NARR.voice=pickVoice();}catch(_){NARR.ok=false;}}
function narrUnlock(){   // no iPhone a primeira fala precisa nascer de um toque
  if(!NARR.ok||NARR.unlocked)return;NARR.unlocked=true;
  try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.lang='pt-BR';speechSynthesis.speak(u);}catch(_){}
}
function narrDuck(on){if(IA.bus&&actx){try{const t=actx.currentTime;IA.bus.gain.cancelScheduledValues(t);IA.bus.gain.setTargetAtTime(on?0.45:1.2,t,0.25);}catch(_){}}}
function narrStop(){if(!NARR.ok)return;NARR.speaking=false;NARR.autoAt=0;try{speechSynthesis.cancel();}catch(_){}narrDuck(false);}
function narrate(s){
  if(!NARR.ok||!NARR.on||muted)return;
  try{
    speechSynthesis.cancel();if(!NARR.voice)NARR.voice=pickVoice();
    const u=new SpeechSynthesisUtterance(sayText(s));u.lang='pt-BR';if(NARR.voice)u.voice=NARR.voice;
    u.rate=s.final?0.9:0.98;u.pitch=0.92;u.volume=1;
    const key=intro.set+':'+intro.slide;NARR.slideKey=key;
    u.onstart=()=>{if(NARR.slideKey===key){NARR.speaking=true;narrDuck(true);}};
    u.onend=u.onerror=()=>{if(NARR.slideKey!==key)return;NARR.speaking=false;narrDuck(false);intro.chars=curSlide().text.length;NARR.autoAt=intro.t+1.3;};
    setTimeout(()=>{if(intro.on&&NARR.slideKey===key&&!intro.gate){try{speechSynthesis.speak(u);}catch(_){}}},350);   // pequena pausa para o som da cena entrar
  }catch(_){NARR.speaking=false;}
}
function narrToggle(){NARR.on=!NARR.on;try{localStorage.setItem('kz_narr',NARR.on?'1':'0');}catch(_){}if(!NARR.on)narrStop();else if(intro.on){intro.chars=0;narrate(curSlide());}sfx('select');}
