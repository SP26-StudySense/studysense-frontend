'use client';

import { Users, Target, Lightbulb, Heart, Globe, BookOpen, Github, Twitter, Linkedin, Star, Award, Zap } from 'lucide-react';
import Link from 'next/link';

const team = [
    {
        name: 'Nguyen Anh Tuan',
        role: 'Project Lead & Backend Developer',
        avatar: 'NAT',
        color: 'from-[#00bae2] to-[#0088cc]',
    },
    {
        name: 'Le Thi Bich Ngoc',
        role: 'Frontend Developer & UI/UX',
        avatar: 'LBN',
        color: 'from-[#fec5fb] to-[#d490d4]',
    },
    {
        name: 'Tran Minh Khoa',
        role: 'Full Stack Developer',
        avatar: 'TMK',
        color: 'from-[#00bae2]/70 to-[#fec5fb]/70',
    },
    {
        name: 'Pham Duc Huy',
        role: 'Backend Developer & DevOps',
        avatar: 'PDH',
        color: 'from-emerald-400 to-teal-500',
    },
];

const values = [
    {
        icon: Target,
        title: 'Goal-Oriented Learning',
        description: 'We believe education should be structured around your real career goals, not generic curricula.',
        color: 'text-[#00bae2]',
        bg: 'bg-[#00bae2]/10',
    },
    {
        icon: Lightbulb,
        title: 'Smart Guidance',
        description: 'AI-powered roadmaps help you discover the shortest path from where you are to where you want to be.',
        color: 'text-[#fec5fb]/80',
        bg: 'bg-[#fec5fb]/20',
    },
    {
        icon: Heart,
        title: 'Learner-First',
        description: 'Every feature is designed with learners in mind. Your progress, your pace, your journey.',
        color: 'text-rose-500',
        bg: 'bg-rose-50',
    },
    {
        icon: Globe,
        title: 'Open Access',
        description: 'Quality education should be accessible to everyone. Our core features are free, always.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
];

const stats = [
    { label: 'Active Learners', value: '10,000+', icon: Users },
    { label: 'Learning Roadmaps', value: '500+', icon: BookOpen },
    { label: 'Skills Mapped', value: '2,400+', icon: Star },
    { label: 'Countries', value: '40+', icon: Globe },
];

export function AboutPage() {
    return (
        <div className="space-y-24 pb-16">
            {/* Hero Section */}
            <section className="text-center space-y-6 pt-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-[#00bae2] shadow-[0_0_8px_#00bae2] animate-pulse" />
                    SEP490 — FPT University Capstone Project
                </div>

                <h1 className="text-5xl font-bold tracking-tight text-neutral-900 lg:text-6xl">
                    About{' '}
                    <span className="bg-gradient-to-r from-[#00bae2] to-[#fec5fb] bg-clip-text text-transparent">
                        StudySense
                    </span>
                </h1>

                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-500">
                    StudySense is a smart learning platform built to help students and professionals navigate their
                    education with clarity — through AI-assisted roadmaps, structured progress tracking, and
                    personalized study plans.
                </p>

                <div className="flex items-center justify-center gap-4 pt-2">
                    <Link
                        href="/roadmaps"
                        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-lg"
                    >
                        <BookOpen className="h-4 w-4" />
                        Explore Roadmaps
                    </Link>
                    <Link
                        href="/upgrade-plan"
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:shadow-md"
                    >
                        <Zap className="h-4 w-4 text-[#00bae2]" />
                        View Plans
                    </Link>
                </div>
            </section>

            {/* Stats */}
            <section>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/60 p-6 text-center backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="mb-3 flex justify-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00bae2]/10 to-[#fec5fb]/10">
                                    <stat.icon className="h-5 w-5 text-[#00bae2]" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                            <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission */}
            <section className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/60 p-10 backdrop-blur-sm shadow-sm">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#fec5fb]/30 to-[#00bae2]/10 blur-3xl pointer-events-none" />
                <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900">
                            <Award className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900">Our Mission</h2>
                    </div>
                    <p className="max-w-3xl text-base leading-relaxed text-neutral-600">
                        We're a team of students from FPT University who believe that the biggest problem in modern
                        education isn't a lack of resources — it's a lack of structure. StudySense was built to solve
                        that problem by giving every learner a clear, personalized roadmap to achieve their goals.
                    </p>
                    <p className="max-w-3xl text-base leading-relaxed text-neutral-600">
                        From career switchers to academic students, we want StudySense to be the companion that makes
                        learning feel intentional, trackable, and rewarding.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-neutral-900">What We Stand For</h2>
                    <p className="text-neutral-500">The principles that drive every decision we make</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {values.map((value) => (
                        <div
                            key={value.title}
                            className="group rounded-2xl border border-neutral-200/60 bg-white/60 p-6 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${value.bg} transition-transform group-hover:scale-110`}>
                                <value.icon className={`h-5 w-5 ${value.color}`} />
                            </div>
                            <h3 className="mb-2 text-base font-semibold text-neutral-900">{value.title}</h3>
                            <p className="text-sm leading-relaxed text-neutral-500">{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Meet the Team</h2>
                    <p className="text-neutral-500">The people behind StudySense</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {team.map((member) => (
                        <div
                            key={member.name}
                            className="group flex flex-col items-center rounded-2xl border border-neutral-200/60 bg-white/60 p-6 text-center backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                        >
                            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-white text-lg font-bold shadow-lg transition-transform group-hover:scale-105`}>
                                {member.avatar}
                            </div>
                            <p className="font-semibold text-neutral-900">{member.name}</p>
                            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{member.role}</p>
                            <div className="mt-4 flex gap-3">
                                <a href="#" className="text-neutral-400 hover:text-neutral-700 transition-colors">
                                    <Github className="h-4 w-4" />
                                </a>
                                <a href="#" className="text-neutral-400 hover:text-neutral-700 transition-colors">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden rounded-3xl text-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00bae2] via-[#00bae2]/80 to-[#fec5fb] rounded-3xl" />
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="relative z-10 space-y-4">
                    <h2 className="text-3xl font-bold text-white">Ready to start your journey?</h2>
                    <p className="text-white/80 text-base">
                        Join thousands of learners already building their future with StudySense.
                    </p>
                    <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
                        <Link
                            href="/roadmaps"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Zap className="h-4 w-4 text-[#00bae2]" />
                            Get Started Free
                        </Link>
                        <Link
                            href="/upgrade-plan"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                            <Twitter className="h-4 w-4" />
                            View Premium Plans
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
