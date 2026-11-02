/* 除法森林 — 闯关流程控制 */
(function () {
  'use strict';

  var D = window.DFData;
  var S = window.DFStore;
  var A = window.DFAudio;
  var UI = window.DFUI;
  var Quiz = window.DFQuiz;

  var ctx = null;

  function attach(context) {
    ctx = context;
  }

  /* 换题后把焦点交给题干，键盘和读屏用户不会掉回页面顶部 */
  function focusQuestion(root) {
    var line = root.querySelector('#question-line');
    if (line) line.focus({ preventScroll: true });
  }

  /* 两种入口共用：正式闯关与错题重练 */
  function begin(quiz) {
    var state = ctx.state;
    quiz.index = 0;
    quiz.correct = 0;
    quiz.combo = 0;
    quiz.bestCombo = 0;
    quiz.answers = [];
    quiz.locked = false;
    quiz.autoTimer = null;
    quiz.qStartedAt = Date.now();

    state.quiz = quiz;
    state.result = null;
    state.screen = 'quiz';

    ctx.paint(Quiz.view(state), 'play');
    Quiz.syncProgress(ctx.view, quiz);
    Quiz.syncStreak(ctx.view, quiz);
    focusQuestion(ctx.view);
  }

  function start(scope, table) {
    ctx.haltQuiz();
    ctx.stopReading();

    var tables;
    var label;
    if (scope === 'table') {
      tables = [table];
      label = '÷' + table + ' 的表';
    } else {
      if (!ctx.scopes[scope]) scope = 'easy';
      tables = ctx.scopes[scope].tables;
      label = ctx.scopes[scope].label;
    }

    begin({
      tables: tables,
      scope: scope,
      table: scope === 'table' ? table : null,
      label: label,
      kind: 'quiz',
      questions: D.makeQuiz(tables, Quiz.COUNT)
    });
  }

  /* 只练错题：题目由报告页给出，不重新随机 */
  function startReview(list) {
    if (!list || !list.length) {
      UI.toast('还没有可以重练的题');
      return;
    }
    ctx.haltQuiz();
    ctx.stopReading();

    var tables = [];
    var questions = [];

    list.slice(0, 10).forEach(function (item) {
      var a = Math.max(1, Math.min(9, Number(item.a) || 1));
      var b = Math.max(1, Math.min(9, Number(item.b) || 1));
      if (tables.indexOf(a) < 0) tables.push(a);
      questions.push(D.makeQuestion(a, b, 'quotient'));
    });

    begin({
      tables: tables,
      scope: 'review',
      table: null,
      label: '错题重练',
      kind: 'review',
      questions: questions
    });
    A.tap();
  }

  /* 每日挑战：8 道按日期固定的题，跨天才会换 */
  function startDaily() {
    if (!window.DFDaily) return;
    ctx.haltQuiz();
    ctx.stopReading();
    begin({
      tables: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      scope: 'daily',
      table: null,
      label: '每日挑战',
      kind: 'daily',
      questions: window.DFDaily.questions()
    });
    A.tap();
  }

  function answer(btn) {
    var state = ctx.state;
    var quiz = state.quiz;
    if (!quiz || quiz.locked) return;

    var q = quiz.questions[quiz.index];
    var value = Number(btn.dataset.value);
    var ok = value === q.answer;
    quiz.locked = true;

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
    var spent = quiz.qStartedAt ? Date.now() - quiz.qStartedAt : 0;
    quiz.answers.push({
      question: q,
      value: value,
      correct: ok,
      ms: Math.max(0, Math.min(30000, spent))
    });

    if (ok) {
      quiz.correct += 1;
      quiz.combo += 1;
      if (quiz.combo > quiz.bestCombo) quiz.bestCombo = quiz.combo;
      A.correct();
      UI.starBurst(btn);
      var praises = ['太棒了', '答对啦', '真厉害', '漂亮'];
      var praise = quiz.combo >= 3
        ? '连对 ' + quiz.combo + ' 题，太厉害了'
        : praises[Math.floor(Math.random() * praises.length)];
      feedback.className = 'feedback good';
      feedback.innerHTML = '<span>' + praise + '</span><span class="tip">' + Quiz.fact(q) + ' · 口诀 <b>' + q.chant + '</b></span>' +
        '<button type="button" class="continue-btn" data-action="next">下一题</button>';
      Quiz.syncStreak(ctx.view, quiz);
      /* 留出读完口诀的时间，也允许直接点「下一题」继续 */
      quiz.autoTimer = window.setTimeout(next, 2600);
    } else {
      quiz.combo = 0;
      A.wrong();
      feedback.className = 'feedback bad';
      feedback.innerHTML = '<span>再想想，正确答案是 ' + q.answer + '</span>' +
        '<span class="tip">想口诀 <b>' + q.chant + '</b>，所以 ' + Quiz.fact(q) + '</span>' +
        '<button type="button" class="continue-btn" data-action="next">记住啦，继续</button>';
      Quiz.syncStreak(ctx.view, quiz);
      var nextBtn = ctx.view.querySelector('.continue-btn');
      if (nextBtn) nextBtn.focus({ preventScroll: true });
    }
  }

  function next() {
    var state = ctx.state;
    var quiz = state.quiz;
    if (!quiz || state.screen !== 'quiz') return;

    if (quiz.autoTimer) {
      window.clearTimeout(quiz.autoTimer);
      quiz.autoTimer = null;
    }
    if (quiz.index >= quiz.questions.length - 1) {
      finish();
      return;
    }

    quiz.index += 1;
    quiz.locked = false;
    quiz.qStartedAt = Date.now();
    var stage = ctx.view.querySelector('.quiz-stage');
    if (stage) stage.innerHTML = Quiz.stage(state);
    Quiz.syncProgress(ctx.view, quiz);
    Quiz.syncStreak(ctx.view, quiz);
    focusQuestion(ctx.view);
  }

  function finish() {
    var state = ctx.state;
    var quiz = state.quiz;
    if (!quiz) return;
    ctx.haltQuiz();

    var items = quiz.answers.map(function (item) {
      return {
        a: item.question.a,
        b: item.question.b,
        ok: item.correct,
        ms: item.ms
      };
    });

    var payload = {
      tables: quiz.tables,
      kind: quiz.kind || 'quiz',
      correct: quiz.correct,
      total: quiz.questions.length,
      bestCombo: quiz.bestCombo,
      items: items
    };

    var saved = quiz.kind === 'daily' ? S.recordDaily(payload) : S.recordQuiz(payload);
    var newBadges = window.DFAwards ? window.DFAwards.sync() : [];

    var wrongQuestions = quiz.answers.filter(function (item) {
      return !item.correct;
    }).map(function (item) {
      return item.question;
    });

    /* 下一轮只练本轮仍错的除法，同一道题不重复出 */
    var reviewKeys = [];
    var seen = {};
    wrongQuestions.forEach(function (q) {
      var a = q.a;
      var b = q.b;
      var key = a + '-' + b;
      if (seen[key]) return;
      seen[key] = true;
      reviewKeys.push({ a: a, b: b });
    });

    /* 本轮全对但还没连续两轮巩固时，允许直接再来一轮把状态练稳 */
    var consolidateKeys = [];
    if (quiz.kind === 'review' && wrongQuestions.length === 0) {
      var marked = {};
      quiz.questions.forEach(function (q) {
        var a = q.a;
        var b = q.b;
        var key = a + '-' + b;
        var m = S.masteryOf(a, b);
        if (!marked[key] && m && m.pending) {
          marked[key] = true;
          consolidateKeys.push({ a: a, b: b });
        }
      });
    }

    state.result = {
      correct: quiz.correct,
      total: quiz.questions.length,
      bestCombo: quiz.bestCombo,
      rating: saved.rating || 0,
      earned: saved.earned,
      kind: quiz.kind || 'quiz',
      bonus: saved.bonus || 0,
      first: saved.first === true,
      streak: saved.streak || 0,
      newBadges: newBadges,
      reviewKeys: reviewKeys,
      consolidateKeys: consolidateKeys,
      wrong: wrongQuestions,
      scope: quiz.scope,
      table: quiz.table,
      tables: quiz.tables
    };

    state.screen = 'result';
    UI.syncStars(true);
    A.win();
    UI.confetti(48);
    ctx.paint(Quiz.result(state), 'result');
  }

  window.DFPlay = {
    attach: attach,
    start: start,
    startReview: startReview,
    startDaily: startDaily,
    answer: answer,
    next: next
  };
})();
