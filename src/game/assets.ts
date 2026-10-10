// 游戏美术资产统一入口：全部静态导入，禁止散落的裸路径
import bgClassroomSunset from '@/assets/bg/classroom-sunset.png';
import bgSakuraRoad from '@/assets/bg/sakura-road.png';
import bgRooftopSunset from '@/assets/bg/rooftop-sunset.png';
import bgRainStreet from '@/assets/bg/rain-street.png';
import bgHospitalRoom from '@/assets/bg/hospital-room.png';
import bgNightSakura from '@/assets/bg/night-sakura.png';
import portraitYukino from '@/assets/portraits/yukino/yukino.png';
import portraitYukinoSmile from '@/assets/portraits/yukino_smile/yukino_smile.png';
import portraitYukinoSad from '@/assets/portraits/yukino_sad/yukino_sad.png';
import portraitYukinoCrying from '@/assets/portraits/yukino_crying/yukino_crying.png';
import portraitMisaki from '@/assets/portraits/misaki/misaki.png';

export const BACKGROUNDS = {
  classroom_sunset: bgClassroomSunset,
  sakura_road: bgSakuraRoad,
  rooftop_sunset: bgRooftopSunset,
  rain_street: bgRainStreet,
  hospital_room: bgHospitalRoom,
  night_sakura: bgNightSakura,
} as const;

export const PORTRAITS = {
  yukino: portraitYukino,
  yukino_smile: portraitYukinoSmile,
  yukino_sad: portraitYukinoSad,
  yukino_crying: portraitYukinoCrying,
  misaki: portraitMisaki,
} as const;

export type BackgroundId = keyof typeof BACKGROUNDS;
export type PortraitId = keyof typeof PORTRAITS;
export type PortraitSlot = 'left' | 'center' | 'right';
