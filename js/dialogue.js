// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — dialogue.js
// Full Tenglish cinematic scripts + gameplay barks.
// Cinematic step format:
//  {who,text,emo}          — dialogue line w/ subtitle
//  {narrator,text}         — narrator card
//  {action:'walk',who,to}  — actor walks
//  {action:'face',who,dir} — actor turns
//  {action:'emote',who,emo}— emotion change
//  {action:'camera',x,zoom}— camera move
//  {action:'wait',t}       — pause
//  {action:'fx',fx}        — trigger effect (shake, flash, seal, storm...)
//  {action:'title',text}   — big title card
// ============================================================
'use strict';

const VYO = 'vyomasura';

const CINEMATICS = {
  // ================= OPENING =================
  opening: [
    { action: 'fx', fx: 'fadein' },
    { narrator: 'A small town in South India. The morning of Ganesh Chaturthi.' },
    { action: 'camera', x: 400, zoom: 1, t: 2.5 },
    { narrator: 'Shops opening. Streets waking up. Marigold and mango leaves on every door.' },
    { action: 'camera', x: 900, zoom: 1, t: 3 },
    { action: 'wait', t: 0.6 },
    { narrator: 'But years ago... something ancient was sealed beneath this land.' },
    { action: 'fx', fx: 'flashPurple' },
    { action: 'wait', t: 0.8 },
    { narrator: 'The town forgot. The stones did not.' },
    { action: 'camera', x: 640, zoom: 1, t: 1.5 },
    { action: 'img', img: 'cine_friends_festival', t: 3.2, zoomFrom: 1.0, zoomTo: 1.09 },
    { who: 'aditya', text: 'Finally ra... mana Ganesh Chaturthi start ayindi!', emo: 'joy' },
    { who: 'arjun', text: 'Festival kanna mundu food important bro. Pulihora ekkada?', emo: 'happy' },
    { who: 'ravi', text: 'Obviously. Neeku vere thought untunda asalu?', emo: 'happy' },
    { action: 'emote', who: 'kiran', emo: 'joy' },
    { who: 'kiran', text: 'Haha... ee year pandaga manam organize chestunnam. Gurthu pettuko.', emo: 'happy' },
    { action: 'camera', x: 1100, zoom: 0.85, t: 3 },
    { action: 'fx', fx: 'templeSound' },
    { action: 'wait', t: 1.2 },
    { action: 'imgClear' },
    { action: 'fx', fx: 'fadeout' },
    { action: 'title', text: 'GANESH CHATURTHI:\nTHE LAST NIGHT' },
  ],

  // ================= PHASE 1 =================
  lv1_start: [
    { narrator: 'LEVEL 1 — OUR STREET' },
    { who: 'aditya', text: 'Okay team! Pandal ready cheyyali. Decorations, lights, anni!', emo: 'happy' },
    { who: 'arjun', text: 'Nenu lights chuskunta. Ledder meeda ekkadam naa talent.', emo: 'joy' },
    { who: 'ravi', text: 'Last year ledder meeda nunchi padipoyav. Talent aa adi?', emo: 'happy' },
    { who: 'arjun', text: 'Adi... controlled landing ra.', emo: 'happy' },
    { who: 'kiran', text: 'Randi. Street chivara varaku andaritho matladudam.', emo: 'neutral' },
  ],
  lv1_end: [
    { who: 'aditya', text: 'Super! Street motham ready. Repu idol vastundi!', emo: 'joy' },
    { who: 'kiran', text: 'Mana ooru lo idi best pandaga avvali.', emo: 'happy' },
  ],
  lv2_start: [
    { narrator: 'LEVEL 2 — FESTIVAL PREPARATION' },
    { who: 'ravi', text: 'List cheptha vinandi. Flowers, diyas, coconut, banana leaves...', emo: 'neutral' },
    { who: 'arjun', text: 'Bro list lo laddu ledu. Serious mistake.', emo: 'happy' },
    { who: 'ravi', text: 'Laddu decoration kaadu ra. Adi nee lunch.', emo: 'happy' },
    { who: 'aditya', text: 'Randi randi, shopkeepers andaru help adugutunnaru.', emo: 'happy' },
  ],
  lv2_end: [
    { who: 'kiran', text: 'Anni saripoyayi. Ippudu aa old lane daggara shortcut teesukundam.', emo: 'neutral' },
    { who: 'arjun', text: 'Old lane aa...? Akkada evaru vellaru bro chala years nunchi.', emo: 'worry' },
  ],
  lv3_start: [
    { narrator: 'LEVEL 3 — THE OLD LANE' },
    { action: 'fx', fx: 'windSound' },
    { who: 'aditya', text: 'Bro... ee place lo something seriously wrong undi.', emo: 'worry' },
    { who: 'arjun', text: 'Wrong aa? Naaku ayithe full horror movie feeling vastundi.', emo: 'fear' },
    { who: 'ravi', text: 'Jokes pakkana pettu. Look at those symbols... ivi chala old.', emo: 'surprise' },
    { who: 'kiran', text: 'Guys... mana venakala road kuda close aipoyindi.', emo: 'worry' },
  ],
  lv3_end: [
    { who: 'ravi', text: 'Ee symbols... temple carvings laga unnayi. Kaani inka old.', emo: 'determined' },
    { who: 'aditya', text: 'Temple courtyard ki veldam. Answers akkade untayi.', emo: 'determined' },
  ],
  lv4_start: [
    { narrator: 'LEVEL 4 — TEMPLE COURTYARD' },
    { who: 'kiran', text: 'Ee temple... maa thatha cheppevaru. Chala powerful place ani.', emo: 'neutral' },
    { who: 'ravi', text: 'Ee carvings chudandi. Oka... entity. Bandhinchabadindi. Underground.', emo: 'surprise' },
    { who: 'arjun', text: 'Entity ante? Ghost aa? Demon aa? Clarity ivvu bro.', emo: 'fear' },
    { who: 'ravi', text: 'Carvings lo okate word repeat avutundi... "Vyomasura".', emo: 'worry' },
  ],
  lv4_end: [
    { who: 'aditya', text: 'Ikkada oka hidden chamber undi ani carvings cheptunnayi.', emo: 'determined' },
    { who: 'kiran', text: 'Manam vellali antara...? Pandaga time lo idi correct aa?', emo: 'worry' },
    { who: 'aditya', text: 'Telusukovali ra. Edo jarugutundi ikkada.', emo: 'determined' },
  ],
  lv5_start: [
    { narrator: 'LEVEL 5 — THE HIDDEN CHAMBER' },
    { who: 'arjun', text: 'Cheekati... naaku cheekati ante birth nunchi problem.', emo: 'fear' },
    { who: 'ravi', text: 'Puzzle mechanisms unnayi. Ancient people genius ra.', emo: 'surprise' },
  ],
  lv5_seal: [
    { action: 'camera', zoom: 1.3, t: 1.5 },
    { who: 'ravi', text: 'Idi... idi aa seal. Carvings lo chupinchindi ide.', emo: 'surprise' },
    { who: 'aditya', text: 'Crack ayyindi... chala pedda crack.', emo: 'worry' },
    { action: 'fx', fx: 'shadowFlicker' },
    { who: 'arjun', text: 'BRO. AKKADA. EDO KADILINDI. Nenu chusanu!', emo: 'fear' },
    { who: 'kiran', text: 'Calm ra. Manam... manam ippudu bayataki veldam. Slow ga.', emo: 'worry' },
    { action: 'fx', fx: 'lowRumble' },
  ],
  lv6_start: [
    { narrator: 'LEVEL 6 — FESTIVAL NIGHT' },
    { who: 'aditya', text: 'Chamber gurinchi repu alochiddam. Ee roju pandaga!', emo: 'joy' },
    { who: 'arjun', text: 'CORRECT. Music, lights, food. Idi mana night ra!', emo: 'joy' },
    { who: 'kiran', text: 'Idol chudandi... entha bagundo.', emo: 'relief' },
    { who: 'ravi', text: 'Okay okay... nenu kuda oppukuntunna. Perfect ga undi.', emo: 'happy' },
  ],
  lv6_end: [
    { who: 'aditya', text: 'Ganapati Bappa...', emo: 'joy' },
    { who: 'arjun', text: 'MORYA!!', emo: 'joy' },
    { action: 'wait', t: 0.7 },
    { action: 'fx', fx: 'windSound' },
    { who: 'ravi', text: '...gaali. Gaali direction okkasari ga marindi.', emo: 'worry' },
  ],
  lv7_start: [
    { action: 'img', img: 'cine_storm', t: 4.2, zoomFrom: 1.0, zoomTo: 1.12, panFrom: 0.5, panTo: 0.44 },
    { narrator: 'LEVEL 7 — THE STRANGE STORM' },
    { action: 'fx', fx: 'storm' },
    { who: 'kiran', text: 'Sky chudandi... clouds circle ga tirugutunnayi. Temple meeda.', emo: 'fear' },
    { who: 'aditya', text: 'Lights anni flicker avutunnayi... idi normal storm kaadu.', emo: 'worry' },
    { who: 'arjun', text: 'Andaru bhayapaddaru bro... pillalu edustunnaru.', emo: 'worry' },
    { action: 'fx', fx: 'shadowSpawn' },
    { who: 'ravi', text: 'ADITYA. VENAKA. AA SHADOWS... AVI KADULUTUNNAYI.', emo: 'fear' },
    { who: 'aditya', text: 'Andaru daggara undandi. Edi ayina sare... manam kalisi untam.', emo: 'determined' },
    { action: 'imgClear' },
  ],
  lv7_end: [
    { who: 'arjun', text: 'Bro avi... avi asalu em anavi?! Nenu punch chesa, smoke laga vachindi!', emo: 'fear' },
    { who: 'ravi', text: 'Seal. Chamber lo aa seal. Adi break avutundi... ippude.', emo: 'determined' },
    { who: 'aditya', text: 'Temple ki. IPPUDE.', emo: 'determined' },
  ],
  lv8_start: [
    { narrator: 'LEVEL 8 — THE SEAL BREAKS' },
    { who: 'kiran', text: 'Chamber daggara ki vastunnam... goda lu vanukutunnayi.', emo: 'worry' },
    { who: 'ravi', text: 'Andaru careful. Ground unstable ga undi.', emo: 'determined' },
  ],
  lv8_seal: [
    { action: 'camera', zoom: 1.25, t: 2 },
    { action: 'fx', fx: 'sealBreak' },
    { action: 'img', img: 'cine_seal_break', t: 4, zoomFrom: 1.0, zoomTo: 1.12 },
    { narrator: 'The ancient seal — shattered.' },
    { action: 'img', img: 'cine_vyo_awaken', t: 4.2, zoomFrom: 1.12, zoomTo: 1.0 },
    { action: 'fx', fx: 'vyoRise' },
    { action: 'wait', t: 1.4 },
    { who: VYO, text: 'Veyyi samvatsaralu... cheekatlo. Ippudu... naa samayam.', emo: 'neutral' },
    { action: 'emote', who: 'aditya', emo: 'fear' },
    { action: 'emote', who: 'arjun', emo: 'fear' },
    { action: 'emote', who: 'ravi', emo: 'fear' },
    { action: 'emote', who: 'kiran', emo: 'fear' },
    { who: 'aditya', text: 'Nuvvu... nuvvu evaru?', emo: 'fear' },
    { who: VYO, text: 'Nenu ee nela kinda unna nijam. Nenu... Vyomasura.', emo: 'neutral' },
    { who: VYO, text: 'Mee pandaga... mee lights... anni naa shadow lo munigipotayi.', emo: 'neutral' },
    { action: 'fx', fx: 'vyoVanish' },
    { action: 'wait', t: 0.8 },
    { action: 'imgClear' },
    { action: 'fx', fx: 'divineSpark' },
    { action: 'img', img: 'cine_powers', t: 4.2, zoomFrom: 1.05, zoomTo: 1.0 },
    { narrator: 'And in that darkness — something warm answered. Four sparks of golden light.' },
    { who: 'kiran', text: 'Naa chethulu... veligipotunnayi...?', emo: 'surprise' },
    { who: 'ravi', text: 'Idi... idi impossible. Kaani... incredible.', emo: 'surprise' },
    { who: 'arjun', text: 'GUYS. MANAKI POWERS VACHAYI. POWERS!!', emo: 'joy' },
    { who: 'aditya', text: 'Vighnesha... mammalni enchukunnadu. Ee ooru ni kapadataniki.', emo: 'determined' },
    { action: 'imgClear' },
    { action: 'title', text: 'PHASE 2\nTHE AWAKENING' },
  ],

  // ================= PHASE 2 =================
  lv9_start: [
    { narrator: 'LEVEL 9 — THE ESCAPE' },
    { who: 'aditya', text: 'Janalu andaru bayata unnaru! Vaallani safe ga school building ki pampali!', emo: 'determined' },
    { who: 'kiran', text: 'Nenu mundu untanu. Naa venakala rammani cheppandi.', emo: 'determined' },
    { who: 'arjun', text: 'Pillalni nenu chuskunta. Fast ga move avvandi!', emo: 'determined' },
  ],
  lv9_end: [
    { who: 'ravi', text: 'Andaru safe. Kaani town... town motham vaalla chetullo undi.', emo: 'sad' },
    { who: 'aditya', text: 'Ippudu kaadu ra. Munduku veldam. Okko street release cheddam.', emo: 'determined' },
  ],
  lv10_start: [
    { narrator: 'LEVEL 10 — THE CORRUPTED STREET' },
    { action: 'emote', who: 'arjun', emo: 'sad' },
    { who: 'arjun', text: 'Bro... ee street... ninna manam ikkade dance chesam.', emo: 'sad' },
    { who: 'kiran', text: 'Decorations anni... nela meeda padi unnayi.', emo: 'sad' },
    { who: 'ravi', text: 'Ee fog... normal kaadu. Ground lo cracks nunchi vastundi.', emo: 'worry' },
    { who: 'aditya', text: 'Malli decorate cheddam ra. Promise. Mundu ee shadows ni clean cheddam.', emo: 'determined' },
  ],
  lv11_start: [
    { narrator: 'LEVEL 11 — THE SHADOW ARMY' },
    { who: 'ravi', text: 'Careful. Kotha rakam enemies... archers, mages. Organized ga unnaru.', emo: 'determined' },
    { who: 'arjun', text: 'Army pampinchadu ante... vaadu mana valla scared ani.', emo: 'determined' },
    { who: 'kiran', text: 'Leda manalni serious ga teesukuntunnadu ani.', emo: 'neutral' },
  ],
  lv12_start: [
    { narrator: 'LEVEL 12 — THE TEMPLE OF ASH' },
    { who: 'kiran', text: 'Ee temple... boodida ayipoyindi. Antha powerful place...', emo: 'sad' },
    { who: 'ravi', text: 'Ikkada records untayi. Vyomasura evaro, ela seal chesaro.', emo: 'determined' },
  ],
  lv12_end: [
    { action: 'camera', zoom: 1.2, t: 1.5 },
    { who: 'ravi', text: 'Dorikindi. Vinandi... "Vyomasura — okappudu ee ooru ni kapadina guardian."', emo: 'surprise' },
    { who: 'aditya', text: 'Guardian aa?! Vaadu... vaadu mananu kapadevada?', emo: 'surprise' },
    { who: 'ravi', text: 'Kaani shadow shakti vaadini corrupt chesindi. Rushulu vaadini bandinchalsi vachindi.', emo: 'sad' },
    { who: 'kiran', text: 'Ante manam fight chestunnadi... oka fallen protector tho.', emo: 'sad' },
  ],
  lv13_start: [
    { narrator: 'LEVEL 13 — THE FOREST ROAD' },
    { who: 'aditya', text: 'Forgotten shrine forest lo undi. Akkada seal ki source untundi.', emo: 'determined' },
    { who: 'arjun', text: 'Forest. Night time. Monsters. Em scene ra idi.', emo: 'worry' },
    { who: 'ravi', text: 'Statistically speaking, nuvve ekkuva sound chestunnav ikkada.', emo: 'neutral' },
  ],
  lv14_start: [
    { narrator: 'LEVEL 14 — THE FORGOTTEN SHRINE' },
    { who: 'kiran', text: 'Ee shrine... inka veligipotundi. Shadow touch cheyyaledu ikkada.', emo: 'surprise' },
  ],
  lv14_end: [
    { action: 'fx', fx: 'divineSpark' },
    { narrator: 'The shrine speaks in silence — visions of the first sealing.' },
    { who: 'ravi', text: 'Ardham ayyindi... Vighnesha shakti tho ne seal chesaru. Anduke manaki ee powers.', emo: 'determined' },
    { who: 'ravi', text: 'Manam random ga select avvaledu. Ee nela... mana friendship ni nammindi.', emo: 'determined' },
    { who: 'arjun', text: 'Friendship ni namminda...? Bro nenu emotional aipotunna.', emo: 'relief' },
    { who: 'aditya', text: 'Ganapati mana venakala unnadu ra. Munduku.', emo: 'determined' },
  ],
  lv15_start: [
    { narrator: 'LEVEL 15 — THE FALLEN GUARDIAN' },
    { action: 'fx', fx: 'lowRumble' },
    { who: 'kiran', text: 'Aagandi... nela vanukutundi...', emo: 'worry' },
    { action: 'fx', fx: 'bossIntro' },
    { who: 'ravi', text: 'Temple statue... adi... adi kadulutundi. Corrupt ayipoyindi!', emo: 'fear' },
    { who: 'aditya', text: 'Formation! Kiran mundu, Ravi venakala. IDI MANA FIRST REAL FIGHT!', emo: 'determined' },
  ],
  lv15_end: [
    { who: 'kiran', text: 'Aa guardian... last lo daani kallu... normal ayyayi. Thank you annattu chusindi.', emo: 'sad' },
    { who: 'ravi', text: 'Guys. Idi oka corrupted statue matrame. Vyomasura direct ga vaste...', emo: 'worry' },
    { who: 'aditya', text: 'Vaadu vastadu. Manam ready ga undali.', emo: 'determined' },
  ],
  lv16_start: [
    { action: 'img', img: 'cine_confront', t: 4.5, zoomFrom: 1.05, zoomTo: 1.16, panFrom: 0.4, panTo: 0.6 },
    { narrator: 'LEVEL 16 — FIRST CONFRONTATION' },
    { action: 'fx', fx: 'vyoAppear' },
    { who: VYO, text: 'Naluguru pillalu... devuni chinna sparks pattukuni... naa mundu nilabaddaru.', emo: 'neutral' },
    { who: 'aditya', text: 'Ee ooru ni vadileyyi. Idi last warning.', emo: 'angry' },
    { who: VYO, text: 'Meeru rakshinchalanukuntunna ee ooru... already naa shadow lo undi.', emo: 'neutral' },
    { who: 'aditya', text: 'Memu naluguram unna varaku... nuvvu gelavavu.', emo: 'determined' },
    { who: VYO, text: 'Friendship meeda nammakam aa?', emo: 'neutral' },
    { action: 'wait', t: 1.2 },
    { who: VYO, text: 'Let us see how long it survives.', emo: 'neutral' },
    { action: 'imgClear' },
  ],
  lv16_defeat: [
    { action: 'fx', fx: 'flashPurple' },
    { action: 'fx', fx: 'shake' },
    { action: 'img', img: 'cine_defeat', t: 4, zoomFrom: 1.0, zoomTo: 1.1 },
    { narrator: 'One strike. That was all it took.' },
    { action: 'emote', who: 'aditya', emo: 'pain' },
    { who: VYO, text: 'Mee divine protection... entha thin ga undo chusara?', emo: 'neutral' },
    { action: 'fx', fx: 'powerShatter' },
    { who: 'arjun', text: 'Naa power... POWER POYINDI RA...!', emo: 'fear' },
    { who: 'kiran', text: 'Levu... leva... kadalataniki kuda...', emo: 'pain' },
    { who: VYO, text: 'Intiki vellandi, pillalu. Final night varaku bathakandi.', emo: 'neutral' },
    { action: 'fx', fx: 'vyoVanish' },
    { action: 'wait', t: 1.5 },
    { narrator: 'For the first time since childhood... the four friends had nothing to say.' },
    { action: 'imgClear' },
    { action: 'title', text: 'PHASE 3\nTHE FINAL NIGHT' },
  ],

  // ================= PHASE 3 =================
  lv17_start: [
    { narrator: 'LEVEL 17 — THE SILENT TOWN' },
    { action: 'fx', fx: 'silence' },
    { action: 'img', img: 'cine_silent_town', t: 4.5, zoomFrom: 1.0, zoomTo: 1.08, panFrom: 0.3, panTo: 0.7 },
    { who: 'arjun', text: '...', emo: 'sad' },
    { who: 'kiran', text: 'Evaru levu. Streets khali. Sound kuda ledu.', emo: 'sad' },
    { who: 'aditya', text: 'Naa valle. Nenu andarini fight ki teesukellanu... powers poyayi...', emo: 'sad' },
    { who: 'kiran', text: 'Aapu. Nuvvu mammalni teesukellav ani kaadu. Manam vellam. Kalisi.', emo: 'determined' },
    { who: 'ravi', text: 'Shrine lo chusam kada — powers friendship nunchi vachayi. Fear valla poyayi. So...', emo: 'determined' },
    { who: 'arjun', text: 'So malli kaliste... malli vastayi. Simple math.', emo: 'determined' },
    { action: 'imgClear' },
  ],
  lv18_start: [
    { narrator: 'LEVEL 18 — THE FOUR PATHS' },
    { who: 'ravi', text: 'Old temple ki four paths unnayi. Okko path oka test laga design chesaru.', emo: 'neutral' },
    { who: 'aditya', text: 'Viduipoyi veldam. Okkokkaru okko dari. Temple center lo kaluddam.', emo: 'determined' },
    { who: 'arjun', text: 'Solo mission... okay okay. Hero entry practice chesukunta.', emo: 'happy' },
    { who: 'kiran', text: 'Jagratha ra. Andaram malli kalavali. Promise cheyyandi.', emo: 'worry' },
    { who: 'aditya', text: 'Promise.', emo: 'determined' },
  ],
  lv18_end: [
    { who: 'arjun', text: 'ANDARU OK NA?! Nenu okate chinna scream chesa lopala.', emo: 'relief' },
    { who: 'kiran', text: 'Andaram unnaam. Promise nilabettam.', emo: 'relief' },
  ],
  lv19_start: [
    { narrator: 'LEVEL 19 — THE RISE' },
    { who: 'ravi', text: 'Ee sanctum... first seal chesina place. Ikkade powers restore avvali.', emo: 'determined' },
  ],
  lv19_rise: [
    { action: 'fx', fx: 'divineSpark' },
    { action: 'camera', zoom: 1.2, t: 2 },
    { action: 'img', img: 'cine_rise', t: 4.2, zoomFrom: 1.1, zoomTo: 1.0 },
    { narrator: 'Four hands join above the ancient altar. Four hearts refuse to give up.' },
    { who: 'aditya', text: 'Bhayam tho kaadu... nammakam tho.', emo: 'determined' },
    { who: 'kiran', text: 'Okkariki okaram.', emo: 'determined' },
    { who: 'arjun', text: 'Eppatiki.', emo: 'determined' },
    { who: 'ravi', text: 'Data confirmed. Manam ready.', emo: 'determined' },
    { action: 'fx', fx: 'powerRestore' },
    { narrator: 'The divine light returns — brighter than before. VIGHNESHA SHAKTI: AWAKENED.' },
    { action: 'imgClear' },
  ],
  lv20_start: [
    { narrator: 'LEVEL 20 — THE DEMON CITADEL' },
    { who: 'arjun', text: 'Vaadu... vaadu town center lo CITADEL kattadu?! Overnight?!', emo: 'surprise' },
    { who: 'ravi', text: 'Floating rocks. Elite guards. Vaadu manam radam expect chestunnadu.', emo: 'determined' },
    { who: 'aditya', text: 'Disappoint cheyyoddu ra. Padandi.', emo: 'determined' },
  ],
  lv21_start: [
    { narrator: 'LEVEL 21 — THE ARMY OF SHADOWS' },
    { who: 'kiran', text: 'Army motham mana meedaki vastundi...', emo: 'determined' },
    { who: 'aditya', text: 'Manam naluguram. Vaallu vandala mandi. Fair fight kaadu...', emo: 'determined' },
    { who: 'arjun', text: '...vaallaki. Hahaha! RANDI RA!!', emo: 'joy' },
  ],
  lv22_start: [
    { narrator: 'LEVEL 22 — THE FINAL GATE' },
    { who: 'ravi', text: 'Gate ki four divine symbols. Okko symbol ki okko power kavali.', emo: 'determined' },
    { who: 'aditya', text: 'Naluguram... andari shakti okkate ayite... gate open avutundi.', emo: 'determined' },
  ],
  lv22_end: [
    { action: 'fx', fx: 'gateOpen' },
    { narrator: 'Four symbols. Four friends. The final gate opens.' },
    { who: 'kiran', text: 'Ee darwaja daatithe... venakki radam undadu emo.', emo: 'worry' },
    { who: 'arjun', text: 'Venakki enduku ra? Mana town mundu undi.', emo: 'determined' },
  ],
  lv23_start: [
    { narrator: 'LEVEL 23 — THE VILLAIN\'S DOMAIN' },
    { action: 'fx', fx: 'silence' },
    { who: VYO, text: 'Vachara. Chivariki.', emo: 'neutral' },
    { who: 'aditya', text: 'Nee history telusu maaku, Vyomasura. Nuvvu guardian vi. Okappudu.', emo: 'determined' },
    { action: 'wait', t: 1 },
    { who: VYO, text: '...Guardian. Avunu. Veyyi samvatsaralu nenu ee ooru ni kapadanu.', emo: 'neutral' },
    { who: VYO, text: 'Kaani shadow vachinappudu... janalu nannu vadilesaru. Nannu bandhinchi marchipoyaru.', emo: 'neutral' },
    { who: 'kiran', text: 'Vaallu bhayapaddaru. Tappu chesaru. Kaani ee generation... memu nee shatruvulam kaadu.', emo: 'sad' },
    { who: VYO, text: 'Late ayindi. Shadow nenu. Nenu shadow. Inka em migalledu.', emo: 'neutral' },
    { who: 'aditya', text: 'Appudu memu aa shadow ni odistam. Nee kosam kuda.', emo: 'determined' },
  ],
  lv24_start: [
    { narrator: 'LEVEL 24 — THE LAST NIGHT' },
    { action: 'fx', fx: 'bossIntro' },
    { who: VYO, text: 'Randi, pillalu. Mee festival... naa moksham... ee raatri decide avutundi.', emo: 'neutral' },
    { who: 'aditya', text: 'Naluguram. Okkate manasu. GANAPATI BAPPA...', emo: 'determined' },
    { who: 'arjun', text: 'MORYA!!', emo: 'determined' },
  ],
  lv24_stage4: [
    { action: 'fx', fx: 'flashPurple' },
    { who: VYO, text: 'ENDUKU... PADIPOVATLEDU MEERU?!', emo: 'angry' },
    { who: 'kiran', text: 'Endukante memu okkallam kaadu.', emo: 'determined' },
    { action: 'fx', fx: 'combinePower' },
    { narrator: 'Four golden lights become one.' },
  ],
  finale: [
    { action: 'fx', fx: 'sealRestore' },
    { action: 'wait', t: 1 },
    { narrator: 'The shadow lifts from Vyomasura like ash in the wind...' },
    { who: VYO, text: '...velugu. Entha kaalam ayindi... velugu chusi.', emo: 'neutral' },
    { who: 'aditya', text: 'Nee duty ayipoyindi, Guardian. Rest teesuko. Ee ooru ni memu chuskuntam.', emo: 'relief' },
    { who: VYO, text: 'Naluguru pillalu... okka nammakam. Bahusa... adi chalu.', emo: 'neutral' },
    { action: 'fx', fx: 'vyoFade' },
    { action: 'wait', t: 2 },
    { action: 'fx', fx: 'dawnBreak' },
    { action: 'img', img: 'cine_finale', t: 5, zoomFrom: 1.12, zoomTo: 1.0, panFrom: 0.55, panTo: 0.45 },
    { narrator: 'The storm dissolves. The festival lights blink awake, one by one. People return.' },
    { action: 'wait', t: 1 },
    { who: 'kiran', text: 'Manam gelicham.', emo: 'relief' },
    { who: 'ravi', text: 'Manam kaadu.', emo: 'relief' },
    { action: 'face', who: 'ravi', dir: -1 },
    { who: 'ravi', text: 'Manam kalisi gelicham.', emo: 'happy' },
    { action: 'emote', who: 'aditya', emo: 'happy' },
    { action: 'wait', t: 0.8 },
    { who: 'arjun', text: 'Okay... ippudu festival continue cheddama?', emo: 'joy' },
    { action: 'emote', who: 'kiran', emo: 'joy' },
    { action: 'emote', who: 'ravi', emo: 'joy' },
    { action: 'emote', who: 'aditya', emo: 'joy' },
    { narrator: 'Everyone laughs. The sun rises over a town that stood together.' },
    { action: 'fx', fx: 'sunrise' },
    { action: 'imgClear' },
    { action: 'title', text: 'GANAPATI BAPPA MORYA' },
  ],
};

