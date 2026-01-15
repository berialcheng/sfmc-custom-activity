'use client';

import dynamic from 'next/dynamic';

// Dynamically import config component with SSR disabled (uses Postmonger)
const ActivityConfig = dynamic(() => import('@/components/ActivityConfig'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <ActivityConfig />
    </main>
  );
}
