"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
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

    async function clearToken(): Promise<undefined> {
        await fetch ("http://localhost:5001/logout", {
            method: "POST",
            credentials: "include"
        });

        console.log("Token deleted");
        router.replace("/");
    }

    return (
        <>
            <div>{error && <p className="text-red-500">{error}</p>}</div>
            <div>
                <div>Confirm Logout</div>
                <button onClick={() => clearToken()}>Yes</button><br></br>
                <button>No</button>
            </div>
        </>
    )
}