/* 除法森林 — 家长学习报告视图 */
(function () {
  'use strict';

  var S = window.DFStore;
  var UI = window.DFUI;
  var Stats = window.DFStats;

  function colors(table) {
    var list = (window.DFHome && window.DFHome.colors) || [];
    if (list[table - 1]) return list[table - 1];
    var hue = table * 40;
    return ['hsl(' + hue + ',80%,64%)', 'hsl(' + hue + ',82%,46%)'];
  }

  function trend(now, before) {
    if (!before) return '<i class="rp-trend">上周没有记录</i>';
    var diff = now - before;
    var rate = Math.round(diff / before * 100);
    if (!rate) return '<i class="rp-trend is-flat">与上周持平</i>';
    return '<i class="rp-trend ' + (diff > 0 ? 'is-up' : 'is-down') + '">较上周 ' +
      (diff > 0 ? '+' : '') + rate + '%</i>';
  }

  function figures(m) {
    return '<div class="rp-figures">' +
      '<div class="rp-figure">' +
        '<span class="rp-figure-label">近 7 天答题</span>' +
        '<b class="rp-figure-num">' + m.weekQ + '<small>题</small></b>' +
        (m.empty ? '<i class="rp-trend">还没有记录</i>' : trend(m.weekQ, m.prevQ)) +
      '</div>' +
      '<div class="rp-figure is-accent">' +
        '<span class="rp-figure-label">正确率</span>' +
        '<b class="rp-figure-num">' +
          (m.weekQ ? Math.round(m.weekAcc * 100) + '<small>%</small>' : '—') +
        '</b>' +
        '<i class="rp-trend">' + (m.weekQ ? '答对 ' + m.weekC + ' 题' : '最近 7 天还没有练习') + '</i>' +
      '</div>' +
      '<div class="rp-figure">' +
        '<span class="rp-figure-label">平均每题</span>' +
        '<b class="rp-figure-num">' +
          (m.weekQ ? Stats.secs(m.weekAvg) + '<small>秒</small>' : '—') +
        '</b>' +
        '<i class="rp-trend">' + (m.weekQ ? '思考时间' : '还没有数据') + '</i>' +
      '</div>' +
      '<div class="rp-figure">' +
        '<span class="rp-figure-label">连续练习</span>' +
        '<b class="rp-figure-num">' + m.streak + '<small>天</small></b>' +
        '<i class="rp-trend">' + (m.weekDays ? '这 7 天练了 ' + m.weekDays + ' 天' : '从今天开始') + '</i>' +
      '</div>' +
    '</div>';
  }

  function lede(m) {
    if (m.empty) {
      return '还没有练习记录。孩子做完第一关后，这里会自动生成正确率、用时和最该补的除法。';
    }
    if (!m.weekQ) {
      return '最近 7 天没有新记录。累计做过 <b>' + m.total.q + '</b> 道题，正确率 <b>' +
        Stats.pct(m.total.acc) + '</b>。';
    }
    return '最近 7 天做了 <b>' + m.weekQ + '</b> 道题，答对 <b>' + m.weekC + '</b> 道；平均每题 <b>' +
      Stats.secs(m.weekAvg) + '</b> 秒。数据只保存在这台设备上。';
  }

  function chart(m) {
    var max = 1;
    m.week.forEach(function (d) { if (d.q > max) max = d.q; });
    var cols = m.week.map(function (d, index) {
      var h = d.q ? Math.max(9, Math.round(d.q / max * 100)) : 2;
      var wrongShare = d.q ? Math.round(d.w / d.q * 100) : 0;
      return '<div class="rp-col' + (d.today ? ' is-today' : '') + '">' +
        '<div class="rp-bar-wrap" title="' + d.month + '/' + d.day + '：' + d.q + ' 题，答对 ' + d.c + ' 题">' +
          '<span class="rp-bar-num" style="--h:' + h + '%">' + (d.q || '') + '</span>' +
          '<div class="rp-bar' + (d.q ? '' : ' is-empty') + '" style="--h:' + h + '%;animation-delay:' +
            (index * 0.06) + 's">' +
            (wrongShare ? '<span class="rp-bar-wrong" style="height:' + wrongShare + '%"></span>' : '') +
          '</div>' +
        '</div>' +
        '<span class="rp-col-day">' + (d.today ? '今天' : '周' + d.weekday) + '</span>' +
        '<span class="rp-col-date">' + d.month + '/' + d.day + '</span>' +
      '</div>';
    }).join('');

    return '<section class="rp-card rp-chart-card">' +
      '<div class="rp-card-head">' +
        '<div>' +
          '<h2>最近 7 天</h2>' +
          '<p>' + Stats.range(m.week) + ' · 每天答了几道题</p>' +
        '</div>' +
        '<div class="rp-legend"><span><i class="is-right"></i>答对</span><span><i class="is-wrong"></i>答错</span></div>' +
      '</div>' +
      '<div class="rp-chart" role="img" aria-label="最近 7 天答题量柱状图">' + cols + '</div>' +
      '<div class="rp-chart-foot">' +
        '<span>近 7 天共 <b>' + m.weekQ + '</b> 题 · 正确率 <b>' + Stats.pct(m.weekAcc) + '</b></span>' +
        '<span>' + (m.weekDays ? '练习了 ' + m.weekDays + ' 天' : '这周还没有练习') + '</span>' +
      '</div>' +
    '</section>';
  }

  function adviceCard(m) {
    var steps = m.advice.map(function (item, index) {
      return '<li>' +
        '<span class="rp-step-num">' + (index + 1) + '</span>' +
        '<span class="rp-step-body"><b>' + item.title + '</b><span>' + item.text + '</span></span>' +
      '</li>';
    }).join('');

    var count = Math.min(8, m.pending.length);
    var label = count ? '重练这 ' + count + ' 道待巩固题' : '练最慢的 3 道';

    return '<section class="rp-card rp-advice-card">' +
      '<div class="rp-card-head">' +
        '<div>' +
          '<h2>今天可以这样练</h2>' +
          '<p>根据这几天的记录生成，不用全部做完</p>' +
        '</div>' +
      '</div>' +
      '<ol class="rp-steps">' + steps + '</ol>' +
      '<button type="button" class="btn btn-primary rp-advice-btn" data-action="review-weak">' +
        label + UI.icon('arrow') + '</button>' +
    '</section>';
  }

  function tableRow(t) {
    var c = colors(t.table);
    var status;
    if (!t.n) status = ['还没练过', 'is-none'];
    else if (t.acc >= 0.9) status = ['稳了', 'is-good'];
    else if (t.acc >= 0.75) status = ['在进步', 'is-mid'];
    else status = ['要补一补', 'is-weak'];

    return '<div class="rp-table-row' + (t.n ? '' : ' is-none') + '">' +
      '<span class="rp-orb" style="--c1:' + c[0] + ';--c2:' + c[1] + '">÷' + t.table + '</span>' +
      '<span class="rp-table-name">÷' + t.table + ' 的表' +
        '<span class="rp-table-stars" aria-label="' + t.stars + ' 星">' + UI.stars3(t.stars) + '</span>' +
      '</span>' +
      '<span class="rp-meter" aria-hidden="true"><i style="width:' + Math.round(t.acc * 100) + '%"></i></span>' +
      '<b class="rp-table-pct">' + (t.n ? Stats.pct(t.acc) : '—') + '</b>' +
      '<span class="rp-table-meta">' + (t.n ? t.n + ' 题 · ' + Stats.secs(t.avg) + ' 秒/题' : '0 题') + '</span>' +
      '<span class="rp-status ' + status[1] + '">' + status[0] + '</span>' +
    '</div>';
  }

  function tablesCard(m) {
    var rows = m.tables.map(tableRow).join('');
    return '<section class="rp-card rp-tables-card">' +
      '<div class="rp-card-head">' +
        '<div>' +
          '<h2>九张表的掌握度</h2>' +
          '<p>按「除数」归到每张表统计 · 正确率越高越稳</p>' +
        '</div>' +
        '<span class="rp-card-note">最稳 ' + (m.strongestTable ? m.strongestTable.table + ' 的表' : '—') +
          ' · 最弱 ' + (m.weakestTable ? m.weakestTable.table + ' 的表' : '—') + '</span>' +
      '</div>' +
      '<div class="rp-table">' + rows + '</div>' +
    '</section>';
  }

  function weakCard(f, index) {
    var progress = '';
    if (f.pending) {
      progress = f.streak > 0
        ? '<i class="rp-weak-progress">再答对 1 次就移出</i>'
        : '<i class="rp-weak-progress">再连续答对 2 次就移出</i>';
    }
    return '<div class="rp-weak-card' + (index === 0 && !f.slow ? ' is-hot' : '') + '">' +
      '<span class="rp-weak-rank">' + (index + 1) + '</span>' +
      '<b class="rp-weak-formula">' + f.dividend + ' ÷ ' + f.divisor + ' = ' + f.quotient + '</b>' +
      '<span class="rp-weak-chant">' + f.chant + '</span>' +
      '<span class="rp-weak-stat">' +
        (f.n ? Stats.pct(f.acc) + ' 正确率 · ' + f.n + ' 次' : '还没练过') +
        progress +
      '</span>' +
    '</div>';
  }

  function weakCardSection(m) {
    if (!m.weak.length) return '';
    var wrongMode = m.pending.length > 0;
    var cards = m.weak.map(weakCard).join('');

    var book = '';
    if (m.historyWrong.length > 3) {
      var shown = m.historyWrong.slice(0, 12).map(function (f) {
        return '<span class="rp-chip"><b>' + f.dividend + ' ÷ ' + f.divisor + '</b><i>' + f.w + ' 次</i></span>';
      }).join('');
      var rest = m.historyWrong.length - 12;
      book = '<div class="rp-wrong">' +
        '<span class="rp-wrong-label">历史错题记录</span>' +
        '<div class="rp-wrong-chips">' + shown +
          (rest > 0 ? '<span class="rp-chip is-more">+' + rest + '</span>' : '') +
        '</div>' +
      '</div>';
    }

    return '<section class="rp-card rp-weak-card-section">' +
      '<div class="rp-card-head">' +
        '<div>' +
          '<h2>' + (wrongMode ? '当前最该补的 3 道' : '最慢的 3 道') + '</h2>' +
          '<p>' + (wrongMode ? '最近答错、还没连续练对两次' : '没有待巩固题，先练速度') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="rp-weak-grid">' + cards + '</div>' +
      book +
    '</section>';
  }

  function actionsCard(m) {
    var count = Math.min(8, m.pending.length);
    var label = count ? '重练这 ' + count + ' 道待巩固题' : '练最慢的 3 道';
    return '<section class="rp-card rp-action-card">' +
      '<div class="rp-action-copy">' +
        '<h2>把薄弱点变成下一次的分数</h2>' +
        '<p>' + (count
          ? '只练当前待巩固题，' + count + ' 题大约 2 分钟；连续练对两次后会移出清单。'
          : '从最慢的 3 道开始，先想口诀，再动手算。') + '</p>' +
      '</div>' +
      '<div class="rp-action-btns">' +
        '<button type="button" class="btn btn-primary" data-action="review-weak">' + label + UI.icon('arrow') + '</button>' +
        '<button type="button" class="btn" data-action="start">再闯一关</button>' +
        '<button type="button" class="btn" data-action="print-report">打印 / 存 PDF</button>' +
      '</div>' +
    '</section>';
  }

  function danger() {
    return '<div class="rp-danger">' +
      '<div class="rp-danger-row">' +
        '<span><b>记录只在这台设备上。</b>换设备、清浏览器缓存都会丢失，建议定期打印一份。</span>' +
        '<button type="button" class="rp-text-btn" data-action="reset-stats">清空学习记录</button>' +
      '</div>' +
      '<div class="rp-confirm" id="rp-confirm" hidden>' +
        '<b>确认清空学习记录？</b>' +
        '<span>正确率、用时和错题会归零；松果、大树和已获得的奖章不受影响。</span>' +
        '<div class="rp-confirm-btns">' +
          '<button type="button" class="btn btn-danger" data-action="reset-stats-ok">确认清空</button>' +
          '<button type="button" class="btn" data-action="reset-stats-cancel">取消</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function emptyState() {
    return '<section class="rp-card rp-empty">' +
      '<span class="rp-empty-art" aria-hidden="true">' +
        '<svg viewBox="0 0 80 80">' +
          '<circle cx="40" cy="42" r="24" fill="#dbe3ff" stroke="#1b1f17" stroke-width="2.4"/>' +
          '<ellipse cx="40" cy="42" rx="34" ry="10" fill="none" stroke="#1b1f17" stroke-width="1.8" ' +
            'stroke-dasharray="4 5" transform="rotate(-12 40 42)"/>' +
          '<path d="M40 12l3.4 7.1 7.8 1-5.7 5.5 1.5 7.8-7-3.8-7 3.8 1.5-7.8-5.7-5.5 7.8-1z" ' +
            'fill="#ffd23f" stroke="#1b1f17" stroke-width="1.6" stroke-linejoin="round"/>' +
        '</svg>' +
      '</span>' +
      '<h2>还没有学习记录</h2>' +
      '<p>孩子每答一道题，这里就会记下正确率、用时和最该补的除法。所有数据只保存在这台设备上，不上传。</p>' +
      '<div class="rp-empty-actions">' +
        '<button type="button" class="btn btn-primary" data-action="start">去闯一关' + UI.icon('arrow') + '</button>' +
        '<button type="button" class="btn" data-action="about">看看这个作品</button>' +
      '</div>' +
    '</section>';
  }

  function view() {
    var m = Stats.summary();
    var meta = '<span>统计区间 ' + Stats.range(m.week) + '</span>' +
      '<span>累计 ' + m.total.q + ' 题 · ' + Stats.minutes(m.total.ms) + '</span>' +
      (S.isDemo() ? '<span class="rp-demo-chip">演示数据</span>' : '');

    var body;
    if (m.empty) {
      body = emptyState();
    } else {
      body = '<div class="rp-grid">' + chart(m) + adviceCard(m) + '</div>' +
        tablesCard(m) +
        weakCardSection(m) +
        actionsCard(m) +
        danger();
    }

    return '<section class="screen report">' +
      '<div class="rp-top">' +
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回森林</button>' +
        '<span class="rp-top-tag">学习报告 · 给家长</span>' +
      '</div>' +
      '<header class="rp-hero">' +
        '<div class="rp-hero-copy">' +
          '<span class="eyebrow"><span class="dot"></span>给家长</span>' +
          '<h1 class="rp-title">孩子这周的<br><em>除法森林</em></h1>' +
          '<p class="rp-lede">' + lede(m) + '</p>' +
          '<div class="rp-hero-meta">' + meta + '</div>' +
        '</div>' +
        figures(m) +
      '</header>' +
      body +
      '<footer class="rp-foot">' +
        '<span>数据来自本机浏览器，不上传、不采集。错题重练不会改变树屋星级。</span>' +
        '<span class="rp-foot-links">' +
          '<button type="button" class="rp-text-btn" data-action="about">关于这个作品</button>' +
          '<button type="button" class="rp-text-btn" data-action="print-report">打印</button>' +
        '</span>' +
      '</footer>' +
    '</section>';
  }

  window.DFReportView = { view: view };
})();
