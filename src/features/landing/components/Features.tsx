import { Map, CheckSquare, Users } from 'lucide-react';

export const Features = () => {
    return (
        <section className="mx-auto mb-24 max-w-[1400px] px-6 lg:px-12">
            <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-medium tracking-tight text-neutral-900">
                    Stop learning randomly.
                </h2>
                <p className="text-neutral-500">
                    The internet is full of tutorials. We provide the structure. Choose a path and follow it
                    from beginner to expert.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Item 1 */}
                <div className="group rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition-transform duration-300 group-hover:scale-110">
                        <Map width="24" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">Role-based Paths</h3>
                    <p className="text-sm leading-relaxed text-neutral-500">
                        Don&apos;t know what to learn next? Follow our standardized roadmaps for Frontend,
                        Backend, DevOps, and more.
                    </p>
                </div>
                {/* Item 2 */}
                <div className="group rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition-transform duration-300 group-hover:scale-110">
                        <CheckSquare width="24" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">Track Progress</h3>
                    <p className="text-sm leading-relaxed text-neutral-500">
                        Mark topics as done. Save resources. Visualize your journey as you conquer complex
                        topics.
                    </p>
                </div>
                {/* Item 3 */}
                <div className="group rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition-transform duration-300 group-hover:scale-110">
                        <Users width="24" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">Community Verified</h3>
                    <p className="text-sm leading-relaxed text-neutral-500">
                        Content is open-source and maintained by thousands of top developers. Always up to date.
                    </p>
                </div>
            </div>
        </section>
    );
};
