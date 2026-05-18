const SAVE_KEY = "night_shift_command_v3_save";

const defaultGame = {
  credits:180,
  metal:110,
  energy:55,
  data:0,
  rations:50,
  threat:1,
  xp:0,
  level:1,
  startedAt:Date.now(),
  lastTick:Date.now(),
  buildings:{},
  units:{},
  tech:{},
  sites:{},
  logs:[]
};

let game = loadGame();

function initMissing(){
  Object.keys(DATA.buildings).forEach(k => game.buildings[k] ??= (k === "hq" ? 1 : 0));
  Object.keys(DATA.units).forEach(k => game.units[k] ??= 0);
  Object.keys(DATA.tech).forEach(k => game.tech[k] ??= false);
  Object.keys(DATA.sites).forEach(k => game.sites[k] ??= false);
  game.rations ??= 50;
}

function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return structuredClone(defaultGame);
    return {...structuredClone(defaultGame), ...JSON.parse(raw)};
  }catch(e){
    return structuredClone(defaultGame);
  }
}

function saveGame(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function resetGame(){
  if(confirm("Effacer la sauvegarde Night Shift Command V3 ?")){
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
}

function log(msg, type=""){
  const time = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  game.logs.unshift({time,msg,type});
  game.logs = game.logs.slice(0,120);
}

function canPay(cost){
  return Object.entries(cost).every(([k,v]) => (game[k] || 0) >= v);
}

function pay(cost){
  Object.entries(cost).forEach(([k,v]) => game[k] -= v);
}

function gain(res){
  Object.entries(res).forEach(([k,v]) => game[k] = (game[k] || 0) + v);
}

function costText(cost){
  return Object.entries(cost).map(([k,v]) => `${Math.floor(v)} ${label(k)}`).join(" / ");
}

function label(k){
  return {
    credits:"crédits",
    metal:"métal",
    energy:"énergie",
    data:"data",
    rations:"rations"
  }[k] || k;
}

function buildingCost(id){
  const b = DATA.buildings[id];
  const lvl = game.buildings[id] || 0;
  const mult = Math.pow(1.58, lvl);
  const out = {};
  Object.entries(b.base).forEach(([k,v]) => out[k] = Math.floor(v * mult));
  return out;
}

function upgradeBuilding(id){
  const b = DATA.buildings[id];
  const lvl = game.buildings[id] || 0;
  if(lvl >= b.max) return;
  const cost = buildingCost(id);
  if(!canPay(cost)) return;
  pay(cost);
  game.buildings[id]++;
  addXp(25 + game.buildings[id] * 8);
  log(`${b.name} amélioré niveau ${game.buildings[id]}.`, "good");
  render();
}

function reqMet(req){
  if(!req) return true;
  if(req.building) return (game.buildings[req.building] || 0) >= req.level;
  if(req.tech) return !!game.tech[req.tech];
  return true;
}

function reqText(req){
  if(!req) return "Aucun";
  if(req.building) return `${DATA.buildings[req.building].name} niv. ${req.level}`;
  if(req.tech) return `${DATA.tech[req.tech].name}`;
  return "Aucun";
}

function recruit(id){
  const u = DATA.units[id];
  if(!reqMet(u.req)) return;
  if(!canPay(u.cost)) return;
  pay(u.cost);
  game.units[id]++;
  addXp(8);
  log(`${u.name} rejoint le camp.`, "good");
  render();
}

function buyTech(id){
  const t = DATA.tech[id];
  if(game.tech[id]) return;
  if(!canPay(t.cost)) return;
  pay(t.cost);
  game.tech[id] = true;
  addXp(120);
  log(`Recherche terminée : ${t.name}.`, "good");
  render();
}

function captureSite(id){
  const s = DATA.sites[id];
  if(game.sites[id]) return;
  const enemy = scaledDifficulty(s.difficulty);
  const score = getPower() + rand(1,60);
  if(score >= enemy){
    game.sites[id] = true;
    gain(s.reward);
    game.threat += 3;
    addXp(160);
    log(`Site capturé : ${s.name}. Bonus permanent actif.`, "good");
  }else{
    sufferLosses(Math.max(1, Math.floor((enemy-score)/25)));
    game.threat += 1;
    log(`Échec de capture : ${s.name}. Les défenseurs tiennent encore.`, "bad");
  }
  render();
}

function runMission(i){
  const m = DATA.missions[i];
  const enemy = scaledDifficulty(m.difficulty);
  const score = getPower() + rand(1,70) + (game.buildings.radar || 0) * 4;

  if(score >= enemy){
    const reward = {};
    Object.entries(m.reward).forEach(([k,v])=>{
      let value = v;
      if(game.tech.stealth) value *= 1.2;
      reward[k] = Math.floor(value);
    });
    gain(reward);
    game.threat += m.threat;
    addXp(70 + m.difficulty);
    log(`Victoire contre ${m.faction} : ${m.name}. Butin : ${costText(reward)}.`, "good");
  }else{
    const loss = Math.max(1, Math.floor((enemy-score)/22));
    sufferLosses(loss);
    game.threat += Math.max(1, Math.floor(m.threat/2));
    log(`Défaite contre ${m.faction} : ${m.name}. Pertes estimées : ${loss}.`, "bad");
  }
  render();
}

function sufferLosses(amount){
  if(game.tech.med_protocol) amount = Math.max(1, Math.floor(amount * .45));
  else if((game.buildings.medbay || 0) > 0) amount = Math.max(1, Math.floor(amount * (0.85 - Math.min(.35, game.buildings.medbay*.04))));

  for(let i=0;i<amount;i++){
    const available = Object.keys(game.units).filter(k => game.units[k] > 0);
    if(!available.length) return;
    const victim = available[rand(0, available.length-1)];
    game.units[victim]--;
  }
}

function getPower(){
  let p = 0;
  Object.entries(game.units).forEach(([id,n]) => p += (DATA.units[id]?.power || 0) * n);
  p += (game.buildings.wall || 0) * 10;
  p += (game.buildings.academy || 0) * 7;
  if(game.tech.armor) p *= 1.20;
  if(game.tech.weapons) p *= 1.25;
  if(game.tech.ai_command) p *= 1.35;
  return Math.floor(p);
}

function scaledDifficulty(base){
  return Math.floor(base * (1 + game.threat * .075));
}

function addXp(v){
  game.xp += v;
  const needed = game.level * 500;
  while(game.xp >= needed){
    game.xp -= needed;
    game.level++;
    game.credits += game.level * 90;
    game.data += game.level * 20;
    log(`Niveau de commandement augmenté : ${game.level}. Prime reçue.`, "good");
  }
}

function productionMult(){
  let m = 1;
  if(game.tech.logistics) m += .25;
  return m;
}

function getProduction(){
  const prod = {credits:.8, metal:.45, energy:.18, data:0, rations:.12};

  Object.entries(DATA.buildings).forEach(([id,b])=>{
    const lvl = game.buildings[id] || 0;
    Object.entries(b.prod || {}).forEach(([k,v]) => prod[k] += v * lvl);
  });

  Object.entries(DATA.sites).forEach(([id,owned])=>{
    if(!owned) return;
    Object.entries(DATA.sites[id].bonus).forEach(([k,v]) => prod[k] += v);
  });

  const m = productionMult();
  Object.keys(prod).forEach(k => prod[k] *= m);
  return prod;
}

function tick(){
  const now = Date.now();
  const delta = Math.min(8, (now - game.lastTick) / 1000);
  game.lastTick = now;

  const prod = getProduction();
  Object.entries(prod).forEach(([k,v]) => game[k] += v * delta);

  const armySize = Object.values(game.units).reduce((a,b)=>a+b,0);
  game.rations -= Math.max(0, armySize * 0.002 * delta);

  if(game.rations < 0){
    game.rations = 0;
    if(Math.random() < .04){
      log("Rations épuisées : moral instable, quelques soldats désertent.", "bad");
      sufferLosses(1);
    }
  }

  if(Math.random() < 0.004 + game.threat * 0.0003){
    randomEvent();
  }

  render(false);
}

function randomEvent(){
  const power = getPower();
  const events = [
    () => {
      const steal = Math.floor(60 + game.threat * 12);
      game.credits = Math.max(0, game.credits - steal);
      log(`Raid éclair des Gangs Chrome : ${steal} crédits volés.`, "bad");
    },
    () => {
      const found = Math.floor(90 + (game.buildings.radar || 0) * 45);
      game.data += found;
      log(`Signal fantôme intercepté : +${found} data.`, "good");
    },
    () => {
      const found = Math.floor(140 + game.level * 35);
      game.metal += found;
      log(`Carcasse militaire récupérée : +${found} métal.`, "good");
    },
    () => {
      const enemy = scaledDifficulty(55);
      if(power + rand(1,45) >= enemy){
        game.credits += 260;
        game.rations += 70;
        log("Convoi hostile repoussé. Stocks capturés.", "good");
      }else{
        sufferLosses(2);
        game.threat += 1;
        log("Convoi hostile trop puissant. Le camp subit des pertes.", "bad");
      }
    },
    () => {
      game.energy += 120;
      log("Surcharge propre du réacteur : +120 énergie.", "good");
    },
    () => {
      game.threat = Math.max(1, game.threat - 2);
      log("Fausse piste diffusée sur les réseaux ennemis : menace réduite.", "good");
    }
  ];
  events[rand(0,events.length-1)]();
}

function rand(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function bindTabs(){
  document.querySelectorAll(".tab").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

function render(full=true){
  document.getElementById("credits").textContent = Math.floor(game.credits);
  document.getElementById("metal").textContent = Math.floor(game.metal);
  document.getElementById("energy").textContent = Math.floor(game.energy);
  document.getElementById("data").textContent = Math.floor(game.data);
  document.getElementById("rations").textContent = Math.floor(game.rations);
  document.getElementById("threat").textContent = game.threat;
  document.getElementById("power").textContent = getPower();
  document.getElementById("level").textContent = game.level;

  const elapsed = Math.floor((Date.now() - game.startedAt)/1000);
  const h = String(Math.floor(elapsed/3600)).padStart(2,"0");
  const m = String(Math.floor((elapsed%3600)/60)).padStart(2,"0");
  const s = String(elapsed%60).padStart(2,"0");
  document.getElementById("playtime").textContent = `${h}:${m}:${s}`;

  const need = game.level * 500;
  document.getElementById("xpbar").style.width = `${Math.min(100,(game.xp/need)*100)}%`;

  renderObjectives();
  renderReport();

  if(full){
    renderBuildings();
    renderUnits();
    renderTech();
    renderMissions();
    renderSites();
  }

  renderLog();
}

function renderObjectives(){
  const obj = [];
  if((game.buildings.barracks || 0) < 1) obj.push("Construire les Baraquements Chrome.");
  if(Object.values(game.units).reduce((a,b)=>a+b,0) < 5) obj.push("Recruter au moins 5 unités.");
  if(!game.tech.logistics) obj.push("Débloquer la Logistique Automatisée.");
  if(Object.values(game.sites).filter(Boolean).length < 2) obj.push("Capturer 2 sites exploitables.");
  if(getPower() < 250) obj.push("Atteindre 250 de puissance militaire.");
  if(obj.length === 0) obj.push("Tenir la nuit et préparer l'Opération BLACK NEON.");
  document.getElementById("objectives").innerHTML = obj.map(x=>`<li>${x}</li>`).join("");
}

function renderReport(){
  const prod = getProduction();
  document.getElementById("report").innerHTML =
    `Production/sec : <span class="good">${prod.credits.toFixed(1)}</span> crédits, `+
    `<span class="good">${prod.metal.toFixed(1)}</span> métal, `+
    `<span class="good">${prod.energy.toFixed(1)}</span> énergie, `+
    `<span class="good">${prod.data.toFixed(1)}</span> data, `+
    `<span class="good">${prod.rations.toFixed(1)}</span> rations.`;
}

function renderBuildings(){
  const root = document.getElementById("buildings");
  root.innerHTML = "";
  Object.entries(DATA.buildings).forEach(([id,b])=>{
    const lvl = game.buildings[id] || 0;
    const cost = buildingCost(id);
    const maxed = lvl >= b.max;
    root.innerHTML += `
      <article class="card">
        <h3>${b.name} <span class="pink">Niv. ${lvl}/${b.max}</span></h3>
        <p>${b.lore}</p>
        <p>${b.desc}</p>
        <p class="price">Coût : ${maxed ? "MAX" : costText(cost)}</p>
        <button ${!maxed && canPay(cost) ? "" : "disabled"} onclick="upgradeBuilding('${id}')">
          ${maxed ? "Niveau maximum" : "Améliorer"}
        </button>
      </article>`;
  });
}

function renderUnits(){
  const root = document.getElementById("unitsList");
  root.innerHTML = "";
  Object.entries(DATA.units).forEach(([id,u])=>{
    const locked = !reqMet(u.req);
    root.innerHTML += `
      <article class="card">
        <h3>${u.name} <span class="pink">x${game.units[id] || 0}</span></h3>
        <p>${u.lore}</p>
        <p>Puissance : <strong>${u.power}</strong></p>
        <p>Requis : ${reqText(u.req)}</p>
        <p class="price">Coût : ${costText(u.cost)}</p>
        <button ${!locked && canPay(u.cost) ? "" : "disabled"} onclick="recruit('${id}')">
          ${locked ? "Verrouillé" : "Recruter"}
        </button>
      </article>`;
  });
}

function renderTech(){
  const root = document.getElementById("techList");
  root.innerHTML = "";
  Object.entries(DATA.tech).forEach(([id,t])=>{
    const owned = game.tech[id];
    root.innerHTML += `
      <article class="card">
        <h3>${t.name}</h3>
        <p>${t.desc}</p>
        <p class="price">Coût : ${costText(t.cost)}</p>
        <button ${!owned && canPay(t.cost) ? "" : "disabled"} onclick="buyTech('${id}')">
          ${owned ? "Débloqué" : "Rechercher"}
        </button>
      </article>`;
  });
}

function renderMissions(){
  const root = document.getElementById("missionsList");
  root.innerHTML = "";
  DATA.missions.forEach((m,i)=>{
    root.innerHTML += `
      <article class="card">
        <h3>${m.name}</h3>
        <p><span class="badge">${m.faction}</span></p>
        <p>${m.lore}</p>
        <p>Difficulté : <span class="bad">${scaledDifficulty(m.difficulty)}</span> / Ta puissance : <span class="good">${getPower()}</span></p>
        <p class="price">Butin : ${costText(m.reward)}</p>
        <button onclick="runMission(${i})">Lancer la mission</button>
      </article>`;
  });
}

function renderSites(){
  const root = document.getElementById("sitesList");
  root.innerHTML = "";
  Object.entries(DATA.sites).forEach(([id,s])=>{
    const owned = game.sites[id];
    const bonus = costText(s.bonus).replaceAll("crédits","crédits/sec").replaceAll("métal","métal/sec").replaceAll("énergie","énergie/sec").replaceAll("data","data/sec").replaceAll("rations","rations/sec");
    root.innerHTML += `
      <article class="card">
        <h3>${s.name}</h3>
        <p>${s.lore}</p>
        <p>Difficulté : <span class="bad">${scaledDifficulty(s.difficulty)}</span></p>
        <p>Bonus permanent : <span class="good">${bonus}</span></p>
        <p class="price">Butin de capture : ${costText(s.reward)}</p>
        <button ${owned ? "disabled" : ""} onclick="captureSite('${id}')">
          ${owned ? "Site contrôlé" : "Tenter la capture"}
        </button>
      </article>`;
  });
}

function renderLog(){
  document.getElementById("logBox").innerHTML = game.logs.map(l=>
    `<p><span class="${l.type || ""}">[${l.time}]</span> ${l.msg}</p>`
  ).join("");
}

initMissing();
bindTabs();

if(game.logs.length === 0){
  log("Service de nuit lancé. Bastion S-17 attend les ordres.", "good");
  log("Conseil : construis les baraquements, recrute une escouade, puis lance les premières patrouilles.");
}

render(true);
setInterval(tick, 1000);
setInterval(saveGame, 5000);
window.addEventListener("beforeunload", saveGame);
