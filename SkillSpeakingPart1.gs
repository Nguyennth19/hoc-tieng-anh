/**
 * Speaking Part 1 content module.
 * Primary source: SPEAKING PART 1.docx
 * Supplementary source: Speaking Part 1 (Tham khảo).docx
 *
 * Strategy: Focus / Trọng tâm -> Expand / Mở rộng -> Reason or feeling.
 * Existing SPEAKING rows are upgraded in-place by ID.
 * PROGRESS and ATTEMPTS are never reset here.
 */
const PART1_CONTENT_VERSION = '2026.10.19.49';
const PART1_EXTRA_COLUMNS = ['answerType','focus','expand','reason','templateKey'];

function getPart1OptimizedContent_() {
  return [
    {id:'SP1-001', answerType:'Personal information', templateKey:'family', focus:'I have a small family.', expand:'There are four people in my family, and we usually have dinner together in the evening.', reason:'I enjoy spending time with them because we can talk, relax, and support each other.', core:'I have a small family.', model:'I have a small family. There are four people in my family, and we usually have dinner together in the evening. I enjoy spending time with them because we can talk, relax, and support each other.', keywords:'family • four people • dinner • evening • support'},
    {id:'SP1-002', answerType:'Personal information', templateKey:'self', focus:'I work in education.', expand:'I organize study programs and work with teachers and students every day.', reason:'I like my job because I can meet many people and keep learning new things.', core:'I work in education.', model:'I work in education. I organize study programs and work with teachers and students every day. I like my job because I can meet many people and keep learning new things.', keywords:'education • study programs • teachers • students • learn'},
    {id:'SP1-003', answerType:'Place description', templateKey:'hometown', focus:'I live in Ho Chi Minh City.', expand:'It is a busy city with many shops, restaurants, offices, and useful services.', reason:'I like living here because it is convenient and there are always many things to do.', core:'I live in Ho Chi Minh City.', model:'I live in Ho Chi Minh City. It is a busy city with many shops, restaurants, offices, and useful services. I like living here because it is convenient and there are always many things to do.', keywords:'Ho Chi Minh City • busy • restaurants • convenient • things to do'},
    {id:'SP1-004', answerType:'Preference / practical choice', templateKey:'travel', focus:'For long trips in Vietnam, I think traveling by plane is the best choice.', expand:'It is fast and convenient, especially when I travel between Ho Chi Minh City and Hanoi.', reason:'I prefer it because it saves time and makes long journeys much easier.', core:'For long trips in Vietnam, I think traveling by plane is the best choice.', model:'For long trips in Vietnam, I think traveling by plane is the best choice. It is fast and convenient, especially when I travel between Ho Chi Minh City and Hanoi. I prefer it because it saves time and makes long journeys much easier.', keywords:'plane • long trips • fast • convenient • save time'},
    {id:'SP1-005', answerType:'Person description', templateKey:'person', focus:'One of my close friends is very kind and easy to talk to.', expand:'We often meet after work and share stories about our jobs and families.', reason:'I value our friendship because she listens to me and always gives me support.', core:'One of my close friends is very kind and easy to talk to.', model:'One of my close friends is very kind and easy to talk to. We often meet after work and share stories about our jobs and families. I value our friendship because she listens to me and always gives me support.', keywords:'close friend • kind • after work • share stories • support'},
    {id:'SP1-006', answerType:'Description / preference', templateKey:'weather-season', focus:'Today is warm and sunny.', expand:'The sky is bright, and it is comfortable enough to go outside.', reason:'I like this kind of weather because it makes me feel active and positive.', core:'Today is warm and sunny.', model:'Today is warm and sunny. The sky is bright, and it is comfortable enough to go outside. I like this kind of weather because it makes me feel active and positive.', keywords:'warm • sunny • bright • outside • active'},
    {id:'SP1-007', answerType:'Past experience', templateKey:'memory', focus:'One of my good memories is a family trip to Da Lat.', expand:'We walked around the city, took photos, and enjoyed the cool weather together.', reason:'I remember it clearly because we had a relaxing and happy time.', core:'One of my good memories is a family trip to Da Lat.', model:'One of my good memories is a family trip to Da Lat. We walked around the city, took photos, and enjoyed the cool weather together. I remember it clearly because we had a relaxing and happy time.', keywords:'Da Lat • family trip • photos • cool weather • happy'},
    {id:'SP1-008', answerType:'Likes / interests', templateKey:'friends', focus:'I like having coffee with my friends.', expand:'We usually meet at a quiet cafe on weekends and talk about work and family.', reason:'I enjoy it because it helps me relax and stay close to them.', core:'I like having coffee with my friends.', model:'I like having coffee with my friends. We usually meet at a quiet cafe on weekends and talk about work and family. I enjoy it because it helps me relax and stay close to them.', keywords:'coffee • friends • weekends • talk • relax'},
    {id:'SP1-009', answerType:'Likes / interests', templateKey:'free-time', focus:'I like reading books in my free time.', expand:'I usually read at home for about twenty minutes in the evening.', reason:'I enjoy reading because it helps me relax and learn new things.', core:'I like reading books in my free time.', model:'I like reading books in my free time. I usually read at home for about twenty minutes in the evening. I enjoy reading because it helps me relax and learn new things.', keywords:'reading • home • evening • twenty minutes • learn'},
    {id:'SP1-010', answerType:'Past routine / experience', templateKey:'past-activity', focus:'Last night, I watched a movie at home.', expand:'I watched it with my family after dinner, and the film was light and funny.', reason:'I enjoyed the evening because it helped me relax after a busy day.', core:'Last night, I watched a movie at home.', model:'Last night, I watched a movie at home. I watched it with my family after dinner, and the film was light and funny. I enjoyed the evening because it helped me relax after a busy day.', keywords:'last night • movie • family • funny • relax'},
    {id:'SP1-011', answerType:'Past description', templateKey:'first-school', focus:'My first school was a small school near my home.', expand:'I went there every day with my friends, and I still remember several kind teachers.', reason:'I have good memories of that school because I felt safe and happy there.', core:'My first school was a small school near my home.', model:'My first school was a small school near my home. I went there every day with my friends, and I still remember several kind teachers. I have good memories of that school because I felt safe and happy there.', keywords:'small school • near home • friends • teachers • happy'},
    {id:'SP1-012', answerType:'Current description', templateKey:'room', focus:'I am sitting in a quiet room.', expand:'There is a desk in front of me, a chair beside it, and a window nearby.', reason:'I like this room because it is clean, bright, and comfortable for studying.', core:'I am sitting in a quiet room.', model:'I am sitting in a quiet room. There is a desk in front of me, a chair beside it, and a window nearby. I like this room because it is clean, bright, and comfortable for studying.', keywords:'quiet room • desk • chair • window • comfortable'},
    {id:'SP1-013', answerType:'Past journey', templateKey:'journey', focus:'I came here by taxi this morning.', expand:'I left home early, and the traffic was not too busy, so the journey was quite easy.', reason:'I felt relaxed because I arrived on time.', core:'I came here by taxi this morning.', model:'I came here by taxi this morning. I left home early, and the traffic was not too busy, so the journey was quite easy. I felt relaxed because I arrived on time.', keywords:'taxi • this morning • traffic • easy • on time'},
    {id:'SP1-014', answerType:'Current description', templateKey:'clothes', focus:'I am wearing a white shirt and black pants today.', expand:'I chose these clothes because they are simple and comfortable for work.', reason:'I like this style because it is easy to wear and looks neat.', core:'I am wearing a white shirt and black pants today.', model:'I am wearing a white shirt and black pants today. I chose these clothes because they are simple and comfortable for work. I like this style because it is easy to wear and looks neat.', keywords:'white shirt • black pants • simple • comfortable • neat'},
    {id:'SP1-015', answerType:'Routine / feeling', templateKey:'tired', focus:'I usually feel tired after a long day at work.', expand:'When I get home, I rest for a short time and have a quiet evening with my family.', reason:'This helps me recover and feel better the next day.', core:'I usually feel tired after a long day at work.', model:'I usually feel tired after a long day at work. When I get home, I rest for a short time and have a quiet evening with my family. This helps me recover and feel better the next day.', keywords:'tired • work • rest • quiet evening • recover'},
    {id:'SP1-016', answerType:'Description', templateKey:'meal', focus:'A typical Vietnamese meal usually includes rice, vegetables, and a main dish.', expand:'My family often eats fish or meat with soup, and we share the food at the table.', reason:'I like this kind of meal because it is simple, fresh, and balanced.', core:'A typical Vietnamese meal usually includes rice, vegetables, and a main dish.', model:'A typical Vietnamese meal usually includes rice, vegetables, and a main dish. My family often eats fish or meat with soup, and we share the food at the table. I like this kind of meal because it is simple, fresh, and balanced.', keywords:'rice • vegetables • fish or meat • soup • balanced'},
    {id:'SP1-017', answerType:'Daily routine', templateKey:'typical-day', focus:'I usually go to work in the morning.', expand:'During the day, I organize classes, answer messages, and work with teachers and students.', reason:'In the evening, I go home and relax with my family.', core:'I usually go to work in the morning.', model:'I usually go to work in the morning. During the day, I organize classes, answer messages, and work with teachers and students. In the evening, I go home and relax with my family.', keywords:'morning • work • classes • messages • family'},
    {id:'SP1-018', answerType:'Likes / interests', templateKey:'free-time', focus:'I like reading books in my free time.', expand:'I usually read at home for about twenty minutes in the evening.', reason:'I enjoy reading because it helps me relax and learn new things.', core:'I like reading books in my free time.', model:'I like reading books in my free time. I usually read at home for about twenty minutes in the evening. I enjoy reading because it helps me relax and learn new things.', keywords:'reading • home • evening • twenty minutes • learn'},
    {id:'SP1-019', answerType:'Place description', templateKey:'favorite-place', focus:'My favorite place is a park near my home.', expand:'I often walk there in the late afternoon because it has many trees and open space.', reason:'I like it because the park is quiet and helps me relax after work.', core:'My favorite place is a park near my home.', model:'My favorite place is a park near my home. I often walk there in the late afternoon because it has many trees and open space. I like it because the park is quiet and helps me relax after work.', keywords:'park • near home • afternoon • trees • relax'},
    {id:'SP1-020', answerType:'Past experience', templateKey:'last-conversation', focus:'The last time I talked with my mother was yesterday evening.', expand:'We spoke for about fifteen minutes about family, work, and daily life.', reason:'I felt happy after the call because it was good to hear her voice.', core:'The last time I talked with my mother was yesterday evening.', model:'The last time I talked with my mother was yesterday evening. We spoke for about fifteen minutes about family, work, and daily life. I felt happy after the call because it was good to hear her voice.', keywords:'yesterday evening • mother • fifteen minutes • family • happy'},
    {id:'SP1-021', answerType:'General opinion', templateKey:'sport', focus:'Yes, many people in Vietnam enjoy sports.', expand:'Football is especially popular, and people often watch big matches with friends or family.', reason:'I think sport is popular because it is exciting and also helps people stay active.', core:'Yes, many people in Vietnam enjoy sports.', model:'Yes, many people in Vietnam enjoy sports. Football is especially popular, and people often watch big matches with friends or family. I think sport is popular because it is exciting and also helps people stay active.', keywords:'Vietnam • sports • football • matches • active'},
    {id:'SP1-022', answerType:'Current description', templateKey:'room', focus:'I am sitting in a quiet room.', expand:'There is a desk in front of me, a chair beside it, and a window nearby.', reason:'I like this room because it is clean, bright, and comfortable for studying.', core:'I am sitting in a quiet room.', model:'I am sitting in a quiet room. There is a desk in front of me, a chair beside it, and a window nearby. I like this room because it is clean, bright, and comfortable for studying.', keywords:'quiet room • desk • chair • window • comfortable'},
    {id:'SP1-023', answerType:'Current need / preference', templateKey:'new-house', focus:'I am looking for a quiet house near my workplace.', expand:'I would like a bright bedroom, a simple kitchen, and enough space for my family.', reason:'I prefer a calm and convenient place because it makes daily life easier.', core:'I am looking for a quiet house near my workplace.', model:'I am looking for a quiet house near my workplace. I would like a bright bedroom, a simple kitchen, and enough space for my family. I prefer a calm and convenient place because it makes daily life easier.', keywords:'quiet house • near work • bright room • kitchen • convenient'},
    {id:'SP1-024', answerType:'Purpose', templateKey:'learning-english', focus:'I am learning English for my work.', expand:'I use English in emails, meetings, and conversations with people from other countries.', reason:'I want to improve because speaking English well helps me feel more confident at work.', core:'I am learning English for my work.', model:'I am learning English for my work. I use English in emails, meetings, and conversations with people from other countries. I want to improve because speaking English well helps me feel more confident at work.', keywords:'English • work • emails • meetings • confident'},
    {id:'SP1-025', answerType:'Job description', templateKey:'job', focus:'I organize study programs for students.', expand:'I plan classes, coordinate with teachers, and support students with program information.', reason:'I like my job because I can help people learn and solve practical problems.', core:'I organize study programs for students.', model:'I organize study programs for students. I plan classes, coordinate with teachers, and support students with program information. I like my job because I can help people learn and solve practical problems.', keywords:'study programs • classes • teachers • students • help'},
    {id:'SP1-026', answerType:'General description', templateKey:'food-country', focus:'Vietnamese food is fresh and varied.', expand:'People often eat rice or noodles with meat, fish, vegetables, and soup.', reason:'I like it because there are many choices and most meals are easy to enjoy.', core:'Vietnamese food is fresh and varied.', model:'Vietnamese food is fresh and varied. People often eat rice or noodles with meat, fish, vegetables, and soup. I like it because there are many choices and most meals are easy to enjoy.', keywords:'Vietnamese food • rice • noodles • vegetables • fresh'},
    {id:'SP1-027', answerType:'Routine / feeling', templateKey:'stressed', focus:'I feel stressed when I have too many tasks at the same time.', expand:'When that happens, I make a short list and finish one important task before moving to the next.', reason:'This helps me stay calm and manage my work better.', core:'I feel stressed when I have too many tasks at the same time.', model:'I feel stressed when I have too many tasks at the same time. When that happens, I make a short list and finish one important task before moving to the next. This helps me stay calm and manage my work better.', keywords:'stressed • many tasks • list • one at a time • calm'},
    {id:'SP1-028', answerType:'Likes / interests', templateKey:'travel', focus:'I am interested in traveling because I like seeing new places.', expand:'When I travel, I usually try local food, walk around the city, and take photos.', reason:'I enjoy it because traveling helps me relax and learn about different cultures.', core:'I am interested in traveling because I like seeing new places.', model:'I am interested in traveling because I like seeing new places. When I travel, I usually try local food, walk around the city, and take photos. I enjoy it because traveling helps me relax and learn about different cultures.', keywords:'travel • new places • local food • photos • cultures'},
    {id:'SP1-029', answerType:'Preference', templateKey:'book', focus:'My favorite Vietnamese book is Dế Mèn Phiêu Lưu Ký.', expand:'I first read it when I was young, and I still remember the main character and his adventures.', reason:'I like the book because the story is clear and it teaches useful lessons about growing up and learning from mistakes.', core:'My favorite Vietnamese book is Dế Mèn Phiêu Lưu Ký.', model:'My favorite Vietnamese book is Dế Mèn Phiêu Lưu Ký. I first read it when I was young, and I still remember the main character and his adventures. I like the book because the story is clear and it teaches useful lessons about growing up and learning from mistakes.', keywords:'Dế Mèn Phiêu Lưu Ký • young • adventures • lessons • mistakes'}
  ];
}

