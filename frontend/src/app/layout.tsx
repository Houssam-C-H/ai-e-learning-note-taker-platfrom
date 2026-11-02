import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { RoleProvider } from '@/context/RoleContext';

export const metadata: Metadata = {
  title: 'NoteAI — Academic Intelligence & E-Learning Platform',
  description: 'AI-powered university lecture notes, spaced-repetition flashcards, and exam cockpit',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-text-primary min-h-screen flex antialiased">
        <RoleProvider>
          {/* Left Sticky Sidebar */}
          <Sidebar />

          {/* Main Layout Area — Natural Page Scroll */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <TopBar />
            <main className="flex-1 p-4 md:p-8">
              <div className="max-w-7xl mx-auto w-full">{children}</div>
            </main>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
