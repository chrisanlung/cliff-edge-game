(() => {
  const images = [
    'assets/image/side-slide/pro-balet.webp',
    'assets/image/side-slide/sawit-ku.webp',
    'assets/image/side-slide/tukang-kayu.webp',
    'assets/image/side-slide/wakit-pejabat.webp',
  ];

  function buildSlideCards(count) {
    // Duplicate images to fill, then double for seamless loop
    const items = [];
    while (items.length < count) {
      for (const src of images) {
        if (items.length < count) items.push(src);
      }
    }
    // Double for infinite seamless scroll
    return [...items, ...items];
  }

  function createCard(src) {
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.innerHTML = `
      <div class="slide-card-inner">
        <img src="${src}" alt="" loading="lazy" />
      </div>
      <div class="slide-card-glow"></div>
      <div class="slide-card-filter"></div>
    `;
    return card;
  }

  function populateSide(container, cardCount, direction) {
    const track = document.createElement('div');
    track.className = 'side-slide-track';
    const cards = buildSlideCards(cardCount);
    for (const src of cards) track.appendChild(createCard(src));
    container.appendChild(track);

    // Wait for images to load, then calc half-height for seamless loop
    requestAnimationFrame(() => {
      setTimeout(() => {
        const halfH = track.scrollHeight / 2;
        const speed = 80; // px per second
        const dur = halfH / speed;
        const name = `slide_${direction}`;
        const dir = direction === 'up' ? `0px, -${halfH}px` : `-${halfH}px, 0px`;
        const style = document.createElement('style');
        style.textContent = `@keyframes ${name} { 0% { transform: translateY(${dir.split(',')[0]}); } 100% { transform: translateY(${dir.split(',')[1].trim()}); } }`;
        document.head.appendChild(style);
        track.style.animation = `${name} ${dur}s linear infinite`;
      }, 300);
    });
  }

  const left = document.getElementById('sideSlideLeft');
  const right = document.getElementById('sideSlideRight');
  populateSide(left, 6, 'up');
  populateSide(right, 6, 'down');
})();
