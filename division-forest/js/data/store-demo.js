/* 除法森林 — 演示模式示例数据 */
(function () {
  'use strict';

  /**
   * 生成一份稳定、可信的示例记录：约 90 题，分布在最近 7 天。
   * 键是「除数-商」：56÷7、56÷8、42÷6 这些难题正确率明显偏低，让报告页有真实的薄弱点可展示。
   */
  function seed(data, dayKey) {
    var accuracy = [0.97, 0.95, 0.92, 0.9, 0.87, 0.78, 0.66, 0.7, 0.81];
    var focus = [[7, 8], [6, 7], [8, 9], [8, 7], [9, 6]];
    var state = 20241024;
    function rnd() {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    }
    var now = new Date();
    for (var back = 6; back >= 0; back -= 1) {
      var date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
      var day = { q: 0, c: 0, ms: 0 };
      var count = 9 + Math.floor(rnd() * 8);
      for (var i = 0; i < count; i += 1) {
        var a;
        var b;
        if (rnd() < 0.26) {
          var pick = focus[Math.floor(rnd() * focus.length)];
          a = pick[0];
          b = pick[1];
        } else {
          a = 1 + Math.floor(rnd() * 9);
          b = 1 + Math.floor(rnd() * 9);
        }
        var p = accuracy[a - 1] + (rnd() - 0.5) * 0.2;
        if ((a === 7 && b === 8) || (a === 8 && b === 7)) p -= 0.3;
        if (a === 6 && b === 7) p -= 0.18;
        if (a === 8 && b === 9) p -= 0.12;
        var ok = rnd() < p;
        var ms = 1700 + Math.floor(rnd() * 6400);
        if (a >= 6) ms += 900;
        var fk = a + '-' + b;
        var f = data.stats.facts[fk];
        if (!f) {
          f = { r: 0, w: 0, ms: 0, last: 0 };
          data.stats.facts[fk] = f;
        }
        if (ok) f.r += 1; else f.w += 1;
        f.ms += ms;
        f.last = date.getTime();
        day.q += 1;
        if (ok) day.c += 1;
        day.ms += ms;
      }
      data.stats.days[dayKey(date)] = day;
    }

    /* 历史错过的题进入待巩固，演示报告可以直接展示可重练清单 */
    Object.keys(data.stats.facts).forEach(function (key) {
      var f = data.stats.facts[key];
      if (!f.w) return;
      var m = data.stats.mastery[key];
      if (!m) {
        m = { streak: 0, pending: true, wrongAt: 0, clearedAt: 0, lastAt: 0 };
        data.stats.mastery[key] = m;
      }
      m.pending = true;
      m.wrongAt = Math.max(m.wrongAt, f.last || 0);
      m.lastAt = Math.max(m.lastAt, f.last || 0);
    });
  }

  window.DFStoreDemo = { seed: seed };
})();
