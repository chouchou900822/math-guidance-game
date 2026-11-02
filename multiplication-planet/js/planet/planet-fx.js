/* 乘法星球 — 皮肤彩蛋粒子层 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var fade = window.MPPlanetLut.fade;
  var hosts = [];
  var observer = null;
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var colors = {
    ocean: ['#49dce5', '#8bb8ff'], peach: ['#ff9dbc', '#ffe0b7'],
    mint: ['#80db9e', '#efff9e'], gold: ['#ffd16d', '#fff0bd'],
    candy: ['#ff99d1', '#8edee9'], violet: ['#bd9bff', '#92ecff'],
    lava: ['#ffac62', '#ffe299'], galaxy: ['#b7b7ff', '#99e5ff'],
    saturn: ['#f8d99a', '#a9e5ee'], binary: ['#76efba', '#b6ffec']
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mix(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, t) {
    var u = clamp((t - a) / (b - a), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function envelope(u) { return smooth(0, 0.14, u) * (1 - smooth(0.72, 1, u)); }
  function hex(value, fallback) { return /^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(value) ? value : fallback; }

  function path(ctx, pts, close) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
  }

  function glow(ctx, x, y, r, color, opacity) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, fade(color, opacity));
    g.addColorStop(0.3, fade(color, opacity * 0.5));
    g.addColorStop(1, fade(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function star(ctx, x, y, r, color, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.16, -r * 0.16, r * 0.65, 0);
    ctx.quadraticCurveTo(r * 0.16, r * 0.16, 0, r);
    ctx.quadraticCurveTo(-r * 0.16, r * 0.16, -r * 0.65, 0);
    ctx.quadraticCurveTo(-r * 0.16, -r * 0.16, 0, -r);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function outside(ctx) {
    ctx.beginPath();
    ctx.rect(0, 0, 1000, 1000);
    ctx.moveTo(800, 500);
    ctx.arc(500, 500, 300, 0, TAU, true);
    ctx.clip('evenodd');
  }

  function surface(ctx) {
    ctx.beginPath();
    ctx.arc(500, 500, 300, 0, TAU);
    ctx.clip();
  }

  function pulse(ctx, st) {
    var u = st.reduced ? 0.34 : st.clock / 0.7;
    if (u >= 1) return;
    var x = st.x * 1000;
    var y = st.y * 1000;
    var r = 12 + 75 * smooth(0, 1, u);
    ctx.save();
    ctx.globalAlpha *= 1 - u;
    glow(ctx, x, y, r * 1.3, st.color, 0.24);
    ctx.beginPath();
    ctx.arc(x, y, r, -0.3, Math.PI * 1.6);
    ctx.strokeStyle = fade(st.accent, 0.85);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    star(ctx, x, y, 8 * (1 - u), '#fff9df', 0.3);
    ctx.restore();
  }

  function whale(ctx, x, y, scale, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    var g = ctx.createLinearGradient(-45, -30, 30, 22);
    g.addColorStop(0, '#c5fff4');
    g.addColorStop(0.4, color);
    g.addColorStop(1, '#5489bd');
    ctx.beginPath();
    ctx.moveTo(-7, 24);
    ctx.bezierCurveTo(-9, 4, -45, 10, -52, -26);
    ctx.bezierCurveTo(-30, -14, -15, -31, 0, -8);
    ctx.bezierCurveTo(15, -31, 30, -14, 52, -26);
    ctx.bezierCurveTo(45, 10, 9, 4, 7, 24);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(223,255,255,.8)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 17);
    ctx.quadraticCurveTo(-1, 0, -32, -15);
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(7, -2, 32, -15);
    ctx.strokeStyle = 'rgba(229,255,255,.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function ocean(ctx, st, t) {
    var curtains = st.charged ? 3 : 2;
    for (var band = 0; band < curtains; band += 1) {
      ctx.save();
      outside(ctx);
      var g = ctx.createLinearGradient(0, 100, 0, 415);
      g.addColorStop(0, fade(st.accent, 0));
      g.addColorStop(0.4, fade(st.color, 0.26));
      g.addColorStop(0.78, fade('#98ffe5', 0.24));
      g.addColorStop(1, fade(st.color, 0));
      var tops = [];
      var bottoms = [];
      for (var j = 0; j <= 38; j += 1) {
        var x = 125 + j * 750 / 38;
        var wave = Math.sin(j * 0.22 + st.clock * 1.25 + band) * 25;
        var y = 182 + band * 31 + wave + Math.pow((x - 500) / 390, 2) * 90;
        var height = 108 * Math.pow(Math.sin(j / 38 * Math.PI), 0.7);
        tops.push([x, y]);
        bottoms.unshift([x + Math.sin(st.clock + j * 0.2) * height * 0.16, y + height]);
      }
      path(ctx, tops.concat(bottoms), true);
      ctx.fillStyle = g;
      ctx.fill();
      path(ctx, tops, false);
      ctx.strokeStyle = fade(band % 2 ? st.accent : '#baffec', 0.64);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      for (j = 1; j < tops.length; j += 2) {
        var p = tops[j];
        height = 98 * Math.pow(Math.sin(j / 38 * Math.PI), 0.7);
        var thread = ctx.createLinearGradient(p[0], p[1], p[0], p[1] + height);
        thread.addColorStop(0, fade(st.color, 0.6));
        thread.addColorStop(1, fade(st.accent, 0));
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.quadraticCurveTo(p[0] - height * 0.1, p[1] + height * 0.4, p[0] + height * 0.12, p[1] + height);
        ctx.strokeStyle = thread;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }
    var count = st.charged ? 2 : 1;
    for (var i = 0; i < count; i += 1) {
      var u = (t - (i ? 0.45 : 0.08)) / (i ? 0.48 : 0.7);
      if (u <= 0 || u >= 1) continue;
      var bx = i ? 325 : 657;
      var by = i ? 328 : 318;
      ctx.save();
      ctx.globalAlpha *= envelope(u);
      ctx.beginPath();
      ctx.ellipse(bx, by, 24 + u * 58, 7 + u * 10, -0.12, 0, TAU);
      ctx.strokeStyle = fade(st.color, 0.58 * (1 - u));
      ctx.lineWidth = 1.8;
      ctx.stroke();
      whale(ctx, bx + Math.sin(u * Math.PI) * 14, by - Math.sin(u * Math.PI) * 95, i ? 0.55 : 0.85, Math.sin(u * Math.PI) * 0.2 - 0.12, st.color);
      for (j = 0; j < 5; j += 1) {
        var a = -Math.PI + j * Math.PI / 4;
        star(ctx, bx + Math.cos(a) * u * 90, by + Math.sin(a) * u * 80 + u * u * 45, 4 * (1 - u), '#cafff7', a);
      }
      ctx.restore();
    }
  }

  function petal(ctx, x, y, r, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    var g = ctx.createLinearGradient(-r, 0, r, r);
    g.addColorStop(0, '#fff0ee');
    g.addColorStop(1, color);
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.bezierCurveTo(-r * 1.1, -r * 0.1, -r * 0.8, -r, 0, -r * 0.45);
    ctx.bezierCurveTo(r * 0.8, -r, r * 1.1, -r * 0.1, 0, r);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, r * 0.65);
    ctx.lineTo(0, -r * 0.2);
    ctx.strokeStyle = 'rgba(255,255,255,.65)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function peach(ctx, st, t) {
    var count = st.charged ? 22 : 14;
    for (var i = 0; i < count; i += 1) {
      var p = st.seeds[i];
      var late = i >= 14;
      var u = (t - (late ? 0.4 + p.a * 0.1 : p.a * 0.3)) / (late ? 0.52 : 0.72);
      if (u <= 0 || u >= 1) continue;
      var x = 200 + p.b * 600 + Math.sin(u * 4 + p.c * TAU) * 30;
      var y = 770 - u * (490 + p.c * 150);
      var r = (13 + p.d * 31) * (0.65 + smooth(0, 0.3, u) * 0.35);
      ctx.save();
      ctx.globalAlpha *= envelope(u);
      var g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.4, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,.04)');
      g.addColorStop(0.72, fade(st.color, 0.04));
      g.addColorStop(1, fade(i % 2 ? st.accent : st.color, 0.24));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = fade(st.color, 0.7);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.81, 3.6, 4.65);
      ctx.strokeStyle = 'rgba(255,255,255,.9)';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.9, 0.35, 1.15);
      ctx.strokeStyle = fade(st.accent, 0.8);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    for (i = 0; i < (st.charged ? 7 : 4); i += 1) {
      p = st.seeds[i + 24];
      u = (t - i * 0.035) / 0.88;
      ctx.save();
      ctx.globalAlpha *= envelope(u);
      petal(ctx, 220 + p.a * 560 + Math.sin(u * 4 + i) * 70, 190 + u * 500, 12 + p.c * 9, u * 2 + i, st.color);
      ctx.restore();
    }
  }

  function leaf(ctx, x, y, size, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    var g = ctx.createLinearGradient(0, 0, size, -size);
    g.addColorStop(0, color);
    g.addColorStop(1, '#e2ffd3');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.12, -size * 0.72, size * 0.65, -size * 0.94, size, -size);
    ctx.bezierCurveTo(size * 0.98, -size * 0.18, size * 0.48, size * 0.06, 0, 0);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.5, -size * 0.32, size * 0.85, -size * 0.83);
    ctx.strokeStyle = 'rgba(249,255,220,.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function mint(ctx, st, t) {
    var count = st.charged ? 5 : 3;
    for (var i = 0; i < count; i += 1) {
      var a = -2.8 + i * 2.9 / Math.max(1, count - 1);
      var delay = i >= 3 ? 0.38 + (i - 3) * 0.12 : i * 0.055;
      var grow = smooth(delay, delay + 0.32, t);
      var height = (51 + (i % 2) * 14) * grow;
      ctx.save();
      ctx.translate(500 + Math.cos(a) * 288, 500 + Math.sin(a) * 288);
      ctx.rotate(a + Math.PI / 2 + Math.sin(st.clock * 1.8 + i) * 0.065);
      glow(ctx, 0, -height * 0.5, 60, st.color, 0.11);
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.quadraticCurveTo(-7, -height * 0.45, 0, -height);
      ctx.strokeStyle = fade(st.color, 0.9);
      ctx.lineWidth = 2.8;
      ctx.stroke();
      leaf(ctx, -2, -height * 0.4, 28 * grow, -1.35, st.color);
      leaf(ctx, -1, -height * 0.72, 24 * grow, 0.1, st.color);
      leaf(ctx, 0, -height, 15 * grow, -0.45, st.color);
      ctx.restore();
    }
    count = st.charged ? 16 : 10;
    for (i = 0; i < count; i += 1) {
      var p = st.seeds[i];
      var u = (t - p.a * 0.22) / 0.78;
      if (u <= 0 || u >= 1) continue;
      a = u * 7 + p.b * TAU;
      var x = 500 + Math.cos(a) * (290 + p.c * 45);
      var y = 790 - u * 610 + Math.sin(a) * 24;
      ctx.save();
      ctx.globalAlpha *= envelope(u);
      if (Math.sin(a) < 0) outside(ctx);
      ctx.beginPath();
      for (var j = 0; j < 7; j += 1) {
        var v = u - (6 - j) * 0.008;
        var aa = v * 7 + p.b * TAU;
        var xx = 500 + Math.cos(aa) * (290 + p.c * 45);
        var yy = 790 - v * 610 + Math.sin(aa) * 24;
        if (!j) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.strokeStyle = fade(st.color, 0.36);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      glow(ctx, x, y, 23, st.accent, 0.55);
      ctx.fillStyle = 'rgba(225,255,225,.5)';
      ctx.beginPath();
      ctx.ellipse(x - 4, y - 3, 5, 2, -0.7, 0, TAU);
      ctx.ellipse(x + 4, y - 3, 5, 2, 0.7, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x, y, 2.8, 4, 0, 0, TAU);
      ctx.fillStyle = '#f1ffbf';
      ctx.fill();
      ctx.restore();
    }
  }

  function crystal(ctx, x, y, r, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    var points = [[0, -r], [r * 0.62, -r * 0.28], [r * 0.42, r * 0.58], [0, r], [-r * 0.52, r * 0.25], [-r * 0.55, -r * 0.38]];
    path(ctx, points, true);
    var g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, '#f0fcff');
    g.addColorStop(0.45, color);
    g.addColorStop(1, fade(color, 0.42));
    ctx.fillStyle = g;
    ctx.fill();
    path(ctx, [points[0], [0, -r * 0.12], points[3], points[4], points[5]], true);
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.fill();
    path(ctx, [points[1], [0, -r * 0.12], points[2]], true);
    ctx.fillStyle = 'rgba(70,70,153,.2)';
    ctx.fill();
    path(ctx, [points[0], [0, -r * 0.12], points[3]], false);
    ctx.strokeStyle = 'rgba(255,255,255,.82)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    path(ctx, [points[5], [0, -r * 0.12], points[1]], false);
    ctx.stroke();
    path(ctx, points, true);
    ctx.strokeStyle = fade('#efffff', 0.7);
    ctx.stroke();
    ctx.restore();
  }

  function gold(ctx, st, t) {
    var count = st.charged ? 11 : 7;
    for (var i = 0; i < count; i += 1) {
      var p = st.seeds[i];
      var late = i >= 7;
      var u = (t - (late ? 0.43 + p.a * 0.08 : p.a * 0.2)) / (late ? 0.48 : 0.78);
      if (u <= 0 || u >= 1) continue;
      var x = 500 + (p.b - 0.5) * (210 + u * 490);
      var y = 638 - Math.sin(u * Math.PI) * (300 + p.c * 110) - u * 75;
      var r = 17 + p.d * 10;
      ctx.save();
      ctx.globalAlpha *= envelope(u);
      glow(ctx, x, y, r * 2.2, st.color, 0.18);
      if (i % 3 === 0) {
        crystal(ctx, x, y, r * 1.12, u * 1.5 + i, st.accent);
      } else {
        ctx.translate(x, y);
        ctx.rotate(u * 1.3 + i);
        ctx.scale(0.35 + Math.abs(Math.cos(u * 5 + i)) * 0.65, 1);
        var pts = [];
        for (var j = 0; j < 8; j += 1) pts.push([Math.cos(j * TAU / 8) * r, Math.sin(j * TAU / 8) * r]);
        path(ctx, pts, true);
        var g = ctx.createLinearGradient(-r, -r, r, r);
        g.addColorStop(0, '#fff5ce');
        g.addColorStop(0.4, st.color);
        g.addColorStop(1, '#c9903a');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#ffedaf';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.scale(0.73, 0.73);
        path(ctx, pts, true);
        ctx.strokeStyle = 'rgba(158,106,32,.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        star(ctx, 0, 0, r * 0.56, '#fff7d2', 0);
      }
      ctx.restore();
    }
    for (i = 0; i < (st.charged ? 15 : 9); i += 1) {
      p = st.seeds[i + 15];
      var a = p.a * TAU + t * 0.3;
      var radius = 320 + p.b * 100;
      x = 500 + Math.cos(a) * radius;
      y = 500 + Math.sin(a) * radius * 0.84;
      ctx.save();
      ctx.globalAlpha *= envelope((t - p.c * 0.24) / 0.76);
      glow(ctx, x, y, 26, st.color, 0.24);
      star(ctx, x, y, 6 + p.d * 8, '#fff1c4', a + t);
      ctx.restore();
    }
  }

  function helix(u, clock, branch) {
    var a = u * TAU * 1.65 + clock * 1.25 + branch * Math.PI;
    var radius = 335 * Math.sqrt(1 - Math.pow((u - 0.5) * 1.4, 2));
    return { x: 500 + Math.cos(a) * radius, y: 235 + u * 530, z: Math.sin(a), a: a };
  }

  function wrappedCandy(ctx, x, y, r, angle, color, accent) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    path(ctx, [[-r * 0.8, 0], [-r * 1.7, -r * 0.7], [-r * 1.55, r * 0.75]], true);
    ctx.fillStyle = fade(accent, 0.72);
    ctx.fill();
    path(ctx, [[r * 0.8, 0], [r * 1.7, -r * 0.7], [r * 1.55, r * 0.75]], true);
    ctx.fill();
    var g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, '#fff5fb');
    g.addColorStop(0.42, color);
    g.addColorStop(1, accent);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.68, 0, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    path(ctx, [[-r * 0.4, -r * 0.4], [r * 0.4, -r * 0.4]], false);
    ctx.stroke();
    ctx.restore();
  }

  function candy(ctx, st, t) {
    var shades = [st.color, st.accent, '#ffe6a0', '#bca8ff'];
    for (var pass = 0; pass < 2; pass += 1) {
      ctx.save();
      if (!pass) { outside(ctx); ctx.globalAlpha *= 0.55; }
      for (var branch = 0; branch < 2; branch += 1) {
        for (var i = 1; i <= 48; i += 1) {
          var p = helix(i / 48, st.clock, branch);
          if ((p.z >= 0) !== !!pass) continue;
          var prev = helix((i - 1) / 48, st.clock, branch);
          path(ctx, [[prev.x, prev.y], [p.x, p.y]], false);
          ctx.strokeStyle = fade(shades[branch], 0.38);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        var count = st.charged ? 15 : 10;
        for (i = 0; i < count; i += 1) {
          var u = (i + 0.5) / count;
          p = helix(u, st.clock, branch);
          if ((p.z >= 0) !== !!pass) continue;
          var delay = st.charged && i % 3 === 0 ? 0.4 + u * 0.13 : 0.02 + u * 0.13;
          var pop = smooth(delay, delay + 0.2, t);
          wrappedCandy(ctx, p.x, p.y, (i % 3 ? 10 : 14) * pop, Math.sin(p.a) * 0.55 + branch, shades[(i + branch) % 4], shades[(i + branch + 1) % 4]);
        }
      }
      ctx.restore();
    }
  }

  function violet(ctx, st, t) {
    var rainbow = ['#ffa4cf', '#ffdca4', '#c6f8b0', '#8de6ff', '#a9b2ff', '#dba6ff', '#ffc4ed'];
    var count = st.charged ? 7 : 5;
    var opening = smooth(0, 0.32, t);
    for (var i = 0; i < count; i += 1) {
      var angle = -2.95 + i * 2.75 / (count - 1) + Math.sin(st.clock * 0.8) * 0.08;
      var x = 500 + Math.cos(angle) * 380 * opening;
      var y = 292 + Math.sin(angle) * 230 * opening;
      var g = ctx.createLinearGradient(500, 292, x, y);
      g.addColorStop(0, fade(rainbow[i], 0.34));
      g.addColorStop(0.65, fade(rainbow[i], 0.14));
      g.addColorStop(1, fade(rainbow[i], 0));
      path(ctx, [[493, 295], [x - 20, y], [x + 20, y - 8], [507, 285]], true);
      ctx.fillStyle = g;
      ctx.fill();
      path(ctx, [[500, 291], [x, y]], false);
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    glow(ctx, 500, 276, 88, st.color, 0.18);
    crystal(ctx, 500, 276 + Math.sin(st.clock * 1.8) * 9, 48 * opening, Math.sin(st.clock * 0.9) * 0.22, st.color);
    for (i = 0; i < (st.charged ? 4 : 2); i += 1) {
      var a = i * TAU / (st.charged ? 4 : 2) + 0.2 + st.clock * 0.22;
      x = 500 + Math.cos(a) * 346;
      y = 500 + Math.sin(a) * 268;
      var reveal = i >= 2 ? smooth(0.32 + (i - 2) * 0.14, 0.55 + (i - 2) * 0.14, t) : opening;
      crystal(ctx, x, y, (25 + (i % 2) * 5) * reveal, st.clock * 0.55 + i, i % 2 ? st.color : st.accent);
      star(ctx, x - 14, y - 28, 7 * reveal, '#f6edff', t);
    }
  }

  function ember(u, seed) {
    return { x: 500 + (seed.b - 0.5) * 430 * u, y: 254 - (400 + seed.c * 210) * u + 610 * u * u };
  }

  function lava(ctx, st, t) {
    ctx.save();
    surface(ctx);
    glow(ctx, 500, 258, 172, st.color, 0.32);
    glow(ctx, 500, 322, 95, st.accent, 0.14);
    for (var ring = 0; ring < 3; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(500, 271 + ring * 18, 55 + ring * 35 + t * 12, 10 + ring * 9, 0, 0, TAU);
      ctx.strokeStyle = fade(st.color, 0.2 - ring * 0.035);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(500, 254, 34, 8, 0, 0, TAU);
    ctx.fillStyle = fade(st.color, 0.3);
    ctx.fill();
    ctx.strokeStyle = fade(st.accent, 0.7);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    var count = st.charged ? 30 : 20;
    for (var i = 0; i < count; i += 1) {
      var p = st.seeds[i];
      var delay = (i % (st.charged ? 3 : 2)) * 0.16 + p.a * 0.13;
      var u = (t - delay) / 0.52;
      if (u <= 0 || u >= 1) continue;
      var tip = ember(u, p);
      if (tip.y > 280) continue;
      ctx.save();
      ctx.globalAlpha *= envelope(u);
      for (var j = 1; j <= 5; j += 1) {
        var from = ember(Math.max(0, u - j * 0.018), p);
        var to = ember(Math.max(0, u - (j - 1) * 0.018), p);
        path(ctx, [[from.x, from.y], [to.x, to.y]], false);
        ctx.strokeStyle = fade(j > 2 ? st.color : st.accent, (1 - j / 6) * 0.72);
        ctx.lineWidth = 1.5 + p.d;
        ctx.stroke();
      }
      glow(ctx, tip.x, tip.y, 14 + p.d * 7, st.color, 0.32);
      star(ctx, tip.x, tip.y, 3 + p.d * 3.5, st.accent, u + i);
      ctx.restore();
    }
  }

  function comet(ctx, x, y, angle, color, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    var g = ctx.createLinearGradient(-150 * size, 0, 0, 0);
    g.addColorStop(0, fade(color, 0));
    g.addColorStop(0.75, fade(color, 0.28));
    g.addColorStop(1, fade('#f3fcff', 0.9));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-40 * size, -15 * size, -155 * size, -21 * size);
    ctx.quadraticCurveTo(-75 * size, 12 * size, 0, 0);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-145 * size, -15 * size);
    ctx.quadraticCurveTo(-60 * size, -5 * size, 0, 0);
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    glow(ctx, 0, 0, 22 * size, color, 0.36);
    star(ctx, 0, 0, 7 * size, '#f4ffff', 0.2);
    ctx.restore();
  }

  function galaxy(ctx, st, t) {
    var shapes = [
      [[166, 365], [208, 239], [321, 176], [399, 225], [344, 310]],
      [[668, 194], [792, 243], [827, 367], [750, 432]],
      [[233, 730], [339, 794], [477, 822], [600, 773]]
    ];
    for (var i = 0; i < (st.charged ? 3 : 2); i += 1) {
      var pts = shapes[i];
      for (var j = 0; j < pts.length; j += 1) {
        var reveal = smooth(0.03 + j * 0.07 + i * 0.04, 0.19 + j * 0.07 + i * 0.04, t);
        var p = pts[j];
        if (j) {
          var last = pts[j - 1];
          path(ctx, [last, [mix(last[0], p[0], reveal), mix(last[1], p[1], reveal)]], false);
          ctx.strokeStyle = fade(st.color, 0.68 * reveal);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.save();
        ctx.globalAlpha *= reveal * (0.86 + 0.14 * Math.sin(st.clock * 1.6 + j));
        glow(ctx, p[0], p[1], 24, st.color, 0.3);
        star(ctx, p[0], p[1], j % 2 ? 6 : 9, st.color, 0.1);
        star(ctx, p[0], p[1], j % 2 ? 2 : 3, '#eff4ff', 0.1);
        ctx.restore();
      }
    }
    for (i = 0; i < (st.charged ? 2 : 1); i += 1) {
      var u = (t - (i ? 0.52 : 0.13)) / (i ? 0.43 : 0.7);
      if (u <= 0 || u >= 1) continue;
      ctx.save();
      ctx.globalAlpha *= envelope(u);
      comet(ctx, mix(120, 907, u), 170 + u * u * 255 + i * 70, Math.atan2(u * 510, 787), i ? st.color : st.accent, i ? 0.75 : 1);
      ctx.restore();
    }
  }

  function orbit(a, radius, ratio) {
    var x = Math.cos(a) * radius;
    var y = Math.sin(a) * radius * ratio;
    return { x: 500 + x * 0.9664 + y * 0.2571, y: 500 - x * 0.2571 + y * 0.9664, z: Math.sin(a) };
  }

  function ship(ctx, x, y, angle, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size, size);
    var flame = ctx.createLinearGradient(-54, 0, -17, 0);
    flame.addColorStop(0, fade(color, 0));
    flame.addColorStop(1, fade(color, 0.7));
    path(ctx, [[-17, -5], [-58, 0], [-17, 5]], true);
    ctx.fillStyle = flame;
    ctx.fill();
    path(ctx, [[-13, -6], [-25, -19], [-3, -13], [11, 0], [-3, 13], [-25, 19], [-13, 6]], true);
    ctx.fillStyle = '#a1c6dd';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 11, 0, 0, TAU);
    var g = ctx.createLinearGradient(0, -11, 0, 11);
    g.addColorStop(0, '#f7fcff');
    g.addColorStop(0.6, '#dce7ef');
    g.addColorStop(1, '#90aeca');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,250,255,.85)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(8, -2, 7, 6, -0.2, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -4, 2, 0, TAU);
    ctx.fillStyle = '#f5ffff';
    ctx.fill();
    path(ctx, [[-13, 2], [-6, 2]], false);
    ctx.strokeStyle = '#90adc4';
    ctx.stroke();
    ctx.restore();
  }

  function saturn(ctx, st, t) {
    var count = st.charged ? 5 : 3;
    for (var i = 0; i < count; i += 1) {
      var a = st.clock * 1.6 + i * TAU / count;
      var radius = 370 + (i % 3) * 32;
      for (var j = 7; j >= 0; j -= 1) {
        var p = orbit(a - j * 0.04, radius, 0.32);
        var next = orbit(a - (j + 1) * 0.04, radius, 0.32);
        ctx.save();
        if (p.z < 0) outside(ctx);
        path(ctx, [[next.x, next.y], [p.x, p.y]], false);
        ctx.strokeStyle = fade(st.color, (1 - j / 8) * 0.72);
        ctx.lineWidth = 2.2;
        ctx.stroke();
        if (!j) {
          glow(ctx, p.x, p.y, 22, st.color, 0.3);
          star(ctx, p.x, p.y, 7, '#fff5dc', a);
        }
        ctx.restore();
      }
    }
    for (i = 0; i < (st.charged ? 2 : 1); i += 1) {
      a = 0.28 + st.clock * 1.15 + i * Math.PI;
      p = orbit(a, 447, 0.32);
      next = orbit(a + 0.01, 447, 0.32);
      ctx.save();
      if (p.z < 0) outside(ctx);
      ctx.globalAlpha *= smooth(i * 0.2, 0.2 + i * 0.2, t);
      ship(ctx, p.x, p.y, Math.atan2(next.y - p.y, next.x - p.x), i ? 0.62 : 0.82, st.accent);
      ctx.restore();
    }
  }

  function binary(ctx, st, t) {
    var count = st.charged ? 10 : 6;
    ctx.save();
    surface(ctx);
    for (var i = 0; i < count; i += 1) {
      var p = st.seeds[i];
      var x = 262 + i * 476 / (count - 1);
      var y = 330 + p.b * 170;
      var pts = [[x, 265], [x, y], [x + (i % 2 ? -34 : 34), y + 34], [x + (i % 2 ? -34 : 34), 700]];
      path(ctx, pts, false);
      ctx.strokeStyle = fade(st.color, 0.23);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      var scan = (t * (st.charged ? 2 : 1.35) + p.a * 0.3) % 1;
      var segment = scan * 3;
      var index = Math.min(2, Math.floor(segment));
      var f = segment - index;
      var px = mix(pts[index][0], pts[index + 1][0], f);
      var py = mix(pts[index][1], pts[index + 1][1], f);
      glow(ctx, px, py, 18, st.color, 0.26);
      ctx.strokeStyle = fade(st.accent, 0.8);
      ctx.lineWidth = 1.8;
      ctx.strokeRect(px - 3, py - 3, 6, 6);
    }
    var scanY = 250 + smooth(0.03, 0.76, t) * 510;
    var g = ctx.createLinearGradient(0, scanY - 48, 0, scanY + 2);
    g.addColorStop(0, fade(st.color, 0));
    g.addColorStop(1, fade(st.color, 0.16));
    ctx.fillStyle = g;
    ctx.fillRect(200, scanY - 48, 600, 50);
    path(ctx, [[200, scanY], [800, scanY]], false);
    ctx.strokeStyle = fade(st.accent, 0.55);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    var gather = smooth(0.22, 0.7, t);
    ctx.save();
    ctx.globalAlpha *= smooth(0.03, 0.17, t);
    ctx.font = '600 14px ui-monospace, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (i = 0; i < st.digits.length; i += 1) {
      var target = st.digits[i];
      p = st.seeds[i];
      var a = p.a * TAU + st.clock * 0.2 * (1 - gather);
      var sx = 500 + Math.cos(a) * (310 + p.b * 75);
      var sy = 500 + Math.sin(a) * (270 + p.c * 80);
      px = mix(sx, target[0], gather) + Math.sin(gather * Math.PI) * (p.d - 0.5) * 90;
      py = mix(sy, target[1], gather);
      ctx.fillStyle = i % 3 ? st.accent : '#ecfff4';
      ctx.fillText(i % 2 ? '1' : '0', px, py);
    }
    ctx.globalAlpha *= smooth(0.59, 0.75, t);
    var corners = [[351, 417, 1, 1], [649, 417, -1, 1], [351, 537, 1, -1], [649, 537, -1, -1]];
    for (i = 0; i < corners.length; i += 1) {
      p = corners[i];
      path(ctx, [[p[0], p[1] + p[3] * 18], [p[0], p[1]], [p[0] + p[2] * 18, p[1]]], false);
      ctx.strokeStyle = fade(st.color, 0.8);
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.restore();
  }

  var painters = { ocean: ocean, peach: peach, mint: mint, gold: gold, candy: candy, violet: violet, lava: lava, galaxy: galaxy, saturn: saturn, binary: binary };

  function layer(host) {
    var cv = host.querySelector('.hero-fx');
    if (!cv) {
      cv = document.createElement('canvas');
      cv.className = 'hero-fx';
      cv.setAttribute('aria-hidden', 'true');
      host.appendChild(cv);
    }
    var rect = cv.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = rect.width || host.clientWidth || 420;
    var height = rect.height || width;
    var scale = Math.min(dpr, 960 / Math.max(width, height));
    cv.width = Math.max(1, Math.round(width * scale));
    cv.height = Math.max(1, Math.round(height * scale));
    return cv;
  }

  function build(host, spec, opts) {
    var id = Object.prototype.hasOwnProperty.call(painters, spec.id) ? spec.id : 'ocean';
    var cv = layer(host);
    var bounds = host.getBoundingClientRect();
    var rect = cv.getBoundingClientRect();
    var nx = typeof opts.x === 'number' && isFinite(opts.x) ? clamp(opts.x, 0, 1) : 0.5;
    var ny = typeof opts.y === 'number' && isFinite(opts.y) ? clamp(opts.y, 0, 1) : 0.5;
    var st = {
      host: host, canvas: cv, ctx: cv.getContext('2d'), id: id,
      color: hex(spec.color, colors[id][0]), accent: hex(spec.accent, colors[id][1]),
      charged: opts.charged === true, reduced: !!(motion && motion.matches),
      x: rect.width ? clamp((bounds.left + nx * bounds.width - rect.left) / rect.width, 0, 1) : nx,
      y: rect.height ? clamp((bounds.top + ny * bounds.height - rect.top) / rect.height, 0, 1) : ny,
      dur: opts.charged === true ? 3.3 : 2.35,
      clock: 0, raf: 0, timer: 0, done: false, seeds: [], digits: []
    };
    var seed = 173;
    for (var i = 0; i < id.length; i += 1) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    for (i = 0; i < 48; i += 1) st.seeds.push({ a: random(), b: random(), c: random(), d: random() });
    if (id === 'binary') {
      var digits = ['010110010010111', '111101101101111', '111001111100111', '101101111001001'];
      for (var d = 0; d < 4; d += 1) {
        for (i = 0; i < 15; i += 1) {
          if (digits[d].charAt(i) === '1') st.digits.push([374 + (d * 4 + i % 3) * 18, 441 + Math.floor(i / 3) * 18]);
        }
      }
    }
    return st;
  }

  function paint(st) {
    if (!st || st.done || !st.ctx || !st.canvas) return;
    var ctx = st.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, st.canvas.width, st.canvas.height);
    var t = clamp(st.clock / st.dur, 0, 1);
    ctx.save();
    ctx.scale(st.canvas.width / 1000, st.canvas.height / 1000);
    ctx.globalAlpha = st.reduced ? 0.9 : smooth(0, 0.07, t) * (1 - smooth(0.83, 1, t));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    painters[st.id](ctx, st, t);
    pulse(ctx, st);
    ctx.restore();
  }

  function dispose(st) {
    if (!st || st.done) return;
    st.done = true;
    if (st.raf) window.cancelAnimationFrame(st.raf);
    if (st.timer) window.clearTimeout(st.timer);
    if (st.ctx && st.canvas) {
      st.ctx.setTransform(1, 0, 0, 1, 0, 0);
      st.ctx.clearRect(0, 0, st.canvas.width, st.canvas.height);
    }
    if (st.host && st.host._mpFx === st) delete st.host._mpFx;
    var index = hosts.indexOf(st);
    if (index !== -1) hosts.splice(index, 1);
    st.raf = st.timer = 0;
    st.seeds.length = st.digits.length = 0;
    st.host = st.canvas = st.ctx = null;
    if (!hosts.length && observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function watchDetach() {
    if (observer || !window.MutationObserver || !document.documentElement) return;
    observer = new window.MutationObserver(function () {
      var active = hosts.slice();
      for (var i = 0; i < active.length; i += 1) {
        if (!active[i].host.isConnected || !active[i].canvas.isConnected) dispose(active[i]);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function play(host, spec, opts) {
    if (!host || !spec) return;
    stop(host);
    if (document.hidden || !host.isConnected) return;
    var st = build(host, spec, opts || {});
    if (!st.ctx) { dispose(st); return; }
    hosts.push(st);
    host._mpFx = st;
    watchDetach();
    if (st.reduced) {
      st.clock = st.dur * (st.id === 'binary' ? 0.76 : 0.46);
      paint(st);
      st.timer = window.setTimeout(function () { dispose(st); }, 650);
      return st;
    }
    var started = performance.now();
    function frame(now) {
      st.raf = 0;
      if (st.done) return;
      if (document.hidden || !st.host.isConnected || !st.canvas.isConnected) { dispose(st); return; }
      st.clock = Math.max(0, (now - started) / 1000);
      if (st.clock >= st.dur) { dispose(st); return; }
      paint(st);
      st.raf = window.requestAnimationFrame(frame);
    }
    st.raf = window.requestAnimationFrame(frame);
    return st;
  }

  function stop(host) {
    for (var i = hosts.length - 1; i >= 0; i -= 1) {
      if (hosts[i].host === host) dispose(hosts[i]);
    }
  }

  function stopAll() {
    while (hosts.length) dispose(hosts[hosts.length - 1]);
  }

  document.addEventListener('visibilitychange', function () { if (document.hidden) stopAll(); });
  window.addEventListener('pagehide', stopAll);
  if (motion) {
    if (motion.addEventListener) motion.addEventListener('change', stopAll);
    else if (motion.addListener) motion.addListener(stopAll);
  }

  window.MPPlanetFx = { play: play, paint: paint, stop: stop, stopAll: stopAll };
})();
