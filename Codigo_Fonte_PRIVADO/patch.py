# Gera o jogo: python3 patch.py  (cria Kayzen_Ryuu_debug.html, Kayzen_Ryuu_release_src.html e Kayzen_Ryuu.html)
# Depois: npm i terser@5.31.0 && python3 minify.py  (gera a versão final minificada Kayzen_Ryuu.html)
import sys
src=open('base/Kayzen_Ryuu_base_original.html',encoding='utf-8').read()
ext_js=open('ext.js',encoding='utf-8').read()
ext_css=open('ext.css',encoding='utf-8').read()
s=src
def R(a,b,count=1):
    global s
    n=s.count(a)
    if n!=count:
        print('FALHOU (%d ocorrências):'%n, a[:90]); sys.exit(1)
    s=s.replace(a,b)

# ---------- cabeçalho / CSS / HTML ----------
R('<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<meta name="theme-color" content="#05060d">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-capable" content="yes">')
R('<title>Kayzen Ryuu — Vertical Slice</title>','<title>Kayzen Ryuu — O Véu de Neo-Akari</title>')
R('</style>\n</head>', ext_css+'</style>\n</head>')
R('<button id="mobileReload" class="mobile-control" type="button" aria-label="Recarregar">RECARREGAR</button>',
  '<button id="mobileReload" class="mobile-control" type="button" aria-label="Recarregar">RECARGA</button>\n'
  '<button id="mobileSkill" class="mobile-control" type="button" aria-label="Sobrecarga">SOBRE-<br>CARGA</button>\n'
  '<button id="mobileDash" class="mobile-control hidden" type="button" aria-label="Dash do Dragão">DASH</button>\n'
  '<button id="mobileShield" class="mobile-control hidden" type="button" aria-label="Escudo Crio">ESCUDO</button>\n'
  '<button id="mobilePortal" class="mobile-control hidden" type="button" aria-label="Portal">PORTAL</button>\n'
  '<button id="mobilePause" class="mobile-control" type="button" aria-label="Pausar">II</button>\n'
  '<button id="mobileAlly" class="mobile-control hidden" type="button" aria-label="Eco Aliado">ECO</button>\n'
  '<button id="mobileWeapon" class="mobile-control hidden" type="button" aria-label="Arma lendária">ARMA</button>')

# ---------- novos tipos de inimigo ----------
R("  hyb:{name:'HÍBRIDO', tag:'HIB',color:'#b86bff',hue:270,hp:[35,75], speed:1.0, dmg:5,  sight:320,scale:1.6,r:16}  // persegue e ergue escudo ao ser atingido\n};",
  "  hyb:{name:'HÍBRIDO', tag:'HIB',color:'#b86bff',hue:270,hp:[35,75], speed:1.0, dmg:5,  sight:320,scale:1.6,r:16},  // persegue e ergue escudo ao ser atingido\n"
  "  tur:{name:'TORRETA',tag:'TOR',color:'#ffd34e',hue:40,hp:[60,80],speed:0,dmg:0,sight:560,scale:1.6,r:20},      // Fase 2: fixa, atira brasas\n"
  "  kam:{name:'KAMIKAZE',tag:'KMK',color:'#ff8a1f',hue:20,hp:[15,25],speed:1.95,dmg:0,sight:430,scale:1.3,r:13},  // Fase 2: corre, pisca e explode\n"
  "  spc:{name:'ESPECTRO',tag:'ESP',color:'#8ff3ff',hue:170,hp:[30,50],speed:1.15,dmg:8,sight:470,scale:1.5,r:15}, // Fase 3: teletransporta\n"
  "  ice:{name:'SENTINELA',tag:'SEN',color:'#c9a6ff',hue:230,hp:[40,60],speed:0.9,dmg:5,sight:600,scale:1.5,r:16},  // Fase 3: tiros de gelo (lentidão)\n"
  "  egb:{name:'ECO GIBI',tag:'GIB',color:'#ff3bd0',hue:300,hp:[40,55],speed:1.25,dmg:9,sight:480,scale:1.6,r:14},   // Fase 4: investida\n"
  "  enr:{name:'ECO NOIR',tag:'NOI',color:'#e6e6e6',hue:0,hp:[35,50],speed:0.95,dmg:4,sight:600,scale:1.6,r:14},     // Fase 4: atira de longe\n"
  "  epx:{name:'ECO PIXEL',tag:'PIX',color:'#7cff3a',hue:100,hp:[50,60],speed:1.0,dmg:7,sight:480,scale:1.6,r:14},   // Fase 4: divide-se em dois\n"
  "  epm:{name:'MINI PIXEL',tag:'MIN',color:'#b6ff8a',hue:100,hp:[15,15],speed:1.6,dmg:5,sight:520,scale:1.1,r:10},\n"
  "  ecl:{name:'CLONE ÔMEGA',tag:'CLN',color:'#ff4060',hue:0,hp:[60,60],speed:0.9,dmg:6,sight:700,scale:1.6,r:14}\n};")

# ---------- carregamento seguro das imagens ----------
R("i.onload=()=>{if(++loaded===Object.keys(SPR).length){buildTints();start();}};",
  "i.onload=i.onerror=()=>{if(++loaded===Object.keys(SPR).length){try{buildTints();}catch(_){}start();}};")

# ---------- detecção de celular (só toque "grosso") ----------
R("const touchDevice=window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints>0);",
  "const touchDevice=window.matchMedia('(pointer: coarse)').matches;")
