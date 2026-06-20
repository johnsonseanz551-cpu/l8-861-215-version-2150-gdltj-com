(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function bindNavigation() {
        var button = qs('.menu-toggle');
        var menu = qs('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function bindSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input', form);
                var query = input ? input.value.trim() : '';
                var url = 'search.html';
                if (query) {
                    url += '?q=' + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function bindHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function bindInlineFilters() {
        var input = qs('[data-inline-search]');
        var cards = qsa('[data-movie-card]');
        var empty = qs('[data-empty-state]');
        if (!cards.length) {
            return;
        }
        var buttons = qsa('[data-filter]');
        var activeFilter = 'all';
        function apply() {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var category = card.getAttribute('data-category') || '';
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilter = activeFilter === 'all' || category === activeFilter;
                var show = matchedQuery && matchedFilter;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }
        if (input) {
            input.addEventListener('input', apply);
            var trigger = input.parentElement ? input.parentElement.querySelector('button') : null;
            if (trigger) {
                trigger.addEventListener('click', apply);
            }
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        apply();
    }

    function getVideoUrl(video) {
        var source = video ? video.querySelector('source') : null;
        return source ? source.src : '';
    }

    function initVideo(video) {
        if (!video || video.getAttribute('data-ready') === '1') {
            return;
        }
        var url = getVideoUrl(video);
        if (!url) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        }
        video.setAttribute('data-ready', '1');
    }

    function bindPlayers() {
        qsa('[data-player-shell]').forEach(function (shell) {
            var video = qs('video', shell);
            var button = qs('[data-play-button]', shell);
            if (!video) {
                return;
            }
            initVideo(video);
            function play() {
                initVideo(video);
                var action = video.play();
                if (action && action.catch) {
                    action.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('playing', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindNavigation();
        bindSearchForms();
        bindHero();
        bindInlineFilters();
        bindPlayers();
    });
})();
