"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "@/components/restaurantCard";
import { Restaurant } from "@/types/restaurant";

export default function HomePage() {
    const [restaurants, setRestaurants] = useState([]); 

    useEffect(() => {
        fetch("http://localhost:5001/restaurants-list")
            .then(res => res.json())
            .then(data => setRestaurants(data));
    }, []);

    return (
        <div className="flex h-screen">
            <div className="w-1/5" id="sideBar">Side bar</div>
            <div className="w-4/5 bg-gray-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 mx-auto">
                { restaurants.map((restaurant: Restaurant) => (
                    <RestaurantCard
                        name = {restaurant.name}
                        email= {restaurant.email}
                        phone= {restaurant.phone}
                    />
                ))}
            </div>
        </div>
    );
}