import { defineType, defineField } from 'sanity'
import { UsersIcon } from '@sanity/icons/Users'
import { slugify } from './slugify'

/** Значки беруться з тих самих, що вже намальовані для послуг. */
const ICONS = [
  { title: 'Рослина', value: 'plant' },
  { title: 'Газон', value: 'lawn' },
  { title: 'Бруківка', value: 'pave' },
  { title: 'Полив', value: 'water' },
  { title: 'Секатор', value: 'care' },
  { title: 'Проєктування', value: 'design' },
  { title: 'Освітлення', value: 'light' },
  { title: 'Водойма', value: 'pond' },
]

export const vacancy = defineType({
  name: 'vacancy',
  title: 'Вакансія',
  type: 'document',
  icon: UsersIcon,
  description:
    'Показується на сторінці «Робота». Зарплату, графік і вимоги міняйте тут — сайт підхопить при наступному викочуванні.',
  fields: [
    defineField({
      name: 'title',
      title: 'Посада',
      type: 'string',
      description: 'Як людина шукає її в оголошеннях: «Майстер мощення», а не «Спеціаліст ІІ категорії».',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Адреса',
      type: 'slug',
      description:
        'Технічна позначка. Потрапляє в заявку кандидата, тож після публікації міняти не варто: старі заявки посилатимуться на неї.',
      options: { source: 'title', slugify },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Що робити щодня',
      type: 'text',
      rows: 3,
      description: 'Одне-два речення без загальних слів. Людина має впізнати свою роботу.',
      validation: (rule) => rule.required().max(300),
    }),

    defineField({
      name: 'salaryFrom',
      title: 'Зарплата від, грн/міс',
      type: 'number',
      description:
        'Лишіть порожнім, якщо суму називаєте лише на співбесіді — тоді на сторінці буде «за домовленістю». Це чесніше, ніж написати суму, нижчу за ринок.',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'salaryTo',
      title: 'Зарплата до, грн/міс',
      type: 'number',
      description: 'Верхня межа — те, що людина реально може заробити, а не рекорд одного місяця.',
      validation: (rule) =>
        rule.custom((to, ctx) => {
          const from = (ctx.document as { salaryFrom?: number } | undefined)?.salaryFrom
          if (to && from && to < from) return 'Верхня межа менша за нижню'
          if (to && !from) return 'Заповніть спершу «Зарплата від»'
          return true
        }),
    }),

    defineField({
      name: 'schedule',
      title: 'Графік',
      type: 'string',
      description: 'Наприклад: Пн–Пт, 8:00–17:00',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'requirements',
      title: 'Вимоги',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Три-чотири пункти. Кожен — про роботу, а не про «стресостійкість».',
      validation: (rule) => rule.min(1).max(6),
    }),

    defineField({
      name: 'icon',
      title: 'Значок',
      type: 'string',
      options: { list: ICONS },
      initialValue: 'plant',
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      description: 'Менше число — вище в списку. Найпотрібнішу вакансію ставте першою.',
    }),
    defineField({
      name: 'hidden',
      title: 'Сховати',
      type: 'boolean',
      description: 'Набір на цю посаду закритий. Зі сторінки зникне, але сама вакансія лишиться тут.',
      initialValue: false,
    }),
  ],
  orderings: [{ title: 'За порядком', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', from: 'salaryFrom', to: 'salaryTo', hidden: 'hidden' },
    prepare({ title, from, to, hidden }) {
      const гроші = (n?: number) => (n ? new Intl.NumberFormat('uk-UA').format(n) : '')
      const сума = from ? `${гроші(from)}–${гроші(to) || '…'} ₴` : 'за домовленістю'
      return { title, subtitle: hidden ? `${сума} · схована` : сума }
    },
  },
})
