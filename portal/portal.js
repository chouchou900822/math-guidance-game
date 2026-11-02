/* 数学冒险乐园 — 在卡片上显示两个游戏存在本机的进度 */
(function () {
  'use strict';

  /* 只读不写；键名和字段对应两个游戏各自的 js/data/store.js */
  var GAMES = {
    mp: { key: 'multiplication-planet-v1', place: '颗星球', unit: '颗星', finale: 'station', finaleName: '1024 号空间站' },
    df: { key: 'division-forest-v1', place: '座树屋', unit: '颗松果', finale: 'harvest', finaleName: '1024 丰收节' }
  };

  function load(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var data = raw ? JSON.parse(raw) : null;
      return data && typeof data === 'object' ? data : null;
    } catch (err) {
      /* 隐私模式或存档损坏：当作还没开始 */
      return null;
    }
  }

  function count(value) {
    var n = Math.floor(Number(value));
    return n > 0 ? n : 0;
  }

  function summarize(data, game) {
    var stars = data && data.tableStars && typeof data.tableStars === 'object' ? data.tableStars : {};
    var ratings = [];
    for (var t = 1; t <= 9; t += 1) ratings.push(Math.min(3, count(stars[t])));
    var finale = data ? data[game.finale] : null;
    return {
      ratings: ratings,
      lit: ratings.filter(function (r) { return r >= 1; }).length,
      balance: data ? Math.max(0, count(data.stars) - count(data.spent)) : 0,
      started: !!data && (count(data.plays) > 0 || ratings.some(function (r) { return r > 0; })),
      cleared: !!(finale && finale.cleared === true)
    };
  }

  function render(el, game, s) {
    var dots = s.ratings.map(function (r) {
      return '<i class="' + (r >= 3 ? 'is-full' : r >= 1 ? 'is-lit' : '') + '"></i>';
    }).join('');
    var text = s.started
      ? '已点亮 <b>' + s.lit + '</b> / 9 ' + game.place + ' · 可用 <b>' + s.balance + '</b> ' + game.unit
      : '还没开始，进去闯第一关吧';
    el.innerHTML = '<span class="pg-dots" aria-hidden="true">' + dots + '</span>' +
      '<span class="pg-text">' + text + '</span>' +
      (s.cleared ? '<span class="pg-badge">已通关 ' + game.finaleName + '</span>' : '');
    el.hidden = false;
  }

  function refresh() {
    var cards = document.querySelectorAll('[data-game]');
    for (var i = 0; i < cards.length; i += 1) {
      var game = GAMES[cards[i].getAttribute('data-game')];
      var el = cards[i].querySelector('[data-progress]');
      if (game && el) render(el, game, summarize(load(game.key), game));
    }
  }

  refresh();

  /* 从游戏里按浏览器「返回」回来时，页面可能是从缓存直接恢复的，要重读一次 */
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) refresh();
  });
  window.addEventListener('storage', refresh);
})();
