import { format } from "date-fns";
import { API_V1 } from "./config";

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
 * Build the thumbnail proxy URL for a note.
 * Returns undefined if the note has no thumbnail.
 * Appends a cache-bust `v` param to force reload after upload.
 */
export function thumbnailUrl(
    noteId: number,
    thumbnailKey: string | undefined | null
): string | undefined {
    if (!thumbnailKey) return undefined;
    return `${API_V1}/notes/${noteId}/thumbnail?v=${encodeURIComponent(thumbnailKey)}`;
}