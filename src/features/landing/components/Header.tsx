import Link from 'next/link';
import { GitFork, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
    return (
        <header className="glass-panel fixed left-0 right-0 top-0 z-50 border-b border-neutral-200/60">
            <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
                <Link href="/" className="group flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-[#c1ff72]">
                        <GitFork className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-neutral-900">
                        Dev<span className="text-neutral-500">Path</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-x-8 md:flex">
                    <Link
                        href="#roadmaps"
                        className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Roadmaps
                    </Link>
                    <Link
                        href="#guides"
                        className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Best Practices
                    </Link>
                    <Link
                        href="#community"
                        className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Community
                    </Link>
                </nav>

                <div className="flex items-center gap-x-4">
                    <Link
                        href="/login"
                        className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:block"
                    >
                        Log in
                    </Link>
                    <Link href="/register">
                        <Button className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-neutral-800">
                            Sign Up Free
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};
