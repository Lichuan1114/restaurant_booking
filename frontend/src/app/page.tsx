"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import CustomerLoginForm from "./customer/login/customerLogin";
import RestaurantLoginForm from "./restaurant/login/restaurantLogin";

export default function Home() {
	const [activeTab, setActiveTab] = useState<'customer' | 'restaurant'>('customer');
	const router = useRouter();

	// Check Token
	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) return;

		const verifyToken = async () => {
			try {
				const result = await fetch ('http://localhost:5001/auth-check', {
					headers: {
					Authorization: `Bearer ${token}`
					}
				});

				const data = await result.json();
				console.log("Valid token", data);

			} catch (err) {
				console.error("Invalid token");
			}
		};
		verifyToken();
	}, [])

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
