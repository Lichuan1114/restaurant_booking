import SideBar from "@/components/sidebar";

const CustomerSidebarTabs = [
  { label: "Home", href: "/customer/home" },
  { label: "Saved", href: "/customer/saved" },
  { label: "Log Out", href: "/customer/logout" },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-200 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-center tracking-wide">
            Food<span className="text-blue-400">Finder</span>
          </h1>
        </div>
        <SideBar tabs={CustomerSidebarTabs} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-gray-400">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
