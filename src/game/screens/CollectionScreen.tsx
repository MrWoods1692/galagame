// 结局、事件回想与 CG 鉴赏画廊收集页
import { useState, type FC } from 'react';
import { ArrowLeft, Play, Lock, Eye, X, ZoomIn } from 'lucide-react';
import { ENDINGS, ENDING_ORDER } from '../data/endings';
import { RECALL_EVENTS, type EventMemory } from '../data/recallEvents';
import { CG_GALLERY, type CGItem } from '../data/cgs';
import { BACKGROUNDS, type BackgroundId } from '../assets';

interface CollectionScreenProps {
  unlockedEndings: readonly string[];
  unlockedEvents: readonly string[];
  unlockedCGs?: readonly string[];
  onBack: () => void;
  onPlayRecall: (event: EventMemory) => void;
}

type TabType = 'endings' | 'recalls' | 'cgs';

const CollectionScreen: FC<CollectionScreenProps> = ({
  unlockedEndings,
  unlockedEvents,
  unlockedCGs = ['cg_classroom_sunset'],
  onBack,
  onPlayRecall,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('endings');
  const [previewCG, setPreviewCG] = useState<CGItem | null>(null);

  return (
    <div className="absolute inset-0 bg-[#121111] overflow-hidden">
      <div className="flex h-full flex-col px-[6%] py-[4%]">
        {/* 顶部标题栏与标签切换 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl tracking-[0.4em] text-[#E8E4DE]">记忆殿堂</h1>
            <div className="flex border border-[#43403D]">
              <button
                type="button"
                onClick={() => setActiveTab('endings')}
                className="px-5 py-2 text-xs tracking-[0.25em] transition-colors"
                style={{
                  backgroundColor: activeTab === 'endings' ? '#C34043' : 'transparent',
                  color: activeTab === 'endings' ? '#FFFFFF' : '#A9A49C',
                }}
              >
                结局收集 ({unlockedEndings.length}/{ENDING_ORDER.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recalls')}
                className="px-5 py-2 text-xs tracking-[0.25em] transition-colors border-l border-[#43403D]"
                style={{
                  backgroundColor: activeTab === 'recalls' ? '#C34043' : 'transparent',
                  color: activeTab === 'recalls' ? '#FFFFFF' : '#A9A49C',
                }}
              >
                事件回想 ({unlockedEvents.length}/{RECALL_EVENTS.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cgs')}
                className="px-5 py-2 text-xs tracking-[0.25em] transition-colors border-l border-[#43403D]"
                style={{
                  backgroundColor: activeTab === 'cgs' ? '#C34043' : 'transparent',
                  color: activeTab === 'cgs' ? '#FFFFFF' : '#A9A49C',
                }}
              >
                CG 鉴赏 ({unlockedCGs.length}/{CG_GALLERY.length})
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 border border-[#43403D] px-5 py-2 text-xs tracking-[0.3em] text-[#A9A49C] hover:border-[#C34043] hover:text-[#C34043]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            返回主页
          </button>
        </div>

        {/* 1. 结局收集 Tab */}
        {activeTab === 'endings' && (
          <div className="grid flex-1 grid-cols-3 gap-6 overflow-y-auto pr-2">
            {ENDING_ORDER.map((id) => {
              const def = ENDINGS[id];
              const unlocked = unlockedEndings.includes(id);
              return (
                <div
                  key={id}
                  className="flex flex-col border border-[#43403D] bg-[#181716] p-6 transition-all"
                  style={{
                    borderColor: unlocked ? '#5E5A55' : '#2A2826',
                    opacity: unlocked ? 1 : 0.65,
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs tracking-[0.3em] text-[#D08C4A]">
                      {unlocked ? def.no : '？？？'}
                    </span>
                    <span
                      className="text-[10px] tracking-widest px-2 py-0.5 border"
                      style={{
                        borderColor: unlocked ? '#C34043' : '#43403D',
                        color: unlocked ? '#C34043' : '#76736E',
                      }}
                    >
                      {unlocked ? def.subtitle : '未达成'}
                    </span>
                  </div>

                  <h3 className="mb-4 text-lg tracking-[0.25em] text-[#E8E4DE]">
                    {unlocked ? def.title : '未解锁结局'}
                  </h3>

                  <div className="flex-1 space-y-2 border-t border-[#2A2826] pt-4">
                    {unlocked ? (
                      def.epilogue.map((line) => (
                        <p key={line.slice(0, 16)} className="text-xs leading-relaxed text-[#A9A49C]">
                          {line}
                        </p>
                      ))
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center text-[#55524E]">
                        <p className="text-xs tracking-widest">在主线剧情中做出不同选择以达成此结局</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. 事件回想 Tab */}
        {activeTab === 'recalls' && (
          <div className="grid flex-1 grid-cols-2 gap-6 overflow-y-auto pr-2">
            {RECALL_EVENTS.map((event) => {
              const unlocked = unlockedEvents.includes(event.id);
              const bgImg = BACKGROUNDS[event.bg as BackgroundId];

              return (
                <div
                  key={event.id}
                  className="group relative flex flex-col border border-[#43403D] bg-[#181716] overflow-hidden transition-all hover:border-[#5E5A55]"
                >
                  {/* 背景封面缩略图 */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#0A0909]">
                    {bgImg && (
                      <img
                        src={bgImg}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ filter: unlocked ? 'none' : 'grayscale(100%) brightness(0.4)' }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181716] via-transparent to-black/30" />

                    <div className="absolute top-3 left-4 flex items-center gap-2">
                      <span className="bg-black/60 px-2 py-0.5 text-[10px] tracking-widest text-[#D08C4A] backdrop-blur-sm border border-[#43403D]">
                        {event.sceneName}
                      </span>
                    </div>

                    {!unlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
                        <Lock className="h-6 w-6 text-[#76736E] mb-2" strokeWidth={1.5} />
                        <span className="text-xs tracking-[0.2em] text-[#76736E]">尚未经历此事件</span>
                      </div>
                    )}
                  </div>

                  {/* 文本内容与回想按钮 */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="text-[10px] tracking-[0.25em] text-[#76736E] mb-1">
                        {event.subtitle}
                      </div>
                      <h3 className="text-base tracking-[0.2em] text-[#E8E4DE] mb-2 font-medium">
                        {event.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-[#A9A49C] line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2A2826] flex items-center justify-end">
                      {unlocked ? (
                        <button
                          type="button"
                          onClick={() => onPlayRecall(event)}
                          className="flex items-center gap-2 border border-[#C34043] bg-[#C34043]/10 px-4 py-1.5 text-xs tracking-[0.2em] text-[#E8E4DE] transition-colors hover:bg-[#C34043] hover:text-white"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          重温回想
                        </button>
                      ) : (
                        <span className="text-[11px] tracking-wider text-[#55524E]">跟随主线推进解锁</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. CG 鉴赏画廊 Tab */}
        {activeTab === 'cgs' && (
          <div className="grid flex-1 grid-cols-3 gap-5 overflow-y-auto pr-2">
            {CG_GALLERY.map((cg) => {
              const unlocked = unlockedCGs.includes(cg.id);
              return (
                <div
                  key={cg.id}
                  className="group relative flex flex-col overflow-hidden border border-[#3E3636] bg-[#181515] transition-all hover:border-[#E8A7A1]/60"
                >
                  {/* CG 缩略图与点击大图预览 */}
                  <div
                    className="relative h-44 w-full cursor-pointer overflow-hidden bg-[#0A0909]"
                    onClick={() => {
                      if (unlocked) {
                        setPreviewCG(cg);
                      }
                    }}
                  >
                    <img
                      src={cg.imageUrl}
                      alt={cg.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: unlocked ? 'none' : 'grayscale(100%) brightness(0.3)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181515] via-transparent to-black/20" />

                    {unlocked ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex items-center gap-1.5 rounded-full border border-white/40 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                          <ZoomIn className="h-3.5 w-3.5" />
                          <span>全屏预览</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                        <Lock className="h-6 w-6 text-[#76736E] mb-2" strokeWidth={1.5} />
                        <span className="text-xs tracking-[0.2em] text-[#76736E]">剧情推进解锁</span>
                      </div>
                    )}

                    <span className="absolute top-2.5 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] tracking-wider text-[#F4B8B0] backdrop-blur-sm border border-white/10">
                      {cg.chapter}
                    </span>
                  </div>

                  {/* CG 介绍信息 */}
                  <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                      <h4 className="text-sm font-medium tracking-[0.2em] text-[#F5F2EB]">
                        {unlocked ? cg.title : '？？？？'}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#A9A49C]">
                        {unlocked ? cg.description : '随着剧情经历此场景后解锁完整高清插画'}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#2A2323] pt-2">
                      <span className="text-[10px] tracking-wider text-[#76736E]">
                        {unlocked ? '已收录' : '未收录'}
                      </span>
                      {unlocked && (
                        <button
                          type="button"
                          onClick={() => setPreviewCG(cg)}
                          className="flex items-center gap-1 text-[11px] text-[#E8A7A1] hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          <span>查看大图</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 全屏大图预览弹窗 */}
        {previewCG && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setPreviewCG(null)}
          >
            {/* 关闭按钮与顶部标题 */}
            <div
              className="absolute top-4 inset-x-6 flex items-center justify-between z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <span className="text-xs tracking-[0.3em] text-[#F4B8B0]">{previewCG.chapter}</span>
                <h3 className="text-lg tracking-[0.2em] text-white font-medium">{previewCG.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCG(null)}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
                <span>关闭预览</span>
              </button>
            </div>

            {/* 大图展示区域 */}
            <div
              className="relative max-h-[82%] max-w-[92%] overflow-hidden rounded border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewCG.imageUrl}
                alt={previewCG.title}
                className="h-auto max-h-[80vh] w-auto max-w-[90vw] object-contain"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-center">
                <p className="text-xs tracking-wider text-[#F2ECE8]">{previewCG.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionScreen;