R("function setMobileAim(){if(!P)return;mouse.x=P.x-cam.x+P.face*320;mouse.y=P.y-cam.y-34;}\n","")
R("if(state!=='play')reset();else if(!paused&&P&&P.ammo<CFG.ammoMax&&P.reloadT<=0){P.reloadT=CFG.reloadTime;startWeaponReloadAudio();}});",
  "if(intro.on||pcard.on)return;if(state!=='play'){onRetry('r');}else if(!paused&&P&&P.ammo<CFG.ammoMax&&P.reloadT<=0){P.reloadT=CFG.reloadTime;startWeaponReloadAudio();}});")
R("mobileJumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();doJump();});",
  "mobileJumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();doJump();});\n  [mobileFireBtn,mobileReloadBtn,mobileJumpBtn].forEach(b=>b.addEventListener('pointerdown',e=>e.stopPropagation()));")

# ---------- teclado ----------
R("addEventListener('keydown',e=>{\n  if(['ArrowUp'","addEventListener('keydown',e=>{\n  if(extKey(e))return;\n  if(['ArrowUp'")
R("else if(e.code==='KeyP'||e.code==='Escape'){paused=!paused;if(paused){skill.aiming=false;closePortalUI();}}",
  "else if(e.code==='KeyP'||e.code==='Escape'){if(state==='play')setPaused(!paused);}")
R("if(e.code==='KeyM'){muted=!muted;if(master)master.gain.value=muted?0:0.5;}",
  "if(e.code==='KeyM'){muted=!muted;if(master)master.gain.value=muted?0:0.5;if(muted){try{reloadLoopAudio.pause();}catch(_){}}else resumeReloadAudio();}")
R("      if(state!=='play')reset();\n","      if(state!=='play'){onRetry('r');}\n")
R("    if(e.code==='Space')doJump();","    if(e.code==='Space'&&!paused)doJump();")

# ---------- mouse ----------
R("cv.addEventListener('mousedown',e=>{\n  setMouse(e);","cv.addEventListener('mousedown',e=>{\n  if(overlayBlocking())return;\n  setMouse(e);")
R("  if(overPIcon()){togglePortalMenu();return;}      // clicou no ícone do portal",
  "  if(overPIcon()){togglePortalMenu();return;}      // clicou no ícone do portal\n  if(overAbil('dash')){doDash();return;}\n  if(overAbil('shield')){doShield();return;}")
R("addEventListener('mouseup',()=>mouse.down=false);","addEventListener('mouseup',()=>mouse.down=false);\naddEventListener('pointercancel',()=>{mouse.down=false;});")

# ---------- mapa / chão ----------
R("function buildFloor(){\n  floorCanvas=document.createElement('canvas');floorCanvas.width=WW;floorCanvas.height=WH;",
  "function buildFloorCity(){\n  if(!floorCanvas){floorCanvas=document.createElement('canvas');floorCanvas.width=WW;floorCanvas.height=WH;}")

# ---------- reinício de fase ----------
R("function reset(){\n  P={x:WW/2,y:WH/2,","function reset(){\n  stopWeaponReloadAudio();extReset();\n  P={x:PHASE_DEF[curPhase].start[0],y:PHASE_DEF[curPhase].start[1],")
R("  const mix=['atk','hyb','def','atk','hyb','atk','def'];let tries=0;\n  while(enemies.length<CFG.malwareCount&&tries++<6000){",
  "  const PD=PHASE_DEF[curPhase],mix=PD.mix;let tries=0;\n  while(enemies.length<PD.count&&tries++<6000){")
R("    if(hitsWall(x,y,44)||Math.hypot(x-P.x,y-P.y)<520||",
  "    if(hitsWall(x,y,44)||inLava(x,y,40)||(PD.boss&&Math.hypot(x-WW/2,y-WH/2)<420)||Math.hypot(x-P.x,y-P.y)<520||")
R("  cam.x=P.x-VW/2;cam.y=P.y-VH/2;\n}","  if(PD.boss)spawnBoss(PD.boss);\n  cam.x=Math.max(0,Math.min(WW-VW,P.x-VW/2));cam.y=Math.max(0,Math.min(WH-VH,P.y-VH/2));\n}")
R("lungeCd:Math.random()*2,lx:0,ly:0}}",
  "lungeCd:Math.random()*2,lx:0,ly:0,\n    cool:1+Math.random()*1.5,charge:0,arm:0,fade:0,fadeDir:0,blinkCd:1.5+Math.random()*2,strafe:Math.random()<.5?1:-1,aim:0,alpha:1}}")

# ---------- lógica ----------
R("  updatePortal(dt);\n  if(P){","  updatePortal(dt);\n  updateExt(dt);\n  if(P){")
R("  if(state==='play'&&enemies.length===0){state='win';sfx('win');}","  if(state==='play'&&enemies.length===0)phaseWon();")
R("  P.vx=ax*sp+P.kx_;P.vy=ay*sp+P.ky_;","  extMove(dt,ax,ay,sp);")
R("    if(m.dead)continue;\n    if(Math.hypot(m.x-P.x,m.y-P.y)<m.r+P.r-2&&m.hitT<=0&&P.z<10){",
  "    if(m.dead||m.fade>0||(m.boss&&(m.alpha<0.5||!m.awake)))continue;\n    if(Math.hypot(m.x-P.x,m.y-P.y)<m.r+P.r-2&&m.hitT<=0&&P.z<10){")
