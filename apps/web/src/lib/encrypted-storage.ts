import type { PersistStorage } from 'zustand/middleware'

declare const CryptoJS: any

/**
 * CryptoJS を使用した暗号化ストレージ実装
 * ローカルストレージに保存される値を AES で暗号化
 */
const ENCRYPTION_KEY = 'CommePlayer_2024_Secret_Key_BRA'

export class EncryptedStorage implements PersistStorage<any> {
  getItem(key: string): any | undefined {
    const value = localStorage.getItem(key)

    if (value) {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY)
        const decryptedValue = decryptedBytes.toString(CryptoJS.enc.Utf8)
        return decryptedValue ? JSON.parse(decryptedValue) : undefined
      } catch (error) {
        console.error(`復号化に失敗しました (${key}):`, error)
        return undefined
      }
    }

    return value
  }

  setItem(key: string, value: any): void {
    try {
      const stringValue = JSON.stringify(value)
      const encrypted = CryptoJS.AES.encrypt(stringValue, ENCRYPTION_KEY).toString()
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error(`暗号化に失敗しました (${key}):`, error)
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`削除に失敗しました (${key}):`, error)
    }
  }
}
