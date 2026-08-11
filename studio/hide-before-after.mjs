/**
 * Прибирає підробні знімки «до» з блоків «Як змінилася ділянка».
 *
 * Навіщо: у портфоліо «до» була затемненою копією «після» — той самий кадр,
 * та сама лавка, ті самі листки. Сайт показував клієнтові готовий сад,
 * підписаний як стан до роботи.
 *
 * Знімає лише посилання на картинку в блоці. Самі файли лишаються в медіатеці
 * Sanity, тож повернути можна будь-коли. Блок при цьому зникає сам:
 * Blocks.tsx не малює його без обох знімків.
 *
 * Запуск із теки studio:  npx sanity exec ./hide-before-after.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const projects = await client.fetch(
  `*[_type == "project" && count(blocks[_type == "beforeAfterBlock" && defined(before.asset)]) > 0]{
    _id, title, "slug": slug.current,
    "keys": blocks[_type == "beforeAfterBlock" && defined(before.asset)]._key
  }`,
)

if (!projects.length) {
  console.log('Немає блоків із знімком «до» — нічого прибирати.')
  process.exit(0)
}

for (const project of projects) {
  const paths = project.keys.map((key) => `blocks[_key=="${key}"].before`)
  await client.patch(project._id).unset(paths).commit()
  console.log(`${project.slug.padEnd(22)} прибрано «до» у ${paths.length} блоці(ах)`)
}

console.log(`\nГотово: ${projects.length} робіт.`)
