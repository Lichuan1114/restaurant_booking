import { Restaurant } from "@/types/restaurant";

type Props = Pick<Restaurant, "name" | "email" | "phone">;

export default function RestaurantCard({ name, email, phone }: Props) {
    return (
        <div className="border border-gray-700 bg-slate-700 hover:bg-slate-600 transition-colors rounded-2xl h-48 flex items-center justify-center text-center shadow-md p-4 text-white">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">{name}</h2>
                {email && <p className="text-sm text-gray-300">{email}</p>}
                {phone && <p className="text-sm text-gray-300">{phone}</p>}
            </div>
        </div>
    );
}
