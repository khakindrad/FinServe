import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finserve.app',
  appName: 'FinServe Hybrid',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    url: 'http://localhost:3000', // for dev mode (Next.js server)
    cleartext: true
  }
};

export default config;
