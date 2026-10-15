function saveQuestionProgress(payload) {
  ensureSchema_();
  validateProgressPayload_(payload);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = requireSheet_(SHEET_NAMES.PROGRESS, HEADERS.PROGRESS);
    const values = sheet.getDataRange().getValues();
    const now = new Date();
    let rowIndex = findIdRow_(values, payload.questionId);
    const previous = rowIndex > 0 ? values[rowIndex - 1] : [];

    const status = payload.status || String(previous[1] || 'learning');
    const rating = Number(payload.rating || 0);
    const previousCount = Number(payload.reviewCount || previous[3] || 0);
    const favorite = payload.favorite === true || previous[7] === true || String(previous[7] || '').toLowerCase() === 'true';
    const nextReview = computeNextReview_(rating, previousCount, now);

    const row = [
      payload.questionId,
      status,
      rating,
      previousCount + 1,
      now,
      nextReview,
      sanitizeNote_(payload.note || ''),
      favorite
    ];

    if (rowIndex > 0) sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);

    clearSpeakingProgressCache_();
    return { ok: true, progress: rowToProgress_(row) };
  } finally {
    lock.releaseLock();
  }
}

function setQuestionFavorite(questionId, favorite) {
  ensureSchema_();
  if (!isValidQuestionId_(questionId, true)) throw new Error('Invalid question ID.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = requireSheet_(SHEET_NAMES.PROGRESS, HEADERS.PROGRESS);
    const values = sheet.getDataRange().getValues();
    const rowIndex = findIdRow_(values, questionId);

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 8).setValue(Boolean(favorite));
      values[rowIndex - 1][7] = Boolean(favorite);
      clearSpeakingProgressCache_();
      return { ok: true, progress: rowToProgress_(values[rowIndex - 1]) };
    }

    const row = [questionId, 'new', 0, 0, '', '', '', Boolean(favorite)];
    sheet.appendRow(row);
    clearSpeakingProgressCache_();
    return { ok: true, progress: rowToProgress_(row) };
  } finally {
    lock.releaseLock();
  }
}

function saveAttempt(payload) {
  ensureSchema_();
  validateAttemptPayload_(payload);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = requireSheet_(SHEET_NAMES.ATTEMPTS, HEADERS.ATTEMPTS);
    const now = new Date();
    sheet.appendRow([
      now,
      payload.questionId,
      Number(payload.elapsedSeconds || 0),
      Number(payload.selfRating || 0),
      Boolean(payload.completedFullTime),
      sanitizeNote_(payload.note || ''),
      Number(payload.part || inferPart_(payload.questionId)),
      Number(payload.promptIndex || 0)
    ]);
    return { ok: true, savedAt: now.toISOString() };
  } finally {
    lock.releaseLock();
  }
}


function getProgressMap_() {
  const sheet = requireSheet_(SHEET_NAMES.PROGRESS, HEADERS.PROGRESS);
  const values = sheet.getDataRange().getValues();
  const result = {};
  if (values.length < 2) return result;
  values.slice(1).forEach(function(row) {
    const id = String(row[0] || '');
    if (id) result[id] = rowToProgress_(row);
  });
  return result;
}

function aggregateMultiPromptProgress_(taskId, prompts, topicRow) {
  const learned = prompts.filter(function(p) { return p.status === 'learned'; }).length;
  const reviewed = prompts.reduce(function(sum, p) { return sum + Number(p.reviewCount || 0); }, 0);
  const ratings = prompts.filter(function(p) { return Number(p.rating || 0) > 0; }).map(function(p) { return Number(p.rating); });
  const minRating = ratings.length ? Math.min.apply(null, ratings) : 0;
  const dates = prompts.map(function(p) { return p.nextReview; }).filter(Boolean).sort();
  return {
    questionId: taskId,
    status: learned === 3 ? 'learned' : (reviewed > 0 ? 'learning' : 'new'),
    rating: minRating,
    reviewCount: reviewed,
    lastReviewed: '',
    nextReview: dates[0] || '',
    note: '',
    favorite: topicRow ? Boolean(topicRow.favorite) : false,
    masteredPrompts: learned,
    totalPrompts: 3
  };
}

function rowToProgress_(row) {
  return {
    questionId: String(row[0] || ''),
    status: String(row[1] || 'new'),
    rating: Number(row[2] || 0),
    reviewCount: Number(row[3] || 0),
    lastReviewed: toIsoString_(row[4]),
    nextReview: toIsoString_(row[5]),
    note: String(row[6] || ''),
    favorite: row[7] === true || String(row[7] || '').toLowerCase() === 'true'
  };
}

function defaultProgress_(questionId) {
  return { questionId: questionId, status: 'new', rating: 0, reviewCount: 0, lastReviewed: '', nextReview: '', note: '', favorite: false };
}

function findIdRow_(values, id) {
  for (let i = 1; i < values.length; i++) if (String(values[i][0] || '') === String(id)) return i + 1;
  return -1;
}

function computeNextReview_(rating, reviewCount, now) {
  let days = 0;
  if (rating <= 1) days = 0;
  else if (rating === 2) days = 1;
  else if (rating === 3) days = Math.min(3 + reviewCount, 7);
  else if (rating === 4) days = Math.min(7 + reviewCount * 2, 21);
  else days = Math.min(14 + reviewCount * 3, 45);

  const date = new Date(now);
  if (days === 0) date.setHours(date.getHours() + 6);
  else { date.setDate(date.getDate() + days); date.setHours(7, 0, 0, 0); }
  return date;
}

function validateProgressPayload_(payload) {
  if (!payload || !isValidQuestionId_(payload.questionId, false)) throw new Error('Invalid progress payload.');
  if (payload.status && ['new','learning','learned'].indexOf(String(payload.status)) < 0) throw new Error('Invalid status.');
  const rating = Number(payload.rating || 0);
  if (rating < 0 || rating > 5) throw new Error('Rating must be between 0 and 5.');
}

function validateAttemptPayload_(payload) {
  if (!payload || !isValidQuestionId_(payload.questionId, false)) throw new Error('Invalid attempt payload.');
  const elapsed = Number(payload.elapsedSeconds || 0);
  if (elapsed < 0 || elapsed > 300) throw new Error('Invalid elapsed time.');
  const rating = Number(payload.selfRating || 0);
  if (rating < 0 || rating > 5) throw new Error('Invalid rating.');
}

function isValidQuestionId_(id, allowTopicId) {
  const value = String(id || '');
  if (/^SP1-\d{3}$/.test(value)) return getSpeakingPart1_().some(function(q) { return q.id === value; });
  const m = value.match(/^(SP[23]-\d{3})-(\d)$/);
  if (m) {
    const part = m[1].indexOf('SP3-') === 0 ? 3 : 2;
    const list = part === 3 ? getSpeakingPart3_() : getSpeakingPart2_();
    return Number(m[2]) >= 1 && Number(m[2]) <= 3 && list.some(function(q) { return q.id === m[1]; });
  }
  if (allowTopicId && /^SP2-\d{3}$/.test(value)) return getSpeakingPart2_().some(function(q) { return q.id === value; });
  if (allowTopicId && /^SP3-\d{3}$/.test(value)) return getSpeakingPart3_().some(function(q) { return q.id === value; });
  return false;
}

function inferPart_(id) {
  const value = String(id || '');
  if (value.indexOf('SP3-') === 0) return 3;
  if (value.indexOf('SP2-') === 0) return 2;
  return 1;
}

function sanitizeNote_(value) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 500);
}

function toIsoString_(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return isNaN(date.getTime()) ? String(value) : date.toISOString();
}

