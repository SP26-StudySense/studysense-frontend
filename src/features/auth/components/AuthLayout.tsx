import { ReactNode } from 'react';
import Link from 'next/link';
import { GitFork } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    subtitle?: string;
}

export const AuthLayout = ({ children, subtitle }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-[#fafafa] font-sans selection:bg-[#00bae2] selection:text-white flex flex-col items-center justify-center p-4">
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
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Noise Texture */}
                <div
                    className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-[440px] space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="mb-8 flex items-center gap-2 group cursor-pointer">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-neutral-900/20">
                            <GitFork size={20} />
                        </div>
                        <span className="text-xl font-bold text-neutral-900">StudySense</span>
                    </Link>

                    <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                        {subtitle || 'Welcome back'}
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500">
                        Enter your credentials to access your account
                    </p>
                </div>

                {/* Content (Form) */}
                {children}
            </div>

            {/* Footer copyright */}
            <div className="relative z-10 mt-8 text-center text-xs text-neutral-400">
                &copy; {new Date().getFullYear()} StudySense. All rights reserved.
            </div>
        </div>
    );
};
