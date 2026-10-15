function getDatabase_() {
  const props = PropertiesService.getScriptProperties();
  let id = String(props.getProperty('APTIS_DATABASE_ID') || '').trim();

  // One-time bridge from V1/V2 constant to persistent Script Properties.
  if (!id && DATABASE_SPREADSHEET_ID && DATABASE_SPREADSHEET_ID.indexOf('PASTE_') !== 0) {
    id = String(DATABASE_SPREADSHEET_ID).trim();
    props.setProperty('APTIS_DATABASE_ID', id);
  }

  if (!id) {
    throw new Error('One-time setup: paste your EXISTING Google Sheet ID into DATABASE_SPREADSHEET_ID in Config.gs. The ID will then be stored automatically in Script Properties for future versions.');
  }
  return SpreadsheetApp.openById(id);
}

function ensureSheetWithHeaders_(ss, name, headers, report) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeader_(sheet, headers.length);
    report.push('Created sheet ' + name + '.');
    return sheet;
  }

  headers.forEach(function(header, i) {
    if (String(sheet.getRange(1, i + 1).getDisplayValue() || '').trim() !== header) {
      const existing = findHeaderColumn_(sheet, header);
      if (existing > 0) return;
      sheet.getRange(1, i + 1).setValue(header);
      report.push('Added header ' + name + '.' + header + '.');
    }
  });
  styleHeader_(sheet, Math.max(headers.length, sheet.getLastColumn()));
  return sheet;
}

function ensureColumn_(sheet, header, targetHeaders, report) {
  if (findHeaderColumn_(sheet, header) > 0) return;
  let col = targetHeaders.indexOf(header) + 1;
  if (col <= 0) col = sheet.getLastColumn() + 1;
  if (String(sheet.getRange(1, col).getDisplayValue() || '').trim()) col = sheet.getLastColumn() + 1;
  sheet.getRange(1, col).setValue(header);
  report.push('Added column ' + sheet.getName() + '.' + header + '.');
}

function requireSheet_(name, headers) {
  const sheet = getDatabase_().getSheetByName(name);
  if (!sheet) throw new Error('Missing required sheet: ' + name);
  headers.forEach(function(header) {
    if (findHeaderColumn_(sheet, header) < 1) throw new Error('Missing column "' + header + '" in sheet ' + name);
  });
  return sheet;
}

function findHeaderColumn_(sheet, header) {
  const last = Math.max(1, sheet.getLastColumn());
  const row = sheet.getRange(1, 1, 1, last).getDisplayValues()[0];
  for (let i = 0; i < row.length; i++) {
    if (String(row[i] || '').trim() === header) return i + 1;
  }
  return -1;
}

function headerIndexMap_(sheet) {
  const last = Math.max(1, sheet.getLastColumn());
  const headers = sheet.getRange(1, 1, 1, last).getDisplayValues()[0];
  const idx = {};
  headers.forEach(function(h, i) {
    const key = String(h || '').trim();
    if (key) idx[key] = i;
  });
  return idx;
}

function styleHeader_(sheet, cols) {
  if (!cols) return;
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, cols).setFontWeight('bold').setBackground('#eef2ff');
}

function setSetting_(sheet, key, value) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0] || '') === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function getSetting_(sheet, key) {
  if (!sheet || sheet.getLastRow() < 2) return '';
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.min(2, Math.max(2, sheet.getLastColumn()))).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '') === key) return String(values[i][1] || '');
  }
  return '';
}


