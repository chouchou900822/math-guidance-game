/* 乘法星球 — 首页视图 */
(function () {
  'use strict';

  var S = window.MPStore;
  var UI = window.MPUI;

  var PLANET_COLORS = [
    ['#5a74ff', '#2b4bf2'],
    ['#ff7a5e', '#ff4d2e'],
    ['#ffd62e', '#f0a400'],
    ['#3ed9b2', '#00be8c'],
    ['#a99bff', '#6c5ce7'],
    ['#7fd0ff', '#1e8fe0'],
    ['#ffa8c8', '#f4508c'],
    ['#ffc46b', '#f08a1e'],
    ['#8fe3f5', '#22b3d6']
  ];

  var STAR_PATH = 'M12 2.6l2.9 6.05 6.66.86-4.9 4.7 1.26 6.63L12 17.6l-5.92 3.24 1.26-6.63-4.9-4.7 6.66-.86z';
  var SPARK_PATH = 'M12 1.6l2.5 7.9 7.9 2.5-7.9 2.5-2.5 7.9-2.5-7.9L1.6 12l7.9-2.5z';

  function heroArt(skin) {
    var found = window.MPEgg ? window.MPEgg.found() : 0;
    var all = window.MPEgg ? window.MPEgg.total() : 10;
    return '<div class="hero-art">' +
      '<div class="hero-stage" id="hero-stage" tabindex="0" role="button" ' +
        'aria-label="点一下，看' + skin.name + '的彩蛋；移动指针可以让它转向">' +
        '<span class="orbit orbit-a" aria-hidden="true"><i class="orbit-dot"></i></span>' +
        '<span class="orbit orbit-b" aria-hidden="true"></span>' +
        '<canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>' +
        '<svg class="hero-smile" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="' + STAR_PATH + '" fill="#ffd62e" stroke="#17131c" stroke-width=".9" stroke-linejoin="round"/>' +
          '<circle cx="9.5" cy="11.1" r="1.15" fill="#17131c"/>' +
          '<circle cx="14.5" cy="11.1" r="1.15" fill="#17131c"/>' +
          '<path d="M9.9 14.2q2.1 1.9 4.2 0" fill="none" stroke="#17131c" stroke-width="1" stroke-linecap="round"/>' +
        '</svg>' +
        '<svg class="hero-spark spark-a" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="' + SPARK_PATH + '" fill="#cfc6ff" stroke="#17131c" stroke-width="1.4" stroke-linejoin="round"/>' +
        '</svg>' +
        '<svg class="hero-spark spark-b" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="' + SPARK_PATH + '" fill="#ffd62e" stroke="#17131c" stroke-width="1.4" stroke-linejoin="round"/>' +
        '</svg>' +
        '<span class="hero-sticker sticker-a" aria-hidden="true">3 × 3 = 9</span>' +
        '<span class="hero-sticker sticker-b" aria-hidden="true">6 × 7 = 42</span>' +
      '</div>' +
      '<p class="hero-hint" aria-hidden="true">' +
        '<span><i class="hint-tap"></i>轻点问好</span>' +
        '<span><i class="hint-hold"></i>长按唤醒</span>' +
        '<span><i class="hint-turn"></i>拖动转一转</span>' +
      '</p>' +
      '<button type="button" class="skin-chip" data-action="shop" style="--skin:' + skin.palette.atmo + '">' +
        '<span class="skin-chip-dot" aria-hidden="true"></span>' +
        '<span class="skin-chip-name">当前皮肤 · ' + skin.name + '</span>' +
        '<span class="skin-chip-egg' + (found >= all ? ' is-full' : '') + '">彩蛋 ' +
          found + '/' + all + '</span>' +
        '<span class="skin-chip-go">换皮肤' + UI.icon('arrow', 13) + '</span>' +
      '</button>' +
    '</div>';
  }

  function planetCard(table, rating) {
    var color = PLANET_COLORS[table - 1];
    return '<button type="button" class="planet-card" data-action="learn-table" data-table="' + table +
      '" aria-label="' + table + ' 的乘法表，已获得 ' + rating + ' 颗星，点击开始学习">' +
      '<span class="planet-orb" style="--c1:' + color[0] + ';--c2:' + color[1] + '">' + table + '</span>' +
      '<span class="planet-label">' + table + ' 的表</span>' +
      '<span class="planet-stars" aria-hidden="true">' + UI.stars3(rating) + '</span>' +
      '</button>';
  }

  function scopeBtns(active, scopes) {
    return Object.keys(scopes).map(function (key) {
      var on = active === key;
      return '<button type="button" class="scope-btn' + (on ? ' is-active' : '') + '" data-action="scope" data-scope="' +
        key + '" aria-pressed="' + on + '">' + scopes[key].label + '</button>';
    }).join('');
  }

  function stationArt() {
    return '<svg viewBox="0 0 120 104" role="presentation">' +
      '<ellipse cx="60" cy="50" rx="52" ry="20" fill="none" stroke="currentColor" stroke-width="1.3" ' +
        'stroke-dasharray="3 6" opacity=".32"/>' +
      '<g>' +
        '<path d="M6 37h26v26H6z" fill="var(--sl-panel)" stroke="currentColor" stroke-width="2.2"/>' +
        '<path d="M11 37v26M17 37v26M23 37v26M6 45.7h26M6 54.3h26" stroke="currentColor" stroke-width="1" opacity=".4"/>' +
        '<path d="M88 37h26v26H88z" fill="var(--sl-panel)" stroke="currentColor" stroke-width="2.2"/>' +
        '<path d="M93 37v26M99 37v26M105 37v26M88 45.7h26M88 54.3h26" stroke="currentColor" stroke-width="1" opacity=".4"/>' +
      '</g>' +
      '<path d="M32 50h9M79 50h9" stroke="currentColor" stroke-width="2.4"/>' +
      '<circle cx="60" cy="50" r="20" fill="var(--sl-core)" stroke="currentColor" stroke-width="2.6"/>' +
      '<circle cx="60" cy="50" r="14.6" fill="none" stroke="currentColor" stroke-width="1" opacity=".32" ' +
        'stroke-dasharray="2 4"/>' +
      '<text x="60" y="55" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-size="12.5" ' +
        'font-weight="900" fill="var(--sl-ink)">1024</text>' +
      '<path d="M60 30V20" stroke="currentColor" stroke-width="2"/>' +
      '<circle class="sl-beacon" cx="60" cy="17" r="3.4" fill="var(--sl-beacon)" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M52 13.5a12 12 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".5"/>' +
    '</svg>';
  }

  function stationCard() {
    var perfect = S.perfectTables();
    var open = S.stationUnlocked();
    var cleared = S.stationCleared();
    var cls = 'station-card' + (open ? ' is-open' : ' is-locked') + (cleared ? ' is-cleared' : '');
    var dots = '';
    for (var t = 1; t <= 9; t += 1) {
      dots += '<i class="' + (S.tableStar(t) >= 3 ? 'is-on' : '') + '"></i>';
    }

    var side;
    if (cleared) {
      side = '<span class="sl-go">' + UI.icon('check', 14) + '已通关</span>' +
        '<span class="sl-hint">再玩一次</span>';
    } else if (open) {
      side = '<span class="sl-go">进入终局' + UI.icon('arrow', 14) + '</span>' +
        '<span class="sl-hint">十次翻倍 · 约 2 分钟</span>';
    } else {
      side = '<span class="sl-lock">' + UI.icon('lock', 13) + '满星 <b>' + perfect + '</b> / 9</span>' +
        '<span class="sl-dots" aria-hidden="true">' + dots + '</span>' +
        '<span class="sl-hint">还差 ' + (9 - perfect) + ' 张表</span>';
    }

    var desc = open
      ? '九颗星球的能量都到齐了。从 1 开始翻倍十次，走到 1024。'
      : '九张表全部三星后开放。点开一颗星球，把这张表练到 3 星。';

    return '<div class="station-launch">' +
      '<button type="button" class="' + cls + '" data-action="station">' +
        '<span class="sl-art" aria-hidden="true">' + stationArt() + '</span>' +
        '<span class="sl-body">' +
          '<span class="sl-kicker">终局 · 第 10 个目的地</span>' +
          '<b class="sl-title">1024 号空间站</b>' +
          '<span class="sl-desc">' + desc + '</span>' +
        '</span>' +
        '<span class="sl-side">' + side + '</span>' +
      '</button>' +
    '</div>';
  }

  function dailyCard() {
    var d = S.dailyState();
    var t = window.MPDaily.today();
    var count = window.MPDaily.COUNT;

    var copy = d.done
      ? '<span class="dc-kicker">每日挑战 · 今天已完成</span>' +
        '<b class="dc-title">答对 ' + d.score + ' / ' + count + ' 题</b>' +
        '<p class="dc-sub">明天 0 点换一套新题，连续天数会接着算。</p>'
      : '<span class="dc-kicker">每日挑战 · 每天一套新题</span>' +
        '<b class="dc-title">今天的 ' + count + ' 道题</b>' +
        '<p class="dc-sub">1–9 表混合，首次完成额外 +5 颗星。</p>';

    var streak = d.streak > 0
      ? '<span class="dc-streak">' + UI.icon('flame', 13) + '连续 <b>' + d.streak + '</b> 天</span>'
      : '<span class="dc-streak is-first">从今天开始</span>';

    var button = d.done
      ? '<button type="button" class="btn" data-action="daily">再练一次</button>'
      : '<button type="button" class="btn btn-primary" data-action="daily">开始挑战' + UI.icon('arrow') + '</button>';

    return '<section class="daily-card' + (d.done ? ' is-done' : '') + '">' +
      '<div class="dc-date" aria-hidden="true">' +
        '<b>' + t.day + '</b>' +
        '<span>' + t.monthLabel + '</span>' +
        '<i>' + t.weekday + '</i>' +
        (d.done ? '<span class="dc-check">' + UI.icon('check', 13) + '</span>' : '') +
      '</div>' +
      '<div class="dc-body">' + copy +
        '<div class="dc-meta">' + streak +
          '<span class="dc-note">' + (d.total ? '累计 ' + d.total + ' 天' : '每天一次') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="dc-action">' + button + '</div>' +
    '</section>';
  }

  function awardsCard() {
    var items = window.MPAwards.all();
    var total = items.length;
    var done = items.filter(function (item) { return item.done; }).length;
    var rest = items.filter(function (item) { return !item.done; });
    rest.sort(function (a, b) { return b.p - a.p; });
    var next = rest[0] || null;
    var mini = items.slice(0, 3).map(function (item) {
      return window.MPAwards.medal(item.badge, item.done, 38);
    }).join('');

    return '<button type="button" class="awards-card" data-action="awards">' +
      '<span class="ac-medals" aria-hidden="true">' + mini + '</span>' +
      '<span class="ac-body">' +
        '<span class="ac-kicker">奖章墙</span>' +
        '<b class="ac-count">' + done + '<small>/ ' + total + ' 枚</small></b>' +
        '<span class="ac-meter"><i style="width:' + Math.round(total ? done / total * 100 : 0) + '%"></i></span>' +
        '<span class="ac-next">' + (next ? '下一枚 · ' + next.badge.name : '全部收集完成') + '</span>' +
      '</span>' +
      '<span class="ac-arrow" aria-hidden="true">' + UI.icon('arrow', 16) + '</span>' +
    '</button>';
  }

  function view(state, scopes) {
    var data = S.get();
    var skin = window.MPSkins.equipped();
    var planets = '';
    for (var t = 1; t <= 9; t += 1) {
      planets += planetCard(t, S.tableStar(t));
    }

    return '<section class="screen home">' +
      '<div class="hero">' +
        '<div class="hero-copy">' +
          '<span class="eyebrow"><span class="dot"></span>九九乘法 · 每天 10 分钟 · 终点 1024</span>' +
          '<h1 class="hero-title">' +
            '<span class="line">背 <em class="mark">45</em> 句口诀</span>' +
            '<span class="line">点亮 <em class="mark">9</em> 颗星球</span>' +
          '</h1>' +
          '<p class="hero-lede">每颗星球是一张乘法表。先用点阵看懂<b>「几个几」</b>，再闯关收星星 —— ' +
            '攒下的星星能换新星球；九张表全部满星，还会打开第 10 个目的地：1024 号空间站。</p>' +
          '<div class="hero-actions">' +
            '<button type="button" class="btn btn-primary" data-action="start">开始闯关' + UI.icon('arrow') + '</button>' +
            '<button type="button" class="btn" data-action="learn-table" data-table="' + state.table + '">先看口诀</button>' +
          '</div>' +
          '<div class="scope-row">' +
            '<span class="scope-label">闯关范围</span>' +
            '<div class="scope" role="group" aria-label="选择闯关范围">' + scopeBtns(state.scope, scopes) + '</div>' +
          '</div>' +
        '</div>' +
        heroArt(skin) +
      '</div>' +

      '<div class="today-row">' + dailyCard() + awardsCard() + '</div>' +

      '<div class="map-section">' +
        '<div class="section-head">' +
          '<h2>点亮你的乘法星球</h2>' +
          '<p>9 张表 · 45 句口诀 · 每张表最多 3 颗星</p>' +
        '</div>' +
        '<div class="planet-grid">' + planets + '</div>' +
        stationCard() +
        '<div class="map-foot">' +
          '<span>已点亮 <b>' + S.litTables() + '</b> / 9 颗星球 · 可用 <b>' + S.balance() + '</b> 颗星</span>' +
          '<span class="map-links">' +
            '<button type="button" class="link-btn" data-action="shop">星球皮肤馆' + UI.icon('arrow', 14) + '</button>' +
            '<button type="button" class="link-btn" data-action="grid">完整九九表' + UI.icon('arrow', 14) + '</button>' +
            '<button type="button" class="link-btn" data-action="report">家长报告' + UI.icon('arrow', 14) + '</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function mount(root) {
    var canvas = root.querySelector('#hero-canvas');
    var stage = root.querySelector('#hero-stage');
    if (!canvas) return;
    var skin = window.MPSkins.equipped();
    var ctl = window.MPPlanet.attach(canvas, skin, { speed: 0.25 });
    if (stage && window.MPEgg) window.MPEgg.attach(stage, canvas, skin, ctl, { guide: false });
  }

  window.MPHome = { view: view, mount: mount, colors: PLANET_COLORS };
})();
