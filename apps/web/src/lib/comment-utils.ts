/**
 * コメント関連のユーティリティ
 * サーバーから返却された色名を16進数カラーコードに変換、NG機能をサポート
 */

/**
 * DPlayer用のコメントデータ型
 */
export interface DPlayerComment {
  time: number
  type: 'top' | 'right' | 'bottom'
  color: string
  size: 'big' | 'medium' | 'small'
  text: string
  author?: string
}

/**
 * コメント周りのユーティリティ
 * ニコニコ色名を16進数カラーコードに変換（バックエンドから色名が送られてくる想定）
 */
export class CommentUtils {
  // ニコニコの色指定を 16 進数カラーコードに置換するテーブル
  private static readonly color_table: { [key: string]: string } = {
    'white': '#FFEAEA',
    'red': '#F02840',
    'pink': '#FD7E80',
    'orange': '#FDA708',
    'yellow': '#FFE133',
    'green': '#64DD17',
    'cyan': '#00D4F5',
    'blue': '#4763FF',
    'purple': '#D500F9',
    'black': '#1E1310',
    'white2': '#CCCC99',
    'niconicowhite': '#CCCC99',
    'red2': '#CC0033',
    'truered': '#CC0033',
    'pink2': '#FF33CC',
    'orange2': '#FF6600',
    'passionorange': '#FF6600',
    'yellow2': '#999900',
    'madyellow': '#999900',
    'green2': '#00CC66',
    'elementalgreen': '#00CC66',
    'cyan2': '#00CCCC',
    'blue2': '#3399FF',
    'marineblue': '#3399FF',
    'purple2': '#6633CC',
    'nobleviolet': '#6633CC',
    'black2': '#666666',
  }

  /**
   * ニコニコの色指定を 16 進数カラーコードに置換する
   * サーバーから返却された色名をコードに変換
   * @param color ニコニコの色指定（色名または16進数コード）
   * @return 16 進数カラーコード
   */
  static getCommentColor(color: string): string {
    // 16進数カラーコードがそのまま入っている場合はそのまま返す
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return color
    }
    // 色名テーブルで変換
    return this.color_table[color] || '#FFEAEA'
  }

  /**
   * ミュート対象のコメントかどうかを判断する
   * @param comment コメント
   * @param user_id コメントを投稿したユーザーの ID
   * @param color コメントの色（色名または16進数コード）
   * @param position コメントの位置
   * @param size コメントのサイズ
   * @param settings 設定ストアから取得した設定値
   * @return ミュート対象のコメントなら true を返す
   */
  static isMutedComment(
    comment: string,
    user_id: string | undefined,
    color: string | undefined,
    position: string | undefined,
    size: string | undefined,
    settings: any
  ): boolean {
    // 色を16進数コードに変換
    const colorCode = color ? this.getCommentColor(color) : '#FFEAEA'

    // ユーザー ID ミュート処理
    if (user_id && settings.muted_niconico_user_ids.includes(user_id)) {
      return true
    }

    // 「映像の上下に固定表示されるコメントをミュートする」がオンの場合
    if (settings.mute_fixed_comments === true && (position === 'top' || position === 'bottom')) {
      return true
    }

    // 「色付きのコメントをミュートする」がオンの場合
    // デフォルト色（#FFEAEA）以外をミュート
    if (settings.mute_colored_comments === true && colorCode !== '#FFEAEA') {
      return true
    }

    // 「文字サイズが大きいコメントをミュートする」がオンの場合
    if (settings.mute_big_size_comments === true && size === 'big') {
      return true
    }

    // キーワードミュート処理
    for (const muted_comment_keyword of settings.muted_comment_keywords) {
      if (muted_comment_keyword.pattern === '') continue

      switch (muted_comment_keyword.match) {
        case 'partial':
          if (comment.includes(muted_comment_keyword.pattern)) {
            return true
          }
          break
        case 'forward':
          if (comment.startsWith(muted_comment_keyword.pattern)) {
            return true
          }
          break
        case 'backward':
          if (comment.endsWith(muted_comment_keyword.pattern)) {
            return true
          }
          break
        case 'exact':
          if (comment === muted_comment_keyword.pattern) {
            return true
          }
          break
        case 'regex':
          try {
            if (new RegExp(muted_comment_keyword.pattern).test(comment)) {
              return true
            }
          } catch (e) {
            // Invalid regex pattern - ignore
          }
          break
      }
    }

    return false
  }

  /**
   * ミュート済みキーワードリストに追加する (完全一致)
   * @param comment コメント文字列
   * @param settings 設定ストアから取得した設定値
   * @param updateSettings 設定更新関数
   */
  static addMutedKeywords(comment: string, settings: any, updateSettings: (updates: any) => void): void {
    // すでに追加済みの場合は何もしない
    for (const muted_comment_keyword of settings.muted_comment_keywords) {
      if (muted_comment_keyword.match === 'exact' && muted_comment_keyword.pattern === comment) {
        return
      }
    }

    // ミュート済みキーワードリストに追加
    updateSettings({
      muted_comment_keywords: [
        ...settings.muted_comment_keywords,
        {
          match: 'exact',
          pattern: comment,
        },
      ],
    })
  }

  /**
   * ミュート済みニコニコユーザー ID リストに追加する
   * @param user_id ニコニコユーザー ID
   * @param settings 設定ストアから取得した設定値
   * @param updateSettings 設定更新関数
   */
  static addMutedNiconicoUserIDs(user_id: string, settings: any, updateSettings: (updates: any) => void): void {
    // すでに追加済みの場合は何もしない
    if (settings.muted_niconico_user_ids.includes(user_id)) {
      return
    }

    // ミュート済みニコニコユーザー ID リストに追加
    updateSettings({
      muted_niconico_user_ids: [...settings.muted_niconico_user_ids, user_id],
    })
  }

  /**
   * 色が有効か判定する
   * 16進数カラーコード（#XXXXXX形式）または有効な色名かチェック
   * @param color 色指定（色名または16進数コード）
   * @return 有効な色の場合は true を返す
   */
  static isValidColor(color: string): boolean {
    // 16進数カラーコード（#XXXXXX形式）はそのまま有効
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) return true;
    // 色名テーブルに存在する場合は有効
    const colorTable = ['white', 'red', 'pink', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'black',
      'white2', 'niconicowhite', 'red2', 'truered', 'pink2', 'orange2', 'passionorange', 'yellow2', 'madyellow',
      'green2', 'elementalgreen', 'cyan2', 'blue2', 'marineblue', 'purple2', 'nobleviolet', 'black2'];
    return colorTable.includes(color);
  }

  /**
   * 指定された数のランダムな要素を配列から抽出し、元の順序を保つ
   * @param array 対象の配列
   * @param count 抽出する要素の数
   * @return 抽出した要素を元の順序で返す
   */
  static selectRandomComments<T>(array: T[], count: number): T[] {
    if (array.length <= count) {
      return array;
    }

    // ランダムに選択するインデックスを取得
    const indices = new Set<number>();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * array.length));
    }

    // 選択されたインデックスをソートして元の順序を保つ
    const sortedIndices = Array.from(indices).sort((a, b) => a - b);
    return sortedIndices.map(index => array[index]);
  }
}
