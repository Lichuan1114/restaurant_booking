"use client";

import { useRouter } from "next/navigation";

export default function LogoutPage () {
    const router = useRouter();

    async function clearToken(): Promise<undefined> {
        await fetch ("http://localhost:5001/logout", {
            method: "POST",
            credentials: "include"
        });

        console.log("Token deleted");
        router.replace("/");
    }

    return (
        <div>
            <div>Confirm Logout</div>
            <button onClick={() => clearToken()}>Yes</button><br></br>
            <button>No</button>
        </div>
    )
}