/* 乘法星球 — 行星环与卫星绘制 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var LUT = window.MPPlanetLut;

  function ringLayer(lut, ring, front) {
    var cv = document.createElement('canvas');
    cv.width = cv.height = lut.size;
    var ctx = cv.getContext('2d');
    var ratio = ring.ratio || 0.26;
    var start = front ? 0 : Math.PI;
    ctx.translate(lut.cx, lut.cy);
    ctx.rotate(ring.tilt == null ? -0.14 : ring.tilt);
    for (var i = 0; i < ring.bands.length; i += 1) {
      var b = ring.bands[i];
      var inner = lut.R * (b.r - b.w * 0.5);
      var outer = lut.R * (b.r + b.w * 0.5);
      ctx.globalAlpha = b.alpha == null ? 1 : b.alpha;
      for (var j = 0; j < 64; j += 1) {
        var a = start + j * Math.PI / 64;
        var end = a + Math.PI / 64 + 0.001;
        var light = (front ? 0.91 : 0.72) + Math.cos(a + 2.1) * 0.12;
        if (!front) light *= 1 - 0.38 * Math.exp(-Math.pow((a - 5.94) / 0.25, 2));
        ctx.beginPath();
        ctx.ellipse(0, 0, outer, outer * ratio, 0, a, end);
        ctx.ellipse(0, 0, inner, inner * ratio, 0, end, a, true);
        ctx.closePath();
        ctx.fillStyle = LUT.darken(b.color, light);
        ctx.fill();
      }
      for (var line = 0; line < 4; line += 1) {
        var radius = inner + (outer - inner) * (line + 0.5) / 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * ratio, 0, start, start + Math.PI);
        ctx.strokeStyle = line % 2 ? 'rgba(104,70,38,.24)' : 'rgba(255,247,216,.38)';
        ctx.lineWidth = Math.max(0.35, lut.size * 0.0011);
        ctx.stroke();
      }
    }
    return cv;
  }

  function rings(ctx, lut, skin, front) {
    var art = lut._ringArt;
    if (!art || art.source !== skin.rings) {
      art = lut._ringArt = {
        source: skin.rings,
        back: ringLayer(lut, skin.rings, false),
        front: ringLayer(lut, skin.rings, true)
      };
    }
    ctx.drawImage(front ? art.front : art.back, 0, 0);
  }

  function moonSprite(lut, color) {
    var r = lut.R * 0.13;
    var cv = document.createElement('canvas');
    cv.width = cv.height = Math.ceil(r * 2 + 4);
    var ctx = cv.getContext('2d');
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.scale(r, r);
    var g = ctx.createRadialGradient(-0.36, -0.42, 0.04, 0.1, 0.08, 1.08);
    g.addColorStop(0, '#fff8e6');
    g.addColorStop(0.55, color);
    g.addColorStop(1, LUT.darken(color, 0.48));
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.clip();
    var craters = [
      [-0.32, -0.36, 0.24, 0.87], [0.37, -0.27, 0.18, 0.85],
      [0.04, 0.25, 0.25, 0.96], [-0.55, 0.26, 0.13, 0.74],
      [0.43, 0.48, 0.13, 0.8], [0.03, -0.72, 0.11, 0.64],
      [-0.19, 0.63, 0.095, 0.75], [0.75, 0.06, 0.15, 0.65]
    ];
    for (var i = 0; i < craters.length; i += 1) {
      var c = craters[i];
      var pit = ctx.createRadialGradient(c[0] - c[2] * 0.2, c[1] - c[2] * 0.25, 0, c[0], c[1], c[2]);
      pit.addColorStop(0, 'rgba(78,64,50,.3)');
      pit.addColorStop(0.65, 'rgba(98,78,57,.2)');
      pit.addColorStop(1, 'rgba(255,241,206,.12)');
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], c[2], c[2] * c[3], -0.25, 0, TAU);
      ctx.fillStyle = pit;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], c[2], c[2] * c[3], -0.25, 0.15, 2.6);
      ctx.strokeStyle = 'rgba(255,249,225,.55)';
      ctx.lineWidth = 0.035;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], c[2] * 0.86, c[2] * c[3] * 0.86, -0.25, 3.3, 5.9);
      ctx.strokeStyle = 'rgba(72,59,46,.25)';
      ctx.lineWidth = 0.03;
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0, 0, 0.99, 0, TAU);
    ctx.strokeStyle = 'rgba(87,70,59,.48)';
    ctx.lineWidth = Math.max(0.025, 0.6 / r);
    ctx.stroke();
    return cv;
  }

  function moon(ctx, lut, skin, behind, spin) {
    var ang = spin * 0.62 + 0.9;
    if ((Math.sin(ang) < 0) !== behind) return;
    var mx = lut.cx + Math.cos(ang) * lut.R * 1.42;
    var my = lut.cy + Math.sin(ang) * lut.R * 0.44 + lut.R * 0.06;
    var color = skin.moonColor || '#c9a978';
    if (!lut._moonArt || lut._moonArt.color !== color) {
      lut._moonArt = { color: color, canvas: moonSprite(lut, color) };
    }
    var cv = lut._moonArt.canvas;
    ctx.drawImage(cv, mx - cv.width / 2, my - cv.height / 2);
  }

  window.MPPlanetDeco = { rings: rings, moon: moon };
})();
