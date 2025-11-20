import { Inter } from 'next/font/google';
import '../globals.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Warefy - AI Supply Chain Optimizer',
    description: 'Next-generation supply chain management powered by AI',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <div className="flex pt-16">
                        <Sidebar />
                        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
