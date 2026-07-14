(() => {
"use strict";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
ctx.imageSmoothingEnabled=false;
const W=960,H=540,GROUND=438,LEVEL=12600;
const ui={
 hp:document.getElementById("hpFill"),sp:document.getElementById("spFill"),
 boss:document.getElementById("bossFill"),bossPanel:document.getElementById("bossPanel"),
 bossPhase:document.getElementById("bossPhase"),name:document.getElementById("playerName"),
 score:document.getElementById("score"),objective:document.getElementById("objective"),
 message:document.getElementById("message"),strip:document.getElementById("charStrip"),
 start:document.getElementById("startScreen"),pauseScreen:document.getElementById("pauseScreen"),
 clear:document.getElementById("clearScreen"),result:document.getElementById("result")
};
const keys={left:false,right:false,attack:false,jump:false,skill:false};
let running=false,paused=false,last=0,cam=0,shake=0,flash=0,score=0,checkpoint=80;
let audio=null,musicTimer=0;
const COLORS={sky:"#122c50",sand:"#a66f2f",sand2:"#6f421c",stone:"#4d3c31",dark:"#10131a"};
const CHARS=[
 {id:"isaji",name:"ISAJI",icon:"鬼",color:"#e7bb55",speed:250,jump:610,maxHp:150,atk:34,skill:"鬼神拳",desc:"壁破壊",trait:"break"},
 {id:"ryogo",name:"RYOGO",icon:"虫",color:"#3c87c8",speed:330,jump:640,maxHp:100,atk:22,skill:"虫の知らせ",desc:"隠し看破",trait:"sense"},
 {id:"toshiyuki",name:"TOSHIYUKI",icon:"時",color:"#584b92",speed:235,jump:590,maxHp:115,atk:25,skill:"THE WORLD",desc:"時間停止",trait:"time"},
 {id:"keita",name:"KEITA",icon:"鳳",color:"#ec8d2c",speed:285,jump:720,maxHp:105,atk:26,skill:"鳳翼天翔",desc:"空中突破",trait:"fire"},
 {id:"kazuaki",name:"KAZUAKI",icon:"斬",color:"#6b4439",speed:215,jump:560,maxHp:180,atk:43,skill:"WORLD IS MINE",desc:"装甲斬り",trait:"armor"}
];
let unlocked=[true,true,true,true,true];
const state={char:0,hp:150,sp:100,x:80,y:GROUND-64,vx:0,vy:0,w:38,h:64,face:1,onGround:false,attackT:0,skillT:0,hurtT:0,inv:0,combo:0,comboT:0,anim:0,airDash:false};
let enemies=[],shots=[],particles=[],platforms=[],hazards=[],gates=[],items=[],boss=null;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function beep(freq=220,dur=.07,type="square",vol=.04){
 if(!audio)return; const o=audio.createOscillator(),g=audio.createGain();
 o.type=type;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(audio.destination);
 o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.stop(audio.currentTime+dur);
}
function startAudio(){
 if(audio)return; audio=new (window.AudioContext||window.webkitAudioContext)();
 let step=0; musicTimer=setInterval(()=>{if(!running||paused)return;
  const seq=[110,147,165,196,165,147,123,147,110,147,185,220,185,165,147,123];
  beep(seq[step++%seq.length],.11,"square",.018);
 },145);
}
function msg(t,ms=1300){ui.message.textContent=t;ui.message.style.opacity=1;clearTimeout(msg.t);msg.t=setTimeout(()=>ui.message.style.opacity=0,ms)}
function particle(x,y,c,n=8,pow=1){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-180,180)*pow,vy:rand(-250,-40)*pow,life:rand(.25,.65),c,s:rand(2,6)})}
function spawnEnemy(x,type="grunt"){
 const defs={
  grunt:{hp:70,w:34,h:54,speed:75,atk:12,color:"#7f3434"},
  runner:{hp:45,w:30,h:48,speed:145,atk:10,color:"#a65926"},
  archer:{hp:55,w:32,h:52,speed:42,atk:9,color:"#47638e"},
  shield:{hp:120,w:38,h:58,speed:48,atk:14,color:"#525c67",armor:true},
  ghost:{hp:60,w:32,h:50,speed:90,atk:12,color:"#6c4b8c",ghost:true},
  elite:{hp:170,w:44,h:68,speed:85,atk:20,color:"#9c7724",armor:true}
 }[type];
 enemies.push({...defs,type,x,y:GROUND-defs.h,vx:0,vy:0,face:-1,hit:0,dead:false,cd:rand(0,1),phase:rand(0,6),stun:0});
}
function buildLevel(){
 enemies=[];shots=[];particles=[];platforms=[];hazards=[];gates=[];items=[];boss=null;
 // terrain platforms, no floating "blocks": rock ledges, bridges, ruins
 platforms.push({x:0,y:GROUND,w:LEVEL,h:120,type:"ground"});
 [
 [580,370,210,22],[930,330,170,22],[1360,385,240,20],[1840,340,190,20],
 [2290,300,220,20],[2780,360,190,20],[3260,310,210,20],[3780,350,180,20],
 [4310,295,220,20],[4870,355,170,20],[5390,320,230,20],[6010,370,210,20],
 [6680,315,180,20],[7310,350,260,20],[8010,300,210,20],[8650,360,190,20],
 [9250,320,220,20],[9910,360,200,20],[10540,300,240,20],[11220,355,200,20]
 ].forEach((p,i)=>platforms.push({x:p[0],y:p[1],w:p[2],h:p[3],type:i%3===0?"bridge":"ledge"}));
 // pits/spikes
 [[1120,150],[2050,160],[2510,150],[3490,180],[4550,170],[5710,170],[6400,190],[7700,190],[9000,180],[10200,190],[10950,170]]
 .forEach(([x,w],i)=>hazards.push({x,y:GROUND-12,w,h:30,type:i%2?"spike":"pit"}));
 // gates and puzzles
 gates=[
  {x:1720,y:GROUND-120,w:38,h:120,trait:"break",label:"鬼壁",open:false},
  {x:4070,y:GROUND-145,w:42,h:145,trait:"sense",label:"幻影門",open:false},
  {x:6250,y:GROUND-150,w:44,h:150,trait:"time",label:"時空門",open:false},
  {x:8400,y:GROUND-160,w:46,h:160,trait:"fire",label:"炎の結界",open:false},
  {x:10360,y:GROUND-170,w:48,h:170,trait:"armor",label:"黒鉄門",open:false}
 ];
 // enemy waves
 const zones=[
  [500,["grunt","grunt","runner"]],[1200,["runner","archer","grunt","shield"]],
  [1900,["grunt","runner","runner","archer"]],[2700,["shield","grunt","archer","runner","runner"]],
  [3500,["ghost","ghost","runner","archer"]],[4400,["grunt","shield","runner","archer","elite"]],
  [5200,["runner","runner","archer","ghost","shield"]],[6100,["shield","elite","archer","runner"]],
  [6900,["ghost","ghost","runner","runner","archer"]],[7800,["elite","shield","archer","archer","runner"]],
  [8700,["runner","ghost","shield","elite"]],[9600,["elite","elite","archer","runner","ghost"]],
  [10600,["shield","elite","runner","archer","ghost","grunt"]]
 ];
 zones.forEach(([base,arr])=>arr.forEach((t,i)=>spawnEnemy(base+i*95,t)));
 items=[1500,3900,5900,8150,10000].map((x,i)=>({x,y:GROUND-70,w:26,h:26,type:i%2?"sp":"hp",taken:false}));
}
function reset(full=true){
 if(full){score=0;checkpoint=80;unlocked=[true,true,true,true,true]}
 Object.assign(state,{char:0,hp:CHARS[0].maxHp,sp:100,x:checkpoint,y:GROUND-64,vx:0,vy:0,face:1,onGround:false,attackT:0,skillT:0,hurtT:0,inv:1,combo:0,comboT:0});
 cam=Math.max(0,state.x-180);buildLevel();updateUI();renderCharButtons();
}
function switchChar(i){
 if(!unlocked[i]||i===state.char||state.hurtT>0)return;
 const ratio=state.hp/CHARS[state.char].maxHp;
 state.char=i;state.hp=Math.max(1,CHARS[i].maxHp*ratio);state.sp=Math.min(100,state.sp+8);
 particle(state.x+20,state.y+30,CHARS[i].color,18,1.2);beep(520,.12,"sawtooth",.05);msg(CHARS[i].name+"\n"+CHARS[i].skill,900);
 updateUI();renderCharButtons();
}
function renderCharButtons(){
 ui.strip.innerHTML="";
 CHARS.forEach((c,i)=>{const b=document.createElement("button");b.className="charBtn"+(i===state.char?" active":"")+(unlocked[i]?"":" locked");
 b.innerHTML=`<span class="icon">${c.icon}</span>${c.name.slice(0,5)}`;b.onclick=()=>switchChar(i);ui.strip.appendChild(b)});
}
function updateUI(){
 const c=CHARS[state.char];
 ui.hp.style.width=(100*state.hp/c.maxHp)+"%";ui.sp.style.width=state.sp+"%";
 ui.name.textContent=c.name+" / "+c.desc;ui.score.textContent=String(score).padStart(6,"0");
 if(boss){ui.bossPanel.style.display="block";ui.boss.style.width=(100*boss.hp/boss.maxHp)+"%";ui.bossPhase.textContent="PHASE "+boss.phase}
 else ui.bossPanel.style.display="none";
}
function attack(){
 if(state.attackT>0||state.hurtT>0)return;
 state.attackT=.25;state.combo=state.comboT>0?Math.min(3,state.combo+1):1;state.comboT=.45;
 beep(130+state.combo*55,.06,"square",.05);
 const c=CHARS[state.char],range=state.char===4?88:state.char===1?68:74;
 const hitbox={x:state.face>0?state.x+state.w-4:state.x-range,y:state.y+10,w:range,h:48};
 let hitSomething=false;
 for(const e of enemies){if(e.dead||e.hit>0)continue;if(overlap(hitbox,e)){
   if(e.armor&&c.trait!=="armor"&&state.char!==0){e.hit=.12;particle(e.x+15,e.y+25,"#b7c0ca",5);beep(90,.08,"square",.04);continue}
   let dmg=c.atk*(1+.2*(state.combo-1));if(c.trait==="armor")dmg*=1.25;
   e.hp-=dmg;e.hit=.18;e.stun=.16;e.vx=state.face*(170+state.combo*55);particle(e.x+e.w/2,e.y+25,c.color,10,1.1);hitSomething=true;shake=5;
   if(e.hp<=0){e.dead=true;score+=120+(e.type==="elite"?300:0);state.sp=Math.min(100,state.sp+15);particle(e.x+e.w/2,e.y+20,"#fff",18,1.5)}
 }}
 if(boss&&boss.hp>0&&overlap(hitbox,boss)){
  const mult=c.trait==="armor"?1.35:1;boss.hp-=c.atk*mult*.75;boss.hit=.16;particle(boss.x+40,boss.y+40,c.color,10);shake=7;hitSomething=true;
 }
 if(hitSomething){state.sp=Math.min(100,state.sp+4);score+=20}
}
function skill(){
 if(state.sp<35||state.skillT>0||state.hurtT>0)return;
 const c=CHARS[state.char];state.sp-=35;state.skillT=.65;shake=10;flash=.12;beep(90,.25,"sawtooth",.08);msg(c.skill,650);
 if(c.trait==="time"){for(const e of enemies)e.stun=Math.max(e.stun,3.2);if(boss)boss.stun=1.4;particle(state.x+20,state.y+25,"#d2b8ff",35,1.8)}
 else if(c.trait==="fire"){state.vx=state.face*720;state.vy=-140;state.airDash=true;for(const e of enemies)if(Math.abs(e.x-state.x)<260){e.hp-=55;e.hit=.25;particle(e.x,e.y,"#ff782b",12)}}
 else{
  const radius=c.trait==="break"?190:c.trait==="armor"?170:145;
  for(const e of enemies)if(!e.dead&&Math.abs((e.x+e.w/2)-(state.x+state.w/2))<radius){e.hp-=c.atk*2.1;e.hit=.3;e.vx=Math.sign(e.x-state.x)*300;if(e.hp<=0){e.dead=true;score+=180}}
  if(boss&&Math.abs(boss.x-state.x)<radius+90)boss.hp-=c.atk*1.8;
  particle(state.x+20,state.y+28,c.color,34,2);
 }
}
function damage(n,from){
 if(state.inv>0||state.hurtT>0)return;
 state.hp-=n;state.hurtT=.45;state.inv=1.2;state.vx=Math.sign(state.x-from)*260;state.vy=-260;shake=9;flash=.08;beep(65,.16,"sawtooth",.07);particle(state.x+20,state.y+25,"#ff5a5a",14,1.4);
 if(state.hp<=0){state.hp=0;running=false;setTimeout(()=>{msg("CHECKPOINTから再開",900);running=true;state.x=checkpoint;state.y=GROUND-80;state.hp=CHARS[state.char].maxHp;state.sp=60;state.inv=2},800)}
}
function physics(dt){
 const c=CHARS[state.char];
 if(state.attackT<=0&&state.skillT<=0){
  const dir=(keys.left?-1:0)+(keys.right?1:0);
  state.vx += (dir*c.speed-state.vx)*Math.min(1,dt*12);
  if(dir)state.face=dir;
 } else state.vx*=.92;
 if(keys.jump&&state.onGround){state.vy=-c.jump;state.onGround=false;keys.jump=false;beep(240,.07,"square",.035)}
 state.vy+=1550*dt;state.x+=state.vx*dt;state.y+=state.vy*dt;state.x=clamp(state.x,0,LEVEL-80);
 state.onGround=false;
 for(const p of platforms){
  if(state.x+state.w>p.x&&state.x<p.x+p.w&&state.y+state.h>=p.y&&state.y+state.h-state.vy*dt<=p.y+8&&state.vy>=0){
   // pit zones suppress ground platform
   let pit=false;for(const h of hazards)if(h.type==="pit"&&state.x+state.w*.7>h.x&&state.x+state.w*.3<h.x+h.w)pit=true;
   if(p.type!=="ground"||!pit){state.y=p.y-state.h;state.vy=0;state.onGround=true;state.airDash=false}
  }
 }
 for(const h of hazards)if(h.type==="spike"&&overlap(state,{x:h.x,y:h.y,w:h.w,h:h.h}))damage(18,h.x);
 if(state.y>H+180){damage(40,state.x-100);state.x=checkpoint;state.y=GROUND-100;state.vy=0}
}
function gatesLogic(){
 const c=CHARS[state.char];
 for(const g of gates){
  if(g.open)continue;
  const near=Math.abs(state.x-g.x)<90;
  if(near){
   ui.objective.textContent=`${g.label}：${CHARS.find(q=>q.trait===g.trait)?.name||"専用能力"}が必要`;
   if(c.trait===g.trait){
    if(g.trait==="sense"){g.open=true;msg("幻影の正体を見破った！");beep(680,.18,"sine",.06)}
    else if(keys.skill||state.skillT>0){g.open=true;msg(g.label+"を突破！");particle(g.x,g.y+60,c.color,30,2);beep(440,.3,"square",.08)}
   }
  }
  if(!g.open&&state.x+state.w>g.x&&state.x<g.x+g.w){if(state.x<g.x)state.x=g.x-state.w;else state.x=g.x+g.w}
 }
 if(state.x>11280&&!boss){
  boss={x:11900,y:GROUND-110,w:76,h:110,hp:900,maxHp:900,phase:1,cd:1.2,hit:0,stun:0,vx:0};
  ui.objective.textContent="BOSS マッピーを倒せ";msg("BOSS\nMAPPY",1300);beep(55,.5,"sawtooth",.08)
 }
}
function enemyAI(dt){
 for(const e of enemies){
  if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);e.stun=Math.max(0,e.stun-dt);e.cd-=dt;
  if(e.stun>0){e.vx*=.88;e.x+=e.vx*dt;continue}
  const dx=state.x-e.x,ad=Math.abs(dx);e.face=Math.sign(dx)||-1;
  if(e.type==="archer"){
   e.vx=ad>260?e.face*e.speed:ad<150?-e.face*e.speed:0;
   if(ad<430&&e.cd<=0){shots.push({x:e.x+15,y:e.y+18,vx:e.face*330,vy:-30,w:12,h:6,enemy:true,c:"#d9c083",life:3});e.cd=1.6}
  }else if(e.ghost){
   e.y=GROUND-e.h-20-Math.sin(performance.now()/220+e.phase)*35;e.vx=e.face*(ad>60?e.speed:0);
   if(ad<65&&e.cd<=0){damage(e.atk,e.x);e.cd=1}
  }else{
   e.vx=e.face*(ad>46&&ad<520?e.speed:0);
   if(ad<54&&e.cd<=0){damage(e.atk,e.x);e.cd=e.type==="runner"?.65:1.05}
  }
  e.x+=e.vx*dt;
 }
 enemies=enemies.filter(e=>!e.dead||e.hit>0);
 for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=80*dt;s.life-=dt;if(s.enemy&&overlap(state,s)){damage(10,s.x);s.life=0}}
 shots=shots.filter(s=>s.life>0&&s.x>cam-100&&s.x<cam+W+200);
}
function bossAI(dt){
 if(!boss)return;boss.hit=Math.max(0,boss.hit-dt);boss.stun=Math.max(0,boss.stun-dt);boss.cd-=dt;
 if(boss.hp<=0){score+=5000;particle(boss.x+40,boss.y+40,"#d88cff",80,2.5);boss=null;running=false;ui.result.textContent=`SCORE ${String(score).padStart(6,"0")}`;ui.clear.classList.remove("hidden");localStorage.removeItem("pbz_checkpoint");return}
 boss.phase=boss.hp<300?3:boss.hp<600?2:1;ui.bossPhase.textContent="PHASE "+boss.phase;
 if(boss.stun>0)return;
 const dx=state.x-boss.x,ad=Math.abs(dx);
 boss.vx=Math.sign(dx)*(boss.phase===3?125:boss.phase===2?90:65);if(ad<110)boss.vx=0;boss.x+=boss.vx*dt;
 if(boss.cd<=0){
  if(boss.phase===1){for(let i=-1;i<=1;i++)shots.push({x:boss.x,y:boss.y+40,vx:-220-i*70,vy:i*70,w:18,h:18,enemy:true,c:"#a94cff",life:4});boss.cd=1.45}
  else if(boss.phase===2){for(let i=0;i<5;i++)shots.push({x:boss.x,y:boss.y+20,vx:-260-rand(0,180),vy:rand(-230,-80),w:14,h:14,enemy:true,c:"#d85cff",life:4});boss.cd=1.05}
  else{if(ad<130)damage(24,boss.x);else for(let i=0;i<8;i++)shots.push({x:boss.x,y:boss.y+35,vx:Math.cos(i*Math.PI/4)*260,vy:Math.sin(i*Math.PI/4)*260,w:16,h:16,enemy:true,c:"#ff49cf",life:3});boss.cd=.75}
 }
 if(overlap(state,boss))damage(18,boss.x);
 updateUI();
}
function checkpointLogic(){
 const marks=[2500,5000,7500,10000,11300];
 for(const m of marks)if(state.x>m&&checkpoint<m){checkpoint=m;localStorage.setItem("pbz_checkpoint",String(m));state.hp=Math.min(CHARS[state.char].maxHp,state.hp+45);state.sp=100;msg("CHECKPOINT");beep(760,.2,"sine",.05)}
}
function itemsLogic(){
 for(const it of items){if(!it.taken&&overlap(state,it)){it.taken=true;if(it.type==="hp")state.hp=Math.min(CHARS[state.char].maxHp,state.hp+45);else state.sp=100;score+=100;particle(it.x,it.y,it.type==="hp"?"#66ff86":"#58b5ff",15);beep(900,.1,"sine",.05)}}
}
function update(dt){
 if(!running||paused)return;
 state.attackT=Math.max(0,state.attackT-dt);state.skillT=Math.max(0,state.skillT-dt);state.hurtT=Math.max(0,state.hurtT-dt);state.inv=Math.max(0,state.inv-dt);state.comboT=Math.max(0,state.comboT-dt);if(state.comboT<=0)state.combo=0;
 if(keys.attack){attack();keys.attack=false}if(keys.skill){skill();keys.skill=false}
 physics(dt);gatesLogic();enemyAI(dt);bossAI(dt);checkpointLogic();itemsLogic();
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=700*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
 const target=clamp(state.x-250,0,LEVEL-W);cam+=(target-cam)*Math.min(1,dt*5);
 shake*=.86;flash=Math.max(0,flash-dt);state.anim+=dt*(Math.abs(state.vx)>20?10:3);updateUI();
}
function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function drawBackground(){
 const sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;ctx.save();ctx.translate(sx,sy);
 px(0,0,W,H,COLORS.sky);
 // sky gradient bands
 px(0,120,W,100,"#1e4870");px(0,210,W,150,"#b57a36");
 // sun
 px(760-(cam*.03)%1100,70,60,60,"#ffd66e");
 // distant pyramids
 for(let i=0;i<9;i++){const x=i*420-(cam*.12)%420;ctx.fillStyle=i%2?"#78512b":"#8b5f2d";ctx.beginPath();ctx.moveTo(x,330);ctx.lineTo(x+180,120+(i%3)*25);ctx.lineTo(x+360,330);ctx.fill()}
 // clouds
 for(let i=0;i<10;i++){let x=i*240-(cam*.06)%240;px(x,90+(i%3)*28,70,12,"#c7def0");px(x+18,78+(i%3)*28,34,16,"#d9e9f5")}
 // ruins
 for(let i=0;i<40;i++){const x=i*330-(cam*.35)%330;px(x,300,45,138,"#5c4737");px(x-8,294,61,12,"#74604e");for(let j=0;j<6;j++)px(x+8,315+j*18,28,5,"#342b26")}
 ctx.translate(-cam,0);
 // level ground detail
 px(0,GROUND,LEVEL,102,"#6f421c");px(0,GROUND,LEVEL,10,"#c58a45");
 for(let x=0;x<LEVEL;x+=48){px(x,GROUND+18+(x%96?8:0),34,8,"#4d2e19")}
 // platforms
 for(const p of platforms){if(p.type==="ground")continue;px(p.x,p.y,p.w,p.h,p.type==="bridge"?"#75604b":"#81613c");px(p.x,p.y,p.w,5,"#d2a45f");for(let x=p.x+10;x<p.x+p.w;x+=32)px(x,p.y+8,18,4,"#4c3728")}
 // hazards
 for(const h of hazards){if(h.type==="pit"){px(h.x,GROUND-2,h.w,104,"#05070b");for(let x=h.x;x<h.x+h.w;x+=24){ctx.fillStyle="#392315";ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+12,GROUND+18);ctx.lineTo(x+24,GROUND);ctx.fill()}}
 else for(let x=h.x;x<h.x+h.w;x+=18){ctx.fillStyle="#d7dbe3";ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+9,GROUND-20);ctx.lineTo(x+18,GROUND);ctx.fill()}}
 // gates
 for(const g of gates)if(!g.open){const col=g.trait==="fire"?"#ff6a24":g.trait==="time"?"#8d5cff":g.trait==="sense"?"#4aa9d8":g.trait==="armor"?"#59616d":"#8b2d2d";px(g.x,g.y,g.w,g.h,col);px(g.x+6,g.y+8,g.w-12,g.h-16,"#151a22");ctx.fillStyle=col;ctx.font="bold 22px monospace";ctx.fillText(g.label[0],g.x+8,g.y+42)}
 // items
 for(const it of items)if(!it.taken){px(it.x,it.y,26,26,it.type==="hp"?"#24bd55":"#227ad8");px(it.x+7,it.y+5,12,16,"#fff")}
 // enemies/projectiles/player/boss
 for(const e of enemies)drawEnemy(e);
 for(const s of shots){px(s.x,s.y,s.w,s.h,s.c);px(s.x+4,s.y+3,Math.max(2,s.w-8),Math.max(2,s.h-6),"#fff")}
 drawPlayer();
 if(boss)drawBoss();
 for(const p of particles)px(p.x,p.y,p.s,p.s,p.c);
 ctx.restore();
 if(flash>0){ctx.fillStyle=`rgba(255,255,255,${flash*4})`;ctx.fillRect(0,0,W,H)}
}
function drawPlayer(){
 const c=CHARS[state.char],x=Math.round(state.x),y=Math.round(state.y),walk=Math.floor(state.anim)%2,blink=state.inv>0&&Math.floor(state.inv*12)%2;
 if(blink)return;
 ctx.save();ctx.translate(x+state.w/2,y);ctx.scale(state.face,1);ctx.translate(-state.w/2,0);
 // shadow
 px(4,60,32,5,"#0007");
 // legs
 const kick=state.attackT>0&&state.combo===3?10:0;
 px(7,42+walk*2,11,20,c.color);px(22,42+(1-walk)*2-kick,11,20,c.color);px(5,59,14,5,"#111");px(21,59-kick,15,5,"#111");
 // torso
 px(6,17,28,30,c.color);px(10,21,20,24,state.char===0?"#c48b38":state.char===3?"#222":state.char===4?"#202020":c.color);
 // head/hair
 px(10,2,20,18,"#c48a61");px(8,0,24,7,state.char===0||state.char===3?"#e8bf42":"#151515");
 if(state.char===0){px(2,1,9,6,"#e8bf42");px(0,6,11,5,"#e8bf42");px(12,8,18,4,"#111")}
 if(state.char===4){px(12,7,17,5,"#111");px(25,4,7,3,"#111")}
 // arms / attack
 let arm=state.attackT>0?24:0;px(1,20,8+arm,9,"#c48a61");px(30-arm/3,23,8+arm/2,9,"#c48a61");
 if(state.char===2)px(35+arm/2,16,5,16,"#d9d9e4");
 if(state.char===4&&state.attackT>0)px(32,19,42,5,"#d7e7ff");
 if(state.skillT>0){ctx.globalAlpha=.5;ctx.strokeStyle=c.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(20,30,35+Math.sin(state.anim*3)*8,0,Math.PI*2);ctx.stroke()}
 ctx.restore();
}
function drawEnemy(e){
 if(e.hit>0&&Math.floor(e.hit*30)%2)return;
 px(e.x+4,e.y+e.h-5,e.w-8,5,"#0008");px(e.x+7,e.y+18,e.w-14,e.h-18,e.color);px(e.x+9,e.y+2,e.w-18,20,e.type==="ghost"?"#b9a0d8":"#9d684d");px(e.x+7,e.y,e.w-14,6,"#151515");
 px(e.x+3,e.y+24,8,20,e.color);px(e.x+e.w-11,e.y+24,8,20,e.color);
 if(e.armor){px(e.x+4,e.y+16,e.w-8,8,"#aeb8c3");px(e.x+6,e.y+26,e.w-12,6,"#737e89")}
 if(e.type==="archer")px(e.x-6,e.y+20,6,30,"#d7b477");
 if(e.type==="elite")px(e.x+10,e.y-9,e.w-20,10,"#d8b839");
}
function drawBoss(){
 if(boss.hit>0&&Math.floor(boss.hit*30)%2)return;
 const x=boss.x,y=boss.y;px(x+9,y+52,58,58,"#111");px(x+4,y+36,68,26,"#171717");
 ctx.fillStyle="#c79a52";ctx.beginPath();ctx.moveTo(x+38,y);ctx.lineTo(x+2,y+48);ctx.lineTo(x+74,y+48);ctx.fill();
 px(x+28,y+24,20,11,"#efe4b3");px(x+34,y+26,8,8,"#2ca4ff");px(x+37,y+29,3,3,"#050505");
 px(x-10,y+48,25,11,"#9b6b4e");px(x+63,y+48,25,11,"#9b6b4e");
 if(boss.phase>=2){ctx.strokeStyle="#bb45ff";ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+38,y+55,55+Math.sin(performance.now()/100)*5,0,Math.PI*2);ctx.stroke()}
}
function draw(){
 ctx.clearRect(0,0,W,H);drawBackground();
}
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)}
function bindButton(id,key){
 const el=document.getElementById(id);
 const on=e=>{e.preventDefault();keys[key]=true;el.classList.add("down")},off=e=>{e.preventDefault();keys[key]=false;el.classList.remove("down")};
 ["pointerdown","touchstart"].forEach(n=>el.addEventListener(n,on,{passive:false}));
 ["pointerup","pointercancel","pointerout","touchend"].forEach(n=>el.addEventListener(n,off,{passive:false}));
}
bindButton("left","left");bindButton("right","right");bindButton("attack","attack");bindButton("jump","jump");bindButton("skill","skill");
addEventListener("keydown",e=>{if(e.key==="ArrowLeft")keys.left=true;if(e.key==="ArrowRight")keys.right=true;if(e.key==="z")keys.attack=true;if(e.key==="x"||e.key==="ArrowUp")keys.jump=true;if(e.key==="c")keys.skill=true;if("12345".includes(e.key))switchChar(+e.key-1)});
addEventListener("keyup",e=>{if(e.key==="ArrowLeft")keys.left=false;if(e.key==="ArrowRight")keys.right=false});
document.getElementById("startBtn").onclick=()=>{startAudio();ui.start.classList.add("hidden");running=true;checkpoint=+(localStorage.getItem("pbz_checkpoint")||80);reset(false);msg("PYRAMID BREAK ZERO",1000)};
document.getElementById("pause").onclick=()=>{paused=true;ui.pauseScreen.classList.remove("hidden")};
document.getElementById("resumeBtn").onclick=()=>{paused=false;ui.pauseScreen.classList.add("hidden");last=performance.now()};
document.getElementById("againBtn").onclick=()=>{ui.clear.classList.add("hidden");running=true;reset(true)};
document.addEventListener("visibilitychange",()=>{if(document.hidden&&running){paused=true;ui.pauseScreen.classList.remove("hidden")}});
reset(true);requestAnimationFrame(loop);
})();