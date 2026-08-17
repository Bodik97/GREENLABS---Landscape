/**
 * Маска телефону й перевірка імені — src/lib/phone.ts
 *
 * Найдорожчий код на сайті: через нього проходить кожна заявка й кожен відгук.
 * Помилка тут не падає й не світиться в логах — вона просто мовчки не пускає
 * людину надіслати форму. Тому тут перевіряються саме ті випадки, через які
 * форму вже доводилось лагодити (вони описані коментарями в самому модулі).
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  NAME_MAX,
  cleanName,
  isOperatorPrefix,
  phoneDigits,
  formatPhone,
  caretAfterDigits,
} from '../src/lib/phone.ts'

describe('formatPhone', () => {
  test('малює маску з голих цифр', () => {
    assert.equal(formatPhone('0671234567'), '+38 (067) 123-45-67')
  })

  test('вставлений з месенджера номер дає той самий результат', () => {
    assert.equal(formatPhone('+38 (067) 123-45-67'), '+38 (067) 123-45-67')
  })

  test('номер без нуля спереду отримує його сам', () => {
    assert.equal(formatPhone('671234567'), '+38 (067) 123-45-67')
  })

  test('добудовує маску поступово, поки людина набирає', () => {
    assert.equal(formatPhone('0'), '+38 (0')
    assert.equal(formatPhone('067'), '+38 (067)')
    assert.equal(formatPhone('067123'), '+38 (067) 123')
    assert.equal(formatPhone('06712345'), '+38 (067) 123-45')
  })

  test('зайві цифри відкидає, а не тягне в маску', () => {
    assert.equal(formatPhone('06712345678888'), '+38 (067) 123-45-67')
  })

  test('порожнє поле лишається порожнім, а не стає «+38 (»', () => {
    assert.equal(formatPhone(''), '')
  })
})

describe('isOperatorPrefix', () => {
  test('приймає повний код оператора', () => {
    assert.equal(isOperatorPrefix('067'), true)
  })

  test('приймає незавершений код, який ще може стати справжнім', () => {
    assert.equal(isOperatorPrefix('06'), true)
  })

  test('відхиляє код, якого в Україні немає', () => {
    assert.equal(isOperatorPrefix('011'), false)
  })

  test('порожнє поле не є помилкою — людина ще не почала', () => {
    assert.equal(isOperatorPrefix(''), true)
  })
})

describe('phoneDigits', () => {
  test('зрізає код країни, а не тягне його в номер', () => {
    assert.equal(phoneDigits('+380671234567'), '0671234567')
  })

  test('лишає рівно десять цифр із будь-якого запису', () => {
    assert.equal(phoneDigits('+38 (067) 123-45-67').length, 10)
  })
})

describe('caretAfterDigits', () => {
  /* Саме тут ламалось редагування коду оператора: коли зі стертих трьох цифр
     не лишалось жодної, курсор летів у кінець рядка й дописати новий код було
     неможливо. Курсор має стояти одразу за «+38 (». */
  test('без жодної цифри ліворуч курсор стоїть за дужкою, а не в кінці', () => {
    assert.equal(caretAfterDigits('+38 (067) 123-45-67', 0), 5)
  })

  test('ставить курсор після потрібної за ліком цифри', () => {
    assert.equal(caretAfterDigits('+38 (067) 123-45-67', 3), 8)
  })

  test('порожній рядок не ламає розрахунок', () => {
    assert.equal(caretAfterDigits('', 3), 0)
  })
})

describe('cleanName', () => {
  test('лишає апостроф і дефіс — без них половина імен не вводиться', () => {
    assert.equal(cleanName("Анна-Марія О'Коннор"), "Анна-Марія О'Коннор")
  })

  test('викидає цифри й розмітку', () => {
    assert.equal(cleanName('Олена<script>1'), 'Оленаscript')
  })

  test('обрізає задовге імʼя до межі', () => {
    assert.equal(cleanName('я'.repeat(100)).length, NAME_MAX)
  })
})
