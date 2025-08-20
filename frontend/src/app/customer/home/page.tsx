"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "@/components/restaurantCard";
import { Restaurant } from "@/types/restaurant";

export default function HomePage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]); 
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await fetch("http://localhost:5001/restaurants-list");
                if (!res.ok) {
                    throw new Error("Failed to fetch restaurants");
                }
                const data: Restaurant[] = await res.json();
                setRestaurants(data);
            } catch (error) {
                console.error(error);
                setError("Could not load restaurants");
            }
        };

        fetchRestaurant();
    }, []);

    return (
        <div className=" bg-gray-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 mx-auto">
            {error && <p className="text-red-500">{error}</p>}
            { restaurants.map((restaurant: Restaurant) => (
                <RestaurantCard
                    name = {restaurant.name}
                    email= {restaurant.email}
                    phone= {restaurant.phone}
                />
            ))}
        </div>
    );
}