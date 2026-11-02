/* 除法森林 — 奖章墙视图 */
(function () {
  'use strict';

  var UI = window.DFUI;
  var S = window.DFStore;
  var Awards = window.DFAwards;

  function dateLabel(ts) {
    if (!ts) return '已获得';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '已获得';
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日获得';
  }

  function card(item) {
    var badge = item.badge;
    var g = Awards.group(badge.group);
    var meta = item.done
      ? '<span class="aw-prog is-done">' + UI.icon('check', 11) + dateLabel(item.time) + '</span>'
      : '<span class="aw-prog">' + item.label + '</span>';
    return '<article class="aw-card' + (item.done ? ' is-on' : ' is-off') + '" style="--gc:' + g.color + '">' +
      Awards.medal(badge, item.done, 62) +
      '<b class="aw-name">' + badge.name + '</b>' +
      '<p class="aw-desc">' + badge.desc + '</p>' +
      '<span class="aw-meter"><i style="width:' + Math.round(item.p * 100) + '%"></i></span>' +
      meta +
    '</article>';
  }

  function summary(done, total, next) {
    var R = 50;
    var C = 2 * Math.PI * R;
    var pct = total ? done / total : 0;
    var offset = C * (1 - pct);

    var nextBlock;
    if (next) {
      nextBlock = '<span class="aw-next-kicker">下一枚</span>' +
        '<b class="aw-next-name">' + next.badge.name + '</b>' +
        '<p class="aw-next-desc">' + next.badge.desc + '</p>' +
        '<span class="aw-next-meter"><i style="width:' + Math.round(next.p * 100) + '%"></i></span>' +
        '<span class="aw-next-prog">' + next.label + '</span>';
    } else {
      nextBlock = '<span class="aw-next-kicker">全部收集</span>' +
        '<b class="aw-next-name">' + total + ' 枚奖章集齐了</b>' +
        '<p class="aw-next-desc">每一枚都对应一个真实动作。接下来，去教身边的人用口诀算除法吧。</p>' +
        '<span class="aw-next-meter is-full"><i style="width:100%"></i></span>' +
        '<span class="aw-next-prog">满墙</span>';
    }

    return '<aside class="aw-summary">' +
      '<div class="aw-dial">' +
        '<svg viewBox="0 0 120 120" width="116" height="116" aria-hidden="true">' +
          '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="rgba(23,19,28,.12)" stroke-width="11"/>' +
          '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="#12824a" stroke-width="11" ' +
            'stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" ' +
            'stroke-dashoffset="' + offset.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
        '</svg>' +
        '<span class="aw-dial-num"><b>' + done + '</b><small>/ ' + total + '</small></span>' +
      '</div>' +
      '<div class="aw-next">' + nextBlock + '</div>' +
    '</aside>';
  }

  function groupSection(g, items) {
    var list = items.filter(function (item) { return item.badge.group === g.id; });
    var got = list.filter(function (item) { return item.done; }).length;
    return '<section class="aw-group">' +
      '<div class="aw-group-head" style="--gc:' + g.color + '">' +
        '<span class="aw-group-dot" aria-hidden="true"></span>' +
        '<h2>' + g.name + '</h2>' +
        '<p>' + g.sub + '</p>' +
        '<span class="aw-group-count">' + got + ' / ' + list.length + '</span>' +
      '</div>' +
      '<div class="aw-grid">' + list.map(card).join('') + '</div>' +
    '</section>';
  }

  function view() {
    var items = Awards.all();
    var total = items.length;
    var done = items.filter(function (item) { return item.done; }).length;
    var rest = items.filter(function (item) { return !item.done; });
    rest.sort(function (a, b) { return b.p - a.p; });
    var next = rest[0] || null;

    var groups = Awards.groups.map(function (g) {
      return groupSection(g, items);
    }).join('');

    return '<section class="screen awards">' +
      '<div class="aw-top">' +
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回森林</button>' +
        '<span class="aw-top-tag">奖章墙 · 已获得 <b>' + done + '</b> / ' + total + ' 枚' +
          (S.isDemo() ? ' · <i class="aw-demo">演示数据</i>' : '') + '</span>' +
      '</div>' +
      '<header class="aw-hero">' +
        '<div class="aw-hero-copy">' +
          '<span class="eyebrow"><span class="dot"></span>给孩子的收藏</span>' +
          '<h1 class="aw-title">每一枚奖章<br><em>都是练出来的</em></h1>' +
          '<p class="aw-lede">这里没有点一下就送的东西。答满多少题、连对多少关、连续多少天 —— ' +
            total + ' 枚奖章记录的都是真实发生过的动作。</p>' +
        '</div>' +
        summary(done, total, next) +
      '</header>' +
      groups +
      '<footer class="aw-foot">' +
        '<span>奖章记录在这台设备上；清空学习记录不会收回已经拿到的奖章。</span>' +
        '<span class="aw-foot-links">' +
          '<button type="button" class="aw-text-btn" data-action="start">去闯一关</button>' +
          '<button type="button" class="aw-text-btn" data-action="daily">今日挑战</button>' +
          '<button type="button" class="aw-text-btn" data-action="about">关于这个作品</button>' +
        '</span>' +
      '</footer>' +
    '</section>';
  }

  window.DFAwardsView = { view: view };
})();
