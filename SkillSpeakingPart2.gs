/**
 * Speaking Part 2 - picture description authority.
 * Scope in this version: Question 1 (Describe the picture) ONLY.
 * Q2/Q3 are intentionally reserved for a later update.
 */
const PART2_DESCRIPTION_VERSION = '2.1.0';
const PART2_DESCRIPTION_COLUMNS = ['mustSay','sayMore','descriptionModel','descriptionKeywords','descriptionTemplate','practiceMode','contentVersion'];

function getPart2DescriptionSeedData_() {
  return [
  {
    "id": "SP2-EX-001",
    "topic": "Person relaxing on a boat",
    "imageAlt": "A person sitting on the deck of a boat near the sea.",
    "sceneIcon": "⛵",
    "mustSay": "In the picture, I can see a person sitting on the deck of a boat. The boat is on calm water, and the sea is visible in the background. The person appears to be looking out towards the water. The overall setting looks peaceful and open.",
    "sayMore": "The weather seems pleasant, and the person may be enjoying some quiet time. The scene gives the impression of a relaxing outdoor activity near the coast.",
    "keywords1": "boat | deck | sea | calm water | outdoor setting | peaceful",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see a person sitting on the deck of a boat. The boat is on calm water, and the sea is visible in the background. The person appears to be looking out towards the water. The overall setting looks peaceful and open. The weather seems pleasant, and the person may be enjoying some quiet time. The scene gives the impression of a relaxing outdoor activity near the coast.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-002",
    "topic": "Adult helping a child with horse riding",
    "imageAlt": "An adult helping a child who is sitting on a horse outdoors.",
    "sceneIcon": "🐎",
    "mustSay": "In the picture, I can see an adult standing beside a child who is sitting on a horse. They are in an outdoor area, possibly at a riding centre. The adult is supporting the child while the horse remains still. The child is also wearing safety equipment.",
    "sayMore": "They may be practising horse riding for the first time. The activity appears enjoyable but requires attention and careful guidance.",
    "keywords1": "adult | child | horse | riding | safety equipment | guidance",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see an adult standing beside a child who is sitting on a horse. They are in an outdoor area, possibly at a riding centre. The adult is supporting the child while the horse remains still. The child is also wearing safety equipment. They may be practising horse riding for the first time. The activity appears enjoyable but requires attention and careful guidance.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-003",
    "topic": "Visitors at an art exhibition",
    "imageAlt": "Several people looking at paintings in an art gallery or exhibition.",
    "sceneIcon": "🖼️",
    "mustSay": "In the picture, I can see several people looking at artwork displayed on the walls. They are standing in a bright indoor space that looks like an art gallery or exhibition. Some people are observing the pictures closely, while others appear to be talking. The environment looks calm and organised.",
    "sayMore": "The visitors may be discussing the artwork or sharing their opinions. This kind of place can offer a cultural and educational experience.",
    "keywords1": "visitors | artwork | gallery | exhibition | observing | cultural setting",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people looking at artwork displayed on the walls. They are standing in a bright indoor space that looks like an art gallery or exhibition. Some people are observing the pictures closely, while others appear to be talking. The environment looks calm and organised. The visitors may be discussing the artwork or sharing their opinions. This kind of place can offer a cultural and educational experience.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-004",
    "topic": "People waiting beside a train",
    "imageAlt": "Several people waiting beside a train at a railway station.",
    "sceneIcon": "🚆",
    "mustSay": "In the picture, I can see several people standing beside a train at a railway station. Some of them are carrying bags or luggage. They appear to be waiting near the platform before travelling. The train is large and clearly visible behind them.",
    "sayMore": "They may be preparing for a journey to another place. The station seems fairly organised, and the passengers look ready to leave.",
    "keywords1": "train | railway station | platform | passengers | luggage | journey",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people standing beside a train at a railway station. Some of them are carrying bags or luggage. They appear to be waiting near the platform before travelling. The train is large and clearly visible behind them. They may be preparing for a journey to another place. The station seems fairly organised, and the passengers look ready to leave.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-005",
    "topic": "Person reading indoors",
    "imageAlt": "A person sitting on a sofa and reading a book indoors.",
    "sceneIcon": "📖",
    "mustSay": "In the picture, I can see a person sitting comfortably on a sofa and reading a book. The scene is indoors, probably in a living room or a quiet study area. There is a cup nearby, and the person appears focused on the book. The atmosphere looks calm and comfortable.",
    "sayMore": "The person may be using the time to relax or learn something new. Reading in a quiet environment can be a pleasant way to spend free time.",
    "keywords1": "reading | sofa | book | indoors | focused | quiet atmosphere",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see a person sitting comfortably on a sofa and reading a book. The scene is indoors, probably in a living room or a quiet study area. There is a cup nearby, and the person appears focused on the book. The atmosphere looks calm and comfortable. The person may be using the time to relax or learn something new. Reading in a quiet environment can be a pleasant way to spend free time.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-006",
    "topic": "People working in an office",
    "imageAlt": "Several people working with computers in a modern office.",
    "sceneIcon": "💻",
    "mustSay": "In the picture, I can see several people working at desks in an office. Most of them are using computers, and some appear to be communicating with people nearby. The workspace looks modern, bright and well organised. Everyone seems focused on their tasks.",
    "sayMore": "They may be working on different projects or sharing information with colleagues. The environment looks professional but also quite active.",
    "keywords1": "office | desks | computers | workplace | focused | professional",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people working at desks in an office. Most of them are using computers, and some appear to be communicating with people nearby. The workspace looks modern, bright and well organised. Everyone seems focused on their tasks. They may be working on different projects or sharing information with colleagues. The environment looks professional but also quite active.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-007",
    "topic": "Passengers travelling by bus",
    "imageAlt": "Several passengers travelling on a public bus.",
    "sceneIcon": "🚌",
    "mustSay": "In the picture, I can see several passengers inside a public bus. Some people are sitting, while one person is standing near the seats. The bus appears to be travelling through an urban area. The passengers seem calm and occupied with their own activities.",
    "sayMore": "They may be travelling to work, school or another part of the city. Public transport can be a convenient option in busy areas.",
    "keywords1": "passengers | bus | public transport | seats | urban area | travelling",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several passengers inside a public bus. Some people are sitting, while one person is standing near the seats. The bus appears to be travelling through an urban area. The passengers seem calm and occupied with their own activities. They may be travelling to work, school or another part of the city. Public transport can be a convenient option in busy areas.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-008",
    "topic": "People eating in a restaurant",
    "imageAlt": "Several people sitting at a table and eating in a restaurant.",
    "sceneIcon": "🍽️",
    "mustSay": "In the picture, I can see several people sitting around a table in a restaurant. There is food and drink in front of them, and they appear to be having a meal together. The indoor setting looks comfortable and well arranged. The people seem relaxed and engaged in conversation.",
    "sayMore": "They may be celebrating something or simply enjoying a meal together. The atmosphere appears social and pleasant.",
    "keywords1": "restaurant | table | meal | food | conversation | social atmosphere",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people sitting around a table in a restaurant. There is food and drink in front of them, and they appear to be having a meal together. The indoor setting looks comfortable and well arranged. The people seem relaxed and engaged in conversation. They may be celebrating something or simply enjoying a meal together. The atmosphere appears social and pleasant.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-009",
    "topic": "People checking the news",
    "imageAlt": "People reading or checking news on printed and digital media.",
    "sceneIcon": "📰",
    "mustSay": "In the picture, I can see people checking information through different forms of media. One person appears to be reading printed material, while another is using a digital device. They are concentrating on the information in front of them. The scene shows a common way of following current events.",
    "sayMore": "They may be reading the news or looking for useful information. Digital media offers speed, while printed material can be easier to read without distractions.",
    "keywords1": "news | information | printed media | digital device | reading | current events",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see people checking information through different forms of media. One person appears to be reading printed material, while another is using a digital device. They are concentrating on the information in front of them. The scene shows a common way of following current events. They may be reading the news or looking for useful information. Digital media offers speed, while printed material can be easier to read without distractions.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-010",
    "topic": "Group hiking in the mountains",
    "imageAlt": "A group of people hiking along a mountain trail.",
    "sceneIcon": "🥾",
    "mustSay": "In the picture, I can see a group of people walking along a mountain trail. They are carrying backpacks and wearing outdoor clothing. The area is surrounded by natural scenery, with hills or mountains in the background. The group appears to be moving together along the path.",
    "sayMore": "They may be hiking for exercise or enjoying the landscape. The activity looks physically demanding but also rewarding.",
    "keywords1": "group | hiking | mountain trail | backpacks | natural scenery | outdoor activity",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see a group of people walking along a mountain trail. They are carrying backpacks and wearing outdoor clothing. The area is surrounded by natural scenery, with hills or mountains in the background. The group appears to be moving together along the path. They may be hiking for exercise or enjoying the landscape. The activity looks physically demanding but also rewarding.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-011",
    "topic": "Two people shopping",
    "imageAlt": "Two people looking at items while shopping in a store.",
    "sceneIcon": "🛍️",
    "mustSay": "In the picture, I can see two people looking at products in a shop. They are standing close to displays and appear to be comparing different items. The store looks bright and organised, with many products around them. Both people seem focused on choosing what to buy.",
    "sayMore": "They may be discussing prices, quality or personal preferences. Shopping together can make it easier to compare options and make decisions.",
    "keywords1": "shopping | store | products | displays | comparing | choosing",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see two people looking at products in a shop. They are standing close to displays and appear to be comparing different items. The store looks bright and organised, with many products around them. Both people seem focused on choosing what to buy. They may be discussing prices, quality or personal preferences. Shopping together can make it easier to compare options and make decisions.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-012",
    "topic": "Group exercising outdoors",
    "imageAlt": "A group of people doing physical exercise together outdoors.",
    "sceneIcon": "🏃",
    "mustSay": "In the picture, I can see a group of people exercising together in an outdoor area. They are moving actively and appear to be following the same activity. Most of them are wearing sports clothes. The setting looks open, with greenery around them.",
    "sayMore": "They may be taking part in a group fitness session. The activity seems energetic and could help people stay motivated.",
    "keywords1": "group exercise | outdoors | sports clothes | active | fitness | greenery",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see a group of people exercising together in an outdoor area. They are moving actively and appear to be following the same activity. Most of them are wearing sports clothes. The setting looks open, with greenery around them. They may be taking part in a group fitness session. The activity seems energetic and could help people stay motivated.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-013",
    "topic": "Adult reading with a child",
    "imageAlt": "An adult sitting with a young child and reading a book together.",
    "sceneIcon": "📚",
    "mustSay": "In the picture, I can see an adult sitting beside a young child and looking at a book together. They are indoors and appear to be sitting comfortably on a sofa. Both of them are focused on the pages. The scene looks quiet and supportive.",
    "sayMore": "The adult may be helping the child read or understand the story. This type of activity can support learning and communication.",
    "keywords1": "adult | child | book | reading together | sofa | learning",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see an adult sitting beside a young child and looking at a book together. They are indoors and appear to be sitting comfortably on a sofa. Both of them are focused on the pages. The scene looks quiet and supportive. The adult may be helping the child read or understand the story. This type of activity can support learning and communication.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-014",
    "topic": "Adult and child playing football",
    "imageAlt": "An adult and a young child playing football outdoors.",
    "sceneIcon": "⚽",
    "mustSay": "In the picture, I can see an adult and a young child playing football on the grass. They are running towards the ball in an outdoor area. Both are wearing casual clothes suitable for physical activity. The scene looks active and cheerful.",
    "sayMore": "They may be spending free time together or practising basic football skills. The activity seems enjoyable and energetic.",
    "keywords1": "adult | child | football | grass | running | physical activity",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see an adult and a young child playing football on the grass. They are running towards the ball in an outdoor area. Both are wearing casual clothes suitable for physical activity. The scene looks active and cheerful. They may be spending free time together or practising basic football skills. The activity seems enjoyable and energetic.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-015",
    "topic": "Young children doing a classroom activity",
    "imageAlt": "Several young children doing a learning activity with an adult in a classroom.",
    "sceneIcon": "🧸",
    "mustSay": "In the picture, I can see several young children taking part in a classroom activity with an adult. They are sitting around a table with colourful learning materials. The adult appears to be guiding the activity while the children are paying attention. The room looks bright and child-friendly.",
    "sayMore": "The children may be learning through play or practising a simple skill. The activity seems interactive and suitable for young learners.",
    "keywords1": "children | classroom | adult | learning materials | activity | interactive",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several young children taking part in a classroom activity with an adult. They are sitting around a table with colourful learning materials. The adult appears to be guiding the activity while the children are paying attention. The room looks bright and child-friendly. The children may be learning through play or practising a simple skill. The activity seems interactive and suitable for young learners.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-016",
    "topic": "Group playing football outdoors",
    "imageAlt": "Several people playing football together in a garden or park.",
    "sceneIcon": "⚽",
    "mustSay": "In the picture, I can see several people playing football together outdoors. They are running across a grassy area and following the ball. The setting looks like a garden or park. Everyone appears active and involved in the game.",
    "sayMore": "They may be spending their free time together or simply exercising. The scene seems energetic and enjoyable.",
    "keywords1": "group | football | outdoors | grass | running | energetic",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people playing football together outdoors. They are running across a grassy area and following the ball. The setting looks like a garden or park. Everyone appears active and involved in the game. They may be spending their free time together or simply exercising. The scene seems energetic and enjoyable.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-017",
    "topic": "People using a laptop on a sofa",
    "imageAlt": "Several people sitting together on a sofa and looking at a laptop.",
    "sceneIcon": "💻",
    "mustSay": "In the picture, I can see several people sitting together on a sofa and looking at a laptop. They are indoors, probably in a living room or another comfortable space. Everyone is focused on the screen. Their body language suggests that they are interested in what they are watching.",
    "sayMore": "They may be watching a video, sharing photos or using the laptop for entertainment. The atmosphere seems relaxed and informal.",
    "keywords1": "people | sofa | laptop | screen | indoors | relaxed",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people sitting together on a sofa and looking at a laptop. They are indoors, probably in a living room or another comfortable space. Everyone is focused on the screen. Their body language suggests that they are interested in what they are watching. They may be watching a video, sharing photos or using the laptop for entertainment. The atmosphere seems relaxed and informal.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-018",
    "topic": "Young people playing football",
    "imageAlt": "Several young people playing football on a sports field.",
    "sceneIcon": "⚽",
    "mustSay": "In the picture, I can see several young people playing football on a sports field. They are wearing sports clothes and moving around the ball. One player appears to be controlling or kicking it while the others are nearby. The group looks focused on the game.",
    "sayMore": "They may be taking part in a match or a training session. The activity looks competitive and physically demanding.",
    "keywords1": "young people | football | sports field | players | ball | competitive",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several young people playing football on a sports field. They are wearing sports clothes and moving around the ball. One player appears to be controlling or kicking it while the others are nearby. The group looks focused on the game. They may be taking part in a match or a training session. The activity looks competitive and physically demanding.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-019",
    "topic": "Musician performing outdoors",
    "imageAlt": "A musician performing with an instrument in a public outdoor area.",
    "sceneIcon": "🎸",
    "mustSay": "In the picture, I can see a musician performing in a public outdoor area. The person is holding an instrument and appears to be playing music for people nearby. The setting looks like a street or open public space. The performer seems concentrated on the music.",
    "sayMore": "The musician may be entertaining passers-by or performing for donations. The scene creates a lively and informal atmosphere.",
    "keywords1": "musician | instrument | public space | performing | street | lively",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see a musician performing in a public outdoor area. The person is holding an instrument and appears to be playing music for people nearby. The setting looks like a street or open public space. The performer seems concentrated on the music. The musician may be entertaining passers-by or performing for donations. The scene creates a lively and informal atmosphere.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-020",
    "topic": "People having breakfast together",
    "imageAlt": "Several people sitting at a table and having breakfast together.",
    "sceneIcon": "🥐",
    "mustSay": "In the picture, I can see several people sitting around a table and having breakfast. There are plates, drinks and different kinds of food in front of them. They are indoors and appear to be eating and talking at the same time. The setting looks comfortable and relaxed.",
    "sayMore": "They may be starting the day together before work or other activities. The atmosphere seems friendly and unhurried.",
    "keywords1": "breakfast | table | food | drinks | conversation | relaxed",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people sitting around a table and having breakfast. There are plates, drinks and different kinds of food in front of them. They are indoors and appear to be eating and talking at the same time. The setting looks comfortable and relaxed. They may be starting the day together before work or other activities. The atmosphere seems friendly and unhurried.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-021",
    "topic": "Adult and child having breakfast",
    "imageAlt": "An adult and a young child sitting at a table and having breakfast.",
    "sceneIcon": "🥣",
    "mustSay": "In the picture, I can see an adult and a young child sitting at a table with breakfast food. They are indoors and appear to be eating together. The adult is close to the child, and both are focused on the meal. The setting looks simple and comfortable.",
    "sayMore": "They may be having breakfast before beginning their daily activities. The scene appears calm and routine.",
    "keywords1": "adult | child | breakfast | table | meal | daily routine",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see an adult and a young child sitting at a table with breakfast food. They are indoors and appear to be eating together. The adult is close to the child, and both are focused on the meal. The setting looks simple and comfortable. They may be having breakfast before beginning their daily activities. The scene appears calm and routine.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-022",
    "topic": "People shopping together",
    "imageAlt": "Several people looking at clothes or products while shopping together.",
    "sceneIcon": "🛍️",
    "mustSay": "In the picture, I can see several people looking at products in a shopping area. They appear to be comparing clothes or other items displayed in the store. The place looks busy but well organised. The people seem interested in making a choice.",
    "sayMore": "They may be discussing style, price or quality before buying anything. Shopping with other people can make the decision easier.",
    "keywords1": "shopping | products | clothes | store | comparing | decision",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people looking at products in a shopping area. They appear to be comparing clothes or other items displayed in the store. The place looks busy but well organised. The people seem interested in making a choice. They may be discussing style, price or quality before buying anything. Shopping with other people can make the decision easier.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-023",
    "topic": "Classroom lesson",
    "imageAlt": "An adult speaking to a group of learners in a classroom.",
    "sceneIcon": "🏫",
    "mustSay": "In the picture, I can see an adult standing in front of a group of people in a classroom. The person at the front appears to be explaining something, while the others are sitting and paying attention. There is a board or teaching area behind the speaker. The room looks organised for learning.",
    "sayMore": "The person may be a teacher or trainer, and the others may be learners. The atmosphere seems focused and academic.",
    "keywords1": "classroom | speaker | learners | board | explaining | academic",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see an adult standing in front of a group of people in a classroom. The person at the front appears to be explaining something, while the others are sitting and paying attention. There is a board or teaching area behind the speaker. The room looks organised for learning. The person may be a teacher or trainer, and the others may be learners. The atmosphere seems focused and academic.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-024",
    "topic": "People watching a film together",
    "imageAlt": "Several people sitting together and watching a film or television.",
    "sceneIcon": "🎬",
    "mustSay": "In the picture, I can see several people sitting together and watching a screen. They are indoors, probably in a living room or entertainment area. Everyone is facing the same direction and appears interested in what they are watching. The scene looks informal and comfortable.",
    "sayMore": "They may be watching a film or television programme. The atmosphere seems relaxed and social.",
    "keywords1": "people | screen | watching | indoors | entertainment | relaxed",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people sitting together and watching a screen. They are indoors, probably in a living room or entertainment area. Everyone is facing the same direction and appears interested in what they are watching. The scene looks informal and comfortable. They may be watching a film or television programme. The atmosphere seems relaxed and social.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-025",
    "topic": "Person shopping in a supermarket",
    "imageAlt": "A person choosing products while shopping in a supermarket.",
    "sceneIcon": "🛒",
    "mustSay": "In the picture, I can see a person shopping in a supermarket. The person is standing near shelves filled with different products and appears to be choosing an item. The store looks bright and organised. A shopping basket or trolley may also be visible nearby.",
    "sayMore": "The person may be comparing products before making a purchase. Supermarkets usually offer a wide range of choices in one place.",
    "keywords1": "supermarket | shelves | products | shopping | choosing | organised",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see a person shopping in a supermarket. The person is standing near shelves filled with different products and appears to be choosing an item. The store looks bright and organised. A shopping basket or trolley may also be visible nearby. The person may be comparing products before making a purchase. Supermarkets usually offer a wide range of choices in one place.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-026",
    "topic": "Two people decorating a room",
    "imageAlt": "Two people decorating or arranging items in a room.",
    "sceneIcon": "🖌️",
    "mustSay": "In the picture, I can see two people working together in a room. They appear to be decorating or arranging the space. There are household items and tools around them, and both people are involved in the task. The room looks like it is being changed or improved.",
    "sayMore": "They may be painting, moving furniture or preparing the room for a new purpose. The activity seems practical and cooperative.",
    "keywords1": "two people | room | decorating | arranging | household items | teamwork",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see two people working together in a room. They appear to be decorating or arranging the space. There are household items and tools around them, and both people are involved in the task. The room looks like it is being changed or improved. They may be painting, moving furniture or preparing the room for a new purpose. The activity seems practical and cooperative.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-027",
    "topic": "Crowded urban street",
    "imageAlt": "Many people walking along a busy city street.",
    "sceneIcon": "🏙️",
    "mustSay": "In the picture, I can see many people walking along a busy urban street. There are buildings, shops and traffic around them. The area appears crowded, with people moving in different directions. The scene clearly shows an active city environment.",
    "sayMore": "It may be a shopping or business district during a busy part of the day. The atmosphere seems energetic but possibly noisy.",
    "keywords1": "urban street | crowd | buildings | traffic | city environment | busy",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see many people walking along a busy urban street. There are buildings, shops and traffic around them. The area appears crowded, with people moving in different directions. The scene clearly shows an active city environment. It may be a shopping or business district during a busy part of the day. The atmosphere seems energetic but possibly noisy.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-028",
    "topic": "People playing video games together",
    "imageAlt": "Several people sitting on a sofa and playing video games together.",
    "sceneIcon": "🎮",
    "mustSay": "In the picture, I can see several people sitting together on a sofa and playing video games. They are holding game controllers and looking towards a screen. The setting is indoors and looks like a living room. Everyone appears focused on the game.",
    "sayMore": "They may be competing with each other or playing as a team. The atmosphere seems lively and entertaining.",
    "keywords1": "video games | controllers | sofa | screen | indoors | entertainment",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people sitting together on a sofa and playing video games. They are holding game controllers and looking towards a screen. The setting is indoors and looks like a living room. Everyone appears focused on the game. They may be competing with each other or playing as a team. The atmosphere seems lively and entertaining.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-029",
    "topic": "People celebrating in an office",
    "imageAlt": "Several people smiling and celebrating together in an office.",
    "sceneIcon": "🙌",
    "mustSay": "In the picture, I can see several people standing together in an office. They are smiling, raising their hands or giving each other a high five. Computers and desks are visible around them. The group appears pleased about something that has just happened.",
    "sayMore": "They may have completed a project or achieved a positive result. The atmosphere seems energetic, supportive and professional.",
    "keywords1": "office | group | celebration | high five | desks | positive result",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people standing together in an office. They are smiling, raising their hands or giving each other a high five. Computers and desks are visible around them. The group appears pleased about something that has just happened. They may have completed a project or achieved a positive result. The atmosphere seems energetic, supportive and professional.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  },
  {
    "id": "SP2-EX-030",
    "topic": "People studying together",
    "imageAlt": "Several people sitting around a table and studying together.",
    "sceneIcon": "📝",
    "mustSay": "In the picture, I can see several people sitting around a table and studying together. There are books, notebooks and other materials in front of them. They appear to be discussing information and looking at their work. The setting looks suitable for group study.",
    "sayMore": "They may be preparing for a class, project or examination. The atmosphere seems focused and cooperative.",
    "keywords1": "group study | table | books | notebooks | discussion | cooperative",
    "question1": "Describe the picture.",
    "model1": "In the picture, I can see several people sitting around a table and studying together. There are books, notebooks and other materials in front of them. They appear to be discussing information and looking at their work. The setting looks suitable for group study. They may be preparing for a class, project or examination. The atmosphere seems focused and cooperative.",
    "structure1": "MUST SAY: SUBJECT → SETTING → MAIN ACTION → ONE CLEAR DETAIL. SAY MORE if time: SAFE INFERENCE → ATMOSPHERE / EFFECT.",
    "sourceLabel": "de thi part 02.pdf + SPEAKING PART 2.docx · Fact-first B2",
    "active": true
  }
];
}

