// 开源仓库弹窗：本作源码完全开源，直接跳转 GitHub 仓库查看 / 克隆 / 二次创作
import { useState, type FC } from 'react';
import { X, Github, Copy, Check, ExternalLink, Database, BookOpen } from 'lucide-react';
import { SakuraCorner } from './SakuraCorner';

export const REPO_URL = 'https://github.com/MrWoods1692/galagame';

interface OpenSourceSheetProps {
  onClose: () => void;
}

export const OpenSourceSheet: FC<OpenSourceSheetProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    window.open(REPO_URL, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REPO_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时忽略
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      style={{
        backgroundColor: 'rgba(10, 9, 9, 0.78)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] border border-[#43403D] p-6 shadow-2xl vn-sheet-in max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: 'rgba(24, 23, 22, 0.95)',
          borderRadius: '4px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 四角樱花角标 */}
        <SakuraCorner className="absolute -top-1 -left-1 w-6 h-6" />
        <SakuraCorner className="absolute -top-1 -right-1 w-6 h-6" flipX />
        <SakuraCorner className="absolute -bottom-1 -left-1 w-6 h-6" flipY />
        <SakuraCorner className="absolute -bottom-1 -right-1 w-6 h-6" flipX flipY />

        {/* 头部标题与关闭 */}
        <div className="flex items-center justify-between border-b border-[#33302E] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-[#D8697A]/20 text-[#D8697A]">
              <Github className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-medium tracking-[0.25em] text-[#E8E4DE]">开源仓库</h2>
              <span className="text-[10px] tracking-[0.15em] text-[#787575]">
                完整前端源码 · 自由克隆与二次创作
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center border border-[#43403D] text-[#A9A49C] transition-colors hover:border-[#D8697A] hover:text-[#E8E4DE]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 仓库地址 */}
        <div className="mb-4 border border-[#383533] bg-[#141312] p-3">
          <span className="mb-1.5 block text-[10px] tracking-[0.2em] text-[#787575]">仓库地址</span>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate font-mono text-[11px] text-[#E8E4DE]">{REPO_URL}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 border border-[#43403D] px-2 py-1 text-[10px] text-[#A9A49C] transition-colors hover:border-[#D8697A] hover:text-[#E8E4DE]"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
          </div>
        </div>

        {/* 工程说明 */}
        <div className="mb-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-start gap-2 border border-[#383533] bg-[#1F1E1E]/70 p-2.5">
            <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D8697A]" />
            <span className="text-[#A9A49C]">
              纯前端静态站点，无后端、无登录，存档与进度保存在浏览器本地数据库
            </span>
          </div>
          <div className="flex items-start gap-2 border border-[#383533] bg-[#1F1E1E]/70 p-2.5">
            <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E07A5F]" />
            <span className="text-[#A9A49C]">
              剧本、立绘、语音与合成 BGM 全部随源码提供，可自由改编
            </span>
          </div>
        </div>

        {/* 克隆与本地运行 */}
        <div className="mb-4 border-t border-[#33302E] pt-3 text-[11px] text-[#787575]">
          <span className="mb-1 block font-medium text-[#A9A49C]">本地运行：</span>
          <div className="rounded border border-[#2B2928] bg-[#121111] p-2 font-mono text-[10px] leading-relaxed text-[#E8E4DE]/80">
            git clone {REPO_URL}.git
            <br />
            npm install &amp;&amp; npm run dev
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleOpen}
            className="group relative flex w-full items-center justify-center gap-2 border border-[#43403D] bg-[#D8697A] px-5 py-3 text-sm font-medium tracking-[0.2em] text-[#FFFFFF] shadow-lg transition-all duration-150 hover:bg-[#c25868]"
          >
            <ExternalLink className="h-4 w-4" />
            <span>在 GitHub 中打开</span>
          </button>
          <p className="text-center text-[10px] tracking-[0.15em] text-[#787575]">
            项目以 AGPL-3.0 协议开源
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpenSourceSheet;
