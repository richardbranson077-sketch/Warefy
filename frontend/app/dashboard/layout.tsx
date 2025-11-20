import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex pt-16">
                <Sidebar />
                <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