function upgradeSpeakingPart2Description_(sheet, settings, report) {
  const current = getSetting_(settings, 'p2_description_version');
  if (current === PART2_DESCRIPTION_VERSION) return;

  PART2_DESCRIPTION_COLUMNS.forEach(function(header) { ensureColumn_(sheet, header, [], report); });
  const idx = headerIndexMap_(sheet);
  const values = sheet.getDataRange().getValues();
  const rowById = {};
  values.slice(1).forEach(function(row, i) {
    const id = String(row[idx.id] || '');
    if (id) rowById[id] = i + 2;
  });

  // Keep legacy prototype rows for Part 3 image references, but hide them from Part 2 practice.
  Object.keys(rowById).forEach(function(id) {
    if (/^SP2-\d{3}$/.test(id)) sheet.getRange(rowById[id], idx.active + 1).setValue(false);
  });

  const seeds = getPart2DescriptionSeedData_();
  seeds.forEach(function(seed) {
    let rowNum = rowById[seed.id];
    if (!rowNum) {
      rowNum = sheet.getLastRow() + 1;
      sheet.getRange(rowNum, 1).setValue(seed.id);
      rowById[seed.id] = rowNum;
    }
    const set = function(name, value) { if (idx[name] !== undefined) sheet.getRange(rowNum, idx[name] + 1).setValue(value); };
    set('topic', seed.topic);
    set('imageAlt', seed.imageAlt);
    set('sceneIcon', seed.sceneIcon);
    set('question1', seed.question1);
    set('question2', '');
    set('question3', '');
    set('model1', seed.model1);
    set('model2', '');
    set('model3', '');
    set('keywords1', seed.keywords1);
    set('keywords2', '');
    set('keywords3', '');
    set('structure1', seed.structure1);
    set('structure2', '');
    set('structure3', '');
    set('mustSay', seed.mustSay);
    set('sayMore', seed.sayMore);
    set('descriptionModel', seed.model1);
    set('descriptionKeywords', seed.keywords1);
    set('descriptionTemplate', seed.structure1);
    set('practiceMode', 'description_only');
    set('contentVersion', PART2_DESCRIPTION_VERSION);
    set('active', true);
    set('sourceLabel', seed.sourceLabel);
  });

  setSetting_(settings, 'p2_description_version', PART2_DESCRIPTION_VERSION);
  report.push('Speaking Part 2 replaced with 30 exam-based picture-description topics (Q1 only).');
}