R("function doJump(){\n  if(!P||state!=='play'||paused||","function doJump(){\n  if(!P||state!=='play'||paused||intro.on||pcard.on||")
R("function shoot(wx,wy){\n  if(P.ammo<=0||P.reloadT>0)return;",
  "function shoot(wx,wy){\n  if(P.ammo<=0||P.reloadT>0)return;\n  if(!P.moving||P.walkDir!=='side')P.face=wx>=P.x?1:-1;   // parado: vira para onde está atirando")
R("function hurtPlayer(d,src){\n  if(P.inv>0||state!=='play')return;",
  "function hurtPlayer(d,src){\n  if(P.inv>0||state!=='play')return;\n  if(abil.shieldT>0){burst(P.x,P.y-30,'#e9fbff',6);sfx('shieldHit');return;}   // Escudo Crio bloqueia")
R("if(P.hp<=0){state='dead';sfx('dead');","if(P.hp<=0){state='dead';stopWeaponReloadAudio();mouse.down=false;mobileFire=false;sfx('dead');")
R("  m.hpG=m.hpG>m.hp?Math.max(m.hp,m.hpG-m.maxHp*0.9*dt):m.hp;\n",
  "  m.hpG=m.hpG>m.hp?Math.max(m.hp,m.hpG-m.maxHp*0.9*dt):m.hp;\n  if(m.boss){updateBoss(m,dt);return;}\n  if(EXT_AI[m.type]){EXT_AI[m.type](m,dt);return;}\n")
R("function hitMalware(m,d,b){\n  const shielded=m.shield>0;\n  const dmg=",
  "function hitMalware(m,d,b){\n  if(m.dead||m.sInv>0)return;\n  if(m.boss&&m.alpha<0.35){burst(b.x,b.y,'#c9a6ff',4);return;}   // Vexx intocável no teletransporte\n  const shielded=m.shield>0;\n  let dmg=")
R("  m.hp-=dmg;m.flash=0.12;\n  const kb=m.type==='def'?0.25:0.6;",
  "  if(m.boss&&m.stun>0)dmg*=2;   // chefe atordoado leva dano em dobro\n  m.hp-=dmg;m.flash=0.12;\n  const kb=(m.boss||m.type==='tur')?0:m.type==='def'?0.25:0.6;")
R("  if(m.hp<=0){m.dead=true;kills++;burst(m.x,m.y-10,m.t.color,22);burst(m.x,m.y-10,'#ffcc00',10);}",
  "  if(m.hp<=0){m.dead=true;kills++;burst(m.x,m.y-10,m.t.color,22);burst(m.x,m.y-10,'#ffcc00',10);if(m.boss)bossDown(m);}")
R("      if(!m.dead){m.kx=Math.cos(a)*CFG.knockback*1.4;m.ky=Math.sin(a)*CFG.knockback*1.4;}",
  "      if(!m.dead&&!m.boss&&m.type!=='tur'){m.kx=Math.cos(a)*CFG.knockback*1.4;m.ky=Math.sin(a)*CFG.knockback*1.4;}")

# ---------- portal / fases ----------
R("  {id:1,name:'Fase 1',sub:'Limpeza de malware',open:true},\n  {id:2,name:'Fase 2',sub:'Ainda indisponível',open:false},\n  {id:3,name:'Fase 3',sub:'Ainda indisponível',open:false},\n  {id:4,name:'Fase 4',sub:'Ainda indisponível',open:false},",
  "  {id:1,name:'Fase 1',sub:'Distrito Neon',open:true},\n  {id:2,name:'Fase 2',sub:'Fundição Rubra',open:false},\n  {id:3,name:'Fase 3',sub:'Cripta Glacial',open:false},\n  {id:4,name:'Fase 4',sub:'Fenda do Multiverso',open:false},")
R("function startPhase(id){reset();}   // Fase 1 = mapa atual. Quando houver novas fases, carregue aqui o mapa de \"id\".\n","")
R("function phaseArt(i,c,open){      // prévia da fase dentro do cartão\n  ctx.save();rrect(c.x,c.y,c.w,c.h,8);ctx.clip();\n  if(open&&floorCanvas){",
  "function phaseArt(i,c,open){      // prévia da fase dentro do cartão\n  ctx.save();rrect(c.x,c.y,c.w,c.h,8);ctx.clip();\n  if(i<4){phaseThumb(i,c,open);}\n  else if(open&&floorCanvas){")
R("      const cols=[ETYPES.atk.color,ETYPES.def.color,ETYPES.hyb.color];","      const cols=(PHASE_DEF[ph.id]||PHASE_DEF[1]).emblems;")
R("function overPIcon(){const cx","function overPIcon(){if(touchDevice)return false;const cx")
R("function overIcon(){const cx","function overIcon(){if(touchDevice)return false;const cx")
R("function togglePortalMenu(){      // tecla E / ícone: liga/desliga a mira do portal. O painel de fases só abre ao ENTRAR no portal.\n  if(pmenu.open){",
  "function togglePortalMenu(){      // tecla E / ícone: liga/desliga a mira do portal. O painel de fases só abre ao ENTRAR no portal.\n  if(intro.on||pcard.on)return;\n  if(pmenu.open){")
R("function toggleAim(){\n  if(!P||paused||","function toggleAim(){\n  if(intro.on||pcard.on)return;\n  if(!P||paused||")

