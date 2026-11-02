/* 除法森林 — 旧存档字段迁移与校验 */
(function () {
  'use strict';

  /**
   * 把 localStorage 里的原始存档逐字段校验后写进默认结构。
   * 任何缺失或类型不对的字段都退回默认值，保证旧存档能直接用。
   */
  function apply(data, saved) {
    data.stars = Number(saved.stars) || 0;
    data.spent = Math.max(0, Number(saved.spent) || 0);
    data.muted = saved.muted === true;
    data.plays = Number(saved.plays) || 0;
    data.bestCombo = Number(saved.bestCombo) || 0;
    data.totalCorrect = Number(saved.totalCorrect) || 0;
    data.totalAnswered = Number(saved.totalAnswered) || 0;
    if (Array.isArray(saved.skins)) {
      saved.skins.forEach(function (id) {
        if (typeof id === 'string' && id && data.skins.indexOf(id) < 0) data.skins.push(id);
      });
    }
    if (typeof saved.skin === 'string' && data.skins.indexOf(saved.skin) >= 0) {
      data.skin = saved.skin;
    }
    if (saved.tableStars && typeof saved.tableStars === 'object') {
      Object.keys(saved.tableStars).forEach(function (key) {
        var v = Number(saved.tableStars[key]);
        if (v > 0) data.tableStars[key] = Math.min(3, v);
      });
    }
    if (saved.seen && typeof saved.seen === 'object') {
      Object.keys(saved.seen).forEach(function (key) {
        if (!/^[1-9]-[1-9]$/.test(key) || !saved.seen[key]) return;
        data.seen[key] = true;
      });
    }
    if (saved.harvest && typeof saved.harvest === 'object') {
      data.harvest.cleared = saved.harvest.cleared === true;
      data.harvest.best = Math.max(0, Math.min(10, Number(saved.harvest.best) || 0));
      data.harvest.plays = Math.max(0, Number(saved.harvest.plays) || 0);
    }
    if (saved.stats && typeof saved.stats === 'object') {
      var facts = saved.stats.facts;
      if (facts && typeof facts === 'object') {
        Object.keys(facts).forEach(function (key) {
          if (!/^[1-9]-[1-9]$/.test(key)) return;
          var f = facts[key];
          if (!f || typeof f !== 'object') return;
          var r = Math.max(0, Number(f.r) || 0);
          var w = Math.max(0, Number(f.w) || 0);
          if (!r && !w) return;
          data.stats.facts[key] = {
            r: r,
            w: w,
            ms: Math.max(0, Number(f.ms) || 0),
            last: Math.max(0, Number(f.last) || 0)
          };
        });
      }
      var days = saved.stats.days;
      if (days && typeof days === 'object') {
        Object.keys(days).forEach(function (key) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
          var d = days[key];
          if (!d || typeof d !== 'object') return;
          var q = Math.max(0, Number(d.q) || 0);
          if (!q) return;
          data.stats.days[key] = {
            q: q,
            c: Math.min(q, Math.max(0, Number(d.c) || 0)),
            ms: Math.max(0, Number(d.ms) || 0)
          };
        });
      }

      var mastery = saved.stats.mastery;
      if (mastery && typeof mastery === 'object') {
        Object.keys(mastery).forEach(function (key) {
          var m = mastery[key];
          if (!/^[1-9]-[1-9]$/.test(key) || !m || typeof m !== 'object') return;
          data.stats.mastery[key] = {
            streak: Math.max(0, Math.min(2, Number(m.streak) || 0)),
            pending: m.pending === true,
            wrongAt: Math.max(0, Number(m.wrongAt) || 0),
            clearedAt: Math.max(0, Number(m.clearedAt) || 0),
            lastAt: Math.max(0, Number(m.lastAt) || 0)
          };
        });
      } else {
        /* 存档里没有掌握状态：历史上错过的题先标为待巩固，练对两轮后自动移出 */
        Object.keys(data.stats.facts).forEach(function (key) {
          var f = data.stats.facts[key];
          if (!f || !f.w) return;
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
    }
    if (saved.daily && typeof saved.daily === 'object') {
      var dl = saved.daily;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dl.lastDay)) data.daily.lastDay = dl.lastDay;
      data.daily.streak = Math.max(0, Math.min(999, Number(dl.streak) || 0));
      data.daily.best = Math.max(0, Math.min(999, Number(dl.best) || 0));
      data.daily.total = Math.max(0, Number(dl.total) || 0);
      data.daily.bestScore = Math.max(0, Math.min(8, Number(dl.bestScore) || 0));
      data.daily.todayScore = Math.max(0, Math.min(8, Number(dl.todayScore) || 0));
    }
    if (saved.awards && typeof saved.awards === 'object' && saved.awards.unlocked) {
      var unlocked = saved.awards.unlocked;
      Object.keys(unlocked).forEach(function (id) {
        if (!/^[a-z0-9-]{2,32}$/.test(id)) return;
        var ts = Math.max(0, Number(unlocked[id]) || 0);
        data.awards.unlocked[id] = ts || 1;
      });
    }
    if (saved.eggs && typeof saved.eggs === 'object') {
      Object.keys(saved.eggs).forEach(function (id) {
        if (!/^[a-z0-9-]{2,32}$/.test(id)) return;
        var ts = Math.max(0, Number(saved.eggs[id]) || 0);
        data.eggs[id] = ts || 1;
      });
    }
  }

  window.DFStoreMigrate = apply;
})();