function getSpeakingPart2_() {
  const sheet = requireSheet_(SHEET_NAMES.SPEAKING_P2, HEADERS.SPEAKING_P2);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const idx = headerIndexMap_(sheet);

  return values.slice(1).filter(function(row) {
    return row[idx.id] && row[idx.active] !== false && String(row[idx.active]).toLowerCase() !== 'false';
  }).map(function(row) {
    const must = idx.mustSay !== undefined ? String(row[idx.mustSay] || '') : '';
    const extra = idx.sayMore !== undefined ? String(row[idx.sayMore] || '') : '';
    const model = idx.descriptionModel !== undefined && row[idx.descriptionModel] ? String(row[idx.descriptionModel]) : String(row[idx.model1] || '');
    const keywords = idx.descriptionKeywords !== undefined && row[idx.descriptionKeywords] ? String(row[idx.descriptionKeywords]) : String(row[idx.keywords1] || '');
    const structure = idx.descriptionTemplate !== undefined && row[idx.descriptionTemplate] ? String(row[idx.descriptionTemplate]) : String(row[idx.structure1] || '');
    return {
      id: String(row[idx.id] || ''), part: 2, topic: String(row[idx.topic] || ''),
      imageUrl: String(row[idx.imageUrl] || ''), imageDriveId: String(row[idx.imageDriveId] || ''),
      imageAlt: String(row[idx.imageAlt] || ''), sceneIcon: String(row[idx.sceneIcon] || '🖼️'),
      questions: [String(row[idx.question1] || 'Describe the picture.')],
      models: [model], keywords: [keywords], structures: [structure],
      mustSay: must, sayMore: extra, practiceMode: 'description_only',
      sourceLabel: String(row[idx.sourceLabel] || '')
    };
  });
}

