import SideBar from "@/components/sidebar";

export default function CustomerLayout ({ children } : { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <div className="w-1/5 bg-gray-800 text-white">
                <SideBar/>
            </div>
            <div className="w-4/5 p-6 bg-gray-500 overflow-auto">
                {children}
            </div>
        </div>
    )
}