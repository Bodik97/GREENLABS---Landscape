import type { Price } from '../../lib/sanity'

const fmt = (n: number) => n.toLocaleString('uk-UA')

/** «від 180 до 260 грн/м²» або «від 180 грн/м²», якщо верхньої межі немає. */
export function priceLabel(price?: Price) {
  if (!price?.from || !price.unit) return null
  const range = price.to && price.to > price.from ? `${fmt(price.from)}–${fmt(price.to)}` : `від ${fmt(price.from)}`
  return `${range} ${price.unit}`
}

/** Рядок ціни на картці. Нічого не малює, поки вилка не заповнена. */
export function PriceTag({ price, className = '' }: { price?: Price; className?: string }) {
  const label = priceLabel(price)
  if (!label) return null

  return (
    <span className={`font-display font-semibold text-terra text-[13px] ${className}`}>{label}</span>
  )
}

/**
 * Розгорнутий блок умов на сторінці послуги: ціна, термін, гарантія, сезон.
 * Показуємо лише заповнені рядки — недозаповнена послуга не виглядає зламаною.
 */
export function PriceBox({
  price,
  duration,
  guarantee,
  season,
}: {
  price?: Price
  duration?: string
  guarantee?: string
  season?: string
}) {
  const rows = [
    ['Вартість', priceLabel(price)],
    ['Термін', duration],
    ['Гарантія', guarantee],
    ['Сезон робіт', season],
  ].filter(([, value]) => Boolean(value)) as [string, string][]

  if (!rows.length) return null

  // Кожна умова — окрема картка з підписом над значенням. Спільний блок із
  // вирівнюванням праворуч ламався на довгих рядках: «Сезон робіт» переносився
  // і висів криво під своїм підписом.
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map(([label, value]) => (
        <dl key={label} className="bg-parchment rounded-2xl px-5 py-4 md:px-6 md:py-5">
          <dt className="text-stone text-[11px] font-sans uppercase tracking-[0.08em] mb-1.5">{label}</dt>
          <dd className="text-ink font-display font-semibold text-[15px] md:text-[17px] leading-[1.45]">{value}</dd>
        </dl>
      ))}
      {price?.note && (
        <p className="text-stone text-[12px] font-sans leading-[1.65] px-1 pt-1">{price.note}</p>
      )}
    </div>
  )
}
