"use client";

import { FormEvent, useState } from "react";
import { NewUser } from "@/types/user";
import { useRouter } from "next/navigation";

export default function CustomerSignup() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null); 
    const router = useRouter();

    // handle form submit
    async function onSubmit (e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const newUser : NewUser = {
            name: formData.get("full_name") as string,
            password: formData.get("password") as string,
            email: formData.get("email") as string || undefined,
            phone: formData.get("phone") as string || undefined,
        }

        // Check if either email or phone is provided
        if (!newUser.email && !newUser.phone) {
            console.log("please provide email or phone number");
            setErrorMessage("please provide email or phone number");
            return;
        }

        // Check if password and the confirm password is the same
        if (newUser.password != formData.get("password_check") as string) {
            console.log("Password and Confirm Password different");
            setErrorMessage("Password and Confirm Password different");
            return;
        }

        // when everything is good to send to the backend
        setErrorMessage(null);

        const response = await fetch('http://localhost:5001/user-signup', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
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
                <p className="text-red-500 mb-4 max-w-md mx-auto">{errorMessage}</p>
            )}
            <h1 className="text-3xl text-center">New Customer Sign Up</h1>
            
            <form className="p-8 rounded-lg shadow-md max-w-md mx-auto" onSubmit={onSubmit}>
                <label htmlFor="full_name">Full Name:</label><br/>
                <input type="text" id="full_name" name="full_name" required/><br/>
                <label htmlFor="email">Email:</label><br/>
                <input type="email" id="email" name="email" /><br/>
                <label htmlFor="phone">Phone:</label><br/>
                <input type="tel" id="phone" name="phone" pattern="[0-9]{10,15}" /><br/>
                <label htmlFor="password">Password:</label><br/>
                <input type="password" id="password" name="password" required/><br/>
                <label htmlFor="password_check">Confirm Password:</label><br/>
                <input type="password" id="password_check" name="password_check" required/><br/>
                <input className="cursor-pointer" type="submit" />
            </form>
        </>
    );
}