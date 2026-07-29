import { defineType, defineField, defineArrayMember } from 'sanity'
// @sanity/icons v5 віддає іконки лише через підшляхи — з кореня вони не експортуються
import { BlockContentIcon } from '@sanity/icons/BlockContent'
import { ImagesIcon } from '@sanity/icons/Images'
import { TransferIcon } from '@sanity/icons/Transfer'
import { PlayIcon } from '@sanity/icons/Play'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { BlockquoteIcon } from '@sanity/icons/Blockquote'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'
import { ImageIcon } from '@sanity/icons/Image'

/** Зображення з описом для SEO та підписом — використовується в галереях і блоках. */
export const richImage = defineType({
  name: 'richImage',
  title: 'Зображення',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Опис для SEO',
      type: 'string',
      description: 'Що зображено. Читають пошуковики та програми для незрячих.',
      validation: (rule) => rule.required().warning('Без опису фото гірше індексується'),
    }),
    defineField({ name: 'caption', title: 'Підпис під фото', type: 'string' }),
  ],
})

/** Один ролик: або посилання на YouTube/Vimeo, або завантажений файл. */
export const videoItem = defineType({
  name: 'videoItem',
  title: 'Відео',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'source',
      title: 'Звідки відео',
      type: 'string',
      options: {
        list: [
          { title: 'Посилання на YouTube / Vimeo', value: 'link' },
          { title: 'Завантажений файл', value: 'file' },
        ],
        layout: 'radio',
      },
      initialValue: 'link',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Посилання',
      type: 'url',
      description: 'Звичайне посилання з адресного рядка — youtube.com/watch?v=…, youtu.be/… або vimeo.com/…',
      hidden: ({ parent }) => parent?.source !== 'link',
    }),
    defineField({
      name: 'file',
      title: 'Відеофайл',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Тримай до ~50 МБ, інакше довго вантажиться на мобільному. Довгі ролики краще класти на YouTube.',
      hidden: ({ parent }) => parent?.source !== 'file',
    }),
    defineField({
      name: 'poster',
      title: 'Кадр-заставка',
      type: 'image',
      options: { hotspot: true },
      description: 'Показується до натискання «play».',
      hidden: ({ parent }) => parent?.source !== 'file',
    }),
    defineField({ name: 'title', title: 'Підпис', type: 'string', description: 'Наприклад: Обліт ділянки з дрона' }),
  ],
  preview: {
    select: { title: 'title', url: 'url', source: 'source', media: 'poster' },
    prepare: ({ title, url, source, media }) => ({
      title: title || 'Відео без підпису',
      subtitle: source === 'file' ? 'Завантажений файл' : url,
      media,
    }),
  },
})

export const textBlock = defineType({
  name: 'textBlock',
  title: 'Текст',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({ name: 'heading', title: 'Заголовок', type: 'string' }),
    defineField({ name: 'subheading', title: 'Підзаголовок', type: 'string' }),
    defineField({
      name: 'body',
      title: 'Текст',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Абзац', value: 'normal' },
            { title: 'Підзаголовок', value: 'h3' },
            { title: 'Дрібний підзаголовок', value: 'h4' },
            { title: 'Цитата', value: 'blockquote' },
          ],
          lists: [
            { title: 'Список', value: 'bullet' },
            { title: 'Нумерований', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Жирний', value: 'strong' },
              { title: 'Курсив', value: 'em' },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { heading: 'heading', subheading: 'subheading' },
    prepare: ({ heading, subheading }) => ({
      title: heading || 'Текст',
      subtitle: subheading || 'Текстовий блок',
    }),
  },
})

export const sliderBlock = defineType({
  name: 'sliderBlock',
  title: 'Слайдер фото',
  type: 'object',
  icon: ImagesIcon,
  description: 'Кілька фото, які на сайті гортаються вліво-вправо.',
  fields: [
    defineField({ name: 'heading', title: 'Заголовок', type: 'string' }),
    defineField({
      name: 'images',
      title: 'Фото',
      type: 'array',
      of: [defineArrayMember({ type: 'richImage' })],
      options: { layout: 'grid' },
      validation: (rule) => rule.min(1).error('Додай хоча б одне фото'),
    }),
  ],
  preview: {
    select: { heading: 'heading', images: 'images', media: 'images.0' },
    prepare: ({ heading, images, media }) => ({
      title: heading || 'Слайдер фото',
      subtitle: `${images?.length ?? 0} фото`,
      media,
    }),
  },
})

export const beforeAfterBlock = defineType({
  name: 'beforeAfterBlock',
  title: 'До / після',
  type: 'object',
  icon: TransferIcon,
  description: 'Два кадри з однієї точки, які на сайті порівнюються повзунком.',
  fields: [
    defineField({ name: 'heading', title: 'Заголовок', type: 'string' }),
    defineField({
      name: 'before',
      title: 'Фото «до»',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'beforeLabel',
      title: 'Підпис до лівого кадру',
      type: 'string',
      description: 'Наприклад: Травень 2024. Порожньо — буде «До».',
    }),
    defineField({
      name: 'after',
      title: 'Фото «після»',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'afterLabel',
      title: 'Підпис до правого кадру',
      type: 'string',
      description: 'Наприклад: Вересень 2024. Порожньо — буде «Після».',
    }),
    defineField({ name: 'caption', title: 'Підпис під слайдером', type: 'string' }),
  ],
  preview: {
    select: { heading: 'heading', caption: 'caption', media: 'after' },
    prepare: ({ heading, caption, media }) => ({
      title: heading || 'До / після',
      subtitle: caption || 'Порівняння двох кадрів',
      media,
    }),
  },
})

export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Відео',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({ name: 'heading', title: 'Заголовок', type: 'string' }),
    defineField({
      name: 'videos',
      title: 'Ролики',
      type: 'array',
      of: [defineArrayMember({ type: 'videoItem' })],
      validation: (rule) => rule.min(1).error('Додай хоча б один ролик'),
    }),
  ],
  preview: {
    select: { heading: 'heading', videos: 'videos' },
    prepare: ({ heading, videos }) => ({
      title: heading || 'Відео',
      subtitle: `${videos?.length ?? 0} ролик(ів)`,
    }),
  },
})

