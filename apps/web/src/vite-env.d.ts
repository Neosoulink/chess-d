/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SERVER_HOST: string
  readonly PUBLIC_SITE_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
