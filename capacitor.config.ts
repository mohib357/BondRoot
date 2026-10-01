import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bondroot.app',
  appName: 'BondRoot',
  webDir: 'dist',
  server: {
    // Render production URL — Android app loads from here instead of local dist/
    url: 'https://bondroot.onrender.com',
    cleartext: false, // HTTPS only — keep false for production
  }
};

export default config;
