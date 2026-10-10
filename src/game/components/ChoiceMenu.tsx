// 分支选项：垂直居中堆叠，直角细边框，hover 瞬切朱砂色 + 左侧竖线
import type { FC } from 'react';

interface ChoiceMenuProps {
  options: readonly string[];
  onChoose: (index: number) => void;
}

const ChoiceMenu: FC<ChoiceMenuProps> = ({ options, onChoose }) => {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
      style={{ animation: 'vn-fade-in 180ms linear both', backgroundColor: 'rgba(10, 9, 9, 0.45)' }}
    >
      {options.map((label, i) => (
        <button
          key={`${i}-${label}`}
          type="button"
          onClick={() => onChoose(i)}
          className="group relative w-[90%] max-w-[600px] border border-[#43403D] px-8 py-4 text-left transition-colors duration-100"
          style={{ backgroundColor: 'rgba(18, 17, 17, 0.92)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#C34043';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(18, 17, 17, 0.92)';
          }}
        >
          <span
            className="absolute left-0 top-0 h-full w-[2px] bg-[#E8E4DE] opacity-0 transition-opacity duration-100 group-hover:opacity-100"
          />
          <span className="text-base leading-7 text-[#E8E4DE]">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ChoiceMenu;
