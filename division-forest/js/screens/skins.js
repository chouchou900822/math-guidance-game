/* 除法森林 — 十棵大树（相当于乘法星球的十款星球皮肤） */
(function () {
  'use strict';

  var S = window.DFStore;

  var SKINS = [
    {
      id: 'apple', name: '苹果树', world: '苹果小院',
      desc: '红苹果挂满枝头，树干里藏着一扇小圆门。小刺猬每天都来数一数：今天的苹果，够不够大家平均分？',
      details: ['红苹果', '树屋小门', '刺猬邻居'],
      cost: 0, crown: 'round', fruit: 'apple', fruits: 8, resident: 'hedgehog',
      palette: {
        sky: ['#bfe6ff', '#effaff'], sun: '#ffd84d', hill: '#b9e6a2', ground: '#8ed27a', grass: '#4e9e45',
        crown: ['#5ec46c', '#3e9e55'], light: '#a3e692', trunk: '#a0673a', bush: ['#6ccb6a', '#3e9e55'],
        window: '#ffe08a', accent: '#ff5a4a'
      }
    },
    {
      id: 'peach', name: '桃树', world: '猴子山',
      desc: '粉嘟嘟的桃子沉甸甸的，压弯了树枝。小猴说：摘下来的桃子，要和朋友们一个一个平均分。',
      details: ['大蜜桃', '弯弯树枝', '小猴邻居'],
      cost: 20, crown: 'round', fruit: 'peach', fruits: 8, resident: 'monkey',
      palette: {
        sky: ['#ffe3d8', '#fff7ef'], sun: '#ffbf6b', hill: '#c8e8a6', ground: '#9ad67e', grass: '#5aa64a',
        crown: ['#86d57c', '#59b35f'], light: '#c2f0a8', trunk: '#9b6236', bush: ['#7fd27a', '#4f9f55'],
        window: '#ffe08a', accent: '#ff8f7a'
      }
    },
    {
      id: 'sakura', name: '樱花树', world: '樱花谷',
      desc: '整棵树开成了一朵粉色的云。风一吹，花瓣像小雨一样落下来，小兔子竖起耳朵去接。',
      details: ['樱花云', '花瓣小雨', '小兔邻居'],
      cost: 40, crown: 'round', fruit: 'blossom', fruits: 12, resident: 'rabbit', drift: 'petal',
      palette: {
        sky: ['#dcefff', '#fff3f9'], sun: '#ffe27a', hill: '#cdeab8', ground: '#a8dc8c', grass: '#62ad55',
        crown: ['#ffb8d0', '#f28db3'], light: '#ffe0ec', trunk: '#7d4f3a', bush: ['#9ad98a', '#5aa860'],
        window: '#ffe08a', accent: '#f28db3'
      }
    },
    {
      id: 'orange', name: '橘子树', world: '橘子坡',
      desc: '金灿灿的橘子圆滚滚，一个比一个香。小狐狸最会分橘子：先数一数，再平均分成几份。',
      details: ['圆橘子', '深绿树冠', '狐狸邻居'],
      cost: 65, crown: 'round', fruit: 'orange', fruits: 8, resident: 'fox',
      palette: {
        sky: ['#ffe9b8', '#fff9ea'], sun: '#ffae3c', hill: '#cfe7a0', ground: '#9fd277', grass: '#5c9f45',
        crown: ['#3fae5f', '#2a8a49'], light: '#7fd282', trunk: '#8f5a32', bush: ['#5cbf63', '#2f8a4a'],
        window: '#ffd56a', accent: '#ff9a1f'
      }
    },
    {
      id: 'pine', name: '松树', world: '松鼠岭',
      desc: '三层尖尖的绿帽子，挂着一颗颗松果。小松鼠在树洞里存了好多，它正在算：每天吃几颗？',
      details: ['三层树冠', '挂满松果', '松鼠邻居'],
      cost: 90, crown: 'pine', fruit: 'pinecone', fruits: 6, resident: 'squirrel',
      palette: {
        sky: ['#cdeefa', '#f1fbff'], sun: '#ffd84d', hill: '#a9dca0', ground: '#86c976', grass: '#3f8f4a',
        crown: ['#2f9e6a', '#1f7a50'], light: '#64c891', trunk: '#8a5532', bush: ['#4bb070', '#257a4e'],
        window: '#ffe08a', accent: '#2f9e6a'
      }
    },
    {
      id: 'palm', name: '椰子树', world: '椰子岛',
      desc: '海风吹着大叶子沙沙响，椰子挂在最高处。蓝色小鸟站在树下，等着帮大家分椰子。',
      details: ['大叶子', '圆椰子', '小鸟邻居'],
      cost: 115, crown: 'palm', fruit: 'coconut', fruits: 3, resident: 'bird', sea: '#4cb8e4',
      palette: {
        sky: ['#a6e2ff', '#e9f9ff'], sun: '#ffd84d', hill: '#7fd3ef', ground: '#f4dc9a', grass: '#c9a35a',
        crown: ['#4cc06a', '#2e9a50'], light: '#8ee39a', trunk: '#b07a45', bush: ['#58c06e', '#2e9a50'],
        window: '#ffe08a', accent: '#4cb8e4'
      }
    },
    {
      id: 'maple', name: '枫树', world: '枫叶林',
      desc: '秋天来了，整棵树都变成了火红色。小熊捡了一大堆枫叶，想平均分给每位朋友当书签。',
      details: ['火红树冠', '飘落枫叶', '小熊邻居'],
      cost: 145, crown: 'round', fruit: 'mapleleaf', fruits: 7, resident: 'bear', drift: 'maple',
      palette: {
        sky: ['#ffe7cc', '#fff8ee'], sun: '#ffb84a', hill: '#e9cf8f', ground: '#d9b46a', grass: '#a8823c',
        crown: ['#ff8a3d', '#e0602a'], light: '#ffc06b', trunk: '#7f4b2c', bush: ['#f0a04a', '#c9702c'],
        window: '#ffe08a', accent: '#ff6a3d'
      }
    },
    {
      id: 'snow', name: '雪松', world: '雪松屋',
      desc: '雪落在三层树冠上，像戴了白帽子。小鹿在雪地里留下一串脚印，树屋的窗户亮着暖暖的灯。',
      details: ['白雪帽子', '红浆果', '小鹿邻居'],
      cost: 175, crown: 'pine', snow: true, fruit: 'berry', fruits: 5, resident: 'deer', drift: 'snow',
      palette: {
        sky: ['#d4e6f4', '#f4f9fd'], sun: '#fff2c2', hill: '#e2edf6', ground: '#f7fbff', grass: '#b9cddd',
        crown: ['#2c8a68', '#1c6a4f'], light: '#57b08a', trunk: '#7d4f34', bush: ['#e9f2f9', '#c3d6e6'],
        window: '#ffd56a', accent: '#7fb2d9'
      }
    },
    {
      id: 'firefly', name: '萤火树', world: '萤火森林',
      desc: '天黑了，萤火虫一盏一盏亮起来，挂满了整棵树。熊猫抱着竹笋，正在数今晚来了多少只。',
      details: ['夜晚星空', '萤火小灯', '熊猫邻居'],
      cost: 210, crown: 'round', night: true, fruit: 'lantern', fruits: 9, resident: 'panda', drift: 'firefly',
      palette: {
        sky: ['#16224a', '#33427a'], sun: '#fff2b8', hill: '#2b5a4a', ground: '#3b7752', grass: '#2a5a3e',
        crown: ['#2f8f6b', '#1d6650'], light: '#4fb98a', trunk: '#6e4630', bush: ['#2f8059', '#1d5b42'],
        window: '#ffd23f', accent: '#ffd23f'
      }
    },
    {
      id: 'gold', name: '丰收金树', world: '1024 丰收节',
      desc: '1024 颗松果分完的那天，森林里长出了这棵金色的树。它只送给通关「1024 丰收节」的孩子。',
      details: ['金色树冠', '1024 木牌', '丰收果篮'],
      cost: 0, reward: true, crown: 'round', fruit: 'goldapple', fruits: 8, resident: null, basket: true,
      sign: '1024', drift: 'spark',
      palette: {
        sky: ['#fff0c4', '#fffaf0'], sun: '#ffcf3f', hill: '#e8dc9a', ground: '#cfe08a', grass: '#93a945',
        crown: ['#ffd23f', '#eda400'], light: '#fff0a6', trunk: '#9b6236', bush: ['#ffd23f', '#eda400'],
        window: '#fff6c8', accent: '#eda400'
      }
    }
  ];

  function byId(id) {
    for (var i = 0; i < SKINS.length; i += 1) {
      if (SKINS[i].id === id) return SKINS[i];
    }
    return null;
  }

  function equipped() {
    return byId(S.get().skin) || SKINS[0];
  }

  function ownedCount() {
    return SKINS.filter(function (skin) { return S.ownsSkin(skin.id); }).length;
  }

  /* 结算页的小提示：下一棵可以用松果换的大树 */
  function nextShopSkin() {
    var rest = SKINS.filter(function (skin) {
      return !skin.reward && skin.cost > 0 && !S.ownsSkin(skin.id);
    });
    rest.sort(function (a, b) { return a.cost - b.cost; });
    return rest[0] || null;
  }

  window.DFSkins = {
    list: SKINS,
    byId: byId,
    equipped: equipped,
    ownedCount: ownedCount,
    nextShopSkin: nextShopSkin
  };
})();
