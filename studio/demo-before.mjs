/**
 * Показовий приклад: ставить у поле «до» роботи «Парадний в'їзд у Винниках»
 * інший кадр із її ж галереї.
 *
 * Навіщо: у всіх робіт «до» і «після» — це одна й та сама фотографія, друга
 * просто затемнена. Власник просив побачити, як блок поводиться з двома
 * справді різними знімками.
 *
 * Це саме показ, а не вміст: обидва кадри зняті вже після робіт. Коли зʼявиться
 * архівне фото ділянки до початку, його ставлять у це саме поле в студії.
 *
 * Запуск із теки studio:  npx sanity exec ./demo-before.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const SLUG = 'vynnyky'
/** «Підпірні стінки» — інший ракурс тієї самої ділянки. */
const REF = 'image-abdd5089887f2598ca3ce012027c7471fc21fca3-1200x900-jpg'

const project = await client.fetch(
  `*[_type == "project" && slug.current == $slug][0]{
    _id, "keys": blocks[_type == "beforeAfterBlock"]._key
  }`,
  { slug: SLUG },
)

const patch = {}
for (const key of project.keys) {
  patch[`blocks[_key=="${key}"].before`] = {
    _type: 'image',
    asset: { _type: 'reference', _ref: REF },
  }
}

await client.patch(project._id).set(patch).commit()
console.log(`${SLUG}: у поле «до» поставлено інший кадр із галереї.`)
