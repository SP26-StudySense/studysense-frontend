'use client';

import { AuthGuard } from '@/features/auth/components/auth-guard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ProfileLayoutProps {
    children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] font-sans text-neutral-900 selection:bg-[#00bae2] selection:text-white relative overflow-hidden">
                {/* Premium Background Effects */}
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Gradient Blobs */}
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fec5fb]/40 to-[#00bae2]/20 blur-[100px] animate-pulse" />
                    <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00bae2]/30 to-[#fec5fb]/10 blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-[#fec5fb]/20 to-transparent blur-[80px]" />

                    {/* Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #000 1px, transparent 1px),
                                linear-gradient(to bottom, #000 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px'
                        }}
                    />

                    {/* Noise Texture */}
                    <div
                        className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
                        style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Simple Header for Navigation */}
                    <header className="flex h-16 items-center px-6 lg:px-12 backdrop-blur-sm bg-white/30 border-b border-white/50 sticky top-0 z-50">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#00bae2] transition-colors bg-white/50 px-3 py-1.5 rounded-full hover:bg-white/80"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </header>

                    <main className="container mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
