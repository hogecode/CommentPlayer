'use client';

interface Props {
  /** 遅延値（秒） */
  delay: number;
  /** 遅延値が変更された時のコールバック */
  onChange: (value: number) => void;
  /** 最小遅延値（秒） */
  min?: number;
  /** 最大遅延値（秒） */
  max?: number;
  /** スライダーのステップ値 */
  step?: number;
}

/**
 * コメント遅延コントロールコンポーネント
 *
 * スライダーを使用してコメントの表示タイミングを調整するUI。
 * 正の値でコメントを遅延、負の値で先行表示。
 */
export default function CommentDelayControl({
  delay,
  onChange,
  min = -30,
  max = 30,
  step = 0.5,
}: Props) {
  const delayLabel =
    delay > 0 ? `+${delay}秒 遅延` :
    delay < 0 ? `${Math.abs(delay)}秒 先行` :
    '遅延なし';

  return (
    <div className="comment-delay-control">
      <div className="delay-control-header">
        <span className="delay-control-title">コメント遅延調整</span>
        <span className="delay-control-value">{delayLabel}</span>
        <button
          onClick={() => onChange(0)}
          className="delay-reset-btn"
          aria-label="遅延をリセット"
        >
          リセット
        </button>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={delay}
        onChange={(e) => onChange(Number(e.target.value))}
        className="delay-slider"
        aria-label="コメント遅延（秒）"
      />

      <div className="delay-scale-hints">
        <span>← {Math.abs(min)}秒先行</span>
        <span>0</span>
        <span>{max}秒遅延 →</span>
      </div>
    </div>
  );
}
