/* 乘法星球 — 1024 号空间站流程 */
(function () {
  'use strict';

  var D = window.MPData;
  var S = window.MPStore;
  var A = window.MPAudio;
  var UI = window.MPUI;
  var View = window.MPStationView;

  var COUNT = 10;
  var NEED_CLEAR = 8;
  var ctx = null;

  function attach(context) {
    ctx = context;
  }

  function focusQuestion() {
    var line = ctx.view.querySelector('#station-question-line');
    if (line) line.focus({ preventScroll: true });
  }

  /* 四选一：正确答案 + 三倍、一半、一倍半，都是「翻倍时容易算错」的数 */
  function optionsFor(product) {
    var pool = [product * 2, product / 2, product * 1.5, product + 2, product - 2, product + 10];
    var out = [];
    pool.forEach(function (value) {
      var v = Math.round(value);
      if (v > 0 && v !== product && out.indexOf(v) < 0) out.push(v);
    });
    out = D.shuffle(out).slice(0, 3);
    return D.shuffle(out.concat(product));
  }

  /**
   * 固定 10 题：1×2、2×2、4×2 …… 512×2。
   * 每题只做一件事 —— 把上一个答案翻一倍，最后落在 1024。
   */
  function questions() {
    var out = [];
    for (var i = 0; i < COUNT; i += 1) {
      var a = Math.pow(2, i);
      var product = a * 2;
      out.push({
        id: 'station-' + i,
        a: a,
        b: 2,
        product: product,
        answer: product,
        options: optionsFor(product),
        hint: i === 0 ? '从 1 开始：1 × 2 就是 2' : '把 ' + a + ' 再翻一倍'
      });
    }
    return out;
  }

  function clearTimer() {
    if (ctx && ctx.state.station && ctx.state.station.autoTimer) {
      window.clearTimeout(ctx.state.station.autoTimer);
      ctx.state.station.autoTimer = null;
    }
  }

  function open() {
    if (!ctx) return;
    ctx.haltQuiz();
    ctx.stopReading();
    clearTimer();
    var state = ctx.state;
    state.quiz = null;
    state.result = null;
    state.station = null;
    state.stationResult = null;
    state.screen = 'station-intro';
    ctx.paint(View.intro(state), 'station');
    A.tap();
  }

  function start() {
    if (!ctx) return;
    if (!S.stationUnlocked()) {
      UI.toast('还差 ' + (9 - S.perfectTables()) + ' 张表满星，空间站才能启动');
      return;
    }
    ctx.haltQuiz();
    ctx.stopReading();
    clearTimer();
    var state = ctx.state;
    state.quiz = null;
    state.result = null;
    state.stationResult = null;
    state.station = {
      questions: questions(),
      index: 0,
      correct: 0,
      combo: 0,
      bestCombo: 0,
      answers: [],
      locked: false,
      autoTimer: null
    };
    state.screen = 'station';
    ctx.paint(View.play(state), 'station-play');
    focusQuestion();
    A.tap();
  }

  function answer(btn) {
    var state = ctx.state;
    var st = state.station;
    if (!st || st.locked) return;

    var q = st.questions[st.index];
    var value = Number(btn.dataset.value);
    var ok = value === q.answer;
    st.locked = true;

    var opts = ctx.view.querySelectorAll('.opt');
    for (var i = 0; i < opts.length; i += 1) {
      var el = opts[i];
      el.disabled = true;
      if (Number(el.dataset.value) === q.answer) {
        el.classList.add('is-correct');
      } else if (el === btn) {
        el.classList.add('is-wrong');
      } else {
        el.classList.add('is-dim');
      }
    }

    var feedback = ctx.view.querySelector('[data-feedback]');
    st.answers.push({ question: q, value: value, correct: ok });

    if (ok) {
      st.correct += 1;
      st.combo += 1;
      if (st.combo > st.bestCombo) st.bestCombo = st.combo;
      A.correct();
      UI.starBurst(btn);
      var praise = st.index === COUNT - 1 ? '1024！' : st.combo >= 3 ? '连续翻倍 ' + st.combo + ' 次' : '翻倍成功';
      feedback.className = 'feedback good';
      feedback.innerHTML = '<span>' + praise + '</span><span class="tip">' + q.a + ' × ' + q.b +
        ' = <b>' + q.product + '</b></span>' +
        '<button type="button" class="continue-btn" data-action="station-next">继续</button>';
      window.MPQuiz.syncStreak(ctx.view, st);
      View.syncChain(ctx.view, st);
      st.autoTimer = window.setTimeout(function () {
        if (state.station !== st) return;
        next();
      }, 2400);
    } else {
      st.combo = 0;
      A.wrong();
      feedback.className = 'feedback bad';
      feedback.innerHTML = '<span>再翻一次：' + q.a + ' × ' + q.b + ' = ' + q.product + '</span>' +
        '<span class="tip">翻倍，就是把上一个数再乘 2</span>' +
        '<button type="button" class="continue-btn" data-action="station-next">记住啦，继续</button>';
      window.MPQuiz.syncStreak(ctx.view, st);
      View.syncChain(ctx.view, st);
      var nextBtn = ctx.view.querySelector('.continue-btn');
      if (nextBtn) nextBtn.focus({ preventScroll: true });
    }
  }

  function next() {
    var state = ctx.state;
    var st = state.station;
    if (!st || state.screen !== 'station') return;

    if (st.autoTimer) {
      window.clearTimeout(st.autoTimer);
      st.autoTimer = null;
    }
    if (st.index >= st.questions.length - 1) {
      finish();
      return;
    }

    st.index += 1;
    st.locked = false;
    var stage = ctx.view.querySelector('.station-stage');
    if (stage) stage.innerHTML = View.stage(state);
    window.MPQuiz.syncStreak(ctx.view, st);
    focusQuestion();
  }

  /* 九颗星球的能量依次汇入灯塔，数字一路翻倍到 2^10 */
  function mountResult(root, r) {
    var stage = root.querySelector('#finale');
    if (!stage) return;

    var skin = window.MPSkins.byId('binary');
    var canvas = root.querySelector('#reward-canvas');
    if (canvas && skin) window.MPPlanet.paint(canvas, skin, 0.7, { max: 220, zoom: 1.12 });

    var num = stage.querySelector('#fc-num');
    var exp = stage.querySelector('#fc-exp');
    var steps = Math.max(0, Math.min(COUNT, r.correct));
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function light(i) {
      var ray = stage.querySelector('.finale-ray[data-i="' + i + '"]');
      var planet = stage.querySelector('.finale-planet[data-i="' + i + '"]');
      if (ray) ray.classList.add('is-on');
      if (planet) planet.classList.add('is-on');
      if (num) {
        num.textContent = Math.pow(2, i + 1);
        num.classList.remove('is-pop');
        void num.offsetWidth;
        num.classList.add('is-pop');
      }
      if (exp) exp.innerHTML = '2<sup>' + (i + 1) + '</sup>';
    }

    function complete() {
      if (!stage.isConnected) return;
      if (num) num.textContent = Math.pow(2, steps);
      if (exp) exp.innerHTML = '2<sup>' + steps + '</sup>';
      stage.classList.add('is-done');
      if (steps === COUNT) stage.classList.add('is-full');
      if (r.cleared) {
        stage.classList.add('is-cleared');
        A.win();
        UI.confetti(56);
      }
    }

    if (reduced) {
      for (var i = 0; i < steps; i += 1) light(i);
      complete();
      return;
    }

    if (steps === 0) {
      complete();
      return;
    }

    A.power();
    var step = 0;
    function tick() {
      if (!stage.isConnected) return;
      if (step >= steps) {
        complete();
        return;
      }
      light(step);
      step += 1;
      window.setTimeout(tick, 230);
    }
    window.setTimeout(tick, 380);
  }

  function finish() {
    var state = ctx.state;
    var st = state.station;
    if (!st) return;

    clearTimer();
    var saved = S.recordStation({
      correct: st.correct,
      total: st.questions.length,
      bestCombo: st.bestCombo
    });

    if (saved.firstClear) S.equipSkin('binary');

    state.stationResult = {
      correct: st.correct,
      total: st.questions.length,
      bestCombo: st.bestCombo,
      rating: saved.rating,
      earned: saved.earned,
      firstClear: saved.firstClear,
      cleared: saved.cleared,
      newBadges: window.MPAwards ? window.MPAwards.sync() : [],
      wrong: st.answers.filter(function (item) {
        return !item.correct;
      }).map(function (item) {
        return item.question;
      })
    };
    state.station = null;
    state.screen = 'station-result';

    UI.syncStars(true);
    ctx.paint(View.result(state), 'station-result');
    mountResult(ctx.view, state.stationResult);
  }

  window.MPStation = {
    COUNT: COUNT,
    NEED_CLEAR: NEED_CLEAR,
    attach: attach,
    open: open,
    start: start,
    answer: answer,
    next: next
  };
})();
