/** 弾幕の表示位置タイプ
 * - right  : 右から左へ流れる（ニコニコ標準）
 * - top    : 画面上部に固定表示
 * - bottom : 画面下部に固定表示
 */
export type DanmakuType = 'right' | 'top' | 'bottom';

/** 弾幕のフォントサイズ */
export type DanmakuSize = 'small' | 'medium' | 'big';

/** 送信・描画時に使う弾幕の最小データ */
export interface DanmakuItem {
  text: string;
  color?: string;       // CSS カラー文字列（例: '#ffffff'）
  type?: DanmakuType;
  size?: DanmakuSize;
}

/** APIやDBから取得する弾幕の完全データ */
export interface Dan extends DanmakuItem {
  id?: string;
  time: number;         // 動画の何秒目に表示するか
  author?: string;      // 投稿者名
  border?: boolean;     // 自分のコメントに枠線を付けるか
}

/** DPlayer の Comment 型 */
export interface Comment {
  id?: string;
  author?: string;
  time: number;
  text: string;
  color: string;
  type: 'top' | 'right' | 'bottom';
  size: 'big' | 'medium' | 'small';
  jikkyo_date?: number; // コメントの実時刻（UnixタイムスタンプまたはUTC時刻）
}
