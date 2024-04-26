/// <reference types="vite-plugin-electron/electron-env" />
import type {BrowserWindowConstructorOptions, Event} from 'electron'
declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬ dist-electron
     * │ ├─┬ main
     * │ │ └── index.js    > Electron-Main
     * │ └─┬ preload
     * │   └── index.mjs   > Preload-Scripts
     * ├─┬ dist
     * │ └── index.html    > Electron-Renderer
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
  interface Option {
    title?: string;
    width?: string;
    height?: string;
    frame?: string;
    url: string;
  }
  export type NewOption = BrowserWindowConstructorOptions & Option;
}
export type ElectronEvent = typeof Event;
