(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.querySelector('[data-search-input]');
  var title = document.querySelector('[data-search-title]');
  var list = document.querySelector('[data-search-results]');
  var data = window.SearchIndex || [];

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function render(items) {
    if (!list) {
      return;
    }

    if (!query) {
      list.innerHTML = '<div class="empty-state"><p>输入片名、地区、类型、年份或标签，即可查找相关影视内容。</p></div>';
      return;
    }

    if (!items.length) {
      list.innerHTML = '<div class="empty-state"><p>没有找到匹配内容。</p><a class="empty-link" href="./categories.html">浏览全部分类</a></div>';
      return;
    }

    list.innerHTML = items.map(function (item) {
      return '<article class="rank-row">' +
        '<a href="./' + escapeHtml(item.file) + '">' +
          '<span class="rank-num">▶</span>' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="rank-info">' +
            '<strong>' + escapeHtml(item.title) + '</strong>' +
            '<small>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</small>' +
            '<em>' + escapeHtml(item.oneLine) + '</em>' +
          '</span>' +
          '<b>立即观看</b>' +
        '</a>' +
      '</article>';
    }).join('');
  }

  var normalizedQuery = normalize(query);
  var results = data.filter(function (item) {
    var text = normalize([
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.category,
      item.tags,
      item.oneLine
    ].join(' '));
    return normalizedQuery && text.indexOf(normalizedQuery) !== -1;
  }).slice(0, 120);

  if (title) {
    title.textContent = query ? '搜索：' + query : '搜索影视';
  }

  render(results);
})();
