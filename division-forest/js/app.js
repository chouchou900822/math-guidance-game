/* 除法森林 — 状态、路由与交互控制 */
(function () {
  'use strict';

  var D = window.DFData;
  var S = window.DFStore;
  var A = window.DFAudio;
  var UI = window.DFUI;
  var Home = window.DFHome;
  var Learn = window.DFLearn;
  var Play = window.DFPlay;
  var Skins = window.DFSkins;
  var Harvest = window.DFHarvest;
  var Stats = window.DFStats;
  var Report = window.DFReport;
  var About = window.DFAbout;
  var AwardsView = window.DFAwardsView;
  var Speak = window.DFSpeak;

  var view = document.getElementById('view');

  var SCOPES = {
    easy: { label: '÷1–5', tables: [1, 2, 3, 4, 5] },
    hard: { label: '÷6–9', tables: [6, 7, 8, 9] },
    all: { label: '÷1–9', tables: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  };

  var state = {
    screen: 'home', table: 2, learnB: 3, scope: 'easy',
    reading: false, readToken: 0, quiz: null, result: null,
    shareRound: 0, shareToken: 0, shareTimer: null, harvest: null
  };

  /* ---------- 基础 ---------- */

  function setHash(name) {
    try {
      window.history.replaceState(null, '', '#' + name);
    } catch (err) {
      /* file:// 下可能被限制，忽略 */
    }
  }

  function paint(html, hash) {
    window.DFEgg.stopAll();
    Learn.stopShare(state);
    view.innerHTML = html;
    document.body.classList.toggle('is-report', hash === 'report');
    document.body.classList.toggle('is-about', hash === 'about');
    document.body.classList.toggle('is-awards', hash === 'awards');
    if (hash) setHash(hash);
    window.scrollTo({ top: 0, behavior: 'auto' });
    view.focus({ preventScroll: true });
  }

  function haltQuiz() {
    [state.quiz, state.harvest].forEach(function (run) {
      if (run && run.autoTimer) {
        window.clearTimeout(run.autoTimer);
        run.autoTimer = null;
      }
    });
  }

  /* ---------- 首页 ---------- */

  function renderHome() {
    haltQuiz();
    Speak.stop();
    state.screen = 'home';
    state.quiz = null;
    state.result = null;
    state.harvest = null;
    paint(Home.view(state, SCOPES), 'home');
    Home.mount(view);
  }

  /* ---------- 皮肤馆 ---------- */

  function openShop(focusId) {
    haltQuiz();
    Speak.stop();
    state.screen = 'shop';
    state.quiz = null;
    state.result = null;
    state.harvest = null;
    if (focusId) Skins.focus(focusId);
    paint(Skins.view(state), 'shop');
    Skins.mount(view);
    A.tap();
  }

  /* ---------- 学习报告 ---------- */

  function openReport() {
    haltQuiz();
    Speak.stop();
    state.screen = 'report';
    state.quiz = null;
    state.result = null;
    state.harvest = null;
    paint(Report.view(state), 'report');
    Report.mount(view);
  }

  /* ---------- 关于作品 ---------- */

  function openAbout() {
    haltQuiz();
    Speak.stop();
    state.screen = 'about';
    state.quiz = null;
    state.result = null;
    state.harvest = null;
    paint(About.view(state), 'about');
    About.mount(view);
  }

  /* ---------- 奖章墙 ---------- */

  function openAwards() {
    haltQuiz();
    Speak.stop();
    /* 把刚达成的奖章先补记上，保证获得日期准确 */
    if (window.DFAwards) window.DFAwards.sync();
    state.screen = 'awards';
    state.quiz = null;
    state.result = null;
    state.harvest = null;
    paint(AwardsView.view(state), 'awards');
  }

  /* ---------- 学习页 ---------- */

  function openLearn(table) {
    haltQuiz();
    Speak.stop();
    state.table = Math.min(9, Math.max(1, table || 1));
    state.learnB = 3;
    state.shareRound = 0;
    state.screen = 'learn';
    paint(Learn.view(state), 'learn-' + state.table);
    Learn.centerTabs(view);
  }

  function selectB(b) {
    if (state.reading) Speak.stop();
    S.markSeen(state.table, b);
    Learn.update(view, state, b);
    Learn.syncSeen(view, state);
    A.speak(D.speech(state.table, b));
  }

  /* ---------- 整张除法表 ---------- */

  function openGrid() {
    haltQuiz();
    Speak.stop();
    state.screen = 'grid';
    paint(Learn.gridView(), 'grid');
  }

  /* ---------- 事件 ---------- */

  function setScope(scope) {
    state.scope = scope;
    var buttons = document.querySelectorAll('.scope-btn');
    for (var i = 0; i < buttons.length; i += 1) {
      var on = buttons[i].dataset.scope === scope;
      buttons[i].classList.toggle('is-active', on);
      buttons[i].setAttribute('aria-pressed', String(on));
    }
    A.tap();
  }

  function toggleSound() {
    var nextOn = !A.isEnabled();
    if (!nextOn) Speak.stop();
    A.setEnabled(nextOn);
    S.setMuted(!nextOn);
    UI.syncSound();
    if (nextOn) A.tap();
  }

  /* 动作表在 app-actions.js，运行时通过这个上下文取视图与模块 */
  window.DFAppCtx = {
    state: state, view: view, S: S, UI: UI, Play: Play, Speak: Speak, Stats: Stats, Learn: Learn,
    Skins: Skins, Harvest: Harvest, Report: Report, About: About, openShop: openShop,
    openReport: openReport, openAbout: openAbout, openAwards: openAwards, openLearn: openLearn,
    openGrid: openGrid, renderHome: renderHome, setScope: setScope, selectB: selectB,
    toggleSound: toggleSound
  };


  function handleClick(event) {
    var target = event.target.closest('[data-action]');
    if (!target) return;
    var action = window.DFAppActions[target.dataset.action];
    if (!action) return;
    if (target.tagName === 'A') event.preventDefault();
    action(target);
  }

  function handleKeydown(event) {
    var quiz = state.screen === 'quiz' ? state.quiz
      : state.screen === 'harvest' ? state.harvest : null;
    if (!quiz || quiz.locked) return;
    if (event.key < '1' || event.key > '4') return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    var opts = view.querySelectorAll('.opt');
    var target = opts[Number(event.key) - 1];
    if (!target) return;
    event.preventDefault();
    if (state.screen === 'quiz') Play.answer(target);
    else Harvest.answer(target);
  }

  /* ---------- 演示模式 ---------- */

  function initDemo() {
    var on = false;
    try {
      on = new URLSearchParams(window.location.search).get('demo') === '1';
    } catch (err) {
      on = /[?&]demo=1(?:&|$)/.test(window.location.search || '');
    }
    if (!on) return;
    S.setDemo(true);
    document.body.classList.add('is-demo');
  }

  /* ---------- 启动 ---------- */

  function init() {
    initDemo();
    /* 老玩家打开时，把此前已经达成的奖章补记上，不弹提示 */
    if (window.DFAwards) window.DFAwards.sync();
    A.setEnabled(!S.get().muted);
    UI.syncSound();
    UI.syncStars(false);
    UI.buildSky();
    Speak.attach({ state: state, view: view });

    Play.attach({
      state: state, view: view, scopes: SCOPES,
      paint: paint, haltQuiz: haltQuiz, stopReading: Speak.stop
    });

    Harvest.attach({
      state: state, view: view, paint: paint,
      haltQuiz: haltQuiz, stopReading: Speak.stop
    });

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('pointerdown', function () {
      A.unlock();
    }, { once: true, passive: true });

    var hash = (window.location.hash || '').replace(/^#\/?/, '');
    var learnMatch = /^learn-([1-9])$/.exec(hash);
    if (learnMatch) {
      openLearn(Number(learnMatch[1]));
      return;
    }
    if (hash === 'grid') {
      openGrid();
      return;
    }
    if (hash === 'shop') {
      openShop();
      return;
    }
    if (hash === 'harvest') {
      Harvest.open();
      return;
    }
    if (hash === 'report') {
      openReport();
      return;
    }
    if (hash === 'about') {
      openAbout();
      return;
    }
    if (hash === 'awards') {
      openAwards();
      return;
    }
    renderHome();
  }

  init();
})();
