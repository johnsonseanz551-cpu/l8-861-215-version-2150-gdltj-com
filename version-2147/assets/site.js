(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMobileMenu() {
    var button = $("[data-mobile-toggle]");
    var panel = $("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHeroCarousel() {
    var carousel = $("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = $all("[data-hero-slide]", carousel);
    var previous = $("[data-hero-prev]", carousel);
    var next = $("[data-hero-next]", carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCardFilters() {
    var form = $("[data-card-filter]");
    var cards = $all("[data-movie-card]");
    var count = $("[data-filter-count]");

    if (!form || !cards.length) {
      return;
    }

    var keyword = $("[data-filter-keyword]", form);
    var year = $("[data-filter-year]", form);
    var genre = $("[data-filter-genre]", form);

    function update() {
      var keywordValue = keyword ? keyword.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var genreValue = genre ? genre.value.toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matchKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
        var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchGenre = !genreValue || (card.getAttribute("data-genre") || "").toLowerCase().indexOf(genreValue) !== -1;
        var matched = matchKeyword && matchYear && matchGenre;

        card.classList.toggle("hidden-by-filter", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("reset", function () {
      window.setTimeout(update, 0);
    });
    update();
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || "")
      .split(/[,，、/|;；\s]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(function (tag) {
        return '<span class="movie-card__tag">' + escapeHtml(tag) + '</span>';
      })
      .join("");

    return '' +
      '<article class="movie-card" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags) + '">' +
        '<a class="movie-card__poster" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="movie-card__badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="movie-card__type">' + escapeHtml(movie.type) + '</span>' +
          '<span class="movie-card__play">▶</span>' +
        '</a>' +
        '<div class="movie-card__body">' +
          '<h3 class="movie-card__title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<div class="movie-card__meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '<p class="movie-card__summary">' + escapeHtml(movie.one_line) + '</p>' +
          '<div class="movie-card__tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var root = $("[data-search-results]");
    var input = $("[data-search-page-input]");
    var note = $("[data-search-note]");

    if (!root || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      var value = String(query || "").trim().toLowerCase();
      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags,
          movie.one_line,
          movie.category
        ].join(" ").toLowerCase();

        return !value || haystack.indexOf(value) !== -1;
      });

      if (note) {
        note.textContent = value ? '搜索“' + query + '”，找到 ' + results.length + ' 部影片' : '展示全部 ' + results.length + ' 部影片，可输入关键词筛选';
      }

      if (!results.length) {
        root.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试其他片名、年份、地区或类型。</div>';
        return;
      }

      root.innerHTML = results.map(movieCardTemplate).join("");
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }

    render(initialQuery);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroCarousel();
    initCardFilters();
    initSearchPage();
  });
})();
