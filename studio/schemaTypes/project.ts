import { defineType, defineField, defineArrayMember } from 'sanity'
import { CaseIcon } from '@sanity/icons/Case'
import { contentBlocks } from './blocks'
import { slugify } from './slugify'
import { seoField } from './seo'

const SERVICES = [
  { title: 'Проєктування та візуалізація', value: 'proektuvannya' },
  { title: 'Озеленення та посадка', value: 'ozelenennya' },
  { title: 'Газон та покриття', value: 'gazon' },
  { title: 'Системи поливу', value: 'polyv' },
  { title: 'Освітлення саду', value: 'osvitlennya' },
  { title: 'Водойми та фонтани', value: 'vodoymy' },
  { title: 'Сезонне обслуговування', value: 'sezonne' },
  { title: 'Мощення та тераси', value: 'moshchennya' },
]

export const project = defineType({
  name: 'project',
  title: 'Робота',
  type: 'document',
  icon: CaseIcon,
  groups: [
    { name: 'main', title: 'Головне', default: true },
    { name: 'facts', title: 'Факти про об’єкт' },
    { name: 'content', title: 'Наповнення сторінки' },
    { name: 'settings', title: 'Налаштування та SEO' },
  ],
  fields: [
    // — Головне —
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      group: 'main',
      description: 'Великий заголовок сторінки. Наприклад: Сад на схилі в Личакові',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Підзаголовок',
      type: 'string',
      group: 'main',
      description: 'Рядок під заголовком. Наприклад: Дві тераси замість крутого схилу',
    }),
    defineField({
      name: 'slug',
      title: 'Адреса сторінки',
      type: 'slug',
      group: 'main',
      description: 'Частина посилання після /works/. Натисни «Generate».',
      options: { source: 'title', slugify },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Короткий опис',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'Одне-два речення. Показується під заголовком, на картці й у пошуковій видачі.',
      validation: (rule) => rule.max(300).warning('Довше 300 символів пошуковик обріже'),
    }),
    defineField({
      name: 'image',
      title: 'Обкладинка',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      description: 'Головне фото: банер сторінки та картка в портфоліо.',
      fields: [defineField({ name: 'alt', title: 'Опис для SEO', type: 'string' })],
      validation: (rule) => rule.required(),
    }),

    // — Факти —
    defineField({
      name: 'location',
      title: 'Локація',
      type: 'string',
      group: 'facts',
      description: 'Наприклад: Личаківський р-н, Львів',
    }),
    defineField({
      name: 'area',
      title: 'Площа',
      type: 'string',
      group: 'facts',
      description: 'Наприклад: 12 соток',
    }),
    defineField({
      name: 'startDate',
      title: 'Дата початку робіт',
      type: 'date',
      group: 'facts',
      options: { dateFormat: 'DD.MM.YYYY' },
    }),
    defineField({
      name: 'endDate',
      title: 'Дата завершення',
      type: 'date',
      group: 'facts',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const start = context.document?.startDate as string | undefined
          if (start && endDate && endDate < start) return 'Завершення не може бути раніше за початок'
          return true
        }),
    }),
    defineField({
      name: 'duration',
      title: 'Скільки тривало',
      type: 'string',
      group: 'facts',
      description: 'Наприклад: 5 тижнів. Якщо порожньо — порахуємо з дат.',
    }),
    defineField({
      name: 'services',
      title: 'Види робіт',
      type: 'array',
      group: 'facts',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: SERVICES },
      description: 'Прив’язка до розділів послуг.',
    }),
    defineField({
      name: 'tags',
      title: 'Теги',
      type: 'array',
      group: 'facts',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: ['Озеленення', 'Газон', 'Освітлення', 'Проектування', 'Тераса', 'Полив', 'Мощення', 'Водойма', 'Посадка', 'Комерційний', 'Приватний'],
      },
      description: 'Короткі позначки на картці в портфоліо.',
    }),
    defineField({
      name: 'tools',
      title: 'Інструменти та техніка',
      type: 'array',
      group: 'facts',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Наприклад: міні-екскаватор, аератор, лазерний нівелір.',
    }),
    defineField({
      name: 'materials',
      title: 'Матеріали та рослини',
      type: 'array',
      group: 'facts',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'material',
          fields: [
            defineField({ name: 'name', title: 'Що', type: 'string', description: 'Наприклад: Граб звичайний' }),
            defineField({ name: 'amount', title: 'Скільки', type: 'string', description: 'Наприклад: 34 шт' }),
          ],
          preview: { select: { title: 'name', subtitle: 'amount' } },
        }),
      ],
    }),
    defineField({
      name: 'team',
      title: 'Хто працював',
      type: 'array',
      group: 'facts',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'teamOnProject',
          fields: [
            defineField({
              name: 'member',
              title: 'Співробітник',
              type: 'reference',
              to: [{ type: 'teamMember' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'roleOnProject',
              title: 'Роль саме на цьому об’єкті',
              type: 'string',
              description: 'Порожньо — візьмемо посаду з картки співробітника.',
            }),
          ],
          preview: {
            select: { name: 'member.name', role: 'roleOnProject', memberRole: 'member.role', media: 'member.photo' },
            prepare: ({ name, role, memberRole, media }) => ({
              title: name,
              subtitle: role || memberRole,
              media,
            }),
          },
        }),
      ],
    }),

    // — Наповнення —
    defineField({
      name: 'blocks',
      title: 'Блоки сторінки',
      type: 'array',
      group: 'content',
      of: contentBlocks,
      description:
        'Збери сторінку з блоків у будь-якому порядку: текст, слайдер фото, до/після, відео, список, цитата, цифри, широке фото.',
    }),

    // — Налаштування —
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      group: 'settings',
      description: 'Менше число — вище в портфоліо.',
    }),
    defineField({
      name: 'featured',
      title: 'Показувати на головній',
      type: 'boolean',
      group: 'settings',
      initialValue: true,
      description: 'Вимкни, щоб робота була доступна за посиланням, але не з’являлась у портфоліо на головній.',
    }),
    defineField({
      name: 'hidden',
      title: 'Сховати з сайту',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Робота зникне і з портфоліо, і зі своєї сторінки.',
    }),
    seoField,
  ],
  orderings: [
    { title: 'За порядком', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Найновіші', name: 'endDateDesc', by: [{ field: 'endDate', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', location: 'location', area: 'area', media: 'image', hidden: 'hidden' },
    prepare: ({ title, location, area, media, hidden }) => ({
      title: hidden ? `🚫 ${title}` : title,
      subtitle: [location, area].filter(Boolean).join(' · '),
      media,
    }),
  },
})
