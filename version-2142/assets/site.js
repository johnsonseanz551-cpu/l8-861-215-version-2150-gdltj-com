(function () {
  var button = document.querySelector('.menu-button');
  var nav = document.querySelector('.mobile-nav');

  if (button && nav) {
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-hero-panel]'));
  var index = 0;

  function showHero(next) {
    if (!slides.length) {
      return;
    }

    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === index);
    });
    panels.forEach(function (panel, current) {
      panel.hidden = current !== index;
    });
  }

  dots.forEach(function (dot, current) {
    dot.addEventListener('click', function () {
      showHero(current);
    });
  });

  if (slides.length > 1) {
    showHero(0);
    setInterval(function () {
      showHero(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterYear = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = normalize(filterInput && filterInput.value);
    var type = normalize(filterType && filterType.value);
    var year = normalize(filterYear && filterYear.value);

    cards.forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedType = !type || normalize(card.dataset.type).indexOf(type) !== -1 || normalize(card.dataset.genre).indexOf(type) !== -1;
      var matchedYear = !year || normalize(card.dataset.year) === year;
      card.style.display = matchedText && matchedType && matchedYear ? '' : 'none';
    });
  }

  [filterInput, filterType, filterYear].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });
})();
