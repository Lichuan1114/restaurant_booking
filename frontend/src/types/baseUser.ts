/* Common fields for a new user or restaurant being created */

export interface BaseUser {
    name: string,
    password: string,
    email?: string,
    phone?: string
}