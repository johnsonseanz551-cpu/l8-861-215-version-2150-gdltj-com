(function () {
  var menuButton = document.querySelector(".js-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".site-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var search = scope.querySelector("[data-local-search]");
    var type = scope.querySelector("[data-type-filter]");
    var region = scope.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
    var empty = scope.querySelector("[data-empty-state]");

    if (search && search.hasAttribute("data-use-query")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        search.value = q;
      }
    }

    function runFilter() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var t = type ? type.value : "";
      var r = region ? region.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }

        if (t && cardType.indexOf(t) === -1) {
          ok = false;
        }

        if (r && cardRegion.indexOf(r) === -1) {
          ok = false;
        }

        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("hidden", shown !== 0);
      }
    }

    [search, type, region].forEach(function (input) {
      if (input) {
        input.addEventListener("input", runFilter);
        input.addEventListener("change", runFilter);
      }
    });

    runFilter();
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  });
})();

function initPlayer(url) {
  document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("moviePlayer");
    var trigger = document.querySelector("[data-play-trigger]");
    var ready = false;

    if (!video || !url) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        return;
      }

      video.src = url;
    }

    function start() {
      prepare();

      if (trigger) {
        trigger.classList.add("is-hidden");
      }

      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    });
  });
}
