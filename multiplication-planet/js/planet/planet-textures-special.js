(function () {
  'use strict';

  var K = window.MPPlanetPaintKit;
  var TW = K.TW;
  var TH = K.TH;
  var TAU = K.TAU;

  function swirl(g, pal, rand) {
    var colors = pal.band;
    var sugar = K.ramp([colors[0], colors[0], '#fff1e4', colors[1], colors[2], colors[2], '#fff2e5', colors[3], colors[0]]);
    var centers = [];
    for (var i = 0; i < 3; i += 1) centers.push([50 + i * 172 + rand() * 18, 70 + (i % 2) * 100, 73 + rand() * 12]);
    var phase = rand() * TAU;
    K.field(g, function (x, y) {
      var u = x;
      var v = y;
      for (var j = 0; j < centers.length; j += 1) {
        var center = centers[j];
        var dx = ((x - center[0] + TW * 1.5) % TW) - TW * 0.5;
        var dy = y - center[1];
        var turn = 3.5 * Math.exp(-(dx * dx + dy * dy) / (center[2] * center[2]));
        var cs = Math.cos(turn);
        var sn = Math.sin(turn);
        u += dx * cs - dy * sn - dx;
        v += dx * sn + dy * cs - dy;
      }
      var a = u / TW * TAU * 4 + v / TH * TAU * 0.8 + Math.sin(v / TH * TAU) * 1.15 + phase;
      var t = ((a / TAU % 1) + 1) % 1;
      var color = sugar(t);
      var shine = Math.sin(a * 2 - 0.65) * 0.035;
      return [color[0] * (1 + shine), color[1] * (1 + shine), color[2] * (1 + shine)];
    });
    for (i = 0; i < 3; i += 1) {
      var x = 60 + i * 172;
      var y = 73 + (i % 2) * 100;
      var curl = [];
      var twistA = [];
      var twistB = [];
      for (var s = 0; s <= 125; s += 1) {
        var t = s / 125;
        var a = t * TAU * 1.3 + 0.5;
        var r = 3 + t * 26;
        curl.push([Math.cos(a) * r, Math.sin(a) * r * 0.76]);
        var offset = Math.sin(t * TAU * 4) * 2.3;
        twistA.push([Math.cos(a) * (r + offset), Math.sin(a) * (r + offset) * 0.76]);
        twistB.push([Math.cos(a) * (r - offset), Math.sin(a) * (r - offset) * 0.76]);
      }
      K.wrap(g, x, y, 37, function () {
        K.stroke(g, K.path(curl), 'rgba(165,88,129,0.15)', 9.5);
        K.stroke(g, K.path(curl), '#fff5e8', 7.5);
        K.stroke(g, K.path(twistA), '#ff9cbb', 2.2);
        K.stroke(g, K.path(twistB), '#8bd5ed', 1.8);
        K.stroke(g, K.path(curl.slice(70, 110)), 'rgba(255,255,255,0.72)', 0.8);
      });
    }
    var sprinkles = ['#eb7094', '#fff4cf', '#65c2ce', '#9878ce', '#f5b35e'];
    for (i = 0; i < 43; i += 1) {
      x = (i % 11 + rand() * 0.7) / 11 * TW;
      y = 26 + Math.floor(i / 11) * 59 + rand() * 21;
      var angle = rand() * TAU;
      var length = 2.5 + rand() * 2.6;
      var color = sprinkles[i % sprinkles.length];
      K.wrap(g, x, y, length + 3, function () {
        g.rotate(angle);
        K.stroke(g, K.path([[-length / 2, 1], [length / 2, 1]]), 'rgba(139,92,111,0.2)', 2.2);
        K.stroke(g, K.path([[-length / 2, 0], [length / 2, 0]]), color, 1.9);
        K.stroke(g, K.path([[-length / 2, -0.5], [length * 0.2, -0.5]]), 'rgba(255,255,255,0.55)', 0.6);
      });
    }
  }

  function crystal(g, pal, rand) {
    var cols = 11;
    var rows = 6;
    var vertex = K.lattice(rand, cols, rows);
    for (var row = 0; row < rows; row += 1) {
      for (var col = 0; col < cols; col += 1) {
        var a = vertex(row, col);
        var b = vertex(row, col + 1);
        var c = vertex(row + 1, col + 1);
        var d = vertex(row + 1, col);
        var triangles = rand() > 0.5 ? [[a, b, d], [b, c, d]] : [[a, b, c], [a, c, d]];
        triangles.forEach(function (points) {
          var x = points[0][0];
          var y = points[0][1];
          var local = points.map(function (p) { return [p[0] - x, p[1] - y]; });
          var color = pal.facet[Math.floor(rand() * pal.facet.length)];
          var light = 0.04 + rand() * 0.14;
          K.wrap(g, x, y, 110, function () {
            var face = K.path(local, true);
            g.fillStyle = K.gradient(g, -20, -25, 40, 45, [K.tone(color, light), K.tone(color, -0.11)]);
            g.fill(face);
            K.stroke(g, face, 'rgba(223,211,255,0.24)', 0.65);
          });
        });
      }
    }
    for (var i = 0; i < 6; i += 1) {
      var cx = 30 + i * 86 + rand() * 10;
      var cy = 101 + (i % 2) * 82;
      K.glow(g, cx, cy - 14, 46, 34, '#b8b1ff', 0.2);
      K.prism(g, cx - 13, cy + 3, 17, 29, -0.42, ['#dccbff', '#9873df', '#8b6bd2', '#5740ab']);
      K.prism(g, cx + 13, cy + 4, 18, 36, 0.42, ['#ece1ff', '#ab94eb', '#9471e0', '#6651b7']);
      K.prism(g, cx, cy, 23, 47 + rand() * 9, -0.08, ['#ebe0ff', '#b197f3', '#9878e6', '#5d41a6']);
      K.wrap(g, cx, cy - 20, 28, function () {
        var hues = ['#82e8fa', '#bddcfa', '#e6c8f4', '#ffbcbf'];
        for (var h = 0; h < hues.length; h += 1) {
          K.stroke(g, K.path([[-12, h * 0.9], [8, -10 + h * 0.9], [15, -8 + h * 0.9]]), K.fade(hues[h], 0.62), 0.7);
        }
      });
      if (i % 2 === 0) K.spark(g, cx - 2, cy - 51, 3.8, '#f6eeff');
    }
  }

  function lava(g, pal, rand) {
    var rock = K.noise(rand, 10, 6);
    var basalt = K.ramp([pal.base[1], '#28141b', '#45252b', '#633338']);
    K.field(g, function (x, y) { return basalt(0.43 + rock(x, y) * 0.26); });
    var cols = 12;
    var rows = 7;
    var vertex = K.lattice(rand, cols, rows);
    for (var row = 0; row < rows; row += 1) {
      for (var col = 0; col < cols; col += 1) {
        var points = [vertex(row, col), vertex(row, col + 1), vertex(row + 1, col + 1), vertex(row + 1, col)];
        var cx = 0;
        var cy = 0;
        points.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; });
        var local = points.map(function (p) { return [(p[0] - cx) * 0.95, (p[1] - cy) * 0.94]; });
        var color = K.tone('#513039', (rand() - 0.5) * 0.3);
        var ridge = [-5 + rand() * 10, -6 + rand() * 7];
        K.wrap(g, cx, cy, 90, function () {
          g.fillStyle = K.gradient(g, -15, -24, 10, 26, [color, '#301e25', '#23151c']);
          g.fill(K.path(local, true));
          g.fillStyle = 'rgba(157,81,75,0.12)';
          g.fill(K.path([local[0], local[1], ridge, local[3]], true));
          K.stroke(g, K.path([local[3], local[0], local[1]]), 'rgba(166,93,89,0.22)', 0.9);
          K.stroke(g, K.path([local[1], local[2], local[3]]), 'rgba(12,8,13,0.48)', 1.4);
          K.stroke(g, K.path([[local[0][0] * 0.7, local[0][1] * 0.6], ridge, [local[2][0] * 0.65, local[2][1] * 0.5]]), 'rgba(22,13,19,0.42)', 0.8);
        });
      }
    }
    var cracks = [];
    function connect(a, b, strength) {
      cracks.push({
        x: a[0], y: a[1], strength: strength,
        points: [[0, 0], [(b[0] - a[0]) * 0.45 + (rand() - 0.5) * 6, (b[1] - a[1]) * 0.45 + (rand() - 0.5) * 6], [b[0] - a[0], b[1] - a[1]]]
      });
    }
    // 周期顶点共享裂隙端点，跨经度边界与支流连接处不会断开。
    [2, 4, 6].forEach(function (r) {
      for (var c = 0; c < cols; c += 1) connect(vertex(r, c), vertex(r, c + 1), 0.65 + rand() * 0.5);
    });
    [0, 3, 7, 10].forEach(function (c) {
      for (var r = 1; r < 6; r += 1) connect(vertex(r, c), vertex(r + 1, c), 0.55 + rand() * 0.45);
    });
    for (var j = 0; j < 8; j += 1) {
      var rr = j % 2 ? 4 : 2;
      var cc = (j * 3 + 1) % cols;
      var start = vertex(rr, cc);
      var end = vertex(rr + (j % 2 ? -1 : 1), cc + 1);
      connect(start, [start[0] + (end[0] - start[0]) * 0.55, start[1] + (end[1] - start[1]) * 0.55], 0.42);
    }
    cracks.forEach(function (crack) {
      K.wrap(g, crack.x, crack.y, 100, function () {
        var p = K.path(crack.points);
        K.stroke(g, p, 'rgba(243,57,30,0.065)', 12 * crack.strength);
        K.stroke(g, p, 'rgba(255,67,31,0.14)', 6 * crack.strength);
        K.stroke(g, p, '#b93629', 3 * crack.strength);
        K.stroke(g, p, '#f57143', 1.4 * crack.strength);
        K.stroke(g, p, 'rgba(255,183,113,0.9)', 0.5 * crack.strength);
      });
    });
    for (j = 0; j < 3; j += 1) {
      var center = vertex(2 + j * 2, 2 + j * 4);
      var r = 9 + rand() * 4;
      var pool = K.blob(rand, 0, 0, r);
      K.glow(g, center[0], center[1], r * 2.3, r * 1.4, '#e94c27', 0.22);
      K.wrap(g, center[0], center[1], r + 5, function () {
        K.stroke(g, pool, '#22141a', 4.8);
        g.fillStyle = K.gradient(g, 0, -r, 0, r, ['#9d3025', '#e55d34', '#f69553']);
        g.fill(pool);
        var ripple = new Path2D();
        ripple.ellipse(0, 1, r * 0.5, r * 0.23, -0.15, 0.1, Math.PI * 1.2);
        K.stroke(g, ripple, 'rgba(255,187,112,0.76)', 0.8);
        K.stroke(g, K.path([[-r * 0.5, -r * 0.2], [0, -r * 0.05], [r * 0.5, -r * 0.3]]), 'rgba(107,40,33,0.75)', 1.5);
      });
    }
  }

  function galaxy(g, pal, rand) {
    var cloud = K.noise(rand, 7, 5);
    var folds = K.noise(rand, 19, 12);
    var dust = K.noise(rand, 43, 23);
    var nebula = K.ramp([pal.base[1], '#1a2354', '#3a3f83', '#615fa9', '#a6a3d3', '#d6d4ec']);
    var phase = rand() * 0.6 - 0.3;
    function bandY(x) { return 128 + Math.sin(x / TW * TAU + phase) * 60 + Math.sin(x / TW * TAU * 2 - 0.2) * 10; }
    K.field(g, function (x, y) {
      var n = cloud(x, y);
      var f = folds(x, y);
      var dy = (y - bandY(x) - n * 22) / 33;
      var density = Math.exp(-dy * dy * 0.65);
      var filament = Math.max(0, f * 0.62 + dust(x, y) * 0.13 + 0.15);
      var strength = density * (0.42 + filament) + n * 0.1;
      var color = nebula(0.1 + strength * 0.8);
      var veil = 0.16 + density * 0.84;
      var rose = Math.max(0, cloud(x + 98, y)) * veil;
      var blue = Math.max(0, cloud(x + 300, y)) * veil;
      return [color[0] + rose * 54 - blue * 8, color[1] + blue * 24 + rose * 3, color[2] + rose * 16 + blue * 26];
    });
    for (var i = 0; i < 9; i += 1) {
      var x = i / 9 * TW + rand() * 16;
      var y = bandY(x) + (rand() - 0.5) * 25;
      K.glow(g, x, y, 27 + rand() * 17, 12 + rand() * 8, pal.nebula[i % pal.nebula.length], 0.12);
    }
    K.glow(g, TW * 0.5, bandY(TW * 0.5), 118, 56, '#c9c2ff', 0.15);
    K.glow(g, TW * 0.5, bandY(TW * 0.5), 54, 29, '#ffe1ef', 0.13);
    for (i = 0; i < 240; i += 1) {
      x = rand() * TW;
      var concentrated = i < 140;
      y = concentrated ? bandY(x) + (rand() + rand() + rand() - 1.5) * 37 : 12 + rand() * 232;
      var r = concentrated ? 0.35 + rand() * 0.8 : 0.4 + rand() * 0.6;
      K.dot(g, x, y, r, K.fade(i % 9 ? '#dfe8ff' : '#ffe3bb', 0.32 + rand() * 0.58));
    }
    var constellations = [
      [[-23, -5], [-9, -17], [7, -5], [21, 2], [9, 17]],
      [[-24, 7], [-11, -10], [3, -5], [19, -17], [28, -2]],
      [[-25, -7], [-8, 6], [8, 2], [20, 14], [27, -4]]
    ];
    for (i = 0; i < constellations.length; i += 1) {
      x = 60 + i * 176;
      y = i === 1 ? 69 : 198;
      var points = constellations[i];
      K.wrap(g, x, y, 34, function () { K.stroke(g, K.path(points), 'rgba(190,214,255,0.4)', 0.7); });
      points.forEach(function (p, j) { K.dot(g, x + p[0], y + p[1], j === 1 ? 1.7 : 1.25, '#e1edff'); });
    }
    for (i = 0; i < 5; i += 1) {
      x = 27 + i * 108;
      y = bandY(x) + (i % 2 ? -23 : 19);
      K.spark(g, x, y, 4 + rand() * 2.8, i % 2 ? '#e1f6ff' : '#fff0d9');
      K.dot(g, x, y, 0.85, '#ffffff');
    }
  }

  function binary(g, pal, rand) {
    var dot = pal.dot || '#59ffa8';
    var light = pal.glow || '#b9ffd8';
    var alloy = K.noise(rand, 18, 12);
    var metal = K.ramp([pal.base[1], '#14372c', '#285347']);
    K.field(g, function (x, y) { return metal(0.4 + alloy(x, y) * 0.11 + Math.sin(y / TH * Math.PI) * 0.13); });
    var panelW = TW / 8;
    var panelH = TH / 5;
    for (var row = 0; row < 5; row += 1) {
      for (var col = 0; col < 8; col += 1) {
        var x = (col + (row % 2) * 0.5) * panelW;
        var y = (row + 0.5) * panelH;
        var w = panelW - 3;
        var h = panelH - 3;
        var tint = rand() * 0.035;
        K.wrap(g, x, y, panelW, function () {
          var panel = K.path([[-w / 2 + 4, -h / 2], [w / 2 - 4, -h / 2], [w / 2, -h / 2 + 4], [w / 2, h / 2 - 4], [w / 2 - 4, h / 2], [-w / 2 + 4, h / 2], [-w / 2, h / 2 - 4], [-w / 2, -h / 2 + 4]], true);
          g.fillStyle = K.gradient(g, 0, -h / 2, 0, h / 2, [K.tone('#24483b', tint), '#142e25', '#0c211b']);
          g.fill(panel);
          K.stroke(g, panel, 'rgba(3,14,11,0.85)', 1.4);
          K.stroke(g, K.path([[-w / 2 + 2, -h / 2 + 5], [-w / 2 + 5, -h / 2 + 2], [w / 2 - 5, -h / 2 + 2]]), 'rgba(132,186,153,0.28)', 0.8);
          K.stroke(g, K.path([[w / 2 - 2, -h / 2 + 6], [w / 2 - 2, h / 2 - 5]]), 'rgba(111,162,134,0.12)', 0.7);
          for (var bolt = -1; bolt <= 1; bolt += 2) {
            g.fillStyle = '#4f7160';
            g.beginPath();
            g.arc(bolt * (w / 2 - 7), -h / 2 + 7, 1.25, 0, TAU);
            g.fill();
            K.stroke(g, K.path([[bolt * (w / 2 - 7) - 0.5, -h / 2 + 7], [bolt * (w / 2 - 7) + 0.5, -h / 2 + 7]]), '#10241c', 0.6);
          }
          for (var slot = 0; slot < 3; slot += 1) {
            K.stroke(g, K.path([[w / 2 - 18, h / 2 - 8 - slot * 3], [w / 2 - 7, h / 2 - 8 - slot * 3]]), 'rgba(91,147,113,0.16)', 0.65);
          }
        });
      }
    }
    for (var i = 0; i < 24; i += 1) {
      x = (i % 8 + 0.2) / 8 * TW;
      y = 37 + Math.floor(i / 8) * 88;
      var direction = i % 2 ? -1 : 1;
      var trace = K.path([[0, 0], [14, 0], [23, direction * 9], [39, direction * 9], [39, direction * 21]]);
      K.wrap(g, x, y, 44, function () {
        K.stroke(g, trace, K.fade(dot, 0.055), 4);
        K.stroke(g, trace, K.fade(dot, 0.38), 0.85);
        K.stroke(g, K.path([[0, 4], [12, 4], [21, direction * 9 + 4], [32, direction * 9 + 4]]), K.fade(dot, 0.13), 0.7);
        g.fillStyle = '#0c2b20';
        g.strokeStyle = K.fade(dot, 0.65);
        g.lineWidth = 0.8;
        g.beginPath();
        g.arc(39, direction * 21, 2.8, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = light;
        g.fillRect(38.1, direction * 21 - 0.9, 1.8, 1.8);
      });
    }
    for (i = 0; i < 12; i += 1) {
      x = 27 + i % 6 * 86;
      y = i < 6 ? 78 : 225;
      var data = '';
      for (var b = 0; b < 5; b += 1) data += rand() > 0.5 ? '1' : '0';
      K.wrap(g, x, y, 28, function () {
        g.font = '600 8px "Courier New", monospace';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = K.fade(dot, 0.58);
        g.fillText(data, 0, 0);
        K.stroke(g, K.path([[-15, 7], [9, 7]]), K.fade(dot, 0.2), 0.65);
        g.fillStyle = K.fade(light, 0.8);
        g.fillRect(12, 6, 3, 1.5);
      });
    }
    K.glow(g, 256, 128, 74, 59, dot, 0.13);
    K.wrap(g, 256, 128, 146, function () {
      for (var side = -1; side <= 1; side += 2) {
        for (var pin = 0; pin < 5; pin += 1) {
          var yy = (pin - 2) * 10;
          var endY = yy * 1.65;
          var route = K.path([[side * 43, yy], [side * (56 + pin * 3), yy], [side * (69 + pin * 3), endY], [side * (96 + pin * 5), endY]]);
          K.stroke(g, route, K.fade(dot, 0.09), 4);
          K.stroke(g, route, K.fade(dot, 0.63), 1);
          g.fillStyle = K.fade(light, 0.9);
          g.fillRect(side * (96 + pin * 5) - 1.5, endY - 1.5, 3, 3);
        }
      }
      g.fillStyle = 'rgba(0,9,7,0.65)';
      g.fillRect(-45, -31, 92, 69);
      var chip = K.path([[-40, -32], [34, -32], [43, -23], [43, 28], [38, 33], [-38, 33], [-43, 28], [-43, -27]], true);
      g.fillStyle = K.gradient(g, -40, -32, 40, 33, ['#527e63', '#234b38', '#0b291d']);
      g.fill(chip);
      K.stroke(g, chip, '#71977a', 1);
      for (var p = -3; p <= 3; p += 1) {
        g.fillStyle = '#7aa78a';
        g.fillRect(-48, p * 7 - 1.4, 5, 2.8);
        g.fillRect(43, p * 7 - 1.4, 5, 2.8);
        g.fillRect(p * 9 - 1.4, -37, 2.8, 5);
        g.fillRect(p * 9 - 1.4, 33, 2.8, 5);
      }
      g.fillStyle = K.gradient(g, 0, -25, 0, 25, ['#133728', '#071b13']);
      g.fillRect(-35, -24, 70, 48);
      g.strokeStyle = K.fade(dot, 0.55);
      g.lineWidth = 0.7;
      g.strokeRect(-34.5, -23.5, 69, 47);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '700 23px "Courier New", monospace';
      g.fillStyle = '#ceffe0';
      g.fillText('1024', 0, 1);
      g.font = '600 6px "Courier New", monospace';
      g.fillStyle = K.fade(dot, 0.72);
      g.fillText('MULTIPLY / CORE', 0, -15);
      K.stroke(g, K.path([[-20, 17], [13, 17]]), K.fade(dot, 0.38), 0.8);
      g.fillStyle = '#bcffd4';
      g.fillRect(16, 16, 5, 2);
    });
    K.wrap(g, 34, 139, 34, function () {
      g.fillStyle = '#0c241a';
      g.fillRect(-25, -11, 50, 22);
      g.strokeStyle = K.fade(dot, 0.3);
      g.lineWidth = 0.7;
      g.strokeRect(-25, -11, 50, 22);
      g.font = '700 14px "Courier New", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = K.fade(light, 0.83);
      g.fillText('1024', 0, 1);
    });
  }

  window.MPPlanetPaintSpecial = {
    swirl: swirl,
    crystal: crystal,
    lava: lava,
    galaxy: galaxy,
    binary: binary
  };
})();
