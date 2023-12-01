// #####################################
// ##        Geocoder library         ##
// #####################################

// Unit tests
// R.S. 2023-11-30
// A library used to geocode, reverse geocode, and check concerns about addresses

// Setup
// 1. Be sure to set up a new (different) project with the QUnitGS2 library https://github.com/artofthesmart/QUnitGS2
// 2. Add this library (in sidebar)
// 3. Keep the QUnitGS2 library updated
// 4. To check on unit tests, go to Deploy > Test deployments > Web app > URL to view the unit tests.
//    Note: Test deployment must be run with the account that has created the Google Apps Script.

const QUnit = QUnitGS2.QUnit

/**
An array of unit tests for the Geocoder library, testing geocoder functionality.
 *
 */
function GeocoderTests() {
  QUnit.module('GeocoderTests')

  QUnit.test('Basic geocoder creation', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      result = true
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'Geocoder() constructor exists')
  })

  QUnit.test('Geocode function exists', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      if (typeof gc.geocode === 'function') {
        result = true
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'gc.geocode() exists')
  })

  QUnit.test('Cannot geocode empty address', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      gc.geocode('')
    } catch (error) {
      if (error.message == 'Cannot geocode empty address') {
        result = true
      }
    }
    assert.true(result, 'gc.geocode() exists and prohibits empty address')
  })

  QUnit.test('Geocoding function returns non-blank lat, lon, fma (formatted address)', function (assert) {
    valueString = ''
    result = false
    try {
      const gc = new Geocoder()
      const r = gc.geocode('4600 Leetsdale Dr, Glendale, CO 80246')
      if (r.lat && r.lon && r.fma) {
        result = true
        valueString = r.lat + ', ' + r.lon + ', ' + r.fma
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'gc.geocode() exists and returns object with lat, lon, fma entries ' + valueString)
  })

  QUnit.test('Geocoding function returns reasonable lat', function (assert) {
    valueString = ''
    result = false
    try {
      const gc = new Geocoder()
      const r = gc.geocode('4600 Leetsdale Dr, Glendale, CO 80246')
      estimate = 39.71
      upperLimit = estimate + 0.005
      lowerLimit = estimate - 0.005
      if (r.lat > lowerLimit && r.lat < upperLimit) {
        result = true
        valueString = lowerLimit + ' < lat=' + r.lat + ' < ' + upperLimit
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, valueString)
  })

  QUnit.test('Geocoding function returns reasonable lon', function (assert) {
    valueString = ''
    result = false
    try {
      const gc = new Geocoder()
      const r = gc.geocode('4600 Leetsdale Dr, Glendale, CO 80246')
      estimate = -104.93
      upperLimit = estimate + 0.005
      lowerLimit = estimate - 0.005
      if (r.lon > lowerLimit && r.lon < upperLimit) {
        result = true
        valueString = lowerLimit + ' < lon=' + r.lon + ' < ' + upperLimit
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, valueString)
  })

  QUnit.test('Geocoding function returns good formatted address', function (assert) {
    valueString = ''
    result = false
    try {
      const gc = new Geocoder()
      const r = gc.geocode('4600 Leetsdale Dr, Glendale, CO 80246')

      if (
        r.fma.includes('4600 Leetsdale') &&
        r.fma.includes('Glendale') &&
        r.fma.includes('CO') &&
        r.fma.includes('80246')
      ) {
        result = true
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'Returned address contains street, city, state, and zip')
  })

  QUnit.test('Geocoding function throws error for unreasonable address', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      const r = gc.geocode('4anmdsijnsifbr600 Leetsdafsadfdsale Drasdfdsf')
    } catch (error) {
      if (error.message == 'No lat/lon returned for given address: perhaps the address does not exist') {
        result = true
      }
    }
    assert.true(result, 'gc.reverseGeocode() exists and prohibits unreasonable lat/lons')
  })
}

/**
An array of unit tests for the Geocoder library, testing reverse geocoder functionality.
 *
 */
function ReverseGeocoderTests() {
  QUnit.module('ReverseGeocoderTests')

  QUnit.test('Reverse geocode function exists', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      if (typeof gc.reverseGeocode === 'function') {
        result = true
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'gc.reverseGeocode() exists')
  })

  QUnit.test('Reverse geocode function returns reasonable values for actual lat/lon', function (assert) {
    rst = ''
    lat = 0
    lon = 0
    result = false
    try {
      const gc = new Geocoder()
      lat = 39.7084673 // Denver King Soopers
      lon = -104.9326797
      rst = gc.reverseGeocode(lat, lon)
      if (rst.includes('Leetsdale') && rst.includes('Glendale') && rst.includes('CO') && rst.includes('80246')) {
        result = true
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'gc.reverseGeocode() returns reasonable value of ' + rst + ' for ' + lat + ', ' + lon)
  })

  QUnit.test('Reverse geocode function throws error for unreasonable lat/lon', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      lat = 25.74381 // Off the coast of Florida
      lon = -79.54583
      rst = gc.reverseGeocode(lat, lon)
    } catch (error) {
      if (error.message == 'No location at lat/lon') {
        result = true
      }
    }
    assert.true(result, 'gc.reverseGeocode() exists and prohibits unreasonable lat/lons')
  })
}

