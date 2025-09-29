"use client";

import { FormEvent, useState } from "react";
import { NewRestaurant } from "@/types/restaurant";
import { useRouter } from "next/navigation";

export default function RestaurantSignup () {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null); 
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const newRestaurant : NewRestaurant = {
            name: formData.get("res_name") as string,
            password: formData.get("res_pwd") as string,
            email: formData.get("res_email") as string || undefined,
            phone: formData.get("res_phone") as string || undefined,
            capacity: Number(formData.get("res_capacity")),
            role: 'restaurant'
        }

        // Check if either email or phone is provided
        if (!newRestaurant.email && !newRestaurant.phone) {
            setErrorMessage("please provide restaurant email or phone number");
            return;
        }

        // Check if password and the confirm password is the same
        if (newRestaurant.password != formData.get("res_pwd_check") as string) {
            setErrorMessage("Password and Confirm Password different");
            return;
        }

        setErrorMessage(null);
        setLoading(true);

        const response = await fetch('http://localhost:5001/res-signup', {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(newRestaurant),
            credentials: "include",
        });

        const response_msg = await response.json();

        if (response.ok) {
            router.push("/restaurant/home");
        } else {
            setErrorMessage(response_msg.message || "Sign up failed, please try again.");
        }
    }

    return (
        <>
            {errorMessage && (
                <p className="text-red-500 mb-4 max-w-md mx-auto text-center">{errorMessage}</p>
            )}
            <h1 className="text-3xl text-center">New Restaurant Sign Up</h1>

            <form
                onSubmit={onSubmit}
                className="p-8 rounded-lg shadow-md max-w-md mx-auto flex flex-col gap-4"
            >
                <div className="flex flex-col">
                    <label htmlFor="res_name">Restaurant Name:</label>
                    <input type="text" id="res_name" name="res_name" required className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="res_email">Restaurant Email:</label>
                    <input type="email" id="res_email" name="res_email" className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="res_phone">Restaurant Phone:</label>
                    <input type="tel" id="res_phone" name="res_phone" pattern="[0-9]{10,15}" className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="res_capacity">Restaurant Capacity:</label>
                    <input type="number" id="res_capacity" name="res_capacity" className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="res_pwd">Password:</label>
                    <input type="password" id="res_pwd" name="res_pwd" required className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="res_pwd_check">Confirm Password:</label>
                    <input type="password" id="res_pwd_check" name="res_pwd_check" required className="border rounded p-2" />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 bg-blue-900 text-white rounded ${
                        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Creating..." : "Sign Up"}
                </button>
            </form>
        </>
    );
}