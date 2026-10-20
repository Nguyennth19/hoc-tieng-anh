/**
 * Part 03 expansion: preserve existing media and IDs from getSpeakingPart3_(),
 * then append source Q2/Q3 without altering stored learner progress.
 * User-approved practice release 2026-10-20.
 */
function getSpeakingPart3Full_() {
  const items = getSpeakingPart3_();
  const sh = requireSheet_(SHEET_NAMES.SPEAKING_P3, HEADERS.SPEAKING_P3);
  const rows = sh.getDataRange().getValues();
  const ix = headerIndexMap_(sh);
  const byId = {};
  rows.slice(1).forEach(function(r){if(r[ix.id])byId[String(r[ix.id])] = r;});
  return items.map(function(item){
    const row = byId[item.id];
    if (!row) return item;
    const q2 = String(row[ix.question2] || '').trim();
    const q3 = String(row[ix.question3] || '').trim();
    const m2 = String(row[ix.model2] || '').trim();
    const m3 = String(row[ix.model3] || '').trim();
    // Source questions can have 1, 2, or 3 real positions.
    const questions = [String(row[ix.question1] || 'Compare the two pictures.')];
    const models = [String(row[ix.descriptionModel] || row[ix.model1] || '')];
    const keywords = [String(row[ix.descriptionKeywords] || row[ix.keywords1] || '')];
    const structures = [String(row[ix.descriptionTemplate] || row[ix.structure1] || '')];
    if (q2 && m2) {
      questions.push(q2); models.push(m2);
      keywords.push(String(row[ix.keywords2] || ''));
      structures.push(String(row[ix.structure2] || ''));
    }
    if (q3 && m3 && questions.length === 2) {
      questions.push(q3); models.push(m3);
      keywords.push(String(row[ix.keywords3] || ''));
      structures.push(String(row[ix.structure3] || ''));
    }
    return Object.assign({}, item, {
      questions:questions, models:models, keywords:keywords, structures:structures,
      practiceMode: questions.length === 3 ? 'picture_comparison_plus_two_questions' : 'source_partial_questions',
      answerOrigin: String(row[ix.sourceLabel] || '')
    });
  });
}
