import { BaseUser } from "./baseUser";

/* Form payload / request format for creating a new restaurant */
export interface NewRestaurant extends BaseUser {
    role: 'restaurant';
    capacity: number;
}

/* Restaurant object returned by API, including IDs and timestamps */
export interface Restaurant extends NewRestaurant {
    restaurant_id: number;
    readonly created_at: Date;
}