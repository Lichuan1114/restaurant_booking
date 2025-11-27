"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const [error, setError] = useState<string | null>(null);
    const [open_time, setOpenTime] = useState<string | number>();
    const [last_booking_time, setLastBookingTime] = useState<string | number>();
    const [close_time, setCloseTime] = useState<string | number>();
    
    useEffect(() => {
        const restaurantHome = async () => {
            try {
                const res = await fetch("http://localhost:5001/restaurant-home", {
                    method: "GET",
                    credentials: "include"
                });
                if (!res.ok) {
                    throw new Error("Failed to reach restaurant home");
                } else {
                    setError("This is restaurant home!");
                }
            } catch (error) {
                console.error(error);
            }
        };

        restaurantHome();
    }, []);

    async function update_hours(e: React.FormEvent): Promise<undefined> {
        e.preventDefault();

        await fetch ("http://localhost:5001/restaurant/update-hours", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ open_time, last_booking_time, close_time })
        });
    }

    async function generate_slots(e: React.FormEvent) {
        e.preventDefault();

        await fetch ("http://localhost:5001/restaurant/generate-slots", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });
    }

    return (
        <>
            <div>{error && <p className="text-red-500">{error}</p>}</div>

            <div>
                <div>Update Hours</div>
                <form onSubmit={update_hours}>
                    <div>
                        <label htmlFor="open_time">Open time:</label>
                        <input type="time" id="open_time" name="open_time" value={open_time} onChange={(e) => setOpenTime(e.target.value)}/>

                        <label htmlFor="last_booking_time">Last Booking time:</label>
                        <input type="time" id="last_booking_time" name="last_booking_time" value={last_booking_time} onChange={(e) => setLastBookingTime(e.target.value)}/>

                        <label htmlFor="close_time">Close time:</label>
                        <input type="time" id="close_time" name="close_time" value={close_time} onChange={(e) => setCloseTime(e.target.value)}/>

                        <button type="submit">Update Hours</button>
                    </div>
                </form>
            </div>
            <button type="button" className="text-amber-300 bg-amber-950" onClick={generate_slots}>Generate Time Slots for the next 7 days</button>
        </>
    )
}