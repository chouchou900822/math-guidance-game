(function () {
  'use strict';

  var K = window.MPPlanetPaintKit;
  var SP = window.MPPlanetPaintSpecial;
  var TW = K.TW;
  var TH = K.TH;
  var TAU = K.TAU;
  var cache = Object.create(null);

  function continents(g, pal, rand) {
    var depth = K.noise(rand, 7, 4);
    var current = K.noise(rand, 18, 8);
    var sea = K.ramp([K.tone(pal.base[1], 0.1), '#1d4f9e', '#2274c6', '#2c9fd2', '#5fd2d0']);
    K.field(g, function (x, y) {
      return sea(0.34 + Math.sin(y / TH * Math.PI) * 0.17 + depth(x, y) * 0.2 + current(x, y) * 0.04);
    });

    for (var i = 0; i < 10; i += 1) {
      var x = i / 10 * TW + 12 + (rand() - 0.5) * 22;
      var y = 58 + (i % 3) * 63 + (rand() - 0.5) * 26;
      var r = 19 + rand() * 17;
      var island = K.blob(rand, 0, 0, r);
      var hills = [];
      for (var h = 0; h < 4; h += 1) hills.push(K.blob(rand, (rand() - 0.5) * r, (rand() - 0.5) * r * 0.7, r * (0.3 + rand() * 0.25)));
      var land = pal.land[i % pal.land.length];
      K.wrap(g, x, y, r + 16, function () {
        K.stroke(g, island, 'rgba(113,237,218,0.12)', 19);
        K.stroke(g, island, 'rgba(123,243,216,0.28)', 11);
        K.stroke(g, island, '#d4dfae', 4.6);
        g.fillStyle = K.gradient(g, -r, -r, r * 0.4, r, [K.tone(land, 0.22), land, '#238e6d']);
        g.fill(island);
        g.save();
        g.clip(island);
        hills.forEach(function (hill, j) {
          g.fillStyle = j % 2 ? 'rgba(12,110,83,0.23)' : 'rgba(219,246,164,0.23)';
          g.fill(hill);
          K.stroke(g, hill, 'rgba(239,255,185,0.2)', 0.75);
        });
        var ridge = new Path2D();
        ridge.moveTo(-r * 0.52, r * 0.22);
        ridge.bezierCurveTo(-r * 0.3, -r * 0.36, r * 0.08, r * 0.1, r * 0.46, -r * 0.27);
        K.stroke(g, ridge, 'rgba(18,115,79,0.22)', 4);
        K.stroke(g, ridge, 'rgba(230,246,170,0.52)', 1.1);
        g.restore();
      });
    }

    for (i = 0; i < 11; i += 1) {
      x = rand() * TW;
      y = 36 + rand() * 187;
      var small = K.blob(rand, 0, 0, 3 + rand() * 5);
      K.wrap(g, x, y, 12, function () {
        K.stroke(g, small, 'rgba(117,231,212,0.42)', 6);
        K.stroke(g, small, '#e0e3b3', 2.2);
        g.fillStyle = '#74cba0';
        g.fill(small);
      });
    }

    for (i = 0; i < 40; i += 1) {
      x = rand() * TW;
      y = 24 + rand() * 210;
      var w = 5 + rand() * 11;
      var alpha = 0.14 + rand() * 0.14;
      K.wrap(g, x, y, w + 2, function () {
        var ripple = new Path2D();
        ripple.moveTo(-w, 0);
        ripple.quadraticCurveTo(0, 2.8, w, -1);
        K.stroke(g, ripple, K.fade('#c9faff', alpha), 0.65);
      });
    }

    for (i = 0; i < 7; i += 1) {
      x = i / 7 * TW + rand() * 23;
      y = 31 + (i % 3) * 87 + rand() * 15;
      w = 32 + rand() * 19;
      var tilt = (rand() - 0.5) * 0.4;
      K.wrap(g, x, y, w + 15, function () {
        g.rotate(tilt);
        for (var j = 0; j < 5; j += 1) {
          var curl = new Path2D();
          curl.moveTo(-w, 4 + j * 1.8);
          curl.bezierCurveTo(-w * 0.3, -10 + j * 1.1, w * 0.4, 12 - j * 1.6, w, -5 - j * 0.5);
          K.stroke(g, curl, 'rgba(239,253,255,' + (0.06 + j * 0.027) + ')', 3.8 - j * 0.55);
        }
      });
    }
    K.glow(g, 90, 8, 180, 25, '#e2faff', 0.26);
    K.glow(g, 355, TH - 8, 180, 22, '#e2faff', 0.2);
    K.caps(g, pal.ice);
  }

  function forest(g, pal, rand) {
    var terrain = K.noise(rand, 8, 5);
    var greens = K.ramp(['#185c46', pal.base[1], '#389b68', '#79c895', '#bce9b1']);
    K.field(g, function (x, y) {
      return greens(0.53 + 0.16 * Math.cos(y / TH * TAU) + terrain(x, y) * 0.17);
    });
    var phases = [];
    var layers = ['#76c899', '#54b483', '#399d72', '#278364', '#226b53'];
    for (var i = 0; i < 5; i += 1) {
      var phase = rand() * TAU;
      phases.push(phase);
      var y = 35 + i * 47;
      var hill = K.wave(y, 19, phase, 2);
      hill.lineTo(TW + 4, TH + 4);
      hill.lineTo(-4, TH + 4);
      hill.closePath();
      g.fillStyle = K.gradient(g, 0, y - 18, 0, y + 68, [K.tone(layers[i], 0.12), layers[i], K.tone(layers[i], -0.09)]);
      g.fill(hill);
      K.stroke(g, K.wave(y + 1, 19, phase, 2), 'rgba(210,255,193,0.24)', 1.3);
      K.stroke(g, K.wave(y + 16, 17, phase + 0.14, 2), 'rgba(12,75,49,0.1)', 0.8);
    }
    for (i = 0; i < 2; i += 1) {
      var river = K.wave(87 + i * 93, 17, phases[i + 1] + 1, 2);
      K.stroke(g, river, 'rgba(12,81,61,0.28)', 6.5);
      K.stroke(g, river, '#90d8b4', 3.8);
      K.stroke(g, river, 'rgba(223,255,211,0.75)', 1.1);
    }
    for (i = 0; i < 39; i += 1) {
      var row = i % 4;
      var x = (Math.floor(i / 4) + 0.22 + rand() * 0.65) / 10 * TW;
      y = 50 + row * 47 + Math.sin(x / TW * TAU * 2 + phases[row]) * 17;
      var height = 11 + rand() * 12;
      var color = row % 2 ? '#236951' : '#2a7953';
      K.wrap(g, x, y, height, function () {
        g.fillStyle = 'rgba(7,58,40,0.16)';
        g.beginPath();
        g.ellipse(3, 2, height * 0.4, 2.4, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#917751';
        g.fillRect(-0.7, -height * 0.3, 1.4, height * 0.4);
        for (var tier = 2; tier >= 0; tier -= 1) {
          var top = -height + tier * height * 0.21;
          var half = height * (0.22 + tier * 0.06);
          var bottom = top + height * 0.45;
          g.fillStyle = K.tone(color, tier * 0.04);
          g.fill(K.path([[0, top], [half, bottom], [-half, bottom]], true));
          g.fillStyle = 'rgba(156,224,143,0.34)';
          g.fill(K.path([[0, top], [0, bottom - 1], [-half, bottom]], true));
        }
      });
    }
    for (i = 0; i < 8; i += 1) {
      K.leaf(g, i / 8 * TW + rand() * 25, 60 + rand() * 145, 13 + rand() * 8, -0.7 + rand() * 1.3, '#9bdaa1');
    }
    for (i = 0; i < 24; i += 1) {
      x = rand() * TW;
      y = 52 + rand() * 175;
      var flowerColor = i % 3 === 0 ? '#ffe1b0' : '#e4f7dc';
      K.wrap(g, x, y, 4, function () {
        g.fillStyle = flowerColor;
        for (var petal = 0; petal < 5; petal += 1) {
          var a = petal / 5 * TAU;
          g.beginPath();
          g.ellipse(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 1.4, 0.9, a, 0, TAU);
          g.fill();
        }
        g.fillStyle = '#f5c76f';
        g.fillRect(-0.65, -0.65, 1.3, 1.3);
      });
    }
  }

  function bubbles(g, pal, rand) {
    g.fillStyle = K.gradient(g, 0, 0, 0, TH, ['#ffeacb', pal.base[0], '#ffb6be', pal.base[1]]);
    g.fillRect(0, 0, TW, TH);
    for (var i = 0; i < 3; i += 1) {
      var ribbon = K.wave(38 + i * 91, 20, i * 2.1 + 0.4, 1);
      K.stroke(g, ribbon, 'rgba(207,89,118,0.08)', 20);
      K.stroke(g, ribbon, 'rgba(255,233,211,0.36)', 15);
      K.stroke(g, K.wave(34 + i * 91, 20, i * 2.1 + 0.4, 1), 'rgba(255,251,227,0.46)', 2);
    }
    for (i = 0; i < 6; i += 1) {
      var x = i / 6 * TW + 22;
      var y = i % 2 ? 66 : 181;
      var r = 12 + rand() * 5;
      var angle = -0.8 + rand() * 1.6;
      K.wrap(g, x, y, r + 4, function () {
        g.rotate(angle);
        var slice = new Path2D();
        slice.moveTo(-r, -r * 0.35);
        slice.bezierCurveTo(-r * 1.08, r * 0.8, r * 0.85, r, r, -r * 0.35);
        slice.quadraticCurveTo(0, -r * 0.05, -r, -r * 0.35);
        g.fillStyle = 'rgba(201,82,98,0.15)';
        g.save();
        g.translate(1, 2);
        g.fill(slice);
        g.restore();
        g.fillStyle = K.gradient(g, 0, -r, 0, r, ['#fff3ce', '#ffc993', '#ff8f94']);
        g.fill(slice);
        K.stroke(g, slice, '#ed8d91', 1.5);
        g.save();
        g.clip(slice);
        for (var f = -2; f <= 2; f += 1) {
          var fiber = new Path2D();
          fiber.moveTo(f * 2, -r * 0.3);
          fiber.quadraticCurveTo(f * r * 0.32, r * 0.35, f * r * 0.48, r * 0.72);
          K.stroke(g, fiber, 'rgba(255,251,211,0.46)', 0.75);
        }
        g.restore();
        var rim = new Path2D();
        rim.moveTo(-r * 0.84, -r * 0.13);
        rim.bezierCurveTo(-r * 0.68, r * 0.65, r * 0.65, r * 0.7, r * 0.86, -r * 0.13);
        K.stroke(g, rim, 'rgba(255,245,213,0.65)', 1.1);
      });
      K.leaf(g, x + r * 0.65, y - r * 0.5, 12, angle - 0.55, '#7bbd8a');
    }
    for (i = 0; i < 5; i += 1) {
      x = 56 + i * 103;
      y = 98 + (i % 2) * 56;
      K.leaf(g, x, y, 10 + rand() * 4, rand() * TAU, '#ffb69f');
    }
    for (i = 0; i < 12; i += 1) {
      x = (i % 6 + 0.65) / 6 * TW + (rand() - 0.5) * 18;
      y = 70 + Math.floor(i / 6) * 111 + (rand() - 0.5) * 45;
      r = 14 + rand() * 12;
      K.wrap(g, x, y, r + 3, function () {
        var glass = g.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.12, 0, 0, r);
        glass.addColorStop(0, 'rgba(255,255,255,0.05)');
        glass.addColorStop(0.65, 'rgba(255,246,221,0.03)');
        glass.addColorStop(0.87, 'rgba(248,218,251,0.16)');
        glass.addColorStop(0.96, 'rgba(255,255,255,0.5)');
        glass.addColorStop(1, 'rgba(230,134,164,0.18)');
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.fillStyle = glass;
        g.fill();
        g.strokeStyle = 'rgba(255,250,246,0.65)';
        g.lineWidth = 0.8;
        g.stroke();
        var light = new Path2D();
        light.arc(0, 0, r * 0.82, Math.PI * 1.08, Math.PI * 1.5);
        K.stroke(g, light, 'rgba(255,255,255,0.94)', 2.1);
        light = new Path2D();
        light.arc(0, 0, r * 0.7, Math.PI * 1.15, Math.PI * 1.3);
        K.stroke(g, light, 'rgba(255,255,255,0.64)', 1);
        light = new Path2D();
        light.arc(0, 0, r * 0.89, 0.08, Math.PI * 0.38);
        K.stroke(g, light, 'rgba(222,251,244,0.87)', 1.4);
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.beginPath();
        g.ellipse(-r * 0.27, -r * 0.73, r * 0.12, r * 0.045, -0.4, 0, TAU);
        g.fill();
      });
    }
    for (i = 0; i < 21; i += 1) K.dot(g, rand() * TW, 18 + rand() * 220, 0.6 + rand() * 1.2, 'rgba(255,250,234,0.64)');
  }

  function craters(g, pal, rand) {
    var mineral = K.noise(rand, 9, 5);
    var grain = K.noise(rand, 48, 23);
    var amber = K.ramp([K.tone(pal.deep, 0.08), '#dca32c', '#f4c445', pal.base[0], pal.shine]);
    K.field(g, function (x, y) {
      var polish = Math.sin(y / TH * Math.PI * 3 + mineral(x, y) * 0.8);
      return amber(0.69 + polish * 0.15 + mineral(x, y) * 0.14 + grain(x, y) * 0.018);
    });
    for (var i = 0; i < 7; i += 1) {
      var x = i / 7 * TW + rand() * 20;
      var y = 43 + rand() * 161;
      var points = [[-30, 8], [-16, 2], [-4, 5], [10, -4], [25, -8], [36, -4]];
      for (var p = 0; p < points.length; p += 1) points[p][1] += (rand() - 0.5) * 9;
      K.wrap(g, x, y, 42, function () {
        var vein = K.path(points);
        K.stroke(g, vein, 'rgba(127,74,14,0.24)', 3.7);
        K.stroke(g, vein, '#ffe38a', 1.6);
        K.stroke(g, K.path([points[2], [0, -9], [-6, -17]]), 'rgba(255,239,160,0.75)', 0.9);
        K.stroke(g, K.path([points[4], [20, 7], [27, 16]]), 'rgba(255,239,160,0.65)', 0.8);
      });
    }
    for (i = 0; i < 23; i += 1) {
      x = (i % 8 + 0.3 + rand() * 0.45) / 8 * TW;
      y = 37 + Math.floor(i / 8) * 85 + (rand() - 0.5) * 27;
      var r = i % 4 === 0 ? 15 + rand() * 7 : 4 + rand() * 7;
      K.wrap(g, x, y, r + 6, function () {
        g.scale(1, 0.86);
        var rim = g.createRadialGradient(0, 0, r * 0.74, 0, 0, r * 1.2);
        rim.addColorStop(0, 'rgba(123,73,8,0)');
        rim.addColorStop(0.55, 'rgba(131,75,9,0.32)');
        rim.addColorStop(1, 'rgba(148,92,14,0)');
        g.fillStyle = rim;
        g.beginPath();
        g.arc(0, 0, r * 1.2, 0, TAU);
        g.fill();
        g.fillStyle = K.gradient(g, -r * 0.3, -r, r * 0.3, r, [K.tone(pal.deep, -0.32), '#b87d20', '#e8b851', '#ffe3a0']);
        g.beginPath();
        g.arc(0, 0, r * 0.87, 0, TAU);
        g.fill();
        var edge = new Path2D();
        edge.arc(0, 0, r, Math.PI * 0.93, Math.PI * 1.86);
        K.stroke(g, edge, K.fade(pal.shine, 0.9), 1.9);
        edge = new Path2D();
        edge.arc(0, 0, r * 0.94, 0.05, Math.PI * 0.85);
        K.stroke(g, edge, 'rgba(139,81,12,0.53)', 1.6);
        edge = new Path2D();
        edge.arc(0, 0, r * 0.73, Math.PI * 1.08, Math.PI * 1.8);
        K.stroke(g, edge, 'rgba(109,63,12,0.33)', 1.5);
      });
    }
    for (i = 0; i < 6; i += 1) {
      x = 46 + i * 85;
      y = 95 + (i % 2) * 75;
      K.prism(g, x - 6, y + 4, 13, 19, -0.5, ['#fff1b0', '#e8a62f', '#ffda73', '#b77813']);
      K.prism(g, x + 4, y, 14, 28, 0.25, ['#fff4bd', '#f6cf69', '#e4a536', '#c68a19']);
    }
    for (i = 0; i < 27; i += 1) K.dot(g, rand() * TW, 22 + rand() * 212, 0.45 + rand() * 0.45, 'rgba(255,247,203,0.65)');
    for (i = 0; i < 7; i += 1) K.spark(g, 30 + i * 74, 42 + rand() * 175, 2.3 + rand() * 1.5, '#fff5ce');
  }

  function bands(g, pal, rand) {
    var flow = K.noise(rand, 9, 14);
    var fine = K.noise(rand, 32, 34);
    var sand = K.ramp([pal.band[3], pal.band[1], pal.band[2], pal.band[0], '#fff0cf']);
    var phase = rand() * TAU;
    K.field(g, function (x, y) {
      var a = x / TW * TAU;
      var v = y + Math.sin(a * 2 + y * 0.018 + phase) * 3.5 + Math.sin(a * 5 - y * 0.035) * 1.2 + flow(x, y) * 3.7;
      var value = 0.56 + Math.sin(v * 0.105) * 0.15 + Math.sin(v * 0.3 + 0.8) * 0.1 + Math.sin(v * 0.91) * 0.035;
      return sand(value + flow(x, y) * 0.085 + fine(x, y) * 0.021);
    });
    for (var i = 0; i < 53; i += 1) {
      var y = 3 + i * 4.8;
      K.stroke(g, K.wave(y, 2 + Math.sin(i * 0.7), phase + y * 0.018, 2), i % 3 ? 'rgba(255,247,217,0.14)' : 'rgba(146,96,46,0.09)', 0.65);
    }
    for (i = 0; i < 4; i += 1) {
      var x = 75 + i * 131 + rand() * 16;
      y = 66 + (i % 3) * 56;
      var rx = i === 1 ? 32 : 14 + rand() * 8;
      var ry = rx * 0.34;
      K.wrap(g, x, y, rx + 8, function () {
        g.scale(1, ry / rx);
        var storm = g.createRadialGradient(-rx * 0.12, -rx * 0.15, 1, 0, 0, rx);
        storm.addColorStop(0, '#d2a060');
        storm.addColorStop(0.22, '#e3b776');
        storm.addColorStop(0.43, '#f9dfac');
        storm.addColorStop(0.59, '#e2b77e');
        storm.addColorStop(0.76, 'rgba(255,235,194,0.85)');
        storm.addColorStop(1, 'rgba(247,216,166,0)');
        g.fillStyle = storm;
        g.beginPath();
        g.arc(0, 0, rx, 0, TAU);
        g.fill();
        var spiral = new Path2D();
        for (var t = 0; t <= 120; t += 1) {
          var angle = t / 120 * TAU * 2.3;
          var radius = rx * (0.07 + t / 120 * 0.78);
          var sx = Math.cos(angle) * radius;
          var sy = Math.sin(angle) * radius;
          if (t === 0) spiral.moveTo(sx, sy);
          else spiral.lineTo(sx, sy);
        }
        K.stroke(g, spiral, 'rgba(255,242,209,0.56)', 1.1);
      });
    }
  }

  var PAINTERS = {
    continents: continents,
    forest: forest,
    bands: bands,
    craters: craters,
    bubbles: bubbles,
    swirl: SP.swirl,
    crystal: SP.crystal,
    lava: SP.lava,
    galaxy: SP.galaxy,
    binary: SP.binary
  };

  window.MPPlanetTextures = {
    make: function (skin) {
      var seed = skin.seed == null ? 7 : skin.seed;
      var key = JSON.stringify([skin.id, skin.pattern, seed, skin.palette]);
      if (cache[key]) return cache[key];
      var canvas = document.createElement('canvas');
      canvas.width = TW;
      canvas.height = TH;
      var g = canvas.getContext('2d');
      var pal = skin.palette;
      var base = pal.base;
      g.fillStyle = base[0];
      g.fillRect(0, 0, TW, TH);
      g.fillStyle = K.gradient(g, 0, 0, 0, TH, [K.tone(base[0], 0.14), base[0], base[1]]);
      g.fillRect(0, 0, TW, TH);
      var paint = PAINTERS[skin.pattern] || continents;
      paint(g, pal, K.rng(seed));
      var image = g.getImageData(0, 0, TW, TH);
      // LUT 用 0.5 - lat / PI 取纬度行，输出翻转一次以保持文字和树木正立。
      var stride = TW * 4;
      var row = new Uint8ClampedArray(stride);
      for (var y = 0; y < TH / 2; y += 1) {
        var top = y * stride;
        var bottom = (TH - 1 - y) * stride;
        row.set(image.data.subarray(top, top + stride));
        image.data.copyWithin(top, bottom, bottom + stride);
        image.data.set(row, bottom);
      }
      cache[key] = image;
      return image;
    }
  };
})();
