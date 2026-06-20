(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-nav-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, position) {
      slide.classList.toggle('is-active', position === heroIndex);
    });

    dots.forEach(function (dot, position) {
      dot.classList.toggle('is-active', position === heroIndex);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        startHero();
      });
    }

    startHero();
  }

  var searchInput = document.getElementById('movieSearch');
  var regionFilter = document.getElementById('regionFilter');
  var typeFilter = document.getElementById('typeFilter');
  var yearFilter = document.getElementById('yearFilter');
  var filterCount = document.getElementById('filterCount');
  var emptyState = document.getElementById('emptyState');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var region = normalize(regionFilter && regionFilter.value);
    var type = normalize(typeFilter && typeFilter.value);
    var year = normalize(yearFilter && yearFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && normalize(card.getAttribute('data-region')) !== region) {
        matched = false;
      }

      if (type && normalize(card.getAttribute('data-type')) !== type) {
        matched = false;
      }

      if (year && normalize(card.getAttribute('data-year')) !== year) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (filterCount) {
      filterCount.textContent = visible ? '匹配 ' + visible + ' 部' : '无匹配';
    }

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();

function setupMoviePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  var layer = document.querySelector('[data-player-layer="' + videoId + '"]');
  var hls = null;
  var loaded = false;

  if (!video || !sourceUrl) {
    return;
  }

  function bindSource() {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = sourceUrl;
    return Promise.resolve();
  }

  function playVideo() {
    bindSource().then(function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  if (layer) {
    layer.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (!loaded) {
      playVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
