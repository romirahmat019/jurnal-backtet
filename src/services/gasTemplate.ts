/**
 * Complete Google Apps Script code for Forex Backtest Journal.
 * Users can copy this script directly into Google Sheets (Extensions > Apps Script).
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * FOREX BACKTEST JOURNAL - GOOGLE APPS SCRIPT API
 * Architecture:
 * - Database: Google Sheets (Sheets: TRADES, REVIEWS, SETTINGS)
 * - File Storage: Google Drive (Folder: Forex Backtest Journal / Screenshots)
 * - Protocol: REST JSON API via doGet / doPost
 */

const FOLDER_NAME = 'Forex Backtest Journal';
const SCREENSHOT_SUBFOLDER = 'Screenshots';
const SHEET_TRADES = 'TRADES';
const SHEET_REVIEWS = 'REVIEWS';
const SHEET_SETTINGS = 'SETTINGS';

const TRADE_HEADERS = [
  'ID', 'Date', 'Time', 'Pair', 'Direction', 'Timeframe', 'Session',
  'Setup', 'MarketCondition', 'Entry', 'StopLoss', 'TakeProfit', 'Exit',
  'RiskPercent', 'RiskAmount', 'RR_Planned', 'RR_Actual', 'Result',
  'ResultR', 'ProfitLoss', 'Duration', 'ScreenshotURL', 'BeforeScreenshotURL',
  'AfterScreenshotURL', 'EntryReason', 'MarketContext', 'Confirmation',
  'Mistake', 'Emotion', 'Lesson', 'Tags', 'ExecutedToPlan', 'PlanViolation',
  'PlanViolationReason', 'BacktestSessionID', 'AccountID', 'CreatedAt'
];

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getTrades';
    let responseData = null;

    if (action === 'getTrades') {
      responseData = getTrades();
    } else if (action === 'getTradeById') {
      responseData = getTradeById(e.parameter.id);
    } else if (action === 'getSettings') {
      responseData = getSettings();
    } else if (action === 'ping') {
      responseData = { status: 'ok', timestamp: new Date().toISOString() };
    } else {
      throw new Error('Unknown action: ' + action);
    }

    return createJsonResponse({ success: true, data: responseData, message: 'Success' });
  } catch (err) {
    return createJsonResponse({ success: false, data: null, message: err.toString() });
  }
}

