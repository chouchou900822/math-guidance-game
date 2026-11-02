/* 乘法星球 — 每日挑战：按日期生成固定的 8 道题 */
(function () {
  'use strict';

  var D = window.MPData;
  var COUNT = 8;
  var WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function key(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  /* FNV-1a：把日期变成稳定的种子，同一天任何人打开都是同一套题 */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function rng(seed) {
    var s = seed || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /**
   * 1×b 太简单，直接排除；6–9 之间的题再放一份，
   * 让每日挑战比普通闯关更像「挑战」，又不至于全是难题。
   */
  function pool() {
    var out = [];
    for (var a = 1; a <= 9; a += 1) {
      for (var b = 1; b <= 9; b += 1) {
        if (a === 1 || b === 1) continue;
        out.push([a, b]);
        if (a >= 6 && b >= 6) out.push([a, b]);
      }
    }
    return out;
  }

  function questions(date) {
    var today = key(date || new Date());
    var rand = rng(hash('multiplication-planet:' + today));
    var list = pool();

    for (var i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }

    var picked = [];
    var seen = {};
    for (var k = 0; k < list.length && picked.length < COUNT; k += 1) {
      var pair = list[k];
      var id = pair[0] + '-' + pair[1];
      if (seen[id]) continue;
      seen[id] = true;
      picked.push(pair);
    }

    return picked.map(function (pair, index) {
      var type = rand() < 0.28 ? 'missing' : 'product';
      var q = D.makeQuestion(pair[0], pair[1], type);
      q.number = index + 1;
      return q;
    });
  }

  function today() {
    var d = new Date();
    return {
      key: key(d),
      day: d.getDate(),
      month: d.getMonth() + 1,
      monthLabel: (d.getMonth() + 1) + ' 月',
      weekday: WEEKDAYS[d.getDay()],
      label: (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'
    };
  }

  window.MPDaily = {
    COUNT: COUNT,
    key: key,
    hash: hash,
    questions: questions,
    today: today
  };
})();
