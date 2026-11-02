(function () {
  'use strict';

  var S = window.MPStore;
  var A = window.MPAudio;
  var UI = window.MPUI;
  var P = window.MPPlanet;
  var Skins = window.MPSkins;
  var SKINS = Skins.list;
  var selectedId = null;
  var ctl = null;
  var eggCtl = null;

  function number(id) {
    return String(SKINS.indexOf(Skins.byId(id)) + 1).padStart(2, '0');
  }

  function kicker(skin) {
    if (S.get().skin === skin.id) return '我的首页星球';
    if (S.ownsSkin(skin.id)) return '已收藏 · 随时换上';
    return skin.reward ? '空间站特别纪念' : '自由试玩中';
  }

  function meta(skin) {
    if (S.ownsSkin(skin.id)) {
      return '<span class="meta-pill is-on">已拥有</span><span class="meta-note">发现的彩蛋会留在你的探索手册里</span>';
    }
    if (skin.reward) {
      return '<span class="meta-pill is-reward">特别奖励</span><span class="meta-note">空间站挑战答对至少 8 题即可获得</span>';
    }
    var gap = Math.max(0, skin.cost - S.balance());
    return '<span class="meta-price">' + UI.star(17, 'price-star') + '<b>' + skin.cost + '</b><span>颗星收藏</span></span>' +
      '<span class="meta-note' + (gap ? '' : ' is-ready') + '">' + (gap ? '还差 ' + gap + ' 颗，慢慢来就好' : '星星够了，可以带回家') + '</span>';
  }

  function actions(skin) {
    if (S.get().skin === skin.id) return '<button type="button" class="btn skin-equipped" disabled>已装备到首页</button>';
    if (S.ownsSkin(skin.id)) return '<button type="button" class="btn btn-primary" data-action="skin-equip" data-skin="' + skin.id + '">让它住进我的首页' + UI.icon('arrow') + '</button>';
    if (skin.reward) return '<button type="button" class="btn btn-primary" data-action="' + (S.stationUnlocked() ? 'station' : 'home') + '">' + (S.stationUnlocked() ? '去空间站领取' : '去点亮九张乘法表') + UI.icon('arrow') + '</button>';
    if (S.balance() >= skin.cost) return '<button type="button" class="btn btn-primary" data-action="skin-buy" data-skin="' + skin.id + '">用 ' + skin.cost + ' 颗星带回家' + UI.icon('arrow') + '</button>';
    return '<button type="button" class="btn btn-primary" data-action="start">去闯关攒星星' + UI.icon('arrow') + '</button>';
  }

  function eggInner(skin) {
    var e = window.MPEgg.spec(skin.id);
    var got = S.hasEgg(skin.id);
    return '<div class="shop-egg' + (got ? ' is-found' : '') + '">' +
      '<div class="egg-note-head"><span class="egg-note-icon" aria-hidden="true">' + UI.icon(got ? 'check' : 'planet', 18) + '</span>' +
      '<span class="egg-note-label">' + (got ? '发现档案 · 已盖章' : '星球悄悄话 · 等你发现') + '</span></div>' +
      '<b>' + (got ? e.name : e.clue) + '</b>' +
      '<p>' + (got ? e.tip : '长按星球，让它的小秘密慢慢醒来。') + '</p>' +
      '<button type="button" class="egg-discover-btn" data-action="skin-awaken">' + (got ? '再看一次小秘密' : '帮我唤醒彩蛋') + '<span aria-hidden="true">↗</span></button>' +
    '</div>';
  }

  function details(skin) {
    return skin.details.map(function (detail, i) {
      return '<span><i style="background:' + (i === 1 ? skin.palette.base[0] : skin.palette.atmo) + '"></i>' + detail + '</span>';
    }).join('');
  }

  function cards() {
    return SKINS.map(function (skin) {
      var owned = S.ownsSkin(skin.id);
      var isOn = S.get().skin === skin.id;
      var got = S.hasEgg(skin.id);
      var state = isOn ? '使用中' : owned ? '已收藏' : skin.reward ? '空间站奖励' : '可试玩';
      var cost = !owned && !skin.reward ? '，' + skin.cost + '颗星' : '';
      var label = skin.name + '，' + skin.world + '，' + state + cost + '，' + (got ? '彩蛋已发现' : '彩蛋待发现');
      return '<button type="button" class="skin-card' + (skin.id === selectedId ? ' is-active' : '') +
        (owned ? ' is-owned' : '') + '" data-action="skin-select" data-skin="' + skin.id +
        '" aria-pressed="' + (skin.id === selectedId) + '" aria-label="' + label + '" style="--skin-accent:' + skin.palette.atmo + '">' +
        '<span class="skin-thumb"><span class="skin-number" aria-hidden="true">' + number(skin.id) + '</span>' +
          '<canvas data-thumb="' + skin.id + '" aria-hidden="true"></canvas>' +
          '<span class="thumb-egg' + (got ? ' is-found' : '') + '" aria-hidden="true">' + (got ? '✦' : '?') + '</span>' +
        '</span>' +
        '<span class="skin-card-body"><b class="skin-name">' + skin.name + '</b><span class="skin-world">' + skin.world + '</span></span>' +
        '<span class="skin-card-foot"><span class="skin-state' + (isOn ? ' is-on' : '') + '">' + state + '</span>' +
          (!owned && !skin.reward ? '<span class="skin-price">' + UI.star(13, 'price-star') + skin.cost + '</span>' : '<span aria-hidden="true">↗</span>') + '</span>' +
      '</button>';
    }).join('');
  }

  function journal() {
    var count = window.MPEgg.found();
    return '<div class="journal-heading"><div><span class="eyebrow">每一次好奇，都值得收藏</span><h2>我的彩蛋探索手册</h2></div>' +
      '<span class="journal-count"><b>' + count + '</b> / ' + SKINS.length + ' 已发现</span></div>' +
      '<div class="journal-stamps">' + SKINS.map(function (skin) {
        var got = S.hasEgg(skin.id);
        var e = window.MPEgg.spec(skin.id);
        return '<button type="button" class="journal-stamp' + (got ? ' is-found' : '') + '" data-action="skin-select" data-skin="' + skin.id +
          '" style="--stamp:' + skin.palette.atmo + '" aria-label="' + skin.name + '：' + (got ? '已发现' + e.name : '彩蛋待探索') + '">' +
          '<span class="stamp-seal" aria-hidden="true">' + (got ? UI.star(20) : '?') + '</span><span>' + (got ? e.name : '未发现') + '</span></button>';
      }).join('') + '</div><p class="journal-note">' + (count === SKINS.length ? '十个小秘密，都被你找到了！喜欢的星球，随时欢迎你回来。' : '不用先兑换，也能收集小秘密。选一颗喜欢的星球，慢慢探索吧。') + '</p>';
  }

  function view() {
    if (!selectedId || !Skins.byId(selectedId)) selectedId = Skins.equipped().id;
    var skin = Skins.byId(selectedId);
    return '<section class="screen shop">' +
      '<div class="shop-head"><button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回星球</button>' +
        '<div class="shop-titles"><span class="eyebrow"><span class="dot"></span>小小宇宙 · 大大好奇心</span><h1>今天，去哪个星球玩？</h1></div>' +
        '<div class="shop-wallet" aria-label="可用星星">' + UI.star(20, 'wallet-star') + '<b id="shop-balance">' + S.balance() + '</b><span>我的星星</span></div></div>' +
      '<div class="shop-stage" style="--atmo:' + skin.palette.atmo + '">' +
        '<div class="planet-lab"><div class="shop-view" style="--atmo:' + skin.palette.atmo + '">' +
          '<span class="shop-glow" aria-hidden="true"></span><span class="lab-orbit lab-orbit-a" aria-hidden="true"></span><span class="lab-orbit lab-orbit-b" aria-hidden="true"></span>' +
          '<span class="shop-view-tag"><i></i>星球观察舱</span><span class="lab-coordinate" id="lab-coordinate" aria-hidden="true">NO. ' + number(skin.id) + ' / 10</span>' +
          '<canvas class="shop-canvas" id="shop-canvas" aria-hidden="true"></canvas>' +
        '</div><div class="lab-controls"><button type="button" data-action="skin-greet">' + UI.icon('planet', 16) + '轻点打招呼</button>' +
          '<span>也可以直接摸摸星球</span><button type="button" data-action="skin-turn" aria-label="转动星球，看另一面">转一转 <span aria-hidden="true">↻</span></button></div></div>' +
        '<div class="shop-info"><div class="shop-info-top"><span class="shop-world" id="shop-world">' + skin.world + '</span><span class="shop-kicker" id="shop-kicker">' + kicker(skin) + '</span></div>' +
          '<h2 id="shop-name" aria-live="polite">' + skin.name + '</h2><p id="shop-desc">' + skin.desc + '</p>' +
          '<div class="skin-details" id="skin-details">' + details(skin) + '</div>' +
          '<div id="shop-egg">' + eggInner(skin) + '</div>' +
          '<div class="shop-meta" id="shop-meta">' + meta(skin) + '</div><div class="shop-actions" id="shop-actions">' + actions(skin) + '</div>' +
          '<p class="shop-tip">试玩与发现彩蛋不花星星 · 已收藏的皮肤可以随时换</p>' +
        '</div></div>' +
      '<div class="planet-field-note"><span>小小观察员</span><p id="planet-fact">' + window.MPEgg.spec(skin.id).fact + '</p><span aria-hidden="true">✦</span></div>' +
      '<div class="shop-list-head"><h2>十颗星球，十种小惊喜</h2><p id="shop-owned">已收藏 ' + Skins.ownedCount() + ' / ' + SKINS.length + ' · 点击卡片切换</p></div>' +
      '<div class="shop-grid" id="shop-grid">' + cards() + '</div>' +
      '<section class="egg-journal" id="egg-journal" aria-label="彩蛋探索手册">' + journal() + '</section>' +
      '<p class="shop-keyboard-tip">键盘也能玩：回车打招呼 · Shift + 回车唤醒 · 左右方向键转动星球</p>' +
    '</section>';
  }

  function mountThumbs(root) {
    root.querySelectorAll('canvas[data-thumb]').forEach(function (canvas) {
      var skin = Skins.byId(canvas.dataset.thumb);
      if (skin) P.paint(canvas, skin, skin.spin == null ? 1.1 : skin.spin, { max: 210, zoom: 1.03 });
    });
  }

  function refreshCollection(root) {
    var skin = Skins.byId(selectedId);
    root.querySelector('#shop-egg').innerHTML = eggInner(skin);
    root.querySelector('#egg-journal').innerHTML = journal();
    root.querySelectorAll('.skin-card').forEach(function (card) {
      var got = S.hasEgg(card.dataset.skin);
      var stamp = card.querySelector('.thumb-egg');
      stamp.classList.toggle('is-found', got);
      stamp.textContent = got ? '✦' : '?';
      stamp.setAttribute('aria-label', got ? '彩蛋已发现' : '彩蛋待发现');
    });
  }

  function mount(root) {
    var canvas = root.querySelector('#shop-canvas');
    if (!canvas) return;
    ctl = P.attach(canvas, Skins.byId(selectedId), { speed: 0.23 });
    eggCtl = window.MPEgg.attach(root.querySelector('.shop-view'), canvas, Skins.byId(selectedId), ctl, {
      onFound: function () {
        var hadFocus = document.activeElement && document.activeElement.matches('[data-action="skin-awaken"]');
        refreshCollection(root);
        if (hadFocus) root.querySelector('[data-action="skin-awaken"]').focus({ preventScroll: true });
      }
    });
    mountThumbs(root);
  }

  function select(root, id) {
    var skin = Skins.byId(id);
    if (!skin) return;
    var changed = selectedId !== id;
    selectedId = id;
    if (ctl && changed) ctl.setSkin(skin);
    if (eggCtl) eggCtl.setSkin(skin);
    root.querySelector('.shop-view').style.setProperty('--atmo', skin.palette.atmo);
    root.querySelector('.shop-stage').style.setProperty('--atmo', skin.palette.atmo);
    var texts = { 'shop-name': skin.name, 'shop-world': skin.world, 'shop-kicker': kicker(skin),
      'shop-desc': skin.desc, 'lab-coordinate': 'NO. ' + number(id) + ' / 10', 'planet-fact': window.MPEgg.spec(id).fact };
    Object.keys(texts).forEach(function (key) { root.querySelector('#' + key).textContent = texts[key]; });
    root.querySelector('#skin-details').innerHTML = details(skin);
    root.querySelector('#shop-egg').innerHTML = eggInner(skin);
    root.querySelector('#shop-meta').innerHTML = meta(skin);
    root.querySelector('#shop-actions').innerHTML = actions(skin);
    root.querySelectorAll('.skin-card').forEach(function (card) {
      var selected = card.dataset.skin === id;
      card.classList.toggle('is-active', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    if (changed) A.tap();
  }

  function refresh(root) {
    select(root, selectedId);
    root.querySelector('#shop-balance').textContent = S.balance();
    root.querySelector('#shop-owned').textContent = '已收藏 ' + Skins.ownedCount() + ' / ' + SKINS.length + ' · 点击卡片切换';
    root.querySelector('#shop-grid').innerHTML = cards();
    mountThumbs(root);
  }

  function confirm(root, id) {
    var skin = Skins.byId(id);
    if (!skin || skin.reward || S.ownsSkin(id)) return;
    root.querySelector('#shop-actions').innerHTML = '<div class="buy-box"><p>用 <b>' + skin.cost + '</b> 颗星，把「' + skin.name + '」带回家？</p>' +
      '<div class="buy-actions"><button type="button" class="btn btn-primary" data-action="skin-buy-ok" data-skin="' + id + '">确认兑换</button>' +
      '<button type="button" class="btn" data-action="skin-buy-cancel" data-skin="' + id + '">再想想</button></div></div>';
    root.querySelector('[data-action="skin-buy-ok"]').focus({ preventScroll: true });
  }

  function buy(root, id) {
    var skin = Skins.byId(id);
    if (!skin || skin.reward || S.ownsSkin(id)) return;
    if (!S.buySkin(id, skin.cost)) { UI.toast('星星还不够，再去闯一关吧'); return; }
    S.equipSkin(id);
    selectedId = id;
    if (ctl) ctl.setSkin(skin);
    UI.syncStars(true);
    A.win();
    UI.confetti(36);
    UI.toast('「' + skin.name + '」已经住进你的首页啦！');
    if (window.MPAwards) window.MPAwards.sync();
    refresh(root);
    root.querySelector('.shop-view').focus({ preventScroll: true });
  }

  function equip(root, id) {
    if (!Skins.byId(id) || !S.equipSkin(id)) return;
    selectedId = id;
    if (ctl) ctl.setSkin(Skins.byId(id));
    A.star();
    UI.toast('已换上「' + Skins.byId(id).name + '」');
    refresh(root);
    root.querySelector('.shop-view').focus({ preventScroll: true });
  }

  Object.assign(Skins, {
    view: view, mount: mount, select: select, confirm: confirm, buy: buy, equip: equip,
    focus: function (id) { if (Skins.byId(id)) selectedId = id; },
    greet: function () { if (eggCtl) eggCtl.fire(false); },
    awaken: function () { if (eggCtl) eggCtl.fire(true); },
    turn: function () { if (ctl && ctl.turn) ctl.turn(0.55); }
  });
})();
