"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'customer' | 'restaurant'>('customer');
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 p-6 rounded-xl" style={{ backgroundColor: "#808080"}}>
      <div className="flex justify-center gap-4 mb-6">
        <button
        className={`px-4 py-2 font-semibold ${activeTab === 'customer' ? 'border-b-2 border-blue-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('customer')}
        >Customer</button>
        <button
        className={`px-4 py-2 font-semibold ${activeTab === 'restaurant' ? 'border-b-2 border-blue-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('restaurant')}        
        >Restaurant</button>
      </div>
      { activeTab === 'customer' ? 
        // customer tab active
        (<div className="flex items-center justify-center gap-4">
        <button
          className="px-6 py-3 bg-blue-900 text-white 
          font-semibold rounded-xl shadow-md hover:bg-blue-700 
          transition duration-100 cursor-pointer"
          >Log in</button>
        <button onClick={() => router.push('/customer/signup')}
          className="px-6 py-3 bg-blue-900 text-white 
          font-semibold rounded-xl shadow-md hover:bg-blue-700 
          transition duration-100 cursor-pointer"
          >Sign Up</button>
        </div>) : 
        // restaurant tab active
        (<p>restaurant tab content</p>)  
      }


    </div>  

  );
}
