'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface TransitionContextType {
    navigateWithTransition: (href: string) => void;
    isTransitioning: boolean;
    setTransitioning: (value: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [isTransitioning, setTransitioning] = useState(false);

    const navigateWithTransition = (href: string) => {
        if (isTransitioning) return;
        setTransitioning(true);
        // The actual navigation will be triggered by the WaveTransition component
        // after the animation reaches the midpoint (screen covered)
        setTimeout(() => {
            router.push(href);
        }, 800); // Wait for wave to cover screen (approx half of animation)
    };

    return (
        <TransitionContext.Provider value={{ navigateWithTransition, isTransitioning, setTransitioning }}>
            {children}
        </TransitionContext.Provider>
    );
};

export const useTransitionRouter = () => {
    const context = useContext(TransitionContext);
    if (!context) {
        throw new Error('useTransitionRouter must be used within a TransitionProvider');
    }
    return context;
};
