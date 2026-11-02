/* 除法森林 — 大树互动：轻点摇果子，长按唤醒彩蛋 */
(function () {
  'use strict';

  var S = window.DFStore;
  var A = window.DFAudio;
  var UI = window.DFUI;
  var T = window.DFTree;
  var Art = window.DFArt;
  var D = window.DFData;

  var HOLD_MS = 650;
  var live = [];

  function circ(cx, cy, r, fill, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>';
  }

  function inked(w) {
    return ' stroke="' + Art.INK + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"';
  }

  function piece(cls, style, inner) {
    return '<g class="' + cls + '"' + (style ? ' style="' + style + '"' : '') + '>' + inner + '</g>';
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  /* ---------- 十个彩蛋 ---------- */

  function roll() {
    return piece('egg-walk is-roll', '', '<g transform="translate(-96 252) scale(1.5)">' + Art.animalInner('hedgehog') +
      '<g transform="translate(12 -4) scale(1)">' + Art.foodInner('apple') + '</g></g>');
  }

  function swing() {
    return piece('egg-swing', '',
      '<path d="M296 20Q306 96 296 172" fill="none" stroke="#3e8a3a" stroke-width="5" stroke-linecap="round"/>' +
      '<g transform="translate(268 160) scale(1.2)">' + Art.animalInner('monkey') + '</g>' +
      '<g transform="translate(302 206) scale(1.2)">' + Art.foodInner('peach') + '</g>');
  }

  function fall(kind, count) {
    var out = '';
    for (var i = 0; i < count; i += 1) {
      var x = rand(10, 390);
      var shape;
      if (kind === 'petal') shape = '<ellipse cx="' + x + '" cy="-14" rx="6" ry="3.8" fill="#ffc2d6"' + inked(1.4) + '/>';
      else shape = circ(x, -12, rand(2.6, 5), '#ffffff', ' stroke="#9fb7cc" stroke-width="1.3"');
      out += piece('egg-fall', '--x:' + rand(-60, 60).toFixed(0) + 'px;animation-delay:' + rand(0, 1.1).toFixed(2) +
        's;animation-duration:' + rand(2, 3).toFixed(2) + 's', shape);
    }
    return out;
  }

  function sunrise(svg) {
    svg.classList.add('egg-sunrise');
    window.setTimeout(function () { svg.classList.remove('egg-sunrise'); }, 3200);
    return piece('egg-glow', '', '<rect x="0" y="0" width="400" height="400" fill="#ff9a1f"/>');
  }

  function peek() {
    return piece('egg-pop', '', '<g transform="translate(166 270) scale(1.4)">' + Art.animalInner('squirrel') +
      '<g transform="translate(30 20) scale(1)">' + Art.foodInner('pinecone') + '</g></g>');
  }

  function crab() {
    return piece('egg-walk is-crab', '', '<g transform="translate(410 300) scale(1.35)">' + Art.animalInner('crab') + '</g>');
  }

  function whirl() {
    var out = '';
    for (var i = 0; i < 16; i += 1) {
      var r = rand(40, 150);
      var a = i * 22.5;
      out += piece('egg-whirl', 'animation-delay:' + (i * 0.04).toFixed(2) + 's',
        '<g transform="rotate(' + a + ' 200 200) translate(' + (200 + r).toFixed(0) + ' 188) scale(1.1)">' +
        Art.foodInner('mapleleaf') + '</g>');
    }
    return out;
  }

  /* 萤火虫从四面八方飞来，排成一个除号：上一点、下一点、中间一横 */
  function divideSign() {
    var targets = [[200, 116], [200, 284]];
    for (var x = 120; x <= 280; x += 26.6) targets.push([Math.round(x), 200]);
    return targets.map(function (t, i) {
      var big = i < 2;
      return piece('egg-fly', '--fx:' + rand(-200, 200).toFixed(0) + 'px;--fy:' + rand(-200, 200).toFixed(0) +
        'px;animation-delay:' + (i * 0.06).toFixed(2) + 's',
        circ(t[0], t[1], big ? 22 : 15, '#ffe36b', ' opacity=".3"') +
        circ(t[0], t[1], big ? 10 : 7, '#fff3a6', ' stroke="#c9a21a" stroke-width="1.6"'));
    }).join('');
  }

  /* 1024 对半分十次：数字一个接一个冒出来，最后剩下 1 */
  function halving() {
    var out = '';
    for (var i = 0; i <= 10; i += 1) {
      var v = 1024 / Math.pow(2, i);
      out += piece('egg-num' + (i === 10 ? ' is-last' : ''), 'animation-delay:' + (i * 0.28).toFixed(2) + 's',
        '<text x="200" y="' + (i === 10 ? 214 : 210) + '" text-anchor="middle" font-family="Arial Black, Archivo Black, Helvetica, sans-serif" ' +
        'font-size="' + (i === 10 ? 120 : 64) + '" font-weight="900" fill="#ffd23f" stroke="' + Art.INK +
        '" stroke-width="5" paint-order="stroke" stroke-linejoin="round">' + v + '</text>');
    }
    return out;
  }

  var SPECS = {
    apple: {
      name: '刺猬快递', clue: '苹果树下，好像有谁在打滚？',
      tip: '小刺猬把滚落的苹果扎在背上，一颗一颗运回家。',
      fact: '刺猬身上大约有 5000 根刺，遇到危险会缩成一个刺球。',
      sound: 'pop', ms: 3000, make: roll
    },
    peach: {
      name: '猴子荡秋千', clue: '桃树枝上，好像垂下了什么？',
      tip: '小猴抓着藤蔓荡过来，顺手摘下一个大桃子。',
      fact: '很多猴子的尾巴都很灵活，爬树时能帮它保持平衡。',
      sound: 'forest', ms: 3000, make: swing
    },
    sakura: {
      name: '花瓣雨', clue: '风一吹，粉色的云会不会下雨？',
      tip: '樱花瓣像小雨一样飘下来，小兔子接住了一片。',
      fact: '兔子的两只耳朵能分别转动，帮它听清四面八方的声音。',
      sound: 'sparkle', ms: 3600, make: function () { return fall('petal', 34); }
    },
    orange: {
      name: '橘子日出', clue: '太阳是不是也像一个大橘子？',
      tip: '太阳像一个大橘子慢慢升起来，整片山坡都变成了橘色。',
      fact: '狐狸睡觉时会用大尾巴盖住鼻子，像围了一条暖和的围巾。',
      sound: 'ocean', ms: 3200, make: sunrise
    },
    pine: {
      name: '松鼠探头', clue: '树洞的小门，好像会自己打开？',
      tip: '松鼠从树洞里探出头，抱着它最爱的松果。',
      fact: '松鼠会把坚果埋在很多地方，忘掉的那些，有的会长成新的树。',
      sound: 'pop', ms: 2800, make: peek
    },
    palm: {
      name: '横着走的朋友', clue: '沙滩上有一串小小的脚印……',
      tip: '一只小螃蟹横着走过沙滩，八条腿走得飞快。',
      fact: '椰子能漂在海上旅行很远，到了新的海岸再发芽。',
      sound: 'candy', ms: 3200, make: crab
    },
    maple: {
      name: '红叶旋风', clue: '秋风转一圈，叶子会跑去哪里？',
      tip: '红叶跟着风转了一圈又一圈，小熊抬头看呆了。',
      fact: '熊冬眠前会吃很多东西，把力气攒在身体里过冬。',
      sound: 'whoosh', ms: 2600, make: whirl
    },
    snow: {
      name: '第一场雪', clue: '小鹿在等一件冬天才有的礼物。',
      tip: '雪花落下来啦！小鹿伸出舌头，接住了今年的第一片雪。',
      fact: '鹿角每年都会脱落，再重新长出来。',
      sound: 'glass', ms: 3600, make: function () { return fall('snow', 46); }
    },
    firefly: {
      name: '萤火虫除号', clue: '萤火虫好像在排队，写一个符号？',
      tip: '萤火虫排成了一个「÷」：上面一点，下面一点，中间一横。',
      fact: '萤火虫的光是冷光，摸起来一点也不烫。',
      sound: 'space', ms: 3400, make: divideSign
    },
    gold: {
      name: '1024 对半分', clue: '金色的数字，会不会越分越小？',
      tip: '1024 对半分 10 次：512、256、128……最后只剩下 1。',
      fact: '1024 是 10 个 2 连乘，所以对半分 10 次正好剩 1。',
      sound: 'halve', ms: 4200, make: halving
    }
  };

  function spec(id) {
    return SPECS[id] || SPECS.apple;
  }

  function found() {
    return window.DFSkins.list.filter(function (skin) { return S.hasEgg(skin.id); }).length;
  }

  function total() {
    return window.DFSkins.list.length;
  }

  /* 舞台的固定结构：场景、提示气泡、长按进度环 */
  function stage(skin) {
    return '<div class="tree-holder">' + T.scene(skin) + '</div>' +
      '<span class="tree-bubble" aria-hidden="true"></span>' +
      '<span class="tree-ring" aria-hidden="true"></span>';
  }

  function randomFact() {
    var d = 2 + Math.floor(Math.random() * 8);
    var q = 2 + Math.floor(Math.random() * 8);
    return { text: (d * q) + ' ÷ ' + d + ' = ' + q, chant: D.chant(d, q) };
  }

  function attach(el, skin, opts) {
    opts = opts || {};
    var ctl = { el: el, skin: skin, timers: [], holdTimer: null, held: false, down: false };

    function svg() {
      return el.querySelector('.tree-svg');
    }

    function later(fn, ms) {
      var id = window.setTimeout(fn, ms);
      ctl.timers.push(id);
      return id;
    }

    function bubble() {
      var b = el.querySelector('.tree-bubble');
      if (!b) return;
      var f = randomFact();
      b.innerHTML = '<b>' + f.text + '</b><small>' + f.chant + '</small>';
      b.classList.remove('is-show');
      void b.offsetWidth;
      b.classList.add('is-show');
      if (ctl.bubbleTimer) window.clearTimeout(ctl.bubbleTimer);
      ctl.bubbleTimer = later(function () { b.classList.remove('is-show'); }, 2300);
    }

    function tap() {
      el.classList.remove('is-shake');
      void el.offsetWidth;
      el.classList.add('is-shake');
      later(function () { el.classList.remove('is-shake'); }, 760);
      T.dropFruit(svg());
      bubble();
      A.egg('pop');
    }

    function egg() {
      var s = spec(ctl.skin.id);
      var layer = T.layer(svg());
      if (!layer) return;
      layer.innerHTML = s.make(svg());
      el.classList.add('is-egg');
      A.egg(s.sound, true);
      later(function () {
        layer.innerHTML = '';
        el.classList.remove('is-egg');
      }, s.ms);
      if (S.markEgg(ctl.skin.id)) {
        UI.toast('发现彩蛋「' + s.name + '」· 探索手册 ' + found() + ' / ' + total());
        if (window.DFAwards) window.DFAwards.sync();
        if (opts.onFound) opts.onFound(ctl.skin);
      }
    }

    function cancelHold() {
      if (ctl.holdTimer) window.clearTimeout(ctl.holdTimer);
      ctl.holdTimer = null;
      el.classList.remove('is-holding');
    }

    function onDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      ctl.down = true;
      ctl.held = false;
      el.classList.add('is-holding');
      ctl.holdTimer = window.setTimeout(function () {
        ctl.held = true;
        el.classList.remove('is-holding');
        egg();
      }, HOLD_MS);
    }

    function onUp() {
      if (!ctl.down) return;
      ctl.down = false;
      var wasHeld = ctl.held;
      cancelHold();
      if (!wasHeld) tap();
    }

    function onLeave() {
      ctl.down = false;
      cancelHold();
    }

    function onKey(event) {
      if (event.target !== el) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (event.shiftKey) egg();
      else tap();
    }

    function onContext(event) {
      event.preventDefault();
    }

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointercancel', onLeave);
    el.addEventListener('keydown', onKey);
    el.addEventListener('contextmenu', onContext);

    ctl.setSkin = function (next) {
      ctl.skin = next;
      var holder = el.querySelector('.tree-holder');
      if (holder) holder.innerHTML = T.scene(next);
    };
    ctl.fire = function (hold) {
      if (hold) egg();
      else tap();
    };
    ctl.destroy = function () {
      cancelHold();
      ctl.timers.forEach(function (id) { window.clearTimeout(id); });
      ctl.timers = [];
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointercancel', onLeave);
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('contextmenu', onContext);
    };

    live.push(ctl);
    return ctl;
  }

  function stopAll() {
    live.forEach(function (ctl) { ctl.destroy(); });
    live = [];
  }

  window.DFEgg = {
    HOLD_MS: HOLD_MS,
    spec: spec,
    found: found,
    total: total,
    stage: stage,
    attach: attach,
    stopAll: stopAll
  };
})();
