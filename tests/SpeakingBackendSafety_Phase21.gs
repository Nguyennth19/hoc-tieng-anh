/**
 * Phase 2.1: isolated Speaking cache safety tests.
 * Run testSpeakingBackendSafetyPhase21() from Apps Script editor.
 * Uses only in-memory objects; never calls SpreadsheetApp, getDatabase_,
 * CacheService.getScriptCache(), DriveApp or runMigrations().
 */
function testSpeakingBackendSafetyPhase21() {
  const results = [];
  function assert_(value, message) { if (!value) throw new Error(message); }
  function mockCache_(options) {
    options = options || {};
    const entries = {};
    const stats = {gets: 0, puts: 0, removes: 0};
    return {
      entries: entries, stats: stats,
      get: function(key) {
        stats.gets++;
        if (options.throwGet) throw new Error('mock cache get failure');
        return Object.prototype.hasOwnProperty.call(entries, key) ? entries[key] : null;
      },
      put: function(key, value) {
        stats.puts++;
        if (options.throwPut || (options.failPutAt && stats.puts === options.failPutAt)) throw new Error('mock cache put failure');
        entries[key] = String(value);
      },
      remove: function(key) {
        stats.removes++;
        if (options.throwRemove) throw new Error('mock cache remove failure');
        delete entries[key];
      }
    };
  }
  function test_(name, run) {
    try { run(); results.push({name: name, status: 'PASS'}); }
    catch (e) { results.push({name: name, status: 'FAIL', error: String(e && e.message || e)}); }
  }
  const key = 'mock-speaking-p3';
  const fixture = [{id: 'P3-MOCK-001', questions: ['Q1','Q2','Q3'], models: ['A1','A2','A3']}];
  function loadWithFallback_(cache, load) {
    const hit = speakingCacheRead_(cache, key);
    if (Array.isArray(hit)) return hit;
    const source = load();
    speakingCacheWrite_(cache, key, source, 60);
    return source;
  }
  function sheetMock_() {
    const trace = {reads: 0, writes: 0};
    return {
      trace: trace,
      read: function() { trace.reads++; return JSON.parse(JSON.stringify(fixture)); },
      write: function() { trace.writes++; throw new Error('Mock Sheet MUST NOT be written'); }
    };
  }
  test_('01 cache roundtrip / original Q1-Q3 intact', function() {
    const c = mockCache_();
    speakingCacheWrite_(c, key, fixture, 60);
    assert_(JSON.stringify(speakingCacheRead_(c, key)) === JSON.stringify(fixture), 'roundtrip mismatch');
  });
  test_('02 cold cache falls back to mock Sheet', function() {
    const c = mockCache_(), sheet = sheetMock_();
    assert_(loadWithFallback_(c, sheet.read).length === 1, 'missing fallback data');
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'unexpected sheet I/O');
  });
  test_('03 warm cache avoids Sheet read', function() {
    const c = mockCache_(), sheet = sheetMock_();
    speakingCacheWrite_(c, key, fixture, 60);
    loadWithFallback_(c, sheet.read);
    assert_(sheet.trace.reads === 0 && sheet.trace.writes === 0, 'unexpected Sheet access');
  });
  test_('04 corrupt manifest JSON falls back safely', function() {
    const c = mockCache_(), sheet = sheetMock_();
    c.entries[key] = '{broken';
    assert_(loadWithFallback_(c, sheet.read).length === 1, 'no fallback');
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'unexpected Sheet I/O');
  });
  test_('05 invalid manifest rejected', function() {
    const c = mockCache_(), sheet = sheetMock_();
    c.entries[key] = JSON.stringify({cacheFormat:'chunked-v1', token:'bad', parts:500, length:1});
    loadWithFallback_(c, sheet.read);
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'no safe fallback');
  });
  test_('06 missing chunk falls back safely', function() {
    const c = mockCache_(), sheet = sheetMock_();
    speakingCacheWrite_(c, key, fixture, 60);
    const m = JSON.parse(c.entries[key]);
    delete c.entries[key + ':chunk:' + m.token + ':0'];
    loadWithFallback_(c, sheet.read);
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'missing chunk did not fall back');
  });
  test_('07 payload length mismatch falls back', function() {
    const c = mockCache_(), sheet = sheetMock_();
    speakingCacheWrite_(c, key, fixture, 60);
    const m = JSON.parse(c.entries[key]); m.length += 2; c.entries[key] = JSON.stringify(m);
    loadWithFallback_(c, sheet.read);
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'mismatch did not fall back');
  });
  test_('08 invalid chunk JSON falls back', function() {
    const c = mockCache_(), sheet = sheetMock_();
    speakingCacheWrite_(c, key, fixture, 60);
    const m = JSON.parse(c.entries[key]);
    const k = key + ':chunk:' + m.token + ':0';
    c.entries[k] = 'x'.repeat(m.length);
    loadWithFallback_(c, sheet.read);
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'corrupt payload did not fall back');
  });
  test_('09 CacheService get throws; mock Sheet returns data', function() {
    const c = mockCache_({throwGet:true}), sheet = sheetMock_();
    assert_(loadWithFallback_(c, sheet.read).length === 1, 'get failure blocked fallback');
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'unexpected Sheet I/O');
  });
  test_('10 CacheService remove throws; fallback still works', function() {
    const c = mockCache_({throwRemove:true}), sheet = sheetMock_();
    c.entries[key] = 'bad-json';
    loadWithFallback_(c, sheet.read);
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'remove failure blocked fallback');
  });
  test_('11 CacheService put throws; content remains available', function() {
    const c = mockCache_({throwPut:true}), sheet = sheetMock_();
    assert_(loadWithFallback_(c, sheet.read).length === 1, 'put failure blocked loader');
    assert_(sheet.trace.reads === 1 && sheet.trace.writes === 0, 'unexpected Sheet I/O');
  });
  test_('12 partial cache write never publishes manifest', function() {
    const c = mockCache_({failPutAt:2}), sheet = sheetMock_();
    // Ensure more than one chunk; fail before manifest publication.
    const large = [{id:'BIG', text:'a'.repeat(19000)}];
    speakingCacheWrite_(c, key, large, 60);
    assert_(!Object.prototype.hasOwnProperty.call(c.entries,key), 'published incomplete manifest');
    assert_(loadWithFallback_(c, sheet.read).length === 1, 'fallback blocked');
    assert_(sheet.trace.writes === 0, 'Sheet write');
  });
  test_('13 unicode payload chunk roundtrip', function() {
    const c = mockCache_(), data = [{id:'VN', text:'Tiếng Việt 🎓'.repeat(3000)}];
    speakingCacheWrite_(c, key, data, 60);
    assert_(JSON.stringify(speakingCacheRead_(c,key)) === JSON.stringify(data), 'unicode mismatch');
  });
  const passed = results.filter(function(r){return r.status === 'PASS';}).length;
  const report = {suite:'Speaking Backend Safety Phase 2.1 (MOCK ONLY)', passed:passed, total:results.length, ok:passed===results.length, productionSheetAccess:false, tests:results};
  console.log(JSON.stringify(report));
  return report;
}
