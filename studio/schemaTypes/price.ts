import { defineField } from 'sanity'

/**
 * Вилка «від–до» з одиницею виміру. Спільна для послуги і для виду робіт.
 *
 * Блок із ціною з'являється на сайті, лише якщо заповнені «від» і одиниця —
 * порожня вилка нічого не малює, тож можна публікувати послугу без ціни.
 */
export const priceField = defineField({
  name: 'price',
  title: 'Ціна',
  type: 'object',
  group: 'offer',
  description: 'Вилка «від–до». Показуємо на сайті лише коли є «від» і одиниця виміру.',
  fields: [
    defineField({
      name: 'from',
      title: 'Від',
      type: 'number',
      description: 'Тільки число, без «грн». Наприклад: 180',
    }),
    defineField({
      name: 'to',
      title: 'До',
      type: 'number',
      description: 'Верхня межа вилки. Порожньо — покажемо просто «від N».',
    }),
    defineField({
      name: 'unit',
      title: 'Одиниця',
      type: 'string',
      description: 'Наприклад: грн/м², грн/сотка, грн/пог.м, грн за об’єкт',
    }),
    defineField({
      name: 'basis',
      title: 'Як рахує калькулятор',
      type: 'string',
      initialValue: 'none',
      description:
        'Чи множити ціну на площу в калькуляторі на сторінці послуг. «Не рахувати» — послуга в калькуляторі не зʼявиться.',
      options: {
        list: [
          { title: 'Не рахувати', value: 'none' },
          { title: 'За квадратний метр', value: 'm2' },
          { title: 'За сотку', value: 'sotka' },
          { title: 'Фіксована за обʼєкт', value: 'fixed' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'note',
      title: 'Що впливає на ціну',
      type: 'text',
      rows: 2,
      description: 'Одне речення. Наприклад: залежить від стану ґрунту та ухилу ділянки.',
    }),
  ],
})
