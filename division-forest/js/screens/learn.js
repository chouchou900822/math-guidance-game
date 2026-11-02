/* 除法森林 — 学习页（动手平均分）与整张除法表 */
(function () {
  'use strict';

  var D = window.DFData;
  var S = window.DFStore;
  var A = window.DFAudio;
  var UI = window.DFUI;
  var Art = window.DFArt;

  var STEP_MS = 420;

  /* 篮子和盘子里的食物都 <use> 同一个 symbol，81 个也不卡 */
  function symbolFor(food) {
    return '<svg class="share-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
      '<symbol id="share-food" viewBox="0 0 24 24">' + Art.foodInner(food) + '</symbol></defs></svg>';
  }

  function item(cls) {
    return '<svg class="share-item' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<use href="#share-food"/></svg>';
  }

  function repeat(count, cls) {
    var out = '';
    for (var i = 0; i < count; i += 1) out += item(cls);
    return out;
  }

  function sharePanel(d, q, round) {
    var f = D.family(d);
    var n = d * q;
    var friends = '';
    for (var k = 0; k < d; k += 1) {
      friends += '<div class="friend">' +
        '<div class="friend-plate">' + repeat(round) + '</div>' +
        '<span class="friend-face">' + Art.animal(f.id, 40) + '</span>' +
        '<b class="friend-count">' + round + '</b>' +
      '</div>';
    }
    return symbolFor(f.food) +
      '<div class="share-basket">' +
        '<span class="share-basket-label">篮子里 <b data-left>' + (n - round * d) + '</b> ' + f.unit + f.foodName + '</span>' +
        '<div class="share-pile">' + repeat(n - round * d) + '</div>' +
      '</div>' +
      '<div class="share-arrow" aria-hidden="true">平均分给 ' + d + ' 只' + f.animal + '</div>' +
      '<div class="share-friends" style="--cols:' + (d <= 5 ? d : Math.ceil(d / 2)) + '">' + friends + '</div>';
  }

  function caption(d, q, round) {
    var f = D.family(d);
    var n = d * q;
    if (round <= 0) {
      return n + ' ' + f.unit + f.foodName + '，平均分给 ' + d + ' 只' + f.animal + '，每只能分到几' + f.unit + '？';
    }
    if (round < q) {
      return '分了 ' + round + ' 轮：每只 ' + round + ' ' + f.unit + '，篮子里还剩 ' + (n - round * d) + ' ' + f.unit + '。';
    }
    return '分完啦！每只' + f.animal + '分到 <b>' + q + '</b> ' + f.unit + '，所以 ' + n + ' ÷ ' + d + ' = <b>' + q + '</b>。';
  }

  function think(d, q) {
    return '想：' + d + ' × <b>' + q + '</b> = ' + (d * q) + '，所以 ' + (d * q) + ' ÷ ' + d + ' = <b>' + q + '</b>';
  }

  function view(state) {
    var d = state.table;
    var q = state.learnB;
    var f = D.family(d);

    var tabs = '';
    for (var i = 1; i <= 9; i += 1) {
      var on = i === d;
      tabs += '<button type="button" class="table-tab' + (on ? ' is-active' : '') +
        '" data-action="switch-table" data-table="' + i + '" aria-pressed="' + on +
        '" aria-label="切换到 ÷' + i + ' 的表，' + D.family(i).animal + '家">÷' + i + '</button>';
    }

    var chips = D.formulasOf(d).map(function (it) {
      return '<button type="button" class="formula-chip' + (it.quotient === q ? ' is-active' : '') +
        '" data-action="pick-b" data-b="' + it.quotient + '" aria-label="' + it.dividend + ' 除以 ' + it.divisor +
        ' 等于 ' + it.quotient + '，口诀 ' + it.chant + '">' +
        '<span>' + it.dividend + ' ÷ ' + it.divisor + '</span><b>' + it.quotient + '</b></button>';
    }).join('');

    return '<section class="screen learn">' +
      '<div class="learn-head">' +
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回森林</button>' +
        '<div class="learn-head-tools">' +
          '<span class="learn-progress" id="learn-progress">已点读 <b>' + S.seenInTable(d) + '</b> / 9 道</span>' +
          '<button type="button" class="link-btn" data-action="grid">整张除法表</button>' +
        '</div>' +
      '</div>' +
      '<div class="table-tabs" role="group" aria-label="选择除法表">' + tabs + '</div>' +
      '<div class="worksheet">' +
        '<div class="learn-formula">' +
          '<span class="learn-family">' + Art.animal(f.id, 30) + '<span>' + d + ' 只' + f.animal + ' · 平均分' +
            f.foodName + '</span></span>' +
          '<div class="formula">' +
            '<span data-big="n">' + (d * q) + '</span>' +
            '<span class="op">÷</span>' +
            '<span data-big="d">' + d + '</span>' +
            '<span class="op">=</span>' +
            '<span class="res" data-big="q">' + q + '</span>' +
          '</div>' +
          '<span class="chant" data-big="chant">' + D.chant(d, q) + '</span>' +
          '<p class="learn-think" data-big="think">' + think(d, q) + '</p>' +
          '<button type="button" class="speak-btn" data-action="speak-current">' +
            UI.icon('sound', 17) + '<span>听一听</span></button>' +
          '<p class="learn-hint">除法用的就是乘法口诀：一句口诀，能算两道除法。</p>' +
        '</div>' +
        '<div class="learn-visual">' +
          '<div class="share-panel" data-big="share">' + sharePanel(d, q, state.shareRound || 0) + '</div>' +
          '<p class="share-caption" data-big="caption" aria-live="polite">' + caption(d, q, state.shareRound || 0) + '</p>' +
          '<div class="share-controls">' +
            '<button type="button" class="btn btn-sm" data-action="share-step">' + UI.icon('hand', 17) + '<span>分一轮</span></button>' +
            '<button type="button" class="btn btn-sm btn-accent" data-action="share-all">' + UI.icon('divide', 16) + '<span>一下分完</span></button>' +
            '<button type="button" class="btn btn-sm share-reset" data-action="share-reset" aria-label="把食物放回篮子，重新分">' +
              UI.icon('reset', 16) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="learn-strip" role="group" aria-label="÷' + d + ' 的 9 道除法">' + chips + '</div>' +
        '<div class="learn-actions">' +
          '<button type="button" class="btn btn-sm" data-action="read-all">' +
            UI.icon('sound', 16) + '<span>朗读整张表</span></button>' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="practice-table">练习 ÷' + d +
            ' 的表' + UI.icon('arrow', 16) + '</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function set(root, key, html) {
    var el = root.querySelector('[data-big="' + key + '"]');
    if (el) el.innerHTML = html;
  }

  function stopShare(state) {
    state.shareToken = (state.shareToken || 0) + 1;
    if (state.shareTimer) window.clearTimeout(state.shareTimer);
    state.shareTimer = null;
  }

  function syncShareBtns(root, state) {
    var done = state.shareRound >= state.learnB;
    var step = root.querySelector('[data-action="share-step"]');
    var all = root.querySelector('[data-action="share-all"]');
    if (step) step.disabled = done;
    if (all) all.disabled = done;
  }

  function resetShare(root, state) {
    stopShare(state);
    state.shareRound = 0;
    set(root, 'share', sharePanel(state.table, state.learnB, 0));
    set(root, 'caption', caption(state.table, state.learnB, 0));
    var res = root.querySelector('.formula .res');
    if (res) res.classList.remove('is-pop');
    syncShareBtns(root, state);
  }

  function update(root, state, q) {
    var d = state.table;
    state.learnB = q;
    set(root, 'n', d * q);
    set(root, 'd', d);
    set(root, 'q', q);
    set(root, 'chant', D.chant(d, q));
    set(root, 'think', think(d, q));
    resetShare(root, state);

    var chips = root.querySelectorAll('.formula-chip');
    for (var i = 0; i < chips.length; i += 1) {
      chips[i].classList.toggle('is-active', Number(chips[i].dataset.b) === q);
    }
  }

  /* 分一轮：篮子里拿走 d 个，每位朋友的盘子里各放 1 个 */
  function dealOne(root, state) {
    var d = state.table;
    var q = state.learnB;
    if (state.shareRound >= q) return false;
    state.shareRound += 1;
    var round = state.shareRound;

    var pile = root.querySelector('.share-pile');
    if (pile) {
      for (var i = 0; i < d && pile.lastElementChild; i += 1) {
        pile.removeChild(pile.lastElementChild);
      }
    }
    var left = root.querySelector('[data-left]');
    if (left) left.textContent = String(d * q - round * d);

    var friends = root.querySelectorAll('.friend');
    for (var k = 0; k < friends.length; k += 1) {
      var plate = friends[k].querySelector('.friend-plate');
      if (plate) plate.insertAdjacentHTML('beforeend', item('is-new'));
      var count = friends[k].querySelector('.friend-count');
      if (count) count.textContent = String(round);
      friends[k].classList.remove('is-got');
      void friends[k].offsetWidth;
      friends[k].classList.add('is-got');
    }

    set(root, 'caption', caption(d, q, round));
    A.deal(round);
    syncShareBtns(root, state);

    if (round >= q) {
      var res = root.querySelector('.formula .res');
      if (res) {
        res.classList.remove('is-pop');
        void res.offsetWidth;
        res.classList.add('is-pop');
      }
      S.markSeen(d, q);
      syncSeen(root, state);
      window.setTimeout(function () {
        if (state.screen === 'learn' && state.table === d && state.learnB === q && !state.reading) {
          A.speak(D.speech(d, q));
        }
      }, 260);
    }
    return true;
  }

  function shareStep(root, state) {
    stopShare(state);
    if (state.reading && window.DFSpeak) window.DFSpeak.stop();
    if (!dealOne(root, state)) UI.toast('已经分完啦，点右边的按钮可以重新分');
  }

  function shareAll(root, state) {
    stopShare(state);
    if (state.reading && window.DFSpeak) window.DFSpeak.stop();
    var token = state.shareToken;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick() {
      if (token !== state.shareToken || state.screen !== 'learn') return;
      if (!dealOne(root, state)) return;
      if (state.shareRound < state.learnB) state.shareTimer = window.setTimeout(tick, reduce ? 60 : STEP_MS);
    }
    tick();
  }

  function syncSeen(root, state) {
    var el = root.querySelector('#learn-progress');
    if (el) el.innerHTML = '已点读 <b>' + S.seenInTable(state.table) + '</b> / 9 道';
  }

  function markReading(root, q, on) {
    var chips = root.querySelectorAll('.formula-chip');
    for (var i = 0; i < chips.length; i += 1) {
      chips[i].classList.toggle('is-reading', on && Number(chips[i].dataset.b) === q);
    }
  }

  function syncReadBtn(root, state) {
    var btn = root.querySelector('[data-action="read-all"]');
    if (!btn) return;
    btn.innerHTML = state.reading
      ? UI.icon('stop', 15) + '<span>停止朗读</span>'
      : UI.icon('sound', 16) + '<span>朗读整张表</span>';
    btn.setAttribute('aria-pressed', String(state.reading));
  }

  function centerTabs(root) {
    var tabs = root.querySelector('.table-tabs');
    var active = root.querySelector('.table-tab.is-active');
    if (!tabs || !active || tabs.scrollWidth <= tabs.clientWidth) return;
    var tabRect = active.getBoundingClientRect();
    var wrapRect = tabs.getBoundingClientRect();
    tabs.scrollLeft += tabRect.left - wrapRect.left - (wrapRect.width - tabRect.width) / 2;
  }

  /* 整张除法表：每一行是一张表，格子里是被除数，列头是商 */
  function gridView() {
    var head = '';
    for (var c = 1; c <= 9; c += 1) {
      head += '<th scope="col">= ' + c + '</th>';
    }

    var rows = '';
    for (var d = 1; d <= 9; d += 1) {
      var cells = '';
      for (var q = 1; q <= 9; q += 1) {
        cells += '<td><button type="button" class="cell" data-action="grid-cell" data-a="' + d + '" data-b="' + q +
          '" style="--hue:' + (88 + d * 9) + '" aria-label="' + (d * q) + ' 除以 ' + d + ' 等于 ' + q + '，口诀 ' +
          D.chant(d, q) + '">' + (d * q) + '</button></td>';
      }
      rows += '<tr><th scope="row">÷ ' + d + '</th>' + cells + '</tr>';
    }

    return '<section class="screen grid">' +
      '<div class="grid-head">' +
        '<div>' +
          '<h1>整张除法表</h1>' +
          '<p>每一行是一张表：格子里的数 ÷ 行头 = 列头。点一格，听一听这道除法和它的口诀。</p>' +
        '</div>' +
        '<span class="grid-legend"><i></i>81 道 · 「三四十二」能算 12÷3 和 12÷4</span>' +
      '</div>' +
      '<div class="grid-scroll">' +
        '<table class="tbl tbl-div">' +
          '<thead><tr><th scope="col">÷</th>' + head + '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="learn-actions">' +
        '<button type="button" class="btn btn-sm" data-action="home">' + UI.icon('back', 15) + '回森林</button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-action="start">去闯关' + UI.icon('arrow', 16) + '</button>' +
      '</div>' +
    '</section>';
  }

  window.DFLearn = {
    view: view,
    update: update,
    syncSeen: syncSeen,
    markReading: markReading,
    syncReadBtn: syncReadBtn,
    centerTabs: centerTabs,
    gridView: gridView,
    shareStep: shareStep,
    shareAll: shareAll,
    resetShare: resetShare,
    stopShare: stopShare
  };
})();
