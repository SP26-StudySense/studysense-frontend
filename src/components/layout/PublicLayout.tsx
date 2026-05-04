'use client';

import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] font-sans text-neutral-900 selection:bg-[#00bae2] selection:text-white overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fec5fb]/40 to-[#00bae2]/20 blur-[100px] animate-pulse" />
                <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00bae2]/30 to-[#fec5fb]/10 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-[#fec5fb]/20 to-transparent blur-[80px]" />
                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #000 1px, transparent 1px),
                            linear-gradient(to bottom, #000 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Header */}
            <div className="relative z-20">
                <Header />
            </div>

            {/* Page Content */}
            <main className="relative z-10 flex flex-col pt-24 min-h-[calc(100vh-200px)]">
                {children}
            </main>

            {/* Footer */}
            <div className="relative z-10">
                <Footer />
            </div>
        </div>
    );
}
