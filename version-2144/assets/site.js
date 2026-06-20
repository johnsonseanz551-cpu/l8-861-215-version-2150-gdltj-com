(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var yearSelect = scope.querySelector("[data-year-select]");
      var typeSelect = scope.querySelector("[data-type-select]");
      var result = scope.querySelector("[data-result-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (year && cardYear !== year) {
            ok = false;
          }
          if (type && cardType !== type) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = "当前显示 " + visible + " 部";
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });

      update();
    });
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var stream = player.getAttribute("data-stream");
      var loaded = false;
      var hlsInstance = null;

      if (!video || !stream) {
        return;
      }

      function begin() {
        player.classList.add("is-playing");
        if (button) {
          button.setAttribute("aria-hidden", "true");
        }

        if (loaded) {
          video.play().catch(function () {});
          return;
        }
        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            autoStartLoad: true,
            maxBufferLength: 30
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.load();
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          begin();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target.closest("video")) {
          return;
        }
        begin();
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