// clean accidental non-ascii artefact lines (safety)
for (const k in CINEMATICS) {
  CINEMATICS[k] = CINEMATICS[k].filter(s => !(s.text && /[\u0C00-\u0C7F\u0900-\u097F]/.test(s.text)));
}

// ---------------- COMPANION BARKS ----------------
const BARKS = {
  combat: {
    aditya: ['Nenu cover chestha, munduku!', 'Vaallani aapali!', 'Formation lo undandi!'],
    arjun: ['Ha! Slow ga unnaru ra meeru!', 'Catch me first!', 'Ee speed ki match avvagalara?!'],
    ravi: ['Left side, two more!', 'Pattern gamaninchandi!', 'Cover teesuko, fool!'],
    kiran: ['Naa venakala undandi!', 'Veellu na meeda try cheyyani!', 'Nenu unna varaku evaru padaru!'],
  },
  idle: {
    aditya: ['Andaru okay na?', 'Konchem munduku veldam.', 'Jaagratha ga randi.'],
    arjun: ['Idi ayipoyaka full meals ra. Full. Meals.', 'Naa sandals lo raayi paddindi...', 'Background music bagundi kada?'],
    ravi: ['Interesting... ee architecture chala old.', 'Energy readings strange ga unnayi ikkada.', 'Silence. Good for thinking.'],
    kiran: ['Amma valla intlo andaru safe ga unnaru anta.', 'Ee streets malli navvutayi ra.', 'Nemmadiga. Steady ga.'],
  },
  down: {
    aditya: ['Nenu... okkasari... aagali...', 'Padipoyanu ra...'],
    arjun: ['Bro... chinna break... please...', 'Ouch ouch ouch...'],
    ravi: ['Miscalculation... naa side nundi...', 'Glasses... glasses ekkada...'],
    kiran: ['Inka... aypoledu...', 'Konchem time ivvandi...'],
  },
  revive: {
    aditya: ['Malli vachanu. Thanks ra.', 'Ganapati inka naatho unnadu!'],
    arjun: ['Round 2 ra! Ippudu serious!', 'Okay ippudu naaku kopam vachindi.'],
    ravi: ['Recalibrated. Continue.', 'Thanks. Ippudu strategy marchudam.'],
    kiran: ['Malli nilabaddanu. Randi.', 'Naa vantu inka ayipoledu.'],
  },
};

// NPC gossip per phase
const NPC_LINES = {
  phase1: [
    ['Ammayi', 'Idol repu vastundi anta! Entha peddaido chudali!'],
    ['Uncle', 'Ee pillalu pandal super ga chestunnaru!'],
    ['Ammamma', 'Deeviinchandi babu... Ganapati mee andariki manchi cheyyali.'],
    ['Pillodu', 'Anna! Naaku kuda laddu kavali!'],
    ['Shopkeeper', 'Marigolds fresh ga unnayi! Teesukondi teesukondi!'],
  ],
  phase2: [
    ['Uncle', 'Maa family safe ga undali... please help cheyyandi...'],
    ['Ammayi', 'Aa shadows maa veedhi lo ki vachayi... andaru parigettaru...'],
    ['Pillodu', 'Anna... naaku bhayam ga undi...'],
  ],
  phase3: [
    ['Old Priest', 'Naluguru... prophecy nijam ayindi. Vellandi. Ooru mee chetullo undi.'],
  ],
};
