'use client';
type Tab = { label: string, href: string };

type sidebarProps = { tabs: Tab[] }

export default function SideBar ( props: sidebarProps ) {
    return (
        <div className="p-4 space-y-2">
            {props.tabs.map((tab) => (
                <a
                    key = {tab.href}
                    href = {tab.href}
                    className="block w-full px-4 py-2 rounded hover:bg-gray-600"
                > { tab.label } </a>
            ))}
        </div>
    )
}