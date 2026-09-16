(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');

  const HUD = {
    coins: document.getElementById('hudCoins'),
    coinsTotal: document.getElementById('hudCoinsTotal'),
    time: document.getElementById('hudTime'),
    hearts: document.getElementById('hudHearts'),
    dashFill: document.getElementById('dashFill'),
    progress: document.getElementById('hudProgress'),
    progressLabel: document.getElementById('hudProgressLabel'),
    centerMsg: document.getElementById('centerMsg'),
    wallHint: document.getElementById('wallHint'),
    levelLabel: document.getElementById('levelLabel'),
  };

  const overlayStart = document.getElementById('overlayStart');
  const overlaySkin = document.getElementById('overlaySkin');
  const overlayPause = document.getElementById('overlayPause');
  const overlayWin = document.getElementById('overlayWin');
  const overlayDead = document.getElementById('overlayDead');

  // ---------- Config ----------
  const CONFIG = {
    gravity: 2200,
    moveSpeed: 340,
    jumpForce: 680,
    dashSpeed: 720,
    dashDuration: 0.18,
    dashCooldown: 0.85,
    coyoteTime: 0.14,
    jumpBuffer: 0.14,
    wallSlideSpeed: 110,
    wallJumpX: 380,
    wallJumpY: 620,
    terminalVel: 1200,
  };

  const SKINS = {
    kiko:  { name:'KIKO',  scarf:'#8b7aff', body1:'#eaffff', body2:'#c8f5ff', body3:'#9ed8ff', trail:'#7af0ff', glow:'#7af0ff' },
    nova:  { name:'NOVA',  scarf:'#ff7af0', body1:'#fff0ff', body2:'#ffd6f5', body3:'#e8a0ff', trail:'#ff7af0', glow:'#ff7af0' },
    yuki:  { name:'YUKI',  scarf:'#5bb8ff', body1:'#f0fbff', body2:'#d6f0ff', body3:'#a0d4ff', trail:'#5bb8ff', glow:'#a0e8ff' },
    ember: { name:'EMBER', scarf:'#ff8a4a', body1:'#fff8ee', body2:'#ffe0c2', body3:'#ffb88a', trail:'#ffce6b', glow:'#ff8a4a' },
  };

  let currentSkin = localStorage.getItem('ad_skin') || 'kiko';
  let saveData = (()=>{ try{ return JSON.parse(localStorage.getItem('ad_save')||'{}')}catch{return{}} })();
  // saveData: {1:{bestTime, bestCoins, completed}, 2:{...}, unlocked2}

  const lerp = (a,b,t)=>a+(b-a)*t;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const rand = (a,b)=>a+Math.random()*(b-a);
  const nowSec = ()=>performance.now()/1000;
  function roundRect(ctx,x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function formatTime(s){ const m=Math.floor(s/60).toString().padStart(2,'0'); const sc=Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${sc}`; }

  // ---------- Input ----------
  const input = { left:false,right:false,jump:false,jumpPressed:false,dashPressed:false, anyDir:0 };
  const keys = {};
  addEventListener('keydown', e=>{
    if(['Space','ArrowUp','ArrowLeft','ArrowRight','ArrowDown'].includes(e.code)) e.preventDefault();
    keys[e.code]=true;
    if(e.code==='KeyP') togglePause();
    if(e.code==='KeyR') resetLevel();
    if(e.code==='KeyM') toggleMute();
    if(e.code==='KeyH') document.querySelector('.hud').style.display = document.querySelector('.hud').style.display==='none'?'flex':'flex';
    updateInput();
    if(e.code==='Space' || e.code==='ArrowUp' || e.code==='KeyW') input.jumpPressed=true;
    if(e.code==='ShiftLeft' || e.code==='ShiftRight' || e.code==='KeyJ') input.dashPressed=true;
    if(e.code==='Escape') showMap();
  });
  addEventListener('keyup', e=>{ keys[e.code]=false; updateInput(); if(e.code==='Space' || e.code==='ArrowUp' || e.code==='KeyW') input.jump=false; });
  function updateInput(){ input.left=!!(keys['ArrowLeft']||keys['KeyA']); input.right=!!(keys['ArrowRight']||keys['KeyD']); input.jump=!!(keys['Space']||keys['KeyW']||keys['ArrowUp']); input.anyDir=(input.right?1:0)-(input.left?1:0); }
  const bindHold = (el, on, off)=>{ const s=e=>{e.preventDefault();on();}; const e2=e=>{e.preventDefault();off();}; el.addEventListener('touchstart',s,{passive:false}); el.addEventListener('touchend',e2,{passive:false}); el.addEventListener('mousedown',on); addEventListener('mouseup',off); };
  bindHold(document.getElementById('tLeft'), ()=>{keys['ArrowLeft']=true;updateInput();}, ()=>{keys['ArrowLeft']=false;updateInput();});
  bindHold(document.getElementById('tRight'),()=>{keys['ArrowRight']=true;updateInput();},()=>{keys['ArrowRight']=false;updateInput();});
  bindHold(document.getElementById('tJump'),()=>{ input.jumpPressed=true; keys['Space']=true; updateInput(); setTimeout(()=>{keys['Space']=false; updateInput();},120); },()=>{});
  document.getElementById('tDash').addEventListener('touchstart',e=>{ e.preventDefault(); input.dashPressed=true; keys['ShiftLeft']=true; },{passive:false});
  document.getElementById('tDash').addEventListener('click',()=>{input.dashPressed=true;});
  // UI buttons
  document.getElementById('btnMap').onclick=()=>showMap();
  document.getElementById('btnToMap').onclick=()=>showMap();
  document.getElementById('btnToMap2').onclick=()=>showMap();
  document.getElementById('btnToMap3').onclick=()=>showMap();
  document.getElementById('btnSkin').onclick=()=>overlaySkin.classList.add('show');
  document.getElementById('btnSkinClose').onclick=()=>overlaySkin.classList.remove('show');
  document.getElementById('btnPause').onclick=()=>togglePause();
  document.getElementById('btnResume').onclick=()=>togglePause();
  document.getElementById('btnRestart').onclick=()=>resetLevel();
  document.getElementById('btnRestart2').onclick=()=>resetLevel();
  document.getElementById('btnAgain').onclick=()=>resetLevel();
  document.getElementById('btnRetry').onclick=()=>resetLevel();
  document.getElementById('btnNext').onclick=()=>{ if(currentLevelId===1) startGame(2); else showMap(); };
  document.getElementById('btnSound').onclick=()=>toggleMute();
  // level cards
  document.querySelectorAll('.level-card').forEach(c=>{
    c.addEventListener('click', ()=>{
      const lv=parseInt(c.dataset.level,10);
      if(c.classList.contains('locked')) return;
      startGame(lv);
    });
  });
  // skin pick
  function setSkin(s){
    currentSkin=s;
    localStorage.setItem('ad_skin', s);
    document.querySelectorAll('.char-card, .skin-opt').forEach(el=>el.classList.remove('pick','active'));
    document.querySelectorAll(`[data-skin="${s}"]`).forEach(el=>el.classList.add(el.classList.contains('skin-opt')?'active':'pick'));
    if(player) player.skin=s;
  }
  document.querySelectorAll('[data-skin]').forEach(el=>{
    el.addEventListener('click', ()=>setSkin(el.dataset.skin));
  });
  setSkin(currentSkin);

  // ---------- Audio ----------
  let audioCtx=null, muted=false;
  function ensureAudio(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume(); }
  function tone(freq,dur,type='sine',gain=0.12,slideTo){ if(muted||!audioCtx) return; const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(audioCtx.destination); g.gain.value=gain; g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+dur); if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime+dur); o.start(); o.stop(audioCtx.currentTime+dur); }
  function sfxJump(){ tone(420,0.12,'sine',0.18,720); setTimeout(()=>tone(880,0.08,'square',0.06),40); }
  function sfxCoin(){ tone(880,0.14,'sine',0.16,1320); setTimeout(()=>tone(1320,0.18,'sine',0.12),80); }
  function sfxDash(){ tone(180,0.18,'square',0.14,80); tone(520,0.10,'triangle',0.10); }
  function sfxStomp(){ tone(220,0.12,'square',0.16,90); }
  function sfxHurt(){ tone(140,0.25,'sawtooth',0.12,60); }
  function sfxWall(){ tone(520,0.08,'triangle',0.10,620); }
  function sfxCrystal(){ tone(660,0.18,'sine',0.12,990); }
  function sfxWin(){ [0,2,4,7,12].forEach((n,i)=>setTimeout(()=>tone(260*Math.pow(2,n/12),0.35,'sine',0.14), i*90)); }
  function toggleMute(){ muted=!muted; document.getElementById('btnSound').textContent = muted?'🔇 Sound Off':'🔊 Sound On'; if(!muted) ensureAudio(); }

  // ---------- View & Camera ----------
  let DPR = Math.min(2, window.devicePixelRatio||1);
  const VIEW = {w:1280,h:720};
  function resize(){ DPR=Math.min(2, window.devicePixelRatio||1); const rect=stage.getBoundingClientRect(); canvas.width=Math.round(rect.width*DPR); canvas.height=Math.round(rect.height*DPR); canvas.style.width=rect.width+'px'; canvas.style.height=rect.height+'px'; ctx.setTransform(DPR,0,0,DPR,0,0); VIEW.w=rect.width; VIEW.h=rect.height; }
  addEventListener('resize', resize); resize();

  class Camera{
    constructor(){ this.x=0; this.y=0; this.tx=0; this.ty=0; this.shake=0; }
    follow(target, levelW, levelH){
      this.tx = clamp(target.x + target.w/2 - VIEW.w/2, 0, levelW - VIEW.w);
      let lookY = target.vy * 0.12;
      this.ty = clamp(target.y + target.h/2 - VIEW.h/2 + lookY, -120, levelH - VIEW.h + 80);
      this.x = lerp(this.x, this.tx, 0.12);
      this.y = lerp(this.y, this.ty, 0.10);
      if(this.shake>0){ this.x+=rand(-this.shake,this.shake); this.y+=rand(-this.shake,this.shake); this.shake=Math.max(0,this.shake-0.9); }
    }
    apply(ctx){ ctx.translate(-this.x, -this.y); }
    kick(p=10){ this.shake=p; }
  }

  class Particles{
    constructor(){ this.list=[]; }
    emit(x,y,n,opts={}){
      for(let i=0;i<n;i++) this.list.push({ x,y, vx:rand(opts.vx?.[0]??-160,opts.vx?.[1]??160), vy:rand(opts.vy?.[0]??-260,opts.vy?.[1]??-40), life:rand(0.35,0.75), t:0, r:rand(2,5), col:opts.col||`hsl(${rand(180,210)},100%,70%)`, grav:opts.grav??620, drag:opts.drag??0.98 });
    }
    update(dt){ for(const p of this.list){ p.t+=dt; p.vy+=p.grav*dt; p.vx*=p.drag; p.x+=p.vx*dt; p.y+=p.vy*dt; } this.list=this.list.filter(p=>p.t<p.life); }
    draw(ctx){ for(const p of this.list){ const a=1-p.t/p.life; ctx.globalAlpha=a; ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2); ctx.fill(); } ctx.globalAlpha=1; }
  }

  // ---------- Levels ----------
  // Level 1 — Verdant Ascent (remade)
  function buildLevel1(){
    const LEVEL={w:4200,h:720};
    const pls=[], coins=[], enemies=[], spikes=[], moving=[], walls=[], fragiles=[], crystals=[];
    pls.push({x:0,y:640,w:4200,h:80,type:'ground'});
    pls.push({x:220,y:540,w:180,h:18,type:'grass'});
    pls.push({x:460,y:480,w:160,h:18,type:'grass'});
    pls.push({x:680,y:520,w:140,h:18,type:'grass'});
    pls.push({x:340,y:620,w:28,h:20,type:'stone'});
    pls.push({x:560,y:622,w:32,h:18,type:'stone'});
    pls.push({x:920,y:520,w:130,h:18,type:'cloud'});
    pls.push({x:1120,y:460,w:130,h:18,type:'cloud'});
    pls.push({x:1320,y:500,w:150,h:18,type:'cloud'});
    moving.push({x:980,y:580,w:150,h:16,type:'moving',ax:980,bx:1160,speed:90,dir:1,y0:580});
    moving.push({x:1380,y:360,w:140,h:16,type:'moving',ax:1380,bx:1520,speed:70,dir:-1,y0:360,vertical:true,ay:340,by:520});
    pls.push({x:1620,y:560,w:160,h:18,type:'grass'});
    pls.push({x:1820,y:500,w:140,h:18,type:'grass'});
    pls.push({x:1980,y:430,w:140,h:18,type:'grass'});
    pls.push({x:2140,y:360,w:160,h:18,type:'grass'});
    pls.push({x:1900,y:580,w:22,h:60,type:'stone'});
    pls.push({x:2060,y:500,w:22,h:140,type:'stone'});
    pls.push({x:1720,y:320,w:110,h:14,type:'cloud'});
    pls.push({x:2240,y:300,w:120,h:14,type:'cloud'});
    pls.push({x:2380,y:540,w:140,h:18,type:'grass'});
    pls.push({x:2600,y:480,w:120,h:18,type:'cloud'});
    pls.push({x:2760,y:540,w:140,h:18,type:'grass'});
    pls.push({x:2920,y:460,w:120,h:18,type:'cloud'});
    pls.push({x:3080,y:540,w:140,h:18,type:'grass'});
    pls.push({x:2680,y:620,w:16,h:20,type:'stone'});
    pls.push({x:3000,y:620,w:16,h:20,type:'stone'});
    moving.push({x:2500,y:560,w:130,h:16,type:'moving',ax:2500,bx:2660,speed:110,dir:1,y0:560});
    pls.push({x:3320,y:520,w:160,h:18,type:'grass'});
    pls.push({x:3540,y:460,w:160,h:18,type:'grass'});
    pls.push({x:3760,y:400,w:180,h:18,type:'grass'});
    pls.push({x:3980,y:340,w:160,h:18,type:'cloud'});
    pls.push({x:3600,y:620,w:24,h:20,type:'stone'});
    pls.push({x:3780,y:620,w:24,h:20,type:'stone'});
    // walls for tutorial wall jump (short)
    walls.push({x:2080,y:360,w:14,h:280,type:'wall'});
    const coinPos=[[310,500],[540,440],[720,480],[990,540],[1185,420],[1390,460],[1680,520],[2030,390],[2280,260],[2660,440],[2980,420],[3820,360]];
    coinPos.forEach(([x,y])=>coins.push({x,y,w:18,h:18,collected:false,bob:Math.random()*Math.PI*2}));
    enemies.push({x:430,y:620,w:28,h:22,type:'puff',dir:1,speed:48,left:380,right:560,alive:true,squish:0});
    enemies.push({x:1360,y:620,w:28,h:22,type:'puff',dir:-1,speed:55,left:1320,right:1500,alive:true,squish:0});
    enemies.push({x:1880,y:620,w:28,h:22,type:'puff',dir:1,speed:42,left:1820,right:2020,alive:true,squish:0});
    enemies.push({x:2840,y:620,w:28,h:22,type:'puff',dir:1,speed:60,left:2760,right:2960,alive:true,squish:0});
    enemies.push({x:1080,y:300,w:36,h:22,type:'drone',dir:1,speed:70,left:980,right:1200,alive:true,y0:300,t:0});
    enemies.push({x:2560,y:280,w:36,h:22,type:'drone',dir:-1,speed:80,left:2440,right:2720,alive:true,y0:280,t:1.2});
    enemies.push({x:3100,y:320,w:36,h:22,type:'drone',dir:1,speed:75,left:2980,right:3220,alive:true,y0:320,t:0.6});
    spikes.push({x:760,y:624,w:72,h:16});
    spikes.push({x:2520,y:624,w:48,h:16});
    spikes.push({x:3180,y:624,w:72,h:16});
    const goal={x:4040,y:210,w:56,h:130,active:true};
    return {LEVEL,pls,coins,enemies,spikes,moving,walls,fragiles,crystals,goal,name:'VERDANT ASCENT',id:1,bg:'garden'};
  }

  // Level 2 — Crystal Spires (NEW)
  function buildLevel2(){
    const LEVEL={w:4400,h:720};
    const pls=[], coins=[], enemies=[], spikes=[], moving=[], walls=[], fragiles=[], crystals=[];
    // base ground but darker
    pls.push({x:0,y:640,w:4400,h:80,type:'ground2'});
    // start
    pls.push({x:180,y:540,w:170,h:18,type:'crystal'});
    pls.push({x:420,y:500,w:140,h:14,type:'crystal'});
    // fragile intro
    fragiles.push({x:620,y:520,w:120,h:14,type:'fragile',timer:0,falling:false,vy:0});
    fragiles.push({x:780,y:480,w:120,h:14,type:'fragile',timer:0,falling:false,vy:0});
    pls.push({x:960,y:460,w:140,h:14,type:'crystal'});
    // wall jump tutorial - two tall walls forming a shaft
    walls.push({x:1160,y:260,w:18,h:380,type:'wall'});
    walls.push({x:1340,y:260,w:18,h:380,type:'wall'});
    // platforms inside shaft
    pls.push({x:1200,y:520,w:110,h:12,type:'crystal'});
    pls.push({x:1220,y:420,w:100,h:12,type:'crystal'});
    // fragile bridge over spikes
    fragiles.push({x:1520,y:540,w:100,h:14,type:'fragile',timer:0,falling:false,vy:0});
    fragiles.push({x:1640,y:540,w:100,h:14,type:'fragile',timer:0,falling:false,vy:0});
    fragiles.push({x:1760,y:540,w:100,h:14,type:'fragile',timer:0,falling:false,vy:0});
    spikes.push({x:1520,y:624,w:340,h:16});
    // mid moving crystal
    moving.push({x:1920,y:500,w:130,h:14,type:'moving',ax:1920,bx:2100,speed:95,dir:1,y0:500});
    moving.push({x:2180,y:360,w:130,h:14,type:'moving',ax:2180,bx:2180,speed:70,dir:1,y0:360,vertical:true,ay:300,by:520});
    // wall climb section
    walls.push({x:2360,y:200,w:16,h:440,type:'wall'});
    pls.push({x:2260,y:480,w:120,h:12,type:'crystal'});
    pls.push({x:2260,y:380,w:120,h:12,type:'crystal'});
    pls.push({x:2260,y:280,w:120,h:12,type:'crystal'});
    // lantern enemies patrol
    // crystal platforms higher
    pls.push({x:2540,y:460,w:140,h:12,type:'crystal'});
    pls.push({x:2720,y:400,w:120,h:12,type:'crystal'});
    fragiles.push({x:2900,y:460,w:140,h:14,type:'fragile',timer:0,falling:false,vy:0});
    pls.push({x:3080,y:340,w:140,h:12,type:'crystal'});
    // dash crystals (refill)
    crystals.push({x:2000,y:460,w:16,h:16,collected:false,bob:0});
    crystals.push({x:2620,y:420,w:16,h:16,collected:false,bob:1});
    crystals.push({x:3150,y:300,w:16,h:16,collected:false,bob:2});
    // final wall shaft to portal
    walls.push({x:3440,y:180,w:18,h:460,type:'wall'});
    walls.push({x:3620,y:180,w:18,h:460,type:'wall'});
    pls.push({x:3480,y:520,w:110,h:12,type:'crystal'});
    pls.push({x:3480,y:420,w:110,h:12,type:'crystal'});
    pls.push({x:3480,y:320,w:110,h:12,type:'crystal'});
    // portal island
    pls.push({x:3760,y:480,w:160,h:14,type:'crystal'});
    pls.push({x:3960,y:420,w:160,h:14,type:'crystal'});
    pls.push({x:4140,y:340,w:160,h:14,type:'crystal'});
    walls.push({x:3900,y:480,w:14,h:160,type:'wall'});
    // coins 12
    const coinPos=[[260,500],[500,460],[960,420],[1240,480],[1820,500],[2320,440],[2580,420],[2760,360],[2940,420],[3360,300],[3840,440],[4200,300]];
    coinPos.forEach(([x,y])=>coins.push({x,y,w:18,h:18,collected:false,bob:Math.random()*Math.PI*2}));
    // enemies: puff replaced by crab, drone by lantern
    enemies.push({x:480,y:620,w:30,h:20,type:'crab',dir:1,speed:52,left:400,right:580,alive:true,squish:0});
    enemies.push({x:1700,y:620,w:30,h:20,type:'crab',dir:-1,speed:48,left:1640,right:1820,alive:true,squish:0});
    enemies.push({x:2600,y:620,w:30,h:20,type:'crab',dir:1,speed:55,left:2540,right:2720,alive:true,squish:0});
    enemies.push({x:1200,y:300,w:34,h:34,type:'lantern',dir:1,speed:60,left:1180,right:1320,alive:true,y0:300,t:0.3});
    enemies.push({x:2300,y:280,w:34,h:34,type:'lantern',dir:1,speed:70,left:2280,right:2420,alive:true,y0:280,t:0.9});
    enemies.push({x:3000,y:240,w:34,h:34,type:'lantern',dir:-1,speed:65,left:2900,right:3080,alive:true,y0:240,t:1.5});
    spikes.push({x:700,y:624,w:48,h:16});
    spikes.push({x:3260,y:624,w:72,h:16});
    const goal={x:4200,y:210,w:56,h:130,active:true};
    return {LEVEL,pls,coins,enemies,spikes,moving,walls,fragiles,crystals,goal,name:'CRYSTAL SPIRES',id:2,bg:'cave'};
  }

  const LEVELS = {1: buildLevel1, 2: buildLevel2};

  // ---------- Player ----------
  class Player{
    constructor(skin='kiko'){
      this.w=28; this.h=34; this.x=80; this.y=560; this.vx=0; this.vy=0; this.facing=1;
      this.onGround=false; this.coyote=0; this.jumpBuffer=0; this.dashTime=0; this.dashCd=0; this.dashing=false;
      this.hp=3; this.hurtCd=0; this.invuln=0; this.animT=0; this.squash=0; this.coins=0; this.checkX=80; this.checkY=560;
      this.skin=skin; this.wallDir=0; this.wallSlide=false; this.wallTime=0;
    }
    rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
    update(dt, level, particles, camera){
      this.animT+=dt;
      if(this.hurtCd>0) this.hurtCd-=dt;
      if(this.invuln>0) this.invuln-=dt;
      if(this.dashCd>0) this.dashCd-=dt;
      if(this.dashing){ this.dashTime-=dt; if(this.dashTime<=0){ this.dashing=false; this.vx*=0.55; } }
      if(this.onGround) this.coyote=CONFIG.coyoteTime; else this.coyote-=dt;
      if(input.jumpPressed) this.jumpBuffer=CONFIG.jumpBuffer; else this.jumpBuffer-=dt;
      input.jumpPressed=false;

      // wall detection
      this.wallDir=0; this.wallSlide=false;
      // check touching wall left/right (thin probe)
      const probe = 2;
      for(const w of level.walls){
        if(this.y+this.h > w.y+4 && this.y < w.y+w.h-4){
          if(Math.abs((this.x+this.w) - w.x) < probe+1 && input.right) this.wallDir=1, this.wallSlide=true;
          if(Math.abs(this.x - (w.x+w.w)) < probe+1 && input.left) this.wallDir=-1, this.wallSlide=true;
        }
      }
      // also check static stone walls that act as wall (for level1 pillar)
      for(const p of level.pls){ if(p.type==='stone' && p.w<30){ if(this.y+this.h > p.y+4 && this.y < p.y+p.h-4){ if(Math.abs((this.x+this.w)-p.x)<probe+1 && input.right) this.wallDir=1, this.wallSlide=true; if(Math.abs(this.x-(p.x+p.w))<probe+1 && input.left) this.wallDir=-1, this.wallSlide=true; } } }

      if(this.wallSlide && !this.onGround && this.vy>0){
        this.vy = Math.min(this.vy, CONFIG.wallSlideSpeed);
        if(this.vy>20) { if(Math.random()<0.35) particles.emit(this.x+(this.wallDir>0?this.w+2:-2), this.y+this.h/2, 1, {col:'rgba(255,255,255,.6)', vx:[-20,20], vy:[-10,30], grav:280}); }
        this.wallTime+=dt;
        // show hint
        HUD.wallHint.style.display='flex';
      } else { this.wallTime=0; HUD.wallHint.style.display='none'; }

      // dash
      if(input.dashPressed && this.dashCd<=0 && !this.dashing){
        input.dashPressed=false;
        this.dashing=true; this.dashTime=CONFIG.dashDuration; this.dashCd=CONFIG.dashCooldown;
        this.vx=(this.facing!==0?this.facing:(input.anyDir||1))*CONFIG.dashSpeed;
        this.vy=Math.min(this.vy,-40);
        this.invuln=CONFIG.dashDuration+0.08;
        particles.emit(this.x+this.w/2,this.y+this.h/2,10,{col:SKINS[this.skin].trail, vx:[-40,40], vy:[-60,60], grav:120});
        camera.kick(5); sfxDash();
      } else input.dashPressed=false;

      if(!this.dashing){
        const target=input.anyDir*CONFIG.moveSpeed;
        const accel=this.onGround?0.22:0.11;
        this.vx=lerp(this.vx,target,accel);
        if(input.anyDir===0 && this.onGround) this.vx*=0.84;
        if(input.anyDir!==0) this.facing=input.anyDir>0?1:-1;
      }

      // jump handling: normal + wall jump + coyote
      let wallJump = false;
      if(this.wallSlide && this.jumpBuffer>0){
        wallJump=true;
        this.vy=-CONFIG.wallJumpY;
        this.vx=-this.wallDir*CONFIG.wallJumpX;
        this.jumpBuffer=0; this.coyote=0; this.wallSlide=false; this.wallTime=0;
        this.squash=-0.16;
        particles.emit(this.x+this.w/2,this.y+this.h/2,8,{col:'#ffffff', vx:[-60,60], vy:[-40,40], grav:420});
        sfxWall(); showCenter("🧗 WALL JUMP!");
      } else if(this.coyote>0 && this.jumpBuffer>0){
        this.vy=-CONFIG.jumpForce; this.coyote=0; this.jumpBuffer=0; this.onGround=false; this.squash=-0.18;
        particles.emit(this.x+this.w/2,this.y+this.h,8,{col:'#ffffff', vx:[-70,70], vy:[-10,50], grav:500});
        sfxJump(); if(Math.random()<0.12) showCenter("✦ Flow!");
      }
      // variable jump cut (not if wall jump)
      if(!input.jump && this.vy<-220 && !wallJump) this.vy*=0.5;
      if(!this.dashing){ this.vy+=CONFIG.gravity*dt; this.vy=Math.min(this.vy,CONFIG.terminalVel); }

      // integrate X
      let nx=this.x+this.vx*dt;
      const allPlats=[...level.pls, ...level.moving, ...level.walls, ...level.fragiles.filter(f=>!f.falling), ...level.pls.filter(p=>p.type==='stone')];
      // Actually walls included separately, but also include fragile
      for(const p of allPlats){
        if(rectOverlap({x:nx,y:this.y,w:this.w,h:this.h}, p)){
          if(this.vx>0) nx=p.x - this.w - 0.01; else if(this.vx<0) nx=p.x+p.w+0.01;
          // if hitting wall while wall sliding, don't zero vx completely? keep push
          if(this.wallSlide) this.vx=0; else this.vx=this.dashing?this.vx*0.9:0;
          // nudge off wall a bit
        }
      }
      this.x=nx;
      // Y
      let ny=this.y+this.vy*dt;
      let wasOnGround=this.onGround; this.onGround=false;
      // collect collidables for Y (including fragile)
      const yPlats=[...level.pls, ...level.moving, ...level.fragiles.filter(f=>!f.falling)];
      for(const p of yPlats){
        if(rectOverlap({x:this.x,y:ny,w:this.w,h:this.h}, p)){
          if(this.vy>0){ ny=p.y - this.h - 0.01; this.vy=0; this.onGround=true;
            if(p.type==='moving'){ this.x+=p._dx||0; if(p.vertical) this.y+=p._dy||0; }
            if(p.type==='fragile'){ p.timer+=dt; if(p.timer>0.45 && !p.falling){ p.falling=true; p.vy=0; } }
            if(!wasOnGround){ particles.emit(this.x+this.w/2,this.y+this.h,6,{col:'rgba(122,240,255,.9)', vx:[-50,50], vy:[-20,10], grav:400}); this.squash=0.16; }
          } else if(this.vy<0){ ny=p.y+p.h+0.01; this.vy=0; }
        }
      }
      // walls Y also collide? walls are vertical, Y collision not needed except as platforms? ignore walls for Y unless landing on top (thin). So skip.

      this.y=ny;

      // carry by moving platforms
      for(const p of level.moving){
        if(Math.abs((this.y+this.h)-p.y)<1.2 && this.x+this.w>p.x && this.x<p.x+p.w){
          this.x+=p._dx||0; if(p.vertical) this.y+=p._dy||0; if(this.onGround) this.y=p.y - this.h;
        }
      }

      this.x=clamp(this.x,0,level.LEVEL.w - this.w);
      if(this.y>level.LEVEL.h+120) this.hurt(1,level,camera,particles,true);
      this.squash=lerp(this.squash,0,0.18);

      // coins
      for(const c of level.coins){ if(c.collected) continue; if(rectOverlap(this.rect(),{x:c.x-6,y:c.y-6,w:28,h:28})){ c.collected=true; this.coins++; sfxCoin(); particles.emit(c.x+9,c.y+9,12,{col:'#ffce6b', vx:[-90,90], vy:[-180,-20], grav:380}); showCenter("◆ +1"); } }
      // dash crystals
      for(const cr of level.crystals){ if(cr.collected) continue; if(rectOverlap(this.rect(),{x:cr.x-4,y:cr.y-4,w:24,h:24})){ cr.collected=true; this.dashCd=0; sfxCrystal(); particles.emit(cr.x+8,cr.y+8,14,{col:'#7af0ff', vx:[-80,80], vy:[-160,-20], grav:340}); showCenter("🔷 Dash Refill!"); } }
      // spikes
      for(const s of level.spikes){ if(this.invuln<=0 && rectOverlap(this.rect(), s)){ this.hurt(1,level,camera,particles); this.vy=-420; this.vx=-this.facing*220; } }
      // enemies
      for(const e of level.enemies){ if(!e.alive) continue; const er={x:e.x,y:e.y,w:e.w,h:e.h}; if(rectOverlap(this.rect(), er)){ const fromTop=(this.vy>0)&&(this.y+this.h - e.y<16); if(fromTop||this.dashing){ e.alive=false; e.squish=1; this.vy=-520; this.squash=-0.14; particles.emit(e.x+e.w/2,e.y+e.h/2,10,{col:e.type==='drone'||e.type==='lantern'?'#8b7aff':'#ff8a9b', vx:[-100,100], vy:[-160,-10], grav:500}); camera.kick(4); sfxStomp(); showCenter(e.type==='lantern'?'⚡ ZAP!':e.type==='crab'?'🦀 CRACK!':'💥 POP!'); } else if(this.invuln<=0 && this.hurtCd<=0){ this.hurt(1,level,camera,particles); this.vx=(this.x<e.x?-1:1)*260; this.vy=-360; } } }
      // goal
      if(level.goal && rectOverlap(this.rect(), level.goal)){ if(gameState!=='win') winLevel(); }
    }
    hurt(amount, level, camera, particles, isFall=false){
      if(this.invuln>0||this.hurtCd>0) return;
      this.hp-=amount; this.hurtCd=0.9; this.invuln=1.0; camera.kick(10);
      particles.emit(this.x+this.w/2,this.y+this.h/2,12,{col:'#ff6b8a', vx:[-120,120], vy:[-180,80], grav:520});
      sfxHurt(); showCenter("♥ -1");
      if(this.hp<=0){ gameState='dead'; overlayDead.classList.add('show'); particles.emit(this.x+this.w/2,this.y+this.h/2,24,{col:SKINS[this.skin].trail, vx:[-180,180], vy:[-260,20], grav:640}); }
      else if(isFall){ this.x=this.checkX; this.y=this.checkY; this.vx=0; this.vy=0; }
      if(this.onGround && this.x>this.checkX+120){ this.checkX=this.x; this.checkY=this.y-2; }
    }
    draw(ctx){
      ctx.save();
      if(this.invuln>0 && Math.floor(this.animT*18)%2===0) ctx.globalAlpha=0.55;
      const cx=this.x+this.w/2, cy=this.y+this.h/2;
      ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(cx, 642, 18+Math.abs(this.vx)*0.01, 6,0,0,Math.PI*2); ctx.fill();
      const sx=1+this.squash*0.7, sy=1-this.squash;
      ctx.translate(cx,cy); ctx.scale(sx,sy); ctx.translate(-cx,-cy);
      // wall slide dust indicator
      if(this.wallSlide && !this.onGround){
        ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
        const wx = this.wallDir>0? this.x+this.w+2 : this.x-2;
        ctx.beginPath(); ctx.moveTo(wx, this.y+4); ctx.lineTo(wx, this.y+this.h-4); ctx.stroke(); ctx.setLineDash([]);
      }
      if(this.dashing){ ctx.globalAlpha=0.18; ctx.fillStyle=SKINS[this.skin].trail; roundRect(ctx, this.x - this.facing*10, this.y+6, this.w, this.h-10, 10); ctx.fill(); ctx.globalAlpha=1; }
      const skin=SKINS[this.skin];
      const bodyGrad=ctx.createLinearGradient(this.x,this.y,this.x,this.y+this.h);
      bodyGrad.addColorStop(0,skin.body1); bodyGrad.addColorStop(0.5,skin.body2); bodyGrad.addColorStop(1,skin.body3);
      ctx.fillStyle=bodyGrad; roundRect(ctx, this.x+1,this.y+4,this.w-2,this.h-8,12); ctx.fill();
      ctx.strokeStyle='rgba(14,21,51,.18)'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.85)'; roundRect(ctx, this.x+6,this.y+10,this.w-12,10,6); ctx.fill();
      // backpack
      ctx.fillStyle='#ffce6b'; roundRect(ctx, this.x + (this.facing>0? -4: this.w-6), this.y+12, 8,14,4); ctx.fill();
      ctx.fillStyle='#ff8a7a'; ctx.fillRect(this.x + (this.facing>0? -1: this.w-3), this.y+14, 2,10);
      const flutter=Math.sin(this.animT*12 + Math.abs(this.vx)*0.02)*4;
      ctx.fillStyle=skin.scarf; ctx.beginPath();
      const scarfX=this.x+this.w/2 - this.facing*6;
      ctx.moveTo(scarfX,this.y+16); ctx.bezierCurveTo(scarfX - this.facing*8 + flutter, this.y+18, scarfX - this.facing*12 - flutter, this.y+22, scarfX - this.facing*10, this.y+28);
      ctx.lineTo(scarfX - this.facing*6, this.y+30); ctx.bezierCurveTo(scarfX - this.facing*4, this.y+24, scarfX - this.facing*2, this.y+20, scarfX, this.y+16); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillRect(scarfX - this.facing*3, this.y+19, 6,2);
      const headY=this.y+2;
      ctx.globalAlpha=0.08; ctx.fillStyle='#0e1533'; ctx.beginPath(); ctx.ellipse(cx, headY+14,14,9,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      ctx.fillStyle='#0e1533'; roundRect(ctx, this.x+3,headY,this.w-6,16,8); ctx.fill();
      ctx.fillStyle='#ffffff'; roundRect(ctx, this.x+5,headY+3,this.w-10,10,5); ctx.fill();
      const eyeOffset=this.facing*2 + this.vx*0.006;
      ctx.fillStyle='#0e1533'; ctx.beginPath(); ctx.arc(this.x+9+eyeOffset, headY+8, 3.2 + (this.onGround?0:0.6),0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(this.x+this.w-9+eyeOffset, headY+8, 3.2 + (this.onGround?0:0.6),0,Math.PI*2); ctx.fill();
      ctx.fillStyle=skin.glow; ctx.beginPath(); ctx.arc(this.x+10+eyeOffset, headY+7,1.1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(this.x+this.w-8+eyeOffset, headY+7,1.1,0,Math.PI*2); ctx.fill();
      if(this.dashing){ ctx.fillStyle=skin.trail; ctx.globalAlpha=0.9; ctx.beginPath(); ctx.arc(this.x+6,headY+10,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(this.x+this.w-6,headY+10,2,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
      ctx.strokeStyle=skin.glow; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,headY); ctx.lineTo(cx+this.facing*2,headY-6); ctx.stroke();
      ctx.fillStyle=skin.glow; ctx.beginPath(); ctx.arc(cx+this.facing*2,headY-6,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cx+this.facing*2+0.8,headY-6.8,1,0,Math.PI*2); ctx.fill();
      const runPhase=this.onGround?this.animT*14:2.2; const legSwing=Math.sin(runPhase)*(Math.abs(this.vx)>40?5:1.2);
      ctx.fillStyle='#0e1533'; ctx.beginPath(); ctx.ellipse(this.x+9+legSwing*0.2, this.y+this.h-3,5,4,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(this.x+this.w-9-legSwing*0.2, this.y+this.h-3,5,4,0,0,Math.PI*2); ctx.fill();
      if(this.dashing){ ctx.strokeStyle=skin.trail; ctx.lineWidth=2; roundRect(ctx, this.x-4,this.y-2,this.w+8,this.h+4,14); ctx.stroke(); }
      ctx.restore();
    }
  }
  function rectOverlap(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }

  function drawEnemies(ctx,enemies,t){
    for(const e of enemies){
      if(!e.alive && e.squish<=0) continue;
      ctx.save();
      if(e.squish>0){
        e.squish-=0.07; const s=1-e.squish*0.7; ctx.translate(e.x+e.w/2,e.y+e.h/2); ctx.scale(1+e.squish*0.6,s); ctx.translate(-(e.x+e.w/2),-(e.y+e.h/2)); ctx.globalAlpha=1-e.squish*0.8;
      }
      if(e.type==='puff'){
        ctx.fillStyle='rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(e.x+e.w/2,642,12,4,0,0,Math.PI*2); ctx.fill();
        const bob=Math.sin(t*3+e.x*0.01)*2; const y=e.y+bob;
        ctx.fillStyle='#ff6b8a'; roundRect(ctx,e.x,y,e.w,e.h,8); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.92)'; roundRect(ctx,e.x+4,y+3,e.w-8,6,4); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(e.x+8,y+14,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(e.x+e.w-8,y+15,1.6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#5a0a1a'; ctx.beginPath(); ctx.arc(e.x+8,y+8,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(e.x+e.w-8,y+8,2,0,Math.PI*2); ctx.fill();
      } else if(e.type==='crab'){
        ctx.fillStyle='rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(e.x+e.w/2,642,12,4,0,0,Math.PI*2); ctx.fill();
        const bob=Math.sin(t*4+e.x*0.02)*1.5; const y=e.y+bob;
        ctx.fillStyle='#ff9b6b'; roundRect(ctx,e.x,y,e.w,e.h,6); ctx.fill();
        ctx.fillStyle='#ffd1a8'; roundRect(ctx,e.x+4,y+3,e.w-8,5,3); ctx.fill();
        // claws
        ctx.fillStyle='#c4542f'; ctx.beginPath(); ctx.arc(e.x+2,y+8,4,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(e.x+e.w-2,y+8,4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#5a1a0a'; ctx.beginPath(); ctx.arc(e.x+10,y+9,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(e.x+e.w-10,y+9,2,0,Math.PI*2); ctx.fill();
      } else if(e.type==='drone'){
        const hover=Math.sin(t*2.4+e.t)*6; const y=e.y+hover, x=e.x;
        ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(x+e.w/2,642,14,5,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#3a3f6d'; roundRect(ctx,x,y,e.w,e.h,7); ctx.fill(); ctx.fillStyle='#1f2548'; roundRect(ctx,x+3,y+3,e.w-6,e.h-6,5); ctx.fill();
        const grad=ctx.createRadialGradient(x+e.w/2,y+e.h/2,2,x+e.w/2,y+e.h/2,14); grad.addColorStop(0,'#7af0ff'); grad.addColorStop(0.5,'#6b7cff'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x+e.w/2,y+e.h/2,14,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#eaffff'; ctx.beginPath(); ctx.arc(x+e.w/2,y+e.h/2,5,0,Math.PI*2); ctx.fill();
      } else if(e.type==='lantern'){
        const hover=Math.sin(t*1.8+e.t)*8; const y=e.y+hover, x=e.x;
        ctx.fillStyle='rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(x+e.w/2,642,14,5,0,0,Math.PI*2); ctx.fill();
        // lantern body
        ctx.fillStyle='#2a1a4a'; roundRect(ctx,x,y,e.w,e.h,10); ctx.fill();
        ctx.fillStyle='rgba(139,122,255,.5)'; roundRect(ctx,x+3,y+3,e.w-6,e.h-6,8); ctx.fill();
        const grad=ctx.createRadialGradient(x+e.w/2,y+e.h/2,2,x+e.w/2,y+e.h/2,20); grad.addColorStop(0,'#ffce6b'); grad.addColorStop(0.4,'#8b7aff'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x+e.w/2,y+e.h/2,20,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff6d6'; ctx.beginPath(); ctx.arc(x+e.w/2,y+e.h/2,6,0,Math.PI*2); ctx.fill();
        // string
        ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+e.w/2,y-10); ctx.lineTo(x+e.w/2,y); ctx.stroke();
        // glow ring
        ctx.strokeStyle='rgba(255,206,107,.4)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x+e.w/2,y+e.h/2,12+Math.sin(t*3)*2,0,Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawBackground(ctx,cam,level){
    if(level.bg==='cave'){
      const g=ctx.createLinearGradient(0,cam.y,0,cam.y+VIEW.h);
      g.addColorStop(0,'#0f1024'); g.addColorStop(0.4,'#1a1440'); g.addColorStop(0.7,'#241a4a'); g.addColorStop(1,'#1e1236');
      ctx.fillStyle=g; ctx.fillRect(cam.x,cam.y,VIEW.w,VIEW.h);
      // cave stalactites
      ctx.fillStyle='rgba(30,20,60,.9)';
      for(let x=Math.floor(cam.x/80)*80; x<cam.x+VIEW.w+80; x+=80){
        const h= 30+Math.sin(x*0.02)*12;
        ctx.beginPath(); ctx.moveTo(x,cam.y); ctx.lineTo(x+18,cam.y); ctx.lineTo(x+9,cam.y+h); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x,cam.y+VIEW.h); ctx.lineTo(x+18,cam.y+VIEW.h); ctx.lineTo(x+9,cam.y+VIEW.h - h*0.7); ctx.closePath(); ctx.fill();
      }
      // glowing crystals in background
      for(let i=0;i<8;i++){
        const x= (i*520 + cam.x*0.2)%(level.LEVEL.w+400) + cam.x - 200;
        const y= cam.y+ 120 + Math.sin(i*1.7)*40;
        if(x<cam.x-60||x>cam.x+VIEW.w+60) continue;
        const grad=ctx.createRadialGradient(x,y,2,x,y,40); grad.addColorStop(0,'rgba(122,240,255,.45)'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x,y,40,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(122,240,255,.9)'; ctx.beginPath(); ctx.moveTo(x,y-8); ctx.lineTo(x+6,y); ctx.lineTo(x,y+8); ctx.lineTo(x-6,y); ctx.closePath(); ctx.fill();
      }
      // fog
      ctx.fillStyle='rgba(139,122,255,.06)'; ctx.fillRect(cam.x,cam.y+VIEW.h*0.6,VIEW.w, VIEW.h*0.4);
    } else {
      // garden (original)
      const g=ctx.createLinearGradient(0,cam.y,0,cam.y+VIEW.h);
      g.addColorStop(0,'#8ed6ff'); g.addColorStop(0.38,'#bde7ff'); g.addColorStop(0.68,'#dff2ff'); g.addColorStop(1,'#eaf6ff');
      ctx.fillStyle=g; ctx.fillRect(cam.x,cam.y,VIEW.w,VIEW.h);
      ctx.save(); const mx=cam.x*0.15, my=cam.y*0.10; ctx.translate(-mx,-my);
      ctx.fillStyle='#a9c6e8'; ctx.beginPath(); ctx.moveTo(cam.x+mx-200,cam.y+my+420);
      for(let x=cam.x+mx-200; x<cam.x+mx+VIEW.w+400; x+=120){ const h=120+Math.sin(x*0.008)*30+Math.cos(x*0.003)*40; ctx.lineTo(x,cam.y+my+420 - h); }
      ctx.lineTo(cam.x+mx+VIEW.w+400,cam.y+my+420); ctx.closePath(); ctx.fill();
      ctx.translate((mx*-0.15),0); ctx.fillStyle='#8fb8e0'; ctx.beginPath(); ctx.moveTo(cam.x-200,cam.y+480);
      for(let x=cam.x-200; x<cam.x+VIEW.w+400; x+=90){ const h=80+Math.sin(x*0.015+1)*18; ctx.lineTo(x,cam.y+500 - h); }
      ctx.lineTo(cam.x+VIEW.w+400,cam.y+520); ctx.closePath(); ctx.fill(); ctx.restore();
      const t=performance.now()*0.00012; ctx.fillStyle='rgba(255,255,255,.92)';
      for(let i=0;i<6;i++){ const baseX=(i*560 + t*60)%(level.LEVEL.w+600)-300; const x=baseX - cam.x*0.4; const y=cam.y+90+Math.sin(i*1.3 + t*2)*12 + i*28; if(x<cam.x-200||x>cam.x+VIEW.w+200) continue; cloud(ctx,x,y,1+(i%3)*0.2); }
      ctx.fillStyle='rgba(255,244,180,.95)'; ctx.shadowColor='rgba(255,224,120,.8)'; ctx.shadowBlur=28; ctx.beginPath(); ctx.arc(cam.x+VIEW.w-140,cam.y+110,42,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle='rgba(45,70,110,.08)'; for(let i=0;i<4;i++){ const x=800+i*900 - cam.x*0.5; const y=cam.y+180+Math.sin(i*2)*20; if(x<cam.x-300||x>cam.x+VIEW.w+300) continue; ctx.beginPath(); ctx.ellipse(x,y,90,18,0,0,Math.PI*2); ctx.fill(); }
    }
  }
  function cloud(ctx,x,y,s){ ctx.beginPath(); ctx.ellipse(x,y,46*s,18*s,0,0,Math.PI*2); ctx.ellipse(x+22*s,y+6*s,30*s,16*s,0,0,Math.PI*2); ctx.ellipse(x-22*s,y+7*s,28*s,14*s,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.65)'; ctx.beginPath(); ctx.ellipse(x-10*s,y-6*s,18*s,8*s,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.92)'; }

  function drawPlatforms(ctx,level){
    // regular pls
    for(const p of level.pls){
      if(p.y+p.h < camera.y-40 || p.y > camera.y+VIEW.h+40 || p.x+p.w < camera.x-60 || p.x > camera.x+VIEW.w+60) continue;
      if(p.type==='ground'){ const g=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h); g.addColorStop(0,'#6ec07a'); g.addColorStop(0.18,'#4a9a5a'); g.addColorStop(0.18,'#3d7a46'); g.addColorStop(1,'#2f5c36'); ctx.fillStyle=g; ctx.fillRect(p.x,p.y,p.w,p.h); ctx.fillStyle='#86d893'; for(let x=p.x+8;x<p.x+p.w;x+=14){ const h=6+Math.sin(x*0.2)*2; ctx.beginPath(); ctx.moveTo(x,p.y); ctx.lineTo(x+4,p.y-h); ctx.lineTo(x+8,p.y); ctx.fill(); } ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(p.x,p.y,p.w,3); }
      else if(p.type==='ground2'){ const g=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h); g.addColorStop(0,'#4a2b7a'); g.addColorStop(0.2,'#2a1a4a'); g.addColorStop(1,'#1a1033'); ctx.fillStyle=g; ctx.fillRect(p.x,p.y,p.w,p.h); ctx.fillStyle='rgba(122,240,255,.25)'; ctx.fillRect(p.x,p.y,p.w,3); // crystals on top
        for(let x=p.x+12;x<p.x+p.w;x+=36){ ctx.fillStyle='rgba(122,240,255,.6)'; ctx.beginPath(); ctx.moveTo(x,p.y); ctx.lineTo(x+4,p.y-8); ctx.lineTo(x+8,p.y); ctx.fill(); } }
      else if(p.type==='grass'){ ctx.fillStyle='#2b3a6b'; ctx.globalAlpha=0.10; ctx.fillRect(p.x,p.y+3,p.w,p.h+4); ctx.globalAlpha=1; ctx.fillStyle='#f7fbff'; roundRect(ctx,p.x,p.y,p.w,p.h,8); ctx.fill(); ctx.strokeStyle='rgba(43,58,107,.14)'; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle='#7bd67a'; roundRect(ctx,p.x-2,p.y-6,p.w+4,10,6); ctx.fill(); ctx.fillStyle='#5ec05e'; ctx.fillRect(p.x,p.y+2,p.w,3); }
      else if(p.type==='crystal'){ // glowing crystal platform
        ctx.fillStyle='rgba(40,30,80,.9)'; roundRect(ctx,p.x-1,p.y-1,p.w+2,p.h+2,6); ctx.fill();
        const g=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h); g.addColorStop(0,'#2a1a4a'); g.addColorStop(1,'#4a2b7a'); ctx.fillStyle=g; roundRect(ctx,p.x,p.y,p.w,p.h,6); ctx.fill();
        ctx.strokeStyle='rgba(122,240,255,.55)'; ctx.lineWidth=1.5; ctx.stroke();
        // top crystal glow
        const grad=ctx.createLinearGradient(p.x,p.y-4,p.x,p.y+6); grad.addColorStop(0,'rgba(122,240,255,.9)'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.fillRect(p.x,p.y-4,p.w,6);
        // shard
        ctx.fillStyle='rgba(122,240,255,.9)'; ctx.beginPath(); ctx.moveTo(p.x+p.w/2-4,p.y-10); ctx.lineTo(p.x+p.w/2,p.y-18); ctx.lineTo(p.x+p.w/2+4,p.y-10); ctx.closePath(); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(p.x+8,p.y+3,1.5,0,Math.PI*2); ctx.fill();
      }
      else if(p.type==='stone'){ ctx.fillStyle='#d9e2f2'; roundRect(ctx,p.x,p.y,p.w,p.h,5); ctx.fill(); ctx.fillStyle='#b8c7e6'; ctx.fillRect(p.x,p.y+p.h-4,p.w,4); ctx.strokeStyle='rgba(43,58,107,.12)'; ctx.lineWidth=1.5; ctx.stroke(); }
      else if(p.type==='cloud'){ ctx.fillStyle='rgba(255,255,255,.96)'; roundRect(ctx,p.x,p.y,p.w,p.h,9); ctx.fill(); ctx.fillStyle='rgba(123,240,255,.18)'; roundRect(ctx,p.x,p.y+p.h-4,p.w,4,4); ctx.fill(); ctx.strokeStyle='rgba(123,240,255,.35)'; ctx.lineWidth=1.5; ctx.stroke(); }
    }
    // walls
    for(const w of level.walls){
      if(w.y+w.h < camera.y-40 || w.y > camera.y+VIEW.h+40 || w.x+w.w < camera.x-60 || w.x > camera.x+VIEW.w+60) continue;
      // wall with grip texture
      if(level.bg==='cave'){ ctx.fillStyle='#2a1a4a'; roundRect(ctx,w.x,w.y,w.w,w.h,4); ctx.fill(); ctx.strokeStyle='rgba(122,240,255,.3)'; ctx.lineWidth=1.5; ctx.stroke();
        // grip lines
        ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=2; for(let y=w.y+12; y<w.y+w.h; y+=22){ ctx.beginPath(); ctx.moveTo(w.x+3,y); ctx.lineTo(w.x+w.w-3,y); ctx.stroke(); }
        // vertical highlight
        ctx.fillStyle='rgba(122,240,255,.15)'; ctx.fillRect(w.x, w.y, 3, w.h);
      } else { ctx.fillStyle='#8fb8e0'; ctx.fillRect(w.x,w.y,w.w,w.h); ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(w.x,w.y,3,w.h); }
      // wall jump indicator
      ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(w.x-2,w.y,w.w+4,4);
    }
    // fragiles
    for(const f of level.fragiles){
      if(f.falling) continue;
      if(f.y+f.h < camera.y-40 || f.y > camera.y+VIEW.h+40 || f.x+f.w < camera.x-60 || f.x > camera.x+VIEW.w+60) continue;
      const shake = f.timer>0 ? Math.sin(performance.now()*0.02)* f.timer*4 : 0;
      const alpha = f.timer>0 ? 1 - f.timer*0.5 : 1;
      ctx.globalAlpha=alpha;
      ctx.fillStyle = f.timer>0 ? '#ff8a7a' : '#ffd1a8';
      roundRect(ctx, f.x+shake, f.y, f.w, f.h, 6); ctx.fill();
      ctx.strokeStyle= f.timer>0 ? 'rgba(255,50,50,.6)' : 'rgba(122,240,255,.4)'; ctx.lineWidth=2; ctx.stroke();
      if(f.timer>0){ ctx.fillStyle='rgba(255,255,255,.8)'; ctx.font='700 9px JetBrains Mono'; ctx.textAlign='center'; ctx.fillText('CRACK!', f.x+f.w/2, f.y-6); }
      // crystal on top
      ctx.fillStyle='rgba(122,240,255,.7)'; ctx.beginPath(); ctx.moveTo(f.x+f.w/2-3,f.y-8); ctx.lineTo(f.x+f.w/2,f.y-14); ctx.lineTo(f.x+f.w/2+3,f.y-8); ctx.closePath(); ctx.fill();
      ctx.globalAlpha=1;
    }
    // moving
    for(const m of level.moving){
      if(m.y+m.h < camera.y-40 || m.y > camera.y+VIEW.h+40 || m.x+m.w < camera.x-60 || m.x > camera.x+VIEW.w+60) continue;
      ctx.fillStyle='#0e1533'; roundRect(ctx,m.x-1,m.y-1,m.w+2,m.h+2,7); ctx.fill();
      const g2=ctx.createLinearGradient(m.x,m.y,m.x,m.y+m.h); g2.addColorStop(0, level.bg==='cave' ? '#ffce6b' : '#7af0ff'); g2.addColorStop(1, level.bg==='cave' ? '#ff8a7a' : '#6b7cff'); ctx.fillStyle=g2; roundRect(ctx,m.x,m.y,m.w,m.h,6); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.85)'; ctx.fillRect(m.x+8,m.y+4,m.w*0.3,2);
      ctx.fillStyle='rgba(14,21,51,.9)'; ctx.font='700 9px JetBrains Mono'; ctx.textAlign='center'; ctx.fillText(m.vertical?'↕':'↔', m.x+m.w/2, m.y+11);
      ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(m.x+m.w/2,m.y+m.h+6,m.w*0.4,4,0,0,Math.PI*2); ctx.fill();
    }
  }
  function drawCoins(ctx,coins,t){
    for(const c of coins){ if(c.collected) continue; const bob=Math.sin(t*3 + c.bob)*4; const x=c.x, y=c.y+bob; const grad=ctx.createRadialGradient(x+9,y+9,2,x+9,y+9,22); grad.addColorStop(0,'rgba(255,206,107,.55)'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x+9,y+9,22,0,Math.PI*2); ctx.fill(); ctx.save(); ctx.translate(x+9,y+9); ctx.rotate(t*1.6); ctx.fillStyle='#ffce6b'; ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(9,0); ctx.lineTo(0,10); ctx.lineTo(-9,0); ctx.closePath(); ctx.fill(); ctx.strokeStyle='rgba(255,138,122,.9)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.fillStyle='rgba(255,255,255,.95)'; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(4,0); ctx.lineTo(0,6); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
  function drawCrystals(ctx,crystals,t){
    for(const c of crystals){ if(c.collected) continue; const bob=Math.sin(t*2.2 + c.bob)*5; const x=c.x, y=c.y+bob;
      const grad=ctx.createRadialGradient(x+8,y+8,2,x+8,y+8,30); grad.addColorStop(0,'rgba(122,240,255,.55)'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x+8,y+8,30,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#7af0ff'; ctx.beginPath(); ctx.moveTo(x+8,y); ctx.lineTo(x+14,y+6); ctx.lineTo(x+8,y+16); ctx.lineTo(x+2,y+6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(x+6,y+5,1.2,0,Math.PI*2); ctx.fill();
      // rotate shine
      ctx.fillStyle='rgba(255,255,255,.8)'; ctx.font='700 8px Space Grotesk'; ctx.textAlign='center'; ctx.fillText('◆', x+8, y-8);
    }
  }
  function drawSpikes(ctx,spikes){
    for(const s of spikes){ ctx.fillStyle='#2b1a1a'; ctx.fillRect(s.x,s.y+8,s.w,8); ctx.fillStyle='#ff6b6b'; for(let x=s.x+6;x<s.x+s.w;x+=14){ ctx.beginPath(); ctx.moveTo(x-7,s.y+8); ctx.lineTo(x,s.y); ctx.lineTo(x+7,s.y+8); ctx.closePath(); ctx.fill(); } }
  }
  function drawGoal(ctx,goal,t){
    if(!goal) return; const {x,y,w,h}=goal;
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(x+w/2,y+h+8,34,8,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e6e9ff'; roundRect(ctx,x-6,y-8,12,h+16,6); ctx.fill(); roundRect(ctx,x+w-6,y-8,12,h+16,6); ctx.fill();
    ctx.fillStyle='#c5ccff'; ctx.fillRect(x-2,y+8,4,h-16); ctx.fillRect(x+w-2,y+8,4,h-16);
    ctx.fillStyle='#e6e9ff'; roundRect(ctx,x-6,y-14,w+12,18,9); ctx.fill();
    const pulse=0.6+Math.sin(t*3)*0.15;
    const g=ctx.createLinearGradient(x,y,x+w,y+h); if(goal.id===2 || (typeof currentLevelId!=='undefined' && currentLevelId===2)){ g.addColorStop(0,'rgba(180,120,255,.95)'); g.addColorStop(0.5,'rgba(122,240,255,.95)'); g.addColorStop(1,'rgba(139,122,255,.85)'); } else { g.addColorStop(0,'rgba(122,240,255,.95)'); g.addColorStop(0.5,'rgba(139,122,255,.95)'); g.addColorStop(1,'rgba(255,206,107,.85)'); }
    ctx.globalAlpha=pulse; ctx.fillStyle=g; roundRect(ctx,x+6,y+4,w-12,h-8,12); ctx.fill(); ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=2; ctx.beginPath(); const cx=x+w/2, cy=y+h/2; for(let a=0;a<Math.PI*2;a+=0.9){ const r=12+Math.sin(t*2 + a*2)*4; ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a+t)*r, cy+Math.sin(a+t)*r); } ctx.stroke();
    ctx.fillStyle='white'; ctx.font='800 14px Space Grotesk'; ctx.textAlign='center'; ctx.fillText('◆',cx,cy+5);
    ctx.fillStyle='#0e1533'; ctx.font='800 10px Space Grotesk'; ctx.fillText('PORTAL',cx,y-20);
  }

  // ---------- Game State ----------
  let gameState='map'; // map, playing, paused, win, dead
  let currentLevelId=1;
  let levelData=null;
  let player=null;
  let camera=new Camera();
  let particles=new Particles();
  let startTime=0, elapsed=0;
  let lastT=0;

  function refreshMapUI(){
    const b1=saveData[1]; document.getElementById('best1').textContent = b1 && b1.completed ? `${formatTime(b1.bestTime)} • ${b1.bestCoins}/12 • ${b1.grade}` : 'Not played';
    const card2=document.getElementById('card2'); const best2=saveData[2];
    const unlocked = saveData[1] && saveData[1].completed;
    if(unlocked){ card2.classList.remove('locked'); card2.querySelector('.lvl-play').textContent='▶ PLAY'; document.getElementById('best2').textContent = best2 && best2.completed ? `${formatTime(best2.bestTime)} • ${best2.bestCoins}/12 • ${best2.grade}` : 'Ready to play'; }
    else { card2.classList.add('locked'); card2.querySelector('.lvl-play').textContent='🔒'; document.getElementById('best2').textContent='Locked — beat Level 1'; }
  }

  function showMap(){
    gameState='map';
    overlayStart.classList.add('show');
    overlayPause.classList.remove('show');
    overlayWin.classList.remove('show');
    overlayDead.classList.remove('show');
    overlaySkin.classList.remove('show');
    HUD.levelLabel.textContent='WORLD MAP — SELECT A LEVEL';
    refreshMapUI();
  }

  function startGame(id){
    currentLevelId=id;
    levelData = LEVELS[id]();
    levelData.goal.id=id;
    player = new Player(currentSkin);
    particles = new Particles();
    camera = new Camera(); camera.x=0; camera.y=0;
    elapsed=0; startTime=nowSec();
    gameState='playing';
    overlayStart.classList.remove('show');
    overlayPause.classList.remove('show');
    overlayWin.classList.remove('show');
    overlayDead.classList.remove('show');
    overlaySkin.classList.remove('show');
    HUD.levelLabel.textContent = id===1 ? 'LEVEL 01 — VERDANT ASCENT' : 'LEVEL 02 — CRYSTAL SPIRES';
    ensureAudio();
  }

  function resetLevel(){ startGame(currentLevelId); }
  function togglePause(){ if(gameState==='map'||gameState==='win'||gameState==='dead') return; if(gameState==='paused'){ gameState='playing'; overlayPause.classList.remove('show'); lastT=performance.now(); } else { gameState='paused'; overlayPause.classList.add('show'); } }
  function showCenter(msg){ HUD.centerMsg.textContent=msg; HUD.centerMsg.style.opacity='1'; HUD.centerMsg.style.transform='translateX(-50%) translateY(0)'; setTimeout(()=>{HUD.centerMsg.style.opacity='0'; HUD.centerMsg.style.transform='translateX(-50%) translateY(-6px)';}, 650); }
  function winLevel(){
    gameState='win';
    overlayWin.classList.add('show');
    document.getElementById('winTime').textContent=formatTime(elapsed);
    document.getElementById('winCoins').textContent=`${player.coins}/${levelData.coins.length}`;
    const pct=player.coins/levelData.coins.length; let grade='C'; if(pct===1 && elapsed<58) grade='S+'; else if(pct===1) grade='S'; else if(pct>0.75) grade='A'; else if(pct>0.5) grade='B';
    document.getElementById('winGrade').textContent=grade;
    document.getElementById('winLevelName').textContent = levelData.name + ' COMPLETE!';
    document.getElementById('winTitle').textContent = currentLevelId===1 ? '✦ PORTAL REACHED ✦' : '✦ CRYSTALS AWAKENED ✦';
    let msg= pct===1 ? 'Perfect! All shards collected — the aether sings.' : 'Portal reached! Replay to collect all shards.';
    if(currentLevelId===1 && !(saveData[1]&&saveData[1].completed)) msg += ' Crystal Spires unlocked!';
    document.getElementById('winMsg').textContent=msg;
    const btnNext=document.getElementById('btnNext');
    if(currentLevelId===1){ btnNext.style.display='block'; btnNext.textContent='→ Play Level 02: Crystal Spires'; }
    else { btnNext.textContent='🗺 Back to Map'; btnNext.style.display='block'; }
    sfxWin(); particles.emit(player.x+14,player.y+10,30,{col:SKINS[currentSkin].trail, vx:[-140,140], vy:[-220,-20], grav:360});
    // save
    const prev=saveData[currentLevelId]||{};
    const bestCoins=Math.max(prev.bestCoins||0, player.coins);
    const bestTime= prev.bestTime ? Math.min(prev.bestTime, elapsed) : elapsed;
    const bestGradeOrder={C:0,B:1,A:2,S:3,'S+':4}; const prevGrade=prev.grade||'C';
    const betterGrade = bestGradeOrder[grade] > bestGradeOrder[prevGrade] ? grade : prevGrade;
    saveData[currentLevelId]={completed:true, bestTime: Math.min(prev.bestTime||Infinity, elapsed), bestCoins, grade: betterGrade};
    localStorage.setItem('ad_save', JSON.stringify(saveData));
    refreshMapUI();
  }

  // ---------- Loop ----------
  function loop(t){
    requestAnimationFrame(loop);
    const dt=Math.min(0.033,(t - lastT)/1000); lastT=t;
    if(gameState==='map'){
      camera.x=lerp(camera.x, 120, 0.01); camera.y=lerp(camera.y, -20, 0.01);
      drawFrame(dt,t/1000,true);
      return;
    }
    if(gameState==='paused'){ drawFrame(0,t/1000,false); return; }
    if(gameState==='playing'){ elapsed=nowSec()-startTime; update(dt); }
    if(gameState==='dead'||gameState==='win'){ particles.update(dt); if(player) camera.follow(player, levelData.LEVEL.w, levelData.LEVEL.h); }
    drawFrame(dt,t/1000,false);
    if(player && levelData){
      HUD.coins.textContent=player.coins; HUD.coinsTotal.textContent=`/${levelData.coins.length}`; HUD.time.textContent=formatTime(elapsed);
      HUD.hearts.innerHTML=''; for(let i=0;i<3;i++){ const el=document.createElement('i'); if(i>=player.hp) el.classList.add('off'); HUD.hearts.appendChild(el); }
      const dashPct=player.dashCd<=0?100:clamp((1 - player.dashCd/CONFIG.dashCooldown)*100,0,100);
      HUD.dashFill.style.width=dashPct+'%'; HUD.dashFill.style.opacity=player.dashCd<=0?'1':'0.55';
      const prog=clamp((player.x/(levelData.LEVEL.w-200))*100,0,100); HUD.progress.style.width=prog+'%'; HUD.progressLabel.textContent=Math.round(prog)+'%';
    }
  }

  function update(dt){
    for(const m of levelData.moving){
      const oldX=m.x, oldY=m.y;
      if(m.vertical){ m.y+=m.dir*m.speed*dt; if(m.y<m.ay){m.y=m.ay;m.dir*=-1;} if(m.y+m.h>m.by){m.y=m.by-m.h;m.dir*=-1;} m._dy=m.y-oldY; m._dx=0; }
      else{ m.x+=m.dir*m.speed*dt; if(m.x<m.ax){m.x=m.ax;m.dir=1;} if(m.x+m.w>m.bx){m.x=m.bx-m.w;m.dir=-1;} m._dx=m.x-oldX; m._dy=0; }
    }
    // fragile falling physics
    for(const f of levelData.fragiles){ if(f.falling){ f.vy+=900*dt; f.y+=f.vy*dt; } }
    // cleanup fallen fragiles that fall far below
    levelData.fragiles = levelData.fragiles.filter(f=> !f.falling || f.y < 800);
    for(const e of levelData.enemies){ if(!e.alive) continue;
      if(e.type==='puff'||e.type==='crab'){ e.x+=e.dir*e.speed*dt; if(e.x<e.left){e.x=e.left;e.dir=1;} if(e.x+e.w>e.right){e.x=e.right-e.w;e.dir=-1;} }
      else if(e.type==='drone'||e.type==='lantern'){ e.x+=e.dir*e.speed*dt; if(e.x<e.left){e.x=e.left;e.dir=1;} if(e.x+e.w>e.right){e.x=e.right-e.w;e.dir=-1;} }
    }
    player.update(dt, levelData, particles, camera);
    particles.update(dt);
    camera.follow(player, levelData.LEVEL.w, levelData.LEVEL.h);
  }

  function drawFrame(dt,t,menuMode){
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,VIEW.w,VIEW.h);
    ctx.save(); if(levelData) drawBackground(ctx,camera,levelData); else { // map preview background garden
      const fake={LEVEL:{w:4200,h:720},bg:'garden'}; drawBackground(ctx,camera,fake);
    } ctx.restore();
    ctx.save();
    if(levelData) camera.apply(ctx);
    else { // map mode: slight offset world
      ctx.translate(-camera.x, -camera.y);
    }
    // subtle grid
    const lvlW = levelData?levelData.LEVEL.w:4200;
    const lvlH = levelData?levelData.LEVEL.h:720;
    ctx.strokeStyle='rgba(43,58,107,.06)'; ctx.lineWidth=1;
    for(let x=Math.floor(camera.x/40)*40; x<camera.x+VIEW.w; x+=40){ ctx.beginPath(); ctx.moveTo(x,camera.y); ctx.lineTo(x,camera.y+VIEW.h); ctx.stroke(); }
    if(levelData){
      // foliage for garden, crystals for cave
      if(levelData.bg==='garden'){ ctx.fillStyle='rgba(110,192,122,.16)'; for(let x=0;x<lvlW;x+=180){ ctx.beginPath(); ctx.ellipse(x+40,640-8,46,18,0,0,Math.PI*2); ctx.fill(); } }
      drawPlatforms(ctx,levelData);
      drawSpikes(ctx,levelData.spikes);
      drawCoins(ctx,levelData.coins,t);
      drawCrystals(ctx,levelData.crystals,t);
      drawEnemies(ctx,levelData.enemies,t);
      drawGoal(ctx,levelData.goal,t);
      if(!menuMode) player.draw(ctx);
      else { const ghost=new Player(currentSkin); ghost.x=90; ghost.y=590-28; ghost.vx=0; ghost.animT=t; ghost.facing=1; ghost.onGround=true; ghost.draw(ctx); ctx.fillStyle='rgba(14,21,51,.75)'; ctx.font='700 11px Space Grotesk'; ctx.fillText('▶ Select a level to start', 44+90,590); }
      particles.draw(ctx);
      const vg=ctx.createRadialGradient(camera.x+VIEW.w/2,camera.y+VIEW.h/2,VIEW.w*0.35,camera.x+VIEW.w/2,camera.y+VIEW.h/2,VIEW.w*0.9); vg.addColorStop(0,'transparent'); vg.addColorStop(1,'rgba(10,16,32,.22)'); ctx.fillStyle=vg; ctx.fillRect(camera.x,camera.y,VIEW.w,VIEW.h);
    } else {
      // map mode world preview: just show floating islands
      ctx.fillStyle='rgba(255,255,255,.06)'; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(600+i*600, 500, 120, 14,0,0,Math.PI*2); ctx.fill(); }
      // ghost kiko
      const ghost=new Player(currentSkin); ghost.x=80; ghost.y=560; ghost.animT=t; ghost.facing=1; ghost.onGround=true; ghost.draw(ctx);
      particles.draw(ctx);
    }
    ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.015)'; for(let y=0;y<VIEW.h;y+=4) ctx.fillRect(0,y,VIEW.w,1);
    if(!menuMode && player && player.hurtCd>0){ ctx.fillStyle=`rgba(255,60,90,${0.14 * (player.hurtCd/0.9)})`; ctx.fillRect(0,0,VIEW.w,VIEW.h); }
    ctx.restore();
  }

  // Init
  if(matchMedia('(pointer: coarse)').matches) stage.classList.add('touch-visible');
  refreshMapUI();
  lastT=performance.now();
  requestAnimationFrame(loop);
  canvas.addEventListener('pointerdown', ()=>ensureAudio(), {once:true});
  stage.addEventListener('pointerdown', ()=>ensureAudio(), {once:true});
})();
