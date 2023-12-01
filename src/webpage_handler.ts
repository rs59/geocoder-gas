/**
 *  Webpage handler.
 *
 *  @param {string} e - parameter, expressed as ?page=xxx
 *
 */
function doGet(e) {
  if (ENVIRONMENT == 'dev' && e.parameter.page == 'tests') {
    Logger.log(e)
    // Test page for QUnit2
    QUnitGS2.init()
    GeocoderTests()
    ReverseGeocoderTests()
    MultipleAddressGeocoderTests()
    GeocoderPrivateMethodsTests()
    QUnit.start()
    return QUnitGS2.getHtml()
  } else {
    // Run the demo
    const t = HtmlService.createTemplateFromFile('demo')
    return t.evaluate()
  }
}
/**
 * Modified launch function for unit testing (GitHub actions)
 */
function launch() {
  const e = {
    parameter: {},
  }
  // Set the page property of the parameter object to "tests"
  e.parameter.page = 'tests'
  doGet(e) // discards output, which will cause clasp to fail
}
/**
 * Results function for QUnit2: see instructions at http://qunitgs2.com/
 */
function getResultsFromServer() {
  results = QUnitGS2.getResultsFromServer()
  Logger.log(results)
  return results
}
