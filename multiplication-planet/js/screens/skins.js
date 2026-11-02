(function () {
  'use strict';

  var S = window.MPStore;
  var SKINS = [
    {
      id: 'ocean', name: '蔚蓝星球', world: '潮汐海湾',
      desc: '沿着珊瑚色的浅滩，追一朵慢悠悠的云。蓝色海洋下面，住着一位爱唱歌的朋友。',
      details: ['珊瑚浅滩', '棉花卷云', '极地冰冠'],
      cost: 0, seed: 11, spin: 0.9, pattern: 'continents', spec: 0.32,
      palette: { base: ['#398df1', '#123777'], land: ['#68d6b1', '#27a78c', '#b0ead0'], ice: '#edfaff', atmo: '#6fbfff' }
    },
    {
      id: 'peach', name: '蜜桃汽水', world: '桃桃气泡湾',
      desc: '一颗装满夏天的汽水星球。桃瓣漂在粉色的云里，每颗透明泡泡都藏着一小束阳光。',
      details: ['蜜桃切片', '透明气泡', '果冻云带'],
      cost: 20, seed: 23, spin: 0.7, pattern: 'bubbles', spec: 0.38,
      palette: { base: ['#ffcad6', '#e977a0'], band: ['#fff3dc', '#ffaecb'], atmo: '#ffadc7' }
    },
    {
      id: 'mint', name: '薄荷森林', world: '会呼吸的花园',
      desc: '薄荷色的河流穿过松树林，小花开在树荫下。轻轻靠近，别吵醒叶子里的萤火虫。',
      details: ['层叠松林', '薄荷溪流', '林间小花'],
      cost: 40, seed: 37, spin: 0.25, pattern: 'forest', spec: 0.2,
      palette: { base: ['#56c69b', '#125e4d'], land: ['#b4ebaf', '#62c795', '#d3f7c5'], ice: '#efffe2', atmo: '#86e7ae' }
    },
    {
      id: 'gold', name: '黄金宝藏', world: '金闪闪矿谷',
      desc: '把阳光揉成一颗星球，会是什么样子？琥珀色的山谷里，金色矿脉正闪着悄悄话。',
      details: ['琥珀山谷', '立体矿晶', '闪光金脉'],
      cost: 65, seed: 41, spin: 0.5, pattern: 'craters', spec: 0.58,
      palette: { base: ['#ffd96e', '#c68a20'], deep: '#9b6416', shine: '#fff4c2', atmo: '#ffd278' }
    },
    {
      id: 'candy', name: '糖果漩涡', world: '奶油游乐场',
      desc: '草莓糖和蓝莓奶油，绕着星球转圈圈。再撒一点彩糖针，就是宇宙里最甜的游乐场。',
      details: ['扭扭糖带', '奶油螺旋', '彩色糖针'],
      cost: 90, seed: 59, spin: 0.15, pattern: 'swirl', spec: 0.34,
      palette: { base: ['#d6eaff', '#84b6ea'], band: ['#fa91b4', '#fff5da', '#8bdbe9', '#fdf7ed'], atmo: '#d9b6ff' }
    },
    {
      id: 'violet', name: '紫晶幻境', world: '折光音乐盒',
      desc: '一座可以放进口袋的水晶宫殿。转过一个角度，紫色晶面就会露出另一种光。',
      details: ['通透晶簇', '细碎切面', '虹彩折射'],
      cost: 115, seed: 67, spin: 0.4, pattern: 'crystal', spec: 0.48,
      palette: { base: ['#b3a0ed', '#534492'], facet: ['#957bd8', '#7965b9', '#514084', '#d5c1f2'], atmo: '#c4b0ff' }
    },
    {
      id: 'lava', name: '熔岩星球', world: '暖暖火山岛',
      desc: '黑曜石像一块块巧克力，缝隙里流着发光的岩浆。小火山很温柔，就是偶尔爱打喷嚏。',
      details: ['玄武岩块', '金色裂隙', '发光熔池'],
      cost: 145, seed: 73, spin: 0.3, pattern: 'lava', spec: 0.15,
      palette: { base: ['#482e35', '#191721'], atmo: '#ff9865' }
    },
    {
      id: 'galaxy', name: '星河之眼', world: '星星邮局',
      desc: '把一片晚安星空收进玻璃球。紫色星云后面，星星正在写一封只有你能收到的信。',
      details: ['流动星云', '细密星带', '秘密星座'],
      cost: 175, seed: 89, spin: 0.1, pattern: 'galaxy', spec: 0.24,
      palette: { base: ['#303c78', '#141b3a'], nebula: ['#8874d9', '#d672b2', '#52bbdb'], atmo: '#a9adff' }
    },
    {
      id: 'saturn', name: '环游土星', world: '星环旅行社',
      desc: '戴好奶油色的草帽，带上小卫星出发吧。一艘迷你飞船，正沿着金色光环慢慢旅行。',
      details: ['细腻云带', '冰晶星环', '随行卫星'],
      cost: 210, seed: 97, spin: 0.2, pattern: 'bands', spec: 0.28,
      moon: true, moonColor: '#d3bd92',
      palette: { base: ['#f8dda5', '#b88752'], band: ['#f6e7c9', '#d5b084', '#ebc995', '#af865f'], atmo: '#eed2a2' },
      rings: {
        tilt: -0.26, ratio: 0.32,
        bands: [
          { r: 1.15, w: 0.02, color: '#dac1a0', alpha: 0.6 },
          { r: 1.22, w: 0.065, color: '#eddbbc' },
          { r: 1.3, w: 0.04, color: '#ac8966' },
          { r: 1.36, w: 0.035, color: '#fff0cd' },
          { r: 1.43, w: 0.055, color: '#c6a786' },
          { r: 1.5, w: 0.025, color: '#f1dfbf' }
        ]
      }
    },
    {
      id: 'binary', name: '1024 灯塔', world: '未来信号站',
      desc: '墨绿色舱体上，0 和 1 像小火车一样传递消息。这是到达 1024 号空间站的特别纪念。',
      details: ['金属舱板', '荧光电路', '二进制核心'],
      cost: 0, seed: 1024, spin: 0.1, pattern: 'binary', spec: 0.22, reward: true,
      palette: { base: ['#16392f', '#071813'], dot: '#69e9b2', glow: '#cdffe8', atmo: '#70edb5' }
    }
  ];

  function byId(id) {
    for (var i = 0; i < SKINS.length; i += 1) {
      if (SKINS[i].id === id) return SKINS[i];
    }
    return null;
  }

  function equipped() { return byId(S.get().skin) || SKINS[0]; }
  function unowned() { return SKINS.filter(function (skin) { return !S.ownsSkin(skin.id); }); }
  function ownedCount() { return SKINS.filter(function (skin) { return S.ownsSkin(skin.id); }).length; }
  function nextShopSkin() {
    for (var i = 0; i < SKINS.length; i += 1) {
      if (!SKINS[i].reward && !S.ownsSkin(SKINS[i].id)) return SKINS[i];
    }
    return null;
  }

  window.MPSkins = { list: SKINS, byId: byId, equipped: equipped,
    unowned: unowned, ownedCount: ownedCount, nextShopSkin: nextShopSkin };
})();
