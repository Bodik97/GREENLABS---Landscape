/**
 * Код для Google Таблиці: приймає заявку від Worker'а і дописує рядок.
 *
 * Це не частина сайту — цей файл треба вставити в редактор Apps Script
 * усередині самої таблиці. Як саме — див. worker/README.md, розділ «Таблиця».
 *
 * Скрипт володіє лише колонками A–D і H. Усе інше — Статус, Менеджер,
 * Коментар, блок статистики — ведеться руками, і чіпати його не можна:
 * там формули, які рахують по конкретних колонках.
 */

/** Кольори сайту, щоб шапка не виглядала чужою. */
var GREEN = '#1F3D2B'
var CREAM = '#F7F5F0'

/** Колонки, які заповнює скрипт. Порядок — як у таблиці, з A. */
var HEADERS = ['Час', "Ім'я", 'Телефон', 'Сторінка']
/** Ширини для них, у пікселях. */
var WIDTHS = [150, 190, 170, 260]

/**
 * Куди писати вид звернення — заявка це чи клік по номеру.
 *
 * Восьма колонка (H) — перша вільна після «Коментар». Ліворуч ставити не
 * можна: усе, що між D і G, зсунулось би, а на ті колонки зав'язані формули.
 */
var EVENT_COL = 8

function doPost(e) {
  // Запуск із редактора приходить без даних: людина натиснула «Виконати», не
  // помітивши, що у випадайці стоїть doPost. Замість помилки про postData
  // робимо те, заради чого туди й заходять, — наводимо лад у шапці.
  if (!e || !e.postData) return formatSheet()

  var data = JSON.parse(e.postData.contents)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]

  if (sheet.getLastRow() === 0) formatSheet()

  var row = nextRow(sheet)
  sheet.getRange(row, 1, 1, 4).setValues([[
    // Саме Date, а не готовий рядок: інакше таблиця сортує час як текст і
    // «10.08» стає раніше за «09.08». Вигляд задає формат колонки.
    new Date(),
    data.name || '',
    data.phone || '',
    data.page || '',
  ]])
  sheet.getRange(row, EVENT_COL).setValue(data.event === 'call' ? 'Дзвінок' : 'Заявка')

  return ContentService.createTextOutput('ok')
}

/**
 * Перший вільний рядок за колонкою часу.
 *
 * getLastRow() тут не годиться: він бачить і блок статистики праворуч, який
 * тягнеться нижче за самі заявки, — і кожен запис падав би через порожнечу.
 */
function nextRow(sheet) {
  var times = sheet.getRange('A:A').getValues()
  var row = times.length
  while (row > 0 && times[row - 1][0] === '') row--
  return row + 1
}

/**
 * Наводить лад у шапці й форматах — тільки в своїх колонках.
 *
 * Запускається сама при першому записі; руками її викликають із редактора,
 * обравши formatSheet у випадайці функцій. Виконується скільки завгодно разів.
 */
function formatSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = book.getSheets()[0]

  // Щоб час у таблиці збігався з часом у телеграмі.
  book.setSpreadsheetTimeZone('Europe/Kyiv')

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
  sheet.getRange(1, EVENT_COL).setValue('Подія')
  sheet.setFrozenRows(1)

  for (var i = 0; i < WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, WIDTHS[i])
  }
  sheet.setColumnWidth(EVENT_COL, 90)

  // Телефон — текстом, інакше таблиця бачить у ньому число або формулу і псує
  // «+38 (097)…».
  sheet.getRange('A2:A').setNumberFormat('dd.MM.yyyy  HH:mm')
  sheet.getRange('C2:C').setNumberFormat('@')

  // Оформлюємо тільки свої заголовки: решту шапки веде власник таблиці.
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontColor(CREAM)
    .setFontWeight('bold')
    .setBackground(GREEN)
  sheet.getRange(1, EVENT_COL)
    .setFontColor(CREAM)
    .setFontWeight('bold')
    .setBackground(GREEN)

  // Довгі назви сторінок переносимо, щоб не обрізались.
  sheet.getRange('A2:D').setVerticalAlignment('top').setWrap(true)
}
