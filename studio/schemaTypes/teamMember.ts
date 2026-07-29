import { defineType, defineField } from 'sanity'
import { UserIcon } from '@sanity/icons/User'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Співробітник',
  type: 'document',
  icon: UserIcon,
  description: 'Один список людей на весь сайт: сторінка «Про нас», команда на проєктах, автори статей.',
  fields: [
    defineField({
      name: 'name',
      title: 'Ім’я та прізвище',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Посада',
      type: 'string',
      description: 'Наприклад: Головний дизайнер',
    }),
    defineField({
      name: 'photo',
      title: 'Фото',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Опис для SEO', type: 'string' })],
    }),
    defineField({
      name: 'bio',
      title: 'Коротко про людину',
      type: 'text',
      rows: 3,
      description: 'Показується під статтями цього автора.',
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      description: 'Менше число — вище в списку на сторінці «Про нас».',
    }),
  ],
  orderings: [
    {
      title: 'За порядком',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})
