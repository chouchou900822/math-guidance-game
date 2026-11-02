/* 除法森林 — 首页视图 */
(function () {
  'use strict';

  var S = window.DFStore;
  var UI = window.DFUI;
  var D = window.DFData;
  var Art = window.DFArt;

  /* 九家小动物的主色：首页卡片和学习报告共用 */
  var HOUSE_COLORS = [
    ['#e4b483', '#b07a45'],
    ['#ffa77f', '#f06a3c'],
    ['#ffb394', '#e8765a'],
    ['#f3a64e', '#cc7a1f'],
    ['#6fc3f2', '#2f8fd6'],
    ['#a3d064', '#5f9e2c'],
    ['#bb92f2', '#8456d6'],
    ['#ff8796', '#e5404f'],
    ['#62d3bb', '#1fa58a']
  ];

  function heroArt(skin) {
    var found = window.DFEgg.found();
    var all = window.DFEgg.total();
    return '<div class="hero-art">' +
      '<div class="hero-stage tree-stage" id="hero-stage" tabindex="0" role="button" ' +
        'aria-label="' + skin.name + '：轻点摇下一颗果子，长按唤醒这棵树的彩蛋">' +
        window.DFEgg.stage(skin) +
        '<span class="hero-sticker sticker-a" aria-hidden="true">12 ÷ 3 = 4</span>' +
        '<span class="hero-sticker sticker-b" aria-hidden="true">1024 ÷ 2</span>' +
      '</div>' +
      '<p class="hero-hint" aria-hidden="true">' +
        '<span><i class="hint-tap"></i>轻点摇果子</span>' +
        '<span><i class="hint-hold"></i>长按唤醒彩蛋</span>' +
      '</p>' +
      '<button type="button" class="skin-chip" data-action="shop" style="--skin:' + skin.palette.accent + '">' +
        '<span class="skin-chip-dot" aria-hidden="true"></span>' +
        '<span class="skin-chip-name">当前大树 · ' + skin.name + '</span>' +
        '<span class="skin-chip-egg' + (found >= all ? ' is-full' : '') + '">彩蛋 ' + found + '/' + all + '</span>' +
        '<span class="skin-chip-go">换大树' + UI.icon('arrow', 13) + '</span>' +
      '</button>' +
    '</div>';
  }

  function houseCard(table, rating) {
    var f = D.family(table);
    var c = HOUSE_COLORS[table - 1];
    return '<button type="button" class="planet-card house-card" data-action="learn-table" data-table="' + table +
      '" aria-label="÷' + table + ' 的表：' + table + ' 只' + f.animal + '平均分' + f.foodName + '，已获得 ' + rating +
      ' 颗星，点击开始学习">' +
      '<span class="house-orb" style="--c1:' + c[0] + ';--c2:' + c[1] + '">' + Art.animal(f.id, 44) +
        '<i class="house-food" aria-hidden="true">' + Art.food(f.food, 20) + '</i></span>' +
      '<span class="planet-label house-label"><b>÷' + table + '</b> ' + f.animal + '</span>' +
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

  /* 终局入口的小插画：一篮松果和 1024 木牌 */
  function harvestArt() {
    var cones = [[30, 44], [50, 38], [70, 44], [40, 30], [60, 28]].map(function (c) {
      return '<g transform="translate(' + (c[0] - 11) + ' ' + (c[1] - 11) + ') scale(.92)">' + Art.foodInner('pinecone') + '</g>';
    }).join('');
    return '<svg viewBox="0 0 120 104" role="presentation">' +
      '<circle cx="60" cy="52" r="46" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 6" opacity=".35"/>' +
      cones +
      '<path d="M18 52H102L94 86H26Z" fill="#d39a4f" stroke="#1b1f17" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M36 58v24M52 58v26M68 58v26M84 58v24" stroke="#9a6a2e" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="14" y="46" width="92" height="10" rx="5" fill="#b9803c" stroke="#1b1f17" stroke-width="2.4"/>' +
      '<rect x="66" y="10" width="46" height="22" rx="6" fill="#fff6d6" stroke="#1b1f17" stroke-width="2.4"/>' +
      '<text x="89" y="26" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-size="12" ' +
        'font-weight="900" fill="#a86a00">1024</text>' +
    '</svg>';
  }

  function harvestCard() {
    var perfect = S.perfectTables();
    var open = S.harvestUnlocked();
    var cleared = S.harvestCleared();
    var cls = 'harvest-card' + (open ? ' is-open' : ' is-locked') + (cleared ? ' is-cleared' : '');
    var dots = '';
    for (var t = 1; t <= 9; t += 1) {
      dots += '<i class="' + (S.tableStar(t) >= 3 ? 'is-on' : '') + '"></i>';
    }

    var side;
    if (cleared) {
      side = '<span class="hv-go">' + UI.icon('check', 14) + '已通关</span>' +
        '<span class="hv-hint">再分一次</span>';
    } else if (open) {
      side = '<span class="hv-go">进入终局' + UI.icon('arrow', 14) + '</span>' +
        '<span class="hv-hint">十次对半分 · 约 2 分钟</span>';
    } else {
      side = '<span class="hv-lock">' + UI.icon('lock', 13) + '满星 <b>' + perfect + '</b> / 9</span>' +
        '<span class="hv-dots" aria-hidden="true">' + dots + '</span>' +
        '<span class="hv-hint">还差 ' + (9 - perfect) + ' 张表</span>';
    }

    var desc = open
      ? '九家小动物都吃饱啦。1024 颗松果，每次平均分成两份，分 10 次就剩 1。'
      : '九张表全部三星后开放。点开一家小动物，把这张表练到 3 星。';

    return '<div class="harvest-launch">' +
      '<button type="button" class="' + cls + '" data-action="harvest">' +
        '<span class="hv-art" aria-hidden="true">' + harvestArt() + '</span>' +
        '<span class="hv-body">' +
          '<span class="hv-kicker">终局 · 第 10 个目的地</span>' +
          '<b class="hv-title">1024 丰收节</b>' +
          '<span class="hv-desc">' + desc + '</span>' +
        '</span>' +
        '<span class="hv-side">' + side + '</span>' +
      '</button>' +
    '</div>';
  }

  function dailyCard() {
    var d = S.dailyState();
    var t = window.DFDaily.today();
    var count = window.DFDaily.COUNT;

    var copy = d.done
      ? '<span class="dc-kicker">每日挑战 · 今天已完成</span>' +
        '<b class="dc-title">答对 ' + d.score + ' / ' + count + ' 题</b>' +
        '<p class="dc-sub">明天 0 点换一套新题，连续天数会接着算。</p>'
      : '<span class="dc-kicker">每日挑战 · 每天一套新题</span>' +
        '<b class="dc-title">今天的 ' + count + ' 道题</b>' +
        '<p class="dc-sub">÷2 到 ÷9 混合，首次完成额外 +5 颗松果。</p>';

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
    var items = window.DFAwards.all();
    var total = items.length;
    var done = items.filter(function (item) { return item.done; }).length;
    var rest = items.filter(function (item) { return !item.done; });
    rest.sort(function (a, b) { return b.p - a.p; });
    var next = rest[0] || null;
    var mini = items.slice(0, 3).map(function (item) {
      return window.DFAwards.medal(item.badge, item.done, 38);
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
    var skin = window.DFSkins.equipped();
    var houses = '';
    for (var t = 1; t <= 9; t += 1) {
      houses += houseCard(t, S.tableStar(t));
    }

    return '<section class="screen home">' +
      '<div class="hero">' +
        '<div class="hero-copy">' +
          '<span class="eyebrow"><span class="dot"></span>表内除法 · 每天 10 分钟 · 终点 1024 丰收节</span>' +
          '<h1 class="hero-title">' +
            '<span class="line">分好 <em class="mark">81</em> 筐果子</span>' +
            '<span class="line">喂饱 <em class="mark">9</em> 家动物</span>' +
          '</h1>' +
          '<p class="hero-lede">每家小动物是一张除法表。先动手<b>「平均分」</b>，看懂每份有几个；再用乘法口诀求商，闯关收星星 —— ' +
            '攒下的松果能种新的大树；九张表全部满星，还会打开第 10 个目的地：1024 丰收节。</p>' +
          '<div class="hero-actions">' +
            '<button type="button" class="btn btn-primary" data-action="start">开始闯关' + UI.icon('arrow') + '</button>' +
            '<button type="button" class="btn" data-action="learn-table" data-table="' + state.table + '">先分一分</button>' +
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
          '<h2>帮森林里的小动物分果子</h2>' +
          '<p>9 张表 · 81 道除法 · 每张表最多 3 颗星</p>' +
        '</div>' +
        '<div class="planet-grid house-grid">' + houses + '</div>' +
        harvestCard() +
        '<div class="map-foot">' +
          '<span>已点亮 <b>' + S.litTables() + '</b> / 9 座树屋 · 可用 <b>' + S.balance() + '</b> 颗松果</span>' +
          '<span class="map-links">' +
            '<button type="button" class="link-btn" data-action="shop">大树苗圃' + UI.icon('arrow', 14) + '</button>' +
            '<button type="button" class="link-btn" data-action="grid">除法总表' + UI.icon('arrow', 14) + '</button>' +
            '<button type="button" class="link-btn" data-action="report">家长报告' + UI.icon('arrow', 14) + '</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function mount(root) {
    var stage = root.querySelector('#hero-stage');
    if (!stage) return;
    window.DFEgg.attach(stage, window.DFSkins.equipped(), {
      onFound: function () {
        var chip = root.querySelector('.skin-chip-egg');
        if (!chip) return;
        var found = window.DFEgg.found();
        var all = window.DFEgg.total();
        chip.textContent = '彩蛋 ' + found + '/' + all;
        chip.classList.toggle('is-full', found >= all);
      }
    });
  }

  window.DFHome = { view: view, mount: mount, colors: HOUSE_COLORS };
})();
