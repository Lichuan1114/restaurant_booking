import { Restaurant } from "@/types/restaurant";

type Props = Pick<Restaurant, "name" | "email" | "phone">;

export default function RestaurantCard({ name, email, phone }: Props) {
    return (
        <div className="border bg-amber-600 rounded-2xl h-48 flex items-center justify-center text-center shadow-md p-4">
            <div className="space-y-2">
                <h2>Restaurant Name: {name}</h2>
                { email && <p>Email: {email}</p>}
                { phone && <p>Phone: {phone}</p>}
            </div>
        </div>
    )
}