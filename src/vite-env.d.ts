/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Адреса Worker, який пересилає заявки в Telegram. Задається у воркфлоу збірки. */
  readonly VITE_LEAD_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
