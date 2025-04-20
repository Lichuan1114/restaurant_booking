export interface NewUser {
    name: string;
    password: string;
    email?: string;
    phone?: string;
}

export interface User extends NewUser {
    user_id: number;
    created_at: Date;
}