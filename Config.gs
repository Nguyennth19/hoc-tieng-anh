/**
 * APTIS B2 Coach - V3D / Multi-Skill Framework
 * Google Apps Script Web App backend.
 *
 * IMPORTANT:
 * Keep the SAME Google Sheet from V1.
 * Paste its Spreadsheet ID below. V2 will migrate the existing database automatically.
 */
const DATABASE_SPREADSHEET_ID = '1gkq6RBQDtARL0v7jb5J_HT_5ZRAuYci1-lqE0lIsPoY';

const APP_CONFIG = Object.freeze({
  APP_TITLE: 'APTIS B2 Coach',
  VERSION: '3.2.1',
  SCHEMA_VERSION: '3.2.0',
  PART1_TEST_SECONDS: 30,
  PART2_TEST_SECONDS: 45,
  PART3_TEST_SECONDS: 45,
  CACHE_SECONDS: 1800,
  PROGRESS_CACHE_SECONDS: 120
});

const SHEET_NAMES = Object.freeze({
  SPEAKING_P1: 'SPEAKING',
  SPEAKING_P2: 'SPEAKING_P2',
  SPEAKING_P3: 'SPEAKING_P3',
  PROGRESS: 'PROGRESS',
  ATTEMPTS: 'ATTEMPTS',
  SETTINGS: 'SETTINGS',
  MEDIA: 'MEDIA'
});

const HEADERS = Object.freeze({
  SPEAKING_P1: ['id','part','question','tenseSignal','tense','core','model','keywords','duplicateOf','active','sourceLabel'],
  SPEAKING_P2: ['id','topic','imageUrl','imageDriveId','imageAlt','sceneIcon','question1','question2','question3','model1','model2','model3','keywords1','keywords2','keywords3','structure1','structure2','structure3','active','sourceLabel'],
  SPEAKING_P3: ['id','topic','imageATopicId','imageBTopicId','question1','question2','question3','model1','model2','model3','keywords1','keywords2','keywords3','structure1','structure2','structure3','active','sourceLabel'],
  PROGRESS: ['questionId','status','rating','reviewCount','lastReviewed','nextReview','note','favorite'],
  ATTEMPTS: ['timestamp','questionId','elapsedSeconds','selfRating','completedFullTime','note','part','promptIndex'],
  SETTINGS: ['key','value'],
  MEDIA: ['assetKey','part','topicId','driveFileId','fileName','mimeType','sourceLabel','createdAt']
});
