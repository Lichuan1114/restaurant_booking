"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CustomerLoginForm() {
    const router = useRouter();
    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    async function onSubmit (e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await fetch ('http://localhost:5001/user-login', {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({ phoneOrEmail, password}),
            })

            const response_msg = await result.json();

            if (result.ok) {
                // Log in Success
                localStorage.setItem("token", response_msg.token);
                console.log("User Login Successfully");
                setErrorMsg('');
                router.push('/customer/home');
            } else {
                // Failed
                console.log("Login error");
                setErrorMsg(response_msg.message || "Log in failed, please try again.");
            }
        } catch (e) {
            setErrorMsg("Frontend Backend connection error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {errorMsg && (
                <p className="text-red-500 mb-4 max-w-md mx-auto">{errorMsg}</p>
            )}
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                <div className="flex flex-col">
                <label htmlFor="phoneOrEmail" className="mb-1 text-sm font-semibold">Phone or Email:</label>
                <input type="text" id="phoneOrEmail" name="phoneOrEmail" value={phoneOrEmail} onChange={(e) => setPhoneOrEmail(e.target.value)} required
                    className="border border-gray-400 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
        
                <div className="flex flex-col">
                <label htmlFor="password" className="mb-1 text-sm font-semibold">Password:</label>
                <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="border border-gray-400 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-40 h-12 px-6 py-3 bg-blue-900 text-white font-semibold rounded-xl shadow-md
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 transition duration-100 cursor-pointer'}`}
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                    <button onClick={() => router.push('/customer/signup')}
                        className="w-40 h-12 px-6 py-3 bg-blue-900 text-white 
                        font-semibold rounded-xl shadow-md hover:bg-blue-700 
                        transition duration-100 cursor-pointer"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
        </>
    );
}
  