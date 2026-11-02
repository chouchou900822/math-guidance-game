/* 除法森林 — 音效与中文朗读 */
(function () {
  'use strict';

  var ctx = null;
  var enabled = true;
  var voices = [];
  var pendingResolve = null;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    try {
      voices = window.speechSynthesis.getVoices() || [];
    } catch (err) {
      voices = [];
    }
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  function ensureContext() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch (err) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, delay, duration, type, volume) {
    if (!enabled) return;
    var context = ensureContext();
    if (!context) return;
    var start = context.currentTime + delay;
    var osc = context.createOscillator();
    var gain = context.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume || 0.09, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  }

  function finishPending() {
    if (pendingResolve) {
      var fn = pendingResolve;
      pendingResolve = null;
      fn();
    }
  }

  function stopSpeak() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (err) { /* noop */ }
    }
    finishPending();
  }

  function pickVoice() {
    if (!voices.length) loadVoices();
    var zh = voices.filter(function (voice) {
      return /^zh[-_]?CN/i.test(voice.lang) || /Chinese|中文|普通话|Tingting|Xiaoxiao/i.test(voice.name);
    });
    if (zh.length) return zh[0];
    var anyZh = voices.filter(function (voice) { return /^zh/i.test(voice.lang); });
    return anyZh[0] || null;
  }

  /**
   * 朗读一句口诀，返回 Promise。关闭声音、不支持语音或超时都会 resolve，
   * 保证「整表朗读」的循环不会卡住。
   */
  function speak(text, options) {
    options = options || {};
    return new Promise(function (resolve) {
      if (!enabled || !text) {
        window.setTimeout(resolve, 420);
        return;
      }
      if (!('speechSynthesis' in window)) {
        window.setTimeout(resolve, 700);
        return;
      }

      stopSpeak();

      var done = false;
      function finish() {
        if (done) return;
        done = true;
        if (pendingResolve === finish) pendingResolve = null;
        resolve();
      }
      pendingResolve = finish;

      try {
        var utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN';
        utter.rate = options.rate || 0.82;
        utter.pitch = options.pitch || 1.12;
        utter.volume = 1;
        var voice = pickVoice();
        if (voice) utter.voice = voice;
        utter.onend = finish;
        utter.onerror = finish;
        window.speechSynthesis.speak(utter);
        window.setTimeout(finish, Math.max(2200, text.length * 480 + 1200));
      } catch (err) {
        window.setTimeout(finish, 500);
      }
    });
  }

  window.DFAudio = {
    unlock: function () { ensureContext(); },

    setEnabled: function (next) {
      enabled = !!next;
      if (!enabled) stopSpeak();
    },

    isEnabled: function () { return enabled; },

    tap: function () {
      tone(620, 0, 0.07, 'sine', 0.05);
    },

    correct: function () {
      tone(659.25, 0, 0.14, 'triangle', 0.09);
      tone(880, 0.08, 0.16, 'triangle', 0.08);
      tone(1174.66, 0.16, 0.24, 'triangle', 0.07);
    },

    wrong: function () {
      tone(246.94, 0, 0.16, 'triangle', 0.09);
      tone(196, 0.13, 0.24, 'triangle', 0.08);
    },

    star: function () {
      tone(1046.5, 0, 0.1, 'sine', 0.05);
      tone(1318.5, 0.07, 0.14, 'sine', 0.05);
    },

    win: function () {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (freq, i) {
        tone(freq, i * 0.11, 0.26, 'triangle', 0.09);
      });
    },

    /* 1024 丰收节：对半分十次，音阶一级一级落下来，最后一个亮和弦收尾 */
    harvest: function () {
      [1046.5, 987.77, 880, 783.99, 698.46, 659.25, 587.33, 523.25, 493.88, 440].forEach(function (freq, i) {
        tone(freq, i * 0.15, 0.26, 'triangle', 0.05);
      });
      [523.25, 659.25, 783.99, 1046.5].forEach(function (freq) {
        tone(freq, 1.62, 0.6, 'sine', 0.045);
      });
    },

    /* 「分一分」每分一轮的轻响 */
    deal: function (step) {
      tone(523.25 + (step % 6) * 65.4, 0, 0.09, 'triangle', 0.05);
    },

    egg: function (kind, charged) {
      if (charged) {
        [523.25, 659.25, 783.99].forEach(function (freq, i) {
          tone(freq, 0.32 + i * 0.12, 0.2, 'sine', 0.026);
        });
      }
      if (kind === 'ocean') {
        [261.63, 392, 523.25].forEach(function (freq, i) {
          tone(freq, i * 0.1, 0.36, 'sine', 0.035);
        });
        return;
      }
      if (kind === 'forest') {
        [783.99, 1174.66, 987.77].forEach(function (freq, i) {
          tone(freq, i * 0.11, 0.12, 'sine', 0.035);
        });
        return;
      }
      if (kind === 'candy') {
        [659.25, 783.99, 659.25, 1046.5].forEach(function (freq, i) {
          tone(freq, i * 0.09, 0.1, 'triangle', 0.036);
        });
        return;
      }
      if (kind === 'space') {
        [392, 587.33, 880].forEach(function (freq, i) {
          tone(freq, i * 0.16, 0.42, 'sine', 0.03);
        });
        return;
      }
      if (kind === 'pop') {
        tone(880, 0, 0.08, 'sine', 0.06);
        tone(587.33, 0.06, 0.14, 'sine', 0.05);
        return;
      }
      if (kind === 'boom') {
        tone(82.41, 0, 0.34, 'sine', 0.12);
        tone(123.47, 0.02, 0.24, 'triangle', 0.07);
        tone(174.61, 0.06, 0.18, 'triangle', 0.04);
        return;
      }
      if (kind === 'glass') {
        tone(1567.98, 0, 0.12, 'sine', 0.045);
        tone(2093, 0.05, 0.16, 'sine', 0.035);
        tone(2637, 0.1, 0.2, 'sine', 0.025);
        return;
      }
      if (kind === 'digital') {
        [440, 880, 440, 1320].forEach(function (freq, i) {
          tone(freq, i * 0.07, 0.07, 'square', 0.03);
        });
        return;
      }
      if (kind === 'whoosh') {
        [329.63, 392, 493.88, 659.25].forEach(function (freq, i) {
          tone(freq, i * 0.06, 0.2, 'sine', 0.035);
        });
        return;
      }
      if (kind === 'halve') {
        [2093, 1567.98, 1174.66, 880, 659.25, 523.25, 392, 293.66, 220, 164.81].forEach(function (freq, i) {
          tone(freq, i * 0.28, 0.2, 'sine', 0.035);
        });
        tone(1046.5, 3.05, 0.5, 'triangle', 0.05);
        return;
      }
      if (kind === 'sparkle') {
        [1046.5, 1318.5, 1567.98, 2093].forEach(function (freq, i) {
          tone(freq, i * 0.05, 0.12, 'sine', 0.04);
        });
        return;
      }
      tone(523.25, 0, 0.18, 'triangle', 0.06);
      tone(783.99, 0.09, 0.26, 'triangle', 0.05);
    },

    speak: speak,
    stopSpeak: stopSpeak
  };
})();
