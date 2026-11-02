/* 乘法星球 — 闯关与结果视图 */
(function () {
  'use strict';

  var UI = window.MPUI;
  var S = window.MPStore;

  var COUNT = 10;

  function questionLine(q) {
    var unknown = '<span class="unknown">?</span>';
    if (q.type === 'missing') {
      return '<span>' + q.a + '</span><span class="op">×</span>' + unknown +
        '<span class="op">=</span><span>' + q.product + '</span>';
    }
    return '<span>' + q.a + '</span><span class="op">×</span><span>' + q.b + '</span>' +
      '<span class="op">=</span>' + unknown;
  }

  function questionLabel(quiz, q) {
    var text = q.type === 'missing'
      ? q.a + ' 乘以几等于 ' + q.product
      : q.a + ' 乘以 ' + q.b + ' 等于几';
    return '第 ' + (quiz.index + 1) + ' 题，共 ' + quiz.questions.length + ' 题，' + text;
  }

  function stage(state) {
    var quiz = state.quiz;
    var q = quiz.questions[quiz.index];
    var options = q.options.map(function (value, index) {
      return '<button type="button" class="opt" data-action="answer" data-value="' + value +
        '" aria-label="选项 ' + (index + 1) + '：' + value + '">' +
        '<span class="key" aria-hidden="true">' + (index + 1) + '</span>' + value + '</button>';
    }).join('');

    return '<div class="quiz-meta">' +
        '<span>' + quiz.label + ' · <b id="q-count">' + (quiz.index + 1) + ' / ' + quiz.questions.length + '</b></span>' +
        '<span class="quiz-tag">' + (q.type === 'missing' ? '找缺数' : '算一算') + '</span>' +
      '</div>' +
      '<div class="qline" id="question-line" tabindex="-1" aria-label="' + questionLabel(quiz, q) + '">' +
        questionLine(q) + '</div>' +
      '<p class="question-hint">' + (q.type === 'missing' ? q.a + ' 乘几等于 ' + q.product + '？' : '选出正确的积') + '</p>' +
      '<div class="opts" role="group" aria-label="答案选项">' + options + '</div>' +
      '<div class="feedback" data-feedback aria-live="polite"></div>';
  }

  function segs(quiz) {
    var out = '';
    for (var i = 0; i < quiz.questions.length; i += 1) {
      out += '<span class="seg"></span>';
    }
    return out;
  }

  function view(state) {
    var review = state.quiz.scope === 'review';
    var daily = state.quiz.kind === 'daily';
    return '<section class="screen quiz' + (daily ? ' is-daily' : '') + '">' +
      '<div class="quiz-top">' +
        '<button type="button" class="back-btn" data-action="' + (review ? 'report' : 'home') +
          '" aria-label="' + (review ? '结束重练，回到学习报告' : '退出闯关，回到首页') + '">' +
          UI.icon('back', 15) + (review ? '回报告' : '退出') + '</button>' +
        '<div class="segs" role="img" aria-label="答题进度，第 ' + (state.quiz.index + 1) +
          ' 题，共 ' + state.quiz.questions.length + ' 题">' + segs(state.quiz) + '</div>' +
        '<div class="streak-slot" aria-live="polite"></div>' +
      '</div>' +
      '<div class="quiz-card"><div class="quiz-stage">' + stage(state) + '</div></div>' +
    '</section>';
  }

  function syncProgress(root, quiz) {
    var segsEl = root.querySelectorAll('.seg');
    for (var i = 0; i < segsEl.length; i += 1) {
      segsEl[i].className = 'seg' + (i < quiz.index ? ' is-done' : (i === quiz.index ? ' is-now' : ''));
    }
    var count = root.querySelector('#q-count');
    if (count) count.textContent = (quiz.index + 1) + ' / ' + quiz.questions.length;
    var progress = root.querySelector('.segs');
    if (progress) {
      progress.setAttribute('aria-label', '答题进度，第 ' + (quiz.index + 1) +
        ' 题，共 ' + quiz.questions.length + ' 题');
    }
  }

  function syncStreak(root, quiz) {
    var slot = root.querySelector('.streak-slot');
    if (!slot) return;
    if (!quiz || quiz.combo < 2) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = '<span class="streak-badge">' + UI.icon('flame', 14) + '×' + quiz.combo + '</span>';
  }

  var TITLES = ['别灰心，再来一次', '不错的开始', '很棒，继续加油', '太厉害了'];
  var SUBS = [
    '先看看错题的口诀，再挑战一次吧。',
    '多读几遍口诀，下次会更快。',
    '再练一次，就能点亮三颗星。',
    '回家的路亮起来啦。'
  ];

  function dailyStamp(r) {
    var t = window.MPDaily ? window.MPDaily.today() : { day: 0, monthLabel: '', weekday: '' };
    return '<div class="daily-stamp' + (r.correct === r.total ? ' is-full' : '') + '">' +
      '<span class="ds-kicker">每日挑战</span>' +
      '<b class="ds-day">' + t.day + '</b>' +
      '<span class="ds-date">' + t.monthLabel + ' · ' + t.weekday + '</span>' +
      '<span class="ds-seal" aria-hidden="true">' + UI.icon('check', 15) + '</span>' +
    '</div>';
  }

  function result(state) {
    var r = state.result;
    if (!r) return '';
    var isReview = r.kind === 'review';
    var isDaily = r.kind === 'daily';

    var stars = '';
    for (var i = 0; i < 3; i += 1) {
      stars += UI.star(56, 'result-star' + (i < r.rating ? ' is-on' : ''));
    }

    var header;
    if (isDaily) {
      header = dailyStamp(r);
    } else if (isReview) {
      header = '<div class="result-score"><b>' + Math.round(r.correct / r.total * 100) +
        '<small>%</small></b><span>错题正确率</span></div>';
    } else {
      header = '<div class="result-stars" role="img" aria-label="获得 ' + r.rating + ' 颗星">' + stars + '</div>';
    }

    var title;
    var sub;
    if (isDaily) {
      title = r.first
        ? (r.correct === r.total ? '今天全对，太厉害了' : '今天的挑战完成了')
        : '今天已经挑战过了';
      if (r.first) {
        sub = r.streak > 1
          ? '连续 ' + r.streak + ' 天完成每日挑战，明天 0 点换一套新题。'
          : '今天的第一次挑战，明天再来就能连上。';
      } else {
        sub = '今天已经领过首次奖励，这次按答对题数给星星。';
      }
    } else if (isReview) {
      if (r.wrong.length === 0) {
        title = '本轮错题都答对了';
        sub = '连续两轮答对后才会移出待巩固清单；下次遇到同样的题，也先想一遍口诀。';
      } else {
        title = r.rating >= 2 ? '有进步，再稳一次' : '先把错题口诀读一遍';
        sub = '本轮还有 ' + r.wrong.length + ' 道没答对，练到连续两轮全对才算真正掌握。';
      }
    } else {
      title = TITLES[r.rating];
      sub = SUBS[r.rating];
    }

    var review;
    if (r.wrong.length === 0) {
      review = '<div class="review"><div class="review-empty">' +
        (isReview ? '本轮错题都答对了，没有新的错题。' : '全部答对，一道错题都没有。') + '</div></div>';
    } else {
      review = '<div class="review"><h3>再看一眼这几题</h3><div class="review-list">' +
        r.wrong.map(function (q) {
          var formula = q.type === 'missing' ? q.a + ' × ? = ' + q.product : q.a + ' × ' + q.b + ' = ' + q.product;
          return '<div class="review-item"><span>' + formula + '</span><span class="r-chant">' + q.chant + '</span></div>';
        }).join('') + '</div></div>';
    }

    var left = r.reviewKeys ? r.reviewKeys.length : 0;
    var practice = left
      ? '<button type="button" class="btn btn-primary" data-action="review-current">练本次错题 ' +
        left + ' 道' + UI.icon('arrow') + '</button>'
      : '';

    var actions;
    if (isDaily) {
      actions = '<div class="result-actions">' + practice +
        '<button type="button" class="btn' + (practice ? '' : ' btn-primary') + '" data-action="home">回星球</button>' +
        '<button type="button" class="btn" data-action="awards">看看奖章墙</button>' +
        (r.first || practice ? '' : '<button type="button" class="btn" data-action="daily">再练一次</button>') +
        '</div>';
    } else if (isReview) {
      var consolidate = r.consolidateKeys && r.consolidateKeys.length
        ? '<button type="button" class="btn btn-primary" data-action="review-consolidate">再巩固一轮 ' +
          r.consolidateKeys.length + ' 道' + UI.icon('arrow') + '</button>'
        : '';
      actions = '<div class="result-actions">' + (practice || consolidate ||
        '<button type="button" class="btn btn-primary" data-action="report">完成巩固，回报告</button>') +
        ((practice || consolidate) ? '<button type="button" class="btn" data-action="report">回学习报告</button>' : '') +
        '<button type="button" class="btn" data-action="home">回星球</button></div>';
    } else {
      actions = '<div class="result-actions">' + practice +
        '<button type="button" class="btn' + (practice ? '' : ' btn-primary') + '" data-action="retry" data-scope="' +
        r.scope + '" data-table="' + (r.table || '') + '">再闯一次</button>';
      if (r.tables.length === 1) {
        actions += '<button type="button" class="btn" data-action="learn-from-result" data-table="' + r.tables[0] +
          '">学习 ' + r.tables[0] + ' 的表</button>';
      }
      actions += '<button type="button" class="btn" data-action="home">回星球</button></div>';
    }

    var teaser = '';
    var Sk = window.MPSkins;
    var next = (isReview || isDaily) ? null : (Sk && Sk.nextShopSkin());
    if (next) {
      var bal = S.balance();
      var gap = next.cost - bal;
      teaser = '<button type="button" class="result-shop" data-action="shop">' +
        '<span class="rs-planet" aria-hidden="true">' + UI.icon('planet', 24) + '</span>' +
        '<span class="rs-copy">' +
          '<b>' + (gap <= 0 ? '可以换一颗新星球了' : '再攒 ' + gap + ' 颗星，就能换皮肤') + '</b>' +
          '<span>现有 ' + bal + ' 颗星 · 下一款「' + next.name + '」' + next.cost + ' 颗</span>' +
        '</span>' +
        '<span class="rs-go">去皮肤馆' + UI.icon('arrow', 14) + '</span>' +
      '</button>';
    }

    return '<section class="screen result">' +
      '<div class="result-card">' +
        header +
        '<h1 class="result-title">' + title + '</h1>' +
        '<p class="result-sub">' + sub + '</p>' +
        '<div class="result-stats">' +
          '<div class="stat"><strong>' + r.correct + ' / ' + r.total + '</strong><span>答对题数</span></div>' +
          '<div class="stat"><strong>' + r.bestCombo + '</strong><span>最高连击</span></div>' +
          '<div class="stat"><strong>+' + r.earned + '</strong><span>收获星星</span></div>' +
        '</div>' +
        (isDaily && r.bonus
          ? '<div class="daily-bonus"><span>今日首次完成奖励</span><b>+' + r.bonus +
            ' <small>颗星</small></b></div>'
          : '') +
        (window.MPAwards ? window.MPAwards.strip(r.newBadges) : '') +
        review +
        actions +
        teaser +
      '</div>' +
    '</section>';
  }

  window.MPQuiz = {
    COUNT: COUNT,
    view: view,
    stage: stage,
    syncProgress: syncProgress,
    syncStreak: syncStreak,
    result: result
  };
})();
