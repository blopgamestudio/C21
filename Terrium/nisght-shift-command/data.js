const DATA = {
  buildings:{
    hq:{
      name:"QG Bastion S-17",
      lore:"Un vieux module de commandement volé à une corpo militaire. Tout passe par lui.",
      desc:"Augmente le niveau global du camp et la production de crédits.",
      base:{credits:140,metal:90},
      prod:{credits:.7},
      max:12
    },
    barracks:{
      name:"Baraquements Chrome",
      lore:"Dortoirs froids, néons cassés, casiers blindés et café synthétique.",
      desc:"Débloque l'infanterie et augmente les rations.",
      base:{credits:110,metal:70},
      prod:{rations:.6},
      max:10
    },
    forge:{
      name:"Atelier Méca",
      lore:"Ici, on transforme des carcasses de drones en véhicules de guerre.",
      desc:"Produit du métal et débloque les unités mécaniques.",
      base:{credits:170,metal:140},
      prod:{metal:1.4},
      max:10
    },
    reactor:{
      name:"Réacteur Néon",
      lore:"Un coeur électrique instable, enterré sous des plaques d'acier.",
      desc:"Produit de l'énergie.",
      base:{credits:150,metal:120},
      prod:{energy:1.7},
      max:10
    },
    server:{
      name:"Crypte Serveur",
      lore:"Une salle noire remplie de ventilateurs et de secrets interdits.",
      desc:"Produit de la data et débloque hackers/technologies avancées.",
      base:{credits:210,metal:100,energy:40},
      prod:{data:1.1},
      max:10
    },
    radar:{
      name:"Radar Fantôme",
      lore:"Une antenne illégale capable de lire les mouvements des gangs dans la pluie.",
      desc:"Réduit les pertes et améliore les chances de mission.",
      base:{credits:240,metal:160,energy:60},
      prod:{},
      max:8
    },
    wall:{
      name:"Mur Électro-Balistique",
      lore:"Un anneau de plaques blindées, mines flash et tourelles trop nerveuses.",
      desc:"Ajoute beaucoup de puissance défensive.",
      base:{credits:160,metal:210},
      prod:{},
      max:12
    },
    medbay:{
      name:"Infirmerie Augmentée",
      lore:"Des bras mécaniques, des patchs coagulants et un chirurgien qui ne dort jamais.",
      desc:"Réduit les pertes après un échec.",
      base:{credits:220,metal:130,data:30},
      prod:{},
      max:8
    },
    academy:{
      name:"Académie Tactique",
      lore:"Les survivants apprennent à ne pas mourir deux fois de la même façon.",
      desc:"Bonus de puissance et recrutement avancé.",
      base:{credits:360,metal:220,data:120},
      prod:{},
      max:6
    }
  },

  units:{
    militia:{
      name:"Milicien Chrome",
      lore:"Soldat léger avec implants bas de gamme et courage discutable.",
      power:2,
      cost:{credits:24,metal:10,rations:3},
      req:{building:"barracks",level:1}
    },
    drone:{
      name:"Drone Guetteur",
      lore:"Petit drone de surveillance armé d'une aiguille plasma.",
      power:3,
      cost:{credits:36,metal:20,energy:4},
      req:{building:"barracks",level:1}
    },
    engineer:{
      name:"Ingénieur Terrain",
      lore:"Répare, pirate, construit, jure beaucoup.",
      power:4,
      cost:{credits:70,metal:45,rations:4},
      req:{building:"forge",level:1}
    },
    sniper:{
      name:"Sniper Optique",
      lore:"Un oeil cybernétique, une balle, aucun témoin.",
      power:8,
      cost:{credits:120,metal:55,rations:5},
      req:{building:"barracks",level:2}
    },
    hacker:{
      name:"Hacker Tactique",
      lore:"Il combat sans tirer, mais les portes ennemies s'ouvrent toutes seules.",
      power:11,
      cost:{credits:160,metal:40,data:55,energy:12},
      req:{building:"server",level:1}
    },
    exo:{
      name:"Exo-Soldat",
      lore:"Un soldat dans une cage de muscles hydrauliques.",
      power:17,
      cost:{credits:260,metal:170,energy:25,rations:8},
      req:{building:"academy",level:1}
    },
    mech:{
      name:"Méca Léger Mantis-Noir",
      lore:"Rapide, bruyant, parfait pour casser une ligne ennemie.",
      power:28,
      cost:{credits:420,metal:360,energy:60},
      req:{building:"forge",level:3}
    },
    tank:{
      name:"Char Néon Cerberus",
      lore:"Un char urbain couvert de lumières illégales et d'obus intelligents.",
      power:50,
      cost:{credits:800,metal:700,energy:130,data:60},
      req:{building:"forge",level:5}
    },
    ghost:{
      name:"Spectre Corpo Capturé",
      lore:"Prototype furtif retourné contre ses anciens propriétaires.",
      power:75,
      cost:{credits:1300,metal:900,energy:220,data:240},
      req:{tech:"ghost_protocol"}
    }
  },

  tech:{
    armor:{
      name:"Blindage Composite",
      desc:"+20% puissance globale.",
      cost:{data:100,metal:170},
      bonus:"power"
    },
    weapons:{
      name:"Munitions Plasma Sales",
      desc:"+25% puissance en mission.",
      cost:{data:150,credits:320},
      bonus:"power"
    },
    logistics:{
      name:"Logistique Automatisée",
      desc:"+25% production générale.",
      cost:{data:180,credits:260,energy:80},
      bonus:"production"
    },
    stealth:{
      name:"Camouflage Spectral",
      desc:"+20% récompenses de mission.",
      cost:{data:260,credits:420,energy:120},
      bonus:"reward"
    },
    med_protocol:{
      name:"Protocole Trauma-9",
      desc:"Réduit fortement les pertes.",
      cost:{data:300,credits:500,metal:220},
      bonus:"loss"
    },
    ai_command:{
      name:"IA de Commandement",
      desc:"+35% puissance globale.",
      cost:{data:520,energy:280,credits:800},
      bonus:"power"
    },
    ghost_protocol:{
      name:"Protocole Spectre",
      desc:"Débloque les unités furtives de fin de jeu.",
      cost:{data:950,energy:500,credits:1500,metal:900},
      bonus:"unlock"
    }
  },

  sites:{
    scrapyard:{
      name:"Cimetière de Drones",
      lore:"Des milliers de carcasses encore tièdes sous la pluie acide.",
      difficulty:45,
      bonus:{metal:2.2},
      reward:{metal:300,data:60}
    },
    solar:{
      name:"Ferme Solaire Brisée",
      lore:"Elle ne voit jamais le soleil, mais ses batteries fonctionnent encore.",
      difficulty:70,
      bonus:{energy:2.4},
      reward:{energy:260,credits:220}
    },
    datavault:{
      name:"Coffre Data Corpo",
      lore:"Un bunker serveur oublié, protégé par des IA paranoïaques.",
      difficulty:120,
      bonus:{data:2.1},
      reward:{data:380,credits:400}
    },
    slums:{
      name:"Quartier des Sans-Sommeil",
      lore:"Des civils, des mercenaires et des informateurs qui vivent entre deux coupures réseau.",
      difficulty:90,
      bonus:{credits:2.6,rations:1.1},
      reward:{credits:650,rations:180}
    },
    blackstation:{
      name:"Station Noire K-0",
      lore:"Personne ne sait qui l'a construite. Elle émet encore des ordres militaires.",
      difficulty:230,
      bonus:{credits:4,metal:3,data:3,energy:3},
      reward:{credits:1800,metal:1000,data:650,energy:500}
    }
  },

  missions:[
    {
      name:"Patrouille des docks noyés",
      faction:"Gangs Chrome",
      lore:"Des silhouettes bougent entre les conteneurs. Possible trafic d'armes.",
      difficulty:18,
      reward:{credits:110,metal:55,data:15},
      threat:1
    },
    {
      name:"Extraction de ferraille sous feu",
      faction:"Drones errants",
      lore:"Un dépôt de métal est gardé par des machines sans maître.",
      difficulty:38,
      reward:{metal:220,credits:140,data:25},
      threat:2
    },
    {
      name:"Raid sur un relais pirate",
      faction:"Culte Signal",
      lore:"Ils prient une antenne. L'antenne répond.",
      difficulty:75,
      reward:{data:130,credits:360,energy:80},
      threat:3
    },
    {
      name:"Attaque de convoi corpo",
      faction:"Helix Dynamics",
      lore:"Blindés privés, cargaison inconnue, autorisation morale inutile.",
      difficulty:135,
      reward:{credits:850,metal:520,data:160},
      threat:4
    },
    {
      name:"Nettoyage du district rouge",
      faction:"Milice écarlate",
      lore:"Le district est perdu. Mais ses stocks valent une opération.",
      difficulty:210,
      reward:{credits:1300,metal:900,rations:300,data:240},
      threat:5
    },
    {
      name:"Opération BLACK NEON",
      faction:"IA renégate ORACLE",
      lore:"Une IA militaire a réveillé une usine autonome. Il faut frapper avant l'aube.",
      difficulty:360,
      reward:{credits:2600,metal:1800,energy:900,data:850},
      threat:8
    }
  ]
};
