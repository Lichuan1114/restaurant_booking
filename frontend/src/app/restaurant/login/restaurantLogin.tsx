import { useRouter } from 'next/navigation';
export default function RestaurantLoginForm() {
    const router = useRouter();
    return (
        <>
            <form className="flex flex-col gap-4">
                <div className="flex flex-col">
                <label htmlFor="phone_or_email" className="mb-1 text-sm font-semibold">Restaurant Phone or Email:</label>
                <input type="text" id="phone_or_email" name="phone_or_email" required
                    className="border border-gray-400 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
        
                <div className="flex flex-col">
                <label htmlFor="password" className="mb-1 text-sm font-semibold">Password:</label>
                <input type="password" id="password" name="password" required
                    className="border border-gray-400 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                    <div className="flex gap-4">
                        <button 
                        className="w-40 h-12 px-6 py-3 bg-blue-900 text-white 
                        font-semibold rounded-xl shadow-md hover:bg-blue-700 
                        transition duration-100 cursor-pointer"
                        >Log in</button>
                        <button onClick={() => router.push('/restaurant/signup')}
                        className="w-40 h-12 px-6 py-3 bg-blue-900 text-white 
                        font-semibold rounded-xl shadow-md hover:bg-blue-700 
                        transition duration-100 cursor-pointer"
                        >Sign Up</button>
                    </div>
            </form>
        </>

    );
  }
  