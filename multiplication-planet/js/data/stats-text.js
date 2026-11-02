/* 乘法星球 — 学习报告的文字与格式 */
(function () {
  'use strict';

  function pct(value) {
    return Math.round(value * 100) + '%';
  }

  function secs(ms) {
    if (!ms) return '0';
    var s = ms / 1000;
    return s < 10 ? s.toFixed(1) : String(Math.round(s));
  }

  function minutes(ms) {
    var m = Math.round(ms / 60000);
    if (m < 1) return '不到 1 分钟';
    if (m < 60) return m + ' 分钟';
    return Math.floor(m / 60) + ' 小时 ' + (m % 60) + ' 分';
  }

  function range(week) {
    if (!week || !week.length) return '';
    var a = week[0];
    var b = week[week.length - 1];
    return a.month + '/' + a.day + ' – ' + b.month + '/' + b.day;
  }

  /* 三条「今天可以这样练」，按薄弱点、薄弱表、节奏依次生成 */
  function adviceFor(m) {
    var out = [];
    if (!m.total.q) return out;

    var w = m.weak[0];
    if (w && !w.slow) {
      out.push({
        title: '先读这一句',
        text: '「' + w.a + ' × ' + w.b + ' = ' + w.product + '」正确率 ' + pct(w.acc) +
          '，今天先跟着读 3 遍，再单独练它。'
      });
    } else if (w) {
      out.push({
        title: '先提这一句',
        text: '「' + w.a + ' × ' + w.b + ' = ' + w.product + '」平均要 ' + secs(w.avg) +
          ' 秒，先求稳，熟了自然会快。'
      });
    }

    if (m.weakestTable && m.weakestTable.n >= 5) {
      out.push({
        title: '再过一张表',
        text: m.weakestTable.table + ' 的表正确率 ' + pct(m.weakestTable.acc) +
          '，先看一遍点阵，再闯一次 ' + m.weakestTable.table + ' 的表。'
      });
    } else if (m.slowest) {
      out.push({
        title: '练一练速度',
        text: '「' + m.slowest.a + ' × ' + m.slowest.b + '」平均要 ' + secs(m.slowest.avg) +
          ' 秒，是现在最慢的一句。'
      });
    }

    if (m.streak >= 3) {
      out.push({
        title: '保持节奏',
        text: '已经连续 ' + m.streak + ' 天练习了，今天做 5 分钟也算保持。'
      });
    } else {
      out.push({
        title: '每天 10 分钟',
        text: '先学一张表，再闯一关；短而勤，比一次练很久更牢。'
      });
    }
    return out.slice(0, 3);
  }

  window.MPStatsText = {
    pct: pct,
    secs: secs,
    minutes: minutes,
    range: range,
    adviceFor: adviceFor
  };
})();
