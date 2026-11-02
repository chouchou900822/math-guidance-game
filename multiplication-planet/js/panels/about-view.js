/* 乘法星球 — 关于这个作品 */
(function () {
  'use strict';

  var UI = window.MPUI;

  var METRICS = [
    { num: '9', label: '颗乘法星球' },
    { num: '45', label: '句口诀' },
    { num: '16', label: '枚奖章' },
    { num: '10', label: '款 3D 皮肤' },
    { num: '0', label: '个外部依赖' }
  ];

  var DECISIONS = [
    {
      tag: '01 · 先看懂',
      title: '点阵，而不是口诀卡',
      text: '3 × 4 不是一句要背的话，而是 3 行、每行 4 个点。孩子在数点的时候先建立「几个几」的图像，再回到口诀，记忆才有支点。'
    },
    {
      tag: '02 · 有去处',
      title: '星星必须能花掉',
      text: '每关最多 13 颗星，9 款可兑换皮肤从 20 到 210 颗，通关终局还有第 10 款；星星之外还有 16 枚奖章，从「答满 100 题」到「连续 7 天」。奖励既是反馈，也是下一个目标。'
    },
    {
      tag: '03 · 有终点',
      title: '终点是真数学，不是贴纸',
      text: '九张表全部三星后，第 10 个目的地开放：1024 号空间站。10 道题只做一件事 —— 把 1 翻倍十次。2¹⁰ = 1024 从乘法里自然长出来；每日挑战则用当天日期当随机种子，同一天谁打开都是同一套题。'
    }
  ];

  var STEPS = [
    {
      num: '01',
      title: '纹理',
      text: '512 × 256 的画布上程序化绘制大陆、云带、环形山与星云。10 套皮肤，没有一张图片资源。'
    },
    {
      num: '02',
      title: 'LUT',
      text: '按画布尺寸预计算每个像素的经度、纹理行号、光照、高光与边缘透明度，三角函数只算一次。'
    },
    {
      num: '03',
      title: '每帧',
      text: '自转角加到经度上，直接采样纹理，乘光照、加高光，逐像素写进 ImageData。'
    },
    {
      num: '04',
      title: '合成',
      text: '离屏画布贴回主画布，再叠大气辉光、墨线描边；土星环与卫星分前后两层绘制。'
    }
  ];

  var FILE_MAP = [
    ['js/data/', '口诀、存档、统计与每日题目'],
    ['js/planet/', '球面软渲染、10 套纹理、彩蛋特效'],
    ['js/screens/', '首页、学习、闯关、皮肤馆、奖章墙'],
    ['js/panels/', '终局关卡、家长报告、本页'],
    ['js/base/', '音效与界面工具'],
    ['js/app.js · app-actions.js', '路由、状态与动作表'],
    ['index.html · css/*.css', '语义结构、纸感版式与响应式']
  ];

  var A11Y = [
    '键盘 1–4 直接选答案，Tab 可达所有按钮，焦点有 3px 高对比外框',
    '对错不只靠颜色：正确项有绿色硬投影，反馈区同时给出文字与口诀',
    'aria-live 播报答题反馈，aria-pressed 标记声音与选项状态',
    'prefers-reduced-motion 下关闭自转、撒花与结算序列动画',
    '正文与纸面底色满足 WCAG AA 对比度，字号随视口缩放',
    '语音是辅助通道，不是唯一通道；所有内容都能看、能读'
  ];

  var PRIVACY = [
    '不注册、不登录、不采集，没有账号系统',
    '只用 1 个 localStorage 键保存进度与学习统计',
    '演示模式只在内存生效，退出后一个字节都不写入',
    '无广告、无内购、无第三方脚本、无埋点',
    '报告页可一键清空学习记录，星星和皮肤不受影响'
  ];

  function heroArt() {
    var skin = window.MPSkins.equipped();
    return '<div class="ab-hero-art">' +
      '<span class="ab-orbit ab-orbit-a" aria-hidden="true"><i></i></span>' +
      '<span class="ab-orbit ab-orbit-b" aria-hidden="true"></span>' +
      '<canvas class="ab-canvas" id="about-planet" role="img" aria-label="' +
        skin.name + '，一颗正在自转的星球"></canvas>' +
      '<span class="ab-art-tag" aria-hidden="true">2<sup>10</sup> = 1024</span>' +
      '<span class="ab-art-note" aria-hidden="true">逐像素软渲染 · 无贴图</span>' +
    '</div>';
  }

  function hero() {
    return '<header class="ab-hero">' +
      '<div class="ab-hero-copy">' +
        '<span class="eyebrow"><span class="dot"></span>1024 程序员节 · 教育类作品</span>' +
        '<h1 class="ab-title">用代码，<br>把乘法变成<br><em>一颗会转的星球</em></h1>' +
        '<p class="ab-lede">「乘法星球」是一个给 6–9 岁孩子的九九乘法表网站。它把 9 张表做成 9 颗星球，' +
          '把星星变成可以收集的皮肤，最后用 10 次翻倍走到 1024。没有账号、没有后端、没有第三方依赖。</p>' +
        '<div class="ab-tags">' +
          '<span>原生 JavaScript</span><span>Canvas 2D</span><span>零依赖</span><span>零后端</span>' +
        '</div>' +
        '<div class="ab-hero-actions">' +
          '<a class="btn btn-primary" href="?demo=1">打开演示模式' + UI.icon('arrow') + '</a>' +
          '<button type="button" class="btn" data-action="home">回首页</button>' +
        '</div>' +
      '</div>' +
      heroArt() +
    '</header>';
  }

  function metrics() {
    return '<div class="ab-metrics">' + METRICS.map(function (m) {
      return '<div class="ab-metric"><b>' + m.num + '</b><span>' + m.label + '</span></div>';
    }).join('') + '</div>';
  }

  function decisions() {
    return '<section class="ab-section">' +
      '<div class="ab-section-head"><span class="ab-kicker">设计</span><h2>三个设计决策</h2></div>' +
      '<div class="ab-cards">' + DECISIONS.map(function (d) {
        return '<article class="ab-card">' +
          '<span class="ab-card-tag">' + d.tag + '</span>' +
          '<h3>' + d.title + '</h3>' +
          '<p>' + d.text + '</p>' +
        '</article>';
      }).join('') + '</div>' +
    '</section>';
  }

  function codeBlock() {
    return '<pre class="ab-code"><code><span class="ab-c">// 每帧只做两件事：采样 + 光照</span>\n' +
      'for (var k = 0; k &lt; total; k += 1) {\n' +
      '  var i = active[k];\n' +
      '  <span class="ab-c">// 自转：经度整体平移</span>\n' +
      '  var u = lon[i] + spinN;\n' +
      '  var t4 = (vid[i] + (u * TW | 0)) * 4;\n' +
      '  var sh = shade[i];\n' +
      '  out[i * 4]     = (tex[t4]     * sh) &gt;&gt; 8;\n' +
      '  out[i * 4 + 1] = (tex[t4 + 1] * sh) &gt;&gt; 8;\n' +
      '  out[i * 4 + 2] = (tex[t4 + 2] * sh) &gt;&gt; 8;\n' +
      '  out[i * 4 + 3] = alpha[i];\n' +
      '}</code></pre>';
  }

  function technical() {
    return '<section class="ab-dark">' +
      '<div class="ab-dark-head">' +
        '<span class="ab-live"><i></i>RENDERER</span>' +
        '<h2>一颗星球，是逐像素算出来的</h2>' +
        '<p>没有 3D 库，没有贴图文件。球面每帧在 Canvas 上重算，换皮肤就是换一整套表面。' +
          '开发机实测 0.7 ms 一帧；首页仍按 32 ms 节流到 30fps，省电，也给低端机留余量。</p>' +
      '</div>' +
      '<ol class="ab-steps">' + STEPS.map(function (s) {
        return '<li><b>' + s.num + ' ' + s.title + '</b><span>' + s.text + '</span></li>';
      }).join('') + '</ol>' +
      codeBlock() +
      '<div class="ab-bench">' +
        '<div class="ab-bench-copy">' +
          '<b>在这台设备上实测</b>' +
          '<span>用当前皮肤渲染 24 帧 440 × 440 球面，取平均</span>' +
        '</div>' +
        '<button type="button" class="btn ab-bench-btn" data-action="bench">开始测量</button>' +
        '<output class="ab-bench-out" id="bench-out">开发机：0.7 ms / 帧</output>' +
      '</div>' +
    '</section>';
  }

  function engineering() {
    var rows = FILE_MAP.map(function (row) {
      return '<div class="ab-file"><code>' + row[0] + '</code><span>' + row[1] + '</span></div>';
    }).join('');

    return '<section class="ab-section">' +
      '<div class="ab-section-head"><span class="ab-kicker">工程</span><h2>它是怎么组起来的</h2></div>' +
      '<div class="ab-engineering">' +
        '<div class="ab-spec">' +
          '<div class="ab-spec-row"><span>运行方式</span><b>纯静态</b></div>' +
          '<div class="ab-spec-row"><span>构建步骤</span><b>0 步</b></div>' +
          '<div class="ab-spec-row"><span>外部请求</span><b>0 个</b></div>' +
          '<div class="ab-spec-row"><span>依赖包</span><b>0 个</b></div>' +
          '<div class="ab-spec-row"><span>代码规模</span><b>约 6700 行 JS · 6800 行 CSS</b></div>' +
          '<div class="ab-spec-row"><span>资源体积</span><b>约 345 KB · gzip 84 KB</b></div>' +
          '<div class="ab-spec-row"><span>数据存储</span><b>localStorage · 1 个键</b></div>' +
          '<div class="ab-spec-row"><span>语音朗读</span><b>浏览器 SpeechSynthesis</b></div>' +
        '</div>' +
        '<div class="ab-files">' + rows + '</div>' +
      '</div>' +
    '</section>';
  }

  function care() {
    return '<section class="ab-section">' +
      '<div class="ab-section-head"><span class="ab-kicker">细节</span><h2>无障碍与隐私</h2></div>' +
      '<div class="ab-care">' +
        '<div class="ab-care-col">' +
          '<h3><span class="ab-dot ab-dot-blue"></span>每个孩子都能用</h3>' +
          '<ul>' + A11Y.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="ab-care-col">' +
          '<h3><span class="ab-dot ab-dot-green"></span>数据留在本机</h3>' +
          '<ul>' + PRIVACY.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function route() {
    var steps = [
      ['首页', '自转星球、今日挑战、9 颗星球'],
      ['点开 3 的表', '点阵图 + 点读口诀，看懂「几个几」'],
      ['开始闯关', '10 题、连击、结算，星星入账'],
      ['奖章与 1024', '16 枚奖章、10 款皮肤、终局空间站']
    ];
    return '<section class="ab-route">' +
      '<div class="ab-route-copy">' +
        '<span class="ab-kicker">给评委</span>' +
        '<h2>30 秒看完全部</h2>' +
        '<p>不想先攒 860 颗星？打开 <code>?demo=1</code>，全部皮肤与终局关卡直接解锁，试玩不会写入任何数据。</p>' +
      '</div>' +
      '<ol class="ab-route-steps">' + steps.map(function (s, i) {
        return '<li><span>' + (i + 1) + '</span><b>' + s[0] + '</b><em>' + s[1] + '</em></li>';
      }).join('') + '</ol>' +
      '<div class="ab-route-actions">' +
        '<a class="btn btn-primary" href="?demo=1">进入演示模式' + UI.icon('arrow') + '</a>' +
        '<a class="btn" href="./">正常模式</a>' +
      '</div>' +
    '</section>';
  }

  function view() {
    return '<section class="screen about">' +
      '<div class="ab-top">' +
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回星球</button>' +
        '<span class="ab-top-tag">关于这个作品</span>' +
      '</div>' +
      hero() +
      metrics() +
      decisions() +
      technical() +
      engineering() +
      care() +
      route() +
      '<footer class="ab-foot">' +
        '<span>乘法星球 · 1024 程序员节教育类参赛作品</span>' +
        '<span class="ab-foot-links">' +
          '<button type="button" class="rp-text-btn" data-action="report">学习报告</button>' +
          '<button type="button" class="rp-text-btn" data-action="home">回首页</button>' +
        '</span>' +
      '</footer>' +
    '</section>';
  }

  window.MPAboutView = { view: view };
})();
