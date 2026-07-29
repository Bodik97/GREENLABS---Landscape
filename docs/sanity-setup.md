# Підключення Sanity до GREENLABS

Інструкція під цей проєкт: Vite + React + react-router, статичний хостинг на GitHub Pages.
Більшість гайдів у мережі написані для Next.js — тут кілька речей навмисне зроблено інакше,
бо в нас немає сервера.

Обсяг цієї інструкції — **портфоліо з фотографіями**. Решта контенту поки лишається в коді.

---

## Що ми отримаємо

Фото зберігаються в Sanity, а розміри задаються прямо в URL — так само, як зараз у Unsplash
(`?w=400&h=280&fit=crop&auto=format`). Нарізати файли заздалегідь не потрібно.

Плюс з'явиться адмінка, де можна додати новий об'єкт у портфоліо без правок коду й деплою.

---

## Крок 1. Акаунт і проєкт

Зареєструйся на [sanity.io](https://www.sanity.io) через Google або GitHub.

Далі з кореня репозиторію (`~/Downloads/Landscape`):

```bash
npm create sanity@latest -- --template clean --typescript --output-path studio
```

CLI запитає логін, назву проєкту (постав `GREENLABS`) і датасет — залиш `production`
і вибери **public**. Публічний датасет означає, що сайт читає дані без токена;
для портфоліо це те, що треба, і жодного секрету у фронтенді не з'явиться.

Studio створиться в папці `studio/` поруч із `src/`. Запиши **Project ID** —
він знадобиться далі, побачити його завжди можна командою `npx sanity manage`.

---

## Крок 2. Схема портфоліо

Створи файл `studio/schemaTypes/project.ts`:

```typescript
import { defineType, defineField } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Проєкт',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Локація',
      type: 'string',
      description: 'Наприклад: Личаківський р-н, Львів',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'area',
      title: 'Площа',
      type: 'string',
      description: 'Наприклад: 12 соток',
    }),
    defineField({
      name: 'tags',
      title: 'Теги',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: ['Озеленення', 'Газон', 'Освітлення', 'Проектування', 'Тераса', 'Полив', 'Мощення', 'Водойма', 'Посадка', 'Комерційний', 'Приватний'],
      },
    }),
    defineField({
      name: 'image',
      title: 'Фото',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Опис для SEO',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      description: 'Менше число — вище в списку',
    }),
  ],
})
```

`hotspot: true` — не пропускай цей рядок. Він дає змогу в адмінці вказати центр кадру,
і тоді обрізка під різні пропорції не відріже головне. Саме це рятує, коли одне фото
показується і як `400×280`, і як `900×700`.

Підключи тип у `studio/schemaTypes/index.ts`:

```typescript
import { project } from './project'

export const schemaTypes = [project]
```

---

## Крок 3. Запустити адмінку

```bash
cd studio
npx sanity dev
```

Відкриється `http://localhost:3333`. Додай кілька проєктів із фото — саме тут завантажуються
зображення, просто перетягуванням.

Далі опублікуй схему й саму адмінку:

```bash
npx sanity schemas deploy
npx sanity deploy
```

Друга команда попросить придумати адресу — адмінка стане доступною
на `https://твоя-назва.sanity.studio` з будь-якого комп'ютера. Клієнт зможе додавати роботи сам.

---

## Крок 4. Дозволити доступ із сайту

Це найчастіша причина, чому «все налаштував, а нічого не працює». Браузер заблокує запити
з чужого домену, поки цей домен не дозволено явно:

```bash
cd studio
npx sanity cors add https://bodik97.github.io
npx sanity cors add http://localhost:8443
```

Перший — для живого сайту, другий — для локальної розробки.
Облікові дані не потрібні, тож на питання про credentials відповідай `No`.

---

## Крок 5. Підключити до сайту

З кореня репозиторію:

```bash
pnpm add @sanity/client @sanity/image-url
```

Створи `src/lib/sanity.ts`:

```typescript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'ТВІЙ_PROJECT_ID',
  dataset: 'production',
  apiVersion: '2026-07-29',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export const urlFor = (source: any) => builder.image(source)
```

`projectId` і `dataset` — публічні значення, не секрети. Їх можна тримати прямо в коді,
і саме так простіше: інакше довелося б окремо прокидати змінні оточення
в `.github/workflows/deploy.yml`, бо збірка відбувається в CI, а не на твоєму комп'ютері.
Якщо все ж захочеш через `.env`, пам'ятай, що у Vite працює лише префікс `VITE_`.

`useCdn: true` вмикає кешовану віддачу — для публічного контенту це швидше й дешевше.

---

## Крок 6. Показати дані в компоненті

Тут головна відмінність від гайдів для Next.js. У нас немає сервера, тому дані
завантажуються вже в браузері, а компонент має вміти показувати стан очікування.

```tsx
import { useEffect, useState } from 'react'
import { client, urlFor } from '../lib/sanity'

type Project = {
  _id: string
  title: string
  area?: string
  tags?: string[]
  image: any
}

export function Portfolio() {
  const [projects, setProjects] = useState<Project[] | null>(null)

  useEffect(() => {
    client
      .fetch<Project[]>('*[_type == "project"] | order(order asc){ _id, title, area, tags, image }')
      .then(setProjects)
      .catch(() => setProjects([]))
  }, [])

  if (!projects) return null

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {projects.map((p) => (
        <figure key={p._id}>
          <img
            src={urlFor(p.image).width(800).height(600).fit('crop').auto('format').url()}
            alt={p.image?.alt || p.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <figcaption>{p.title}</figcaption>
        </figure>
      ))}
    </div>
  )
}
```

`.width(800).height(600).fit('crop')` — прямий відповідник теперішнього
`?w=800&h=600&fit=crop`, а `.auto('format')` віддасть WebP там, де браузер його розуміє.

---

## Що зміниться в проєкті

Зараз портфоліо лежить у `src/data/data.tsx` разом із рештою контенту, і компоненти
беруть його синхронно. Після переходу з'являються три речі, яких раніше не було:
стан завантаження, можлива помилка мережі та порожній кадр до приходу даних.

Через це варто закласти скелетон або мінімальну висоту контейнера — інакше під час
завантаження сторінка «стрибне», і Hero з портфоліо посуватимуться.

Решта контенту — послуги, FAQ, команда, блог — може спокійно лишатися в коді.
Переносити все одразу не обов'язково.

---

## Скільки коштує

Безкоштовного тарифу для лендінгу вистачає з великим запасом: він включає
десятки тисяч документів, гігабайти файлів і CDN-трафік. Платити доведеться,
лише якщо з'явиться багато редакторів або дуже великий трафік.

---

## Якщо щось не працює

**Порожня сторінка, у консолі CORS-помилка** — не виконано крок 4 або домен вказано з помилкою
(зайвий слеш у кінці, `http` замість `https`).

**`Unauthorized` при запиті** — датасет створено приватним. Перевір і зроби публічним:

```bash
cd studio
npx sanity dataset visibility set production public
```

**Дані є в адмінці, але сайт їх не бачить** — документи збережені як чернетки.
У Studio натисни **Publish**; неопубліковані документи через публічний API не віддаються.

**Змінив схему, а поля не з'явилися** — виконай `npx sanity schemas deploy` ще раз.

**Картинка розтягнута** — перевір, що передав і `.width()`, і `.height()` разом із `.fit('crop')`.
Без `fit` Sanity вписує зображення в межі, зберігаючи пропорції.

---


## Що вже зроблено

Кроки 1–6 пройдені. Project ID — `v6s9ym4d`, датасет `production`.

У Sanity тепер три типи документів: **Робота**, **Стаття** і **Співробітник**.
Роботи й статті збираються з однакового набору блоків (текст, слайдер, до/після,
відео, список, цитата, цифри, широке фото).

Як цим користуватись — у [admin-guide.md](./admin-guide.md).

Що читає з Sanity на сайті:

| Місце | Файл |
|---|---|
| Портфоліо на головній | `src/components/sections/Portfolio.tsx` |
| Сторінка роботи `/works/:slug` | `src/pages/WorkPage.tsx` |
| Блог на головній | `src/components/sections/BlogSection.tsx` |
| Сторінка статті `/blog/:slug` | `src/pages/PostPage.tsx` |
| Команда на «Про нас» | `src/components/sections/Team.tsx` |
| Рендер блоків | `src/components/blocks/Blocks.tsx` |
| Клієнт, типи, GROQ-запити | `src/lib/sanity.ts` |

Решта контенту — послуги, FAQ, «чому ми» — і далі лежить у `src/data/data.tsx`.
