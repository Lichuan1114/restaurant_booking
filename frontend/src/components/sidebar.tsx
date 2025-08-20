'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Link tabs used in the sidebar */
const sidebarTabs = [
    { label: 'Home', href: '/customer/home' },
    { label: 'Saved', href: '/customer/saved' },
    { label: 'Log Out', href: '/customer/logout' }
];

export default function SideBar () {
    const pathname = usePathname();

    return (
        <div className="p-4 space-y-2">
            {sidebarTabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`block w-full text-left px-4 py-2 rounded ${
                        pathname === tab.href 
                            ? 'bg-gray-700 text-white font-bold' 
                            : 'hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    )
}