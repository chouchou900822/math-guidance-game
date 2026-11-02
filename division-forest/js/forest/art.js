/* 除法森林 — 小动物、食物与小图标（纯 SVG，0 图片文件） */
(function () {
  'use strict';

  var INK = '#1b1f17';
  var LINE = ' stroke="' + INK + '" stroke-linejoin="round" stroke-linecap="round"';

  function o(width) {
    return LINE + ' stroke-width="' + (width || 2.2) + '"';
  }

  function circle(cx, cy, r, fill, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>';
  }

  function ellipse(cx, cy, rx, ry, fill, extra, rotate) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' +
      (rotate ? ' transform="rotate(' + rotate + ' ' + cx + ' ' + cy + ')"' : '') + (extra || '') + '/>';
  }

  function path(d, fill, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>';
  }

  /* 一对眼睛带高光，一对腮红：所有小动物共用，风格才统一 */
  function eyes(lx, rx, y, r) {
    var s = r || 1.9;
    return circle(lx, y, s, INK) + circle(rx, y, s, INK) +
      circle(lx + s * 0.32, y - s * 0.34, s * 0.32, '#fff') + circle(rx + s * 0.32, y - s * 0.34, s * 0.32, '#fff');
  }

  function cheeks(lx, rx, y, color) {
    return circle(lx, y, 2.3, color || '#ff9c86', ' opacity=".55"') + circle(rx, y, 2.3, color || '#ff9c86', ' opacity=".55"');
  }

  function smile(x, y) {
    return path('M' + x + ' ' + y + 'v1.4M' + x + ' ' + (y + 1.4) + 'q-1.6 1.5-3 .3M' + x + ' ' + (y + 1.4) + 'q1.6 1.5 3 .3',
      'none', o(1.4));
  }

  function hedgehogSpikes() {
    var pts = [];
    var n = 22;
    for (var i = 0; i <= n; i += 1) {
      var t = (150 + (240 * i) / n) * Math.PI / 180;
      var r = i % 2 === 0 ? 15.5 : 21.5;
      pts.push((24 + r * Math.cos(t)).toFixed(1) + ' ' + (29 + r * Math.sin(t)).toFixed(1));
    }
    return path('M' + pts.join('L') + 'Z', '#8b5e3c', o());
  }

  var ANIMALS = {
    hedgehog: function () {
      return hedgehogSpikes() +
        circle(13.4, 22.6, 3.4, '#f5d9b0', o(1.8)) + circle(34.6, 22.6, 3.4, '#f5d9b0', o(1.8)) +
        ellipse(24, 31.4, 13.4, 11.4, '#f5d9b0', o()) +
        eyes(19.4, 28.6, 30) + ellipse(24, 35.2, 2.4, 1.8, INK) + cheeks(15.6, 32.4, 34);
    },
    rabbit: function () {
      return ellipse(17.4, 13, 4.8, 10.6, '#f6f2ea', o(), -14) + ellipse(17.6, 13.8, 2.3, 7, '#ffb4c2', '', -14) +
        ellipse(30.6, 13, 4.8, 10.6, '#f6f2ea', o(), 14) + ellipse(30.4, 13.8, 2.3, 7, '#ffb4c2', '', 14) +
        circle(24, 30, 13.6, '#f6f2ea', o()) + eyes(19, 29, 28.8) +
        path('M22.3 32.4h3.4l-1.7 2z', '#ff7f98', o(1)) + smile(24, 34.4) + cheeks(15.6, 32.4, 33);
    },
    monkey: function () {
      return circle(10.4, 26, 5.2, '#a8693f', o()) + circle(10.4, 26, 2.7, '#f2cfa2') +
        circle(37.6, 26, 5.2, '#a8693f', o()) + circle(37.6, 26, 2.7, '#f2cfa2') +
        circle(24, 25, 13.6, '#a8693f', o()) +
        circle(19.6, 23.6, 5.4, '#f2cfa2') + circle(28.4, 23.6, 5.4, '#f2cfa2') + ellipse(24, 30.2, 9.4, 6.6, '#f2cfa2') +
        eyes(19.8, 28.2, 23.8, 1.8) + circle(22.8, 28.6, 0.8, INK) + circle(25.2, 28.6, 0.8, INK) +
        path('M20.4 31.4q3.6 2.8 7.2 0', 'none', o(1.5)) + path('M21.4 12.2q2.4-3.6 5-1', 'none', o(1.6));
    },
    squirrel: function () {
      return path('M12.6 20.6 13.6 7.6 21 16.6z', '#d9822b', o()) + path('M14.6 17.6 15.1 11.4 18.6 15.6z', '#f6b56d') +
        path('M35.4 20.6 34.4 7.6 27 16.6z', '#d9822b', o()) + path('M33.4 17.6 32.9 11.4 29.4 15.6z', '#f6b56d') +
        path('M13.6 7.6l-1.4-2.6M13.6 7.6l1-2.8M34.4 7.6l1.4-2.6M34.4 7.6l-1-2.8', 'none', o(1.4)) +
        ellipse(24, 28, 13.6, 12.6, '#d9822b', o()) + ellipse(24, 33.2, 8, 5.8, '#fbe3c2') +
        eyes(18.8, 29.2, 26.4, 2) + ellipse(24, 30.4, 1.9, 1.4, INK) +
        '<rect x="22.5" y="32.4" width="3" height="3.2" rx=".7" fill="#fff"' + o(1) + '/>' +
        cheeks(15.4, 32.6, 31.6);
    },
    bear: function () {
      return circle(12.6, 15.4, 5.6, '#9b6a43', o()) + circle(12.6, 15.4, 2.9, '#e7bb8f') +
        circle(35.4, 15.4, 5.6, '#9b6a43', o()) + circle(35.4, 15.4, 2.9, '#e7bb8f') +
        circle(24, 27, 14, '#9b6a43', o()) + ellipse(24, 32, 7.4, 5.8, '#ecd0a8', o(1.6)) +
        ellipse(24, 29.9, 2.7, 1.9, INK) + smile(24, 31.6) + eyes(18.2, 29.8, 24.6) + cheeks(15, 33, 30.4);
    },
    panda: function () {
      return circle(12.4, 15.2, 5.6, INK) + circle(35.6, 15.2, 5.6, INK) +
        circle(24, 27, 14, '#fbfaf5', o()) +
        ellipse(18.2, 25.8, 3.8, 5, INK, '', 28) + ellipse(29.8, 25.8, 3.8, 5, INK, '', -28) +
        circle(18.8, 25, 1.3, '#fff') + circle(29.2, 25, 1.3, '#fff') +
        ellipse(24, 31, 2.5, 1.8, INK) + smile(24, 32.6) + cheeks(14.6, 33.4, 31.6, '#ffb0a8');
    },
    fox: function () {
      return path('M9.6 21.6 11.6 6.2 21 14.4z', '#f07a2a', o()) + path('M12.6 17.2 13.4 10.6 17.4 14.4z', '#5a3424') +
        path('M38.4 21.6 36.4 6.2 27 14.4z', '#f07a2a', o()) + path('M35.4 17.2 34.6 10.6 30.6 14.4z', '#5a3424') +
        path('M7.4 21.6Q24 7 40.6 21.6Q39.6 33.4 24 41.4Q8.4 33.4 7.4 21.6z', '#f07a2a', o()) +
        path('M8.6 24.6Q16 27.6 24 40Q12.4 36.4 8.6 24.6z', '#fff4e6') +
        path('M39.4 24.6Q32 27.6 24 40Q35.6 36.4 39.4 24.6z', '#fff4e6') +
        eyes(17.6, 30.4, 25.4) + circle(24, 38.4, 2.1, INK);
    },
    bird: function () {
      return path('M22.4 13.4q-1.4-5.4 2.6-6.8q-.6 3.8 1.6 6.4', '#3f9fd8', o(1.8)) +
        circle(24, 27, 14.2, '#56b8ea', o()) +
        path('M10.6 25.4q-4.2 4.6-1.6 9.8q3.8-1.4 4.6-6.2z', '#3c96cf', o(1.8)) +
        path('M37.4 25.4q4.2 4.6 1.6 9.8q-3.8-1.4-4.6-6.2z', '#3c96cf', o(1.8)) +
        ellipse(24, 33.6, 8.6, 6.2, '#dff3ff') + eyes(19, 29, 23.8, 2) +
        path('M20.6 27.4h6.8L24 31.8z', '#ffb02e', o(1.6)) + cheeks(15.4, 32.6, 28.8);
    },
    deer: function () {
      return path('M17.6 15 14.6 6.4M15.8 9.8 11.4 8.2M30.4 15 33.4 6.4M32.2 9.8 36.6 8.2', 'none',
        ' stroke="#7a4f2c" stroke-width="2.6" stroke-linecap="round"') +
        ellipse(9.8, 22.4, 6, 3.2, '#c98b55', o(), -24) + ellipse(10, 22.4, 3.4, 1.5, '#f3c9a0', '', -24) +
        ellipse(38.2, 22.4, 6, 3.2, '#c98b55', o(), 24) + ellipse(38, 22.4, 3.4, 1.5, '#f3c9a0', '', 24) +
        ellipse(24, 28.4, 12.4, 13.4, '#c98b55', o()) +
        circle(20.4, 18, 1.2, '#fff4e4') + circle(24.6, 16.6, 1.4, '#fff4e4') + circle(28, 18.8, 1.1, '#fff4e4') +
        ellipse(24, 35, 7, 5.4, '#f1d6b4') + ellipse(24, 32.6, 2.4, 1.8, INK) + smile(24, 34.2) +
        eyes(18.6, 29.4, 27) + cheeks(15.2, 32.8, 31.4);
    },
    crab: function () {
      return path('M17 17.6 14.4 12M31 17.6l2.6-5.6', 'none', o(1.8)) + circle(14.2, 11.2, 2.4, '#fff', o(1.6)) +
        circle(33.8, 11.2, 2.4, '#fff', o(1.6)) + circle(14.6, 11.4, 1.1, INK) + circle(33.4, 11.4, 1.1, INK) +
        path('M9 30l-5 4M9.6 33.4l-4.4 5.2M39 30l5 4M38.4 33.4l4.4 5.2', 'none', o(2)) +
        path('M10.6 20.4C3.4 18.6 2.8 11 7.6 9.6c-.4 3.2 1.4 4.4 3.4 4.4M37.4 20.4c7.2-1.8 7.8-9.4 3-10.8.4 3.2-1.4 4.4-3.4 4.4',
          '#f0543c', o(1.8)) +
        ellipse(24, 27, 15, 10.4, '#f0543c', o()) + cheeks(16.6, 31.4, 28.4, '#ffd0c4') +
        path('M20.4 29.6q3.6 2.6 7.2 0', 'none', o(1.5));
    }
  };

  /* ---------- 食物：24×24 ---------- */

  var F = o(1.5);
  var STEM = ' stroke="#6b4226" stroke-width="1.6" stroke-linecap="round"';
  var LEAF = 'M13.2 5.6c1.4-1.9 3.8-2.2 5-1.6-.7 1.9-3 2.8-5 1.6z';

  function shine(cx, cy, rx, ry) {
    return ellipse(cx, cy, rx, ry, '#fff', ' opacity=".55"', 22);
  }

  function apple(body, leaf) {
    return path('M12 7.6c-1.6-1.5-6.9-2-8 2.8-1.2 4.9 1.9 10.9 5 11.1 1.4.1 2-.7 3-.7s1.6.8 3 .7c3.1-.2 6.2-6.2 5-11.1-1.1-4.8-6.4-4.3-8-2.8z',
      body, F) + shine(8.2, 11.4, 1.2, 2.1) + path('M12 7.6c-.1-1.8.4-3.2 1.4-4.2', 'none', STEM) +
      path(LEAF, leaf || '#4cb34f', o(1.2));
  }

  var FOODS = {
    apple: function () { return apple('#ff5a4a'); },
    goldapple: function () { return apple('#ffcc2e', '#7ccf5a'); },
    carrot: function () {
      return path('M15.6 7.4c-.6-2.6.2-4.6 2-5.4.3 2.2-.4 3.9-1.5 5.6zM16.6 8.2c1.8-1.8 4.2-2.2 5.6-1.2-1.4 1.6-3.4 2-5.4 1.4z',
        '#47b04b', o(1.2)) +
        path('M4.6 20.6 15 8.6c1.4-1.6 4 .4 2.9 2.2L6.2 21.9c-.7.8-2.1-.4-1.6-1.3z', '#ff8a2a', F) +
        path('M10.4 13.6l1.6 1.2M8.2 16.4l1.4 1M12.8 11l1.4 1', 'none', ' stroke="#c85d12" stroke-width="1.1" stroke-linecap="round"');
    },
    peach: function () {
      return path('M12 20.6c-4.7 0-7.6-3.3-7.6-7.4 0-4.5 3.7-7.1 7.6-6.1 3.9-1 7.6 1.6 7.6 6.1 0 4.1-2.9 7.4-7.6 7.4z', '#ffb08e', F) +
        ellipse(15.4, 14, 3, 3.8, '#ff7f6e', ' opacity=".45"') +
        path('M12 7.4c-1.8 2.6-1.8 7.4.2 11.2', 'none', ' stroke="#e0685a" stroke-width="1.2" stroke-linecap="round"') +
        path('M12.4 6.8c.8-2.4 3.2-3.6 5.4-3-1 2.2-3.2 3.4-5.4 3z', '#4cb34f', o(1.2));
    },
    acorn: function () {
      return path('M6.8 11.2h10.4c0 5.2-2.5 9.4-5.2 10.4-2.7-1-5.2-5.2-5.2-10.4z', '#d39350', F) +
        ellipse(9.8, 15, 0.9, 1.8, '#fff', ' opacity=".4"') +
        path('M12 5.7V3', 'none', ' stroke="#5a361c" stroke-width="1.6" stroke-linecap="round"') +
        path('M5.2 11.6c0-3.6 3-5.9 6.8-5.9s6.8 2.3 6.8 5.9z', '#7c4d2a', F) +
        path('M8.4 8.6l1.4 2.4M11.6 7.4l.8 3.4M15.2 8.4l-1.2 2.6', 'none', ' stroke="#4d2e16" stroke-width="1" stroke-linecap="round"');
    },
    fish: function () {
      return path('M16.4 12l5-4.4v8.8z', '#3d95d6', F) +
        path('M2.8 12c2.8-5 10-6 14.2 0-4.2 6-11.4 5-14.2 0z', '#58b2ee', F) +
        path('M10 9.4q1.4 2.6 0 5.2', 'none', ' stroke="#2f7fbd" stroke-width="1.1" stroke-linecap="round"') +
        circle(6.8, 11, 1.15, INK);
    },
    bamboo: function () {
      return path('M12 2.8c2.8 4.2 6 10 6 14 0 2.8-2.6 4.4-6 4.4s-6-1.6-6-4.4c0-4 3.2-9.8 6-14z', '#cdd86c', F) +
        path('M7 15.6c2.2-1.4 4.4-1 5 1.6.6-2.6 2.8-3 5-1.6M8.8 10.4c1.4-.8 2.6-.6 3.2 1.2.6-1.8 1.8-2 3.2-1.2',
          'none', ' stroke="#859430" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"') +
        path('M7.4 19.2c2.6 1.4 6.6 1.4 9.2 0', 'none', ' stroke="#a77b3d" stroke-width="1.2" stroke-linecap="round"');
    },
    grape: function () {
      var dots = [[12, 16.4], [9, 12.8], [15, 12.8], [7.4, 8.8], [12, 9], [16.6, 8.8]];
      return path('M12 6.2V3', 'none', STEM) + path('M12.6 4.4c1.6-1.8 4-2 5.2-1.2-1 1.8-3.2 2.4-5.2 1.2z', '#4cb34f', o(1.2)) +
        dots.map(function (p) {
          return circle(p[0], p[1], 2.9, '#9b6be0', o(1.3)) + circle(p[0] - 0.9, p[1] - 0.9, 0.7, '#fff', ' opacity=".7"');
        }).join('');
    },
    cherry: function () {
      return path('M8 14.6c.6-4.6 2.6-8.2 5.6-10.6M16 15.4c-.4-4.6-1-8.6-2.4-11.4', 'none',
        ' stroke="#5a8f2e" stroke-width="1.5" stroke-linecap="round"') +
        path('M13.6 4c1.8-1.6 4.4-1.6 5.6-.6-1.2 1.8-3.6 2.2-5.6.6z', '#4cb34f', o(1.2)) +
        circle(7.6, 16.8, 4, '#ff4f63', F) + circle(16.2, 17.4, 4, '#e8364d', F) +
        circle(6.2, 15.4, 0.9, '#fff', ' opacity=".7"') + circle(14.8, 16, 0.9, '#fff', ' opacity=".7"');
    },
    mushroom: function () {
      return path('M9.2 13.4h5.6l.8 6c.1 1.2-1 2-3.6 2s-3.7-.8-3.6-2z', '#f4e6cc', F) +
        path('M3.4 13.6c0-5.4 3.9-9 8.6-9s8.6 3.6 8.6 9c0 .6-.5 1-1.2 1H4.6c-.7 0-1.2-.4-1.2-1z', '#ec4d3d', F) +
        circle(8.2, 9.6, 1.5, '#fff') + circle(13.4, 7.8, 1.2, '#fff') + circle(16, 11.2, 1.4, '#fff') + circle(11.2, 12, 1, '#fff');
    },
    orange: function () {
      return circle(12, 13.4, 7.6, '#ff9a1f', F) + shine(9.2, 10.8, 1.2, 2) +
        circle(13.4, 15.6, 0.5, '#d9700a') + circle(15.4, 12.6, 0.5, '#d9700a') + circle(10.6, 16.8, 0.5, '#d9700a') +
        path('M12 6V3.6', 'none', STEM) + path('M12.4 5.2c1.4-1.9 3.8-2.2 5-1.6-.7 1.9-3 2.8-5 1.6z', '#2f9a4f', o(1.2));
    },
    pinecone: function () {
      return path('M12 3.6V1.6', 'none', ' stroke="#5a361c" stroke-width="1.7" stroke-linecap="round"') +
        path('M12 3.4c4.6 1.8 6.6 6.2 6.2 10.6-.5 4.6-3.4 7.4-6.2 8-2.8-.6-5.7-3.4-6.2-8C5.4 9.6 7.4 5.2 12 3.4z', '#c27b3a', F) +
        path('M7.6 9.6q4.4 2.6 8.8 0M6.6 13.6q5.4 3 10.8 0M7.8 17.6q4.2 2.4 8.4 0M12 5.6v3.2M9.4 10.8l.6 3.4M14.6 10.8l-.6 3.4M10 15l.4 3.2M14 15l-.4 3.2',
          'none', ' stroke="#7a4520" stroke-width="1.1" stroke-linecap="round"');
    },
    coconut: function () {
      return circle(12, 12.6, 7.4, '#8a5a34', F) + circle(9.4, 10.6, 1, '#4d2e16') + circle(12.6, 9.6, 1, '#4d2e16') +
        circle(11.4, 12.6, 1, '#4d2e16') + ellipse(15.4, 15.6, 1.6, 2.6, '#a77048', ' opacity=".8"', -30);
    },
    blossom: function () {
      var petals = '';
      for (var i = 0; i < 5; i += 1) {
        petals += '<ellipse cx="12" cy="7.2" rx="3.4" ry="4.6" fill="#fff1f6"' + o(1.2) +
          ' transform="rotate(' + (i * 72 + 8) + ' 12 12)"/>';
      }
      return petals + circle(12, 12, 2.6, '#ffc93c', o(1.1));
    },
    mapleleaf: function () {
      return path('M12 2.6l1.8 4 3.2-1.2-.8 3.8 3.8-.4-2 3.2 2.8 1.6-4 1.2.6 3.2-3.6-1.6-.8 4.2h-2l-.8-4.2-3.6 1.6.6-3.2-4-1.2 2.8-1.6-2-3.2 3.8.4-.8-3.8 3.2 1.2z',
        '#ff6a3d', o(1.2)) + path('M12 20.8V8.4', 'none', ' stroke="#b8401c" stroke-width="1.1" stroke-linecap="round"');
    },
    berry: function () {
      return circle(9, 14, 3.6, '#e8364d', F) + circle(15, 14.4, 3.6, '#ff4f63', F) + circle(12, 9.6, 3.6, '#ff5a6e', F) +
        path('M10.6 6.6c1.6-2 4.4-2.4 6-1.4-1.4 2-3.8 2.6-6 1.4z', '#2f8a5a', o(1.1));
    },
    lantern: function () {
      return circle(12, 12.4, 9.4, '#ffe58a', ' opacity=".35"') + circle(12, 12.4, 5.2, '#ffd23f', F) +
        circle(10.6, 11, 1.4, '#fffbe0');
    }
  };

  function svg(viewBox, inner, size, cls, label) {
    var s = size ? ' width="' + size + '" height="' + size + '"' : '';
    var a11y = label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true"';
    return '<svg class="' + (cls || '') + '" viewBox="' + viewBox + '"' + s + a11y + ' focusable="false">' + inner + '</svg>';
  }

  function animal(id, size, cls, label) {
    var draw = ANIMALS[id] || ANIMALS.hedgehog;
    return svg('0 0 48 48', draw(), size, 'animal ' + (cls || ''), label);
  }

  function food(id, size, cls) {
    var draw = FOODS[id] || FOODS.apple;
    return svg('0 0 24 24', draw(), size, 'food ' + (cls || ''));
  }

  /* 给场景用的原始图形：放在 <g transform> 里复用 */
  function animalInner(id) {
    return (ANIMALS[id] || ANIMALS.hedgehog)();
  }

  function foodInner(id) {
    return (FOODS[id] || FOODS.apple)();
  }

  /* 松果：森林里的货币 */
  function cone(size, cls) {
    return food('pinecone', size, 'cone ' + (cls || ''));
  }

  window.DFArt = {
    INK: INK,
    animal: animal,
    food: food,
    cone: cone,
    animalInner: animalInner,
    foodInner: foodInner,
    animals: Object.keys(ANIMALS),
    foods: Object.keys(FOODS)
  };
})();
