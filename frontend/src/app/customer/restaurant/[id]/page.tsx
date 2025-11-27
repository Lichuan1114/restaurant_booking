"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Restaurant } from "@/types/restaurant";
import type { Slot } from "@/types/slot";

export default function RestaurantPage () {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [groupedSlots, setGroupedSlots] = useState<Record<string, Slot[]>>({});

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const restaurantData = await fetch(
                    `http://localhost:5001/restaurant/${id}`,
                    { method: "GET", credentials: "include" }
                );
                setRestaurant(await restaurantData.json());

                const resSlots = await fetch(
                    `http://localhost:5001/restaurant/${id}/slots`,
                    { method: "GET", credentials: "include" }
                )
                const data: Slot[] = await resSlots.json();

                const groupedData = data.reduce((acc: Record<string, Slot[]>, slot) => {
                    const date = slot.slot_date;
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(slot);
                    return acc;
                }, {})
                setGroupedSlots(groupedData);

            } catch (error) {
                console.error("fetch error:", error);
            }
        };

        fetchData();
    }, [id]);

    return (
        <>
            {restaurant ? (
                <div> 
                    <div className="text-4xl font-bold text-center">{restaurant.name}</div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        { restaurant.email && <p className="text-left">Email: {restaurant.email}</p> }
                        { restaurant.phone && <p className="text-left">Phone: {restaurant.phone}</p> }
                    </div>
                </div>
            ) : (
                <p>Loading restaurant...</p>
            )}

            <div>
                {Object.entries(groupedSlots).map(([date, slots]) => (
                    <div key={date} className="mb-4">
                        <h3>{new Date(date).toLocaleDateString()}</h3>

                        <div className="flex gap-2 flex-wrap">
                            {slots.map(slot => (
                                <button key={slot.slot_id} className={`px-3 py-1 rounded border hover:shadow-lg transition
                                ${slot.capacity_left > 0 ? "bg-slate-600 text-white hover:bg-slate-500 cursor-pointer" : "bg-gray-500 text-gray-300"}`}>
                                    {slot.slot_time}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
