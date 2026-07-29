import { defineType, defineField, defineArrayMember } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { contentBlocks } from './blocks'
import { slugify } from './slugify'
import { seoField } from './seo'

const CATEGORIES = [
  { title: 'Поради садівникам', value: 'porady' },
  { title: 'Рослини', value: 'roslyny' },
  { title: 'Тренди та ідеї', value: 'trendy' },
  { title: 'Сезонні роботи', value: 'sezon' },
  { title: 'Наші проєкти', value: 'proekty' },
]

export const post = defineType({
  name: 'post',
  title: 'Стаття',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'main', title: 'Головне', default: true },
    { name: 'facts', title: 'Автор і рубрика' },
    { name: 'content', title: 'Наповнення статті' },
    { name: 'settings', title: 'Налаштування та SEO' },
  ],
  fields: [
    // — Головне —
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Підзаголовок',
      type: 'string',
      group: 'main',
      description: 'Рядок під заголовком на сторінці статті.',
    }),
    defineField({
      name: 'slug',
      title: 'Адреса сторінки',
      type: 'slug',
      group: 'main',
      description: 'Частина посилання після /blog/. Натисни «Generate».',
      options: { source: 'title', slugify },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Короткий опис',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'Показується на картці в блозі та в пошуковій видачі.',
      validation: (rule) => rule.max(300).warning('Довше 300 символів пошуковик обріже'),
    }),
    defineField({
      name: 'image',
      title: 'Обкладинка',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Опис для SEO', type: 'string' })],
      validation: (rule) => rule.required(),
    }),

    // — Автор і рубрика —
    defineField({
      name: 'author',
      title: 'Автор',
      type: 'reference',
      group: 'facts',
      to: [{ type: 'teamMember' }],
      description: 'Беремо зі списку співробітників.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Дата публікації',
      type: 'datetime',
      group: 'facts',
      options: { dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm' },
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Рубрика',
      type: 'string',
      group: 'facts',
      options: { list: CATEGORIES },
    }),
    defineField({
      name: 'tags',
      title: 'Теги',
      type: 'array',
      group: 'facts',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      description: 'Вільні позначки — пиши свої.',
    }),
    defineField({
      name: 'readingTime',
      title: 'Час читання, хв',
      type: 'number',
      group: 'facts',
      description: 'Порожньо — порахуємо самі з обсягу тексту.',
      validation: (rule) => rule.min(1).max(90),
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Згадані роботи',
      type: 'array',
      group: 'facts',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })],
      description: 'Внизу статті з’являться картки цих робіт.',
    }),

    // — Наповнення —
    defineField({
      name: 'blocks',
      title: 'Блоки статті',
      type: 'array',
      group: 'content',
      of: contentBlocks,
      description:
        'Те саме, що й у роботах: текст, слайдер фото, до/після, відео, список, цитата, цифри, широке фото.',
    }),

    // — Налаштування —
    defineField({
      name: 'featured',
      title: 'Показувати на головній',
      type: 'boolean',
      group: 'settings',
      initialValue: true,
    }),
    defineField({
      name: 'hidden',
      title: 'Сховати з сайту',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
    }),
    seoField,
  ],
  orderings: [
    { title: 'Найновіші', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'publishedAt', author: 'author.name', media: 'image', hidden: 'hidden' },
    prepare: ({ title, date, author, media, hidden }) => ({
      title: hidden ? `🚫 ${title}` : title,
      subtitle: [date ? new Date(date).toLocaleDateString('uk-UA') : null, author].filter(Boolean).join(' · '),
      media,
    }),
  },
})
