(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const menuToggle = qs('[data-menu-toggle]');
  const mobileMenu = qs('[data-mobile-menu]');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  qsa('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = qs('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  const hero = qs('[data-hero]');
  if (hero) {
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    const prev = qs('[data-hero-prev]', hero);
    const next = qs('[data-hero-next]', hero);
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const restart = () => {
      if (timer) window.clearInterval(timer);
      start();
    };

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        restart();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    show(0);
    start();
  }

  qsa('[data-filter-input]').forEach((input) => {
    const targetSelector = input.getAttribute('data-filter-input');
    const cards = qsa(targetSelector || '.movie-card');
    const empty = qs('[data-empty-state]');
    const filter = () => {
      const value = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const text = `${card.getAttribute('data-title') || ''} ${card.getAttribute('data-tags') || ''}`.toLowerCase();
        const matched = !value || text.includes(value);
        card.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    };
    input.addEventListener('input', filter);
    filter();
  });

  const searchResults = qs('[data-search-results]');
  if (searchResults && window.SITE_MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const input = qs('[data-search-page-input]');
    const title = qs('[data-search-title]');
    if (input) input.value = q;
    const source = window.SITE_MOVIES;
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const pool = words.length ? source.filter((item) => {
      const haystack = `${item.title} ${item.genre} ${item.tags} ${item.region} ${item.year} ${item.description}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    }) : source.slice(0, 48);
    if (title) title.textContent = q ? `“${q}”的搜索结果` : '热门影片推荐';
    searchResults.innerHTML = pool.slice(0, 120).map((item) => `
      <a class="movie-card" href="${item.url}" data-title="${item.title}" data-tags="${item.genre} ${item.tags} ${item.region} ${item.year}">
        <span class="poster-wrap">
          <img src="${item.cover}" alt="${item.title}" loading="lazy">
          <span class="poster-badge">${item.year}</span>
        </span>
        <span class="card-content">
          <strong>${item.title}</strong>
          <em>${item.description}</em>
          <span class="card-meta">
            <span>${item.region}</span>
            <span>${item.genre}</span>
          </span>
        </span>
      </a>
    `).join('');
    const empty = qs('[data-empty-state]');
    if (empty) empty.classList.toggle('is-visible', pool.length === 0);
  }

  qsa('[data-player]').forEach((box) => {
    const video = qs('video', box);
    const cover = qs('[data-play-button]', box);
    const streamUrl = box.getAttribute('data-stream');
    let started = false;
    let hls = null;

    const play = () => {
      if (!video || !streamUrl) return;
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      if (cover) cover.classList.add('is-hidden');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    };

    if (cover) cover.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (!started || video.paused) play();
    });
    window.addEventListener('pagehide', () => {
      if (hls) hls.destroy();
    });
  });
})();
