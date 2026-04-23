import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.powerplattform.app',
  appName: 'PowerPlattform',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'firebasestorage.googleapis.com',
      '*.firebasestorage.googleapis.com',
      '*.googleapis.com',
      '*.firebaseio.com',
      '*.firebaseapp.com',
      'lh3.googleusercontent.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#050a10",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#2eb64a"
    }
  }
};

export default config;
