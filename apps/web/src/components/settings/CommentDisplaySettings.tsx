'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

export function CommentDisplaySettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleMaxCommentsChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) {
      updateSettings({ max_comments_display_count: num })
    }
  }

  const handleDefaultColorChange = (value: string) => {
    // カラーピッカーまたはテキスト入力から色を更新
    let color = value.trim()
    
    // 空の場合は処理しない
    if (!color) return
    
    // # がない場合は追加
    if (!color.startsWith('#')) {
      color = `#${color}`
    }
    
    // 16進数カラーコード形式を検証（大文字小文字両対応）
    const normalizedColor = color.toUpperCase()
    if (/^#[0-9A-F]{6}$/.test(normalizedColor)) {
      updateSettings({ default_comment_color: normalizedColor })
      console.log('Color updated to:', normalizedColor)
    } else if (color.length < 7) {
      // 入力途中の可能性があるので、エラーはログしない
    } else {
      console.warn('Invalid color format:', value)
    }
  }

  return (
    <div className="space-y-6">
      {/* 最大コメント数設定 */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="max-comments" className="text-base font-semibold">
            表示するコメントの最大数
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            動画が受け取った全てのコメントをこの値でフィルタリングします（例：5000コメント受け取っても500コメントしか表示しない）
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            id="max-comments"
            type="number"
            min="1"
            value={settings.max_comments_display_count}
            onChange={(e) => handleMaxCommentsChange(e.target.value)}
            className="max-w-xs"
          />
          <span className="text-sm text-muted-foreground">コメント</span>
        </div>
      </div>

      {/* デフォルトコメント色設定 */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="default-color" className="text-base font-semibold">
            デフォルトのコメント色
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            コメント送信時のデフォルト色を設定します
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            id="default-color"
            type="color"
            value={settings.default_comment_color}
            onChange={(e) => handleDefaultColorChange(e.target.value)}
            className="h-10 w-20 cursor-pointer rounded border border-input"
          />
          <Input
            type="text"
            value={settings.default_comment_color.toUpperCase()}
            onChange={(e) => handleDefaultColorChange(e.target.value)}
            placeholder="#FFFFFF"
            maxLength={7}
            className="max-w-xs"
          />
        </div>
      </div>
    </div>
  )
}
