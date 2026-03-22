
export interface AuthRequest {
    email: string;
    password: string;
    username?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    message?: string;
    user_id?: number;
}

export interface ApiError {
    error: string;
    [key: string]: unknown;
}