# ---------- desenho ----------
R("ctx.setTransform(1,0,0,1,0,0)","ctx.setTransform(DPR,0,0,DPR,0,0)",2)
R("  drawGroundSkill();\n  // entidades","  drawHazards();drawTrails();drawInhalers();drawGroundSkill();\n  // entidades")
R("  for(const m of enemies)if(m.x>cam.x-120&&m.x<cam.x+VW+120&&m.y>cam.y-140&&m.y<cam.y+VH+120)list.push",
  "  for(const m of enemies)if(m.x>cam.x-140&&m.x<cam.x+VW+140&&m.y>cam.y-140&&m.y<cam.y+VH+220)list.push")
R("  drawBlastFX();\n","  drawBlastFX();drawEBolts();drawShieldFX();\n")
R("  drawHUD();drawPortalMenu();drawPortalTravel();","  drawWeather();drawHUD();drawBossBar();drawStateOverlay();drawPortalMenu();drawPortalTravel();")
R("function drawMalware(m){\n","function drawMalware(m){\n  if(m.boss){drawBoss(m);return;}\n  if(EXT_DRAW[m.type]){EXT_DRAW[m.type](m);drawEHealth(m);return;}\n")
R("  ctx.fillText('KAYZEN RYUU',24,102);","  ctx.fillText('KAYZEN RYUU  ·  FASE '+curPhase+' — '+PHASE_DEF[curPhase].name.toUpperCase(),24,102);")
R("for(const k in ETYPES){const T=ETYPES[k];","for(const k of PHASE_DEF[curPhase].legend){const T=ETYPES[k];")
R("  ctx.fillText('WASD/Setas mover · Mouse mirar · Clique/J atirar · R recarregar · Espaço pular · M som · P pausa · H hitboxes',VW-20,VH-42);",
  "  if(!touchDevice)ctx.fillText('WASD/Setas mover · Mouse mirar · Clique/J atirar · R recarregar · Espaço pular · M som · P pausa · H hitboxes',VW-20,VH-42);")
R("  drawSkillIcon();drawPortalIcon();\n  if(paused||state!=='play'){",
  "  if(!touchDevice){drawSkillIcon();drawPortalIcon();drawAbilityIcons();}else drawTouchHints();\n  if(false){")
R("  ctx.fillStyle='#16304a';walls.slice(4).forEach",
  "  if(curPhase===2){ctx.fillStyle='rgba(255,110,30,.55)';hazards.forEach(h=>ctx.fillRect(mx+(h.x-h.rx)/WW*mw,my+(h.y-h.ry)/WH*mh,Math.max(2,2*h.rx/WW*mw),Math.max(2,2*h.ry/WH*mh)));}\n  ctx.fillStyle='#16304a';walls.slice(4).forEach")
R("  enemies.forEach(m=>{ctx.fillStyle=m.t.color;ctx.fillRect(mx+m.x/WW*mw-1.5,my+m.y/WH*mh-1.5,3,3);});",
  "  enemies.forEach(m=>{ctx.fillStyle=m.t.color;const z=m.boss?6:3;ctx.fillRect(mx+m.x/WW*mw-z/2,my+m.y/WH*mh-z/2,z,z);});")

# ---------- laço principal ----------
R("""function loop(t){
  const dt=Math.min(0.05,(t-last)/1000||0);last=t;
  uiT+=dt;tickPortalUI(dt);
  if(!paused&&!pmenu.open)update(dt);
  draw();requestAnimationFrame(loop);
}
function start(){buildFloor();reset();requestAnimationFrame(loop);}""",
"""function loop(t){
  const dt=Math.min(0.05,(t-last)/1000||0);last=t;
  uiT+=dt;tickPortalUI(dt);
  try{
    if(intro.on){updateIntro(dt);drawIntro();}
    else{
      if(!paused&&!pmenu.open&&!pcard.on)update(dt);
      draw();
      if(pcard.on){if(ptravel&&ptravel.phase==='out'){ptravel.t+=dt;if(ptravel.t>=ptravel.dur)ptravel=null;}pcard.t+=dt;drawPhaseCard();}
    }
    updateTouchUI();
  }catch(err){console.error(err);}
  requestAnimationFrame(loop);
}""")
R("window.__game={get portal(){return portal}",
  ext_js+"\nwindow.__game={get inhalers(){return inhalers},get curPhase(){return curPhase},get boss(){return boss},get intro(){return intro},get pcard(){return pcard},get ebolts(){return ebolts},get abil(){return abil},get hazards(){return hazards},get unlocked(){return unlocked},set unlocked(v){unlocked=v;refreshPhases();},get paused(){return paused},startPhase,finishStory,doDash,doShield,setPaused,get portal(){return portal}")

