'use client';

import { useRef, useCallback } from 'react';
import type { Dan, DanmakuItem, DanmakuType, DanmakuSize } from '@/types/danmaku';

// ---- 定数 ----
const FONT_FAMILY = '"Segoe UI", Arial, sans-serif';
const BASE_FONT_SIZE = 24;      // px（1024px幅基準のフォントサイズ）
const VERTICAL_MARGIN = 6;      // 弾幕の縦マージン（px）
const BORDER_COLOR = '#00b5ff'; // 自コメントの枠線色

/** レーン管理の型: { "0": [el, el], "1": [el], ... } */
type DanTunnel = { [lane: string]: HTMLElement[] };

/**
 * 弾幕描画・制御ロジックをまとめたカスタムフック。
 * danmaku.ts（DPlayer）のクラスベース実装をReact向けに移植。
 *
 * @param containerRef 弾幕を描画する親DIVのref
 * @param getTime      現在の動画再生時間（秒）を返す関数
 */
export function useDanmaku(
  containerRef: React.RefObject<HTMLElement | null>,
  getTime: () => number,
) {
  // ---- 弾幕データ ----
  const danListRef  = useRef<Dan[]>([]);   // 時刻順にソート済みの全弾幕
  const danIndexRef = useRef(0);           // 次に表示すべき弾幕のインデックス

  // ---- 再生状態 ----
  const pausedRef   = useRef(false);
  const showingRef  = useRef(true);        // 弾幕表示ON/OFF
  const rafRef      = useRef<number>(0);   // requestAnimationFrameのID
  const speedRate   = useRef(1);           // アニメーション速度倍率
  const unlimitedRef = useRef(false);      // レーン数制限なし（重ね表示）

  // ---- テキスト幅計測用Canvas ----
  const contextRef     = useRef<CanvasRenderingContext2D | null>(null);
  const danFontSizeRef = useRef(0);

  // ---- レーン管理（型ごとに独立） ----
  const tunnelRef = useRef<{ right: DanTunnel; top: DanTunnel; bottom: DanTunnel }>({
    right: {},
    top: {},
    bottom: {},
  });

  // --------------------------------------------------
  // _measure: Canvas API でテキストのピクセル幅を計測
  // フォントサイズが変わった場合のみcanvasを再生成してキャッシュ
  // --------------------------------------------------
  const measure = useCallback((text: string, fontSize: number): number => {
    if (!contextRef.current || danFontSizeRef.current !== fontSize) {
      danFontSizeRef.current = fontSize;
      const canvas = document.createElement('canvas');
      contextRef.current = canvas.getContext('2d');
      if (contextRef.current) {
        contextRef.current.font = `bold ${fontSize}px ${FONT_FAMILY}`;
      }
    }
    if (!contextRef.current) return 0;
    // 改行を含む場合は最大幅を返す
    return Math.max(...text.split('\n').map((l) => contextRef.current!.measureText(l).width));
  }, []);

  /** レーン管理をリセット（シーク・クリア時に呼ぶ） */
  const clearTunnels = useCallback(() => {
    tunnelRef.current = { right: {}, top: {}, bottom: {} };
  }, []);

  // --------------------------------------------------
  // draw: 弾幕アイテムをDOMに追加する
  // danmaku.ts の draw() メソッドに相当
  // --------------------------------------------------
  const draw = useCallback(
    (dan: DanmakuItem | DanmakuItem[] | Dan[]) => {
      const container = containerRef.current;
      if (!container || !showingRef.current) return null;

      const danList: (DanmakuItem | Dan)[] = Array.isArray(dan) ? dan : [dan];
      if (danList.length === 0) return null;

      const danWidth  = container.offsetWidth;
      const danHeight = container.offsetHeight;

      // 画面幅に応じてフォントサイズを縮小（最大1.0倍）
      const ratioRate = 1.25; // magic number（DPlayer準拠）
      let ratio = (danWidth / 1024) * ratioRate;
      if (ratio > 1) ratio = 1;

      const itemFontSize = BASE_FONT_SIZE * ratio;
      const itemHeight   = itemFontSize + VERTICAL_MARGIN * ratio; // 1レーンの高さ
      const itemY        = Math.floor(danHeight / itemHeight);     // 最大レーン数

      /** アニメーション中の要素が右端からどれだけ離れているかを返す */
      const danItemRight = (el: HTMLElement): number => {
        const elRight = el.getBoundingClientRect().right
          || container.getBoundingClientRect().right + (el.offsetWidth || parseInt(el.style.width || '0'));
        return container.getBoundingClientRect().right - elRight;
      };

      /** 弾幕の移動速度（px/s）。幅が広いほど速く流れる */
      const danSpeed = (width: number) => (danWidth + width) / 5;

      /**
       * 空きレーンを探して返す（見つからなければ -1）
       * right: 前の弾幕が十分進んでいれば同レーンに追加可
       * top/bottom: 常に次のレーンを使う
       */
      const getTunnel = (el: HTMLElement, type: DanmakuType, width: number): number => {
        const tmp    = danWidth / danSpeed(width);
        const tunnel = tunnelRef.current[type];
        const limit  = unlimitedRef.current ? 1000 : itemY;

        for (let i = 0; i < limit; i++) {
          const lane = tunnel[String(i)];
          if (lane && lane.length) {
            if (type !== 'right') continue; // top/bottomは重ならない
            // 最後の弾幕が十分進んでいるか確認
            const last     = lane[lane.length - 1];
            const danRight = danItemRight(last) - 10;
            if (danRight > danWidth - tmp * danSpeed(parseInt(last.style.width || '0')) && danRight > 0) {
              continue; // まだ詰まっているので次のレーンへ
            }
            tunnel[String(i)].push(el);
            el.addEventListener('animationend', () => { tunnel[String(i)]?.splice(0, 1); });
            return i % itemY;
          } else {
            // 空きレーン：新規登録
            tunnel[String(i)] = [el];
            el.addEventListener('animationend', () => { tunnel[String(i)]?.splice(0, 1); });
            return i % itemY;
          }
        }
        return -1; // 空きなし（unlimited=falseかつ全レーン埋まり）
      };

      /** タイプ別アニメーション時間（speedRateで調整） */
      const animDuration = (type: DanmakuType): string => {
        const durations: Record<DanmakuType, number> = { top: 4, right: 5, bottom: 4 };
        return `${durations[type] / speedRate.current}s`;
      };

      // DocumentFragmentにまとめてからDOMへ追加（リフロー最小化）
      const fragment = document.createDocumentFragment();

      for (const item of danList) {
        const type: DanmakuType  = item.type === 'top' || item.type === 'bottom' ? item.type : 'right';
        const color               = item.color || '#ffeaea';
        const size: DanmakuSize  = item.size || 'medium';

        // サイズに応じてフォントサイズを調整
        let fontSize = itemFontSize;
        if (size === 'big')   fontSize *= 1.25;
        if (size === 'small') fontSize *= 0.8;

        const itemWidth = measure(item.text, fontSize);

        // 改行ごとに1要素を生成
        const lines        = item.text.split('\n');
        const orderedLines = type === 'bottom' ? [...lines].reverse() : lines;

        for (const line of orderedLines) {
          const el       = document.createElement('div');
          el.className   = `danmaku-item danmaku-${type} danmaku-size-${size}`;
          el.style.color     = color;
          el.style.fontSize  = `${fontSize}px`;

          // 自コメントは枠線付きspanでラップ
          if ('border' in item && item.border) {
            const span = document.createElement('span');
            span.style.border = `2px solid ${BORDER_COLOR}`;
            span.textContent  = line;
            el.appendChild(span);
          } else {
            el.textContent = line;
          }

          // アニメーション終了後にDOMから削除
          el.addEventListener('animationend', () => { container.removeChild(el); });

          const tunnel = getTunnel(el, type, itemWidth);

          if (tunnel >= 0) {
            el.style.width             = `${itemWidth + 1}px`;
            el.style.animationDuration = animDuration(type);

            if (type === 'right') {
              el.style.top       = `${itemHeight * tunnel + 8}px`;
              el.style.setProperty('--dan-scroll-width', `${danWidth}px`);
              el.style.willChange = 'transform';
            } else if (type === 'top') {
              el.style.top        = `${itemHeight * tunnel + 8}px`;
              el.style.willChange = 'visibility';
            } else {
              el.style.bottom     = `${itemHeight * tunnel + 8}px`;
              el.style.willChange = 'visibility';
            }

            el.classList.add('danmaku-move');
            fragment.appendChild(el);
          }
        }
      }

      container.appendChild(fragment);
      return fragment;
    },
    [containerRef, measure],
  );

  // --------------------------------------------------
  // frame: requestAnimationFrameループ
  // 再生時間を確認して表示すべき弾幕をdrawに渡す
  // danmaku.ts の frame() メソッドに相当
  // --------------------------------------------------
  const frame = useCallback(() => {
    if (danListRef.current.length && !pausedRef.current && showingRef.current) {
      const now   = getTime();
      const batch: Dan[] = [];
      let item = danListRef.current[danIndexRef.current];
      // 現在時刻を超えた弾幕をまとめて収集
      while (item && now > Number(item.time)) {
        batch.push(item);
        item = danListRef.current[++danIndexRef.current];
      }
      if (batch.length) draw(batch);
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [draw, getTime]);

  /**
   * 弾幕データをロードしてフレームループを開始する。
   * 時刻順にソートしてからインデックスをリセット。
   */
  const load = useCallback(
    (danData: Dan[]) => {
      danListRef.current  = [...danData].sort((a, b) => a.time - b.time);
      danIndexRef.current = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(frame);
    },
    [frame],
  );

  /**
   * シーク後の同期処理。
   * DOM上の弾幕を全削除してレーンをリセットし、
   * 現在時刻以降の弾幕インデックスを設定する。
   */
  const seek = useCallback(() => {
    const container = containerRef.current;
    if (container) container.innerHTML = '';
    clearTunnels();
    danIndexRef.current = 0;

    const now = getTime();
    for (let i = 0; i < danListRef.current.length; i++) {
      if (danListRef.current[i].time >= now) {
        danIndexRef.current = i;
        return;
      }
    }
    danIndexRef.current = danListRef.current.length;
  }, [containerRef, clearTunnels, getTime]);

  /** DOM上の全弾幕を削除してレーンをリセット */
  const clear = useCallback(() => {
    const container = containerRef.current;
    if (container) container.innerHTML = '';
    clearTunnels();
    danIndexRef.current = 0;
  }, [containerRef, clearTunnels]);

  const play  = useCallback(() => { pausedRef.current = false; }, []);
  const pause = useCallback(() => { pausedRef.current = true;  }, []);

  /** 弾幕を非表示にして一時停止・クリア */
  const hide = useCallback(() => {
    showingRef.current = false;
    pause();
    clear();
  }, [pause, clear]);

  /** 弾幕を再表示してシーク・再開 */
  const show = useCallback(() => {
    seek();
    showingRef.current = true;
    play();
  }, [seek, play]);

  const setSpeed     = useCallback((rate: number)   => { speedRate.current    = rate; }, []);
  const setUnlimited = useCallback((val: boolean)   => { unlimitedRef.current = val;  }, []);

  /**
   * コメントを即時送信・描画する。
   * 現在時刻を time として danList に挿入し、枠線付きで表示。
   */
  const sendDan = useCallback(
    (item: DanmakuItem) => {
      const dan: Dan = { ...item, time: getTime(), border: true };
      danListRef.current.splice(danIndexRef.current, 0, dan);
      danIndexRef.current++;
      draw(dan);
    },
    [draw, getTime],
  );

  /** コンポーネントアンマウント時にrAFを停止してDOMをクリーンアップ */

  const destroy = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clear();
  }, [clear]);

  return { load, seek, clear, play, pause, hide, show, setSpeed, setUnlimited, sendDan, destroy };
}
