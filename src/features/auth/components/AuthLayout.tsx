import Link from 'next/link';
import { GitFork } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    subtitle: string;
}

export const AuthLayout = ({ children, subtitle }: AuthLayoutProps) => {
    return (
        <div className="flex min-h-screen w-full bg-[#fafafa]">
            {/* Visual Side (Left on desktop) */}
            <div className="hidden w-1/2 flex-col justify-between bg-neutral-900 p-12 lg:flex">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-900">
                        <GitFork className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        Dev<span className="text-neutral-500">Path</span>
                    </span>
                </div>

                <div className="relative max-w-lg">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-xs font-mono text-[#c1ff72]">
                        git commit -m &quot;started learning&quot;
                    </div>
                    <h1 className="text-4xl font-medium tracking-tight text-white leading-[1.1] lg:text-5xl">
                        Engineer your path to mastery.
                    </h1>
                    <p className="mt-6 text-lg text-neutral-400">
                        Join 500,000+ developers tracking their skills, following roadmaps, and building their
                        careers with DevPath.
                    </p>
                </div>

                <div className="flex items-center gap-8 text-sm text-neutral-500">
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Help</Link>
                </div>
            </div>

            {/* Form Side */}
            <div className="relative flex w-full flex-col items-center justify-center p-6 lg:w-1/2 lg:p-12">
                <div className="grid-lines pointer-events-none absolute inset-0 z-0 opacity-40"></div>

                <div className="relative z-10 w-full max-w-[400px]">
                    {/* Mobile Header */}
                    <div className="mb-8 flex justify-center lg:hidden">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-[#c1ff72]">
                                <GitFork className="h-[18px] w-[18px]" strokeWidth={2.5} />
                            </div>
                            <span className="text-lg font-semibold tracking-tight text-neutral-900">
                                Dev<span className="text-neutral-500">Path</span>
                            </span>
                        </div>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                            {subtitle}
                        </h2>
                        <p className="mt-2 text-sm text-neutral-500">
                            Welcome back to the community.
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};
