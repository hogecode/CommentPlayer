'use client'

import React, { ReactNode } from 'react'

interface SettingsErrorBoundaryProps {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * 設定ページ用エラーバウンダリー
 * 子コンポーネントでエラーが発生してもページ全体が崩れないようにする
 */
export class SettingsErrorBoundary extends React.Component<
  SettingsErrorBoundaryProps,
  State
> {
  constructor(props: SettingsErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Settings component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-destructive rounded-lg p-6 bg-destructive/10">
          <h3 className="font-semibold text-destructive mb-2">エラーが発生しました</h3>
          <p className="text-sm text-muted-foreground">
            この設定セクションを読み込むことができません。ページを再読み込みしてください。
          </p>
          {this.state.error && (
            <p className="text-xs text-destructive mt-3 font-mono bg-background/50 p-2 rounded overflow-auto max-h-24">
              {this.state.error.message}
            </p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
