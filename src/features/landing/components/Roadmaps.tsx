import Link from 'next/link';
import {
    ArrowRight,
    Monitor,
    FileCode,
    Boxes,
    Server,
    Globe,
    Database,
    Container,
    BrainCircuit,
    LayoutTemplate,
} from 'lucide-react';

export const Roadmaps = () => {
    return (
        <section id="roadmaps" className="mx-auto mb-24 max-w-[1400px] px-6 lg:px-12">
            <div className="mb-10 flex items-end justify-between">
                <h2 className="text-3xl font-medium tracking-tight text-neutral-900 md:text-4xl">
                    Explore Roadmaps
                </h2>
                <Link
                    href="#"
                    className="hidden items-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 md:flex"
                >
                    View all paths <ArrowRight className="ml-1" />
                </Link>
            </div>

            <div className="auto-rows-fr grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Frontend (Large Vertical) */}
                <div className="group relative row-span-2 flex flex-col justify-between overflow-hidden rounded-[32px] bg-neutral-900 p-8 transition-all duration-500 hover:scale-[1.01]">
                    <div className="absolute right-0 top-0 p-8 opacity-20 transition-opacity group-hover:opacity-40">
                        <LayoutTemplate width="120" className="text-neutral-500" />
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#c1ff72] backdrop-blur">
                            <Monitor width="24" />
                        </div>
                        <h3 className="mb-2 text-2xl font-semibold text-white">Frontend Engineering</h3>
                        <p className="mb-6 max-w-xs text-sm text-neutral-400">
                            Master HTML, CSS, Javascript, and modern frameworks like React and Vue. Build
                            responsive, accessible interfaces.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-neutral-300">
                                <FileCode className="text-blue-400" />
                                <span>HTML &amp; Accessibility</span>
                                <span className="ml-auto rounded bg-neutral-800 px-1.5 py-0.5 text-[10px]">
                                    Basics
                                </span>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-neutral-300">
                                <Boxes className="text-yellow-400" />
                                <span>Component Architecture</span>
                                <span className="ml-auto rounded bg-neutral-800 px-1.5 py-0.5 text-[10px]">
                                    Adv
                                </span>
                            </div>
                        </div>
                        <button className="mt-8 w-full rounded-full bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200">
                            Start Path
                        </button>
                    </div>
                </div>

                {/* Card 2: Backend (Wide) */}
                <div className="group relative col-span-1 flex flex-col items-center justify-between overflow-hidden rounded-[32px] border border-indigo-100 bg-[#eef2ff] p-8 transition-all duration-500 hover:scale-[1.01] md:col-span-2 md:flex-row">
                    <div className="relative z-10 md:w-1/2">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                            <Server width="24" />
                        </div>
                        <h3 className="mb-2 text-2xl font-semibold text-neutral-900">Backend Development</h3>
                        <p className="mb-6 max-w-sm text-sm text-neutral-600">
                            Dive deep into server-side logic, databases, APIs, and authentication. Learn Python,
                            Go, Node.js and SQL.
                        </p>
                        <Link
                            href="#"
                            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:underline"
                        >
                            Explore Curriculum <ArrowRight className="ml-1" />
                        </Link>
                    </div>
                    {/* Visual representation of DB connection */}
                    <div className="relative mt-6 flex h-40 w-full items-center justify-center md:mt-0 md:h-full md:w-1/2">
                        <div className="flex items-center gap-4 opacity-80 transition-opacity group-hover:opacity-100">
                            <div className="rounded-xl border border-indigo-50 bg-white p-4 shadow-lg">
                                <Globe className="text-neutral-400" width="24" />
                            </div>
                            <div className="flex gap-1">
                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300"></div>
                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300 delay-75"></div>
                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300 delay-150"></div>
                            </div>
                            <div className="rounded-xl border border-indigo-50 bg-white p-4 shadow-lg">
                                <Database className="text-indigo-600" width="24" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: DevOps (Square) */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-neutral-200 bg-white p-8 transition-all duration-500 hover:shadow-lg">
                    <div>
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900">
                            <Container width="20" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-neutral-900">DevOps</h3>
                        <p className="text-sm text-neutral-500">
                            Containerization, CI/CD, and Cloud Infrastructure.
                        </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-600">
                            docker
                        </span>
                        <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-600">
                            k8s
                        </span>
                        <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-600">
                            aws
                        </span>
                    </div>
                </div>

                {/* Card 4: AI/Data (Square) */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-green-100 bg-[#f0fdf4] p-8 transition-all duration-500 hover:scale-[1.01]">
                    <div>
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm">
                            <BrainCircuit width="20" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-neutral-900">AI &amp; Data</h3>
                        <p className="text-sm text-neutral-600">
                            Machine Learning, Data Science pipelines, and LLMs.
                        </p>
                    </div>
                    <div className="relative mt-6 h-12 w-full overflow-hidden rounded-lg border border-green-100 bg-white/50">
                        {/* Tiny chart visualization */}
                        <div className="absolute bottom-0 left-0 right-0 flex h-8 items-end gap-1 px-2 pb-1">
                            <div className="h-[30%] w-1/5 rounded-t-sm bg-green-200"></div>
                            <div className="h-[50%] w-1/5 rounded-t-sm bg-green-300"></div>
                            <div className="h-[40%] w-1/5 rounded-t-sm bg-green-400"></div>
                            <div className="h-[80%] w-1/5 rounded-t-sm bg-green-500"></div>
                            <div className="h-[60%] w-1/5 rounded-t-sm bg-[#c1ff72]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
