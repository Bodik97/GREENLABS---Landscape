/**
 * Код для Google Таблиці: приймає заявку від Worker'а і дописує рядок.
 *
 * Це не частина сайту — цей файл треба вставити в редактор Apps Script
 * усередині самої таблиці. Як саме — див. worker/README.md, розділ «Таблиця».
 */

/** Кольори сайту, щоб таблиця не виглядала чужою. */
var GREEN = '#1F3D2B'
var CREAM = '#F7F5F0'
var PARCHMENT = '#F4F1EB'

var HEADERS = ['Час', 'Подія', "Ім'я", 'Телефон', 'Сторінка', 'Адреса']
/** Ширини колонок у пікселях, у тому ж порядку. */
var WIDTHS = [140, 90, 180, 160, 260, 200]

function doPost(e) {
  // Запуск із редактора приходить без даних: людина натиснула «Виконати», не
  // помітивши, що у випадайці стоїть doPost. Замість помилки про postData
  // робимо те, заради чого туди й заходять, — наводимо лад у таблиці.
  if (!e || !e.postData) return formatSheet()

  var data = JSON.parse(e.postData.contents)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]

  if (sheet.getLastRow() === 0) formatSheet()

  sheet.appendRow([
    // Саме Date, а не готовий рядок: інакше таблиця сортує час як текст і
    // «10.08» стає раніше за «09.08». Вигляд задає формат колонки.
    new Date(),
    data.event === 'call' ? 'Дзвінок' : 'Заявка',
    data.name || '',
    data.phone || '',
    data.page || '',
    data.path || '',
  ])

  return ContentService.createTextOutput('ok')
}

/**
 * Наводить лад у таблиці: шапка, ширини, формати, смужки.
 *
 * Викликається сама при першому записі, але її можна запустити й руками з
 * редактора Apps Script — саме так оформлюють таблицю, яка вже має рядки.
 * Виконується скільки завгодно разів поспіль без шкоди.
 */
function formatSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = book.getSheets()[0]

  // Щоб час у таблиці збігався з часом у телеграмі.
  book.setSpreadsheetTimeZone('Europe/Kyiv')

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
  sheet.setFrozenRows(1)
  sheet.setRowHeight(1, 34)

  for (var i = 0; i < WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, WIDTHS[i])
  }

  // Формати колонок. Телефон — текстом, інакше таблиця бачить у ньому число
  // або формулу і псує «+38 (097)…».
  sheet.getRange('A2:A').setNumberFormat('dd.MM.yyyy  HH:mm')
  sheet.getRange('D2:D').setNumberFormat('@')

  // Дзвінки притлумлені, заявки — ні: у таблиці їх буде більше, і вони не мають
  // перетягувати на себе увагу з того, що потребує відповіді.
  var calls = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Дзвінок')
    .setBackground('#EFEDE7')
    .setFontColor('#6B6B65')
    .setRanges([sheet.getRange('B2:B')])
    .build()
  sheet.setConditionalFormatRules([calls])

  // Смужки через рядок: очима легше вести по довгому рядку до потрібної колонки.
  // Стару розмітку прибираємо, бо друге накладання на ті самі клітинки падає.
  var bandings = sheet.getBandings()
  for (var b = 0; b < bandings.length; b++) bandings[b].remove()

  sheet
    .getRange(1, 1, sheet.getMaxRows(), HEADERS.length)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(GREEN)
    .setFirstRowColor('#FFFFFF')
    .setSecondRowColor(PARCHMENT)

  sheet
    .getRange(1, 1, 1, HEADERS.length)
    .setFontColor(CREAM)
    .setFontWeight('bold')
    .setVerticalAlignment('middle')

  // Дані вирівнюємо по верху: довга назва сторінки переноситься на другий
  // рядок, і без цього сусідні клітинки «пливли» б посередині висоти.
  sheet.getRange('A2:F').setVerticalAlignment('top').setWrap(true)
}