function doPost(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    const action = body.action || (e && e.parameter && e.parameter.action);
    let result = null;

    if (action === 'createTrade') {
      result = createTrade(body.trade);
    } else if (action === 'updateTrade') {
      result = updateTrade(body.id, body.trade);
    } else if (action === 'deleteTrade') {
      result = deleteTrade(body.id);
    } else if (action === 'uploadScreenshot') {
      result = uploadScreenshot(body.base64Data, body.fileName, body.mimeType, body.tradeId);
    } else if (action === 'saveSettings') {
      result = saveSettings(body.settings);
    } else {
      throw new Error('Unknown POST action: ' + action);
    }

    return createJsonResponse({ success: true, data: result, message: 'Action completed successfully' });
  } catch (err) {
    return createJsonResponse({ success: false, data: null, message: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function getTrades() {
  const sheet = getOrCreateSheet(SHEET_TRADES, TRADE_HEADERS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const trades = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    trades.push(item);
  }
  return trades;
}

function getTradeById(id) {
  const trades = getTrades();
  return trades.find(t => t.ID === id) || null;
}

function createTrade(trade) {
  const sheet = getOrCreateSheet(SHEET_TRADES, TRADE_HEADERS);
  const id = trade.ID || trade.id || 'TRD-' + Utilities.getUuid().slice(0, 8);
  const createdAt = trade.CreatedAt || trade.createdAt || new Date().toISOString();

  const row = [
    id,
    trade.Date || trade.date || '',
    trade.Time || trade.time || '',
    trade.Pair || trade.pair || '',
    trade.Direction || trade.direction || 'BUY',
    trade.Timeframe || trade.timeframe || 'M15',
    trade.Session || trade.session || 'LONDON',
    trade.Setup || trade.setup || '',
    trade.MarketCondition || trade.marketCondition || 'TRENDING',
    trade.Entry || trade.entry || 0,
    trade.StopLoss || trade.stopLoss || 0,
    trade.TakeProfit || trade.takeProfit || 0,
    trade.Exit || trade.exit || 0,
    trade.RiskPercent || trade.riskPercent || 1,
    trade.RiskAmount || trade.riskAmount || 0,
    trade.RR_Planned || trade.rrPlanned || 0,
    trade.RR_Actual || trade.rrActual || 0,
    trade.Result || trade.result || 'BE',
    trade.ResultR || trade.resultR || 0,
    trade.ProfitLoss || trade.profitLoss || 0,
    trade.Duration || trade.duration || '',
    trade.ScreenshotURL || trade.screenshotUrl || '',
    trade.BeforeScreenshotURL || trade.beforeScreenshotUrl || '',
    trade.AfterScreenshotURL || trade.afterScreenshotUrl || '',
    trade.EntryReason || trade.entryReason || '',
    trade.MarketContext || trade.marketContext || '',
    trade.Confirmation || trade.confirmation || '',
    trade.Mistake || trade.mistake || '',
    trade.Emotion || trade.emotion || '',
    trade.Lesson || trade.lesson || '',
    Array.isArray(trade.Tags || trade.tags) ? (trade.Tags || trade.tags).join(',') : (trade.Tags || trade.tags || ''),
    trade.ExecutedToPlan !== undefined ? trade.ExecutedToPlan : (trade.executedToPlan || false),
    trade.PlanViolation !== undefined ? trade.PlanViolation : (trade.planViolation || false),
    trade.PlanViolationReason || trade.planViolationReason || '',
    trade.BacktestSessionID || trade.backtestSessionId || '',
    trade.AccountID || trade.accountId || 'Default',
    createdAt
  ];

  sheet.appendRow(row);
  return { id, success: true };
}

function updateTrade(id, trade) {
  const sheet = getOrCreateSheet(SHEET_TRADES, TRADE_HEADERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      // Row found
      const rowIndex = i + 1;
      const row = [
        id,
        trade.Date || trade.date,
        trade.Time || trade.time,
        trade.Pair || trade.pair,
        trade.Direction || trade.direction,
        trade.Timeframe || trade.timeframe,
        trade.Session || trade.session,
        trade.Setup || trade.setup,
        trade.MarketCondition || trade.marketCondition,
        trade.Entry || trade.entry,
        trade.StopLoss || trade.stopLoss,
        trade.TakeProfit || trade.takeProfit,
        trade.Exit || trade.exit,
        trade.RiskPercent || trade.riskPercent,
        trade.RiskAmount || trade.riskAmount,
        trade.RR_Planned || trade.rrPlanned,
        trade.RR_Actual || trade.rrActual,
        trade.Result || trade.result,
        trade.ResultR || trade.resultR,
        trade.ProfitLoss || trade.profitLoss,
        trade.Duration || trade.duration,
        trade.ScreenshotURL || trade.screenshotUrl,
        trade.BeforeScreenshotURL || trade.beforeScreenshotUrl,
        trade.AfterScreenshotURL || trade.afterScreenshotUrl,
        trade.EntryReason || trade.entryReason,
        trade.MarketContext || trade.marketContext,
        trade.Confirmation || trade.confirmation,
        trade.Mistake || trade.mistake,
        trade.Emotion || trade.emotion,
        trade.Lesson || trade.lesson,
        Array.isArray(trade.Tags || trade.tags) ? (trade.Tags || trade.tags).join(',') : (trade.Tags || trade.tags || ''),
        trade.ExecutedToPlan !== undefined ? trade.ExecutedToPlan : trade.executedToPlan,
        trade.PlanViolation !== undefined ? trade.PlanViolation : trade.planViolation,
        trade.PlanViolationReason || trade.planViolationReason,
        trade.BacktestSessionID || trade.backtestSessionId,
        trade.AccountID || trade.accountId,
        rows[i][36] || new Date().toISOString()
      ];
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
      return { id, updated: true };
    }
  }
  throw new Error('Trade ID not found: ' + id);
}

function deleteTrade(id) {
  const sheet = getOrCreateSheet(SHEET_TRADES, TRADE_HEADERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { id, deleted: true };
    }
  }
  throw new Error('Trade ID not found for deletion: ' + id);
}

function uploadScreenshot(base64Data, fileName, mimeType, tradeId) {
  let mainFolder = getOrCreateDriveFolder(FOLDER_NAME);
  let screenshotFolder = getOrCreateSubFolder(mainFolder, SCREENSHOT_SUBFOLDER);

  const cleanBase64 = base64Data.replace(/^data:image\\/[a-z]+;base64,/, '');
  const decoded = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(decoded, mimeType || 'image/png', fileName || (tradeId + '_screenshot.png'));

  const file = screenshotFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId: file.getId(),
    fileName: file.getName(),
    driveUrl: file.getUrl(),
    downloadUrl: 'https://drive.google.com/uc?export=view&id=' + file.getId()
  };
}

function getOrCreateDriveFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function getOrCreateSubFolder(parentFolder, subFolderName) {
  const subFolders = parentFolder.getFoldersByName(subFolderName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }
  return parentFolder.createFolder(subFolderName);
}

function getSettings() {
  const sheet = getOrCreateSheet(SHEET_SETTINGS, ['Key', 'Value']);
  const rows = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < rows.length; i++) {
    settings[rows[i][0]] = rows[i][1];
  }
  return settings;
}

function saveSettings(settings) {
  const sheet = getOrCreateSheet(SHEET_SETTINGS, ['Key', 'Value']);
  sheet.clear();
  sheet.appendRow(['Key', 'Value']);
  for (const key in settings) {
    sheet.appendRow([key, JSON.stringify(settings[key])]);
  }
  return { success: true };
}
`;

export const GAS_SCRIPT_TEMPLATE = GOOGLE_APPS_SCRIPT_CODE;
