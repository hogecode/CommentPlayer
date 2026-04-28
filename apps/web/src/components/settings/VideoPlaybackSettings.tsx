'use client'

import { useSettingsStore } from '@/stores/settings-store'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function VideoPlaybackSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleEnablePlaybackButtonChange = (checked: boolean) => {
    updateSettings({ enable_playback_button: checked })
  }

  return (
    <div className="space-y-6">
      {/* ビデオ再生ボタン有効化設定 */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="enable-playback-button" className="text-base font-semibold">
            キャプチャからビデオを再生
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            キャプチャ詳細ページでビデオを再生するボタンを表示するか設定します
          </p>
        </div>
        <Switch
          id="enable-playback-button"
          checked={settings.enable_playback_button ?? true}
          onCheckedChange={handleEnablePlaybackButtonChange}
          aria-label="ビデオ再生ボタンを有効化"
        />
      </div>
    </div>
  )
}
