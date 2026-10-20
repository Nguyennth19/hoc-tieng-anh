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
    // If the original source lacks a question, do not invent it.
    if (!(q2 && q3 && m2 && m3)) return item;
    return Object.assign({}, item, {
      questions: [String(row[ix.question1] || 'Compare the two pictures.'), q2, q3],
      models: [String(row[ix.descriptionModel] || row[ix.model1] || ''), m2, m3],
      keywords: [String(row[ix.descriptionKeywords] || row[ix.keywords1] || ''),
                 String(row[ix.keywords2] || ''), String(row[ix.keywords3] || '')],
      structures: [String(row[ix.descriptionTemplate] || row[ix.structure1] || ''),
                   String(row[ix.structure2] || ''), String(row[ix.structure3] || '')],
      practiceMode: 'picture_comparison_plus_two_questions',
      answerOrigin: String(row[ix.sourceLabel] || '')
    });
  });
}
