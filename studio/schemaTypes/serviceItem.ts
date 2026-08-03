import { defineType, defineField, defineArrayMember } from 'sanity'
import { ComponentIcon } from '@sanity/icons/Component'
import { contentBlocks } from './blocks'
import { slugify } from './slugify'
import { seoField } from './seo'
import { priceField } from './price'

/**
 * Вид робіт усередині послуги: «рулонний газон», «крапельний полив» тощо.
 *
 * Без галочки «Має власну сторінку» показується блоком на сторінці своєї
 * послуги. З галочкою — ще й отримує адресу /services/послуга/вид-робіт,
 * і тоді має сенс заповнювати «Що це / Навіщо / Коли» та блоки сторінки.
 */
export const serviceItem = defineType({
  name: 'serviceItem',
  title: 'Вид робіт',
  type: 'document',
  icon: ComponentIcon,
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
      title: 'Назва',
      type: 'string',
      group: 'main',
      description: 'Наприклад: Рулонний газон під ключ',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Послуга',
      type: 'reference',
      to: [{ type: 'service' }],
      group: 'main',
      description: 'До якого розділу послуг належить цей вид робіт.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'short',
      title: 'Короткий опис',
      type: 'text',
      rows: 2,
      group: 'main',
      description: 'Одне речення. Показується блоком на сторінці послуги.',
      validation: (rule) => rule.max(200).warning('Довше 200 символів не вміститься на картці'),
    }),
    defineField({
      name: 'ownPage',
      title: 'Має власну сторінку',
      type: 'boolean',
      group: 'main',
      initialValue: false,
      description:
        'Увімкни для видів робіт, які шукають окремо («автополив ціна»). Тоді заповни адресу і вкладку «Наповнення сторінки».',
    }),
    defineField({
      name: 'slug',
      title: 'Адреса сторінки',
      type: 'slug',
      group: 'main',
      description: 'Частина посилання після /services/послуга/. Натисни «Generate».',
      options: { source: 'title', slugify },
      hidden: ({ document }) => !document?.ownPage,
      validation: (rule) =>
        rule.custom((slug, context) =>
          context.document?.ownPage && !slug ? 'Для власної сторінки потрібна адреса' : true,
        ),
    }),
    defineField({
      name: 'image',
      title: 'Фото',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      description: 'Крупний план саме цього виду робіт, а не загальний вид ділянки.',
      fields: [defineField({ name: 'alt', title: 'Опис для SEO', type: 'string' })],
    }),

    // — Ціна та умови —
    priceField,
    defineField({
      name: 'duration',
      title: 'Термін виконання',
      type: 'string',
      group: 'offer',
      description: 'Наприклад: 1–2 дні на 5 соток',
    }),

    // — Наповнення —
    defineField({
      name: 'what',
      title: 'Що це',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Пояснення для людини, яка вперше чує термін.',
    }),
    defineField({
      name: 'why',
      title: 'Навіщо це потрібно',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Яку проблему клієнта це вирішує і що буде, якщо не робити.',
    }),
    defineField({
      name: 'when',
      title: 'Коли це роблять',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'На якому етапі робіт і в який сезон.',
    }),
    defineField({
      name: 'blocks',
      title: 'Блоки сторінки',
      type: 'array',
      group: 'content',
      of: contentBlocks,
      description: 'Додаткове наповнення: фото, до/після, списки, цифри. Потрібне лише для власної сторінки.',
    }),
    defineField({
      name: 'faq',
      title: 'Питання та відповіді',
      type: 'array',
      group: 'content',
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

    defineField({
      name: 'related',
      title: 'Суміжні роботи',
      type: 'array',
      group: 'content',
      description:
        'Роботи з інших розділів, які логічно робити разом із цією: полив ↔ газон ↔ підготовка ґрунту. Показуються блоком унизу сторінки.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'serviceItem' }] })],
      validation: (rule) => rule.max(4).warning('Більше чотирьох посилань розсіюють увагу'),
    }),

    // — Налаштування —
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      group: 'settings',
      description: 'Менше число — вище всередині своєї послуги.',
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
  orderings: [{ title: 'За порядком', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', parent: 'parent.title', media: 'image', ownPage: 'ownPage', hidden: 'hidden' },
    prepare: ({ title, parent, media, ownPage, hidden }) => ({
      title: hidden ? `🚫 ${title}` : title,
      subtitle: [parent, ownPage ? 'власна сторінка' : null].filter(Boolean).join(' · '),
      media,
    }),
  },
})
