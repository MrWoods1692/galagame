// 回想事件定义与配置
export interface EventMemory {
  id: string;
  title: string;
  subtitle: string;
  sceneName: string;
  startLabel: string;
  bg: string;
  description: string;
}

export const RECALL_EVENTS: EventMemory[] = [
  {
    id: 'rooftop_twilight',
    title: '黄昏天台的隐瞒',
    subtitle: '第一章 · 秘密的裂痕',
    sceneName: '学校天台',
    startLabel: 'recall_rooftop',
    bg: 'rooftop_sunset',
    description: '在落日余晖的天台上，雪乃吞吞吐吐的异样举动与藏匿的药丸。',
  },
  {
    id: 'rain_question',
    title: '雨夜街头的追问',
    subtitle: '第二章 · 无法回避的真相',
    sceneName: '雨夜街道',
    startLabel: 'recall_rain',
    bg: 'rain_street',
    description: '冷雨瓢泼的街头，美咲道出雪乃身患绝症、已然退学的残酷事实。',
  },
  {
    id: 'hospital_confession',
    title: '病房窗前的坦白',
    subtitle: '第三章 · 脆弱的告解',
    sceneName: '病房',
    startLabel: 'recall_hospital',
    bg: 'hospital_room',
    description: '苍白病房中，雪乃眼中蓄满泪水，倾吐不想被同情、想在记忆中留存最美姿态的心愿。',
  },
  {
    id: 'night_sakura_oath',
    title: '夜樱树下的心愿',
    subtitle: '终章 · 盛放的约定',
    sceneName: '夜樱街道',
    startLabel: 'recall_night_sakura',
    bg: 'night_sakura',
    description: '在月色与漫天飞樱的拥抱下，两人双手相牵许下的永恒誓言。',
  },
];
