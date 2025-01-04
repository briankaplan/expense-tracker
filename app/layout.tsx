import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Link from 'next/link';
import { Shield } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Expense Tracker',
    description: 'Track and manage your expenses efficiently',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="min-h-screen bg-background">
                        <nav className="border-b">
                            <div className="container mx-auto px-4">
                                <div className="flex h-16 items-center justify-between">
                                    <div className="flex items-center">
                                        <Link href="/" className="text-xl font-bold">
                                            Expense Tracker
                                        </Link>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Link 
                                            href="/expenses" 
                                            className="text-sm font-medium transition-colors hover:text-primary"
                                        >
                                            Expenses
                                        </Link>
                                        <Link 
                                            href="/reports" 
                                            className="text-sm font-medium transition-colors hover:text-primary"
                                        >
                                            Reports
                                        </Link>
                                        <Link 
                                            href="/settings" 
                                            className="text-sm font-medium transition-colors hover:text-primary"
                                        >
                                            Settings
                                        </Link>
                                        <Link 
                                            href="/nexus" 
                                            className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                                        >
                                            <Shield size={16} />
                                            <span>Nexus</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </nav>
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
} 