# miniatura das fases no menu do portal
R("function drawPortalMenu(){",
"""function phaseThumb(i,c,open){
  const th=[['#0b1020','#1a2440','#00e5ff'],['#2a0f08','#5a1d08','#ff8a1f'],['#0a1a2a','#1d3d5a','#8ff3ff'],['#1a0820','#200a30','#ff3bd0']][i];
  const g=ctx.createLinearGradient(c.x,c.y,c.x,c.y+c.h);g.addColorStop(0,th[0]);g.addColorStop(1,th[1]);ctx.fillStyle=g;ctx.fillRect(c.x,c.y,c.w,c.h);
  ctx.save();ctx.globalAlpha=open?1:0.35;
  if(i===0){for(let k=0;k<9;k++){const w=16+(k*37)%22,h=20+(k*53)%46;ctx.fillStyle='#070b18';ctx.fillRect(c.x+k*(c.w/9),c.y+c.h-h,w,h);ctx.fillStyle='rgba(0,229,255,.6)';ctx.fillRect(c.x+k*(c.w/9)+4,c.y+c.h-h+6,3,3);}}
  else if(i===1){for(let k=0;k<4;k++){const x=c.x+20+k*(c.w/4),y=c.y+c.h-26-(k%2)*12;const gg=ctx.createRadialGradient(x,y,2,x,y,26);gg.addColorStop(0,'#ffe27a');gg.addColorStop(.5,'#ff6a12');gg.addColorStop(1,'rgba(160,20,0,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.ellipse(x,y,26,12,0,0,7);ctx.fill();}
    ctx.fillStyle='#1a1210';ctx.fillRect(c.x+c.w-62,c.y+36,40,c.h-36);ctx.fillStyle='#ff8a1f';ctx.fillRect(c.x+c.w-56,c.y+c.h-24,28,6);}
  else if(i===3){const cs=['#ff3bd0','#e6e6e6','#2fae3c','#00e5ff'];for(let q=0;q<4;q++){ctx.fillStyle=cs[q];ctx.globalAlpha=(open?0.75:0.3);ctx.fillRect(c.x+(q%2)*c.w/2,c.y+(q>>1)*c.h/2,c.w/2,c.h/2);}ctx.globalAlpha=open?1:0.35;
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(c.x+c.w/2,c.y);for(let k=1;k<=6;k++)ctx.lineTo(c.x+c.w/2+(k%2?10:-10),c.y+k*c.h/6);ctx.stroke();}
  else{for(let k=0;k<7;k++){const x=c.x+14+k*(c.w/7),h=26+(k*31)%40;const gg=ctx.createLinearGradient(0,c.y+c.h-h,0,c.y+c.h);gg.addColorStop(0,'#f2fdff');gg.addColorStop(1,'rgba(90,170,230,.4)');ctx.fillStyle=gg;ctx.beginPath();ctx.moveTo(x-8,c.y+c.h);ctx.lineTo(x,c.y+c.h-h);ctx.lineTo(x+8,c.y+c.h);ctx.fill();}}
  ctx.restore();
}
function drawPortalMenu(){""")



# ---------- som: decodificação Web Audio + tiro em toque rápido + recarga ----------
R("try{const AC=window.AudioContext||window.webkitAudioContext;actx=new AC();master=actx.createGain();master.gain.value=muted?0:0.5;master.connect(actx.destination);}catch(e){actx=null;}",
  "try{const AC=window.AudioContext||window.webkitAudioContext;actx=new AC();master=actx.createGain();master.gain.value=muted?0:0.5;master.connect(actx.destination);loadAudioBuffers();}catch(e){actx=null;}")
R("function playWeaponShotSound(){\n  if(muted)return;","function playWeaponShotSound(){\n  if(muted)return;\n  if(playBuf('shot',1))return;")
R("function playLightningStrikeAudio() {\n  if (muted) return;","function playLightningStrikeAudio() {\n  if (muted) return;\n  if(playBuf('bolt',1))return;")
R("function startWeaponReloadAudio() {\n  if (muted) return;","function startWeaponReloadAudio() {\n  if (muted) return;\n  if(actx&&ABUF.reload){startLoopSnd();return;}")
R("function stopWeaponReloadAudio() {\n  try {","function stopWeaponReloadAudio() {\n  if(loopSrc){try{loopSrc.stop();}catch(_){}loopSrc=null;}\n  try {")
R("mobileFireBtn.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();mobileFire=true;","mobileFireBtn.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();mobileFire=true;queuedShot='touch';")
R("  if(mobileFire)setMobileAim();\n  const shotX=mobileFire?mouse.x+cam.x:wx,shotY=mobileFire?mouse.y+cam.y:wy;\n  if((mouse.down||keys.KeyJ||mobileFire)&&",
  "  const touchShot=mobileFire||queuedShot==='touch';if(touchShot)setMobileAim();\n  const shotX=touchShot?mouse.x+cam.x:wx,shotY=touchShot?mouse.y+cam.y:wy;\n  const wantShot=mouse.down||keys.KeyJ||mobileFire||queuedShot;queuedShot=null;\n  if(wantShot&&")
R("  mouse.down=true;});cv.addEventListener('contextmenu'","  mouse.down=true;queuedShot='mouse';});cv.addEventListener('contextmenu'")
R("""      else if(!paused&&!pmenu.open&&P&&P.ammo<CFG.ammoMax&&P.reloadT<=0){
        P.reloadT=CFG.reloadTime;
        startWeaponReloadAudio();
      }""","      else tryReload();")
R("else if(!paused&&P&&P.ammo<CFG.ammoMax&&P.reloadT<=0){P.reloadT=CFG.reloadTime;startWeaponReloadAudio();}});","else tryReload();});")
R("if(e.code==='KeyM'){muted=!muted;if(master)master.gain.value=muted?0:0.5;if(muted){try{reloadLoopAudio.pause();}catch(_){}}else resumeReloadAudio();}","if(e.code==='KeyM'){muted=!muted;if(master)master.gain.value=muted?0:0.5;if(sfxOut)sfxOut.gain.value=muted?0:1;if(muted){pauseReloadSnd();iaStopAll(0.1);}else resumeReloadAudio();}")

