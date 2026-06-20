(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-nav-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var slides = qsa('[data-hero-slide]');
    var thumbs = qsa('[data-hero-thumb]');
    var current = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });

        thumbs.forEach(function (thumb, i) {
            thumb.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }

        timer = setInterval(function () {
            setHero(current + 1);
        }, 5200);
    }

    if (slides.length) {
        setHero(0);
        startHero();

        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                setHero(index);
                startHero();
            });
        });
    }

    qsa('[data-filter-panel]').forEach(function (panel) {
        var input = qs('[data-filter-input]', panel);
        var chips = qsa('[data-filter-chip]', panel);
        var targetSelector = panel.getAttribute('data-target');
        var cards = qsa(targetSelector);
        var filter = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function update() {
            var query = normalize(input ? input.value : '');

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));

                var genreText = normalize([
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));

                var okQuery = !query || text.indexOf(query) !== -1;
                var okFilter = filter === 'all' || genreText.indexOf(normalize(filter)) !== -1;
                card.style.display = okQuery && okFilter ? '' : 'none';
            });
        }

        if (input) {
            input.addEventListener('input', update);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                filter = chip.getAttribute('data-filter') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                update();
            });
        });
    });
}());
