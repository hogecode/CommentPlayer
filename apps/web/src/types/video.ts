
/** API レスポンスの弾幕コメント型 */
export interface ApiComment {
  time: number;
  type: 'right' | 'top' | 'bottom';
  size: 'big' | 'medium' | 'small';
  color: string;
  author?: string;
  text: string;
}

/** ビデオデータの API レスポンス */
export interface VideoResponse {
  is_success: boolean;
  src: string;
  title?: string;
  description?: string;
  comments?: ApiComment[];
}
