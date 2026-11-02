/* 乘法星球 — 球面投影查找表与颜色工具 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var TW = 512;
  var TH = 256;
  var TILT = -0.3;
  var LIGHT = normalize([-0.48, -0.56, 0.68]);
  var HALF = normalize([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

  function normalize(v) {
    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  function rgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; });
    var n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function fade(hex, a) {
    var c = rgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  function darken(hex, f) {
    var c = rgb(hex);
    return 'rgb(' + Math.round(c[0] * f) + ',' + Math.round(c[1] * f) + ',' + Math.round(c[2] * f) + ')';
  }

  /**
   * 预计算每个像素的经度、纬度行号、光照与边缘透明度。
   * 这样每帧只需「加自转 + 采样」，不必重复三角函数。
   */
  function build(size, ratio) {
    var R = size * (ratio || 0.3);
    var cx = size / 2;
    var cy = size / 2;
    var n = size * size;
    var lon = new Float32Array(n);
    var vIdx = new Int32Array(n);
    var shade = new Float32Array(n);
    var spec = new Uint8Array(n);
    var rim = new Uint8Array(n);
    var alpha = new Uint8Array(n);
    var list = [];
    var cosT = Math.cos(TILT);
    var sinT = Math.sin(TILT);
    var y;
    var x;

    for (y = 0; y < size; y += 1) {
      var ny0 = (y + 0.5 - cy) / R;
      for (x = 0; x < size; x += 1) {
        var nx0 = (x + 0.5 - cx) / R;
        var d2 = nx0 * nx0 + ny0 * ny0;
        if (d2 > 1) continue;

        var nz = Math.sqrt(1 - d2);
        var nx = nx0 * cosT - ny0 * sinT;
        var ny = nx0 * sinT + ny0 * cosT;

        var lonv = Math.atan2(nx, nz) / TAU + 0.5;
        lonv -= Math.floor(lonv);
        var lat = Math.asin(ny > 1 ? 1 : ny < -1 ? -1 : ny);
        var ty = Math.floor((0.5 - lat / Math.PI) * TH);
        if (ty < 0) ty = 0;
        if (ty > TH - 1) ty = TH - 1;

        var i = y * size + x;
        lon[i] = lonv;
        vIdx[i] = ty * TW;

        var ndl = nx0 * LIGHT[0] + ny0 * LIGHT[1] + nz * LIGHT[2];
        var diffuse = Math.max(0, (ndl + 0.12) / 1.12);
        var lit = 0.35 + 0.62 * diffuse;
        lit += Math.max(0, -ndl) * 0.1;
        lit *= 0.94 + 0.06 * nz;
        shade[i] = Math.min(1, lit) * 255;

        var hd = Math.max(0, nx0 * HALF[0] + ny0 * HALF[1] + nz * HALF[2]);
        var h2 = hd * hd;
        var h4 = h2 * h2;
        var h8 = h4 * h4;
        var h16 = h8 * h8;
        var h32 = h16 * h16;
        spec[i] = (h32 * h32 * 0.72 + h16 * 0.28) * 155;

        var limb = 1 - nz;
        var rimLight = Math.max(0, -nx0 * 0.55 - ny0 * 0.65);
        rim[i] = limb * limb * (36 + 94 * rimLight);

        var edge = (1 - Math.sqrt(d2)) * R;
        alpha[i] = edge < 1.1 ? Math.max(0, Math.min(255, (edge / 1.1) * 255)) : 255;
        list.push(i);
      }
    }

    return {
      size: size,
      R: R,
      cx: cx,
      cy: cy,
      lon: lon,
      vIdx: vIdx,
      shade: shade,
      spec: spec,
      rim: rim,
      alpha: alpha,
      active: new Int32Array(list)
    };
  }

  window.MPPlanetLut = {
    TW: TW,
    TH: TH,
    TILT: TILT,
    rgb: rgb,
    fade: fade,
    darken: darken,
    build: build
  };
})();
