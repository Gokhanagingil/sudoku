import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gokhanagingil.kuskoyusudoku',
  appName: 'Kuş Köyü Sudoku',
  webDir: 'dist',
  backgroundColor: '#edf1e7',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#edf1e7',
  },
};

export default config;
