(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    if (prev) {
      prev.addEventListener('click', function () {
        stopHero();
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        stopHero();
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stopHero();
        showSlide(index);
        startHero();
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var searchInput = document.querySelector('[data-filter-search]');
  var categorySelect = document.querySelector('[data-filter-category]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var resetButton = document.querySelector('[data-filter-reset]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    var category = normalize(categorySelect ? categorySelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre')
      ].join(' '));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesCategory = !category || cardCategory === category;
      var matchesType = !type || cardType.indexOf(type) !== -1;

      card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesCategory && matchesType));
    });
  }

  if (cards.length && (searchInput || categorySelect || typeSelect)) {
    ['input', 'change'].forEach(function (eventName) {
      if (searchInput) {
        searchInput.addEventListener(eventName, applyFilters);
      }

      if (categorySelect) {
        categorySelect.addEventListener(eventName, applyFilters);
      }

      if (typeSelect) {
        typeSelect.addEventListener(eventName, applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }

        if (categorySelect) {
          categorySelect.value = '';
        }

        if (typeSelect) {
          typeSelect.value = '';
        }

        applyFilters();
      });
    }

    applyFilters();
  }

  window.initPlayer = function (playbackUrl) {
    var video = document.querySelector('[data-player-video]');
    var layer = document.querySelector('[data-player-layer]');
    var button = document.querySelector('[data-player-button]');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !playbackUrl) {
      return;
    }

    function loadVideo() {
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playbackUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(playbackUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = playbackUrl;
        }

        loaded = true;
      }
    }

    function beginPlay() {
      loadVideo();
      video.setAttribute('controls', 'controls');

      if (layer) {
        layer.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', beginPlay);
    }

    if (layer) {
      layer.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        beginPlay();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
})();
