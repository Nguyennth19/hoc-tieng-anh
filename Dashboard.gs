/** V3D overall dashboard / Home data. */
function getAppOverview() {
  ensureSchema_();
  var data = getBootstrapData();
  function summarize(items) {
    var out = { mastered:0,total:0,due:0,weak:0,reviews:0 };
    (items || []).forEach(function(item){
      var p = item.progress || {};
      out.total++;
      if (p.status === 'learned') out.mastered++;
      if (Number(p.rating || 0) > 0 && Number(p.rating || 0) <= 2) out.weak++;
      out.reviews += Number(p.reviewCount || 0);
      if (p.nextReview) { var d = new Date(p.nextReview); if (!isNaN(d.getTime()) && d.getTime() <= Date.now()) out.due++; }
    });
    out.pct = out.total ? Math.round(out.mastered / out.total * 100) : 0;
    return out;
  }
  var p1 = summarize(data.part1);
  var p2 = summarize(data.part2);
  var p3 = summarize(data.part3);
  var speaking = {
    mastered:p1.mastered+p2.mastered+p3.mastered,
    total:p1.total+p2.total+p3.total,
    due:p1.due+p2.due+p3.due,
    weak:p1.weak+p2.weak+p3.weak,
    reviews:p1.reviews+p2.reviews+p3.reviews
  };
  speaking.pct = speaking.total ? Math.round(speaking.mastered/speaking.total*100) : 0;
  speaking.recommendation = buildSkillRecommendation_(speaking, 'Speaking');

  var skills = {
    speaking:speaking,
    listening:getListeningBootstrap_().progress,
    reading:getReadingBootstrap_().progress,
    writing:getWritingBootstrap_().progress,
    grammar:getGrammarBootstrap_().progress
  };
  var mastered = 0, total = 0, due = 0, weak = 0, reviews = 0;
  Object.keys(skills).forEach(function(k){ var x=skills[k]||{}; mastered+=Number(x.mastered||0); total+=Number(x.total||0); due+=Number(x.due||0); weak+=Number(x.weak||0); reviews+=Number(x.reviews||0); });
  var overview = {
    appVersion: APP_CONFIG.VERSION,
    schemaVersion: APP_CONFIG.SCHEMA_VERSION,
    overall:{ mastered:mastered,total:total,due:due,weak:weak,reviews:reviews,pct:total?Math.round(mastered/total*100):0 },
    skills:skills
  };
  overview.recommendation = buildGlobalRecommendation_(overview);
  return overview;
}
