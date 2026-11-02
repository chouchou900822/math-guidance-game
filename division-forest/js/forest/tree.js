/* 除法森林 — 大树场景：用 SVG 拼出一座树屋小院 */
(function () {
  'use strict';

  var Art = window.DFArt;
  var INK = Art.INK;
  var NS = 'http://www.w3.org/2000/svg';
  var seq = 0;

  function r1(v) {
    return Math.round(v * 10) / 10;
  }

  function circ(cx, cy, r, fill, extra) {
    return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }

  function pth(d, fill, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>';
  }

  function ell(cx, cy, rx, ry, fill, rot, extra) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' +
      (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + (extra || '') + '/>';
  }

  function ink(width) {
    return ' stroke="' + INK + '" stroke-width="' + width + '" stroke-linejoin="round" stroke-linecap="round"';
  }

  /* 一团圆形叶子：先画加粗描边，再盖一层填色，交界处的描边就被遮住了，只留下外轮廓 */
  function blob(circles, base, shade, outline) {
    var out = circles.map(function (c) { return circ(c[0], c[1], c[2], shade, ink(outline || 8)); }).join('');
    out += circles.map(function (c) { return circ(c[0], c[1], c[2], shade); }).join('');
    out += circles.map(function (c) { return circ(c[0], c[1] - 5, c[2] - 6, base); }).join('');
    return out;
  }

  var ROUND = [[200, 150, 72], [138, 178, 50], [262, 178, 50], [146, 122, 48], [254, 122, 48], [200, 88, 54],
    [176, 200, 42], [224, 200, 42]];

  var FRUIT_SPOTS = {
    round: [[158, 140], [238, 114], [262, 184], [176, 196], [212, 156], [130, 188], [280, 144], [196, 98],
      [230, 208], [148, 104], [248, 160], [112, 152]],
    pine: [[178, 126], [224, 172], [156, 238], [248, 244], [204, 214], [188, 178]],
    palm: [[204, 170], [225, 172], [214, 186]]
  };

  var FRUIT_SIZE = { blossom: 27, berry: 26, mapleleaf: 30, lantern: 32, coconut: 30, pinecone: 31 };

  function roundCrown(p) {
    return blob(ROUND, p.crown[0], p.crown[1]) +
      ell(160, 104, 26, 15, p.light, -24, ' opacity=".9"') +
      ell(214, 66, 18, 10, p.light, -10, ' opacity=".9"') +
      ell(118, 168, 14, 8, p.light, -30, ' opacity=".9"');
  }

  var PINE = [[146, 268, 110], [96, 204, 88], [48, 142, 64]];

  function snowCap(apex, base, w) {
    var t = 0.44;
    var y = r1(apex + (base - apex) * t);
    var lx = r1(200 - w * t);
    var rx = r1(200 + w * t);
    var d = 'M200 ' + (apex - 2) + 'L' + rx + ' ' + y +
      'Q' + (rx - 8) + ' ' + (y + 11) + ' ' + (rx - 18) + ' ' + (y + 3) +
      'Q204 ' + (y + 14) + ' 200 ' + (y + 4) +
      'Q190 ' + (y + 13) + ' ' + (lx + 18) + ' ' + (y + 3) +
      'Q' + (lx + 8) + ' ' + (y + 11) + ' ' + lx + ' ' + y + 'Z';
    return pth(d, '#ffffff', ink(3));
  }

  /* 每层树冠露出来的是下沿，积雪就挂在下沿上 */
  function snowBand(base, w) {
    var x0 = r1(200 + w * 0.9);
    var x1 = r1(200 - w * 0.9);
    var steps = 5;
    var dx = (x0 - x1) / steps;
    var d = 'M' + (200 - w) + ' ' + base + 'Q200 ' + (base + 18) + ' ' + (200 + w) + ' ' + base + 'L' + x0 + ' ' + (base - 9);
    for (var k = 1; k <= steps; k += 1) {
      d += 'Q' + r1(x0 - dx * (k - 0.5)) + ' ' + (base + 9) + ' ' + r1(x0 - dx * k) + ' ' + (base - 9 + (k % 2) * 3);
    }
    return pth(d + 'Z', '#ffffff', ink(3));
  }

  function pineCrown(p, snow) {
    return PINE.map(function (l) {
      var apex = l[0];
      var base = l[1];
      var w = l[2];
      var d = 'M200 ' + apex + 'L' + (200 + w) + ' ' + base + 'Q200 ' + (base + 18) + ' ' + (200 - w) + ' ' + base + 'Z';
      var lit = 'M200 ' + (apex + 16) + 'L' + r1(200 - w * 0.62) + ' ' + (base - 6) +
        'Q' + r1(200 - w * 0.3) + ' ' + (base + 3) + ' 194 ' + (base + 5) + 'Z';
      return pth(d, p.crown[0], ink(4)) + pth(lit, p.light, ' opacity=".5"') +
        (snow ? snowBand(base, w) + (apex === 48 ? snowCap(apex, base, w) : '') : '');
    }).join('');
  }

  var PALM_TOP = [213, 150];
  var FRONDS = [[104, 214], [94, 142], [138, 80], [214, 52], [290, 80], [330, 142], [320, 214]];

  function palmCrown(p) {
    var tx = PALM_TOP[0];
    var ty = PALM_TOP[1];
    return FRONDS.map(function (e) {
      var dx = e[0] - tx;
      var dy = e[1] - ty;
      var len = Math.sqrt(dx * dx + dy * dy);
      var nx = -dy / len;
      var ny = dx / len;
      var mx = tx + dx * 0.5;
      var my = ty + dy * 0.5 - 14;
      var d = 'M' + tx + ' ' + ty + 'Q' + r1(mx + nx * 17) + ' ' + r1(my + ny * 17) + ' ' + e[0] + ' ' + e[1] +
        'Q' + r1(mx - nx * 17) + ' ' + r1(my - ny * 17) + ' ' + tx + ' ' + ty + 'Z';
      var rib = 'M' + tx + ' ' + ty + 'Q' + r1(mx) + ' ' + r1(my) + ' ' + e[0] + ' ' + e[1];
      return pth(d, p.crown[0], ink(3.5)) + pth(rib, 'none', ' stroke="' + p.crown[1] + '" stroke-width="2.6" stroke-linecap="round"');
    }).join('');
  }

  function trunk(skin) {
    var p = skin.palette;
    if (skin.crown === 'palm') {
      var rings = '';
      [306, 274, 242, 210, 180].forEach(function (y) {
        var left = r1(186 + (338 - y) / 186 * 18);
        var right = r1(212 + (338 - y) / 184 * 10);
        rings += pth('M' + left + ' ' + y + 'Q' + r1((left + right) / 2) + ' ' + (y + 7) + ' ' + right + ' ' + (y - 1), 'none', ink(2.4));
      });
      return pth('M186 340C192 280 198 220 204 152L222 154C216 220 212 282 212 340Z', p.trunk, ink(4)) + rings;
    }
    if (skin.crown === 'pine') {
      return pth('M186 340C190 314 190 292 189 266L211 266C210 292 210 314 214 340Z', p.trunk, ink(4)) +
        pth('M191 340V323A9 9 0 0 1 209 323V340Z', '#5b3a24', ink(3)) + circ(205, 331, 1.8, '#ffd23f');
    }
    return pth('M178 340C186 302 188 264 186 222L214 222C212 264 214 302 222 340Z', p.trunk, ink(4)) +
      pth('M164 342Q178 336 183 324M236 342Q222 336 217 324', 'none', ink(3.5)) +
      pth('M194 236q4 10 0 20M208 248q-3 8 0 14', 'none', ' stroke="rgba(27,31,23,.35)" stroke-width="2.2" stroke-linecap="round"') +
      pth('M188 340V316A12 12 0 0 1 212 316V340Z', '#5b3a24', ink(3)) + circ(207, 328, 2.2, '#ffd23f') +
      '<g class="tree-window">' + circ(200, 274, 9, p.window, ink(3)) + pth('M200 265V283M191 274H209', 'none', ink(2)) + '</g>';
  }

  function fruitsOf(skin) {
    var spots = FRUIT_SPOTS[skin.crown] || FRUIT_SPOTS.round;
    var size = FRUIT_SIZE[skin.fruit] || 34;
    var count = Math.min(spots.length, skin.fruits || 8);
    var out = '';
    for (var i = 0; i < count; i += 1) {
      var x = spots[i][0];
      var y = spots[i][1];
      out += '<g class="tree-fruit' + (skin.fruit === 'lantern' ? ' is-glow' : '') + '" data-x="' + x + '" data-y="' + y +
        '" style="animation-delay:' + (-i * 0.37).toFixed(2) + 's">' +
        '<g transform="translate(' + r1(x - size / 2) + ' ' + r1(y - size / 2) + ') scale(' + r1(size / 24 * 100) / 100 + ')">' +
        Art.foodInner(skin.fruit) + '</g></g>';
    }
    return out;
  }

  function sky(skin) {
    var p = skin.palette;
    if (skin.night) {
      var stars = [[60, 74], [112, 46], [152, 96], [246, 40], [352, 156], [84, 138], [340, 64], [190, 28], [36, 196], [372, 214]];
      return stars.map(function (s, i) {
        return circ(s[0], s[1], i % 3 === 0 ? 2.8 : 1.9, '#fff7cc', ' class="tree-twinkle" style="animation-delay:' + (i * 0.43).toFixed(2) + 's"');
      }).join('') +
        circ(316, 88, 24, p.sun, ink(3)) + circ(308, 82, 4.4, '#f1df9a') + circ(322, 98, 3, '#f1df9a');
    }
    var rays = '';
    for (var i = 0; i < 8; i += 1) {
      var t = i * Math.PI / 4;
      rays += pth('M' + r1(316 + 33 * Math.cos(t)) + ' ' + r1(88 + 33 * Math.sin(t)) + 'L' +
        r1(316 + 42 * Math.cos(t)) + ' ' + r1(88 + 42 * Math.sin(t)), 'none', ink(3.5));
    }
    return '<g class="tree-sun"><g class="tree-rays">' + rays + '</g>' + circ(316, 88, 24, p.sun, ink(3.5)) +
      circ(308, 86, 2.2, INK) + circ(324, 86, 2.2, INK) + pth('M310 95q6 5 12 0', 'none', ink(2.2)) + '</g>' +
      '<g class="tree-cloud">' + cloud(30, 120) + '</g>' +
      '<g class="tree-cloud is-slow">' + cloud(292, 196) + '</g>';
  }

  function cloud(x, y) {
    return pth('M' + x + ' ' + y + 'h64a13 13 0 0 0-4-25a19 19 0 0 0-34-8a22 22 0 0 0-26 33z', '#ffffff', ink(3));
  }

  function land(skin) {
    var p = skin.palette;
    var out = pth('M-6 288C60 246 128 252 176 282C222 256 304 238 406 270V406H-6Z', p.hill, ink(3));
    if (skin.sea) {
      out += '<rect x="-6" y="262" width="412" height="70" fill="' + skin.sea + '"/>' +
        pth('M30 286q10-6 20 0t20 0M250 280q10-6 20 0t20 0M150 300q10-6 20 0t20 0', 'none',
          ' stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".8"');
    }
    out += pth('M-6 320C80 298 150 302 200 308S330 314 406 302V406H-6Z', p.ground, ink(4));
    var tufts = [[30, 338], [150, 330], [262, 336], [340, 328], [96, 358], [300, 362], [204, 374]];
    out += tufts.map(function (t) {
      return pth('M' + t[0] + ' ' + t[1] + 'l3-9 3 8 3-11 3 11', 'none',
        ' stroke="' + p.grass + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"');
    }).join('');
    if (!skin.night && !skin.snow && !skin.sea) {
      [[48, 354, '#ffffff'], [272, 352, '#ffd23f'], [334, 346, '#ffffff']].forEach(function (f) {
        var petals = '';
        for (var i = 0; i < 5; i += 1) {
          var t = i * Math.PI * 2 / 5;
          petals += circ(f[0] + 4.2 * Math.cos(t), f[1] + 4.2 * Math.sin(t), 3, f[2], ink(1.4));
        }
        out += petals + circ(f[0], f[1], 2.4, f[2] === '#ffffff' ? '#ffd23f' : '#ff8a5c', ink(1.2));
      });
    }
    return out;
  }

  function resident(skin) {
    var p = skin.palette;
    var bush = blob([[70, 344, 24], [104, 336, 28], [138, 346, 22]], p.bush[0], p.bush[1], 7);
    if (skin.basket) {
      var cones = [[78, 304], [100, 298], [122, 304], [90, 290], [112, 288]].map(function (c) {
        return '<g transform="translate(' + (c[0] - 13) + ' ' + (c[1] - 13) + ') scale(1.08)">' + Art.foodInner('pinecone') + '</g>';
      }).join('');
      return '<g class="tree-basket">' + cones +
        pth('M58 312H142L134 348H66Z', '#d39a4f', ink(3.5)) +
        pth('M76 318v26M92 318v28M108 318v28M124 318v26', 'none', ' stroke="#9a6a2e" stroke-width="2.2" stroke-linecap="round"') +
        '<rect x="54" y="305" width="92" height="11" rx="5.5" fill="#b9803c"' + ink(3) + '/></g>';
    }
    if (!skin.resident) return bush;
    return '<g class="tree-resident"><g transform="translate(50 226) scale(1.8)">' +
      Art.animalInner(skin.resident) + '</g></g>' + bush;
  }

  function sign(skin) {
    if (!skin.sign) return '';
    return pth('M256 226L262 246M300 226L294 246', 'none', ink(2.6)) +
      '<rect x="238" y="244" width="78" height="31" rx="8" fill="#fff6d6"' + ink(3.5) + '/>' +
      '<text x="277" y="267" text-anchor="middle" font-family="Arial Black, Archivo Black, Helvetica, sans-serif" ' +
      'font-size="19" font-weight="900" fill="#a86a00">' + skin.sign + '</text>';
  }

  /* 闲置时的飘落物：只是氛围，不影响点击 */
  function drift(skin) {
    var kind = skin.drift;
    if (!kind) return '';
    var out = '';
    var i;
    if (kind === 'petal' || kind === 'maple') {
      for (i = 0; i < 7; i += 1) {
        var x = 46 + i * 48;
        var shape = kind === 'petal'
          ? ell(x, -12, 5, 3.2, '#ffc2d6', 0, ink(1.3))
          : '<g transform="translate(' + (x - 9) + ' -20) scale(.75)">' + Art.foodInner('mapleleaf') + '</g>';
        out += '<g class="tree-drift" style="animation-delay:' + (-i * 1.13).toFixed(2) + 's;animation-duration:' +
          (7 + (i % 3)) + 's">' + shape + '</g>';
      }
    } else if (kind === 'snow') {
      for (i = 0; i < 16; i += 1) {
        out += '<g class="tree-drift is-snow" style="animation-delay:' + (-i * 0.61).toFixed(2) + 's;animation-duration:' +
          (6 + (i % 4)) + 's">' + circ(18 + i * 24, -8, 2.6 + (i % 3) * 0.8, '#ffffff', ' stroke="#9fb7cc" stroke-width="1.2"') + '</g>';
      }
    } else if (kind === 'firefly') {
      var spots = [[70, 220], [118, 252], [300, 236], [340, 192], [256, 280], [150, 64], [40, 150], [362, 110], [96, 300]];
      spots.forEach(function (s, k) {
        out += '<g class="tree-firefly" style="animation-delay:' + (-k * 0.53).toFixed(2) + 's">' +
          circ(s[0], s[1], 8, '#ffe36b', ' opacity=".28"') + circ(s[0], s[1], 3, '#fff3a6', ' stroke="#c9a21a" stroke-width="1"') + '</g>';
      });
    } else if (kind === 'spark') {
      [[96, 70], [312, 168], [70, 220], [330, 236], [140, 40]].forEach(function (s, k) {
        out += '<g class="tree-twinkle" style="animation-delay:' + (k * 0.6).toFixed(1) + 's">' +
          pth('M' + s[0] + ' ' + (s[1] - 9) + 'l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z', '#fff3a6', ink(1.6)) + '</g>';
      });
    }
    return '<g class="tree-drifts" aria-hidden="true">' + out + '</g>';
  }

  /**
   * 生成一整幅场景。opts.thumb 用于皮肤卡片缩略图：不放飘落物和特效层。
   */
  function scene(skin, opts) {
    opts = opts || {};
    seq += 1;
    var uid = 'df' + seq;
    var p = skin.palette;
    var crown = skin.crown === 'pine' ? pineCrown(p, skin.snow)
      : skin.crown === 'palm' ? palmCrown(p) : roundCrown(p);

    return '<svg class="tree-svg' + (opts.thumb ? ' is-thumb' : '') + (skin.night ? ' is-night' : '') +
      '" viewBox="0 0 400 400" aria-hidden="true" focusable="false" data-skin="' + skin.id + '">' +
      '<defs>' +
        '<clipPath id="' + uid + '-clip"><circle cx="200" cy="200" r="186"/></clipPath>' +
        '<linearGradient id="' + uid + '-sky" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + p.sky[0] + '"/><stop offset="1" stop-color="' + p.sky[1] + '"/>' +
        '</linearGradient>' +
      '</defs>' +
      circ(210, 210, 186, INK) +
      '<g clip-path="url(#' + uid + '-clip)">' +
        '<rect x="0" y="0" width="400" height="400" fill="url(#' + uid + '-sky)"/>' +
        sky(skin) +
        land(skin) +
        trunk(skin) +
        '<g class="tree-crown">' + crown + fruitsOf(skin) + sign(skin) + '</g>' +
        resident(skin) +
        (opts.thumb ? '' : drift(skin) + '<g class="tree-drop"></g><g class="tree-egg"></g>') +
      '</g>' +
      circ(200, 200, 186, 'none', ink(6)) +
    '</svg>';
  }

  /* 轻点大树：随机一颗果子掉下来，落地弹一下再淡出 */
  function dropFruit(svgEl) {
    if (!svgEl) return;
    var fruits = svgEl.querySelectorAll('.tree-fruit:not(.is-picked)');
    var layer = svgEl.querySelector('.tree-drop');
    if (!fruits.length || !layer) return;
    var src = fruits[Math.floor(Math.random() * fruits.length)];
    var y = Number(src.getAttribute('data-y')) || 160;
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'fruit-fall');
    g.innerHTML = src.innerHTML;
    g.style.setProperty('--dy', Math.round(338 + Math.random() * 18 - y) + 'px');
    g.style.setProperty('--dx', Math.round((Math.random() - 0.5) * 56) + 'px');
    layer.appendChild(g);
    src.classList.add('is-picked');
    window.setTimeout(function () { src.classList.remove('is-picked'); }, 2600);
    window.setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 1700);
  }

  function layer(svgEl) {
    return svgEl ? svgEl.querySelector('.tree-egg') : null;
  }

  window.DFTree = {
    NS: NS,
    scene: scene,
    dropFruit: dropFruit,
    layer: layer
  };
})();
