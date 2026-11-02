/* 除法森林 — 除法朗读与整表点读 */
(function () {
  'use strict';

  var S = window.DFStore;
  var A = window.DFAudio;
  var D = window.DFData;
  var UI = window.DFUI;
  var Learn = window.DFLearn;

  var state = null;
  var view = null;

  function attach(ctx) {
    state = ctx.state;
    view = ctx.view;
  }

  function current() {
    if (state.reading) stop();
    var b = state.learnB;
    S.markSeen(state.table, b);
    Learn.syncSeen(view, state);
    var label = view.querySelector('[data-action="speak-current"] span');
    if (label) {
      label.textContent = '正在读…';
      window.setTimeout(function () {
        if (label.isConnected) label.textContent = '听一听';
      }, 1400);
    }
    A.speak(D.speech(state.table, b));
  }

  function stop() {
    state.reading = false;
    state.readToken += 1;
    A.stopSpeak();
    Learn.markReading(view, 0, false);
    Learn.syncReadBtn(view, state);
  }

  function all() {
    if (state.reading) {
      stop();
      return;
    }
    var table = state.table;
    var token = state.readToken + 1;
    state.readToken = token;
    state.reading = true;
    Learn.syncReadBtn(view, state);

    function step(b) {
      if (!state.reading || token !== state.readToken || state.screen !== 'learn' || state.table !== table) return;
      if (b > 9) {
        state.reading = false;
        Learn.markReading(view, 0, false);
        Learn.syncReadBtn(view, state);
        return;
      }
      state.learnB = b;
      S.markSeen(table, b);
      Learn.update(view, state, b);
      Learn.syncSeen(view, state);
      Learn.markReading(view, b, true);
      A.speak(D.speech(table, b)).then(function () {
        if (token !== state.readToken) return;
        Learn.markReading(view, 0, false);
        step(b + 1);
      });
    }

    step(1);
  }

  function cell(el) {
    var a = Number(el.dataset.a);
    var b = Number(el.dataset.b);
    var lit = view.querySelectorAll('.cell.is-lit');
    for (var i = 0; i < lit.length; i += 1) {
      lit[i].classList.remove('is-lit');
    }
    el.classList.add('is-lit');
    S.markSeen(a, b);
    A.speak(D.speech(a, b));
    UI.toast((a * b) + ' ÷ ' + a + ' = ' + b + ' · ' + D.chant(a, b));
  }

  window.DFSpeak = {
    attach: attach,
    current: current,
    stop: stop,
    all: all,
    cell: cell
  };
})();
