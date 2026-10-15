/** V3D shared recommendation engine. */
function buildSkillRecommendation_(summary, skillName) {
  summary = summary || { mastered:0,total:0,due:0,weak:0,reviews:0 };
  if (summary.due > 0) return 'Review ' + summary.due + ' due item' + (summary.due > 1 ? 's' : '') + ' first.';
  if (summary.weak > 0) return 'Strengthen ' + summary.weak + ' item' + (summary.weak > 1 ? 's' : '') + ' that need more work.';
  if (summary.total && summary.mastered < summary.total) return 'Your review queue is clear. Practise one new ' + skillName + ' item.';
  if (summary.total) return 'Great work. Keep this skill fresh with a short review.';
  return 'This skill is ready for content when you add it.';
}

function buildGlobalRecommendation_(overview) {
  var s = overview && overview.skills ? overview.skills : {};
  var speaking = s.speaking || {};
  if (speaking.due > 0) return { skill:'speaking', title:'Review Speaking first', text:'You have ' + speaking.due + ' Speaking item(s) due now.' };
  if (speaking.weak > 0) return { skill:'speaking', title:'Strengthen Speaking', text:'Focus on ' + speaking.weak + ' item(s) that need more work.' };
  return { skill:'speaking', title:'Continue Speaking', text:'Your review queue is clear. Practise one new Speaking topic.' };
}
