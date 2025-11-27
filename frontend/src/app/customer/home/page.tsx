"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RestaurantCard from "@/components/restaurantCard";
import { Restaurant } from "@/types/restaurant";
import  Link from "next/link";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResult = await fetch("http://localhost:5001/customer-home", {
          method: "GET",
          credentials: "include",
        });

        if (!authResult.ok) {
          router.replace("/");
          return;
        }

        const result = await fetch("http://localhost:5001/restaurants-list", {
          method: "GET",
          credentials: "include",
        });

        if (!result.ok) throw new Error("Failed to fetch restaurants");

        const data: Restaurant[] = await result.json();
        setRestaurants(data);
      } catch (error) {
        console.error(error);
        setError("Could not load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading)
    return <p className="text-center mt-20 text-gray-600">Loading restaurants...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-20 text-lg">{error}</p>;

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Discover Restaurants</h2>
        <p>
          Browse your favorite places and save them for later.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((restaurant) => (
          <Link 
            key={restaurant.restaurant_id} 
            href={`/customer/restaurant/${restaurant.restaurant_id}`} 
            className="block cursor-pointer hover:shadow-lg transition rounded-lg"
            >
            <RestaurantCard
              key={restaurant.restaurant_id}
              name={restaurant.name}
              email={restaurant.email}
              phone={restaurant.phone}
          />
          </Link>
        ))}
      </div>
    </div>
  );
}
