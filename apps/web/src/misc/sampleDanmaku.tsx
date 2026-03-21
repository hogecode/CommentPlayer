import type { DPlayerType } from 'dplayer';

// サンプル弾幕データ
export const sampleDanmaku: DPlayerType.Dan[] = [
  { id: '1', time: 2, text: 'きたー！', color: '#ffffff', type: 'right', size: 'medium' },
  { id: '2', time: 3, text: 'wwwwww', color: '#ffd93d', type: 'right', size: 'small' },
  { id: '3', time: 5, text: 'すごい！', color: '#ff6b6b', type: 'right', size: 'big' },
  { id: '4', time: 5, text: '神', color: '#6bcb77', type: 'top', size: 'medium' },
  { id: '5', time: 8, text: 'ここ好き', color: '#4d96ff', type: 'right', size: 'medium' },
  { id: '6', time: 10, text: 'やばすぎる', color: '#ff922b', type: 'right', size: 'medium' },
  { id: '7', time: 12, text: '1000いいね', color: '#ffffff', type: 'bottom', size: 'medium' },
  { id: '8', time: 15, text: '感動した', color: '#ffd93d', type: 'right', size: 'big' },
];
