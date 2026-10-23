/* Kampanija: 10 arkadinių lygių + 10 viktorinos temų. Prieš kiekvieną temą reikia įveikti lygį. */
(()=>{
let unlocked=+(LS("kf_camp")||1);
const lvName=()=>TOP.slice(0,10);
function grid(){
  const n=lvName(),cur=Math.min(unlocked,n.length);
  $("#camp").innerHTML=`<h2>Kampanija</h2>
  <p class="wr">10 lygių. Kiekvienas lygis: 1) arkadinis žaidimas – pagauk galvas krepšiu; 2) tos temos viktorina (reikia bent 5 teisingų per 60 s).</p>
  <button class="btn go" data-lv="${cur-1}" style="margin-top:6px">${cur>1?"Tęsti":"Pradėti"}: lygis ${cur} · ${n[cur-1]?esc(n[cur-1].name):""}</button>
  <div class="chips" style="margin-top:12px">${n.map((t,k)=>`<button class="chip" data-lv="${k}" ${k+1>unlocked?'disabled style="opacity:.4"':""}>${k+1<unlocked?"✓ ":k+1>unlocked?"🔒 ":""}${k+1}. ${esc(t.name)}</button>`).join("")}</div>`;
}
function menu(){$("#end").hidden=true;$("#play").hidden=true;$("#home").hidden=false;grid()}
function play(i){
  arcade(i+1,()=>{
    document.querySelectorAll("#tp .chip").forEach((c,k)=>c.setAttribute("aria-pressed",String(k===i)));
    window.CAMP=i+1;start();
  });
}
$("#camp").onclick=e=>{const b=e.target.closest("[data-lv]");if(b&&!b.disabled)play(+b.dataset.lv)};
const wait=setInterval(()=>{if(TOP.length){clearInterval(wait);grid()}},300);

/* ---- Arkadinis žaidimas: pagauk galvas krepšiu, venk raudonų spyglių ---- */
function arcade(L,done,bonus){
  const o=document.createElement("div");o.id="arc";
  o.style.cssText="position:fixed;inset:0;z-index:40;background:rgba(7,9,15,.93);touch-action:none";
  const cv=document.createElement("canvas");o.appendChild(cv);document.body.appendChild(o);
  const W=cv.width=innerWidth,H=cv.height=innerHeight,x=cv.getContext("2d"),img=new Image();img.src="head.png";
  const target=4+L*2,pw=Math.max(70,140-L*7),R=26,spd=2+L*.35,gap=1100-L*65,badP=.12+L*.03,py=H-70;
  let px=W/2,items=[],caught=0,lives=3,last=performance.now(),sp=0,over=0,t0=last,flash=0;
  const mv=e=>{px=Math.max(pw/2,Math.min(W-pw/2,e.clientX))};
  const key=e=>{if(e.key==="ArrowLeft")px=Math.max(pw/2,px-45);if(e.key==="ArrowRight")px=Math.min(W-pw/2,px+45)};
  o.onpointermove=mv;o.onpointerdown=mv;addEventListener("keydown",key);
  function fin(win){
    over=1;removeEventListener("keydown",key);
    if(bonus){stage(!!win,win?"+10":"",win?"Bonusas įveiktas! +10 s":"Bonusas nepavyko",win?"":"Tęsk viktoriną");setTimeout(()=>{o.remove();done(!!win)},1600);return}
    if(win){stage(true,String(L).padStart(2,"0"),L<10?`Lygis ${L} įveiktas – dabar viktorina!`:"Kampanija baigta!");setTimeout(()=>{o.remove();done()},1500)}
    else{
      stage(false,"",`Lygis ${L} nepavyko`,"Bandyk dar kartą");
      const b=document.createElement("div");b.style.cssText="position:absolute;left:0;right:0;top:30%;display:flex;gap:12px;justify-content:center";
      b.innerHTML='<button class="btn go" style="width:auto" id="ar1">Bandyti dar kartą</button><button class="btn go" style="width:auto;background:none;color:#fff;border:1px solid #1E2638" id="ar2">Meniu</button>';
      o.appendChild(b);
      $("#ar1").onclick=()=>{o.remove();arcade(L,done)};$("#ar2").onclick=()=>{o.remove();menu()};
    }
  }
  (function f(t){
    if(over)return;const d=Math.min(40,t-last);last=t;sp+=d;
    if(sp>gap){sp=0;items.push({x:R+Math.random()*(W-2*R),y:-R,bad:Math.random()<badP,ph:Math.random()*6,v:spd*(1+Math.random()*.4)})}
    x.clearRect(0,0,W,H);
    for(const it of items){
      it.y+=it.v*d/16;const ix=it.x+(L>=4?Math.sin(t/500+it.ph)*L*6:0);
      if(!it.dead&&it.y>py-R&&it.y<py+12&&Math.abs(ix-px)<pw/2+R*.4){it.dead=1;if(it.bad){lives--;flash=12}else caught++}
      if(it.bad){
        x.fillStyle="#ff3b45";x.strokeStyle="#ff3b45";x.lineWidth=3;x.beginPath();x.arc(ix,it.y,R*.7,0,6.3);x.fill();
        for(let k=0;k<8;k++){const a=k*.785+t/400;x.beginPath();x.moveTo(ix+Math.cos(a)*R*.7,it.y+Math.sin(a)*R*.7);x.lineTo(ix+Math.cos(a)*R*1.1,it.y+Math.sin(a)*R*1.1);x.stroke()}
      }else{
        x.save();x.beginPath();x.arc(ix,it.y,R,0,6.3);x.clip();if(img.complete)x.drawImage(img,ix-R,it.y-R,2*R,2*R);x.restore();
        x.strokeStyle="#FFB020";x.lineWidth=3;x.beginPath();x.arc(ix,it.y,R,0,6.3);x.stroke();
      }
    }
    items=items.filter(i=>!i.dead&&i.y<H+R);
    x.strokeStyle="#ff7a1a";x.lineWidth=5;x.beginPath();x.moveTo(px-pw/2,py);x.lineTo(px+pw/2,py);x.stroke();
    x.lineWidth=2;x.strokeStyle="rgba(232,236,244,.7)";
    for(let k=0;k<=5;k++){x.beginPath();x.moveTo(px-pw/2+k*pw/5,py);x.lineTo(px-pw/4+k*pw/10,py+38);x.stroke()}
    x.fillStyle=flash>0?"#ff5c73":"#FFB020";x.font="700 22px 'Barlow Condensed',sans-serif";if(flash>0)flash--;
    x.fillText(`LYGIS ${L} · ${TOP[L-1]?TOP[L-1].name:""}`,16,30);
    x.fillText(`Galvos: ${caught}/${target}   ${"♥".repeat(Math.max(0,lives))}`,16,58);
    if(t-t0<2500){x.fillStyle="#E8ECF4";x.fillText("Judink krepšį pirštu ar pele. Venk raudonų spyglių!",16,88)}
    if(caught>=target)return fin(1);
    if(lives<=0)return fin(0);
    requestAnimationFrame(f);
  })(last);
}

window.arcade=arcade;
/* ---- Viktorinos pabaiga kampanijoje ---- */
const _end=end;
end=function(){
  _end();const lv=window.CAMP;if(!lv)return;window.CAMP=0;
  const ok=S.score>=5;
  if(ok&&lv>=unlocked&&lv<10){unlocked=lv+1;LS("kf_camp",unlocked)}
  stage(ok,pad(S.score),ok?(lv<10?`Lygis ${lv} pereitas!`:"Kampanija baigta!"):`Lygis ${lv} nepavyko`,ok?"":"Reikia bent 5 teisingų");
  $("#end").insertAdjacentHTML("beforeend",`<button class="btn go" id="nx">${ok&&lv<10?"Kitas lygis →":"Kampanijos meniu"}</button>`);
  $("#nx").onclick=()=>{ok&&lv<10?play(lv):menu()};
};
})();
