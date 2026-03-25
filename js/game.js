
(() => {
  // ── Utilities ──
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const escapeAttr = (str) => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  // ── DOM References ──
  const dom = {
    participantsInput: document.getElementById('participantsInput'),
    buildBtn: document.getElementById('buildBtn'),
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    track: document.getElementById('track'),
    winnerBox: document.getElementById('winnerBox'),
    statusBadge: document.getElementById('statusBadge'),
    participantCount: document.getElementById('participantCount'),
    timerBadge: document.getElementById('timerBadge'),
    racePage: document.getElementById('racePage'),
    characterPage: document.getElementById('characterPage'),
    showRacePageBtn: document.getElementById('showRacePage'),
    showCharacterPageBtn: document.getElementById('showCharacterPage'),
    characterGrid: document.getElementById('characterGrid'),
    winnerPopup: document.getElementById('winnerPopup'),
    winnerRoleLabel: document.getElementById('winnerRoleLabel'),
    winnerNameText: document.getElementById('winnerNameText'),
    winnerQuoteText: document.getElementById('winnerQuoteText'),
    winnerCloseBtn: document.getElementById('winnerCloseBtn'),
    winnerAvatar: document.getElementById('winnerAvatar'),
  };

  // ── Constants ──
  const getTrackHeight = () => {
    const w = window.innerWidth;
    if (w <= 400) return 280;
    if (w <= 600) return 320;
    if (w <= 900) return 380;
    if (w >= 1900) return 560;
    return 500;
  };
  const TRACK = {
    get HEIGHT() { return getTrackHeight(); },
    SAFE_TOP: 58,
    SAFE_BOTTOM: 20,
    MIN_LANE_HEIGHT: 12,
    WORLD_WIDTH: 8300,
  };

  const RACE = {
    CAMERA_LEAD: 220,
    START_X: 16,
    FINISH_RIGHT_OFFSET: 48,
    FINISH_LINE_WIDTH: 18,
    RUNNER_CENTER_OFFSET: 35,
    TARGET_SECONDS: 30,
    RUNNER_HALF_HEIGHT: 41,
  };

  const FATIGUE = {
    MAX: 10,
    PENALTY_MS: 8000,
    ADRENALINE_MS: 5000,
  };

  const TIMING = {
    SPEED_CHANGE_MIN_MS: 700,
    SPEED_CHANGE_MAX_MS: 1600,
    CHAT_DELAY_MS: 5000,
    CHAT_VISIBLE_MS: 2000,
    CHAT_MAX_PER_RACER: 8,
    CHAT_MAX_VISIBLE: 5,
    CHAT_START_MIN_MS: 1000,
    CHAT_START_MAX_MS: 10000,
  };

  const SPEEDS = {
    slow:         { pixelsPerSecond: 170, fatigueDelta: 2,  animFactor: 0.72 },
    slightlySlow: { pixelsPerSecond: 205, fatigueDelta: 1,  animFactor: 0.82 },
    medium:       { pixelsPerSecond: 245, fatigueDelta: -1, animFactor: 1 },
    slightlyFast: { pixelsPerSecond: 285, fatigueDelta: -1, animFactor: 1.12 },
    fast:         { pixelsPerSecond: 325, fatigueDelta: -2, animFactor: 1.25 },
    veryFast:     { pixelsPerSecond: 370, fatigueDelta: -3, animFactor: 1.42 },
  };

  const SPEED_NAMES = Object.keys(SPEEDS);

  const CHARACTERS = [
    'president', 'doctor', 'minister', 'commoner', 'beggar',
  ];

  const CHARACTER_IMAGES = {
    president: ['assets/image/president-1.webp', 'assets/image/president-2.png'],
    doctor: ['assets/image/dokter-1.webp'],
    minister: ['assets/image/mentri-1.png', 'assets/image/mentri-2.png'],
    commoner: ['assets/image/commoner-1.webp'],
    beggar: ['assets/image/beggar-1.webp'],
  };

  const CHARACTER_SOUNDS = {
    president: ['assets/sound/president/president-1.mp3', 'assets/sound/president/president-2.mp3'],
    doctor: ['assets/sound/doctor/doctor-1.mp3', 'assets/sound/doctor/doctor-2.mp3'],
    minister: ['assets/sound/minister/minister-1.mp3', 'assets/sound/minister/minister-2.mp3'],
    commoner: ['assets/sound/commoner/commoner-1.mp3', 'assets/sound/commoner/commoner-2.mp3', 'assets/sound/commoner/commoner-3.mp3'],
    beggar: ['assets/sound/beggar/beggar-1.mp3', 'assets/sound/beggar/beggar-2.mp3', 'assets/sound/beggar/beggar-3.mp3'],
  };

  // ── Character Data ──
  const CHARACTER_INFO = {
    police: { title: 'Polisi', description: 'Katanya pelayan masyarakat, tapi aura "kalau tidak ada pelicin urusan jadi licin" masih sering jadi bahan bercanda rakyat.' },
    doctor: { title: 'Dokter', description: 'Muka tenang, tulisan resep seperti sandi perang, dan pasien tetap mengangguk seolah mengerti semuanya.' },
    minister: { title: 'Mentri', description: 'Jago rapat, jago janji, dan kadang lebih cepat bikin slogan daripada bikin hasil.' },
    president: { title: 'Presiden', description: 'Tampil rapi, penuh wibawa, dan setiap keputusan selalu disambut setengah tepuk tangan setengah debat warung kopi.' },
    soldier: { title: 'Tentara', description: 'Langkah tegap, tatapan tajam, dan vibe "siap komandan" yang bikin orang otomatis pengin berdiri lebih lurus.' },
    beggar: { title: 'Pengemis', description: 'Modal wajah memelas, strategi senyum tipis, dan kadang lebih lihai baca belas kasihan daripada sales baca target.' },
    commoner: { title: 'Orang Biasa', description: 'Pahlawan negara paling realistis: kerja, bayar tagihan, ngeluh sebentar, lalu besok diulang lagi.' },
    employee: { title: 'Karyawan', description: 'Datang pagi, pulang petang, lalu pura-pura kuat saat dengar kalimat sakral: "tolong bantu sedikit ya".' },
    'civil-servant': { title: 'Pegawai Negeri Sipil', description: 'Seragam rapi, map di tangan, dan stereotype "pelan tapi pasti... atau pelan saja" yang sudah terlalu lama hidup di kepala rakyat.' },
    astronaut: { title: 'Astronot', description: 'Profesi yang bikin macet bumi terasa ringan, karena masalahnya sudah pindah level ke luar angkasa.' },
    businessman: { title: 'Pengusaha', description: 'Senyumnya ramah, jasnya mahal, dan otaknya otomatis menghitung untung bahkan sebelum duduk.' },
    nurse: { title: 'Suster', description: 'Suara lembut, tangan cekatan, dan kemampuan menenangkan pasien panik lebih ampuh daripada motivator dadakan.' },
    punk: { title: 'Anak Punk', description: 'Tampil berantakan buat seni, anti aturan buat gaya, tapi kadang justru paling jujur soal hidup.' },
    musician: { title: 'Musician', description: 'Kalau belum terkenal dibilang hobi, kalau sudah laku baru semua orang mendadak bilang dari dulu sudah yakin—lengkap dengan gitar andalannya.' },
    chef: { title: 'Koki', description: 'Topi tinggi, celemek rapi, dan aura "semua bisa diatur asal dapur jangan ramai sendiri".' },
    carpenter: { title: 'Tukang Kayu', description: 'Baju kerja sederhana, kapak di tangan, dan semangat bikin segala hal jadi kokoh.' },
    engineer: { title: 'Engineer', description: 'Helm proyek, vibe hitung-hitungan, dan muka yang kelihatan sedang debug dunia nyata.' },
    sailor: { title: 'Pelaut', description: 'Pakaian laut, topi kecil, dan gaya orang yang akrab dengan ombak dan horizon.' },
    gambler: { title: 'Tukang Judi', description: 'Tatapan nekat, kartu di tangan, dan aura "sekali lagi pasti balik modal" yang terlalu sering dipakai.' },
    gardener: { title: 'Tukang Kebun', description: 'Topi kebun, warna hijau tanah, dan pembawaan orang yang lebih akrab dengan tanaman daripada rapat.' },
  };

  const CHARACTER_QUOTES = {
    police: ['Pelicin mana, woi?', 'Seragam bersih, hati?', 'Hukum tumpul ke atas.', 'Tilang dulu, salah?', 'Jaga rakyat? Jaga dompet.', 'Surat lengkap? Bohong.', 'Melayani? Yang bener.', 'Pangkat naik, moral?'],
    doctor: ['Tagihan lebih mematikan.', 'Resep? Saya juga bingung.', 'Pasien nunggu, duit duluan.', 'Obat mahal, sakit murah.', 'Keluhan banyak, peduli?', 'Diagnosa asal, tagih pasti.', 'Sehat itu mahal.', 'Rawat? Bayar dulu.', 'Stetoskop cuma aksesoris.', 'Hipokrates? Siapa tuh.', 'Operasi sukses, dompet mati.', 'Obat generik? Nggak elit.', 'Pasien banyak, empati kosong.', 'Gelar panjang, resep pendek.', 'Sakit dikit, cek lab semua.', 'Dokter Google lebih jujur.'],
    minister: ['Janji doang, kerja?', 'Rapat lagi, hasil?', 'Slogan dulu, rakyat nanti.', 'Anggaran habis ke mana?', 'Kursi empuk, otak kosong.', 'Rakyat sabar, saya sibuk.', 'Program? Tinggal nama doang.', 'Laporan bagus, bukti?', 'Studi banding ke Eropa lagi.', 'Dana aspirasi, aspirasi siapa?', 'Sidang tidur, gaji terjaga.', 'Mobil dinas buat mudik.', 'Rakyat demo, saya meeting.', 'Kebijakan copy-paste.', 'Mic mati pas ditanya data.', 'Proyek mangkrak, cuan lancar.'],
    president: ['Hidup pria solo!', 'Antek asing minggir!', 'Wibawa nomor satu.', 'Rakyat? Sabar dulu ya.', 'Saya yang paling benar.', 'Kritik? Tangkap aja.', 'Pencitraan level dewa.', 'Visi misi? Baca sendiri.', 'Oposisi itu khianat.', 'Satu periode kurang, dong.', 'Istana bukan penjara, enak.', 'Demo? Suruh pulang aja.', 'Media dikontrol, aman.', 'Kok berani kritik saya?', 'Titipan siapa lagi nih?', 'Kabinet isinya kasir.'],
    soldier: ['Maju, jangan nangis!', 'Disiplin atau mati.', 'Perintah tidak dibantah.', 'Kuat atau pulang.', 'Medan tempur biasa.', 'Pengecut minggir sana.', 'Peluru bukan mainan.', 'Nyali kecil, pulang sana.'],
    beggar: ['Receh dong, pelit!', 'Miskin bukan dosa.', 'Sedekah nggak rugi.', 'Nasib, bukan pilihan.', 'Muka memelas, strategi.', 'Kaya belum tentu bahagia.', 'Lapar tapi lari.', 'Duit siapa jatuh?', 'WiFi gratis, hidup mewah.', 'Kardus itu rumah minimalis.', 'Pajak? Nggak kenal.', 'Pengamen gagal, jadi ini.', 'Aset nol, utang nol, bebas.', 'Makan hari ini aja syukur.', 'Dermawan kok pelit banget.', 'Tangan di bawah, harga diri?'],
    commoner: ['Gaji habis tanggal 10.', 'Cicilan nggak libur.', 'Hidup berat, terbiasa.', 'Kerja, tidur, ulang.', 'Capek? Biasa aja.', 'Tagihan lebih setia.', 'Mimpi gratis, hidup mahal.', 'Lembur tanpa bonus.', 'THR buat bayar utang.', 'Promo diskon, tetap mahal.', 'Naik gaji, naik harga juga.', 'Libur nasional tetap kerja.', 'Idup cuma bayar tagihan.', 'Tabungan? Dompet ketawa.', 'Healing cuma bisa nonton IG.', 'Pensiun? Kayaknya nggak.'],
    employee: ['Kerja tim? Kerja gue.', 'Bos santai, gue mati.', 'Gaji kecil, tuntutan gede.', 'Resign kapan ya?', 'Lembur lagi, bonus?', 'Meeting doang, kerja kapan?', 'Deadline tadi pagi.', 'Slip gaji bikin nangis.'],
    'civil-servant': ['Stempel dulu, urusan nanti.', 'Pelan tapi pasti?', 'Pensiunan lebih semangat.', 'Kerja santai, gaji pasti.', 'Berkas numpuk, santai.', 'Jam pulang paling hapal.', 'Rapel lebih ditunggu.', 'Reformasi? Besok aja.'],
    astronaut: ['Bumi kecil, ego besar.', 'Gravitasi cuma alasan.', 'Kalian ribet amat.', 'Dari sini lucu.', 'Orbit lebih damai.', 'Roket lebih cepat.', 'Bumi penuh drama.', 'Luar angkasa, bebas macet.'],
    businessman: ['Untung dulu, moral nanti.', 'Karyawan cuma aset.', 'Deal haram? Tergantung nominal.', 'Pajak? Kreatif aja.', 'Uang bicara segalanya.', 'Rugi itu aib.', 'Meeting cuma formalitas.', 'PHK itu efisiensi.'],
    nurse: ['Dokter dapat nama, saya?', 'Sabar itu profesi saya.', 'Pasien rewel, biasa.', 'Shift malam lagi.', 'Senyum palsu, capek asli.', 'Gaji suster, beban dokter.', 'Infus lebih setia.', 'Jaga malam, siapa peduli?'],
    punk: ['Aturan? Nggak kenal.', 'Sistem itu sampah.', 'Chaos itu indah.', 'Mohawk bukan gaya, prinsip.', 'Normal itu membosankan.', 'Pemberontak sejati.', 'Masyarakat terlalu jinak.', 'Bebas atau mati.'],
    musician: ['Nada fals, tetap jalan.', 'Kalah? Bilang encore.', 'Gitar lebih setia.', 'Royalti mana, bang?', 'Fans banyak, duit?', 'Label cuma parasit.', 'Manggung hujan, fee?', 'Chord asal, vibe pas.'],
    chef: ['Bumbu rahasia: MSG.', 'Gosong? Sebut karamelisasi.', 'Dapur panas, ego panas.', 'Bintang lima? Bintang satu.', 'Resep dicuri, biasa.', 'Pelanggan sok tahu.', 'Rasa lidah saya, titik.', 'Masak asal, plating bagus.'],
    carpenter: ['Paku dulu, pikir nanti.', 'Kayu mahal, upah murah.', 'Tangan kapalan, dompet tipis.', 'Ukur sekali, potong salah.', 'Mandor cuma nunjuk.', 'Bangunan kokoh, punggung remuk.', 'Gergaji lebih jujur.', 'Kerja keras, bayar pas-pasan.'],
    engineer: ['Bug itu fitur.', 'Deploy dulu, fix nanti.', 'Kode saya sempurna.', 'Stackoverflow jawab semua.', 'Deadline? Tambah sprint aja.', 'Testing itu opsional.', 'Dokumentasi buat yang lemah.', 'Rewrite dari nol aja.'],
    sailor: ['Darat membosankan.', 'Ombak bukan masalah.', 'Mabuk laut? Lemah.', 'Laut lebih jujur.', 'Pelabuhan cuma singgah.', 'Badai itu pemanasan.', 'Darat penuh drama.', 'Kapten selalu benar.'],
    gambler: ['All-in, tanpa pikir!', 'Hoki bukan kebetulan.', 'Kalah? Strategi jangka panjang.', 'Meja judi, kantor saya.', 'Modal nekat, untung gede.', 'Bandar juga manusia.', 'Sekali lagi, pasti balik.', 'Rugi itu investasi.'],
    gardener: ['Tanaman lebih nurut.', 'Manusia lebih ribet.', 'Pupuk bukan parfum.', 'Gulma kayak masalah.', 'Sabar kayak tanam padi.', 'Tumbuh pelan, pasti.', 'Bunga nggak PHP.', 'Kebun lebih damai.'],
  };

  const LEADER_QUOTES = {
    police: ['Sirene on, minggir!', 'Belakang, tertib ya.', 'Patroli paling depan.', 'Hukum saya, jalan saya.'],
    doctor: ['Antre di belakang.', 'Kalian sakit semua.', 'Resep: lebih cepat.', 'Diagnosa: kalian payah.', 'Rujukan ke belakang ya.', 'Yang lambat butuh IGD.', 'Gelar saya lebih panjang.', 'Kalian cuma penyakit.'],
    minister: ['Pidato sambil sprint.', 'Jargon menang duluan.', 'Rapat di podium.', 'Rakyat nonton aja.', 'Aspirasi rakyat: saya menang.', 'Anggaran buat kecepatan saya.', 'Yang belakang nggak lobi.', 'Kampanye terbukti, saya depan.'],
    president: ['Barisan belakang, malu!', 'Rakyat, saya duluan.', 'Negara ikut saya.', 'Kritik? Nanti aja.', 'Istana finish duluan.', 'Yang belakang reshuffle semua.', 'Saya presiden, kalian rakyat.', 'Oposisi makin jauh.'],
    soldier: ['Belakang, malu sama seragam!', 'Komandan selalu depan.', 'Pengecut di belakang.', 'Disiplin menang terus.'],
    beggar: ['Miskin tapi pertama!', 'Yang kaya di mana?', 'Receh nanti, podium dulu.', 'Modal nekat, hasilnya?', 'Koin receh buat yang kalah.', 'Ngemis menang, kerja kalah.', 'Kartu ATM? Nggak punya, tapi depan.', 'Yang belakang lebih miskin.'],
    commoner: ['Elite, minggir dong.', 'Gaji kecil, lari kencang.', 'Rakyat jelata memimpin.', 'Cicilan kejar, saya lebih.', 'UMR tapi juara satu.', 'Yang belakang pasti bos.', 'Pajak saya biayain kalian.', 'Rakyat kecil, nyali besar.'],
    employee: ['Burnout tapi juara.', 'Bos mana? Saya depan.', 'KPI: posisi satu.', 'Lembur ada hasilnya.'],
    'civil-servant': ['Pelan katanya? Lihat.', 'Stempel di podium.', 'Pensiunan bisa memimpin.', 'Santai tapi terdepan.'],
    astronaut: ['Kalian jauh banget.', 'Dari orbit, kasihan.', 'Bumi penuh yang lambat.', 'Low gravity, high speed.'],
    businessman: ['Akuisisi jalur depan.', 'ROI: posisi satu.', 'Kalian rugi semua.', 'Margin saya tebal.'],
    nurse: ['Yang panik? Belakang.', 'Suster paling cepat.', 'Infus buat yang lambat.', 'Rawat ego kalian.'],
    punk: ['Depan tanpa izin.', 'Aturan? Saya bikin.', 'Chaos di belakang.', 'Pemberontak nomor satu.'],
    musician: ['Solo di depan.', 'Kalian cuma backing vocal.', 'Nada utama: saya.', 'Encore? Nggak perlu.'],
    chef: ['Kalian masih mentah.', 'Matang duluan, bos.', 'Bumbu rahasia: kecepatan.', 'Dapur saya terdepan.'],
    carpenter: ['Sudah pasang, kalian ukur.', 'Paku posisi satu.', 'Belakang masih amplas.', 'Tukang bisa memimpin.'],
    engineer: ['Deploy duluan, sukses.', 'Bug kalian: lambat.', 'Kode saya jalan.', 'Kalian masih compile.'],
    sailor: ['Kalian mabuk darat.', 'Kapten selalu depan.', 'Horizon milik saya.', 'Laut didominasi.'],
    gambler: ['Jackpot posisi satu!', 'Odds kalian nol.', 'Nekat menang terus.', 'Taruhan saya bayar.'],
    gardener: ['Kalian masih benih.', 'Sudah berbunga duluan.', 'Gulma di belakang.', 'Panen posisi satu.'],
  };

  const WINNER_CHEERS = {
    police: ['Podium diamankan, bubar!', 'Hukum menang, titik.'],
    doctor: ['Diagnosa: kalian payah.', 'Tagihan kemenangan, silakan.', 'Resep juara: kalian nggak mampu beli.', 'Pasien kalah, dokter menang, seperti biasa.'],
    minister: ['Janji terbukti sekali.', 'Laporan: saya juara.', 'Dana kemenangan sudah dianggarkan.', 'Podium ini proyek strategis nasional.'],
    president: ['HIDUP PRIA SOLO!', 'Rakyat, saya menang.', 'Yang kalah silakan dideportasi.', 'Podium milik negara, saya yang pegang.'],
    soldier: ['Misi selesai, finish!', 'Hormat, saya juara.'],
    beggar: ['Miskin menang, gimana?', 'Sedekah buat yang kalah.', 'Trofi ini bisa dijual nggak?', 'Yang kalah tolong transfer receh.'],
    commoner: ['Rakyat jelata juara!', 'Elite makan tuh gengsi.', 'Gaji UMR, trofi nomor satu.', 'Menang tanpa koneksi, bisa tuh.'],
    employee: ['Podium tanpa lembur.', 'Bos, saya resign menang.'],
    'civil-servant': ['Stempel kemenangan, sah.', 'Pelan katanya? Juara.'],
    astronaut: ['Orbit menang, bumi kalah.', 'Gravitasi bukan alasan.'],
    businessman: ['Uang bicara, saya juara.', 'Akuisisi podium, done.'],
    nurse: ['Panik? Saya juara kok.', 'Rawat yang kalah ya.'],
    punk: ['Tanpa izin, juara.', 'Chaos menang, sistem kalah.'],
    musician: ['Encore? Nggak perlu, juara.', 'Nada akhir: saya menang.'],
    chef: ['Lawan gosong, saya matang.', 'Resep juara: kecepatan.'],
    carpenter: ['Paku kemenangan, beres.', 'Kapak bicara, podium saya.'],
    engineer: ['Deploy juara, production ready.', 'Bug kalian: terlalu lambat.'],
    sailor: ['Berlabuh di podium.', 'Lawan karam semua.'],
    gambler: ['All-in bayar, jackpot!', 'Odds saya selalu menang.'],
    gardener: ['Panen podium, subur.', 'Kalian cuma gulma.'],
  };

  const DEFAULT_CHEER = 'Menang, titik.';
  const DEFAULT_QUOTE = 'Gas, mikir nanti.';

  // ── Mutable State ──
  const state = {
    racers: [],
    animationId: null,
    isRacing: false,
    raceStartTime: null,
    elapsedBeforeStop: 0,
    winner: null,
    trackWorld: null,
    pausedAt: null,
  };

  // ── Runner Sprite Markup ──
  const createRunnerMarkup = (role) => [
    '<div class="runner-sprite ', role, '">',
      '<div class="shadow"></div>',
      '<div class="torso-wrap">',
        '<div class="head"></div>',
        '<div class="hair"></div>',
        '<div class="hat"></div>',
        '<div class="body"></div>',
        '<div class="cross"></div>',
        '<div class="stethoscope"></div>',
        '<div class="stethoscope-ear"></div>',
        '<div class="stethoscope-head"></div>',
        '<div class="guitar"></div>',
        '<div class="guitar-neck"></div>',
        '<div class="guitar-head"></div>',
        '<div class="guitar-hole"></div>',
        '<div class="guitar-strings"></div>',
        '<div class="apron"></div>',
        '<div class="tool"></div>',
        '<div class="helmet-band"></div>',
        '<div class="card-mark"></div>',
        '<div class="glove"></div>',
        '<div class="sailor-collar"></div>',
        '<div class="leaf-mark"></div>',
        '<div class="medal"></div>',
        '<div class="badge-mini"></div>',
        '<div class="tie"></div>',
        '<div class="patch"></div>',
        '<div class="tear"></div>',
        '<div class="hole"></div>',
        '<div class="arm left"></div>',
        '<div class="arm right"></div>',
        '<div class="leg left bare"></div>',
        '<div class="leg right bare"></div>',
      '</div>',
    '</div>',
  ].join('');

  // ── BGM ──
  const bgm = new Audio('assets/bgm/run-run-game-bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0.5;

  const bgmFadeTo = (target, duration = 500) => {
    const start = bgm.volume;
    const startTime = performance.now();
    const fade = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      bgm.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  };

  // ── UI Helpers ──
  const setStatus = (text) => { dom.statusBadge.textContent = `Status: ${text}`; };
  const setWinnerText = (text) => { dom.winnerBox.textContent = text; };

  const hideWinnerPopup = () => {
    if (winnerAudio) { winnerAudio.pause(); winnerAudio = null; }
    bgmFadeTo(0.5, 800);
    dom.winnerPopup.classList.remove('show');
  };

  let winnerAudio = null;

  const showWinnerPopup = (racer) => {
    bgmFadeTo(0.1, 400);
    const info = CHARACTER_INFO[racer.role] || { title: racer.role };
    const cheers = WINNER_CHEERS[racer.role] || [DEFAULT_CHEER];
    const images = CHARACTER_IMAGES[racer.role];
    if (images && images.length > 0) {
      dom.winnerAvatar.src = randomFrom(images);
      dom.winnerAvatar.style.display = 'block';
    } else {
      dom.winnerAvatar.style.display = 'none';
    }
    const sounds = CHARACTER_SOUNDS[racer.role];
    if (sounds && sounds.length > 0) {
      if (winnerAudio) { winnerAudio.pause(); winnerAudio = null; }
      winnerAudio = new Audio(randomFrom(sounds));
      winnerAudio.play().catch(() => {});
    }
    dom.winnerRoleLabel.textContent = `Profesi Juara: ${info.title}`;
    dom.winnerNameText.textContent = racer.name;
    dom.winnerQuoteText.textContent = randomFrom(cheers);
    dom.winnerPopup.classList.add('show');
  };

  const formatRaceTime = (ms) => {
    const total = Math.floor(ms / 1000);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const updateTimerBadge = () => {
    const elapsed = state.isRacing && state.raceStartTime !== null
      ? performance.now() - state.raceStartTime
      : state.elapsedBeforeStop;
    dom.timerBadge.textContent = `Waktu: ${formatRaceTime(elapsed)}`;
  };

  const resetTimerBadge = () => {
    state.raceStartTime = null;
    state.elapsedBeforeStop = 0;
    updateTimerBadge();
  };

  const updateAnimDuration = (multiplier) => {
    const safe = clamp(multiplier, 0.65, 1.55);
    document.documentElement.style.setProperty('--run-duration', `${(0.5 / safe).toFixed(3)}s`);
  };

  const stopAnimation = () => {
    if (state.animationId !== null) {
      cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }
  };

  // ── Name Parsing ──
  const parseNames = (text) =>
    text.split('\n').map(n => n.trim()).filter(Boolean).slice(0, 100);

  const getParticipantNames = () =>
    parseNames(dom.participantsInput.value.replace(/\r\n?/g, '\n'));

  // ── Quote Selection ──
  const getQuote = (role, isLeader) => {
    const pool = isLeader
      ? (LEADER_QUOTES[role] || CHARACTER_QUOTES[role])
      : CHARACTER_QUOTES[role];
    return randomFrom(pool || [DEFAULT_QUOTE]);
  };

  // ── Racer State Factory ──
  const createRacer = (name, role, element) => ({
    name,
    role,
    element,
    chatEl: element.querySelector('.chat-bubble'),
    x: RACE.START_X,
    speed: 0,
    fatigue: FATIGUE.MAX,
    speedName: 'medium',
    lastFatigueTickAt: 0,
    nextSpeedDecisionAt: 0,
    nextChatAt: 0,
    chatHideAt: 0,
    chatCount: 0,
    penaltyUntil: 0,
    adrenalineUntil: 0,
    adrenalineUsed: false,
    finished: false,
    place: null,
  });

  const resetRacerState = (racer) => {
    racer.x = RACE.START_X;
    racer.speed = 0;
    racer.fatigue = FATIGUE.MAX;
    racer.speedName = 'medium';
    racer.lastFatigueTickAt = 0;
    racer.nextSpeedDecisionAt = 0;
    racer.penaltyUntil = 0;
    racer.adrenalineUntil = 0;
    racer.adrenalineUsed = false;
    racer.nextChatAt = 0;
    racer.chatHideAt = 0;
    racer.chatCount = 0;
    racer.finished = false;
    racer.place = null;

    if (racer.chatEl) {
      racer.chatEl.textContent = '';
      racer.chatEl.classList.remove('show');
    }

    racer.element.style.left = `${RACE.START_X}px`;
    racer.element.classList.remove('celebrate', 'running', 'fatigued');
  };

  // ── Racer Visual Update ──
  const updateRacerVisuals = (racer, now) => {
    racer.element.classList.toggle('fatigued', now < racer.penaltyUntil);

    if (racer.chatEl) {
      const visible = racer.chatHideAt > now;
      racer.chatEl.classList.toggle('show', visible);
      if (!visible) racer.chatEl.textContent = '';
    }
  };

  // ── Chat System ──
  const countVisibleChats = (now) =>
    state.racers.filter(r => r.chatHideAt > now).length;

  const tryShowChat = (racer, now, isLeader) => {
    if (!racer.chatEl || racer.finished) return;
    if (racer.chatCount >= TIMING.CHAT_MAX_PER_RACER) return;
    if (now < racer.nextChatAt || racer.chatHideAt > now) return;
    if (countVisibleChats(now) >= TIMING.CHAT_MAX_VISIBLE) return;

    racer.chatEl.textContent = getQuote(racer.role, isLeader);
    racer.chatHideAt = now + TIMING.CHAT_VISIBLE_MS;
    racer.chatCount++;
    racer.nextChatAt = now + TIMING.CHAT_DELAY_MS;
  };

  // ── Grass Decoration ──
  const populateGrass = (grassLayer, namesCount, worldWidth) => {
    if (!grassLayer) return;
    grassLayer.innerHTML = '';

    const count = clamp(namesCount * 3, 12, 36);
    const padding = 18;
    const usableH = Math.max(40, TRACK.HEIGHT - TRACK.SAFE_TOP - TRACK.SAFE_BOTTOM - padding * 2);

    for (let i = 0; i < count; i++) {
      const grass = document.createElement('div');
      grass.className = 'grass-clump';
      grass.appendChild(document.createElement('span'));

      const x = Math.floor(Math.random() * Math.max(80, worldWidth - 140)) + 40;
      const y = Math.floor(Math.random() * usableH) + padding;
      const scale = (0.85 + Math.random() * 0.8).toFixed(2);
      const rotate = Math.floor(Math.random() * 24) - 12;

      grass.style.left = `${x}px`;
      grass.style.top = `${y}px`;
      grass.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
      grassLayer.appendChild(grass);
    }

    const pebbleColors = ['#9ca3af', '#6b7280', '#a8a29e', '#78716c', '#b0ada8'];
    const pebbleCount = clamp(Math.floor(namesCount * 1.5), 6, 24);
    for (let i = 0; i < pebbleCount; i++) {
      const pebble = document.createElement('div');
      pebble.className = 'pebble';
      const w = 4 + Math.floor(Math.random() * 6);
      const h = 3 + Math.floor(Math.random() * 4);
      const x = Math.floor(Math.random() * Math.max(80, worldWidth - 140)) + 40;
      const y = Math.floor(Math.random() * usableH) + padding;
      const rotate = Math.floor(Math.random() * 360);
      pebble.style.left = `${x}px`;
      pebble.style.top = `${y}px`;
      pebble.style.width = `${w}px`;
      pebble.style.height = `${h}px`;
      pebble.style.background = randomFrom(pebbleColors);
      pebble.style.transform = `rotate(${rotate}deg)`;
      grassLayer.appendChild(pebble);
    }
  };

  // ── Page Navigation ──
  const switchPage = (page) => {
    const isRace = page === 'race';
    dom.racePage.classList.toggle('active', isRace);
    dom.characterPage.classList.toggle('active', !isRace);
    dom.showRacePageBtn.classList.toggle('active', isRace);
    dom.showCharacterPageBtn.classList.toggle('active', !isRace);
  };

  // ── Character Gallery ──
  const renderCharacterGallery = () => {
    dom.characterGrid.innerHTML = '';
    for (const role of CHARACTERS) {
      const card = document.createElement('div');
      card.className = 'character-card';
      const info = CHARACTER_INFO[role];
      card.innerHTML = `${createRunnerMarkup(role)}<h3>${info.title}</h3><p>${info.description}</p>`;
      dom.characterGrid.appendChild(card);
    }
  };

  // ── Speed & Fatigue Logic ──
  const tryTriggerAdrenaline = (racer, now, remainingMs) => {
    if (racer.finished || racer.adrenalineUsed) return;
    if (remainingMs > 5000 || remainingMs <= 0) return;
    if (Math.random() < 0.0038) {
      racer.adrenalineUsed = true;
      racer.adrenalineUntil = now + FATIGUE.ADRENALINE_MS;
      racer.speedName = 'veryFast';
    }
  };

  const tickFatigue = (racer, now) => {
    if (racer.lastFatigueTickAt === 0) {
      racer.lastFatigueTickAt = now;
      return;
    }

    while (now - racer.lastFatigueTickAt >= 1000) {
      racer.lastFatigueTickAt += 1000;
      if (now < racer.adrenalineUntil) continue;

      const { fatigueDelta } = SPEEDS[racer.speedName];
      racer.fatigue = clamp(racer.fatigue + fatigueDelta, 0, FATIGUE.MAX);

      if (racer.fatigue <= 0) {
        racer.penaltyUntil = now + FATIGUE.PENALTY_MS;
        racer.speedName = 'slow';
        racer.nextSpeedDecisionAt = racer.penaltyUntil;
      }
    }
  };

  const updateSpeed = (racer, now) => {
    if (racer.finished) return;

    if (now < racer.adrenalineUntil) {
      racer.speedName = 'veryFast';
      return;
    }
    if (now < racer.penaltyUntil || racer.fatigue <= 0) {
      racer.speedName = 'slow';
      return;
    }
    if (now < racer.nextSpeedDecisionAt) return;

    racer.speedName = randomFrom(SPEED_NAMES);
    racer.nextSpeedDecisionAt = now + randomBetween(TIMING.SPEED_CHANGE_MIN_MS, TIMING.SPEED_CHANGE_MAX_MS);
  };

  // ── Spectators ──
  const SKIN_TONES = ['#f5d0a9','#e8b88a','#c68e6a','#a0674b','#7a4b32','#f9d6b0'];
  const SHIRT_COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16'];
  const ANIM_CLASSES = ['cheering','waving','jumping','','',''];

  const buildSpectatorRow = (worldWidth, rowClass) => {
    const row = document.createElement('div');
    row.className = `spectator-row ${rowClass}`;
    const spacing = rowClass === 'row-back' ? 16 : rowClass === 'row-mid' ? 18 : 20;
    const count = Math.floor(worldWidth / spacing);
    for (let i = 0; i < count; i++) {
      const skin = randomFrom(SKIN_TONES);
      const shirt = randomFrom(SHIRT_COLORS);
      const anim = randomFrom(ANIM_CLASSES);
      const el = document.createElement('div');
      el.className = `spectator ${anim}`;
      el.style.animationDelay = `${Math.random() * 2}s`;
      el.innerHTML = `
        <div class="spectator-head" style="background:${skin}"></div>
        <div class="spectator-arms" style="background:${skin}"></div>
        <div class="spectator-body" style="background:${shirt}"></div>
      `;
      row.appendChild(el);
    }
    return row;
  };

  const buildSpectatorArea = (worldWidth) => {
    const area = document.createElement('div');
    area.className = 'spectator-area';
    area.appendChild(buildSpectatorRow(worldWidth, 'row-back'));
    area.appendChild(buildSpectatorRow(worldWidth, 'row-mid'));
    area.appendChild(buildSpectatorRow(worldWidth, 'row-front'));
    return area;
  };

  // ── Arena Setup ──
  const buildTrackWorld = () => {
    const trackWorld = document.createElement('div');
    trackWorld.className = 'track-world';

    const grassLayer = document.createElement('div');
    grassLayer.className = 'grass-layer';
    trackWorld.appendChild(grassLayer);

    const finishLine = document.createElement('div');
    finishLine.className = 'finish-line';
    trackWorld.appendChild(finishLine);

    dom.track.innerHTML = '';
    dom.track.appendChild(trackWorld);

    // Add spectator rows inside trackWorld so they scroll with the camera
    const spectators = buildSpectatorArea(TRACK.WORLD_WIDTH);
    trackWorld.insertBefore(spectators, trackWorld.firstChild);

    return { trackWorld, grassLayer, finishLine };
  };

  const buildArena = () => {
    stopAnimation();
    resetTimerBadge();
    state.isRacing = false;
    state.winner = null;

    const worldWidth = TRACK.WORLD_WIDTH;
    const { trackWorld, grassLayer } = buildTrackWorld();
    state.trackWorld = trackWorld;

    const names = getParticipantNames();
    const usableHeight = TRACK.HEIGHT - TRACK.SAFE_TOP - TRACK.SAFE_BOTTOM;
    const laneHeight = names.length > 0
      ? Math.max(TRACK.MIN_LANE_HEIGHT, Math.floor(usableHeight / names.length))
      : 76;

    dom.track.style.setProperty('--world-width', `${worldWidth}px`);
    dom.track.style.setProperty('--lane-height', `${laneHeight}px`);
    dom.track.style.height = `${TRACK.HEIGHT}px`;
    dom.track.style.minHeight = `${TRACK.HEIGHT}px`;
    dom.track.style.setProperty('--track-safe-top', `${TRACK.SAFE_TOP}px`);
    dom.track.style.setProperty('--track-safe-bottom', `${TRACK.SAFE_BOTTOM}px`);
    dom.track.style.setProperty('--runner-scale', '1');
    trackWorld.style.width = `${worldWidth}px`;
    trackWorld.style.height = `${usableHeight}px`;
    dom.participantCount.textContent = `Peserta: ${names.length}`;
    populateGrass(grassLayer, Math.max(1, names.length), worldWidth);

    if (names.length < 2) {
      state.racers = [];
      setStatus('butuh minimal 2 peserta');
      setWinnerText('Masukkan minimal 2 nama peserta.');
      return;
    }

    setStatus('siap');
    setWinnerText('Arena siap. Tekan Mulai Race.');

    // Distribute professions evenly: max ceil(playerCount / professionCount) per profession
    const maxPerRole = Math.ceil(names.length / CHARACTERS.length);
    const rolePool = [];
    const shuffledRoles = [...CHARACTERS].sort(() => Math.random() - 0.5);
    for (const role of shuffledRoles) {
      for (let i = 0; i < maxPerRole; i++) rolePool.push(role);
    }
    // Shuffle the pool and take only what we need
    rolePool.sort(() => Math.random() - 0.5);
    const assignedRoles = rolePool.slice(0, names.length);

    state.racers = names.map((name, index) => {
      const lane = document.createElement('div');
      lane.className = 'lane';
      lane.style.position = 'absolute';
      lane.style.left = '0';
      lane.style.right = '0';
      lane.style.height = '0px';

      const runner = document.createElement('div');
      runner.className = 'runner';
      const role = assignedRoles[index];

      const nameEl = document.createElement('div');
      nameEl.className = 'duck-name';
      nameEl.title = name;
      nameEl.textContent = name;

      const chatEl = document.createElement('div');
      chatEl.className = 'chat-bubble';

      runner.innerHTML = createRunnerMarkup(role);
      runner.appendChild(nameEl);
      runner.appendChild(chatEl);
      lane.appendChild(runner);

      const halfH = RACE.RUNNER_HALF_HEIGHT;
      const maxSpread = usableHeight - halfH * 2;
      const maxLaneSpacing = 76;
      const totalGroupH = names.length <= 1
        ? 0
        : Math.min(maxSpread, (names.length - 1) * maxLaneSpacing);
      const groupStart = (usableHeight - totalGroupH) / 2;
      const laneTop = names.length <= 1
        ? usableHeight / 2
        : groupStart + totalGroupH * (index / (names.length - 1));

      lane.style.top = `${laneTop}px`;
      trackWorld.appendChild(lane);

      const racer = createRacer(name, role, runner);
      updateRacerVisuals(racer, 0);
      return racer;
    });
  };

  // ── Reset Positions ──
  const resetRacePositions = () => {
    resetTimerBadge();
    hideWinnerPopup();

    if (state.trackWorld) state.trackWorld.style.transform = 'translateX(0px)';

    state.racers.forEach(resetRacerState);
    updateAnimDuration(1);
    state.winner = null;

    const hasEnough = state.racers.length >= 2;
    setStatus(hasEnough ? 'siap' : 'butuh minimal 2 peserta');
    setWinnerText(hasEnough ? 'Posisi direset. Tekan Mulai Race.' : 'Masukkan minimal 2 nama peserta.');
  };

  // ── Main Race Loop ──
  const startRace = () => {
    if (state.isRacing) return;
    if (state.racers.length < 2) {
      buildArena();
      if (state.racers.length < 2) return;
    }

    resetRacePositions();
    state.isRacing = true;
    bgm.volume = 0.5;
    bgm.currentTime = 0;
    bgm.play().catch(() => {});
    setStatus('balapan dimulai');
    setWinnerText('Balapan sedang berlangsung...');
    state.raceStartTime = performance.now();
    state.elapsedBeforeStop = 0;
    updateTimerBadge();

    const startTime = state.raceStartTime;
    state.racers.forEach((racer) => {
      racer.element.classList.add('running');
      racer.lastFatigueTickAt = startTime;
      racer.nextSpeedDecisionAt = startTime + randomBetween(400, 1000);
      racer.nextChatAt = startTime + randomBetween(TIMING.CHAT_START_MIN_MS, TIMING.CHAT_START_MAX_MS);
    });

    const trackWorld = state.trackWorld;
    const finishLine = trackWorld.querySelector('.finish-line');
    const worldWidth = trackWorld.offsetWidth;
    const finishLineW = finishLine.offsetWidth || RACE.FINISH_LINE_WIDTH;
    const finishCenter = worldWidth - RACE.FINISH_RIGHT_OFFSET - finishLineW / 2;
    const finishX = Math.max(120, finishCenter - RACE.RUNNER_CENTER_OFFSET);
    let finishedCount = 0;
    let prevNow = startTime;

    const animate = (now) => {
      updateTimerBadge();
      const dt = Math.min(0.05, (now - prevNow) / 1000);
      prevNow = now;
      const elapsedMs = now - startTime;
      const remainingMs = Math.max(0, RACE.TARGET_SECONDS * 1000 - elapsedMs);

      const leaderPos = state.racers.reduce((max, r) => Math.max(max, r.x), 0);

      for (const racer of state.racers) {
        if (racer.finished) continue;

        tryTriggerAdrenaline(racer, now, remainingMs);
        tickFatigue(racer, now);
        updateSpeed(racer, now);

        const isLeader = leaderPos - racer.x <= 12;
        tryShowChat(racer, now, isLeader);

        const activeSpeed = now < racer.adrenalineUntil ? SPEEDS.veryFast : SPEEDS[racer.speedName];
        racer.speed += (activeSpeed.pixelsPerSecond - racer.speed) * 0.16;
        racer.x += racer.speed * dt;
        racer.element.style.left = `${racer.x}px`;
        updateRacerVisuals(racer, now);

        if (!state.winner) updateAnimDuration(activeSpeed.animFactor);

        if (racer.x >= finishX) {
          racer.x = finishX;
          racer.element.style.left = `${finishX}px`;
          racer.finished = true;
          racer.place = ++finishedCount;

          if (!state.winner) {
            state.winner = racer;
            racer.element.classList.add('celebrate');
            setWinnerText(`🏆 Pemenang: ${racer.name}`);
            setStatus('selesai');
            showWinnerPopup(racer);
          }
        }
      }

      const leaderX = state.racers.reduce((max, r) => Math.max(max, r.x), 0);
      const maxCamX = Math.max(0, worldWidth - dom.track.clientWidth);
      const camX = clamp(leaderX - RACE.CAMERA_LEAD, 0, maxCamX);
      trackWorld.style.transform = `translateX(${-camX}px)`;

      if (finishedCount < state.racers.length) {
        state.animationId = requestAnimationFrame(animate);
      } else {
        state.isRacing = false;
        state.animationId = null;
        state.elapsedBeforeStop = performance.now() - startTime;
        updateTimerBadge();
        state.racers.forEach(r => r.element.classList.remove('running'));
        updateAnimDuration(1);
      }
    };

    state.animationId = requestAnimationFrame((first) => {
      prevNow = first;
      animate(first);
    });
  };

  // ── Event Listeners ──
  dom.buildBtn.addEventListener('click', buildArena);
  dom.startBtn.addEventListener('click', startRace);
  dom.resetBtn.addEventListener('click', () => {
    stopAnimation();
    state.isRacing = false;
    bgm.pause();
    bgm.currentTime = 0;
    bgm.volume = 0.5;
    buildArena();
    resetRacePositions();
  });
  dom.showRacePageBtn.addEventListener('click', () => switchPage('race'));
  dom.showCharacterPageBtn.addEventListener('click', () => switchPage('character'));
  dom.winnerCloseBtn.addEventListener('click', hideWinnerPopup);
  dom.winnerPopup.addEventListener('click', (e) => {
    if (e.target === dom.winnerPopup) hideWinnerPopup();
  });
  document.addEventListener('visibilitychange', () => {
    if (!state.isRacing) return;

    if (document.hidden) {
      stopAnimation();
      state.pausedAt = performance.now();
      state.racers.forEach(r => r.element.classList.remove('running'));
      setStatus('dijeda (tab tidak aktif)');
    } else if (state.pausedAt !== null) {
      const pauseDuration = performance.now() - state.pausedAt;
      state.raceStartTime += pauseDuration;
      state.racers.forEach(r => {
        r.lastFatigueTickAt += pauseDuration;
        r.nextSpeedDecisionAt += pauseDuration;
        r.nextChatAt += pauseDuration;
        if (r.chatHideAt > 0) r.chatHideAt += pauseDuration;
        if (r.penaltyUntil > 0) r.penaltyUntil += pauseDuration;
        if (r.adrenalineUntil > 0) r.adrenalineUntil += pauseDuration;
        if (!r.finished) r.element.classList.add('running');
      });
      state.pausedAt = null;
      setStatus('balapan dimulai');

      let prevNow = performance.now();
      const trackWorld = state.trackWorld;
      const worldWidth = trackWorld.offsetWidth;
      const finishLine = trackWorld.querySelector('.finish-line');
      const finishLineW = finishLine.offsetWidth || RACE.FINISH_LINE_WIDTH;
      const finishCenter = worldWidth - RACE.FINISH_RIGHT_OFFSET - finishLineW / 2;
      const finishX = Math.max(120, finishCenter - RACE.RUNNER_CENTER_OFFSET);
      const startTime = state.raceStartTime;
      let finishedCount = state.racers.filter(r => r.finished).length;

      const animate = (now) => {
        updateTimerBadge();
        const dt = Math.min(0.05, (now - prevNow) / 1000);
        prevNow = now;
        const elapsedMs = now - startTime;
        const remainingMs = Math.max(0, RACE.TARGET_SECONDS * 1000 - elapsedMs);
        const leaderPos = state.racers.reduce((max, r) => Math.max(max, r.x), 0);

        for (const racer of state.racers) {
          if (racer.finished) continue;
          tryTriggerAdrenaline(racer, now, remainingMs);
          tickFatigue(racer, now);
          updateSpeed(racer, now);
          const isLeader = leaderPos - racer.x <= 12;
          tryShowChat(racer, now, isLeader);
          const activeSpeed = now < racer.adrenalineUntil ? SPEEDS.veryFast : SPEEDS[racer.speedName];
          racer.speed += (activeSpeed.pixelsPerSecond - racer.speed) * 0.16;
          racer.x += racer.speed * dt;
          racer.element.style.left = `${racer.x}px`;
          updateRacerVisuals(racer, now);
          if (!state.winner) updateAnimDuration(activeSpeed.animFactor);

          if (racer.x >= finishX) {
            racer.x = finishX;
            racer.element.style.left = `${finishX}px`;
            racer.finished = true;
            racer.place = ++finishedCount;
            if (!state.winner) {
              state.winner = racer;
              racer.element.classList.add('celebrate');
              setWinnerText(`\u{1F3C6} Pemenang: ${racer.name}`);
              setStatus('selesai');
              showWinnerPopup(racer);
            }
          }
        }

        const leaderX = state.racers.reduce((max, r) => Math.max(max, r.x), 0);
        const maxCamX = Math.max(0, worldWidth - dom.track.clientWidth);
        const camX = clamp(leaderX - RACE.CAMERA_LEAD, 0, maxCamX);
        trackWorld.style.transform = `translateX(${-camX}px)`;

        if (finishedCount < state.racers.length) {
          state.animationId = requestAnimationFrame(animate);
        } else {
          state.isRacing = false;
          state.animationId = null;
          state.elapsedBeforeStop = performance.now() - startTime;
          updateTimerBadge();
          state.racers.forEach(r => r.element.classList.remove('running'));
          updateAnimDuration(1);
        }
      };

      state.animationId = requestAnimationFrame((first) => {
        prevNow = first;
        animate(first);
      });
    }
  });

  window.addEventListener('resize', () => {
    if (!state.isRacing) {
      state.racers.forEach(r => { r.element.style.left = `${r.x}px`; });
    }
  });

  // ── Init ──
  updateAnimDuration(1);
  renderCharacterGallery();
  buildArena();
})();
