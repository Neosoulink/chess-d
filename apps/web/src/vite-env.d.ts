/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SERVER_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
