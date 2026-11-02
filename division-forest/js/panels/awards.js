/* 除法森林 — 奖章定义、判定与奖牌绘制 */
(function () {
  'use strict';

  var S = window.DFStore;

  var DATA = window.DFAwardsList;
  var GROUPS = DATA.groups;
  var ICONS = DATA.icons;
  var LIST = DATA.list;

  function group(id) {
    for (var i = 0; i < GROUPS.length; i += 1) {
      if (GROUPS[i].id === id) return GROUPS[i];
    }
    return GROUPS[0];
  }

  /**
   * 把当前进度浓缩成一组数字。演示模式给一份「几乎全拿到」的漂亮值，
   * 但保留两枚差一点的，让奖章墙看起来仍然有目标。
   */
  function context() {
    var data = S.get();
    var demo = S.isDemo();
    var lit = 0;
    var perfect = 0;
    for (var t = 1; t <= 9; t += 1) {
      var rating = S.tableStar(t);
      if (rating >= 1) lit += 1;
      if (rating >= 3) perfect += 1;
    }
    var seen = S.seenTotal();

    var m = window.DFStats ? window.DFStats.summary() : null;
    var answered = demo ? Math.max(300, data.totalAnswered) : data.totalAnswered;
    var accuracy = m && m.total.q ? m.total.acc : (data.totalAnswered ? data.totalCorrect / data.totalAnswered : 0);
    if (demo) accuracy = Math.max(0.93, accuracy);

    var daily = S.dailyState();
    return {
      lit: lit,
      perfect: perfect,
      seen: seen,
      bestCombo: demo ? Math.max(9, data.bestCombo) : data.bestCombo,
      answered: answered,
      accuracy: accuracy,
      stars: S.totalStars(),
      skins: S.ownedSkinCount(),
      harvestCleared: demo || S.harvestCleared(),
      streak: m ? m.streak : 0,
      dailyStreak: demo ? Math.max(6, daily.best) : daily.best,
      dailyTotal: demo ? Math.max(12, daily.total) : daily.total,
      dailyBestScore: demo ? 8 : daily.bestScore
    };
  }

  /* 已拿到的奖章不会因为清空学习记录而消失 */
  function all() {
    var ctx = context();
    return LIST.map(function (badge) {
      var st = badge.stat(ctx);
      var saved = S.hasAward(badge.id);
      return {
        badge: badge,
        done: saved || st.done,
        p: saved ? 1 : Math.max(0, Math.min(1, st.p)),
        label: st.label,
        time: S.awardTime(badge.id)
      };
    });
  }

  /* 检查是否有新达成的奖章，返回这次新解锁的列表 */
  function sync() {
    var ctx = context();
    var fresh = [];
    LIST.forEach(function (badge) {
      if (S.hasAward(badge.id)) return;
      if (!badge.stat(ctx).done) return;
      if (S.unlockAward(badge.id)) fresh.push(badge);
    });
    return fresh;
  }

  function rosette(r1, r2, n) {
    var round = function (v) { return Math.round(v * 100) / 100; };
    var d = '';
    for (var i = 0; i < n; i += 1) {
      var a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
      var a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      var am = (a0 + a1) / 2;
      var x0 = 50 + Math.cos(a0) * r1;
      var y0 = 50 + Math.sin(a0) * r1;
      var x1 = 50 + Math.cos(a1) * r1;
      var y1 = 50 + Math.sin(a1) * r1;
      var cx = 50 + Math.cos(am) * r2;
      var cy = 50 + Math.sin(am) * r2;
      d += (i === 0 ? 'M' : 'L') + round(x0) + ' ' + round(y0) +
        'Q' + round(cx) + ' ' + round(cy) + ' ' + round(x1) + ' ' + round(y1);
    }
    return d + 'Z';
  }

  var ROSETTE = rosette(38, 44, 12);

  function icon(name, size) {
    var s = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + (ICONS[name] || ICONS.star) + '</svg>';
  }

  /**
   * 大尺寸用十二瓣花边 + 高光，像一枚奖章；
   * 小尺寸（首页堆叠、结算条）用圆形，避免花瓣糊成一团。
   */
  function medal(badge, done, size) {
    var color = group(badge.group).color;
    var s = size || 58;
    var fancy = s >= 50;
    var ink = done ? '#1b1f17' : 'rgba(23,19,28,.3)';
    var body = done ? color : '#e9e2d4';

    var shape = fancy
      ? '<path d="' + ROSETTE + '" fill="' + body + '" stroke="' + ink + '" stroke-width="2.6" ' +
        'stroke-linejoin="round"' + (done ? '' : ' stroke-dasharray="4 5"') + '/>' +
        (done
          ? '<path d="M27.5 35a30 30 0 0 1 17-14" fill="none" stroke="rgba(255,255,255,.5)" ' +
            'stroke-width="3.2" stroke-linecap="round"/>'
          : '')
      : '<circle cx="50" cy="50" r="46" fill="' + body + '" stroke="' + ink + '" stroke-width="2.6"' +
        (done ? '' : ' stroke-dasharray="5 5"') + '/>';

    var scale = fancy ? 2.15 : 1.85;
    var pos = 50 - 12 * scale;
    var seal = Math.round(s * 0.31);
    var sealIcon = Math.max(7, Math.round(s * 0.16));

    return '<span class="aw-medal' + (done ? ' is-on' : ' is-off') + '" style="--mc:' + color + '">' +
      '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" aria-hidden="true">' +
        shape +
        '<circle cx="50" cy="50" r="30" fill="' + (done ? '#fffdf9' : '#f4eee2') + '" stroke="' +
          (done ? '#1b1f17' : 'rgba(23,19,28,.24)') + '" stroke-width="2"/>' +
        '<g transform="translate(' + pos.toFixed(1) + ' ' + pos.toFixed(1) + ') scale(' + scale + ')" ' +
          'fill="none" stroke="' + (done ? '#1b1f17' : 'rgba(23,19,28,.34)') + '" stroke-width="1.9" ' +
          'stroke-linecap="round" stroke-linejoin="round">' + ICONS[badge.icon] + '</g>' +
      '</svg>' +
      (done
        ? '<span class="aw-seal" style="width:' + seal + 'px;height:' + seal + 'px">' +
          icon('check', sealIcon) + '</span>'
        : '') +
    '</span>';
  }

  /* 结算页里的「解锁新奖章」条 */
  function strip(list) {
    if (!list || !list.length) return '';
    return '<div class="result-awards">' +
      '<span class="ra-kicker">' + icon('sparkle', 14) + '解锁新奖章 · ' + list.length + ' 枚</span>' +
      '<div class="ra-row">' + list.map(function (badge) {
        return '<span class="ra-item">' + medal(badge, true, 40) +
          '<span class="ra-copy"><b>' + badge.name + '</b><span>' + badge.desc + '</span></span></span>';
      }).join('') + '</div>' +
    '</div>';
  }

  window.DFAwards = {
    groups: GROUPS,
    list: LIST,
    group: group,
    icon: icon,
    medal: medal,
    all: all,
    sync: sync,
    strip: strip,
    count: function () {
      return all().filter(function (item) { return item.done; }).length;
    },
    total: LIST.length,
    nextUp: function () {
      var rest = all().filter(function (item) { return !item.done; });
      rest.sort(function (a, b) { return b.p - a.p; });
      return rest[0] || null;
    }
  };
})();
