// Relative Path: /src/App.tsx

import React from 'react';
import { Navbar } from './components/navbar'; // Adjusted path to match directory structure
import { Sidebar } from './components/sidebar'; // Adjusted path to match directory structure
import { MobileSidebar } from './components/mobile-sidebar'; // Adjusted path to match directory structure
import { Thread } from './components/ui/thread-menu'; // Path appears correct as per your directory

// Mock data for threads
const mockThreads: Thread[] = [
    {
        id: '1',
        companion: {
            id: '1',
            name: 'Companion 1',
            src: '/images/default-avatar.png',
            userName: 'companion1',
            _count: { messages: 5 },
            messages: [{ createdAt: new Date() }],
        },
        lastMessageAt: new Date().toISOString(),
        _count: {
            messages: 5,
        },
    },
];

// Dummy component to simulate the layout and components
const App = () => {
    const isPro = true; // Mock subscription status

    return (
        <div className="h-full flex overflow-hidden"> {/* Root container with full height and overflow handling */}
            {/* 🧭 Navbar */}
            <Navbar isPro={isPro} threads={mockThreads} />

            {/* 🖥️ Sidebar for larger screens */}
            <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0">
                <Sidebar isPro={isPro} threads={mockThreads} onLinkClick={() => console.log('Sidebar link clicked')} />
            </div>

            {/* 📱 Mobile Sidebar for smaller screens */}
            <div className="md:hidden fixed inset-y-0 left-0 z-40">
                <MobileSidebar isPro={isPro} threads={mockThreads} />
            </div>

            {/* 🖥️ Main content area */}
            <main className="flex-1 pt-16 md:pl-20 overflow-y-auto">
                <div className="w-full h-full">
                    {/* Add child components or mock content here for visualization */}
                    <p>This is a mock content area for hierarchy visualization.</p>
                </div>
            </main>
        </div>
    );
};

export default App;