function getSpeakingPart2MediaMap_() {
  const sheet = requireSheet_(SHEET_NAMES.SPEAKING_P2, HEADERS.SPEAKING_P2);
  const values = sheet.getDataRange().getValues();
  const idx = headerIndexMap_(sheet);
  const map = {};
  values.slice(1).forEach(function(row) {
    const id = String(row[idx.id] || ''); if (!id) return;
    map[id] = {
      id:id, topic:String(row[idx.topic] || ''), imageUrl:String(row[idx.imageUrl] || ''),
      imageDriveId:String(row[idx.imageDriveId] || ''), imageAlt:String(row[idx.imageAlt] || ''),
      sceneIcon:String(row[idx.sceneIcon] || '🖼️')
    };
  });
  return map;
}

function aggregatePart2DescriptionProgress_(taskId, promptProgress, topicRow) {
  const p = promptProgress[0] || defaultProgress_(taskId + '-1');
  return {
    questionId: taskId, status: p.status || 'new', rating: Number(p.rating || 0),
    reviewCount: Number(p.reviewCount || 0), lastReviewed: p.lastReviewed || '', nextReview: p.nextReview || '', note: '',
    favorite: topicRow ? Boolean(topicRow.favorite) : false, masteredPrompts: p.status === 'learned' ? 1 : 0, totalPrompts: 1
  };
}
