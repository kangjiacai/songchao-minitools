(function () {
  /* 题目都是情境选择，不编造史实或诗句。
   * 题材对应账号已做过的生活门类：点茶、簪花/装束、古琴、女红、出门、读书、节日。 */

  var MOTIFS = window.SCG_MOTIFS || {};

  var TYPES = [
    {
      id: 'cha',
      name: '点茶娘子',
      brief: '你最自在的时刻，是茶筅在盏里转出一圈汤花。',
      desc: '你最自在的时刻，是茶筅在盏里转出一圈汤花。不急着喝，先把这盏茶点稳，再把下午慢慢展开。',
      colors: { wash: '#A0BEBE', deep: '#3D5A5A', accent: '#7A9A9A' }
    },
    {
      id: 'hua',
      name: '簪花才女',
      brief: '你看花，也把自己当作可以入画的一枝。',
      desc: '你看花，也把自己当作可以入画的一枝。发髻、花冠和时花，都是出门前会再看一眼的事。',
      colors: { wash: '#C996A0', deep: '#8A4A58', accent: '#D4A8B0' }
    },
    {
      id: 'qin',
      name: '琴棋闺秀',
      brief: '你习惯先把心安下来，再让周围的事有次序。',
      desc: '你习惯先把心安下来。弦音准了，身边的事也就慢慢有了次序，不必事事赶着往前。',
      colors: { wash: '#8A96A0', deep: '#3E4852', accent: '#6A7680' }
    },
    {
      id: 'xiu',
      name: '针线巧手',
      brief: '你信任手里的工夫，一根线走完便有着落。',
      desc: '你信任手里的工夫。一根线走完，一块绣面就有了着落。细的事情，你也愿意把它做完整。',
      colors: { wash: '#D6BEA0', deep: '#8A6A4A', accent: '#C4A070' }
    },
    {
      id: 'you',
      name: '闲游看客',
      brief: '你愿意出门去看，风景总比坐着空想有意思。',
      desc: '你愿意出门去看。灯市、街巷、檐子里晃过的风景，都比坐着空想有意思。',
      colors: { wash: '#B5C4A0', deep: '#4A5A3A', accent: '#8FA076' }
    },
    {
      id: 'shu',
      name: '书窗诗人',
      brief: '你和文字处得近，一卷在案，半日就很完整。',
      desc: '你和文字处得近。一卷在案，半日就可以过得很完整。看见喜欢的句子，也愿意先记下再离开。',
      colors: { wash: '#C4B49A', deep: '#5A4A3A', accent: '#8B7355' }
    }
  ];

  var QUESTIONS = [
    {
      id: 'q1',
      text: '天气刚好的下午，你更想先做哪一件？',
      options: [
        { text: '坐下来点一盏茶，看汤花慢慢聚起', type: 'cha' },
        { text: '对着镜子，簪一枝新鲜的花', type: 'hua' },
        { text: '打开琴囊，先把弦调准', type: 'qin' },
        { text: '翻开案上那卷还没读完的书', type: 'shu' }
      ]
    },
    {
      id: 'q2',
      text: '若是要出门，你第一件会确认的是？',
      options: [
        { text: '檐子备好了没有，盖头是否妥帖', type: 'you' },
        { text: '发髻稳不稳，花冠歪没歪', type: 'hua' },
        { text: '出门前再点一盏茶，不着急走', type: 'cha' },
        { text: '衣上的绣纹有没有勾住线头', type: 'xiu' }
      ]
    },
    {
      id: 'q3',
      text: '案上如果只留一样，你会留下？',
      options: [
        { text: '一套茶盏和茶筅', type: 'cha' },
        { text: '一张常弹的古琴', type: 'qin' },
        { text: '一卷还想再读的书', type: 'shu' },
        { text: '一只未收工的绣绷', type: 'xiu' }
      ]
    },
    {
      id: 'q4',
      text: '节日的夜里，你更想？',
      options: [
        { text: '去灯市走走，看一看热闹', type: 'you' },
        { text: '在鬓边戴一枚时新的饰物', type: 'hua' },
        { text: '留在家里，为来客点茶', type: 'cha' },
        { text: '把今夜记下几笔，收进本子里', type: 'shu' }
      ]
    },
    {
      id: 'q5',
      text: '听见远处有人弹琴，你会？',
      options: [
        { text: '找个安静处，把这一曲听完', type: 'qin' },
        { text: '听着琴声，继续手里的针线', type: 'xiu' },
        { text: '想着哪一句可以写进今天的笔记', type: 'shu' },
        { text: '顺着声音走过去，看看是谁在弹', type: 'you' }
      ]
    },
    {
      id: 'q6',
      text: '更衣的时候，你更在意？',
      options: [
        { text: '褙子和旋裙的颜色是否相配', type: 'hua' },
        { text: '走动起来方不方便', type: 'you' },
        { text: '衣上的针脚是否平顺', type: 'xiu' },
        { text: '袖口会不会碰到茶盏', type: 'cha' }
      ]
    },
    {
      id: 'q7',
      text: '一天要结束时，你通常会？',
      options: [
        { text: '再添一盏晚茶，把白天慢慢收住', type: 'cha' },
        { text: '把花换一换水，免得明早凋了', type: 'hua' },
        { text: '把琴收进囊里，弦松一松', type: 'qin' },
        { text: '把没做完的女红叠好，明天再续', type: 'xiu' }
      ]
    }
  ];

  var LABELS = ['甲', '乙', '丙', '丁'];

  function typeById(id) {
    for (var i = 0; i < TYPES.length; i++) {
      if (TYPES[i].id === id) return TYPES[i];
    }
    return TYPES[0];
  }

  function scoreAnswers(picks) {
    var tallies = {};
    var lastHit = {};
    var i;
    for (i = 0; i < TYPES.length; i++) tallies[TYPES[i].id] = 0;
    for (i = 0; i < picks.length; i++) {
      var id = picks[i];
      if (!id || typeof tallies[id] !== 'number') continue;
      tallies[id] += 1;
      lastHit[id] = i;
    }
    var best = TYPES[0].id;
    var bestScore = -1;
    var bestLast = -1;
    for (i = 0; i < TYPES.length; i++) {
      var tid = TYPES[i].id;
      var n = tallies[tid];
      var last = typeof lastHit[tid] === 'number' ? lastHit[tid] : -1;
      if (n > bestScore || (n === bestScore && last > bestLast)) {
        best = tid;
        bestScore = n;
        bestLast = last;
      }
    }
    return { id: best, tallies: tallies };
  }

  window.SCG_DATA = {
    TYPES: TYPES,
    QUESTIONS: QUESTIONS,
    LABELS: LABELS,
    MOTIFS: MOTIFS,
    typeById: typeById,
    scoreAnswers: scoreAnswers
  };
})();
