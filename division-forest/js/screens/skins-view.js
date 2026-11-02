/* 除法森林 — 大树苗圃：试玩、兑换、彩蛋探索手册 */
(function () {
  'use strict';

  var S = window.DFStore;
  var A = window.DFAudio;
  var UI = window.DFUI;
  var T = window.DFTree;
  var Art = window.DFArt;
  var Skins = window.DFSkins;
  var SKINS = Skins.list;
  var selectedId = null;
  var eggCtl = null;

  function number(id) {
    return String(SKINS.indexOf(Skins.byId(id)) + 1).padStart(2, '0');
  }

  function kicker(skin) {
    if (S.get().skin === skin.id) return '我的首页大树';
    if (S.ownsSkin(skin.id)) return '已种下 · 随时换上';
    return skin.reward ? '丰收节特别纪念' : '自由试玩中';
  }

  function meta(skin) {
    if (S.ownsSkin(skin.id)) {
      return '<span class="meta-pill is-on">已拥有</span><span class="meta-note">发现的彩蛋会留在你的探索手册里</span>';
    }
    if (skin.reward) {
      return '<span class="meta-pill is-reward">特别奖励</span><span class="meta-note">1024 丰收节答对至少 8 题即可获得</span>';
    }
    var gap = Math.max(0, skin.cost - S.balance());
    return '<span class="meta-price">' + Art.cone(19, 'price-star') + '<b>' + skin.cost + '</b><span>颗松果种下</span></span>' +
      '<span class="meta-note' + (gap ? '' : ' is-ready') + '">' + (gap ? '还差 ' + gap + ' 颗，慢慢来就好' : '松果够了，可以种回家') + '</span>';
  }

  function actions(skin) {
    if (S.get().skin === skin.id) return '<button type="button" class="btn skin-equipped" disabled>已种在首页</button>';
    if (S.ownsSkin(skin.id)) {
      return '<button type="button" class="btn btn-primary" data-action="skin-equip" data-skin="' + skin.id +
        '">把它种到我的首页' + UI.icon('arrow') + '</button>';
    }
    if (skin.reward) {
      var open = S.harvestUnlocked();
      return '<button type="button" class="btn btn-primary" data-action="' + (open ? 'harvest' : 'home') + '">' +
        (open ? '去丰收节领取' : '去点亮九张除法表') + UI.icon('arrow') + '</button>';
    }
    if (S.balance() >= skin.cost) {
      return '<button type="button" class="btn btn-primary" data-action="skin-buy" data-skin="' + skin.id + '">用 ' +
        skin.cost + ' 颗松果种回家' + UI.icon('arrow') + '</button>';
    }
    return '<button type="button" class="btn btn-primary" data-action="start">去闯关攒松果' + UI.icon('arrow') + '</button>';
  }

  function eggInner(skin) {
    var e = window.DFEgg.spec(skin.id);
    var got = S.hasEgg(skin.id);
    return '<div class="shop-egg' + (got ? ' is-found' : '') + '">' +
      '<div class="egg-note-head"><span class="egg-note-icon" aria-hidden="true">' + UI.icon(got ? 'check' : 'tree', 18) + '</span>' +
      '<span class="egg-note-label">' + (got ? '发现档案 · 已盖章' : '大树悄悄话 · 等你发现') + '</span></div>' +
      '<b>' + (got ? e.name : e.clue) + '</b>' +
      '<p>' + (got ? e.tip : '长按大树，让它的小秘密慢慢醒来。') + '</p>' +
      '<button type="button" class="egg-discover-btn" data-action="skin-awaken">' + (got ? '再看一次小秘密' : '帮我唤醒彩蛋') +
        '<span aria-hidden="true">↗</span></button>' +
    '</div>';
  }

  function details(skin) {
    var colors = [skin.palette.crown[0], skin.palette.accent, skin.palette.trunk];
    return skin.details.map(function (detail, i) {
      return '<span><i style="background:' + colors[i % colors.length] + '"></i>' + detail + '</span>';
    }).join('');
  }

  function cards() {
    return SKINS.map(function (skin) {
      var owned = S.ownsSkin(skin.id);
      var isOn = S.get().skin === skin.id;
      var got = S.hasEgg(skin.id);
      var state = isOn ? '种在首页' : owned ? '已种下' : skin.reward ? '丰收节奖励' : '可试玩';
      var cost = !owned && !skin.reward ? '，' + skin.cost + ' 颗松果' : '';
      var label = skin.name + '，' + skin.world + '，' + state + cost + '，' + (got ? '彩蛋已发现' : '彩蛋待发现');
      return '<button type="button" class="skin-card' + (skin.id === selectedId ? ' is-active' : '') +
        (owned ? ' is-owned' : '') + '" data-action="skin-select" data-skin="' + skin.id +
        '" aria-pressed="' + (skin.id === selectedId) + '" aria-label="' + label + '" style="--skin-accent:' + skin.palette.accent + '">' +
        '<span class="skin-thumb"><span class="skin-number" aria-hidden="true">' + number(skin.id) + '</span>' +
          T.scene(skin, { thumb: true }) +
          '<span class="thumb-egg' + (got ? ' is-found' : '') + '" aria-hidden="true">' + (got ? '✦' : '?') + '</span>' +
        '</span>' +
        '<span class="skin-card-body"><b class="skin-name">' + skin.name + '</b><span class="skin-world">' + skin.world + '</span></span>' +
        '<span class="skin-card-foot"><span class="skin-state' + (isOn ? ' is-on' : '') + '">' + state + '</span>' +
          (!owned && !skin.reward ? '<span class="skin-price">' + Art.cone(14, 'price-star') + skin.cost + '</span>' : '<span aria-hidden="true">↗</span>') + '</span>' +
      '</button>';
    }).join('');
  }

  function journal() {
    var count = window.DFEgg.found();
    return '<div class="journal-heading"><div><span class="eyebrow">每一次好奇，都值得收藏</span><h2>我的彩蛋探索手册</h2></div>' +
      '<span class="journal-count"><b>' + count + '</b> / ' + SKINS.length + ' 已发现</span></div>' +
      '<div class="journal-stamps">' + SKINS.map(function (skin) {
        var got = S.hasEgg(skin.id);
        var e = window.DFEgg.spec(skin.id);
        return '<button type="button" class="journal-stamp' + (got ? ' is-found' : '') + '" data-action="skin-select" data-skin="' + skin.id +
          '" style="--stamp:' + skin.palette.accent + '" aria-label="' + skin.name + '：' + (got ? '已发现' + e.name : '彩蛋待探索') + '">' +
          '<span class="stamp-seal" aria-hidden="true">' + (got ? UI.star(20) : '?') + '</span><span>' + (got ? e.name : '未发现') + '</span></button>';
      }).join('') + '</div><p class="journal-note">' + (count === SKINS.length
        ? '十个小秘密，都被你找到了！喜欢的大树，随时欢迎你回来。'
        : '不用先兑换，也能收集小秘密。选一棵喜欢的大树，长按它试试吧。') + '</p>';
  }

  function view() {
    if (!selectedId || !Skins.byId(selectedId)) selectedId = Skins.equipped().id;
    var skin = Skins.byId(selectedId);
    return '<section class="screen shop">' +
      '<div class="shop-head"><button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回森林</button>' +
        '<div class="shop-titles"><span class="eyebrow"><span class="dot"></span>森林苗圃 · 十棵大树</span><h1>今天，种哪棵大树？</h1></div>' +
        '<div class="shop-wallet" aria-label="可用松果">' + Art.cone(22, 'wallet-star') + '<b id="shop-balance">' + S.balance() +
          '</b><span>我的松果</span></div></div>' +
      '<div class="shop-stage" style="--atmo:' + skin.palette.accent + '">' +
        '<div class="planet-lab"><div class="shop-view tree-stage" tabindex="0" role="button" aria-label="试玩大树：轻点摇果子，长按唤醒彩蛋" ' +
          'style="--atmo:' + skin.palette.accent + '">' +
          '<span class="shop-view-tag"><i></i>树屋观察站</span><span class="lab-coordinate" id="lab-coordinate" aria-hidden="true">NO. ' +
            number(skin.id) + ' / 10</span>' +
          window.DFEgg.stage(skin) +
        '</div><div class="lab-controls"><button type="button" data-action="skin-greet">' + UI.icon('tree', 16) + '轻点摇果子</button>' +
          '<span>也可以直接点点大树</span><button type="button" data-action="skin-awaken">长按唤醒 <span aria-hidden="true">✦</span></button></div></div>' +
        '<div class="shop-info"><div class="shop-info-top"><span class="shop-world" id="shop-world">' + skin.world + '</span>' +
          '<span class="shop-kicker" id="shop-kicker">' + kicker(skin) + '</span></div>' +
          '<h2 id="shop-name" aria-live="polite">' + skin.name + '</h2><p id="shop-desc">' + skin.desc + '</p>' +
          '<div class="skin-details" id="skin-details">' + details(skin) + '</div>' +
          '<div id="shop-egg">' + eggInner(skin) + '</div>' +
          '<div class="shop-meta" id="shop-meta">' + meta(skin) + '</div><div class="shop-actions" id="shop-actions">' + actions(skin) + '</div>' +
          '<p class="shop-tip">试玩与发现彩蛋不花松果 · 已种下的大树可以随时换</p>' +
        '</div></div>' +
      '<div class="planet-field-note"><span>小小观察员</span><p id="planet-fact">' + window.DFEgg.spec(skin.id).fact + '</p>' +
        '<span aria-hidden="true">✦</span></div>' +
      '<div class="shop-list-head"><h2>十棵大树，十个小秘密</h2><p id="shop-owned">已种下 ' + Skins.ownedCount() + ' / ' +
        SKINS.length + ' · 点击卡片切换</p></div>' +
      '<div class="shop-grid" id="shop-grid">' + cards() + '</div>' +
      '<section class="egg-journal" id="egg-journal" aria-label="彩蛋探索手册">' + journal() + '</section>' +
      '<p class="shop-keyboard-tip">键盘也能玩：选中大树后，回车摇果子 · Shift + 回车唤醒彩蛋</p>' +
    '</section>';
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
    });
  }

  function mount(root) {
    var stage = root.querySelector('.shop-view');
    if (!stage) return;
    eggCtl = window.DFEgg.attach(stage, Skins.byId(selectedId), {
      onFound: function () {
        var hadFocus = document.activeElement && document.activeElement.matches('[data-action="skin-awaken"]');
        refreshCollection(root);
        if (hadFocus) {
          var btn = root.querySelector('#shop-egg [data-action="skin-awaken"]');
          if (btn) btn.focus({ preventScroll: true });
        }
      }
    });
  }

  function select(root, id) {
    var skin = Skins.byId(id);
    if (!skin) return;
    var changed = selectedId !== id;
    selectedId = id;
    if (eggCtl && changed) eggCtl.setSkin(skin);
    root.querySelector('.shop-view').style.setProperty('--atmo', skin.palette.accent);
    root.querySelector('.shop-stage').style.setProperty('--atmo', skin.palette.accent);
    var texts = {
      'shop-name': skin.name, 'shop-world': skin.world, 'shop-kicker': kicker(skin), 'shop-desc': skin.desc,
      'lab-coordinate': 'NO. ' + number(id) + ' / 10', 'planet-fact': window.DFEgg.spec(id).fact
    };
    Object.keys(texts).forEach(function (key) { root.querySelector('#' + key).textContent = texts[key]; });
    root.querySelector('#skin-details').innerHTML = details(skin);
    root.querySelector('#shop-egg').innerHTML = eggInner(skin);
    root.querySelector('#shop-meta').innerHTML = meta(skin);
    root.querySelector('#shop-actions').innerHTML = actions(skin);
    root.querySelectorAll('.skin-card').forEach(function (card) {
      var on = card.dataset.skin === id;
      card.classList.toggle('is-active', on);
      card.setAttribute('aria-pressed', String(on));
    });
    if (changed) A.tap();
  }

  function refresh(root) {
    select(root, selectedId);
    root.querySelector('#shop-balance').textContent = S.balance();
    root.querySelector('#shop-owned').textContent = '已种下 ' + Skins.ownedCount() + ' / ' + SKINS.length + ' · 点击卡片切换';
    root.querySelector('#shop-grid').innerHTML = cards();
  }

  function confirm(root, id) {
    var skin = Skins.byId(id);
    if (!skin || skin.reward || S.ownsSkin(id)) return;
    root.querySelector('#shop-actions').innerHTML = '<div class="buy-box"><p>用 <b>' + skin.cost + '</b> 颗松果，把「' + skin.name +
      '」种回家？</p><div class="buy-actions"><button type="button" class="btn btn-primary" data-action="skin-buy-ok" data-skin="' + id +
      '">确认种下</button><button type="button" class="btn" data-action="skin-buy-cancel" data-skin="' + id + '">再想想</button></div></div>';
    root.querySelector('[data-action="skin-buy-ok"]').focus({ preventScroll: true });
  }

  function buy(root, id) {
    var skin = Skins.byId(id);
    if (!skin || skin.reward || S.ownsSkin(id)) return;
    if (!S.buySkin(id, skin.cost)) {
      UI.toast('松果还不够，再去闯一关吧');
      return;
    }
    S.equipSkin(id);
    selectedId = id;
    if (eggCtl) eggCtl.setSkin(skin);
    UI.syncStars(true);
    A.win();
    UI.confetti(36);
    UI.toast('「' + skin.name + '」已经种在你的首页啦！');
    if (window.DFAwards) window.DFAwards.sync();
    refresh(root);
    root.querySelector('.shop-view').focus({ preventScroll: true });
  }

  function equip(root, id) {
    if (!Skins.byId(id) || !S.equipSkin(id)) return;
    selectedId = id;
    if (eggCtl) eggCtl.setSkin(Skins.byId(id));
    A.star();
    UI.toast('已换上「' + Skins.byId(id).name + '」');
    refresh(root);
    root.querySelector('.shop-view').focus({ preventScroll: true });
  }

  Object.assign(Skins, {
    view: view,
    mount: mount,
    select: select,
    confirm: confirm,
    buy: buy,
    equip: equip,
    focus: function (id) { if (Skins.byId(id)) selectedId = id; },
    greet: function () { if (eggCtl) eggCtl.fire(false); },
    awaken: function () { if (eggCtl) eggCtl.fire(true); }
  });
})();
