import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { Reveal } from '../ui/Reveal'
import { Eyebrow } from '../ui/Eyebrow'
import { IcoCheck } from '../ui/Icons'
import { BeforeAfterSlider } from '../ui/BeforeAfterSlider'
import { Slider } from '../ui/Slider'
import { imageUrl, type Block, type VideoItem } from '../../lib/sanity'

/** Звичайне посилання на YouTube/Vimeo → адреса плеєра для iframe. */
export function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

const portableComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-ink text-[15px] font-sans leading-[1.72] mb-4">{children}</p>,
    h3: ({ children }) => (
      <h3 className="font-display font-bold text-ink text-[22px] md:text-[26px] leading-[1.15] mt-8 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-display font-semibold text-ink text-[17px] leading-snug mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-terra pl-5 my-6 text-ink text-[16px] font-sans italic leading-[1.7]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 mb-4 flex flex-col gap-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 mb-4 flex flex-col gap-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="text-ink text-[15px] font-sans leading-[1.65]">{children}</li>,
    number: ({ children }) => <li className="text-ink text-[15px] font-sans leading-[1.65]">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
}

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title?: string }) {
  if (!eyebrow && !title) return null
  return (
    <Reveal className="mb-10">
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      {title && (
        <h2 className="font-display font-bold text-ink text-[28px] md:text-[40px] leading-[1.1] max-w-150">{title}</h2>
      )}
    </Reveal>
  )
}

function VideoFrame({ video, title }: { video: VideoItem; title: string }) {
  if (video.source === 'file') {
    return (
      <video
        controls
        preload="metadata"
        poster={video.poster?.asset ? imageUrl(video.poster, 1200, 675) : undefined}
        className="w-full h-full object-cover"
      >
        <source src={video.fileUrl} />
        Ваш браузер не програє це відео.
      </video>
    )
  }
  const src = video.url && embedUrl(video.url)
  if (!src) return null
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  )
}

function BlockBody({ block, fallbackAlt, onCream }: { block: Block; fallbackAlt: string; onCream: boolean }) {
  switch (block._type) {
    case 'textBlock':
      return (
        <>
          <SectionHeading eyebrow={block.subheading} title={block.heading} />
          {block.body && (
            <Reveal className="max-w-175">
              <PortableText value={block.body} components={portableComponents} />
            </Reveal>
          )}
        </>
      )

    case 'sliderBlock': {
      const images = block.images?.filter((i) => i.asset) ?? []
      if (!images.length) return null
      return (
        <>
          <SectionHeading title={block.heading} />
          <Reveal className="max-w-200">
            <Slider images={images} alt={fallbackAlt} />
          </Reveal>
        </>
      )
    }

    case 'beforeAfterBlock': {
      if (!block.before?.asset || !block.after?.asset) return null
      const label = block.caption || fallbackAlt
      return (
        <>
          <SectionHeading title={block.heading} />
          <Reveal className="max-w-175">
            <BeforeAfterSlider
              img={imageUrl(block.after, 1200, 900)}
              imgBefore={imageUrl(block.before, 1200, 900)}
              label={label}
              beforeLabel={block.beforeLabel || 'До'}
              afterLabel={block.afterLabel || 'Після'}
            />
            {block.caption && <p className="text-ink text-[13px] font-display font-semibold mt-3">{block.caption}</p>}
            <p className="text-stone text-[11px] font-sans mt-0.5">Потягніть повзунок, щоб порівняти кадри</p>
          </Reveal>
        </>
      )
    }

    case 'videoBlock': {
      const videos = (block.videos ?? []).filter((v) => (v.source === 'file' ? v.fileUrl : v.url && embedUrl(v.url)))
      if (!videos.length) return null
      return (
        <>
          <SectionHeading title={block.heading} />
          <div className={videos.length === 1 ? 'max-w-175' : 'grid md:grid-cols-2 gap-6'}>
            {videos.map((video, i) => (
              <Reveal key={video._key ?? i} delay={(i % 2) * 90}>
                <div className="rounded-2xl overflow-hidden bg-green aspect-video">
                  <VideoFrame video={video} title={video.title || fallbackAlt} />
                </div>
                {video.title && <p className="text-stone text-[12px] font-sans mt-2.5">{video.title}</p>}
              </Reveal>
            ))}
          </div>
        </>
      )
    }

    case 'checklistBlock': {
      if (!block.items?.length) return null
      return (
        <>
          <SectionHeading title={block.heading} />
          <div className="grid sm:grid-cols-2 gap-5">
            {block.items.map((item, i) => (
              <Reveal key={item} delay={(i % 6) * 60}>
                <div className={`flex items-start gap-3.5 rounded-2xl p-5 ${onCream ? 'bg-parchment' : 'bg-cream'}`}>
                  <span className="text-green mt-0.5 shrink-0">
                    <IcoCheck className="w-5 h-5" />
                  </span>
                  <span className="text-ink text-[14px] font-sans leading-[1.55]">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </>
      )
    }

    case 'quoteBlock': {
      if (!block.quote) return null
      return (
        <Reveal className="max-w-175">
          <blockquote className="border-l-2 border-terra pl-6 md:pl-8">
            <p className="font-display text-ink text-[22px] md:text-[28px] leading-[1.35] mb-5">«{block.quote}»</p>
            {block.author && (
              <footer className="text-stone text-[13px] font-sans">
                {block.author}
                {block.authorRole && <span className="text-stone/70"> — {block.authorRole}</span>}
              </footer>
            )}
          </blockquote>
        </Reveal>
      )
    }

    case 'statsBlock': {
      if (!block.items?.length) return null
      return (
        <>
          <SectionHeading title={block.heading} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {block.items.map((stat, i) => (
              <Reveal key={stat._key ?? i} delay={(i % 4) * 70}>
                <p className="font-display font-bold text-green text-[30px] md:text-[40px] leading-none mb-2">
                  {stat.value}
                </p>
                <p className="text-stone text-[13px] font-sans leading-snug">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </>
      )
    }

    case 'wideImageBlock': {
      if (!block.image?.asset) return null
      return (
        <Reveal>
          <figure>
            <div className="rounded-2xl overflow-hidden bg-green aspect-21/9">
              <img
                src={imageUrl(block.image, 1800, 771)}
                alt={block.image.alt || fallbackAlt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {block.image.caption && (
              <figcaption className="text-stone text-[12px] font-sans mt-2.5">{block.image.caption}</figcaption>
            )}
          </figure>
        </Reveal>
      )
    }

    default:
      return null
  }
}

/** Малює блоки в тому порядку, в якому їх склали в адмінці, чергуючи тло секцій. */
export function Blocks({ blocks, fallbackAlt }: { blocks?: Block[]; fallbackAlt: string }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, i) => {
        const onCream = i % 2 === 0
        return (
          <section key={block._key ?? i} className={`relative py-20 ${onCream ? 'bg-cream' : 'bg-parchment'}`}>
            <div className="max-w-7xl mx-auto px-6">
              <BlockBody block={block} fallbackAlt={fallbackAlt} onCream={onCream} />
            </div>
          </section>
        )
      })}
    </>
  )
}
