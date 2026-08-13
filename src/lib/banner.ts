import { imageUrl, type SanityImage } from './sanity'

/**
 * Набори розмірів для банера сторінки.
 *
 * Банер займає 70vh, а фото в нього вписується через object-cover — тобто на
 * вертикальному екрані широкий кадр малюється вдвічі ширшим за телефон і майже
 * весь іде під обрізку. Тому телефону віддаємо окремий вертикальний кадр: видно
 * рівно те саме, а важить він утричі менше.
 */
const WIDTHS = [640, 960, 1280, 1600]

export type Banner = {
  img: string
  srcSet: string
  portrait: string
}

/** Банер із файла в public/img — розміри згенеровані наперед. */
export function fileBanner(name: string): Banner {
  const base = import.meta.env.BASE_URL
  return {
    img: `${base}img/${name}-1280.webp`,
    srcSet: WIDTHS.map((w) => `${base}img/${name}-${w}.webp ${w}w`).join(', '),
    portrait: `${base}img/${name}-portrait.webp`,
  }
}

/** Банер із Sanity: CDN уміє віддати будь-яку ширину й будь-яке співвідношення,
    тож вертикальний кадр просимо просто в нього, нічого не готуючи заздалегідь. */
export function sanityBanner(image: SanityImage): Banner {
  return {
    img: imageUrl(image, 1280, 800),
    srcSet: WIDTHS.map((w) => `${imageUrl(image, w, Math.round(w * 0.625))} ${w}w`).join(', '),
    portrait: imageUrl(image, 810, 1080),
  }
}