# ---------- imagens: sprites ampliados 4x desenhados em alta qualidade ----------
R("  ctx.drawImage(img,frame*s.w,0,s.w,s.h,-dw/2,-dh,dw,dh);","  const k=s.k||1;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';\n  ctx.drawImage(img,frame*s.w*k,0,s.w*k,s.h*k,-dw/2,-dh,dw,dh);")
R("  ctx.imageSmoothingEnabled=false;\n  ctx.save();\n  if(m.flash>0)ctx.filter='brightness(3)';","  ctx.save();\n  if(m.flash>0)ctx.filter='brightness(3)';")


# ---------- pulo: mantém a pose do movimento, com impulso/aterrissagem (antes trocava para um quadro de costas) ----------
R("""  const sc=0.75,zz=P.z||0;
  if(P.jumpT>0&&P.shootAnim<=0){const f=Math.min(3,Math.floor((1-P.jumpT/CFG.jumpTime)*4));drawSheet('jump',f,P.x,P.y+6-zz,sc,P.face<0);}
  // Mantém a orientação de costas enquanto anda para cima, mesmo durante os tiros.
  // A animação lateral de disparo não deve sobrescrever a direção vertical.
  else if(P.walkDir==='up'&&(P.moving||P.shootAnim>0))drawSheet('backwalk',Math.floor(P.anim)%4,P.x,P.y+6,sc,false);
  // Andando para baixo (de frente): animação frontal; mantém a orientação mesmo durante os tiros.
  else if(P.walkDir==='down'&&(P.moving||P.shootAnim>0))drawSheet('frontwalk',Math.floor(P.anim)%4,P.x,P.y+6,sc,false);
  else if(P.shootAnim>0){const t=1-P.shootAnim/0.28;const seq=[2,3,4,5,0];drawSheet('shoot',seq[Math.min(4,Math.floor(t*5))],P.x,P.y+6-zz,sc,P.face<0);}
  else if(P.moving)drawSheet('walk',Math.floor(P.anim)%4,P.x,P.y+6,sc,P.face<0);
  else drawSheet('idle',Math.floor(P.anim)%4,P.x,P.y+6,sc,P.face<0);""",
"""  const sc=0.75,zz=P.z||0,air=P.jumpT>0,vert=P.moving&&(P.walkDir==='up'||P.walkDir==='down');
  let sx=1,sy=1,rot=0,bob=0;
  if(air){const p=1-P.jumpT/CFG.jumpTime;if(p<0.12){sx=1.08;sy=0.92;}else if(p<0.55){sx=0.95;sy=1.06;}else if(p>0.86){sx=0.97;sy=1.03;}if(P.moving&&!vert)rot=P.face*0.07;}
  else if(P.landT>0){const k=P.landT/0.14;sx=1+0.1*k;sy=1-0.1*k;}
  else if(P.moving){const ph=P.anim*Math.PI/2;if(vert){bob=-Math.abs(Math.sin(ph))*2.4;rot=Math.sin(ph)*0.04;sy=1-0.025*Math.abs(Math.cos(ph));}else{bob=-Math.abs(Math.cos(ph))*1.8;rot=P.face*0.05;}}
  ctx.save();ctx.translate(P.x,P.y+6-zz+bob);ctx.rotate(rot);ctx.scale(sx,sy);ctx.translate(-P.x,-(P.y+6));
  const fr=air?1:Math.floor(P.anim)%4;
  if(vert&&P.walkDir==='up')drawSheet('backwalk',fr,P.x,P.y+6,sc,false);
  else if(vert)drawSheet('frontwalk',fr,P.x,P.y+6,sc,false);
  else if(P.shootAnim>0&&!P.moving&&!air){const t=1-P.shootAnim/0.28;const seq=[2,3,4,5,0];drawSheet('shoot',seq[Math.min(4,Math.floor(t*5))],P.x,P.y+6,sc,P.face<0);}
  else if(P.moving||air)drawSheet('walk',air?2:[0,1,2,1][Math.floor(P.anim)%4],P.x,P.y+6,sc,P.face<0);   // passada-cruzamento-passada-cruzamento
  else drawSheet('idle',Math.floor(P.anim)%4,P.x,P.y+6,sc,P.face<0);
  ctx.restore();
  if(P.shootAnim>0.16&&(P.moving||air)){const mx=P.x+P.face*30,my=P.y-34-zz,k=(P.shootAnim-0.16)/0.12;ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(mx,my,1,mx,my,14);g.addColorStop(0,'rgba(220,255,255,'+k+')');g.addColorStop(1,'rgba(0,229,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(mx,my,14,0,Math.PI*2);ctx.fill();ctx.restore();}""")
R("  if(P.jumpT>0){P.jumpT=Math.max(0,P.jumpT-dt);if(P.jumpT===0)P.jumpCd=CFG.jumpCooldown;}",
  "  if(P.jumpT>0){P.jumpT=Math.max(0,P.jumpT-dt);if(P.jumpT===0){P.jumpCd=CFG.jumpCooldown;P.landT=0.14;burst(P.x,P.y+2,'#9aa3ad',7);sv=1;tone('sine',140,60,.09,.12);}}\n  P.landT=Math.max(0,(P.landT||0)-dt);")
