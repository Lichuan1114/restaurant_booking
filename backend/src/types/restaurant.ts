
/* Represents a restaurant entity in the system */

export interface Restaurant {
    restaurant_id: number;
    readonly created_at: Date;
    name: string;
    email?: string;
    phone?: string;
    capacity: number;
    address?: string;
    description?: string;
}
