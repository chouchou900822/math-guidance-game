(function () {
  'use strict';

  var TW = 512;
  var TH = 256;
  var TAU = Math.PI * 2;

  function rng(seed) {
    var a = seed == null ? 1 : seed;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rgb(color) {
    if (Array.isArray(color)) return color.slice(0, 3);
    var h = String(color);
    if (h.indexOf('rgb') === 0) return h.match(/[\d.]+/g).slice(0, 3).map(Number);
    h = h.replace('#', '');
    if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; });
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function tone(color, f) {
    return 'rgb(' + rgb(color).map(function (v) {
      return Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f));
    }).join(',') + ')';
  }

  function fade(color, a) {
    return 'rgba(' + rgb(color).join(',') + ',' + a + ')';
  }

  function mix(a, b, t) {
    a = rgb(a);
    b = rgb(b);
    return a.map(function (v, i) { return v + (b[i] - v) * t; });
  }

  function ramp(colors) {
    var stops = colors.map(rgb);
    var table = [];
    for (var i = 0; i <= 512; i += 1) {
      var t = i / 512 * (stops.length - 1);
      var j = Math.min(stops.length - 2, Math.floor(t));
      table.push(mix(stops[j], stops[j + 1], t - j));
    }
    return function (t) { return table[Math.max(0, Math.min(512, Math.round(t * 512)))]; };
  }

  function gradient(g, x0, y0, x1, y1, colors) {
    var fill = g.createLinearGradient(x0, y0, x1, y1);
    colors.forEach(function (color, i) { fill.addColorStop(i / (colors.length - 1), color); });
    return fill;
  }

  // 所有横向场均周期采样，局部图案的随机参数则必须在 wrap 回调外生成。
  function wrap(g, x, y, radius, draw) {
    x = ((x % TW) + TW) % TW;
    for (var dx = -TW; dx <= TW; dx += TW) {
      if (x + dx + radius < 0 || x + dx - radius > TW) continue;
      g.save();
      g.translate(x + dx, y);
      draw(g);
      g.restore();
    }
  }

  function noise(rand, cols, rows) {
    var grid = [];
    for (var i = 0; i < cols * (rows + 1); i += 1) grid.push(rand() * 2 - 1);
    return function (x, y) {
      var u = ((x / TW % 1) + 1) % 1 * cols;
      var v = Math.max(0, Math.min(rows - 0.00001, y / TH * rows));
      var ix = Math.floor(u);
      var iy = Math.floor(v);
      var fx = u - ix;
      var fy = v - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      var a = grid[iy * cols + ix];
      var b = grid[iy * cols + (ix + 1) % cols];
      var c = grid[(iy + 1) * cols + ix];
      var d = grid[(iy + 1) * cols + (ix + 1) % cols];
      return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
    };
  }

  function field(g, sample) {
    var image = g.createImageData(TW, TH);
    var data = image.data;
    for (var y = 0; y < TH; y += 1) {
      for (var x = 0; x < TW; x += 1) {
        var color = sample(x + 0.5, y + 0.5);
        var p = (y * TW + x) * 4;
        data[p] = color[0];
        data[p + 1] = color[1];
        data[p + 2] = color[2];
        data[p + 3] = 255;
      }
    }
    g.putImageData(image, 0, 0);
  }

  function path(points, closed) {
    var p = new Path2D();
    p.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i += 1) p.lineTo(points[i][0], points[i][1]);
    if (closed) p.closePath();
    return p;
  }

  function stroke(g, p, color, width) {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.stroke(p);
  }

  function blob(rand, cx, cy, r) {
    var pts = [];
    var count = 14;
    for (var i = 0; i < count; i += 1) {
      var a = i / count * TAU;
      var rr = r * (0.65 + rand() * 0.45);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.75]);
    }
    var p = new Path2D();
    p.moveTo((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
    for (i = 1; i <= count; i += 1) {
      var cur = pts[i % count];
      var next = pts[(i + 1) % count];
      p.quadraticCurveTo(cur[0], cur[1], (cur[0] + next[0]) / 2, (cur[1] + next[1]) / 2);
    }
    p.closePath();
    return p;
  }

  function wave(y, amplitude, phase, frequency) {
    var p = new Path2D();
    for (var x = -4; x <= TW + 4; x += 2) {
      var a = x / TW * TAU;
      var yy = y + Math.sin(a * frequency + phase) * amplitude + Math.sin(a * (frequency + 2) - phase) * amplitude * 0.24;
      if (x === -4) p.moveTo(x, yy);
      else p.lineTo(x, yy);
    }
    return p;
  }

  function glow(g, x, y, rx, ry, color, alpha) {
    wrap(g, x, y, rx, function () {
      g.scale(1, ry / rx);
      var fill = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      fill.addColorStop(0, fade(color, alpha));
      fill.addColorStop(0.45, fade(color, alpha * 0.45));
      fill.addColorStop(1, fade(color, 0));
      g.fillStyle = fill;
      g.beginPath();
      g.arc(0, 0, rx, 0, TAU);
      g.fill();
    });
  }

  function dot(g, x, y, r, color) {
    wrap(g, x, y, r + 1, function () {
      g.fillStyle = color;
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.fill();
    });
  }

  function spark(g, x, y, r, color) {
    glow(g, x, y, r * 2, r * 2, color, 0.18);
    wrap(g, x, y, r, function () {
      g.fillStyle = color;
      g.fill(path([[0, -r], [r * 0.18, -r * 0.18], [r * 0.7, 0], [r * 0.18, r * 0.18], [0, r], [-r * 0.18, r * 0.18], [-r * 0.7, 0], [-r * 0.18, -r * 0.18]], true));
    });
  }

  function leaf(g, x, y, length, angle, color) {
    wrap(g, x, y, length + 2, function () {
      g.rotate(angle);
      var p = new Path2D();
      p.moveTo(-length * 0.5, 0);
      p.bezierCurveTo(-length * 0.1, -length * 0.6, length * 0.42, -length * 0.22, length * 0.5, 0);
      p.bezierCurveTo(length * 0.13, length * 0.28, -length * 0.3, length * 0.4, -length * 0.5, 0);
      g.fillStyle = gradient(g, 0, -length * 0.3, 0, length * 0.3, [tone(color, 0.25), color, tone(color, -0.2)]);
      g.fill(p);
      stroke(g, path([[-length * 0.45, 0], [length * 0.4, -length * 0.02]]), fade('#efffc9', 0.65), 0.65);
      for (var i = -1; i <= 1; i += 1) {
        var xx = i * length * 0.18;
        stroke(g, path([[xx - length * 0.08, 0], [xx + length * 0.1, -length * 0.19]]), fade('#efffc9', 0.3), 0.5);
      }
    });
  }

  function prism(g, x, y, w, h, angle, colors) {
    wrap(g, x, y, h + w, function () {
      g.rotate(angle);
      var tip = [0, -h];
      var left = [-w * 0.5, -h * 0.68];
      var right = [w * 0.5, -h * 0.72];
      var bottom = [w * 0.3, 0];
      var foot = [-w * 0.4, 0];
      var ridge = [w * 0.04, -h * 0.6];
      var faces = [[tip, left, ridge], [tip, ridge, right], [left, foot, [0, 0], ridge], [ridge, [0, 0], bottom, right]];
      faces.forEach(function (face, i) {
        g.fillStyle = gradient(g, -w / 2, -h, w / 2, 0, [tone(colors[i % colors.length], 0.28), colors[i % colors.length], tone(colors[i % colors.length], -0.17)]);
        g.fill(path(face, true));
      });
      stroke(g, path([foot, left, tip, right, bottom, foot]), fade(colors[0], 0.55), 0.7);
      stroke(g, path([tip, ridge, [0, -h * 0.12]]), 'rgba(255,255,255,0.65)', 0.8);
    });
  }

  function lattice(rand, cols, rows) {
    var points = [];
    for (var r = 0; r <= rows; r += 1) {
      var row = [];
      for (var c = 0; c < cols; c += 1) {
        row.push([(c + (r % 2) * 0.45 + (rand() - 0.5) * 0.6) * TW / cols,
          r === 0 ? -12 : r === rows ? TH + 12 : (r + (rand() - 0.5) * 0.66) * TH / rows]);
      }
      points.push(row);
    }
    return function (r, c) {
      var index = ((c % cols) + cols) % cols;
      var p = points[r][index];
      return [p[0] + Math.floor(c / cols) * TW, p[1]];
    };
  }

  function caps(g, color) {
    var north = wave(13, 4, 0.6, 3);
    north.lineTo(TW + 4, 0);
    north.lineTo(-4, 0);
    north.closePath();
    var south = wave(TH - 13, 4, 2.1, 3);
    south.lineTo(TW + 4, TH);
    south.lineTo(-4, TH);
    south.closePath();
    g.fillStyle = color;
    g.fill(north);
    g.fill(south);
  }

  window.MPPlanetPaintKit = {
    TW: TW, TH: TH, TAU: TAU,
    rng: rng, rgb: rgb, tone: tone, fade: fade, mix: mix,
    ramp: ramp, gradient: gradient, wrap: wrap, noise: noise, field: field,
    path: path, stroke: stroke, blob: blob, wave: wave,
    glow: glow, dot: dot, spark: spark, leaf: leaf, prism: prism,
    lattice: lattice, caps: caps
  };
})();
