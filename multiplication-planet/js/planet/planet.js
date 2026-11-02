/* 乘法星球 — Canvas 3D 星球（软渲染） */
(function () {
  'use strict';

  var LUT = window.MPPlanetLut;
  var DECO = window.MPPlanetDeco;
  var TAU = Math.PI * 2;
  var TW = LUT.TW;
  var RATIO = 0.30;
  var MAX_YAW = 0.9;
  var loops = [];
  var detachObserver = null;
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function sizeFor(canvas, opts) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var css = canvas.clientWidth || (canvas.parentNode ? canvas.parentNode.clientWidth : 0) || 320;
    var size = Math.round(css * dpr);
    var max = (opts && opts.max) || 440;
    if (size > max) size = max;
    if (size < 96) size = 96;
    return size;
  }

  function fit(canvas, opts) {
    var size = sizeFor(canvas, opts);
    var zoom = (opts && opts.zoom) || 1;
    var lut = LUT.build(size, RATIO * zoom);
    var sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    var sctx = sprite.getContext('2d');
    var st = {
      size: size,
      zoom: zoom,
      lut: lut,
      sprite: sprite,
      sctx: sctx,
      img: sctx.createImageData(size, size),
      skinId: null,
      tex: null
    };
    canvas.width = size;
    canvas.height = size;
    canvas._mpState = st;
    return st;
  }

  function ensure(canvas, opts) {
    var st = canvas._mpState;
    var size = sizeFor(canvas, opts);
    var zoom = (opts && opts.zoom) || 1;
    if (!st || st.size !== size || st.zoom !== zoom) st = fit(canvas, opts);
    return st;
  }

  function draw(st, canvas, skin, spin) {
    if (st.skinId !== skin.id) {
      st.tex = window.MPPlanetTextures.make(skin);
      st.skinId = skin.id;
    }

    var lut = st.lut;
    var tex = st.tex.data;
    var out = st.img.data;
    var at = LUT.rgb(skin.palette.atmo);
    var specAmt = skin.spec == null ? 0.3 : skin.spec;
    var spinN = (spin || 0) / TAU;
    spinN -= Math.floor(spinN);

    var active = lut.active;
    var lon = lut.lon;
    var vid = lut.vIdx;
    var shade = lut.shade;
    var spec = lut.spec;
    var rim = lut.rim;
    var alpha = lut.alpha;
    var total = active.length;
    var flat = skin.flat === true;
    var emissive = !flat && (skin.id === 'binary' || skin.id === 'lava' || skin.id === 'galaxy');

    for (var k = 0; k < total; k += 1) {
      var i = active[k];
      var u = lon[i] + spinN;
      if (u >= 1) u -= 1;
      var tx = (u * TW) | 0;
      if (tx >= TW) tx = TW - 1;
      var t4 = (vid[i] + tx) * 4;
      var sh = flat ? 1 : shade[i] / 255;
      var sp = flat ? 0 : spec[i] * specAmt / 255;
      var rv = flat ? 0 : rim[i] / 65025;
      var tr = tex[t4];
      var tg = tex[t4 + 1];
      var tb = tex[t4 + 2];
      if (emissive) {
        var hi = Math.max(tr, tg, tb);
        var chroma = hi - Math.min(tr, tg, tb);
        var emission = Math.max(0, (hi - 118) / 137) * Math.min(1, chroma / 90) * 0.3;
        sh += (1 - sh) * emission;
      }
      var o = i * 4;
      var r = tr * sh;
      var g = tg * sh;
      var b = tb * sh;
      out[o] = r + (255 - r) * Math.min(1, sp + rv * at[0]);
      out[o + 1] = g + (255 - g) * Math.min(1, sp + rv * at[1]);
      out[o + 2] = b + (255 - b) * Math.min(1, sp + rv * at[2]);
      out[o + 3] = alpha[i];
    }
    st.sctx.putImageData(st.img, 0, 0);

    var ctx = canvas.getContext('2d');
    var size = st.size;
    var R = lut.R;
    var cx = lut.cx;
    var cy = lut.cy;
    ctx.clearRect(0, 0, size, size);

    var glow = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.4);
    glow.addColorStop(0, LUT.fade(skin.palette.atmo, 0.25));
    glow.addColorStop(0.42, LUT.fade(skin.palette.atmo, 0.08));
    glow.addColorStop(1, LUT.fade(skin.palette.atmo, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    if (skin.rings) DECO.rings(ctx, lut, skin, false);
    if (skin.moon) DECO.moon(ctx, lut, skin, true, spin || 0);
    ctx.drawImage(st.sprite, 0, 0);

    var edge = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    edge.addColorStop(0, LUT.fade(skin.palette.atmo, 0.65));
    edge.addColorStop(0.42, LUT.fade(skin.palette.atmo, 0.2));
    edge.addColorStop(1, 'rgba(23,19,28,.52)');
    ctx.beginPath();
    ctx.arc(cx, cy, R - 0.3, 0, TAU);
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(0.65, size * 0.0022);
    ctx.stroke();

    if (skin.rings) DECO.rings(ctx, lut, skin, true);
    if (skin.moon) DECO.moon(ctx, lut, skin, false, spin || 0);
  }

  function paint(canvas, skin, spin, opts) {
    var st = ensure(canvas, opts);
    draw(st, canvas, skin, spin || 0);
  }

  function watchDetach() {
    if (detachObserver || !window.MutationObserver || !document.documentElement) return;
    detachObserver = new window.MutationObserver(function () {
      var active = loops.slice();
      for (var i = 0; i < active.length; i += 1) {
        if (!active[i].canvas.isConnected) active[i].stop();
      }
    });
    detachObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  function attach(canvas, skin, opts) {
    opts = opts || {};
    for (var i = loops.length - 1; i >= 0; i -= 1) {
      if (loops[i].canvas === canvas) loops[i].stop();
    }
    var st = ensure(canvas, opts);
    var speed = typeof opts.speed === 'number' && isFinite(opts.speed) ? opts.speed : 0.3;
    var ctl = {
      canvas: canvas,
      skin: skin,
      spin: opts.spin == null ? (skin.spin == null ? 1.2 : skin.spin) : opts.spin,
      raf: 0,
      last: null,
      pending: 0,
      painted: 0,
      visible: true,
      stopped: false,
      aim: 0,
      target: 0,
      aiming: false,
      rate: 1,
      boost: 0
    };

    function render() {
      if (!ctl.stopped) draw(st, canvas, ctl.skin, ctl.spin + ctl.aim * MAX_YAW);
    }

    function frame(t) {
      ctl.raf = 0;
      if (!canvas.isConnected) { ctl.stop(); return; }
      if (ctl.stopped || document.hidden || !ctl.visible || (motion && motion.matches)) return;
      if (ctl.last !== null) ctl.pending += Math.max(0, (t - ctl.last) / 1000);
      ctl.last = t;
      if (t - ctl.painted >= 32) {
        var dt = ctl.pending;
        ctl.pending = 0;
        ctl.aim += (ctl.target - ctl.aim) * (1 - Math.exp(-dt * 6.5));
        var want = ctl.aiming ? 0.16 : 1;
        var rateDecay = Math.exp(-dt * 2.4);
        var distance = want * dt + (ctl.rate - want) * (1 - rateDecay) / 2.4;
        ctl.rate = want + (ctl.rate - want) * rateDecay;
        var boostDecay = Math.exp(-dt * 4.8);
        ctl.spin += speed * distance + ctl.boost * (1 - boostDecay) / 4.8;
        ctl.boost *= boostDecay;
        if (ctl.boost < 0.001) ctl.boost = 0;
        render();
        ctl.painted = t;
      }
      schedule();
    }

    function schedule() {
      if (!ctl.stopped && !ctl.raf && canvas.isConnected && ctl.visible && !document.hidden && !(motion && motion.matches)) {
        ctl.raf = window.requestAnimationFrame(frame);
      }
    }

    ctl.look = function (nx, on) {
      if (ctl.stopped) return;
      ctl.aiming = on !== false;
      ctl.target = ctl.aiming ? Math.max(-1, Math.min(1, Number(nx) || 0)) : 0;
      if (motion && motion.matches) {
        ctl.aim = ctl.target;
        render();
      }
    };

    ctl.turn = function (deltaRadians) {
      if (ctl.stopped || !isFinite(deltaRadians)) return;
      ctl.spin += Number(deltaRadians);
      render();
    };

    ctl.kick = function (charged) {
      if (ctl.stopped) return;
      if (!(motion && motion.matches)) ctl.boost = charged ? 1.25 : 0.65;
      render();
      schedule();
    };

    ctl.setSkin = function (next) {
      if (ctl.stopped || !next) return;
      ctl.skin = next;
      ctl.spin = next.spin == null ? (opts.spin == null ? 1.2 : opts.spin) : next.spin;
      ctl.aim = ctl.target = ctl.boost = ctl.pending = 0;
      ctl.aiming = false;
      ctl.rate = 1;
      ctl.last = null;
      st.skinId = null;
      st.tex = null;
      render();
      schedule();
    };

    ctl.stop = function () {
      if (ctl.stopped) return;
      ctl.stopped = true;
      if (ctl.raf) window.cancelAnimationFrame(ctl.raf);
      ctl.raf = ctl.pending = ctl.boost = 0;
      ctl.last = null;
      if (ctl.io) ctl.io.disconnect();
      ctl.io = null;
      var index = loops.indexOf(ctl);
      if (index !== -1) loops.splice(index, 1);
      if (!loops.length && detachObserver) {
        detachObserver.disconnect();
        detachObserver = null;
      }
    };

    ctl.refit = function () {
      if (!canvas.isConnected) { ctl.stop(); return; }
      if (ctl.stopped || sizeFor(canvas, opts) === st.size) return;
      st = ensure(canvas, opts);
      render();
    };

    ctl._sync = function () {
      if (!canvas.isConnected) { ctl.stop(); return; }
      if (ctl.raf) window.cancelAnimationFrame(ctl.raf);
      ctl.raf = ctl.pending = ctl.boost = 0;
      ctl.last = null;
      if (motion && motion.matches) { ctl.aim = ctl.target; render(); }
      schedule();
    };

    loops.push(ctl);
    render();
    if (!canvas.isConnected) { ctl.stop(); return ctl; }
    schedule();
    watchDetach();
    if ('IntersectionObserver' in window) {
      try {
        ctl.io = new window.IntersectionObserver(function (entries) {
          if (ctl.stopped || !entries.length) return;
          ctl.visible = entries[0].isIntersecting;
          ctl._sync();
        }, { threshold: 0.01 });
        ctl.io.observe(canvas);
      } catch (err) {
        ctl.io = null;
      }
    }
    return ctl;
  }

  function stopAll() {
    while (loops.length) loops[loops.length - 1].stop();
    if (detachObserver) detachObserver.disconnect();
    detachObserver = null;
  }

  function syncAll() {
    var active = loops.slice();
    for (var i = 0; i < active.length; i += 1) active[i]._sync();
  }

  window.addEventListener('resize', function () {
    var active = loops.slice();
    for (var i = 0; i < active.length; i += 1) active[i].refit();
  });
  document.addEventListener('visibilitychange', syncAll);
  window.addEventListener('pageshow', syncAll);
  window.addEventListener('pagehide', stopAll);
  if (motion) {
    if (motion.addEventListener) motion.addEventListener('change', syncAll);
    else if (motion.addListener) motion.addListener(syncAll);
  }

  window.MPPlanet = {
    paint: paint,
    attach: attach,
    stopAll: stopAll
  };
})();