R("  P.jumpT=CFG.jumpTime;sfx('jump');","  P.jumpT=CFG.jumpTime;sfx('jump');burst(P.x,P.y+2,'#9aa3ad',6);")

# ---------- fase 4: ganchos ----------
R("  floaters.push({x:m.x,y:m.y-40-m.t.scale*20,","  extOnHit(m,dmg);floaters.push({x:m.x,y:m.y-40-m.t.scale*20,")
R("if(m.boss)bossDown(m);}","if(m.boss)bossDown(m);extOnKill(m);}")
R("  drawBlastFX();drawEBolts();drawShieldFX();\n","  drawBlastFX();drawOmegaFX();drawAlly();drawEBolts();drawShieldFX();\n")
R("  drawWeather();drawHUD();drawBossBar();","  drawMultiFX();drawWeather();drawHUD();drawBossBar();")


# ---------- progressão: chefe no fim, arma lendária, portal só no final, dificuldade ----------
R("  if(PD.boss)spawnBoss(PD.boss);\n","")
R("  if(state==='play'&&enemies.length===0)phaseWon();","  extCheckClear();")
R("const sp=CFG.malwareSpeed*T.speed*spMul;","const sp=CFG.malwareSpeed*T.speed*spMul*DIFF().spd;")
R("hp=Math.round((T.hp[0]+Math.random()*(T.hp[1]-T.hp[0]))/5)*5","hp=Math.round((T.hp[0]+Math.random()*(T.hp[1]-T.hp[0]))*DIFF().hp/5)*5")
R("dmg:T.dmg,vx:0","dmg:Math.round(T.dmg*DIFF().dmg),vx:0")
R("if(m.boss&&m.stun>0)dmg*=2;","if(m.boss&&m.stun>0)dmg*=2;if(m.frozen>0)dmg=Math.round(dmg*1.5);")
R("  if(m.boss){updateBoss(m,dt);return;}","  if(m.frozen>0){m.frozen-=dt;m.kx*=0.9;m.ky*=0.9;m.flash=0;return;}\n  if(m.boss){updateBoss(m,dt);return;}")
R("if(m.dead||m.fade>0||(m.boss&&(m.alpha<0.5||!m.awake)))continue;","if(m.dead||m.fade>0||m.frozen>0||(m.boss&&(m.alpha<0.5||!m.awake)))continue;")
R("  if(m.boss){drawBoss(m);return;}","  if(m.boss){drawBoss(m);drawFrozen(m);return;}")
R("  // barra de vida do inimigo: moldura na cor do tipo, rastro de dano, divisões a cada 10 HP, tag e números\n","  drawFrozen(m);if(m.hp>=m.maxHp)return;   // barra só aparece quando o inimigo está ferido\n")
R("""  ctx.font='bold 10px system-ui,Arial';ctx.textAlign='center';
  ctx.fillStyle='#000';ctx.fillText(T.tag+'  '+Math.max(0,m.hp)+'/'+m.maxHp,m.x+1,y-5);
  ctx.fillStyle=T.color;ctx.fillText(T.tag,m.x-(ctx.measureText('  '+Math.max(0,m.hp)+'/'+m.maxHp).width)/2,y-6);
  ctx.fillStyle='#fff';ctx.fillText(Math.max(0,m.hp)+'/'+m.maxHp,m.x+(ctx.measureText(T.tag+'  ').width)/2,y-6);
""","")
R("ctx.fillText('Malwares restantes: '+enemies.length+'   Destruídos: '+kills,24,120);","ctx.fillText(hudCountText(),24,120);")
R("  ctx.fillText('Q / ícone: Sobrecarga (mirar → clicar para lançar · botão direito/Esc cancela)',VW-20,VH-26);\n","")
R("  ctx.fillText('E / ícone: Portal (mirar → clicar para abrir → entre nele para escolher a fase)',VW-20,VH-58);\n","")
R("  if(!touchDevice)ctx.fillText('WASD/Setas mover · Mouse mirar · Clique/J atirar · R recarregar · Espaço pular · M som · P pausa · H hitboxes',VW-20,VH-42);\n","")
R("""  ctx.textAlign='left';ctx.fillText('Arte do Malware: "Dregfly" por Emcee Flesher (OpenGameArt, CC-BY/OGA-BY 3.0)',12,VH-10);\n""","")
R("drawSkillIcon();drawPortalIcon();drawAbilityIcons();","drawSkillIcon();if(cleared)drawPortalIcon();drawAbilityIcons();")
R("function overPIcon(){if(touchDevice)return false;","function overPIcon(){if(touchDevice||!cleared)return false;")
R("  if(intro.on||pcard.on)return;\n  if(pmenu.open){","  if(intro.on||pcard.on)return;\n  if(!pmenu.open&&!cleared){if(P&&state==='play'){pdeny=0.3;sfx('deny');floaters.push({x:P.x,y:P.y-95,t:1.2,txt:'Portal só abre depois de vencer todos',c:'#9dff4d'});}return;}\n  if(pmenu.open){")
R("  drawBlastFX();drawOmegaFX();drawAlly();","  drawBlastFX();drawOmegaFX();drawAlly();drawWeaponWorld();")
R("drawMultiFX();drawWeather();drawHUD();drawBossBar();","drawMultiFX();drawWeather();drawHUD();drawBossBar();drawProgressHUD();")
R("function playWeaponShotSound(){\n  if(muted)return;\n  if(playBuf('shot',1))return;","function playWeaponShotSound(){\n  if(muted)return;\n  shotSynth();\n  if(playBuf('shot',1))return;")


