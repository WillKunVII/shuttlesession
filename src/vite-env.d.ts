/// <reference types="vite/client" />

declare global {
  interface Window {
    __APP_VERSION__: string;
    __BUILD_DATE__: string;
  }
}

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
