function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_CONFIG.APP_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * V3D entrypoint only.
 * Feature logic lives in dedicated .gs files.
 * Automatic migrations are handled by Migration.gs.
 */