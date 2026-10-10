// CG 鉴赏画廊数据定义
import { BACKGROUNDS, type BackgroundId } from '../assets';

export interface CGItem {
  id: string;
  title: string;
  chapter: string;
  description: string;
  bgId: BackgroundId;
  imageUrl: string;
}

export const CG_GALLERY: CGItem[] = [
  {
    id: 'cg_classroom_sunset',
    title: '放学后的余晖',
    chapter: '序章 · 教室的约定',
    description: '四月的夕阳将教室染成蜂蜜色，那是倒数第二个春天的开端。',
    bgId: 'classroom_sunset',
    imageUrl: BACKGROUNDS.classroom_sunset,
  },
  {
    id: 'cg_sakura_road',
    title: '飘落的花吹雪',
    chapter: '第一章 · 樱花坡道',
    description: '如雪般漫天飞舞的樱花瓣中，少女展露着无瑕却转瞬即逝的笑颜。',
    bgId: 'sakura_road',
    imageUrl: BACKGROUNDS.sakura_road,
  },
  {
    id: 'cg_rooftop_sunset',
    title: '黄昏天台的秘密',
    chapter: '第二章 · 隐瞒的药瓶',
    description: '晚风呼啸的天台铁丝网旁，残阳如血，秘密的裂痕无可挽回。',
    bgId: 'rooftop_sunset',
    imageUrl: BACKGROUNDS.rooftop_sunset,
  },
  {
    id: 'cg_rain_street',
    title: '雨夜残酷的真实',
    chapter: '第三章 · 街角追问',
    description: '冰冷的雨水打湿了地面的落樱，也揭开了她不愿提及的绝症真相。',
    bgId: 'rain_street',
    imageUrl: BACKGROUNDS.rain_street,
  },
  {
    id: 'cg_hospital_room',
    title: '苍白病房的告解',
    chapter: '第四章 · 脆弱的挽留',
    description: '洁白床单前落下的眼泪，「如果可以，我想在最美的时候留在你的记忆里。」',
    bgId: 'hospital_room',
    imageUrl: BACKGROUNDS.hospital_room,
  },
  {
    id: 'cg_night_sakura',
    title: '盛放夜樱下的约定',
    chapter: '终章 · 永恒誓言',
    description: '挂满灯笼的夜樱隧道下，双手交叠，我们许下了跨越生死的约定。',
    bgId: 'night_sakura',
    imageUrl: BACKGROUNDS.night_sakura,
  },
];
