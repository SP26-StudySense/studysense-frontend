import { Header } from '@/features/landing/components/Header';
import { NotificationsPage } from './NotificationsPage';

export function UserNotificationsPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] font-sans text-neutral-900 selection:bg-[#00bae2] selection:text-white">
      <Header />
      <main className="relative z-10 mx-auto w-full max-w-[1320px] px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        <NotificationsPage />
      </main>
    </div>
  );
}
