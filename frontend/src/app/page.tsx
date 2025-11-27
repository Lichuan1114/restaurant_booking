"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import CustomerLoginForm from "./customer/login/customerLogin";
import RestaurantLoginForm from "./restaurant/login/restaurantLogin";

export default function Home() {
	const [activeTab, setActiveTab] = useState<'customer' | 'restaurant'>('customer');
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	
	// Check Token
	useEffect(() => {
		async function checkToken() {
			try {
				const res = await fetch("http://localhost:5001/auth-check", {
					method: "GET",
					credentials: "include"
				})

				if (res.ok) {
					const data = await res.json();
					console.log("Authenticated user:", data.user);
		  
					if (data.user.role === "restaurant") {
					  router.replace("/restaurant/home");
					} else {
					  router.replace("/customer/home"); 
					}
					return;
				}

			} catch (err) {
				console.error("Auth check failed", err);
			} finally {
				setLoading(false);
			}
		}
		checkToken();
	}, [router]);

	if (loading) {
		return <p>Checking session...</p>;
	}

	return (
		<div 
			className="w-full max-w-5xl mx-auto mt-20 p-6 rounded-xl" 
			style={{ backgroundColor: "#808080"}}
		>
			<div className="flex justify-center gap-4 mb-6">
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === 'customer' 
							? 'border-b-2 border-blue-600' 
							: 'text-gray-500'
					}`}
					onClick={() => setActiveTab('customer')}
				> 
					Customer
				</button>
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === 'restaurant' 
							? 'border-b-2 border-blue-600' 
							: 'text-gray-500'
					}`}
					onClick={() => setActiveTab('restaurant')}        
				>
					Restaurant
				</button>
			</div>

			{ activeTab === 'customer' ? (
				// customer tab active
				<div className="flex flex-col items-center justify-center gap-4">
					<CustomerLoginForm />
				</div>
			) : (
				// restaurant tab active
				<div className="flex flex-col items-center justify-center gap-4">
					<RestaurantLoginForm/>
				</div>
			)}
		</div>  
	);
}
