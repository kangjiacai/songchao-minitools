/* 从 apps/songci-color/pkg/js/data.js 摘出的词与四色。
   只读复用，不改旧工具。署名以那份名录为准。
   排除庭院深深、月上柳梢头、岳飞满江红；这份名录里本来没有这几句。 */
(function () {
  var CI = [
    {
      id: 'lqz-lufei',
      poet: '李清照',
      tune: '如梦令',
      line: '知否，知否？应是绿肥红瘦。',
      colors: [{ name: '海棠红', hex: '#D98C8C' }, { name: '新叶绿', hex: '#8FB08A' }, { name: '雨后白', hex: '#EEF0EA' }, { name: '卷帘灰', hex: '#9EA3A0' }]
    },
    {
      id: 'lqz-huanghua',
      poet: '李清照',
      tune: '醉花阴',
      line: '帘卷西风，人比黄花瘦。',
      colors: [{ name: '黄花', hex: '#E1C27A' }, { name: '薄雾', hex: '#D8DCDC' }, { name: '金兽', hex: '#B08D57' }, { name: '瑞脑烟', hex: '#8C8A92' }]
    },
    {
      id: 'lqz-ouhua',
      poet: '李清照',
      tune: '如梦令',
      line: '兴尽晚回舟，误入藕花深处。',
      colors: [{ name: '藕花', hex: '#D48A9A' }, { name: '荷叶', hex: '#5A8A6A' }, { name: '湖水', hex: '#7AA0A8' }, { name: '晚舟褐', hex: '#8A6E58' }]
    },
    {
      id: 'lqz-meitou',
      poet: '李清照',
      tune: '一剪梅',
      line: '此情无计可消除，才下眉头，却上心头。',
      colors: [{ name: '眉黛', hex: '#3A4450' }, { name: '额黄', hex: '#E2C88A' }, { name: '胭痕', hex: '#C47A80' }, { name: '素衫', hex: '#E8E2D6' }]
    },
    {
      id: 'lqz-xiangsi',
      poet: '李清照',
      tune: '一剪梅',
      line: '花自飘零水自流。一种相思，两处闲愁。',
      colors: [{ name: '飘零红', hex: '#C97A78' }, { name: '流水', hex: '#7A9BAA' }, { name: '闲云', hex: '#D4D0C8' }, { name: '青笺', hex: '#8AA090' }]
    },
    {
      id: 'lqz-xunxun',
      poet: '李清照',
      tune: '声声慢',
      line: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。',
      colors: [{ name: '冷灰', hex: '#A8A49C' }, { name: '梧桐雨', hex: '#6A7A82' }, { name: '残灯', hex: '#C4A070' }, { name: '黄昏褐', hex: '#7A6558' }]
    },
    {
      id: 'lqz-rongjin',
      poet: '李清照',
      tune: '永遇乐',
      line: '落日熔金，暮云合璧。',
      colors: [{ name: '熔金', hex: '#E0A84A' }, { name: '暮云', hex: '#8A8EA0' }, { name: '合璧', hex: '#E8DCC0' }, { name: '晚空紫', hex: '#5A4A62' }]
    },
    {
      id: 'ss-chanjuan',
      poet: '苏轼',
      tune: '水调歌头',
      line: '但愿人长久，千里共婵娟。',
      colors: [{ name: '月华', hex: '#F0E6C8' }, { name: '青天', hex: '#5B7A9A' }, { name: '酒金', hex: '#C9A25A' }, { name: '夜幕', hex: '#2C3348' }]
    },
    {
      id: 'ss-mingyue',
      poet: '苏轼',
      tune: '水调歌头',
      line: '明月几时有，把酒问青天。',
      colors: [{ name: '桂魄', hex: '#E8D8A8' }, { name: '青冥', hex: '#3E5A78' }, { name: '把酒', hex: '#C48A48' }, { name: '栏霜', hex: '#D0D4D6' }]
    },
    {
      id: 'ss-yanyu',
      poet: '苏轼',
      tune: '定风波',
      line: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。',
      colors: [{ name: '蓑衣褐', hex: '#8B7355' }, { name: '烟雨', hex: '#9AABA8' }, { name: '竹青', hex: '#5A7A62' }, { name: '芒鞋', hex: '#C4B08A' }]
    },
    {
      id: 'ss-wuqing',
      poet: '苏轼',
      tune: '定风波',
      line: '回首向来萧瑟处，归去，也无风雨也无晴。',
      colors: [{ name: '雨青', hex: '#7A8B90' }, { name: '晴黄', hex: '#E2D09A' }, { name: '萧瑟灰', hex: '#9A948C' }, { name: '归途褐', hex: '#6E5A48' }]
    },
    {
      id: 'ss-mangmang',
      poet: '苏轼',
      tune: '江城子',
      line: '十年生死两茫茫。不思量，自难忘。',
      colors: [{ name: '烛泪', hex: '#E8D8C0' }, { name: '夜松', hex: '#4A5A48' }, { name: '素月', hex: '#E6E0C8' }, { name: '茫茫灰', hex: '#8A8C90' }]
    },
    {
      id: 'ss-caocao',
      poet: '苏轼',
      tune: '蝶恋花',
      line: '枝上柳绵吹又少，天涯何处无芳草。',
      colors: [{ name: '柳绵', hex: '#E8E2D0' }, { name: '芳草', hex: '#7A9A62' }, { name: '墙红', hex: '#C47A6A' }, { name: '天涯蓝', hex: '#6A82A0' }]
    },
    {
      id: 'ss-shazhou',
      poet: '苏轼',
      tune: '卜算子',
      line: '拣尽寒枝不肯栖，寂寞沙洲冷。',
      colors: [{ name: '缺月', hex: '#E8DCC0' }, { name: '疏桐', hex: '#5A6A58' }, { name: '沙洲', hex: '#C8BCA0' }, { name: '寒水', hex: '#7A8C96' }]
    },
    {
      id: 'ys-wunaihe',
      poet: '晏殊',
      tune: '浣溪沙',
      line: '无可奈何花落去，似曾相识燕归来。',
      colors: [{ name: '落花胭', hex: '#D4A0A0' }, { name: '燕羽', hex: '#4A5560' }, { name: '旧苔', hex: '#8A9A7A' }, { name: '庭阶石', hex: '#C4C0B6' }]
    },
    {
      id: 'ys-xinci',
      poet: '晏殊',
      tune: '浣溪沙',
      line: '一曲新词酒一杯，去年天气旧亭台。',
      colors: [{ name: '酒渌', hex: '#C9B06A' }, { name: '旧台灰', hex: '#B8B0A4' }, { name: '新词墨', hex: '#3E4852' }, { name: '花影粉', hex: '#E4C8C4' }]
    },
    {
      id: 'ys-shangchun',
      poet: '晏殊',
      tune: '浣溪沙',
      line: '满目山河空念远，落花风雨更伤春。',
      colors: [{ name: '风雨青', hex: '#6A7A80' }, { name: '落花', hex: '#D4A098' }, { name: '远黛', hex: '#5A6A78' }, { name: '伤春褐', hex: '#8A6E62' }]
    },
    {
      id: 'yjd-shuangfei',
      poet: '晏几道',
      tune: '临江仙',
      line: '落花人独立，微雨燕双飞。',
      colors: [{ name: '落花', hex: '#E8C3C1' }, { name: '微雨', hex: '#B9C0C2' }, { name: '燕羽黛', hex: '#3F4752' }, { name: '春衫绿', hex: '#D3DDC8' }]
    },
    {
      id: 'yjd-caiyun',
      poet: '晏几道',
      tune: '临江仙',
      line: '当时明月在，曾照彩云归。',
      colors: [{ name: '当时月', hex: '#EDE6CC' }, { name: '彩云', hex: '#E0B4A8' }, { name: '楼头青', hex: '#5A7080' }, { name: '夜空', hex: '#3A4254' }]
    },
    {
      id: 'yjd-yinjgang',
      poet: '晏几道',
      tune: '鹧鸪天',
      line: '今宵剩把银釭照，犹恐相逢是梦中。',
      colors: [{ name: '银釭', hex: '#D8D2C4' }, { name: '烛金', hex: '#E0B86A' }, { name: '梦影粉', hex: '#E0C8C8' }, { name: '夜褐', hex: '#4A4450' }]
    },
    {
      id: 'yjd-wudi',
      poet: '晏几道',
      tune: '鹧鸪天',
      line: '舞低杨柳楼心月，歌尽桃花扇底风。',
      colors: [{ name: '杨柳', hex: '#7A9A78' }, { name: '楼月', hex: '#E8D9A8' }, { name: '桃花扇', hex: '#E0A0A0' }, { name: '舞衫', hex: '#C4B090' }]
    },
    {
      id: 'yjd-loutai',
      poet: '晏几道',
      tune: '临江仙',
      line: '梦后楼台高锁，酒醒帘幕低垂。',
      colors: [{ name: '楼台灰', hex: '#8A8680' }, { name: '帘幕', hex: '#C8B8A8' }, { name: '残酒', hex: '#B88A58' }, { name: '锁铜', hex: '#8A7A58' }]
    },
    {
      id: 'qg-siyu',
      poet: '秦观',
      tune: '浣溪沙',
      line: '自在飞花轻似梦，无边丝雨细如愁。',
      colors: [{ name: '飞花粉', hex: '#E9CFCF' }, { name: '丝雨灰', hex: '#B8C0C4' }, { name: '宝帘银', hex: '#D9D6CF' }, { name: '小楼青', hex: '#6F8A8C' }]
    },
    {
      id: 'qg-jinfeng',
      poet: '秦观',
      tune: '鹊桥仙',
      line: '金风玉露一相逢，便胜却人间无数。',
      colors: [{ name: '金风', hex: '#C9A24A' }, { name: '玉露', hex: '#E4E8E4' }, { name: '鹊桥褐', hex: '#8A6A50' }, { name: '星汉', hex: '#3A4A6A' }]
    },
    {
      id: 'qg-changshi',
      poet: '秦观',
      tune: '鹊桥仙',
      line: '两情若是久长时，又岂在朝朝暮暮。',
      colors: [{ name: '银河淡', hex: '#B8C0D0' }, { name: '暮紫', hex: '#6A4A62' }, { name: '朝霞', hex: '#E0A080' }, { name: '长天', hex: '#7A90A8' }]
    },
    {
      id: 'qg-wushi',
      poet: '秦观',
      tune: '踏莎行',
      line: '雾失楼台，月迷津渡。',
      colors: [{ name: '雾灰', hex: '#C0C4C4' }, { name: '迷月', hex: '#D8D4C4' }, { name: '桃源绿', hex: '#8AAA90' }, { name: '津渡褐', hex: '#7A6A58' }]
    },
    {
      id: 'qg-weiyun',
      poet: '秦观',
      tune: '满庭芳',
      line: '山抹微云，天粘衰草。',
      colors: [{ name: '微云', hex: '#D8D4CC' }, { name: '衰草', hex: '#C4A86A' }, { name: '抹山黛', hex: '#5A6A70' }, { name: '画角暮', hex: '#8A5A4A' }]
    },
    {
      id: 'xqc-eersx',
      poet: '辛弃疾',
      tune: '青玉案·元夕',
      line: '蛾儿雪柳黄金缕，笑语盈盈暗香去。',
      colors: [{ name: '元夕蓝', hex: '#2E3A55' }, { name: '灯火橘', hex: '#E3A35C' }, { name: '雪柳白', hex: '#F1EEE6' }, { name: '黄金缕', hex: '#C9A45C' }]
    },
    {
      id: 'xqc-lanshan',
      poet: '辛弃疾',
      tune: '青玉案·元夕',
      line: '众里寻他千百度。蓦然回首，那人却在，灯火阑珊处。',
      colors: [{ name: '灯火', hex: '#E0A04A' }, { name: '阑珊暗', hex: '#2A2E3A' }, { name: '夜紫', hex: '#4A3A52' }, { name: '衣香白', hex: '#E8E0D4' }]
    },
    {
      id: 'xqc-dongfeng',
      poet: '辛弃疾',
      tune: '青玉案·元夕',
      line: '东风夜放花千树。更吹落、星如雨。',
      colors: [{ name: '夜空', hex: '#1F2A44' }, { name: '花树金', hex: '#E8C46A' }, { name: '星雨', hex: '#F0E0B0' }, { name: '东风气', hex: '#7A8CA0' }]
    },
    {
      id: 'xqc-daohua',
      poet: '辛弃疾',
      tune: '西江月·夜行黄沙道中',
      line: '稻花香里说丰年。听取蛙声一片。',
      colors: [{ name: '稻花', hex: '#E8E0B8' }, { name: '稻叶', hex: '#7A9A58' }, { name: '蛙夜青', hex: '#4A6A62' }, { name: '黄沙道', hex: '#C4B48A' }]
    },
    {
      id: 'xqc-xingyu',
      poet: '辛弃疾',
      tune: '西江月·夜行黄沙道中',
      line: '七八个星天外，两三点雨山前。',
      colors: [{ name: '星银', hex: '#E8E4D4' }, { name: '天外墨', hex: '#2C3448' }, { name: '山前雨', hex: '#8A9AA0' }, { name: '茅店褐', hex: '#8A6A50' }]
    },
    {
      id: 'xqc-lianpeng',
      poet: '辛弃疾',
      tune: '清平乐·村居',
      line: '最喜小儿亡赖，溪头卧剥莲蓬。',
      colors: [{ name: '莲蓬绿', hex: '#6A8A58' }, { name: '溪水', hex: '#7AA4A8' }, { name: '小儿衫', hex: '#E8D0A8' }, { name: '岸草', hex: '#A8B882' }]
    },
    {
      id: 'jk-lengyue',
      poet: '姜夔',
      tune: '扬州慢',
      line: '二十四桥仍在，波心荡、冷月无声。',
      colors: [{ name: '冷月', hex: '#D4D8D8' }, { name: '波心', hex: '#5A7A88' }, { name: '桥石', hex: '#8A8880' }, { name: '无声青', hex: '#3A4A52' }]
    },
    {
      id: 'jk-qingku',
      poet: '姜夔',
      tune: '点绛唇',
      line: '数峰清苦，商略黄昏雨。',
      colors: [{ name: '清峰', hex: '#6A7A78' }, { name: '黄昏雨', hex: '#8A8C94' }, { name: '商略灰', hex: '#A8A49C' }, { name: '江天', hex: '#C4C8C8' }]
    },
    {
      id: 'jk-huainan',
      poet: '姜夔',
      tune: '踏莎行',
      line: '淮南皓月冷千山，冥冥归去无人管。',
      colors: [{ name: '皓月', hex: '#E8E6DC' }, { name: '冷千山', hex: '#5A6A6E' }, { name: '冥冥青', hex: '#3A4A50' }, { name: '归途淡', hex: '#B8B8B0' }]
    },
    {
      id: 'jk-lengxiang',
      poet: '姜夔',
      tune: '念奴娇',
      line: '嫣然摇动，冷香飞上诗句。',
      colors: [{ name: '荷粉', hex: '#E0B8C0' }, { name: '冷香绿', hex: '#8AAD9A' }, { name: '诗笺', hex: '#E8E0D0' }, { name: '塘水', hex: '#6A8A90' }]
    },
    {
      id: 'jk-feishui',
      poet: '姜夔',
      tune: '鹧鸪天',
      line: '肥水东流无尽期，当初不合种相思。',
      colors: [{ name: '肥水', hex: '#5A7A88' }, { name: '相思绛', hex: '#A85A5A' }, { name: '无尽天', hex: '#8A9AAA' }, { name: '岸草青', hex: '#6A7A58' }]
    },
    {
      id: 'ly-canyue',
      poet: '柳永',
      tune: '雨霖铃',
      line: '今宵酒醒何处？杨柳岸、晓风残月。',
      colors: [{ name: '杨柳岸', hex: '#6A8A68' }, { name: '晓风淡', hex: '#C8D0D0' }, { name: '残月', hex: '#E0D8B8' }, { name: '酒醒褐', hex: '#8A7060' }]
    },
    {
      id: 'ly-qingqiu',
      poet: '柳永',
      tune: '雨霖铃',
      line: '多情自古伤离别，更那堪、冷落清秋节。',
      colors: [{ name: '清秋金', hex: '#C9A45A' }, { name: '冷落灰', hex: '#9A968E' }, { name: '长亭褐', hex: '#7A5A48' }, { name: '暮蝉绿', hex: '#5A6A50' }]
    },
    {
      id: 'ly-yidai',
      poet: '柳永',
      tune: '蝶恋花',
      line: '衣带渐宽终不悔，为伊消得人憔悴。',
      colors: [{ name: '衣带', hex: '#D8C8B0' }, { name: '消瘦赭', hex: '#C4A088' }, { name: '伊人绛', hex: '#A86868' }, { name: '不悔墨', hex: '#3E4852' }]
    },
    {
      id: 'ly-guihe',
      poet: '柳永',
      tune: '望海潮',
      line: '三秋桂子，十里荷花。',
      colors: [{ name: '桂子金', hex: '#D4B04A' }, { name: '荷花', hex: '#E0A0B0' }, { name: '十里水', hex: '#6A9AAA' }, { name: '秋空', hex: '#8AA0B0' }]
    },
    {
      id: 'zbz-fenghe',
      poet: '周邦彦',
      tune: '苏幕遮',
      line: '叶上初阳干宿雨，水面清圆，一一风荷举。',
      colors: [{ name: '宿雨银', hex: '#D0D6D4' }, { name: '风荷绿', hex: '#4A8A68' }, { name: '初阳', hex: '#E8C878' }, { name: '水面', hex: '#A8C4C0' }]
    },
    {
      id: 'zbz-meizi',
      poet: '周邦彦',
      tune: '满庭芳',
      line: '风老莺雏，雨肥梅子，午阴嘉树清圆。',
      colors: [{ name: '梅子黄', hex: '#C8B24A' }, { name: '肥雨绿', hex: '#6A8A62' }, { name: '莺雏黄', hex: '#E0C878' }, { name: '午阴', hex: '#A8B8A0' }]
    },
    {
      id: 'zbz-xincheng',
      poet: '周邦彦',
      tune: '少年游',
      line: '并刀如水，吴盐胜雪，纤手破新橙。',
      colors: [{ name: '并刀银', hex: '#C8D0D4' }, { name: '吴盐', hex: '#F0EBE4' }, { name: '新橙', hex: '#E8944A' }, { name: '纤手', hex: '#E8C8B4' }]
    },
    {
      id: 'oyx-chunshan',
      poet: '欧阳修',
      tune: '踏莎行',
      line: '平芜尽处是春山，行人更在春山外。',
      colors: [{ name: '春山', hex: '#7A9A78' }, { name: '平芜', hex: '#C4C8A8' }, { name: '行人褐', hex: '#8A6A50' }, { name: '天外淡', hex: '#C8D4D4' }]
    },
    {
      id: 'oyx-meican',
      poet: '欧阳修',
      tune: '踏莎行',
      line: '候馆梅残，溪桥柳细，草薰风暖摇征辔。',
      colors: [{ name: '残梅', hex: '#E0C0C0' }, { name: '柳细', hex: '#8AAA78' }, { name: '草薰', hex: '#B8C878' }, { name: '溪桥石', hex: '#9A9080' }]
    },
    {
      id: 'oyx-canhong',
      poet: '欧阳修',
      tune: '采桑子',
      line: '群芳过后西湖好，狼籍残红。',
      colors: [{ name: '残红', hex: '#C46A68' }, { name: '飞絮', hex: '#E8E4D4' }, { name: '西湖水', hex: '#7A9AA0' }, { name: '芳尽绿', hex: '#8A9A80' }]
    },
    {
      id: 'oyx-qingchi',
      poet: '欧阳修',
      tune: '玉楼春',
      line: '人生自是有情痴，此恨不关风与月。',
      colors: [{ name: '情痴红', hex: '#C47A7A' }, { name: '风月白', hex: '#E6E2D6' }, { name: '尊前酒', hex: '#C4A056' }, { name: '夜洛青', hex: '#4A5560' }]
    },
    {
      id: 'lyou-hongsu',
      poet: '陆游',
      tune: '钗头凤',
      line: '红酥手，黄縢酒，满城春色宫墙柳。',
      colors: [{ name: '红酥', hex: '#D48A80' }, { name: '黄縢', hex: '#D4B04A' }, { name: '宫墙柳', hex: '#6A8A62' }, { name: '春色桃', hex: '#E0A090' }]
    },
    {
      id: 'lyou-xianggu',
      poet: '陆游',
      tune: '卜算子·咏梅',
      line: '零落成泥碾作尘，只有香如故。',
      colors: [{ name: '梅白', hex: '#E8E4D8' }, { name: '香如故', hex: '#C4A0A8' }, { name: '碾尘灰', hex: '#8A8478' }, { name: '断桥石', hex: '#7A766C' }]
    },
    {
      id: 'lyou-duanqiao',
      poet: '陆游',
      tune: '卜算子·咏梅',
      line: '驿外断桥边，寂寞开无主。',
      colors: [{ name: '驿墙', hex: '#B8A088' }, { name: '断桥', hex: '#8A8880' }, { name: '无主梅', hex: '#E0D4C8' }, { name: '寂寞昏', hex: '#6A5A4A' }]
    },
    {
      id: 'hz-huangyu',
      poet: '贺铸',
      tune: '青玉案',
      line: '一川烟草，满城风絮，梅子黄时雨。',
      colors: [{ name: '烟草', hex: '#8A9A6A' }, { name: '风絮', hex: '#E0DCC8' }, { name: '梅子黄', hex: '#C8B04A' }, { name: '黄时雨', hex: '#8A9A9E' }]
    },
    {
      id: 'fzw-biyun',
      poet: '范仲淹',
      tune: '苏幕遮',
      line: '碧云天，黄叶地，秋色连波，波上寒烟翠。',
      colors: [{ name: '碧云', hex: '#5A7A8A' }, { name: '黄叶', hex: '#D4A84A' }, { name: '寒烟翠', hex: '#4A6A62' }, { name: '波上金', hex: '#C8B070' }]
    },
    {
      id: 'fzw-gucheng',
      poet: '范仲淹',
      tune: '渔家傲',
      line: '千嶂里，长烟落日孤城闭。',
      colors: [{ name: '落日', hex: '#D4783A' }, { name: '长烟', hex: '#8A8A82' }, { name: '孤城', hex: '#5A4A40' }, { name: '千嶂', hex: '#4A5A58' }]
    },
    {
      id: 'zx-nongying',
      poet: '张先',
      tune: '天仙子',
      line: '沙上并禽池上暝，云破月来花弄影。',
      colors: [{ name: '破云银', hex: '#D8DCE0' }, { name: '月来', hex: '#E8E0C0' }, { name: '花影粉', hex: '#E0C0C4' }, { name: '池暝绿', hex: '#4A5A54' }]
    },
    {
      id: 'jj-yingtao',
      poet: '蒋捷',
      tune: '一剪梅·舟过吴江',
      line: '流光容易把人抛，红了樱桃，绿了芭蕉。',
      colors: [{ name: '樱桃红', hex: '#C44A4A' }, { name: '芭蕉绿', hex: '#5A8A52' }, { name: '流光金', hex: '#D4B86A' }, { name: '客袍青', hex: '#6A7A80' }]
    },
    {
      id: 'was-chengjiang',
      poet: '王安石',
      tune: '桂枝香',
      line: '千里澄江似练，翠峰如簇。',
      colors: [{ name: '澄江练', hex: '#D0D8D8' }, { name: '翠峰', hex: '#3A6A58' }, { name: '晚秋金', hex: '#C4A060' }, { name: '故国暮', hex: '#5A4A48' }]
    },
    {
      id: 'cyi-xinghua',
      poet: '陈与义',
      tune: '临江仙',
      line: '杏花疏影里，吹笛到天明。',
      colors: [{ name: '杏花', hex: '#E8B8B8' }, { name: '疏影墨', hex: '#4A4450' }, { name: '笛竹', hex: '#8A9A70' }, { name: '天明金', hex: '#E8D8A8' }]
    },
    {
      id: 'htj-chungui',
      poet: '黄庭坚',
      tune: '清平乐',
      line: '春归何处？寂寞无行路。',
      colors: [{ name: '春尽绿', hex: '#8A9A7A' }, { name: '无行路', hex: '#7A6A58' }, { name: '寂寞灰', hex: '#A8A49C' }, { name: '唤春粉', hex: '#E0C8C0' }]
    },
  ];
  window.WARDROBE_POEMS = {
    ci: CI,
    disclaimer: '意象取色，非文物实测'
  };
})();