function upgradeSpeakingPart1Content_(sheet, settings, report) {
  const currentVersion = getSetting_(settings, 'p1_content_version');
  if (currentVersion === PART1_CONTENT_VERSION) return 0;

  PART1_EXTRA_COLUMNS.forEach(function(header) {
    ensureColumn_(sheet, header, [], report);
  });

  const idx = headerIndexMap_(sheet);
  const data = getPart1OptimizedContent_();
  const byId = {};
  data.forEach(function(item) { byId[item.id] = item; });

  const range = sheet.getDataRange();
  const values = range.getValues();
  let updated = 0;

  for (let r = 1; r < values.length; r++) {
    const id = String(values[r][idx.id] || '').trim();
    const item = byId[id];
    if (!item) continue;
    // Preserve user-approved 49-question V2 bank. Legacy migrations must not overwrite it.
    if (idx.sourceLabel !== undefined && String(values[r][idx.sourceLabel] || '').indexOf('P1_V2_49_RELEASE_') === 0) continue;

    values[r][idx.core] = item.core;
    values[r][idx.model] = item.model;
    values[r][idx.keywords] = item.keywords;
    if (idx.sourceLabel !== undefined) {
      values[r][idx.sourceLabel] = 'SPEAKING PART 1.docx (primary) + Speaking Part 1 (Tham khảo).docx (supplementary)';
    }
    values[r][idx.answerType] = item.answerType;
    values[r][idx.focus] = item.focus;
    values[r][idx.expand] = item.expand;
    values[r][idx.reason] = item.reason;
    values[r][idx.templateKey] = item.templateKey;
    updated++;
  }

  if (updated && values.length > 1) {
    // One batch write keeps migration fast and avoids hundreds of Spreadsheet service calls.
    sheet.getRange(2, 1, values.length - 1, values[0].length).setValues(values.slice(1));
  }

  setSetting_(settings, 'p1_content_version', PART1_CONTENT_VERSION);
  setSetting_(settings, 'p1_content_updated_at', new Date().toISOString());
  if (updated) report.push('Updated ' + updated + ' Speaking Part 1 items to Focus -> Expand -> Reason framework.');
  return updated;
}

