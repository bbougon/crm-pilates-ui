interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
