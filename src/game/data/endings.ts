// 结局定义
import type { BackgroundId } from '../assets';

export interface EndingDef {
  id: string;
  no: string;
  title: string;
  subtitle: string;
  tone: 'tragedy' | 'regret' | 'redemption';
  bg: BackgroundId;
  epilogue: string[];
}

export const ENDINGS: Record<string, EndingDef> = {
  ed1: {
    id: 'ed1',
    no: '结局 壹',
    title: '未送出的信',
    subtitle: '悲剧结局',
    tone: 'tragedy',
    bg: 'classroom_sunset',
    epilogue: [
      '毕业式的傍晚，美咲把一封信交到我手里。',
      '信封上是熟悉的字迹，却再也不会有新的字句添上去了。',
      '「对不起，一直瞒着你。还有——其实我一直，一直都想告诉你……」',
      '信的最后一句停在半句。窗外的樱花落得无声无息。',
      '如果那天我问出口，如果我追上去——可是春天不会回头。',
    ],
  },
  ed2: {
    id: 'ed2',
    no: '结局 贰',
    title: '夜樱下的告别',
    subtitle: '遗憾结局',
    tone: 'regret',
    bg: 'night_sakura',
    epilogue: [
      '夜樱隧道的灯笼一盏盏熄灭了。',
      '雪乃靠在我的肩上，像睡着了一样。她说，别忘了春天的味道。',
      '那个约定实现了。可约定的后半句——「明年还要一起来」，永远悬在了空中。',
      '此后每年四月，我都会回到这条河岸。樱花开得越好，心里越空。',
      '遗憾是她留给我的、最后一件礼物。',
    ],
  },
  ed3: {
    id: 'ed3',
    no: '结局 叁',
    title: '樱花再开之时',
    subtitle: '救赎结局',
    tone: 'redemption',
    bg: 'sakura_road',
    epilogue: [
      '手术同意书上，她签下名字的手没有颤抖。',
      '「因为和你约好了呀。约好的事情，我想活着做到。」',
      '一年后的春天，一封盖着疗养院邮戳的信寄到了我家。',
      '「医生说，明年春天就可以出院了。到时候——再一起去看夜樱吧。」',
      '樱花落了还会再开。而我们，还有下一个春天。',
    ],
  },
};

export const ENDING_ORDER = ['ed1', 'ed2', 'ed3'] as const;