/**
 * Runtime loader for Speaking Part 1.
 * Kept in the Part 1 module so SkillSpeaking.gs can be replaced safely
 * by later Part 2/3 updates without losing this function.
 */
function getSpeakingPart1_() {
  const sheet = requireSheet_(SHEET_NAMES.SPEAKING_P1, HEADERS.SPEAKING_P1);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const idx = headerIndexMap_(sheet);

  return values.slice(1).filter(function(row) {
    return row[idx.id] && row[idx.active] !== false && String(row[idx.active]).toLowerCase() !== 'false';
  }).map(function(row) {
    return {
      id: String(row[idx.id] || ''),
      part: 1,
      question: String(row[idx.question] || ''),
      tenseSignal: String(row[idx.tenseSignal] || ''),
      tense: String(row[idx.tense] || ''),
      core: String(row[idx.core] || ''),
      model: String(row[idx.model] || ''),
      keywords: String(row[idx.keywords] || ''),
      answerType: idx.answerType !== undefined ? String(row[idx.answerType] || '') : '',
      focus: idx.focus !== undefined ? String(row[idx.focus] || '') : String(row[idx.core] || ''),
      expand: idx.expand !== undefined ? String(row[idx.expand] || '') : '',
      reason: idx.reason !== undefined ? String(row[idx.reason] || '') : '',
      templateKey: idx.templateKey !== undefined ? String(row[idx.templateKey] || '') : '',
      duplicateOf: idx.duplicateOf !== undefined ? String(row[idx.duplicateOf] || '') : '',
      sourceLabel: idx.sourceLabel !== undefined ? String(row[idx.sourceLabel] || '') : ''
    };
  });
}
