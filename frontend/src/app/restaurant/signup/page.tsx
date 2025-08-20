"use client";

import { FormEvent, useState } from "react";
import { NewRestaurant } from "@/types/restaurant";
import { useRouter } from "next/navigation";

export default function RestaurantSignup () {
    const [errorMessage, setErrorMessage] = useState<string | null>(null); 
    const router = useRouter();

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
            console.log("please provide restaurant email or phone number");
            setErrorMessage("please provide restaurant email or phone number");
            return;
        }

        // Check if password and the confirm password is the same
        if (newRestaurant.password != formData.get("res_pwd_check") as string) {
            console.log("Password and Confirm Password different");
            setErrorMessage("Password and Confirm Password different");
            return;
        }

        setErrorMessage(null);

        const response = await fetch('http://localhost:5001/res-signup', {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(newRestaurant),
        });

        const response_msg = await response.json();

        if (response.ok) {
            // Success, navigate back to home page
            console.log("Data recieved in backend");
            router.push("/");
        } else {
            // Failed, prompt to sign up again
            console.log("Sign up error");
            setErrorMessage(response_msg.message || "Sign up failed, please try again.");
        }
    }

    return (
        <>
            {errorMessage && (
                <p className="text-red-500 mb-4 max-w-md mx-auto text-center">{errorMessage}</p>
            )}
            <h1 className="text-3xl text-center">New Restaurant Sign Up</h1>

            <form onSubmit={onSubmit}>
                <label htmlFor="res_name">Restaurant Name:</label><br/>
                <input type="text" id="res_name" name="res_name" required/><br/>
                <label htmlFor="res_email">Restaurant Email:</label><br/>
                <input type="email" id="res_email" name="res_email"/><br/>
                <label htmlFor="res_phone">Restaurant Phone:</label><br/>
                <input type="tel" id="res_phone" name="res_phone"/><br/>
                <label htmlFor="res_capacity">Restaurant Capacity:</label><br/>
                <input type="number" id="res_capacity" name="res_capacity"/><br/>
                <label htmlFor="res_pwd">Password:</label><br/>
                <input type="password" id="res_pwd" name="res_pwd" required/><br/>
                <label htmlFor="res_pwd_check">Confirm Password:</label><br/>
                <input type="password" id="res_pwd_check" name="res_pwd_check" required/><br/>
                <input className="cursor-pointer" type="submit" />
            </form>
        </>
    );
}