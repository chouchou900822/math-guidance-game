/* 乘法星球 — 学习页与整表视图 */
(function () {
  'use strict';

  var D = window.MPData;
  var S = window.MPStore;
  var UI = window.MPUI;

  var GAP = 6;
  var DOT_MAX = 40;

  function dotsWidth(cols) {
    return cols * DOT_MAX + (cols - 1) * GAP;
  }

  /**
   * 点阵宽度跟随容器收缩，最大仍保持 40px 的点径。
   * 320px 窄屏下 9×9 不再依赖固定 300px，避免最右一列被裁掉。
   */
  function dots(rows, cols) {
    var html = '<div class="dots" style="--cols:' + cols + ';gap:' + GAP + 'px">';
    var index = 0;
    for (var r = 0; r < rows; r += 1) {
      var hue = 234 + r * 5;
      for (var c = 0; c < cols; c += 1) {
        html += '<span class="dot" style="background:hsl(' + hue + ' 84% 58%);animation-delay:' +
          Math.min(index * 4, 200) + 'ms"></span>';
        index += 1;
      }
    }
    return html + '</div>';
  }

  function caption(table, b) {
    return table + ' 行，每行 ' + b + ' 个，一共 <b>' + (table * b) + '</b> 个';
  }

  function view(state) {
    var table = state.table;
    var b = state.learnB;
    var product = table * b;

    var tabs = '';
    for (var i = 1; i <= 9; i += 1) {
      var on = i === table;
      tabs += '<button type="button" class="table-tab' + (on ? ' is-active' : '') +
        '" data-action="switch-table" data-table="' + i + '" aria-pressed="' + on +
        '" aria-label="切换到 ' + i + ' 的乘法表">' + i + '</button>';
    }

    var chips = D.formulasOf(table).map(function (item) {
      return '<button type="button" class="formula-chip' + (item.b === b ? ' is-active' : '') +
        '" data-action="pick-b" data-b="' + item.b + '" aria-label="' + item.a + ' 乘 ' + item.b +
        ' 等于 ' + item.product + '，口诀 ' + item.chant + '">' +
        '<span>' + item.a + ' × ' + item.b + '</span><b>' + item.product + '</b></button>';
    }).join('');

    return '<section class="screen learn">' +
      '<div class="learn-head">' +
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回星球</button>' +
        '<div class="learn-head-tools">' +
          '<span class="learn-progress" id="learn-progress">已点读 <b>' + S.seenInTable(table) + '</b> / 9 句</span>' +
          '<button type="button" class="link-btn" data-action="grid">整张九九表</button>' +
        '</div>' +
      '</div>' +
      '<div class="table-tabs" role="group" aria-label="选择乘法表">' + tabs + '</div>' +
      '<div class="worksheet">' +
        '<div class="learn-formula">' +
          '<div class="formula">' +
            '<span data-big="a">' + table + '</span>' +
            '<span class="op">×</span>' +
            '<span data-big="b">' + b + '</span>' +
            '<span class="op">=</span>' +
            '<span class="res" data-big="p">' + product + '</span>' +
          '</div>' +
          '<span class="chant" data-big="chant">' + D.chant(table, b) + '</span>' +
          '<button type="button" class="speak-btn" data-action="speak-current">' +
            UI.icon('sound', 17) + '<span>听一听</span></button>' +
          '<p class="learn-hint">点下面任意一句口诀，也能单独听。</p>' +
        '</div>' +
        '<div class="learn-visual">' +
          '<div class="dots-panel" style="--dots-w:' + dotsWidth(b) + 'px">' +
            '<div data-big="dots">' + dots(table, b) + '</div></div>' +
          '<p class="dots-caption" data-big="caption">' + caption(table, b) + '</p>' +
        '</div>' +
        '<div class="learn-strip" role="group" aria-label="' + table + ' 的乘法口诀">' + chips + '</div>' +
        '<div class="learn-actions">' +
          '<button type="button" class="btn btn-sm" data-action="read-all">' +
            UI.icon('sound', 16) + '<span>朗读整张表</span></button>' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="practice-table">练习 ' + table +
            ' 的表' + UI.icon('arrow', 16) + '</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function set(root, key, html) {
    var el = root.querySelector('[data-big="' + key + '"]');
    if (el) el.innerHTML = html;
  }

  function update(root, state, b) {
    var table = state.table;
    set(root, 'a', table);
    set(root, 'b', b);
    set(root, 'p', table * b);
    set(root, 'chant', D.chant(table, b));
    set(root, 'caption', caption(table, b));
    var box = root.querySelector('[data-big="dots"]');
    if (box) box.innerHTML = dots(table, b);
    var panel = root.querySelector('.dots-panel');
    if (panel) panel.style.setProperty('--dots-w', dotsWidth(b) + 'px');

    var chips = root.querySelectorAll('.formula-chip');
    for (var i = 0; i < chips.length; i += 1) {
      chips[i].classList.toggle('is-active', Number(chips[i].dataset.b) === b);
    }
  }

  function syncSeen(root, state) {
    var el = root.querySelector('#learn-progress');
    if (el) el.innerHTML = '已点读 <b>' + S.seenInTable(state.table) + '</b> / 9 句';
  }

  function markReading(root, b, on) {
    var chips = root.querySelectorAll('.formula-chip');
    for (var i = 0; i < chips.length; i += 1) {
      chips[i].classList.toggle('is-reading', on && Number(chips[i].dataset.b) === b);
    }
  }

  function syncReadBtn(root, state) {
    var btn = root.querySelector('[data-action="read-all"]');
    if (!btn) return;
    btn.innerHTML = state.reading
      ? UI.icon('stop', 15) + '<span>停止朗读</span>'
      : UI.icon('sound', 16) + '<span>朗读整张表</span>';
    btn.setAttribute('aria-pressed', String(state.reading));
  }

  function centerTabs(root) {
    var tabs = root.querySelector('.table-tabs');
    var active = root.querySelector('.table-tab.is-active');
    if (!tabs || !active || tabs.scrollWidth <= tabs.clientWidth) return;
    var tabRect = active.getBoundingClientRect();
    var wrapRect = tabs.getBoundingClientRect();
    tabs.scrollLeft += tabRect.left - wrapRect.left - (wrapRect.width - tabRect.width) / 2;
  }

  function gridView() {
    var head = '';
    for (var c = 1; c <= 9; c += 1) {
      head += '<th scope="col">' + c + '</th>';
    }

    var rows = '';
    for (var a = 1; a <= 9; a += 1) {
      var cells = '';
      for (var b = 1; b <= a; b += 1) {
        cells += '<td><button type="button" class="cell" data-action="grid-cell" data-a="' + a + '" data-b="' + b +
          '" style="--hue:' + (232 + a * 6) + '" aria-label="' + a + ' 乘 ' + b + ' 等于 ' + (a * b) +
          '，口诀 ' + D.chant(a, b) + '">' + (a * b) + '</button></td>';
      }
      rows += '<tr><th scope="row">' + a + '</th>' + cells + '</tr>';
    }

    return '<section class="screen grid">' +
      '<div class="grid-head">' +
        '<div>' +
          '<h1>整张九九表</h1>' +
          '<p>点任意一格，就能听到对应的口诀。</p>' +
        '</div>' +
        '<span class="grid-legend"><i></i>45 句 · 3×4 和 4×3 是同一句</span>' +
      '</div>' +
      '<div class="grid-scroll">' +
        '<table class="tbl">' +
          '<thead><tr><th scope="col">×</th>' + head + '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="learn-actions">' +
        '<button type="button" class="btn btn-sm" data-action="home">' + UI.icon('back', 15) + '回星球</button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-action="start">去闯关' + UI.icon('arrow', 16) + '</button>' +
      '</div>' +
    '</section>';
  }

  window.MPLearn = {
    view: view,
    update: update,
    syncSeen: syncSeen,
    markReading: markReading,
    syncReadBtn: syncReadBtn,
    centerTabs: centerTabs,
    gridView: gridView
  };
})();
