import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gokhanagingil.kuskoyusudoku',
  appName: 'Kuş Köyü: Denge',
  webDir: 'dist',
  backgroundColor: '#f6f0df',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#f6f0df',
  },
};

export default config;