/**
An array of unit tests for the Geocoder library, testing multiple address and error checking functionality.
 *
 */
function MultipleAddressGeocoderTests() {
  QUnit.module('MultipleAddressGeocoderTests')

  QUnit.test('Multiple address info geocode function exists', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      if (typeof gc.detailMultiple === 'function') {
        result = true
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'gc.detailMultiple() exists')
  })

  QUnit.test('Cannot run multiple address details on empty array', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      gc.detailMultiple()
    } catch (error) {
      if (error.message == 'Cannot get address details from empty array') {
        result = true
      }
    }
    assert.true(result, 'gc.detailMultiple() exists and prohibits empty array')
  })

  QUnit.test('Cannot run multiple address details on non-array', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      gc.detailMultiple('test test test')
    } catch (error) {
      if (error.message == 'Cannot get address details from non-array') {
        result = true
      }
    }
    assert.true(result, 'gc.detailMultiple() exists and prohibits non-array')
  })

  QUnit.test('Cannot run multiple address details on array with blank elements', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      gc.detailMultiple(['4600 Leetsdale Dr, Glendale, CO 80246', ''])
    } catch (error) {
      if (error.message == 'Cannot geocode empty address') {
        // NOTE: passed on from geocode() function: lazy evaluation
        result = true
      } else {
        // result remains false
      }
    }
    assert.true(result, 'gc.detailMultiple() exists and fails when contains a blank element')
  })

  QUnit.test(
    'Run multiple address details on array returns values for lat, lon, formatted address, reverse address, concerns',
    function (assert) {
      result = false
      try {
        const gc = new Geocoder()
        const ra = gc.detailMultiple([
          '4600 Leetsdale Dr, Glendale, CO 80246',
          '2770 West Evans Avenue, Denver, CO 80219',
        ])
        if (
          ra[0].lat &&
          ra[0].lon &&
          ra[0].fma &&
          ra[0].rva &&
          ra[0].concerns &&
          ra[1].lat &&
          ra[1].lon &&
          ra[1].fma &&
          ra[1].rva &&
          ra[1].concerns
        ) {
          result = true
        }
      } catch (error) {
        // result remains false
      }

      assert.true(result, 'gc.detailMultiple() returns non-null content for both addresses')
    }
  )

  QUnit.test(
    'Run multiple address details on array returns correct values for lat, lon, rva, fma for known good addresses',
    function (assert) {
      result = false
      try {
        const gc = new Geocoder()
        const r = gc.detailMultiple([
          '4600 Leetsdale Dr, Glendale, CO 80246',
          '2770 West Evans Avenue, Denver, CO 80219',
        ])
        estimateLatA = 39.71
        upperLimitLatA = estimateLatA + 0.005
        lowerLimitLatA = estimateLatA - 0.005
        estimateLonA = -104.93
        upperLimitLonA = estimateLonA + 0.005
        lowerLimitLonA = estimateLonA - 0.005

        estimateLatB = 39.68
        upperLimitLatB = estimateLatB + 0.005
        lowerLimitLatB = estimateLatB - 0.005
        estimateLonB = -105.02
        upperLimitLonB = estimateLonB + 0.005
        lowerLimitLonB = estimateLonB - 0.005

        if (
          r[0].lon > lowerLimitLonA &&
          r[0].lon < upperLimitLonA &&
          r[0].lat > lowerLimitLatA &&
          r[0].lat < upperLimitLatA &&
          r[0].fma.includes('4600 Leetsdale') &&
          r[0].fma.includes('Glendale') &&
          r[0].fma.includes('CO') &&
          r[0].fma.includes('80246') &&
          r[0].rva.includes('4600 Leetsdale') &&
          r[0].rva.includes('Glendale') &&
          r[0].rva.includes('CO') &&
          r[0].rva.includes('80246') &&
          r[1].lon > lowerLimitLonB &&
          r[1].lon < upperLimitLonB &&
          r[1].lat > lowerLimitLatB &&
          r[1].lat < upperLimitLatB &&
          r[1].fma.includes('2770 W') &&
          r[1].fma.includes('Evans') &&
          r[1].fma.includes('CO') &&
          r[1].fma.includes('80219') &&
          r[1].rva.includes('2770 W') &&
          r[1].rva.includes('Evans') &&
          r[1].rva.includes('CO') &&
          r[1].rva.includes('80219')
        ) {
          result = true
        }
      } catch (error) {
        // result remains false
      }

      assert.true(
        result,
        'gc.detailMultiple() returns valid content (lat, lon, formatted address, reversed address) for both items in array'
      )
    }
  )

  QUnit.test('Run multiple address details returns non-matching concern when zip code is mistaken', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      const r = gc.detailMultiple(['4600 Leetsdale Dr, Glendale CO 80236']) // Should be 80246
      concernOfInterest = 'Zip and/or street numbers in input and reverse geocoded addresses do not match'

      if (r[0].concerns.includes(concernOfInterest)) {
        result = true
      }
    } catch (error) {
      // result remains false
    }

    assert.true(
      result,
      'gc.detailMultiple() returns non-matching concern ' + concernOfInterest + ' when zip code is mistaken'
    )
  })
}

