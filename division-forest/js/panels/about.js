/* 除法森林 — 关于页交互与本机实测 */
(function () {
  'use strict';

  var View = window.DFAboutView;

  function mount(root) {
    var stage = root.querySelector('#about-tree');
    if (stage) window.DFEgg.attach(stage, window.DFSkins.equipped());
  }

  /* 在访客自己的设备上生成一遍十棵大树，避免「性能数据只存在于作者电脑」 */
  function bench(root) {
    var btn = root.querySelector('[data-action="bench"]');
    var out = root.querySelector('#bench-out');
    if (!btn || !out || btn.disabled) return;

    btn.disabled = true;
    out.textContent = '测量中…';

    window.setTimeout(function () {
      var box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:-9999px;top:0;width:440px';
      document.body.appendChild(box);

      var skins = window.DFSkins.list;
      var rounds = 5;
      var start = performance.now();
      for (var r = 0; r < rounds; r += 1) {
        box.innerHTML = skins.map(function (skin) { return window.DFTree.scene(skin); }).join('');
        void box.offsetHeight;
      }
      var per = (performance.now() - start) / (rounds * skins.length);
      var nodes = box.getElementsByTagName('*').length;
      if (box.parentNode) box.parentNode.removeChild(box);

      out.innerHTML = '<b>' + per.toFixed(2) + ' ms</b> / 棵 · 每棵约 <b>' + Math.round(nodes / skins.length) +
        '</b> 个节点<span>包括拼 SVG 字符串、解析和排版</span>';
      btn.disabled = false;
      btn.textContent = '再测一次';
    }, 60);
  }

  window.DFAbout = {
    view: View.view,
    mount: mount,
    bench: bench
  };
})();
