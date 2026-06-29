// Code.gs
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Ứng Dụng Học Tiếng Anh')
    .setFaviconUrl('https://cdn-icons-png.freepik.com/256/15718/15718573.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Tạo Sheet "Cụm từ" nếu chưa tồn tại và thêm dữ liệu mẫu
function createPhraseSheetIfNeeded() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Cụm từ');
  
  if (!sheet) {
    // Tạo sheet mới
    sheet = ss.insertSheet('Cụm từ');
    
    // Thiết lập tiêu đề
    sheet.getRange('A1:F1').setValues([['ID', 'Tiếng Anh', 'Phiên âm', 'Tiếng Việt', 'Chủ đề', 'Hình ảnh']]);
    sheet.getRange('A1:F1').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
    
    // Tự động điều chỉnh độ rộng cột
    sheet.autoResizeColumns(1, 6);
  }
  
  return sheet;
}

// Lấy dữ liệu từ Sheet "Cụm từ"
function getPhrasesData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Cụm từ');
    
    if (!sheet) {
      // Nếu chưa có sheet, tạo mới
      sheet = createPhraseSheetIfNeeded();
    }
    
    // Lấy tất cả dữ liệu (trừ hàng tiêu đề)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Bỏ qua hàng tiêu đề
    const data = values.slice(1).map(row => {
      return {
        id: row[0],
        english: row[1],
        phonetic: row[2],
        translation: row[3],
        category: row[4],
        imageUrl: row[5]
      };
    });
    
    return data;
  } catch (error) {
    // Nếu có lỗi, trả về mảng dữ liệu giả
    Logger.log('Error getting phrases data: ' + error);
    return getFallbackData();
  }
}

// Dữ liệu dự phòng trong trường hợp không thể kết nối với Sheet
function getFallbackData() {
  return [
    {
      id: 1,
      english: "Hello, how are you?",
      phonetic: "/həˈləʊ, haʊ ɑː juː/",
      translation: "Xin chào, bạn khỏe không?",
      category: "Greetings",
      imageUrl: "https://cdn.pixabay.com/photo/2016/11/14/03/38/achieve-1822503_960_720.jpg"
    },
    {
      id: 2,
      english: "I would like to order a coffee.",
      phonetic: "/aɪ wʊd laɪk tuː ˈɔːdər ə ˈkɒfi/",
      translation: "Tôi muốn gọi một ly cà phê.",
      category: "Food",
      imageUrl: "https://cdn.pixabay.com/photo/2016/11/29/12/54/cafe-1869656_960_720.jpg"
    },
    {
      id: 3,
      english: "Where is the nearest train station?",
      phonetic: "/weər ɪz ðə ˈnɪərɪst treɪn ˈsteɪʃn/",
      translation: "Nhà ga tàu gần nhất ở đâu?",
      category: "Travel",
      imageUrl: "https://cdn.pixabay.com/photo/2016/01/09/18/27/old-1130731_960_720.jpg"
    }
  ];
}

// Hàm Text-to-Speech sử dụng Google Translate TTS
function getAudioUrl(text) {
  try {
    const textEncoded = encodeURIComponent(text);
    // Thêm key ngẫu nhiên để tránh cache và giảm giới hạn
    const randomKey = Math.floor(Math.random() * 1000000);
    return "https://translate.google.com/translate_tts?ie=UTF-8&q=" + textEncoded + "&tl=en&client=tw-ob&ttsspeed=1&idx=0&textlen=" + text.length + "&tk=" + randomKey;
  } catch (e) {
    Logger.log('Error in getAudioUrl: ' + e);
    return '';
  }
}