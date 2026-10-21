/**
 * Speaking Part 03 production loader — one Sheet read for all three questions.
 * Preserves the previous getSpeakingPart3Full_ payload, IDs, image mapping,
 * Q1 description fallback, source provenance, and prompt ordering.
 * Does not seed, mutate or repair production data.
 */
function getSpeakingPart3Full_() {
  const sh = requireSheet_(SHEET_NAMES.SPEAKING_P3, HEADERS.SPEAKING_P3);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  const ix = headerIndexMap_(sh);
  const cell = function(row, name, fallback) {
    return ix[name] === undefined ? String(fallback || '') : String(row[ix[name]] || fallback || '');
  };
  return rows.slice(1).filter(function(row) {
    return row[ix.id] && row[ix.active] !== false && String(row[ix.active]).toLowerCase() !== 'false';
  }).map(function(row) {
    const model = cell(row, 'descriptionModel') || cell(row, 'model1');
    const keywords = cell(row, 'descriptionKeywords') || cell(row, 'keywords1');
    const structure = cell(row, 'descriptionTemplate') || cell(row, 'structure1');
    const q2 = cell(row, 'question2').trim();
    const q3 = cell(row, 'question3').trim();
    const m2 = cell(row, 'model2').trim();
    const m3 = cell(row, 'model3').trim();
    const questions = [cell(row, 'question1', 'Compare the two pictures.')];
    const models = [model], cues = [keywords], structures = [structure];
    if (q2 && m2) {
      questions.push(q2); models.push(m2);
      cues.push(cell(row, 'keywords2')); structures.push(cell(row, 'structure2'));
    }
    if (q3 && m3 && questions.length === 2) {
      questions.push(q3); models.push(m3);
      cues.push(cell(row, 'keywords3')); structures.push(cell(row, 'structure3'));
    }
    return {
      id: cell(row, 'id'), part: 3,
      examNo: ix.examNo !== undefined ? Number(row[ix.examNo] || 0) : 0,
      topic: cell(row, 'topic'),
      imageA: {
        imageUrl: cell(row, 'imageAUrl'), imageDriveId: cell(row, 'imageADriveId'),
        imageAlt: cell(row, 'imageAAlt', 'First comparison picture'), sceneIcon: '🖼️'
      },
      imageB: {
        imageUrl: cell(row, 'imageBUrl'), imageDriveId: cell(row, 'imageBDriveId'),
        imageAlt: cell(row, 'imageBAlt', 'Second comparison picture'), sceneIcon: '🖼️'
      },
      questions: questions, models: models, keywords: cues, structures: structures,
      commonPoint: cell(row, 'commonPoint'), comparisonAxis: cell(row, 'comparisonAxis'),
      mustCommon: cell(row, 'mustCommon'), mustPictureA: cell(row, 'mustPictureA'),
      mustPictureB: cell(row, 'mustPictureB'), mustDifference: cell(row, 'mustDifference'),
      sayMore: cell(row, 'sayMore'),
      practiceMode: questions.length === 3 ? 'picture_comparison_plus_two_questions' : 'source_partial_questions',
      sourceLabel: cell(row, 'sourceLabel'),
      answerOrigin: cell(row, 'sourceLabel')
    };
  });
}
