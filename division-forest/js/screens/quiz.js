/* 除法森林 — 闯关与结果视图 */
(function () {
  'use strict';

  var UI = window.DFUI;
  var S = window.DFStore;
  var D = window.DFData;
  var Art = window.DFArt;

  var COUNT = 10;

  var TAGS = {
    quotient: '算一算',
    divisor: '找除数',
    dividend: '找被除数',
    share: '平均分',
    group: '分几份'
  };

  function hint(q) {
    if (q.type === 'divisor') return '想一想：几乘 ' + q.quotient + ' 等于 ' + q.dividend + '？';
    if (q.type === 'dividend') return '想一想：' + q.divisor + ' 个 ' + q.quotient + ' 是多少？';
    if (q.type === 'share') return '每只分得一样多，选出每只分到几' + q.family.unit;
    if (q.type === 'group') return '每 ' + q.divisor + ' ' + q.family.unit + '分一份，选出能分给几只';
    return '想一想：' + q.divisor + ' 乘几等于 ' + q.dividend + '？';
  }

  function questionLine(q) {
    var unknown = '<span class="unknown">?</span>';
    if (q.type === 'divisor') {
      return '<span>' + q.dividend + '</span><span class="op">÷</span>' + unknown +
        '<span class="op">=</span><span>' + q.quotient + '</span>';
    }
    if (q.type === 'dividend') {
      return unknown + '<span class="op">÷</span><span>' + q.divisor + '</span>' +
        '<span class="op">=</span><span>' + q.quotient + '</span>';
    }
    return '<span>' + q.dividend + '</span><span class="op">÷</span><span>' + q.divisor + '</span>' +
      '<span class="op">=</span>' + unknown;
  }

  function questionLabel(quiz, q) {
    var text;
    if (q.type === 'share' || q.type === 'group') text = D.story(q);
    else if (q.type === 'divisor') text = q.dividend + ' 除以几等于 ' + q.quotient;
    else if (q.type === 'dividend') text = '几除以 ' + q.divisor + ' 等于 ' + q.quotient;
    else text = q.dividend + ' 除以 ' + q.divisor + ' 等于几';
    return '第 ' + (quiz.index + 1) + ' 题，共 ' + quiz.questions.length + ' 题，' + text;
  }

  function foodItems(count) {
    var out = '';
    for (var i = 0; i < count; i += 1) {
      out += '<svg class="story-item" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#story-food"/></svg>';
    }
    return out;
  }

  /* 图画题：上面一堆食物，下面是来分的小动物 */
  function storyCard(quiz, q) {
    var f = q.family;
    var friends = '';
    if (q.type === 'share') {
      for (var k = 0; k < q.divisor; k += 1) friends += Art.animal(f.id, 38);
    } else {
      friends = Art.animal(f.id, 38) + '<span class="story-each">每只 ' + q.divisor + ' ' + f.unit + '</span>' +
        '<span class="story-who" aria-hidden="true">?</span>';
    }
    return '<div class="story" id="question-line" tabindex="-1" aria-label="' + questionLabel(quiz, q) + '">' +
      '<svg width="0" height="0" class="share-defs" aria-hidden="true" focusable="false"><defs>' +
        '<symbol id="story-food" viewBox="0 0 24 24">' + Art.foodInner(f.food) + '</symbol></defs></svg>' +
      '<div class="story-pic" aria-hidden="true">' +
        '<div class="story-items' + (q.dividend > 24 ? ' is-dense' : '') + '">' + foodItems(q.dividend) + '</div>' +
        '<div class="story-friends">' + friends + '</div>' +
      '</div>' +
      '<p class="story-text">' + D.story(q) + '</p>' +
    '</div>';
  }

  function stage(state) {
    var quiz = state.quiz;
    var q = quiz.questions[quiz.index];
    var isStory = q.type === 'share' || q.type === 'group';
    var options = q.options.map(function (value, index) {
      return '<button type="button" class="opt" data-action="answer" data-value="' + value +
        '" aria-label="选项 ' + (index + 1) + '：' + value + '">' +
        '<span class="key" aria-hidden="true">' + (index + 1) + '</span>' + value + '</button>';
    }).join('');

    return '<div class="quiz-meta">' +
        '<span>' + quiz.label + ' · <b id="q-count">' + (quiz.index + 1) + ' / ' + quiz.questions.length + '</b></span>' +
        '<span class="quiz-tag">' + (TAGS[q.type] || TAGS.quotient) + '</span>' +
      '</div>' +
      (isStory
        ? storyCard(quiz, q)
        : '<div class="qline" id="question-line" tabindex="-1" aria-label="' + questionLabel(quiz, q) + '">' +
          questionLine(q) + '</div>') +
      '<p class="question-hint">' + hint(q) + '</p>' +
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

  /* 反馈里给出完整的那道除法和它用到的口诀 */
  function fact(q) {
    return q.dividend + ' ÷ ' + q.divisor + ' = ' + q.quotient;
  }

  var TITLES = ['别灰心，再来一次', '不错的开始', '很棒，继续加油', '太厉害了'];
  var SUBS = [
    '先动手分一分，再想想口诀，挑战一次吧。',
    '求商时先想口诀，下次会更快。',
    '再练一次，就能点亮三颗星。',
    '小动物们都分到了一样多。'
  ];

  function dailyStamp(r) {
    var t = window.DFDaily ? window.DFDaily.today() : { day: 0, monthLabel: '', weekday: '' };
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
        sub = '今天已经领过首次奖励，这次按答对题数给松果。';
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
          return '<div class="review-item"><span>' + fact(q) + '</span><span class="r-chant">' + q.chant + '</span></div>';
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
        '<button type="button" class="btn' + (practice ? '' : ' btn-primary') + '" data-action="home">回森林</button>' +
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
        '<button type="button" class="btn" data-action="home">回森林</button></div>';
    } else {
      actions = '<div class="result-actions">' + practice +
        '<button type="button" class="btn' + (practice ? '' : ' btn-primary') + '" data-action="retry" data-scope="' +
        r.scope + '" data-table="' + (r.table || '') + '">再闯一次</button>';
      if (r.tables.length === 1) {
        actions += '<button type="button" class="btn" data-action="learn-from-result" data-table="' + r.tables[0] +
          '">学习 ÷' + r.tables[0] + ' 的表</button>';
      }
      actions += '<button type="button" class="btn" data-action="home">回森林</button></div>';
    }

    var teaser = '';
    var Sk = window.DFSkins;
    var next = (isReview || isDaily) ? null : (Sk && Sk.nextShopSkin());
    if (next) {
      var bal = S.balance();
      var gap = next.cost - bal;
      teaser = '<button type="button" class="result-shop" data-action="shop" data-focus="' + next.id + '">' +
        '<span class="rs-planet" aria-hidden="true">' + UI.icon('tree', 24) + '</span>' +
        '<span class="rs-copy">' +
          '<b>' + (gap <= 0 ? '可以种一棵新大树了' : '再攒 ' + gap + ' 颗松果，就能种新大树') + '</b>' +
          '<span>现有 ' + bal + ' 颗松果 · 下一棵「' + next.name + '」' + next.cost + ' 颗</span>' +
        '</span>' +
        '<span class="rs-go">去苗圃' + UI.icon('arrow', 14) + '</span>' +
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
          '<div class="stat"><strong>+' + r.earned + '</strong><span>收获松果</span></div>' +
        '</div>' +
        (isDaily && r.bonus
          ? '<div class="daily-bonus"><span>今日首次完成奖励</span><b>+' + r.bonus +
            ' <small>颗松果</small></b></div>'
          : '') +
        (window.DFAwards ? window.DFAwards.strip(r.newBadges) : '') +
        review +
        actions +
        teaser +
      '</div>' +
    '</section>';
  }

  window.DFQuiz = {
    COUNT: COUNT,
    view: view,
    stage: stage,
    fact: fact,
    syncProgress: syncProgress,
    syncStreak: syncStreak,
    result: result
  };
})();
