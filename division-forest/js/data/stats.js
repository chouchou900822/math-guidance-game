/* 除法森林 — 学习数据聚合（给家长的报告） */
(function () {
  'use strict';

  var S = window.DFStore;
  var D = window.DFData;
  var Text = window.DFStatsText;

  var WEEKDAYS = '日一二三四五六';

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function dayKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  function blank() {
    return { r: 0, w: 0, ms: 0, n: 0, avg: 0, acc: 0 };
  }

  /* a 是除数（也就是题目所属的那张表），b 是商 */
  function raw(a, b) {
    var f = S.get().stats.facts[a + '-' + b];
    if (!f) return blank();
    var n = f.r + f.w;
    return {
      r: f.r,
      w: f.w,
      ms: f.ms,
      n: n,
      avg: n ? f.ms / n : 0,
      acc: n ? f.r / n : 0
    };
  }

  function tableRows() {
    var rows = [];
    for (var t = 1; t <= 9; t += 1) {
      var r = 0;
      var w = 0;
      var ms = 0;
      for (var b = 1; b <= 9; b += 1) {
        var v = raw(t, b);
        r += v.r;
        w += v.w;
        ms += v.ms;
      }
      var n = r + w;
      rows.push({
        table: t,
        r: r,
        w: w,
        ms: ms,
        n: n,
        avg: n ? ms / n : 0,
        acc: n ? r / n : 0,
        stars: S.tableStar(t),
        seen: S.seenInTable(t)
      });
    }
    return rows;
  }

  function factRows() {
    var rows = [];
    for (var a = 1; a <= 9; a += 1) {
      for (var b = 1; b <= 9; b += 1) {
        var v = raw(a, b);
        var m = S.masteryOf(a, b);
        rows.push({
          a: a,
          b: b,
          divisor: a,
          quotient: b,
          dividend: a * b,
          r: v.r,
          w: v.w,
          n: v.n,
          avg: v.avg,
          acc: v.acc,
          chant: D.chant(a, b),
          slow: false,
          pending: !!(m && m.pending),
          streak: m ? m.streak : 0,
          wrongAt: m ? m.wrongAt : 0,
          clearedAt: m ? m.clearedAt : 0
        });
      }
    }
    return rows;
  }

  function weekSeries(days) {
    var out = [];
    var now = new Date();
    for (var i = 6; i >= 0; i -= 1) {
      var d = addDays(now, -i);
      var key = dayKey(d);
      var v = days[key] || { q: 0, c: 0, ms: 0 };
      out.push({
        key: key,
        day: d.getDate(),
        month: d.getMonth() + 1,
        weekday: WEEKDAYS.charAt(d.getDay()),
        q: v.q,
        c: v.c,
        w: Math.max(0, v.q - v.c),
        ms: v.ms,
        acc: v.q ? v.c / v.q : 0,
        today: i === 0
      });
    }
    return out;
  }

  function sum(list, key) {
    var total = 0;
    for (var i = 0; i < list.length; i += 1) total += list[i][key] || 0;
    return total;
  }

  function computeStreak(days) {
    var streak = 0;
    var d = new Date();
    var today = days[dayKey(d)];
    if (!today || !today.q) d = addDays(d, -1);
    while (streak < 400) {
      var v = days[dayKey(d)];
      if (!v || !v.q) break;
      streak += 1;
      d = addDays(d, -1);
    }
    return streak;
  }

  function summary() {
    var stats = S.get().stats;
    var days = stats.days || {};
    var week = weekSeries(days);
    var weekQ = sum(week, 'q');
    var weekC = sum(week, 'c');
    var weekMs = sum(week, 'ms');

    var totalQ = 0;
    var totalC = 0;
    var totalMs = 0;
    Object.keys(days).forEach(function (key) {
      var v = days[key];
      totalQ += v.q;
      totalC += v.c;
      totalMs += v.ms;
    });

    var prevQ = 0;
    var prevC = 0;
    var now = new Date();
    for (var i = 13; i >= 7; i -= 1) {
      var prev = days[dayKey(addDays(now, -i))];
      if (prev) {
        prevQ += prev.q;
        prevC += prev.c;
      }
    }

    var tables = tableRows();
    var facts = factRows();
    var active = tables.filter(function (t) { return t.n > 0; });

    var weakestTable = active.slice().sort(function (a, b) {
      return a.acc - b.acc || b.n - a.n;
    })[0] || null;
    var strongestTable = active.slice().sort(function (a, b) {
      return b.acc - a.acc || b.n - a.n;
    })[0] || null;

    var historyWrong = facts.filter(function (f) { return f.w > 0; }).sort(function (a, b) {
      return b.w - a.w || a.acc - b.acc || b.n - a.n;
    });

    /* 当前待巩固：只包含最近答错、还没有连续练对两次的题 */
    var pending = facts.filter(function (f) { return f.pending; }).sort(function (a, b) {
      return b.wrongAt - a.wrongAt || b.w - a.w || a.acc - b.acc;
    });

    var weak = pending.slice(0, 3);

    if (weak.length < 3) {
      facts.filter(function (f) {
        return f.n > 0 && weak.indexOf(f) < 0;
      }).sort(function (a, b) {
        return b.avg - a.avg;
      }).slice(0, 3 - weak.length).forEach(function (f) {
        f.slow = true;
        weak.push(f);
      });
    }

    var slowest = facts.filter(function (f) { return f.n > 0; }).sort(function (a, b) {
      return b.avg - a.avg;
    })[0] || null;

    var model = {
      week: week,
      weekQ: weekQ,
      weekC: weekC,
      weekMs: weekMs,
      weekAcc: weekQ ? weekC / weekQ : 0,
      weekAvg: weekQ ? weekMs / weekQ : 0,
      weekDays: week.filter(function (d) { return d.q > 0; }).length,
      prevQ: prevQ,
      prevC: prevC,
      total: {
        q: totalQ,
        c: totalC,
        ms: totalMs,
        acc: totalQ ? totalC / totalQ : 0,
        avg: totalQ ? totalMs / totalQ : 0
      },
      tables: tables,
      facts: facts,
      weak: weak,
      wrong: pending,
      pending: pending,
      historyWrong: historyWrong,
      weakestTable: weakestTable,
      strongestTable: strongestTable,
      slowest: slowest,
      streak: computeStreak(days),
      empty: totalQ === 0
    };
    model.advice = Text.adviceFor(model);
    return model;
  }

  /* 优先当前待巩固；没有待巩固时，练最慢的三道 */
  function reviewList(limit) {
    var m = summary();
    var max = limit || 8;
    var list = m.pending.slice(0, max).map(function (f) {
      return { a: f.a, b: f.b };
    });
    if (!list.length) {
      list = m.facts.filter(function (f) { return f.n > 0; })
        .sort(function (a, b) { return b.avg - a.avg; })
        .slice(0, Math.min(max, 3))
        .map(function (f) { return { a: f.a, b: f.b }; });
    }
    return list;
  }

  window.DFStats = {
    summary: summary,
    reviewList: reviewList,
    dayKey: dayKey,
    pct: Text.pct,
    secs: Text.secs,
    minutes: Text.minutes,
    range: Text.range
  };
})();
