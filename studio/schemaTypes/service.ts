import { defineType, defineField, defineArrayMember } from 'sanity'
import { TagIcon } from '@sanity/icons/Tag'
import { slugify } from './slugify'
import { seoField } from './seo'
import { priceField } from './price'

export const service = defineType({
  name: 'service',
  title: 'Послуга',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'main', title: 'Головне', default: true },
    { name: 'offer', title: 'Ціна та умови' },
    { name: 'content', title: 'Наповнення сторінки' },
    { name: 'settings', title: 'Налаштування та SEO' },
  ],
  fields: [
    // — Головне —
    defineField({
      name: 'title',
      title: 'Назва послуги',
      type: 'string',
      group: 'main',
      description: 'Наприклад: Системи поливу',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Адреса сторінки',
      type: 'slug',
      group: 'main',
      description: 'Частина посилання після /services/. Натисни «Generate».',
      options: { source: 'title', slugify },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'short',
      title: 'Короткий опис',
      type: 'text',
      rows: 2,
      group: 'main',
      description: 'Одне речення для картки в списку послуг і для пошукової видачі.',
      validation: (rule) => rule.max(200).warning('Довше 200 символів не вміститься на картці'),
    }),
    defineField({
      name: 'intro',
      title: 'Вступ на сторінці',
      type: 'text',
      rows: 4,
      group: 'main',
      description: 'Два-три речення: у чому суть послуги і що клієнт отримує.',
    }),
    defineField({
      name: 'image',
      title: 'Фото',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Опис для SEO', type: 'string' })],
      validation: (rule) => rule.required(),
    }),

    // — Ціна та умови —
    priceField,
    defineField({
      name: 'duration',
      title: 'Термін виконання',
      type: 'string',
      group: 'offer',
      description: 'Наприклад: 3–7 днів залежно від площі',
    }),
    defineField({
      name: 'guarantee',
      title: 'Гарантія',
      type: 'string',
      group: 'offer',
      description: 'Наприклад: 12 місяців на рослини, закуплені нами',
    }),
    defineField({
      name: 'season',
      title: 'Коли виконуємо',
      type: 'string',
      group: 'offer',
      description: 'Наприклад: квітень–жовтень. Порожньо — блок сезонності не покажемо.',
    }),

    // — Наповнення —
    defineField({
      name: 'benefits',
      title: 'Навіщо це потрібно',
      type: 'array',
      group: 'content',
      description: 'Три-чотири причини мовою клієнта, а не переліком робіт.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'benefit',
          fields: [
            defineField({ name: 'title', title: 'Коротко', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'desc', title: 'Пояснення', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'desc' } },
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'Питання та відповіді',
      type: 'array',
      group: 'content',
      description: 'Те, що вас реально питають по телефону перед замовленням саме цієї послуги.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'qa',
          fields: [
            defineField({ name: 'q', title: 'Питання', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'a', title: 'Відповідь', type: 'text', rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: 'q', subtitle: 'a' } },
        }),
      ],
    }),

    // — Налаштування —
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      group: 'settings',
      description: 'Менше число — вище в списку послуг. Найприбутковіші ставте першими.',
    }),
    defineField({
      name: 'hidden',
      title: 'Сховати з сайту',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Послуга зникне і зі списку, і зі своєї сторінки.',
    }),
    seoField,
  ],
  orderings: [{ title: 'За порядком', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', short: 'short', media: 'image', hidden: 'hidden' },
    prepare: ({ title, short, media, hidden }) => ({
      title: hidden ? `🚫 ${title}` : title,
      subtitle: short,
      media,
    }),
  },
})
