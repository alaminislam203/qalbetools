import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SystemSettings {
    youtube_enabled: boolean;
    facebook_enabled: boolean;
    instagram_enabled: boolean;
    tiktok_enabled: boolean;
    ai_features_enabled: boolean;
    maintenance_mode: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
    youtube_enabled: true,
    facebook_enabled: true,
    instagram_enabled: true,
    tiktok_enabled: true,
    ai_features_enabled: true,
    maintenance_mode: false
};

/**
 * ── FETCH SYSTEM SETTINGS ───────────────────────────────────────────────────
 * Checks the global system state from Firestore.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function getSystemSettings(): Promise<SystemSettings> {
    if (!db) return DEFAULT_SETTINGS;
    try {
        const settingsRef = doc(db, 'system', 'settings');
        const snapshot = await getDoc(settingsRef);
        if (snapshot.exists()) {
            return { ...DEFAULT_SETTINGS, ...snapshot.data() } as SystemSettings;
        } else {
            // Initialize with defaults if not exists
            await setDoc(settingsRef, DEFAULT_SETTINGS);
            return DEFAULT_SETTINGS;
        }
    } catch (err) {
        console.error("System Settings Error:", err);
        return DEFAULT_SETTINGS;
    }
}
