/**
 * Повертає знімки «до» в блоки «Як змінилася ділянка».
 *
 * Зворотний до hide-before-after.mjs: той знімав посилання, цей ставить їх
 * назад. Самі файли з медіатеки не зникали, тож достатньо відновити посилання.
 *
 * Ідентифікатори взяті з даних до прибирання. Коли зʼявляться справжні архівні
 * знімки, їх заливають у поле «до» просто в студії — цей скрипт більше не
 * потрібен.
 *
 * Запуск із теки studio:  npx sanity exec ./restore-before-after.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient()

/** slug роботи → ідентифікатор знімка «до». */
const BEFORE = {
  'pasiky-zubrytski': 'image-a7ec268c1c005cbb0c76c81c9409368cd8036716-1200x900-jpg',
  'sykhivskyi-lviv': 'image-16405d525842a08e74883a6e6167b7ef99b299d1-1200x900-jpg',
  vynnyky: 'image-22f29810dfaa98a72c5ad664456754b163285d97-1200x900-jpg',
  'lychakivskyi-lviv': 'image-e9cf95c9d3294c5f44c55da728230160508b8b99-1200x900-jpg',
  'zymna-voda': 'image-d2d385d2e6659e8127e95f5e24d614189662f226-1200x900-jpg',
  briukhovychi: 'image-9b03f1ad5dfe21b83e327c85d05d9f5bff497819-1200x900-jpg',
  'frankivskyi-lviv': 'image-af6de59b65d46eff718a2d0f536123f0d2c8f707-1200x900-jpg',
  'riasne-2-lviv': 'image-c7869ad5356de857296e23065604a7160a708ae7-1200x900-jpg',
}

const projects = await client.fetch(
  `*[_type == "project" && slug.current in $slugs]{
    _id, "slug": slug.current,
    "keys": blocks[_type == "beforeAfterBlock"]._key
  }`,
  { slugs: Object.keys(BEFORE) },
)

for (const project of projects) {
  const ref = BEFORE[project.slug]
  const patch = {}
  for (const key of project.keys) {
    patch[`blocks[_key=="${key}"].before`] = {
      _type: 'image',
      asset: { _type: 'reference', _ref: ref },
    }
  }
  await client.patch(project._id).set(patch).commit()
  console.log(`${project.slug.padEnd(22)} повернуто «до» у ${project.keys.length} блоці(ах)`)
}

console.log(`\nГотово: ${projects.length} робіт.`)
