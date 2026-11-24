/* 宋式衣橱目录。形制是常服印象，不是文物复原，也不是戏文角色。 */
(function () {
  var COLORS = [
    { id: 'yue', name: '月白', hex: '#E4DDD0' },
    { id: 'cha', name: '茶褐', hex: '#8C6A45' },
    { id: 'jiang', name: '绛', hex: '#8E3D3A' },
    { id: 'zhe', name: '柘黄', hex: '#C9893A' },
    { id: 'liu', name: '柳', hex: '#6E8A62' },
    { id: 'ou', name: '藕', hex: '#C6A0AE' },
    { id: 'tian', name: '天水', hex: '#6E9A96' },
    { id: 'mo', name: '墨青', hex: '#3C4744' }
  ];

  var SCENES = [
    { id: 'out', name: '出门', note: '出门穿得整齐些就好，颜色没有规定。' },
    { id: 'flower', name: '赏花', note: '赏花可以亮一些，也可以只戴一朵小花。' },
    { id: 'winter', name: '冬日', note: '冬日若要加厚，棉披是单独一层，不是把衣服改个颜色。' },
    { id: 'home', name: '闲居', note: '闲居少穿一件也成。' }
  ];

  var SHIRTS = [
    { id: 'jiaoling', name: '交领衫' },
    { id: 'yuanling', name: '圆领衫' },
    { id: 'zhiling', name: '直领衫' }
  ];

  var BEIZI = [
    { id: 'long', name: '长褙' },
    { id: 'short', name: '短褙' },
    { id: 'none', name: '不着褙' }
  ];

  var SKIRTS = [
    { id: 'pleat', name: '百褶裙' },
    { id: 'xuan', name: '旋裙' },
    { id: 'lan', name: '襴裙' }
  ];

  var HEADS = [
    { id: 'pin', name: '单簪' },
    { id: 'flower', name: '小花' },
    { id: 'wrap', name: '包髻' },
    { id: 'warm', name: '暖额' }
  ];

  var WINTERS = [
    { id: 'off', name: '不加棉披' },
    { id: 'on', name: '加棉披' }
  ];

  var DEFAULT_LOOK = {
    scene: 'out',
    shirt: 'jiaoling',
    shirtColor: 'yue',
    beizi: 'long',
    beiziColor: 'cha',
    skirt: 'pleat',
    skirtColor: 'jiang',
    head: 'pin',
    headColor: 'jiang',
    winter: 'off',
    winterColor: 'mo'
  };

  var DISCLAIMER = '宋式常服的形制灵感，不是出土文物复原，也不是戏文角色。';

  function find(list, id) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function colorHex(id) {
    var item = find(COLORS, id);
    return item ? item.hex : '#E4DDD0';
  }

  function colorName(id) {
    var item = find(COLORS, id);
    return item ? item.name : '月白';
  }

  function shade(hex, amount) {
    var n = parseInt(String(hex).slice(1), 16);
    var r = (n >> 16) & 255;
    var g = (n >> 8) & 255;
    var b = n & 255;
    function ch(v) {
      var x = amount < 0 ? v * (1 + amount) : v + (255 - v) * amount;
      x = Math.round(x);
      if (x < 0) x = 0;
      if (x > 255) x = 255;
      return x;
    }
    function hex2(v) {
      var s = v.toString(16);
      return s.length < 2 ? '0' + s : s;
    }
    if (n !== n) return '#E4DDD0';
    return '#' + hex2(ch(r)) + hex2(ch(g)) + hex2(ch(b));
  }

  function sanitize(raw) {
    var look = {
      scene: DEFAULT_LOOK.scene,
      shirt: DEFAULT_LOOK.shirt,
      shirtColor: DEFAULT_LOOK.shirtColor,
      beizi: DEFAULT_LOOK.beizi,
      beiziColor: DEFAULT_LOOK.beiziColor,
      skirt: DEFAULT_LOOK.skirt,
      skirtColor: DEFAULT_LOOK.skirtColor,
      head: DEFAULT_LOOK.head,
      headColor: DEFAULT_LOOK.headColor,
      winter: DEFAULT_LOOK.winter,
      winterColor: DEFAULT_LOOK.winterColor
    };
    if (!raw || typeof raw !== 'object') return look;
    if (find(SCENES, raw.scene)) look.scene = raw.scene;
    if (find(SHIRTS, raw.shirt)) look.shirt = raw.shirt;
    if (find(BEIZI, raw.beizi)) look.beizi = raw.beizi;
    if (find(SKIRTS, raw.skirt)) look.skirt = raw.skirt;
    if (find(HEADS, raw.head)) look.head = raw.head;
    if (find(WINTERS, raw.winter)) look.winter = raw.winter;
    if (find(COLORS, raw.shirtColor)) look.shirtColor = raw.shirtColor;
    if (find(COLORS, raw.beiziColor)) look.beiziColor = raw.beiziColor;
    if (find(COLORS, raw.skirtColor)) look.skirtColor = raw.skirtColor;
    if (find(COLORS, raw.headColor)) look.headColor = raw.headColor;
    if (find(COLORS, raw.winterColor)) look.winterColor = raw.winterColor;
    return look;
  }

  function pieceName(list, id) {
    var item = find(list, id);
    return item ? item.name : '';
  }

  function describe(look) {
    look = sanitize(look);
    var scene = find(SCENES, look.scene);
    var outerId = look.winter === 'on'
      ? look.winterColor
      : (look.beizi === 'none' ? look.skirtColor : look.beiziColor);
    var cname = colorName(outerId);
    var title = (cname.length === 1 ? cname + '色' : cname) + scene.name;
    var parts = [
      pieceName(SHIRTS, look.shirt),
      pieceName(BEIZI, look.beizi),
      pieceName(SKIRTS, look.skirt),
      pieceName(HEADS, look.head),
      look.winter === 'on' ? '棉披' : '未加棉披'
    ];
    return {
      title: title,
      caption: parts.join(' · '),
      note: scene.note,
      disclaimer: DISCLAIMER
    };
  }

  window.WARDROBE_CATALOG = {
    colors: COLORS,
    scenes: SCENES,
    shirts: SHIRTS,
    beizi: BEIZI,
    skirts: SKIRTS,
    heads: HEADS,
    winters: WINTERS,
    defaultLook: DEFAULT_LOOK,
    disclaimer: DISCLAIMER,
    colorHex: colorHex,
    colorName: colorName,
    shade: shade,
    sanitize: sanitize,
    describe: describe
  };
})();