/**
An array of unit tests for the Geocoder library, testing geocoder private methods.
 *
 */
function GeocoderPrivateMethodsTests() {
  QUnit.module('GeocoderPrivateMethodsTests')

  QUnit.test('Internal geocoding inspection function exists', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      if (typeof gc._getConcerns === 'function') {
        result = true
      }
    } catch (error) {
      // result remains false
    }
    assert.ok(result, 'gc._getConcerns() exists')
  })

  QUnit.test('Internal geocoding inspection function throws error when missing ina', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      const r = gc._getConcerns({ fma: '1234 N St, Denver, CO 80230', rva: '1234 N St, Denver, CO 80230' })
    } catch (error) {
      if (error.message == 'Function requires ina, rva, and fma before inspection.') {
        result = true
      }
    }
    assert.true(result, 'gc._getConcerns() exists and requires ina')
  })

  QUnit.test('Internal geocoding inspection function throws error when missing fma', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      const r = gc._getConcerns({ ina: '1234 N St, Denver, CO 80230', rva: '1234 N St, Denver, CO 80230' })
    } catch (error) {
      if (error.message == 'Function requires ina, rva, and fma before inspection.') {
        result = true
      }
    }
    assert.true(result, 'gc._getConcerns() exists and requires fma')
  })

  QUnit.test('Internal geocoding inspection function throws error when missing rva', function (assert) {
    result = false
    try {
      const gc = new Geocoder()
      const r = gc._getConcerns({ ina: '1234 N St, Denver, CO 80230', fma: '1234 N St, Denver, CO 80230' })
    } catch (error) {
      if (error.message == 'Function requires ina, rva, and fma before inspection.') {
        result = true
      }
    }
    assert.true(result, 'gc._getConcerns() exists and requires rva')
  })

  QUnit.test(
    'Internal geocoding inspection function returns no concerns when all three addresses are equal',
    function (assert) {
      result = false
      try {
        const gc = new Geocoder()
        concerns = gc._getConcerns({
          ina: '1234 N St, Denver, CO 80230',
          fma: '1234 N St, Denver, CO 80230',
          rva: '1234 N St, Denver, CO 80230',
        })
        if (concerns.length == 0) {
          result = true
        }
      } catch (error) {
        // result remains false
      }
      assert.ok(result, 'gc._getConcerns() returns no concerns when all 3 addresses are equal')
    }
  )

  QUnit.test(
    'Internal geocoding inspection function returns correct concern when ina numbers are not the same as fma numbers',
    function (assert) {
      result = false
      try {
        const gc = new Geocoder()
        concerns = gc._getConcerns({
          ina: '1234 N St, Denver, CO 80230',
          fma: '9999 N St, Denver, CO 80230',
          rva: '1234 N St, Denver, CO 80230',
        })
        if (concerns.includes('Zip and/or street numbers in input and formatted addresses do not match')) {
          result = true
        }
      } catch (error) {
        // result remains false
      }
      assert.ok(result, "gc._getConcerns() adds proper concern when ina and fma address numbers don't match")
    }
  )

  QUnit.test(
    'Internal geocoding inspection function returns correct concern when ina numbers are not the same as rva numbers',
    function (assert) {
      result = false
      try {
        const gc = new Geocoder()
        concerns = gc._getConcerns({
          ina: '1234 N St, Denver, CO 80230',
          fma: '1234 N St, Denver, CO 80230',
          rva: '9999 N St, Denver, CO 80230',
        })
        concernOfInterest = 'Zip and/or street numbers in input and reverse geocoded addresses do not match'

        if (concerns.includes(concernOfInterest)) {
          result = true
        }
      } catch (error) {
        // result remains false
      }
      assert.ok(
        result,
        'gc._getConcerns() adds proper concern ' + concernOfInterest + " when ina and rva address numbers don't match"
      )
    }
  )
}
