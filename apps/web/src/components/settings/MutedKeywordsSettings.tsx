'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import type { MutedCommentKeyword } from '@/types/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

export function MutedKeywordsSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const [newKeyword, setNewKeyword] = useState('')
  const [matchType, setMatchType] = useState<'partial' | 'forward' | 'backward' | 'exact' | 'regex'>('partial')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyword.trim()) {
      return
    }

    // 正規表現の妥当性を確認
    if (matchType === 'regex') {
      try {
        new RegExp(newKeyword)
      } catch (error) {
        alert('無効な正規表現です')
        return
      }
    }

    setIsAdding(true)
    try {
      const newKeywords = [
        ...settings.muted_comment_keywords,
        {
          pattern: newKeyword,
          match: matchType,
        } as MutedCommentKeyword,
      ]
      updateSettings({ muted_comment_keywords: newKeywords })
      setNewKeyword('')
      setMatchType('partial')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveKeyword = (index: number) => {
    const newKeywords = settings.muted_comment_keywords.filter((_, i) => i !== index)
    updateSettings({ muted_comment_keywords: newKeywords })
  }

  const getMatchTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      partial: '部分一致',
      forward: '前方一致',
      backward: '後方一致',
      exact: '完全一致',
      regex: '正規表現',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* NGワード追加フォーム */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">
            NGワード追加
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            フィルタリングするキーワードを追加します
          </p>
        </div>
        <form onSubmit={handleAddKeyword} className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <Input
              type="text"
              placeholder="キーワードを入力してください"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              disabled={isAdding}
              className="flex-1 text-sm"
            />
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as any)}
              disabled={isAdding}
              className="px-3 py-2 border rounded-md border-input bg-background text-sm"
            >
              <option value="partial">部分一致</option>
              <option value="forward">前方一致</option>
              <option value="backward">後方一致</option>
              <option value="exact">完全一致</option>
              <option value="regex">正規表現</option>
            </select>
            <Button
              type="submit"
              disabled={!newKeyword.trim() || isAdding}
              className="bg-primary whitespace-nowrap"
            >
              {isAdding ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  追加中...
                </>
              ) : (
                '追加'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* NGワード一覧 */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          登録済みNGワード ({settings.muted_comment_keywords.length})
        </Label>
        {settings.muted_comment_keywords.length === 0 ? (
          <div className="border rounded-lg p-6 text-center bg-muted/30">
            <p className="text-sm text-muted-foreground">NGワードが登録されていません</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {settings.muted_comment_keywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs px-2 py-1 rounded bg-background border border-border truncate">
                      {keyword.pattern}
                    </code>
                    <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-medium whitespace-nowrap">
                      {getMatchTypeLabel(keyword.match)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveKeyword(index)}
                  className="whitespace-nowrap"
                >
                  削除
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 正規化設定 */}
      <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="normalize"
            checked={settings.mute_comment_keywords_normalize_alphanumeric_width_case}
            onChange={(e) =>
              updateSettings({
                mute_comment_keywords_normalize_alphanumeric_width_case: e.target.checked,
              })
            }
            className="w-4 h-4 rounded border border-input cursor-pointer"
          />
          <Label htmlFor="normalize" className="font-semibold cursor-pointer">
            キーワードの正規化を有効にする
          </Label>
        </div>
        <p className="text-xs text-muted-foreground ml-6">
          英数字の全角・半角、大文字・小文字を区別しないようにします
        </p>
      </div>
    </div>
  )
}
