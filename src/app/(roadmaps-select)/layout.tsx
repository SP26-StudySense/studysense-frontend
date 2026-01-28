import { Header } from '@/features/landing/components/Header';

export default function RoadmapsSelectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe]">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fec5fb]/40 to-[#00bae2]/20 blur-[100px] animate-pulse" />
                <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00bae2]/30 to-[#fec5fb]/10 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="relative z-20">
                <Header />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-12 pt-24 max-w-7xl">
                {children}
            </main>
        </div>
    );
}
