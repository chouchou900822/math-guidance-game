/* 除法森林 — 闯关、丰收节与每日挑战的记录 */
(function () {
  'use strict';

  var ctx = window.DFStoreCtx;
  var data = ctx.data;
  var save = ctx.save;
  var dayKey = ctx.dayKey;

  function starRating(correct, total) {
    var ratio = total ? correct / total : 0;
    if (ratio >= 0.9) return 3;
    if (ratio >= 0.7) return 2;
    if (ratio >= 0.5) return 1;
    return 0;
  }

  /* 连续答对两次才移出待巩固，避免一次侥幸答对就永久掌握。 */
  function touchMastery(a, b, ok, now) {
    var key = a + '-' + b;
    if (!data.stats.mastery) data.stats.mastery = {};
    var m = data.stats.mastery[key];
    if (!m) {
      m = { streak: 0, pending: false, wrongAt: 0, clearedAt: 0, lastAt: 0 };
      data.stats.mastery[key] = m;
    }
    m.lastAt = now;
    if (!ok) {
      m.pending = true;
      m.streak = 0;
      m.wrongAt = now;
      m.clearedAt = 0;
      return;
    }
    m.streak = Math.min(2, (m.streak || 0) + 1);
    if (m.pending && m.streak >= 2) {
      m.pending = false;
      m.clearedAt = now;
    }
  }

  /**
   * 记录每道题的对错与用时：键是「除数-商」，除数就是题目所属的那张表。
   * 掌握状态也按同一个键记，练对两轮后才移出待巩固。
   */
  function recordStats(items) {
    if (!items || !items.length) return;
    var now = Date.now();
    var key = dayKey(new Date(now));
    var day = data.stats.days[key];
    if (!day) {
      day = { q: 0, c: 0, ms: 0 };
      data.stats.days[key] = day;
    }
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      if (!item) continue;
      var a = Number(item.a);
      var b = Number(item.b);
      if (!(a >= 1 && a <= 9 && b >= 1 && b <= 9)) continue;
      var ok = item.ok === true;
      var ms = Math.max(0, Math.min(30000, Number(item.ms) || 0));
      var fk = a + '-' + b;
      var f = data.stats.facts[fk];
      if (!f) {
        f = { r: 0, w: 0, ms: 0, last: 0 };
        data.stats.facts[fk] = f;
      }
      if (ok) f.r += 1; else f.w += 1;
      f.ms += ms;
      f.last = now;
      touchMastery(a, b, ok, now);
      day.q += 1;
      if (ok) day.c += 1;
      day.ms += ms;
    }
  }

  function recordQuiz(payload) {
    var correct = payload.correct;
    var total = payload.total;
    var kind = payload.kind === 'review' ? 'review' : 'quiz';
    var rating = starRating(correct, total);
    /* 错题重练只按答对题数给松果，不评星级，也不改动树屋星级 */
    var earned = kind === 'review' ? correct : correct + rating;

    data.stars += earned;
    data.plays += 1;
    data.totalCorrect += correct;
    data.totalAnswered += total;
    if (payload.bestCombo > data.bestCombo) data.bestCombo = payload.bestCombo;

    if (kind === 'quiz' && payload.tables && payload.tables.length === 1) {
      var key = String(payload.tables[0]);
      if (rating > (data.tableStars[key] || 0)) data.tableStars[key] = rating;
    }

    recordStats(payload.items);
    save();
    return { earned: earned, rating: rating, kind: kind };
  }

  function recordHarvest(payload) {
    var correct = payload.correct;
    var total = payload.total;
    var rating = starRating(correct, total);
    var earned = correct + rating;
    var firstClear = false;

    data.stars += earned;
    data.plays += 1;
    data.totalCorrect += correct;
    data.totalAnswered += total;
    if (payload.bestCombo > data.bestCombo) data.bestCombo = payload.bestCombo;

    data.harvest.plays += 1;
    if (correct > data.harvest.best) data.harvest.best = correct;
    if (!data.harvest.cleared && correct >= 8) {
      data.harvest.cleared = true;
      firstClear = true;
      if (data.skins.indexOf('gold') < 0) data.skins.push('gold');
    }
    save();
    return { earned: earned, rating: rating, firstClear: firstClear, cleared: data.harvest.cleared };
  }

  function recordDaily(payload) {
    var correct = Math.max(0, Number(payload.correct) || 0);
    var total = Math.max(1, Number(payload.total) || 1);
    var bestCombo = Math.max(0, Number(payload.bestCombo) || 0);
    var today = dayKey(new Date());
    var yesterday = dayKey(new Date(Date.now() - 86400000));
    var first = data.daily.lastDay !== today;
    var bonus = first ? 5 : 0;
    var earned = correct + bonus;

    data.stars += earned;
    data.plays += 1;
    data.totalCorrect += correct;
    data.totalAnswered += total;
    if (bestCombo > data.bestCombo) data.bestCombo = bestCombo;

    if (first) {
      data.daily.streak = data.daily.lastDay === yesterday ? data.daily.streak + 1 : 1;
      if (data.daily.streak > data.daily.best) data.daily.best = data.daily.streak;
      data.daily.lastDay = today;
      data.daily.total += 1;
      data.daily.todayScore = correct;
    } else if (correct > data.daily.todayScore) {
      data.daily.todayScore = correct;
    }

    /* 重练拿到更高分也要记下来，否则「今日全对」永远补不回来 */
    if (correct > data.daily.bestScore) data.daily.bestScore = correct;

    recordStats(payload.items);
    save();
    return { earned: earned, bonus: bonus, first: first, streak: data.daily.streak };
  }

  Object.assign(window.DFStore, {
    recordQuiz: recordQuiz,
    recordHarvest: recordHarvest,
    recordDaily: recordDaily
  });
})();
