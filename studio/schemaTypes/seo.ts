import { defineField } from 'sanity'

/** Необов’язкові перевизначення для пошуковиків і соцмереж. Порожні поля беруться з основного контенту. */
export const seoField = defineField({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  group: 'settings',
  options: { collapsible: true, collapsed: true },
  description: 'Заповнюй, лише якщо треба відрізнити текст для пошуковика від того, що на сторінці.',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок для пошуковика',
      type: 'string',
      description: 'Порожньо — візьмемо заголовок сторінки.',
      validation: (rule) => rule.max(60).warning('Довше 60 символів Google обріже'),
    }),
    defineField({
      name: 'description',
      title: 'Опис для пошуковика',
      type: 'text',
      rows: 2,
      description: 'Порожньо — візьмемо короткий опис.',
      validation: (rule) => rule.max(160).warning('Довше 160 символів Google обріже'),
    }),
    defineField({
      name: 'image',
      title: 'Картинка для соцмереж',
      type: 'image',
      description: 'Показується, коли посилання кидають у месенджер. Порожньо — візьмемо обкладинку.',
      options: { hotspot: true },
    }),
  ],
})
