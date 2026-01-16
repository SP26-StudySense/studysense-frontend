export const CTA = () => {
    return (
        <section className="mx-auto mb-20 max-w-[1400px] px-6 lg:px-12">
            <div className="relative overflow-hidden rounded-[32px] bg-[#c1ff72] p-12 text-center">
                <div className="relative z-10 mx-auto max-w-2xl">
                    <h2 className="mb-6 text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
                        Ready to start your journey?
                    </h2>
                    <p className="mb-8 text-lg font-medium text-neutral-800">
                        Join 500,000+ developers learning together.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <button className="rounded-full bg-neutral-900 px-8 py-4 font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-neutral-800">
                            Get Started for Free
                        </button>
                        <button className="rounded-full border border-neutral-900/10 bg-white/50 px-8 py-4 font-semibold text-neutral-900 backdrop-blur transition-all hover:bg-white/80">
                            View All Roadmaps
                        </button>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div
                    className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-40"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 10% 20%, white 0%, transparent 20%), radial-gradient(circle at 90% 80%, white 0%, transparent 20%)',
                    }}
                ></div>
            </div>
        </section>
    );
};

