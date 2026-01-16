import Link from 'next/link';
import { GitFork, Twitter, Github, Disc } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="mx-auto max-w-[1400px] px-6 pb-12 lg:px-12">
            <div className="flex flex-col justify-between gap-12 border-t border-neutral-200 pt-12 md:flex-row">
                <div className="max-w-xs space-y-4">
                    <Link href="#" className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-900 text-[#c1ff72]">
                            <GitFork width="14" />
                        </div>
                        <span className="font-semibold text-neutral-900">DevPath</span>
                    </Link>
                    <p className="text-sm text-neutral-500">
                        The #1 community-driven learning roadmap platform. Open source and free for everyone.
                    </p>
                </div>

                <div className="flex flex-wrap gap-12 md:gap-24">
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            Roadmaps
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-600">
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    Frontend
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    Backend
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    DevOps
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    AI &amp; Data
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            Resources
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-600">
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    Guides
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    Videos
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    Conferences
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            Project
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-600">
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    GitHub Repo
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="transition-colors hover:text-neutral-900">
                                    Sponsor
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="mt-12 flex items-center justify-between border-t border-neutral-100 pt-8 text-xs text-neutral-400">
                <p>© 2024 DevPath. CC BY-NC-SA 4.0</p>
                <div className="flex gap-4">
                    <Link href="#" className="hover:text-neutral-900">
                        <Twitter />
                    </Link>
                    <Link href="#" className="hover:text-neutral-900">
                        <Github />
                    </Link>
                    <Link href="#" className="hover:text-neutral-900">
                        <Disc />
                    </Link>
                </div>
            </div>
        </footer>
    );
};