# ---------- caminhada: direção estável na diagonal e passo no ritmo da velocidade ----------
R("  P.anim+=dt*(P.moving?10:4);","  P.anim+=dt*(P.moving?Math.min(12,sp*(P.slowT>0?0.55:1)/26):4);")
R("  if(P.moving){if(Math.abs(ay)>Math.abs(ax))P.walkDir=ay<0?'up':'down';else if(Math.abs(ax)>.05)P.walkDir='side';}",
  "  if(P.moving){const X=Math.abs(ax),Y=Math.abs(ay);if(Y>X*1.35)P.walkDir=ay<0?'up':'down';else if(X>Y*1.35||!P.walkDir)P.walkDir='side';}")
# 3) cada folha de sprite alinhada pelo centro do corpo (sem "pulo" ao trocar de animação)
R("  ctx.drawImage(img,frame*s.w*k,0,s.w*k,s.h*k,-dw/2,-dh,dw,dh);","  const ox=s.cx!=null?s.cx*scale:dw/2;\n  ctx.drawImage(img,frame*s.w*k,0,s.w*k,s.h*k,-ox,-dh,dw,dh);")


# ---------- pulo duplo (física de pulo com gravidade) ----------
R("  if(P.jumpT>0){P.jumpT=Math.max(0,P.jumpT-dt);if(P.jumpT===0){P.jumpCd=CFG.jumpCooldown;P.landT=0.14;burst(P.x,P.y+2,'#9aa3ad',7);sv=1;tone('sine',140,60,.09,.12);}}",
  "  if(P.jumpT>0){P.vz-=1216*dt;P.z=Math.max(0,(P.z||0)+P.vz*dt);P.djFX=Math.max(0,(P.djFX||0)-dt);\n    if(P.z<=0&&P.vz<0){P.z=0;P.vz=0;P.jumpT=0;P.jumps=0;P.djFX=0;P.jumpCd=CFG.jumpCooldown;P.landT=0.14;burst(P.x,P.y+2,'#9aa3ad',7);sv=1;tone('sine',140,60,.09,.12);}}")
R("P.z=P.jumpT>0?Math.sin((1-P.jumpT/CFG.jumpTime)*Math.PI)*CFG.jumpHeight:0;","if(!(P.jumpT>0))P.z=0;")
R("""  if(!P||state!=='play'||paused||intro.on||pcard.on||P.jumpT>0||P.jumpCd>0)return;
  P.jumpT=CFG.jumpTime;sfx('jump');burst(P.x,P.y+2,'#9aa3ad',6);""",
"""  if(!P||state!=='play'||paused||intro.on||pcard.on)return;
  if(P.jumpT>0){   // PULO DUPLO: segundo impulso no ar, com cambalhota
    if((P.jumps||1)>=2)return;
    P.jumps=2;P.vz=330;P.djFX=0.38;sv=1;tone('sine',420,1100,.16,.16);tone('triangle',840,1600,.12,.08,.04);
    burst(P.x,P.y-(P.z||0),'#8df5ff',12);burst(P.x,P.y-(P.z||0),'#ffffff',6);return;}
  if(P.jumpCd>0)return;
  P.jumpT=1;P.jumps=1;P.vz=334;P.z=0.01;sfx('jump');burst(P.x,P.y+2,'#9aa3ad',6);""")
R("if(air){const p=1-P.jumpT/CFG.jumpTime;if(p<0.12){sx=1.08;sy=0.92;}else if(p<0.55){sx=0.95;sy=1.06;}else if(p>0.86){sx=0.97;sy=1.03;}",
  "if(air){if(P.vz>300){sx=1.06;sy=0.94;}else if(P.vz>120){sx=0.95;sy=1.06;}else if(P.vz<-240){sx=0.97;sy=1.03;}if(P.djFX>0){const k=Math.sin((1-P.djFX/0.38)*Math.PI);sx*=1+0.06*k;sy*=1-0.1*k;if(P.moving)rot+=P.face*0.15*k;}")

# ---------- correção: fatia verde na animação de chegada do portal (bug original) ----------
R("ctx.beginPath();ctx.rect(0,0,VW,VH);ctx.arc(cx,cy,R,0,7,true);ctx.fill('evenodd');",
  "ctx.beginPath();ctx.rect(0,0,VW,VH);ctx.moveTo(cx+R,cy);ctx.arc(cx,cy,R,0,Math.PI*2,true);ctx.fill('evenodd');")

# ---------- segurança ----------
R('<meta name="theme-color" content="#05060d">',
  '<meta name="theme-color" content="#05060d">\n<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; media-src data: blob:; connect-src data:; font-src data:; base-uri \'none\'; form-action \'none\'">\n<meta name="referrer" content="no-referrer">')
R('<script>\n"use strict";','<script>\n(()=>{"use strict";')
R('</script>\n</body>','})();\n</script>\n</body>')
open('Kayzen_Ryuu_debug.html','w',encoding='utf-8').write(s)
i=s.index('\nwindow.__game=');j=s.index('\n',i+1)
rel=s[:i]+s[j:]
assert '__game' not in rel
open('Kayzen_Ryuu_release_src.html','w',encoding='utf-8').write(rel)
open('Kayzen_Ryuu.html','w',encoding='utf-8').write(rel)
print('ok', len(src), len(s))
