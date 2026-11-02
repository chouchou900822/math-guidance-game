/* 除法森林 — 界面动作表 */
(function () {
  'use strict';

  var C = window.DFAppCtx;
  var state = C.state;
  var view = C.view;
  var S = C.S;
  var UI = C.UI;
  var Play = C.Play;
  var Speak = C.Speak;
  var Stats = C.Stats;
  var Skins = C.Skins;
  var Harvest = C.Harvest;
  var Learn = C.Learn;
  var Report = C.Report;
  var About = C.About;
  var renderHome = C.renderHome;
  var openShop = C.openShop;
  var openReport = C.openReport;
  var openAbout = C.openAbout;
  var openAwards = C.openAwards;
  var openLearn = C.openLearn;
  var openGrid = C.openGrid;
  var setScope = C.setScope;
  var selectB = C.selectB;
  var toggleSound = C.toggleSound;

  function startCurrentReview() {
    var keys = state.result && state.result.reviewKeys;
    if (!keys || !keys.length) {
      openReport();
      return;
    }
    Play.startReview(keys);
  }

  var ACTIONS = {
    home: function () {
      renderHome();
    },
    start: function () {
      Play.start(state.scope);
    },
    scope: function (el) {
      setScope(el.dataset.scope);
    },
    'learn-table': function (el) {
      openLearn(Number(el.dataset.table) || 2);
    },
    'switch-table': function (el) {
      openLearn(Number(el.dataset.table));
    },
    'pick-b': function (el) {
      selectB(Number(el.dataset.b));
    },
    'share-step': function () {
      Learn.shareStep(view, state);
    },
    'share-all': function () {
      Learn.shareAll(view, state);
    },
    'share-reset': function () {
      Learn.resetShare(view, state);
    },
    'speak-current': function () {
      Speak.current();
    },
    'read-all': function () {
      Speak.all();
    },
    'practice-table': function () {
      Play.start('table', state.table);
    },
    grid: function () {
      openGrid();
    },
    'grid-cell': function (el) {
      Speak.cell(el);
    },
    answer: function (el) {
      Play.answer(el);
    },
    next: function () {
      Play.next();
    },
    retry: function (el) {
      Play.start(el.dataset.scope, el.dataset.table ? Number(el.dataset.table) : null);
    },
    'learn-from-result': function (el) {
      openLearn(Number(el.dataset.table));
    },
    report: function () {
      openReport();
    },
    about: function () {
      openAbout();
    },
    awards: function () {
      openAwards();
    },
    daily: function () {
      Play.startDaily();
    },
    'review-weak': function () {
      var list = Stats.reviewList(8);
      if (!list.length) {
        UI.toast('先闯一关，才有错题可以练');
        return;
      }
      Play.startReview(list);
    },
    'review-current': function () {
      startCurrentReview();
    },
    'review-consolidate': function () {
      var keys = state.result && state.result.consolidateKeys;
      if (!keys || !keys.length) {
        openReport();
        return;
      }
      Play.startReview(keys);
    },
    'review-again': function () {
      startCurrentReview();
    },
    'reset-stats': function () {
      Report.confirmReset(view);
    },
    'reset-stats-cancel': function () {
      Report.cancelReset(view);
    },
    'reset-stats-ok': function () {
      S.resetStats();
      UI.toast('学习记录已清空');
      openReport();
    },
    'print-report': function () {
      window.print();
    },
    bench: function () {
      About.bench(view);
    },
    shop: function (el) {
      openShop(el && el.dataset.focus);
    },
    harvest: function () {
      Harvest.open();
    },
    'harvest-start': function () {
      Harvest.start();
    },
    'harvest-answer': function (el) {
      Harvest.answer(el);
    },
    'harvest-next': function () {
      Harvest.next();
    },
    'skin-select': function (el) {
      Skins.select(view, el.dataset.skin);
      var stage = view.querySelector('.shop-stage');
      if (stage && stage.getBoundingClientRect().top < -80) {
        stage.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    },
    'skin-buy': function (el) {
      Skins.confirm(view, el.dataset.skin);
    },
    'skin-buy-ok': function (el) {
      Skins.buy(view, el.dataset.skin);
    },
    'skin-buy-cancel': function (el) {
      Skins.select(view, el.dataset.skin);
    },
    'skin-equip': function (el) {
      Skins.equip(view, el.dataset.skin);
    },
    'skin-greet': function () {
      Skins.greet();
    },
    'skin-awaken': function () {
      Skins.awaken();
    },
    'toggle-sound': function () {
      toggleSound();
    }
  };

  window.DFAppActions = ACTIONS;
})();
