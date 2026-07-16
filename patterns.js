"use strict";
Game.addBullet=(x,y,vx,vy,r,c,k,extra={})=>Game.bullets.push({x,y,vx,vy,r,c,k,...extra});
Game.spawnPattern=function(id){
 const G=Game,A=G.arena,cx=270,cy=510,add=G.addBullet;Object.assign(G.bossFx,{handL:0,handR:0,dash:0,reach:0,eyeBeam:0,coreOpen:0});id%=40;
 const radial=(n,spd,c,k="ring")=>{for(let i=0;i<n;i++){const a=i*Math.PI*2/n;add(cx,cy,Math.cos(a)*spd,Math.sin(a)*spd,7,c,k)}};
 const rain=(n,c,spd=230,r=8)=>{for(let i=0;i<n;i++)add(G.rnd(A.x,A.x+A.w),A.y-30-G.rnd(0,150),G.rnd(-45,45),spd+G.rnd(0,90),r,c,"rain")};
 if(id===0||id===1){G.bossFx[id===0?"handL":"handR"]=1;G.bossFx.reach=1.4;for(let i=0;i<7;i++)add(id===0?A.x-45:A.x+A.w+45,A.y+35+i*52,id===0?260:-260,0,22,"#dce9f6","hand",{warn:.7})}
 else if(id===2){G.bossFx.handL=G.bossFx.handR=1;G.bossFx.reach=1.6;for(let i=0;i<6;i++){add(A.x-40,A.y+45+i*62,235,0,20,"#fff","hand",{warn:.9});add(A.x+A.w+40,A.y+45+i*62,-235,0,20,"#fff","hand",{warn:.9})}}
 else if(id===3){for(let i=0;i<5;i++)add(A.x+55+i*90,A.y-100,0,330,32,"#b8c5d3","slam",{warn:.75})}
 else if(id===4||id===5){G.bossFx.dash=1.5;add(id===4?A.x-130:A.x+A.w+130,cy,id===4?560:-560,0,62,"#e9f5ff","body",{warn:1})}
 else if(id===6){radial(20,225,"#ffd657")}
 else if(id===7){for(let i=0;i<24;i++){const a=i*.52;add(cx,cy,Math.cos(a)*130,Math.sin(a)*130,7,i%2?"#fff":"#ff7190","spiral",{spin:i%2?.95:-.95})}}
 else if(id===8){rain(17,"#eef7ff",210,7)}
 else if(id===9){for(let i=0;i<12;i++)add(i%2?A.x+A.w:A.x,A.y+24+(i%6)*70,i%2?-190:190,0,11,"#ff844f","homing")}
 else if(id===10){for(let i=0;i<8;i++)add(A.x+35+i*62,A.y-25,0,245,14,"#b6dcff","blade",{wave:i})}
 else if(id===11){G.bossFx.coreOpen=4;for(let i=0;i<14;i++)add(G.rnd(A.x,A.x+A.w),G.rnd(A.y,A.y+A.h),G.rnd(-65,65),G.rnd(-65,65),8,"#ff4f73","core")}
 else if(id===12){for(let i=0;i<14;i++){const a=i*Math.PI*2/14;add(cx+Math.cos(a)*230,cy+Math.sin(a)*185,-Math.cos(a)*195,-Math.sin(a)*195,9,"#c578ff","orbit")}}
 else if(id===13){for(let i=0;i<22;i++)add(G.rnd(A.x,A.x+A.w),G.rnd(A.y,A.y+A.h),0,0,7,i%3?"#fff":"#55d8ff","fake",{fake:i%4===0})}
 else if(id===14){for(let i=0;i<10;i++)add(i%2?A.x+A.w:A.x,A.y+35+i*42,i%2?-275:275,Math.sin(i)*110,8,"#ff5f82","sweep")}
 else if(id===15){for(let i=0;i<9;i++)add(G.rnd(A.x,A.x+A.w),G.rnd(A.y,A.y+A.h),0,0,12,"#ffe05e","mine",{timer:G.rnd(.6,1.3)})}
 else if(id===16){for(let i=0;i<18;i++){const a=i*Math.PI*2/18;add(cx+Math.cos(a)*270,cy+Math.sin(a)*220,-Math.cos(a)*250,-Math.sin(a)*250,i%4===0?13:7,i%4===0?"#ff3d5d":"#fff","judgement")}}
 else if(id===17||id===18){G.bossFx[id===17?"handL":"handR"]=1;G.bossFx.reach=1.5;for(let i=0;i<10;i++)add(id===17?A.x-40:A.x+A.w+40,A.y+30+i*39,id===17?220:-220,Math.sin(i)*100,16,"#d8e5f1","grab")}
 else if(id===19){for(let i=0;i<7;i++)add(A.x+35+i*68,A.y-30,Math.sin(i)*90,260,20,"#ffcc5a","meteor")}
 else if(id===20){for(let i=0;i<26;i++){const a=i*Math.PI*2/26;add(cx,cy,Math.cos(a)*(145+(i%3)*38),Math.sin(a)*(145+(i%3)*38),6,i%3?"#fff":"#69d8ff","burst")}}
 else if(id===21){G.bossFx.dash=1.7;for(let i=0;i<4;i++)add(A.x-100-i*80,A.y+80+i*82,450,0,42,"#eef7ff","body",{warn:.75+i*.12})}
 else if(id===22){G.bossFx.coreOpen=5;for(let i=0;i<20;i++)add(i%2?A.x+A.w:A.x,A.y+15+(i%10)*42,i%2?-245:245,0,7,i%3?"#fff":"#ff375d","final")}
 else if(id===23){for(let i=0;i<11;i++)add(A.x+20+i*45,A.y+A.h+30,Math.sin(i)*75,-255,13,"#7bdcff","geyser")}
 else if(id===24){for(let i=0;i<9;i++)add(G.rnd(A.x,A.x+A.w),A.y-20,G.rnd(-90,90),220,18,"#f2f6ff","drill",{spin:G.rnd(-2,2)})}
 else if(id===25){for(let i=0;i<16;i++)add(cx,cy,G.rnd(-280,280),G.rnd(-280,280),7,"#ff77c8","split",{life:1})}
 else if(id===26){for(let i=0;i<14;i++)add(i%2?A.x+A.w:A.x,A.y+15+(i%7)*62,i%2?-225:225,0,10,"#ffd84e","zig",{phase:i})}
 else if(id===27){G.bossFx.handL=G.bossFx.handR=1;G.bossFx.reach=1.7;for(let i=0;i<18;i++)add(G.rnd(A.x,A.x+A.w),G.rnd(A.y,A.y+A.h),G.rnd(-135,135),G.rnd(-135,135),9,"#d9e4ef","knuckle")}
 else if(id===28){G.bossFx.eyeBeam=1.4;for(let i=0;i<5;i++)add(cx,A.y+55+i*70,0,300,22,"#ff4264","eyeBeam",{warn:1.1+i*.1})}
 else if(id===29){G.bossFx.eyeBeam=1.6;for(let i=0;i<9;i++)add(A.x+35+i*52,cy,0,0,16,"#ff4264","crossBeam",{timer:.9+i*.07})}
 else if(id===30){for(let i=0;i<12;i++)add(G.rnd(A.x,A.x+A.w),A.y-30,G.rnd(-40,40),270,10,"#e8f0ff","spear")}
 else if(id===31){radial(16,190,"#a0f0ff","halo")}
 else if(id===32){G.bossFx.dash=1.5;for(let i=0;i<3;i++)add(i%2?A.x+A.w+80:A.x-80,A.y+120+i*95,i%2?-500:500,0,50,"#eef7ff","body",{warn:.8+i*.18})}
 else if(id===33){for(let i=0;i<20;i++)add(G.rnd(A.x,A.x+A.w),G.rnd(A.y,A.y+A.h),0,0,9,"#9df4ff","clone",{timer:G.rnd(.5,1.4)})}
 else if(id===34||id===35){for(let i=0;i<14;i++)add(id===34?A.x-30:A.x+A.w+30,A.y+20+i*30,id===34?260:-260,Math.sin(i*.8)*120,8,"#ffbc62","wave")}
 else if(id===36){G.bossFx.handL=1;G.bossFx.eyeBeam=1.2;G.bossFx.reach=1.3;for(let i=0;i<8;i++)add(A.x-30,A.y+35+i*48,240,0,17,"#dde8f2","hand",{warn:.7});for(let i=0;i<6;i++)add(cx,A.y+50+i*60,0,300,18,"#ff4264","eyeBeam",{warn:1})}
 else if(id===37){G.bossFx.dash=1.5;radial(18,240,"#fff","burst")}
 else if(id===38){rain(24,"#ff89a7",230,7)}
 else {G.bossFx.coreOpen=6;G.bossFx.eyeBeam=1.8;for(let i=0;i<34;i++){const a=i*Math.PI*2/34;add(cx,cy,Math.cos(a)*(180+(i%4)*28),Math.sin(a)*(180+(i%4)*28),i%5===0?12:6,i%5===0?"#ff3657":"#fff","finale")}}
};
Game.updateBullets=function(dt){
 const G=Game,slow=G.slowTurns>0?.58:1,pending=[];G.patternClock+=dt;G.bossFx.coreOpen=Math.max(0,G.bossFx.coreOpen-dt);G.bossFx.eyeBeam=Math.max(0,G.bossFx.eyeBeam-dt);
 if(G.patternClock>3&&G.bullets.length<80){G.patternClock=0;G.spawnPattern((G.patternId+1+Math.floor(Math.random()*7))%40)}
 for(const b of G.bullets){
  if(b.warn>0){b.warn-=dt;continue}
  if(b.k==="homing"){const dx=G.heart.x-b.x,dy=G.heart.y-b.y,l=Math.hypot(dx,dy)||1;b.vx+=dx/l*90*dt;b.vy+=dy/l*90*dt}
  if(b.k==="spiral"){const a=b.spin*dt,ox=b.vx,oy=b.vy;b.vx=ox*Math.cos(a)-oy*Math.sin(a);b.vy=ox*Math.sin(a)+oy*Math.cos(a)}
  if(b.k==="blade")b.vx=Math.sin(G.time*5+b.wave)*95;
  if(b.k==="mine"){b.timer-=dt;if(b.timer<0&&b.timer>-100){b.timer=-999;for(let j=0;j<8;j++){const a=j*Math.PI/4;pending.push({x:b.x,y:b.y,vx:Math.cos(a)*215,vy:Math.sin(a)*215,r:5,c:"#ffe05e",k:"piece",life:2.4})}}}
  if(b.k==="split"){b.life-=dt;if(b.life<0&&b.life>-100){b.life=-999;for(let j=0;j<4;j++){const a=j*Math.PI/2;pending.push({x:b.x,y:b.y,vx:Math.cos(a)*200,vy:Math.sin(a)*200,r:5,c:"#ff9be0",k:"piece",life:2.2})}}}
  if(b.k==="zig")b.vy=Math.sin(G.time*7+b.phase)*130;
  if(b.k==="drill"){const a=b.spin*dt,ox=b.vx,oy=b.vy;b.vx=ox*Math.cos(a)-oy*Math.sin(a);b.vy=ox*Math.sin(a)+oy*Math.cos(a)}
  if(b.k==="clone"){b.timer-=dt;if(b.timer<=0){const dx=G.heart.x-b.x,dy=G.heart.y-b.y,l=Math.hypot(dx,dy)||1;b.vx=dx/l*220;b.vy=dy/l*220;b.timer=999}}
  if(b.life!==undefined)b.life-=dt;b.x+=b.vx*dt*slow;b.y+=b.vy*dt*slow;
  if(b.k==="fake"&&b.fake)continue;
  if(Math.hypot(b.x-G.heart.x,b.y-G.heart.y)<b.r+G.heart.r&&G.heart.inv<=0){G.hurt([0,20,25,31,38,46][G.boss.phase]);G.heart.inv=.7;G.particle(G.heart.x,G.heart.y,"#ff435d",14,1.2);G.shake=9}
 }
 G.bullets.push(...pending.slice(0,Math.max(0,120-G.bullets.length)));G.bullets=G.bullets.filter(b=>b&&(b.life===undefined||b.life>0)&&b.x>G.arena.x-180&&b.x<G.arena.x+G.arena.w+180&&b.y>G.arena.y-180&&b.y<G.arena.y+G.arena.h+180);if(G.bullets.length>120)G.bullets.length=120;
};