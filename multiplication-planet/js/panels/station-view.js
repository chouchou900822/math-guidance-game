/* 乘法星球 — 1024 号空间站视图 */
(function () {
  'use strict';

  var S = window.MPStore;
  var UI = window.MPUI;

  var COUNT = 10;
  var NEED = 8;

  var PLANET_COLORS = [
    '#5a74ff', '#ff7a5e', '#ffd62e', '#3ed9b2', '#a99bff',
    '#7fd0ff', '#ffa8c8', '#ffc46b', '#8fe3f5'
  ];

  function ladder() {
    var shown = [1, 2, 4, 8, 16];
    var out = '';
    shown.forEach(function (v, i) {
      out += (i ? '<span class="ladder-arrow" aria-hidden="true">→</span>' : '') +
        '<span class="ladder-step">' + v + '</span>';
    });
    out += '<span class="ladder-tail">' +
      '<span class="ladder-arrow" aria-hidden="true">→</span>' +
      '<span class="ladder-gap" aria-hidden="true">…</span>' +
      '<span class="ladder-arrow" aria-hidden="true">→</span>' +
      '<span class="ladder-step is-last">1024</span>' +
    '</span>';
    return out;
  }

  function perfectDots() {
    var out = '';
    for (var t = 1; t <= 9; t += 1) {
      out += '<i class="' + (S.tableStar(t) >= 3 ? 'is-on' : '') + '"></i>';
    }
    return out;
  }

  function intro() {
    var unlocked = S.stationUnlocked();
    var cleared = S.stationCleared();
    var perfect = S.perfectTables();
    var rain = '';

    for (var i = 0; i < 18; i += 1) {
      rain += '<span style="left:' + (2 + i * 5.4).toFixed(1) + '%;--d:' + (i % 7) * 0.7 +
        's;--t:' + (5 + (i % 6)) + 's">' + (i % 2 ? '1' : '0') + '</span>';
    }

    var actions;
    if (!unlocked) {
      actions = '<button type="button" class="btn btn-primary" data-action="home">回星球点亮它' + UI.icon('arrow') + '</button>' +
        '<button type="button" class="btn btn-ghost" data-action="grid">先看完整九九表</button>';
    } else if (cleared) {
      actions = '<button type="button" class="btn btn-primary" data-action="station-start">再翻一次' + UI.icon('arrow') + '</button>' +
        '<button type="button" class="btn btn-ghost" data-action="shop" data-focus="binary">去皮肤馆</button>';
    } else {
      actions = '<button type="button" class="btn btn-primary" data-action="station-start">开始翻倍' + UI.icon('arrow') + '</button>' +
        '<button type="button" class="btn btn-ghost" data-action="home">先回星球</button>';
    }

    var status = unlocked
      ? '<span class="st-unlock is-on">' + UI.icon('check', 13) + '空间站已启动</span>'
      : '<span class="st-unlock">' + UI.icon('lock', 13) + '满星 <b>' + perfect + '</b> / 9 · 还差 <b>' +
        (9 - perfect) + '</b> 张表</span><span class="st-unlock-dots" aria-hidden="true">' + perfectDots() + '</span>';

    var foot = cleared
      ? '涂装已经到手 · 再翻一次，让灯塔满格'
      : unlocked
        ? '答对 ' + NEED + ' 题即可带走限定涂装「1024 灯塔」· 全对能让灯塔满格'
        : '九张表全部满星后，空间站才会启动 · 现在 ' + perfect + ' / 9';

    return '<section class="screen station-intro">' +
      '<div class="st-bar">' +
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回星球</button>' +
        '<span class="st-bar-tag">终局 · 第 10 个目的地</span>' +
      '</div>' +
      '<div class="st-hero">' +
        '<div class="st-rain" aria-hidden="true">' + rain + '</div>' +
        '<span class="st-hero-kicker"><i class="st-live"></i>1024 号空间站</span>' +
        '<h1 class="st-hero-title">把 <em>1</em> 翻倍十次<br>就是 <em>1024</em></h1>' +
        '<p class="st-hero-lede">九九表的最后一站。这里没有新口诀，只有一件事 —— 一直翻倍。</p>' +
        '<div class="ladder" aria-label="翻倍序列：1 到 1024">' + ladder() + '</div>' +
        '<div class="st-hero-status">' + status + '</div>' +
        '<div class="st-hero-actions">' + actions + '</div>' +
        '<p class="st-hero-foot">' + foot + '</p>' +
      '</div>' +
    '</section>';
  }

  function chain(st) {
    var out = '';
    for (var i = 0; i < COUNT; i += 1) {
      var value = st.questions[i].product;
      var cls = 'pc-node';
      var label = '·';
      if (i < st.index) {
        cls += ' is-done';
        label = value;
      } else if (i === st.index) {
        if (st.locked) {
          cls += ' is-done is-just';
          label = value;
        } else {
          cls += ' is-now';
          label = '?';
        }
      }
      out += '<span class="' + cls + '">' + label + '</span>';
    }
    return out;
  }

  function stage(state) {
    var st = state.station;
    var q = st.questions[st.index];
    var options = q.options.map(function (value, index) {
      return '<button type="button" class="opt" data-action="station-answer" data-value="' + value +
        '" aria-label="选项 ' + (index + 1) + '：' + value + '">' +
        '<span class="key" aria-hidden="true">' + (index + 1) + '</span>' + value + '</button>';
    }).join('');

    return '<div class="station-hud">' +
        '<div class="st-hud-top">' +
          '<span class="st-hud-name"><i class="st-live"></i>1024 号空间站</span>' +
          '<span class="st-hud-step">第 <b>' + (st.index + 1) + '</b> / ' + COUNT + ' 次翻倍</span>' +
        '</div>' +
        '<div class="power-chain" role="img" aria-label="能量链，已翻倍 ' + st.index + ' 次，共 ' + COUNT + ' 次">' +
          chain(st) +
        '</div>' +
      '</div>' +
      '<div class="station-body">' +
        '<div class="qline" id="station-question-line" tabindex="-1" aria-label="第 ' + (st.index + 1) +
          ' 次翻倍，' + q.a + ' 乘以 ' + q.b + ' 等于几">' +
          '<span>' + q.a + '</span><span class="op">×</span><span>' + q.b + '</span>' +
          '<span class="op">=</span><span class="unknown">?</span></div>' +
        '<p class="question-hint">' + q.hint + '</p>' +
        '<div class="opts" role="group" aria-label="答案选项">' + options + '</div>' +
        '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '</div>';
  }

  function play(state) {
    return '<section class="screen station-play">' +
      '<div class="quiz-top">' +
        '<button type="button" class="back-btn" data-action="home" aria-label="退出终局关卡，回到首页">' +
          UI.icon('back', 15) + '退出</button>' +
        '<div class="st-top-label">' + UI.icon('bolt', 13) + '终局关卡</div>' +
        '<div class="streak-slot" aria-live="polite"></div>' +
      '</div>' +
      '<div class="quiz-card station-play-card">' +
        '<div class="station-stage">' + stage(state) + '</div>' +
      '</div>' +
    '</section>';
  }

  function syncChain(root, st) {
    var el = root.querySelector('.power-chain');
    if (el) el.innerHTML = chain(st);
  }

  function titleOf(r) {
    if (r.correct === COUNT) return '1024，点亮了';
    if (r.cleared) return '灯塔亮了 ' + r.correct + ' / 10 格';
    return '再翻几次就到了';
  }

  function subOf(r) {
    if (r.correct === COUNT) return '十次翻倍，一次不差。九颗星球的能量，全部汇进了灯塔。';
    if (r.cleared) return '涂装已经到手。想看到完整的 2¹⁰ = 1024，就再来一次。';
    if (r.correct >= 5) return '答对 8 题就能点亮灯塔。翻倍是有节奏的：1、2、4、8、16……';
    return '别急，从 1 开始，一次一次翻倍。再来一次就顺了。';
  }

  function rewardCard(r) {
    var owned = r.cleared;
    var need = Math.max(0, NEED - r.correct);
    var copy;
    if (r.firstClear) {
      copy = '刚刚解锁，已经帮你换上。黑色舱体上流动着荧光绿的 0 和 1 —— 这是空间站的涂装。';
    } else if (owned) {
      copy = '已经放进你的皮肤馆，随时可以换上。';
    } else {
      copy = '再答对 ' + need + ' 题，就能把这身涂装带走。';
    }

    return '<div class="reward-card' + (owned ? ' is-owned' : ' is-locked') + '">' +
      '<span class="reward-art">' +
        '<canvas id="reward-canvas" aria-hidden="true"></canvas>' +
        (owned ? '' : '<span class="reward-lock" aria-hidden="true">' + UI.icon('lock', 14) + '</span>') +
      '</span>' +
      '<span class="reward-copy">' +
        '<span class="reward-kicker">' + (r.firstClear ? '刚刚解锁' : '终局限定皮肤') + '</span>' +
        '<b class="reward-name">1024 灯塔</b>' +
        '<span class="reward-desc">' + copy + '</span>' +
      '</span>' +
      '<span class="reward-cta">' +
        (owned
          ? '<button type="button" class="btn" data-action="shop" data-focus="binary">去皮肤馆</button>'
          : '<span class="reward-need">还差 <b>' + need + '</b> 题</span>') +
      '</span>' +
    '</div>';
  }

  function result(state) {
    var r = state.stationResult;
    if (!r) return '';

    var rays = '';
    var planets = '';
    for (var i = 0; i < 9; i += 1) {
      rays += '<i class="finale-ray" data-i="' + i + '" style="--i:' + i + '"></i>';
      planets += '<span class="finale-planet" data-i="' + i + '" style="--i:' + i +
        ';--c:' + PLANET_COLORS[i] + '"></span>';
    }

    var review = '';
    if (r.wrong.length) {
      review = '<div class="station-review">' +
        '<h3>这几次翻倍再看一眼</h3>' +
        '<div class="sr-list">' +
          r.wrong.map(function (q) {
            return '<span>' + q.a + ' × ' + q.b + ' = ' + q.product + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    return '<section class="screen station-result">' +
      '<div class="finale-card" id="finale">' +
        '<div class="finale-stage">' +
          '<div class="finale-rays" aria-hidden="true">' + rays + '</div>' +
          '<div class="finale-planets" aria-hidden="true">' + planets + '</div>' +
          '<div class="finale-core">' +
            '<span class="fc-exp" id="fc-exp">2<sup>1</sup></span>' +
            '<b class="fc-num" id="fc-num">2</b>' +
            '<span class="fc-total">目标 1024</span>' +
          '</div>' +
        '</div>' +
        '<h1 class="finale-title">' + titleOf(r) + '</h1>' +
        '<p class="finale-sub">' + subOf(r) + '</p>' +
        '<div class="result-stats station-stats">' +
          '<div class="stat"><strong>' + r.correct + ' / ' + r.total + '</strong><span>答对题数</span></div>' +
          '<div class="stat"><strong>' + r.bestCombo + '</strong><span>最高连击</span></div>' +
          '<div class="stat"><strong>+' + r.earned + '</strong><span>收获星星</span></div>' +
        '</div>' +
        review +
      '</div>' +
      rewardCard(r) +
      (window.MPAwards ? window.MPAwards.strip(r.newBadges) : '') +
      '<div class="result-actions">' +
        '<button type="button" class="btn btn-primary" data-action="station-retry">再翻一次</button>' +
        '<button type="button" class="btn" data-action="awards">看看奖章墙</button>' +
        '<button type="button" class="btn" data-action="home">回星球</button>' +
      '</div>' +
    '</section>';
  }

  window.MPStationView = {
    intro: intro,
    play: play,
    stage: stage,
    syncChain: syncChain,
    result: result
  };
})();
