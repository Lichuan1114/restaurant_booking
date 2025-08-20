import { BaseUser } from './baseUser'

/* Structure used when creating a new customer in forms or API calls */
export interface NewUser extends BaseUser {
    role: 'customer';
}

/* Structure returned by the backend after user creation or login */
export interface User extends NewUser {
    user_id: number;
    readonly created_at: Date;
}