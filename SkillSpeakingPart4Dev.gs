/** APTIS B2 Coach — Part 4 DEV-only adapter.
 * Isolated: reads A4_P4_*_DEV sheets; does not migrate/overwrite PROD or change bootstrap.
 * Requires Script Property APTIS_DEV_DATABASE_ID in an isolated DEV deployment.
 * Never hardcode a PROD or DEV spreadsheet ID in this public repository.
 */
function getPart4DevDatabase_() {
  const id = String(PropertiesService.getScriptProperties().getProperty('APTIS_DEV_DATABASE_ID') || '').trim();
  if (!id) throw new Error('DEV setup missing: APTIS_DEV_DATABASE_ID.');
  const live = String(PropertiesService.getScriptProperties().getProperty('APTIS_DATABASE_ID') || '').trim();
  if (id === live) throw new Error('Safety stop: DEV spreadsheet matches configured PROD.');
  return SpreadsheetApp.openById(id);
}
function readPart4DevTable_(name) {
  const sh = getPart4DevDatabase_().getSheetByName(name);
  if (!sh) throw new Error('DEV table missing: ' + name);
  const values = sh.getDataRange().getDisplayValues();
  if (!values.length) return [];
  const keys = values.shift().map(v => String(v || '').trim());
  return values.filter(row => row[0]).map(row => {
    const out = {};
    keys.forEach((key, i) => { if (key) out[key] = row[i] || ''; });
    return out;
  });
}
/** Read-only DEV payload. QA_HOLD records are visible in learning mode only. */
function getSpeakingPart4Dev(mode) {
  const choice = mode === 'exam' ? 'exam' : 'learn';
  const all = readPart4DevTable_('A4_P4_EXAM_DEV');
  const eligible = choice === 'exam'
    ? all.filter(x => x.release_approved === 'YES' && x.qa_status === 'APPROVED')
    : all;
  return {
    mode: choice,
    preparationSeconds: 60,
    speakingSeconds: 120,
    sets: eligible.map(x => ({
      id: x.exam_set_id, storyId: x.story_id,
      questions: [x.q1_original, x.q2_original, x.q3_original],
      models: choice === 'learn' ? [x.model_q1, x.model_q2, x.model_q3] : null,
      qaStatus: x.qa_status, releaseApproved: x.release_approved === 'YES'
    })),
    isDev: true,
    unapprovedCount: all.filter(x => x.release_approved !== 'YES').length
  };
}
/** DEV-only integrity check; writes nothing. */
function inspectSpeakingPart4Dev() {
  const sets = readPart4DevTable_('A4_P4_EXAM_DEV');
  const templates = readPart4DevTable_('A4_P4_TEMPLATES_DEV');
  const stories = readPart4DevTable_('A4_P4_STORIES_DEV');
  const ids = sets.map(x => x.exam_set_id);
  return {
    ok: sets.length === 51 && new Set(ids).size === sets.length,
    sets: sets.length, uniqueIds: new Set(ids).size,
    templates: templates.length, stories: stories.length,
    missingQuestions: sets.filter(x => !x.q1_original || !x.q2_original || !x.q3_original).length,
    missingModels: sets.filter(x => !x.model_q1 || !x.model_q2 || !x.model_q3).length,
    approvedSets: sets.filter(x => x.release_approved === 'YES').length
  };
}
