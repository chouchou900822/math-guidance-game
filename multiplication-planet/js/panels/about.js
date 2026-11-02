/* 乘法星球 — 关于页交互与本机性能实测 */
(function () {
  'use strict';

  var View = window.MPAboutView;

  function mount(root) {
    var canvas = root.querySelector('#about-planet');
    if (canvas) {
      window.MPPlanet.attach(canvas, window.MPSkins.equipped(), { speed: 0.22, max: 380 });
    }
  }

  /* 在访客自己的设备上跑一次软渲染，避免「性能数据只存在于作者电脑」 */
  function bench(root) {
    var btn = root.querySelector('[data-action="bench"]');
    var out = root.querySelector('#bench-out');
    if (!btn || !out || btn.disabled) return;

    btn.disabled = true;
    out.textContent = '测量中…';

    window.setTimeout(function () {
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;left:-9999px;top:0;width:440px;height:440px';
      document.body.appendChild(canvas);

      var skin = window.MPSkins.equipped();
      var warmStart = performance.now();
      window.MPPlanet.paint(canvas, skin, 0, { max: 440 });
      var warm = performance.now() - warmStart;

      var frames = 24;
      var start = performance.now();
      for (var i = 0; i < frames; i += 1) {
        window.MPPlanet.paint(canvas, skin, i * 0.13, { max: 440 });
      }
      var per = (performance.now() - start) / frames;

      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);

      var fps = Math.min(60, Math.round(1000 / per));
      out.innerHTML = '<b>' + per.toFixed(1) + ' ms</b> / 帧 · 约 <b>' + fps +
        ' fps</b><span>首次准备 ' + Math.round(warm) + ' ms（LUT + 纹理）</span>';
      btn.disabled = false;
      btn.textContent = '再测一次';
    }, 60);
  }

  window.MPAbout = {
    view: View.view,
    mount: mount,
    bench: bench
  };
})();
