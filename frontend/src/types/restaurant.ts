export interface NewRestaurant {
    name: string;
    password: string;
    email?: string;
    phone?: string;
    capacity: number;
}

export interface Restaurant extends NewRestaurant {
    restaurant_id: number;
    created_at: Date;
}