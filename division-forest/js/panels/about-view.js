/* 除法森林 — 关于这个作品 */
(function () {
  'use strict';

  var UI = window.DFUI;

  var METRICS = [
    { num: '9', label: '张除法表' },
    { num: '81', label: '道表内除法' },
    { num: '16', label: '枚奖章' },
    { num: '10', label: '棵可收集的大树' },
    { num: '0', label: '个外部依赖' }
  ];

  var DECISIONS = [
    {
      tag: '01 · 先动手',
      title: '平均分，而不是背答案',
      text: '12 ÷ 3 不是一句要背的话，而是把 12 个桃子一轮一轮分给 3 只小猴。分完数一数每只几个，再回到口诀「三四十二」，商就有了来处。'
    },
    {
      tag: '02 · 接得上',
      title: '一句口诀，两道除法',
      text: '除法不另起炉灶：求商用的就是乘法口诀。「三四十二」既能算 12 ÷ 3，也能算 12 ÷ 4；每道题的反馈都会把这句口诀说出来，和《乘法星球》无缝衔接。'
    },
    {
      tag: '03 · 有终点',
      title: '1024 → 1，终点是真数学',
      text: '九张表全部三星后，第 10 个目的地开放：1024 丰收节。10 道题只做一件事 —— 对半分。1024 ÷ 2¹⁰ = 1，正好和乘法星球的 2¹⁰ = 1024 首尾相接；每日挑战用当天日期当随机种子，同一天谁打开都是同一套题。'
    }
  ];

  var STEPS = [
    {
      num: '01',
      title: '积木',
      text: '9 只小动物、15 种果子都是几行 SVG：圆、椭圆、一条路径，统一的墨线描边和腮红。'
    },
    {
      num: '02',
      title: '参数',
      text: '每棵树只是一组参数：配色、树冠形状、果子、邻居、季节。圆冠、三层松、椰子叶三种骨架拼出 10 个场景。'
    },
    {
      num: '03',
      title: '复用',
      text: '学习页一次要摆 81 个果子：先定义一个 <symbol>，再用 <use> 引用，DOM 小，切换也快。'
    },
    {
      num: '04',
      title: '动起来',
      text: '摇摆、掉果子、花瓣雨、萤火虫排成「÷」都只用 CSS 动画；减少动态效果的系统设置下全部关闭。'
    }
  ];

  var FILE_MAP = [
    ['js/data/', '除法题目、存档、统计与每日题目'],
    ['js/forest/', 'SVG 小动物、十棵大树与彩蛋'],
    ['js/screens/', '首页、平均分学习、闯关、苗圃、奖章墙'],
    ['js/panels/', '1024 丰收节、家长报告、本页'],
    ['js/base/', '音效与界面工具'],
    ['js/app.js · app-actions.js', '路由、状态与动作表'],
    ['index.html · css/*.css', '语义结构、纸感版式与响应式']
  ];

  var A11Y = [
    '键盘 1–4 直接选答案，Tab 可达所有按钮，焦点有 3px 高对比外框',
    '对错不只靠颜色：正确项有绿色硬投影，反馈区同时给出文字、整道除法与口诀',
    'aria-live 播报答题反馈和分果子的进度，aria-pressed 标记声音与选项状态',
    'prefers-reduced-motion 下关闭摇摆、飘落、撒花与分果子动画',
    '正文与纸面底色满足 WCAG AA 对比度，字号随视口缩放',
    '语音是辅助通道，不是唯一通道；所有内容都能看、能读'
  ];

  var PRIVACY = [
    '不注册、不登录、不采集，没有账号系统',
    '只用 1 个 localStorage 键保存进度与学习统计',
    '演示模式只在内存生效，退出后一个字节都不写入',
    '无广告、无内购、无第三方脚本、无埋点',
    '报告页可一键清空学习记录，松果和大树不受影响'
  ];

  function heroArt() {
    var skin = window.DFSkins.equipped();
    return '<div class="ab-hero-art">' +
      '<span class="ab-orbit ab-orbit-a" aria-hidden="true"><i></i></span>' +
      '<span class="ab-orbit ab-orbit-b" aria-hidden="true"></span>' +
      '<div class="ab-canvas tree-stage" id="about-tree" tabindex="0" role="button" aria-label="' +
        skin.name + '：轻点摇果子，长按唤醒彩蛋">' + window.DFEgg.stage(skin) + '</div>' +
      '<span class="ab-art-tag" aria-hidden="true">1024 ÷ 2<sup>10</sup> = 1</span>' +
      '<span class="ab-art-note" aria-hidden="true">纯 SVG 拼成 · 0 张图片</span>' +
    '</div>';
  }

  function hero() {
    return '<header class="ab-hero">' +
      '<div class="ab-hero-copy">' +
        '<span class="eyebrow"><span class="dot"></span>「乘法星球」姊妹篇 · 教育类作品</span>' +
        '<h1 class="ab-title">用代码，<br>把除法变成<br><em>一场平均分</em></h1>' +
        '<p class="ab-lede">「除法森林」是一个给 6–9 岁孩子的表内除法网站。它把 9 张除法表做成 9 家小动物，' +
          '让孩子先动手把果子平均分，再用乘法口诀求商；攒下的松果能种 10 棵大树，最后用 10 次对半分，从 1024 走到 1。' +
          '没有账号、没有后端、没有第三方依赖。</p>' +
        '<div class="ab-tags">' +
          '<span>原生 JavaScript</span><span>SVG</span><span>零依赖</span><span>零后端</span>' +
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
    return '<pre class="ab-code"><code><span class="ab-c">// 一团树冠：先画加粗描边，再盖一层填色</span>\n' +
      '<span class="ab-c">// 叶团之间的描边被盖住，只留下外轮廓</span>\n' +
      'function blob(circles, base, shade) {\n' +
      '  var out = circles.map(function (c) {\n' +
      '    return circ(c, shade, ink(8));\n' +
      '  }).join(\'\');\n' +
      '  out += circles.map(function (c) {\n' +
      '    return circ(c, shade);\n' +
      '  }).join(\'\');\n' +
      '  <span class="ab-c">// 亮色往上挪 5，底边自然留出一圈阴影</span>\n' +
      '  return out + circles.map(function (c) {\n' +
      '    return circ(lift(c, 5), base);\n' +
      '  }).join(\'\');\n' +
      '}</code></pre>';
  }

  function technical() {
    return '<section class="ab-dark">' +
      '<div class="ab-dark-head">' +
        '<span class="ab-live"><i></i>SVG FOREST</span>' +
        '<h2>一座树屋，是用圆和线拼出来的</h2>' +
        '<p>没有图片文件，没有绘图库。小动物、果子和十棵大树都是按参数拼出来的 SVG；' +
          '动画只用 CSS，换一棵大树，就是换一组参数。</p>' +
      '</div>' +
      '<ol class="ab-steps">' + STEPS.map(function (s) {
        return '<li><b>' + s.num + ' ' + s.title + '</b><span>' + s.text + '</span></li>';
      }).join('') + '</ol>' +
      codeBlock() +
      '<div class="ab-bench">' +
        '<div class="ab-bench-copy">' +
          '<b>在这台设备上实测</b>' +
          '<span>生成并渲染全部 10 棵大树的 SVG，重复 5 轮取平均</span>' +
        '</div>' +
        '<button type="button" class="btn ab-bench-btn" data-action="bench">开始测量</button>' +
        '<output class="ab-bench-out" id="bench-out">点按钮，在你的设备上测一次</output>' +
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
          '<div class="ab-spec-row"><span>图片资源</span><b>0 张 · 全部是 SVG 代码</b></div>' +
          '<div class="ab-spec-row"><span>题目生成</span><b>5 种题型 · 每日按日期固定</b></div>' +
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
      ['首页', '树屋小院、今日挑战、9 家小动物'],
      ['点开 ÷3', '动手平均分 + 想口诀，看懂除法'],
      ['开始闯关', '10 题、5 种题型，星星和松果入账'],
      ['奖章与 1024', '16 枚奖章、10 棵大树、终局丰收节']
    ];
    return '<section class="ab-route">' +
      '<div class="ab-route-copy">' +
        '<span class="ab-kicker">快速体验</span>' +
        '<h2>30 秒看完全部</h2>' +
        '<p>不想先攒 860 颗松果？打开 <code>?demo=1</code>，全部大树与终局关卡直接解锁，试玩不会写入任何数据。</p>' +
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
        '<button type="button" class="back-btn" data-action="home">' + UI.icon('back', 15) + '回森林</button>' +
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
        '<span>除法森林 · 「乘法星球」的姊妹篇</span>' +
        '<span class="ab-foot-links">' +
          '<button type="button" class="rp-text-btn" data-action="report">学习报告</button>' +
          '<a class="rp-text-btn" href="../multiplication-planet/index.html">去乘法星球</a>' +
          '<button type="button" class="rp-text-btn" data-action="home">回首页</button>' +
        '</span>' +
      '</footer>' +
    '</section>';
  }

  window.DFAboutView = { view: view };
})();
