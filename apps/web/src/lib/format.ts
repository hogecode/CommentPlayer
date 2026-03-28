import { format } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * Format a date string to a full readable date.
 */
export function formatDate(dateStr: string): string {
    try {
        return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
        return dateStr;
    }
}

/**
 * Format a date string to date + time.
 */
export function formatDateTime(dateStr: string): string {
    try {
        return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch {
        return dateStr;
    }
}

/**
 * Format a date to Japanese date and time format.
 * e.g., "2026/03/24 09:47"
 */
export function formatDateTimeJP(date: Date | string): string {
    try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return format(dateObj, "yyyy/MM/dd HH:mm", { locale: ja });
    } catch {
        return typeof date === "string" ? date : date.toString();
    }
}

/**
 * Format file size in bytes to human-readable.
 * 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format seconds to time format.
 * 3661 → "1:01:01", 90 → "1:30"
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format video date with start time, end time and duration.
 * e.g., "2026/03/26 (木) 23:56 ～ 00:26 (30分)"
 */
export function formatVideoDateTimeWithDuration(date: Date | string, durationSeconds: number): string {
    try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        
        // Start date and time
        const startFormatted = format(dateObj, "yyyy/MM/dd (E) HH:mm", { locale: ja });
        
        // Calculate end time
        const endDate = new Date(dateObj.getTime() + durationSeconds * 1000);
        const endFormatted = format(endDate, "HH:mm", { locale: ja });
        
        // Format duration in minutes
        const minutes = Math.round(durationSeconds / 60);
        
        return `${startFormatted} ～ ${endFormatted} (${minutes}分)`;
    } catch {
        return typeof date === "string" ? date : date.toString();
    }
}
