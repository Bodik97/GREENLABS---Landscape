/**
 * Код для Google Таблиці: приймає заявку від Worker'а і дописує рядок.
 *
 * Це не частина сайту — цей файл треба вставити в редактор Apps Script
 * усередині самої таблиці. Як саме — див. worker/README.md, розділ «Таблиця».
 */

function doPost(e) {
  var data = JSON.parse(e.postData.contents)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]

  // Перший запис у порожню таблицю сам створює шапку.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Час', "Ім'я", 'Телефон', 'Сторінка'])
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }

  sheet.appendRow([
    Utilities.formatDate(new Date(), 'Europe/Kyiv', 'dd.MM.yyyy HH:mm'),
    data.name || '',
    // Апостроф не дає таблиці зробити з номера формулу чи число.
    "'" + (data.phone || ''),
    data.page || '',
  ])

  return ContentService.createTextOutput('ok')
}
