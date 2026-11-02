/* 除法森林 — 终局：1024 丰收节（1024 对半分十次，剩下 1） */
(function () {
  'use strict';

  var D = window.DFData;
  var S = window.DFStore;
  var A = window.DFAudio;
  var UI = window.DFUI;
  var T = window.DFTree;

  var STEPS = 10;
  var ctx = null;

  function attach(context) {
    ctx = context;
  }

  function chainValues() {
    var out = [];
    for (var i = 0; i <= STEPS; i += 1) out.push(1024 / Math.pow(2, i));
    return out;
  }

  /* 干扰项：没分（原数）、分了两次（四分之一）、差一个整十 / 整百 */
  function halfOptions(x) {
    var h = x / 2;
    var step = h >= 100 ? 100 : h >= 20 ? 10 : 1;
    var first = D.shuffle([x, h / 2, h + step, h - step, h * 3]);
    var pool = first.concat([h + 2 * step, h + 1, h + 2, h + 3, h + 4]);
    var seen = {};
    seen[h] = true;
    var picked = [];
    pool.forEach(function (v) {
      if (picked.length < 3 && v >= 1 && v % 1 === 0 && !seen[v]) {
        seen[v] = true;
        picked.push(v);
      }
    });
    return D.shuffle(picked.concat(h));
  }

  /* 大数的一半拆开想：1024 = 1000 + 24，一半就是 500 + 12 */
  function halfHint(x) {
    var h = x / 2;
    if (x <= 18) return '想口诀：' + D.chant(2, h) + '，所以 ' + x + ' ÷ 2 = ' + h;
    var big = x >= 100 ? Math.floor(x / 100) * 100 : Math.floor(x / 10) * 10;
    var rest = x - big;
    return '想：' + big + ' 的一半是 ' + (big / 2) + '，' + rest + ' 的一半是 ' + (rest / 2) +
      '，合起来是 ' + h;
  }

  function questions() {
    var list = [];
    for (var i = 0; i < STEPS; i += 1) {
      var x = 1024 / Math.pow(2, i);
      list.push({ x: x, answer: x / 2, options: halfOptions(x), hint: halfHint(x) });
    }
    return list;
  }

  /* marks[i] 记录第 i 次对半分是否答对：结算时答对的那一格点亮，答错的标红 */
  function chain(active, marks) {
    return chainValues().map(function (v, i) {
      var cls;
      if (marks) cls = i === 0 || marks[i - 1] ? ' is-done' : ' is-miss';
      else cls = i < active ? ' is-done' : i === active ? ' is-now' : '';
      return (i ? '<i class="hv-arrow" aria-hidden="true">→</i>' : '') + '<span class="hv-node' + cls + '">' + v + '</span>';
    }).join('');
  }

  function introView() {
    var open = S.harvestUnlocked();
    var cleared = S.harvestCleared();
    var perfect = S.perfectTables();
    var status = open
      ? '<span class="hv-status is-open">' + UI.icon('check', 13) + (cleared ? '已通关 · 最好成绩 ' + S.harvestBest() + ' / 10' : '丰收节已开放') + '</span>'
      : '<span class="hv-status">' + UI.icon('lock', 13) + '还差 ' + (9 - perfect) + ' 张表满星 · 现在 ' + perfect + ' / 9</span>';

    return '<section class="screen harvest">' +
      '<div class="learn-head">' +
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回森林</button>' +
        '<span class="hv-crumb">终局 · 第 10 个目的地</span>' +
      '</div>' +
      '<div class="hv-panel">' +
        '<span class="hv-chip"><i></i>1024 丰收节</span>' +
        '<h1 class="hv-headline">把 <em>1024</em> 对半分十次<br>就剩下 <em>1</em></h1>' +
        '<p class="hv-lede">九张除法表的最后一站。森林收了 1024 颗松果，每一轮都平均分成两份 —— 这里只有一种除法：÷ 2。</p>' +
        '<div class="hv-chain" aria-label="1024 一路对半分到 1">' + chain(-1) + '</div>' +
        status +
        '<div class="hv-actions">' +
          (open
            ? '<button type="button" class="btn btn-harvest" data-action="harvest-start">开始对半分' + UI.icon('arrow') + '</button>'
            : '<button type="button" class="btn btn-harvest" data-action="start">先去闯关' + UI.icon('arrow') + '</button>') +
          '<button type="button" class="btn btn-ghost" data-action="home">先回森林</button>' +
        '</div>' +
        '<p class="hv-note">答对 8 题就能带走限定大树「丰收金树」· 全对让 1024 一路分到 1</p>' +
      '</div>' +
    '</section>';
  }

  function open() {
    ctx.haltQuiz();
    ctx.stopReading();
    var state = ctx.state;
    state.screen = 'harvest-intro';
    state.quiz = null;
    state.result = null;
    state.harvest = null;
    ctx.paint(introView(), 'harvest');
    A.tap();
  }

  function stage(run) {
    var q = run.questions[run.index];
    var options = q.options.map(function (value, index) {
      return '<button type="button" class="opt" data-action="harvest-answer" data-value="' + value +
        '" aria-label="选项 ' + (index + 1) + '：' + value + '">' +
        '<span class="key" aria-hidden="true">' + (index + 1) + '</span>' + value + '</button>';
    }).join('');
    return '<div class="quiz-meta">' +
        '<span>1024 丰收节 · <b>' + (run.index + 1) + ' / ' + run.questions.length + '</b></span>' +
        '<span class="quiz-tag">对半分</span>' +
      '</div>' +
      '<div class="qline" id="question-line" tabindex="-1" aria-label="第 ' + (run.index + 1) + ' 次对半分：' + q.x + ' 除以 2 等于几">' +
        '<span>' + q.x + '</span><span class="op">÷</span><span>2</span><span class="op">=</span><span class="unknown">?</span>' +
      '</div>' +
      '<p class="question-hint">把 ' + q.x + ' 颗松果平均分成两份，每份是多少？</p>' +
      '<div class="opts" role="group" aria-label="答案选项">' + options + '</div>' +
      '<div class="feedback" data-feedback aria-live="polite"></div>';
  }

  function quizView(run) {
    return '<section class="screen quiz harvest-quiz">' +
      '<div class="quiz-top">' +
        '<button type="button" class="back-btn" data-action="harvest" aria-label="退出丰收节">' + UI.icon('back', 15) + '退出</button>' +
        '<div class="hv-chain is-mini" aria-hidden="true">' + chain(run.index) + '</div>' +
        '<div class="streak-slot" aria-live="polite"></div>' +
      '</div>' +
      '<div class="quiz-card"><div class="quiz-stage">' + stage(run) + '</div></div>' +
    '</section>';
  }

  function focusQuestion() {
    var line = ctx.view.querySelector('#question-line');
    if (line) line.focus({ preventScroll: true });
  }

  function syncChain(run) {
    var box = ctx.view.querySelector('.hv-chain.is-mini');
    if (box) box.innerHTML = chain(run.index);
    var slot = ctx.view.querySelector('.streak-slot');
    if (slot) {
      slot.innerHTML = run.combo >= 2 ? '<span class="streak-badge">' + UI.icon('flame', 14) + '×' + run.combo + '</span>' : '';
    }
  }

  function start() {
    if (!S.harvestUnlocked()) {
      UI.toast('九张表都拿到 3 星，丰收节才会开放');
      return;
    }
    ctx.haltQuiz();
    ctx.stopReading();
    var state = ctx.state;
    state.harvest = {
      questions: questions(), index: 0, correct: 0, combo: 0, bestCombo: 0, marks: [],
      locked: false, autoTimer: null
    };
    state.screen = 'harvest';
    ctx.paint(quizView(state.harvest), 'harvest');
    syncChain(state.harvest);
    focusQuestion();
    A.tap();
  }

  function answer(btn) {
    var run = ctx.state.harvest;
    if (!run || run.locked) return;
    var q = run.questions[run.index];
    var value = Number(btn.dataset.value);
    var ok = value === q.answer;
    run.locked = true;
    run.marks[run.index] = ok;

    ctx.view.querySelectorAll('.opt').forEach(function (el) {
      el.disabled = true;
      if (Number(el.dataset.value) === q.answer) el.classList.add('is-correct');
      else if (el === btn) el.classList.add('is-wrong');
      else el.classList.add('is-dim');
    });

    var feedback = ctx.view.querySelector('[data-feedback]');
    if (ok) {
      run.correct += 1;
      run.combo += 1;
      if (run.combo > run.bestCombo) run.bestCombo = run.combo;
      A.correct();
      UI.starBurst(btn);
      feedback.className = 'feedback good';
      feedback.innerHTML = '<span>' + (run.index === STEPS - 1 ? '分到 1 啦！' : '分对啦，还剩 ' + q.answer + ' 颗') + '</span>' +
        '<span class="tip">' + q.x + ' ÷ 2 = <b>' + q.answer + '</b></span>' +
        '<button type="button" class="continue-btn" data-action="harvest-next">' + (run.index === STEPS - 1 ? '看结果' : '接着分') + '</button>';
      run.autoTimer = window.setTimeout(next, 2400);
    } else {
      run.combo = 0;
      A.wrong();
      feedback.className = 'feedback bad';
      feedback.innerHTML = '<span>再想想，' + q.x + ' 的一半是 ' + q.answer + '</span>' +
        '<span class="tip">' + q.hint + '</span>' +
        '<button type="button" class="continue-btn" data-action="harvest-next">记住啦，继续</button>';
      var nextBtn = ctx.view.querySelector('.continue-btn');
      if (nextBtn) nextBtn.focus({ preventScroll: true });
    }
    syncChain(run);
  }

  function next() {
    var run = ctx.state.harvest;
    if (!run || ctx.state.screen !== 'harvest') return;
    if (run.autoTimer) {
      window.clearTimeout(run.autoTimer);
      run.autoTimer = null;
    }
    if (run.index >= run.questions.length - 1) {
      finish();
      return;
    }
    run.index += 1;
    run.locked = false;
    var box = ctx.view.querySelector('.quiz-stage');
    if (box) box.innerHTML = stage(run);
    syncChain(run);
    focusQuestion();
  }

  function finish() {
    var state = ctx.state;
    var run = state.harvest;
    if (!run) return;
    var saved = S.recordHarvest({ correct: run.correct, total: run.questions.length, bestCombo: run.bestCombo });
    var newBadges = window.DFAwards ? window.DFAwards.sync() : [];
    state.screen = 'harvest-result';
    state.harvest = null;
    UI.syncStars(true);
    A.harvest();
    UI.confetti(run.correct >= 8 ? 72 : 36);
    ctx.paint(resultView(run, saved, newBadges), 'harvest');
  }

  function resultView(run, saved, newBadges) {
    var stars = '';
    for (var i = 0; i < 3; i += 1) stars += UI.star(56, 'result-star' + (i < saved.rating ? ' is-on' : ''));
    var full = run.correct === run.questions.length;
    var title = saved.firstClear ? '丰收金树种下啦！'
      : full ? '1024 一路分到了 1'
      : run.correct >= 8 ? '丰收节通关'
      : '再分一次就成功了';
    var sub = full
      ? '十次对半分全对：1024 ÷ 2 ÷ 2 …… ÷ 2 = 1。1024 正好是 10 个 2 连乘。'
      : run.correct >= 8
        ? '答对 ' + run.correct + ' 题。想让 1024 一路分到 1，就把每一步都分对。'
        : '答对 8 题就能通关。大数先拆开：1000 的一半是 500，24 的一半是 12。';
    var gold = window.DFSkins.byId('gold');
    var reward = saved.firstClear && gold
      ? '<button type="button" class="hv-reward" data-action="shop" data-focus="gold">' +
          '<span class="hv-reward-art" aria-hidden="true">' + T.scene(gold, { thumb: true }) + '</span>' +
          '<span class="hv-reward-copy"><b>限定大树「丰收金树」已种进苗圃</b><span>去苗圃把它种到首页吧</span></span>' +
          '<span class="rs-go">去苗圃' + UI.icon('arrow', 14) + '</span>' +
        '</button>'
      : '';

    return '<section class="screen result harvest-result">' +
      '<div class="result-card">' +
        '<div class="result-stars" role="img" aria-label="获得 ' + saved.rating + ' 颗星">' + stars + '</div>' +
        '<h1 class="result-title">' + title + '</h1>' +
        '<p class="result-sub">' + sub + '</p>' +
        '<div class="hv-chain is-result" aria-hidden="true">' + chain(-1, run.marks) + '</div>' +
        '<div class="result-stats">' +
          '<div class="stat"><strong>' + run.correct + ' / ' + run.questions.length + '</strong><span>答对题数</span></div>' +
          '<div class="stat"><strong>' + run.bestCombo + '</strong><span>最高连击</span></div>' +
          '<div class="stat"><strong>+' + saved.earned + '</strong><span>收获松果</span></div>' +
        '</div>' +
        reward +
        (window.DFAwards ? window.DFAwards.strip(newBadges) : '') +
        '<div class="result-actions">' +
          '<button type="button" class="btn btn-primary" data-action="harvest-start">再分一次</button>' +
          '<button type="button" class="btn" data-action="home">回森林</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  window.DFHarvest = {
    attach: attach,
    open: open,
    start: start,
    answer: answer,
    next: next,
    halfOptions: halfOptions,
    halfHint: halfHint
  };
})();
