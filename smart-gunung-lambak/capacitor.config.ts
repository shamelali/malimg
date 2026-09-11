import type { CapacitorConfig } from '@capacitor/cli';

const publicUrl = process.env.LAMBAK_PUBLIC_URL;

const config: CapacitorConfig = {
  appId: 'gov.mpk.lambak.pilot',
  appName: 'Smart Lambak',
  webDir: 'www',
  android: {
    allowMixedContent: false
  },
  ios: {
    contentInset: 'always'
  },
  ...(publicUrl
    ? {
        server: {
          url: publicUrl,
          cleartext: false
        }
      }
    : {})
};

export default config;