export const checklistBlock = defineType({
  name: 'checklistBlock',
  title: 'Список із галочками',
  type: 'object',
  icon: CheckmarkCircleIcon,
  description: 'Перелік пунктів — склад робіт, що входить у послугу, поради.',
  fields: [
    defineField({ name: 'heading', title: 'Заголовок', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Пункти',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.min(1).error('Додай хоча б один пункт'),
    }),
  ],
  preview: {
    select: { heading: 'heading', items: 'items' },
    prepare: ({ heading, items }) => ({
      title: heading || 'Список',
      subtitle: `${items?.length ?? 0} пунктів`,
    }),
  },
})

export const quoteBlock = defineType({
  name: 'quoteBlock',
  title: 'Цитата / відгук',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Текст цитати',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'author', title: 'Хто сказав', type: 'string', description: 'Наприклад: Ірина, власниця ділянки' }),
    defineField({ name: 'authorRole', title: 'Уточнення', type: 'string', description: 'Наприклад: Брюховичі, 24 сотки' }),
  ],
  preview: {
    select: { quote: 'quote', author: 'author' },
    prepare: ({ quote, author }) => ({ title: quote, subtitle: author || 'Цитата' }),
  },
})

export const statsBlock = defineType({
  name: 'statsBlock',
  title: 'Цифри',
  type: 'object',
  icon: TrendUpwardIcon,
  description: 'Кілька великих чисел із підписами — площа газону, кількість дерев тощо.',
  fields: [
    defineField({ name: 'heading', title: 'Заголовок', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Показники',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: 'Число', type: 'string', description: 'Наприклад: 320 м²' }),
            defineField({ name: 'label', title: 'Що це', type: 'string', description: 'Наприклад: рулонного газону' }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        }),
      ],
      validation: (rule) => rule.min(1).error('Додай хоча б один показник'),
    }),
  ],
  preview: {
    select: { heading: 'heading', items: 'items' },
    prepare: ({ heading, items }) => ({
      title: heading || 'Цифри',
      subtitle: `${items?.length ?? 0} показників`,
    }),
  },
})

export const wideImageBlock = defineType({
  name: 'wideImageBlock',
  title: 'Фото на всю ширину',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Фото',
      type: 'richImage',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { caption: 'image.caption', alt: 'image.alt', media: 'image' },
    prepare: ({ caption, alt, media }) => ({
      title: caption || alt || 'Фото на всю ширину',
      media,
    }),
  },
})

/** Набір блоків, з яких редактор збирає сторінку. Спільний для робіт і статей. */
export const contentBlocks = [
  defineArrayMember({ type: 'textBlock' }),
  defineArrayMember({ type: 'sliderBlock' }),
  defineArrayMember({ type: 'beforeAfterBlock' }),
  defineArrayMember({ type: 'videoBlock' }),
  defineArrayMember({ type: 'checklistBlock' }),
  defineArrayMember({ type: 'quoteBlock' }),
  defineArrayMember({ type: 'statsBlock' }),
  defineArrayMember({ type: 'wideImageBlock' }),
]

export const blockTypes = [
  richImage,
  videoItem,
  textBlock,
  sliderBlock,
  beforeAfterBlock,
  videoBlock,
  checklistBlock,
  quoteBlock,
  statsBlock,
  wideImageBlock,
]
