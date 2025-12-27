import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GUEST_MODE_KEY, GUEST_TIMESTAMP_KEY, GUEST_VIEWS_KEY } from '../lib/constants';

interface GuestModeContextType {
    isGuest: boolean;
    viewsCount: number;
    remainingTime: number;
    setIsGuest: (value: boolean) => void;
    enterGuestMode: () => void;
    exitGuestMode: () => void;
    startGuestSession: () => void;
    endGuestSession: () => void;
    incrementViews: () => void;
}

export const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export function GuestModeProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage
    const [isGuest, setIsGuest] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(GUEST_MODE_KEY) === 'true';
        }
        return false;
    });

    const [viewsCount, setViewsCount] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);

    // Sync localStorage changes to state
    useEffect(() => {
        const handleStorageChange = () => {
            const guest = localStorage.getItem(GUEST_MODE_KEY) === 'true';
            setIsGuest(guest);
            
            const views = parseInt(localStorage.getItem(GUEST_VIEWS_KEY) || '0', 10);
            setViewsCount(views);
            
            // Calculate remaining time logic here if needed, for now placeholder
            setRemainingTime(300); // Example: 5 minutes
        };
        
        handleStorageChange(); // Initial sync
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const enterGuestMode = () => setIsGuest(true);
    const exitGuestMode = () => setIsGuest(false);

    // ✅ Properly starts guest session with localStorage persistence
    // Handles private browsing mode gracefully
    const startGuestSession = () => {
        console.log('🎭 [GuestModeContext] Starting guest session...');
        try {
            localStorage.setItem(GUEST_MODE_KEY, 'true');
            localStorage.setItem(GUEST_TIMESTAMP_KEY, Date.now().toString());
            localStorage.setItem(GUEST_VIEWS_KEY, '0');
            console.log('✅ [GuestModeContext] Guest session started, localStorage set');
        } catch (e) {
            // localStorage quota exceeded or in private/incognito browsing
            console.warn('⚠️ [GuestModeContext] Storage failed (private browsing?):', e);
        }
        // Always set in-memory state, even if storage fails
        setIsGuest(true);
        setViewsCount(0);
        setRemainingTime(300);
    };

    // ✅ Properly ends guest session
    // Handles private browsing mode gracefully
    const endGuestSession = () => {
        console.log('🎭 [GuestModeContext] Ending guest session...');
        try {
            localStorage.removeItem(GUEST_MODE_KEY);
            localStorage.removeItem(GUEST_TIMESTAMP_KEY);
            localStorage.removeItem(GUEST_VIEWS_KEY);
        } catch (e) {
            console.warn('⚠️ [GuestModeContext] Storage cleanup failed:', e);
        }
        setIsGuest(false);
        setViewsCount(0);
    };

    const incrementViews = () => {
        const newCount = viewsCount + 1;
        setViewsCount(newCount);
        try {
            localStorage.setItem(GUEST_VIEWS_KEY, newCount.toString());
        } catch (e) {
            console.warn('⚠️ [GuestModeContext] Failed to save view count:', e);
        }
    };


    return (
        <GuestModeContext.Provider value={{
            isGuest,
            viewsCount,
            remainingTime,
            setIsGuest,
            enterGuestMode,
            exitGuestMode,
            startGuestSession,
            endGuestSession,
            incrementViews
        }}>
            {children}
        </GuestModeContext.Provider>
    );
}

export function useGuestMode() {
    const context = useContext(GuestModeContext);
    if (context === undefined) {
        // Return a safe default instead of throwing
        return {
            isGuest: false,
            viewsCount: 0,
            remainingTime: 0,
            setIsGuest: () => { },
            enterGuestMode: () => { },
            exitGuestMode: () => { },
            startGuestSession: () => {
                // Fallback: Still set localStorage even without context
                console.warn('🎭 [GuestMode] Using fallback - context not available');
                localStorage.setItem('zyeute_guest_mode', 'true');
                localStorage.setItem('zyeute_guest_timestamp', Date.now().toString());
                localStorage.setItem('zyeute_guest_views', '0');
            },
            endGuestSession: () => { },
            incrementViews: () => { },
        };
    }
    return context;
}

export default GuestModeContext;
