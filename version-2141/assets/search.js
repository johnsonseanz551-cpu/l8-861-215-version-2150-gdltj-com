(function () {
    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function render(results) {
        var root = document.querySelector('[data-search-results]');
        if (!root) {
            return;
        }

        if (!results.length) {
            root.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
            return;
        }

        root.innerHTML = results.map(function (item) {
            return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
                '<div class="poster-wrap"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '"><span class="badge">' + escapeHtml(item.category) + '</span></div>' +
                '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div></div></a>';
        }).join('');
    }

    function run() {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        var input = document.querySelector('[data-search-box]');
        var list = window.SEARCH_MOVIES || [];

        if (input) {
            input.value = initial;
        }

        function apply() {
            var query = normalize(input ? input.value : initial);
            var results = list.filter(function (item) {
                var text = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.genre,
                    item.category,
                    (item.tags || []).join(' '),
                    item.oneLine
                ].join(' '));
                return !query || text.indexOf(query) !== -1;
            }).slice(0, 120);
            render(results);
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        apply();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
}());
