"use client";

import { FormEvent, useState } from "react";
import { NewUser } from "@/types/user";
import { useRouter } from "next/navigation";

export default function CustomerSignup() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null); 
    const [loading, setLoading] = useState(false);

    // handle form submit
    async function onSubmit (e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const newUser : NewUser = {
            name: formData.get("full_name") as string,
            password: formData.get("password") as string,
            email: formData.get("email") as string || undefined,
            phone: formData.get("phone") as string || undefined,
            role: 'customer'
        }

        // Basic validation
        if (!newUser.email && !newUser.phone) {
            setErrorMessage("Please provide an email or phone number");
            return;
        }
        if (newUser.password !== formData.get("password_check") as string) {
            setErrorMessage("Password and Confirm Password do not match");
            return;
        }

        setErrorMessage(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/user-signup', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            const response_msg = await response.json();

            if (response.ok) {
                console.log("Signup successful");
                router.push("/");
            } else {
                setErrorMessage(response_msg.message || "Sign up failed, please try again.");
            }
        } catch(error) {
            setErrorMessage("Server connection error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {errorMessage && (
                <p className="text-red-500 mb-4 max-w-md mx-auto">{errorMessage}</p>
            )}
            <h1 className="text-3xl text-center">New Customer Sign Up</h1>
            
            <form
                onSubmit={onSubmit}
                className="p-8 rounded-lg shadow-md max-w-md mx-auto flex flex-col gap-4"
            >
                <div className="flex flex-col">
                    <label htmlFor="full_name">Full Name:</label>
                    <input type="text" id="full_name" name="full_name" required className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" pattern="[0-9]{10,15}" className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required className="border rounded p-2" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="password_check">Confirm Password:</label>
                    <input type="password" id="password_check" name="password_check" required className="border rounded p-2" />
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