
/* Represents a user account in the system */

export interface User {
    user_id: number;
    name: string;
    email?: string;
    phone?: string;
    readonly created_at?: Date;
    role?: string;
}
