import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'v6s9ym4d',
    dataset: 'production'
  },
  studioHost: 'greenlabs-landscape',
  deployment: {
    appId: 'eqgbhnhtxiqoagfsbxsqayr0',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
