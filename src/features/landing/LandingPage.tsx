import { CTA } from './components/CTA';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Roadmaps } from './components/Roadmaps';
import { SkillGraph } from './components/SkillGraph';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-neutral-900 selection:bg-[#c1ff72] selection:text-black">
            <Header />
            <div className="grid-lines pointer-events-none fixed inset-0 z-0 opacity-60"></div>
            <main className="relative z-10 flex flex-col pt-24 pb-12">
                <Hero />
                <Marquee />
                <Features />
                <Roadmaps />
                <SkillGraph />
                <CTA />
                <Footer />
            </main>
        </div>
    );
};
