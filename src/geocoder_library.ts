// #####################################
// ##        Geocoder library         ##
// #####################################

// R.S. 2022-08-18
// A library used to geocode, reverse geocode, and check concerns about addresses

// Note: To confirm coordinates, go to maps.google.com and right-click on the spot you need to get coordinates

// TODO:
// - Spurious concerns are generated when a suite is provided and doesn't show up in the reversed address (this is common)
//     - Could be fixed by only comparing the first and last number(s) in the address, as the suite (usually) but not always goes in the middle
//     - Or by recognizing a suite by searching for "#___", "Suite ___", etc.

type DetailedOutput = {
  ina: string
  fma: string
  lat: string
  lon: string
  rva: string
  concerns: string[]
}

/**
 *  Geocoding and reverse-geocoding library with a little error-checking
 *
 */
class Geocoder {
  // ############################
  // ##   Private methods      ##
  // ############################

  /**
   *  Helper function for dealing with Google's reverse geocoding output.
   *  Modified from https://github.com/nuket/google-sheets-geocoding-macro/blob/master/Code.gs
   *  For more info, see https://developers.google.com/maps/documentation/geocoding/requests-geocoding
   *
   *  @param {Object} addressObject - Google address object
   *  @param {string} whichComponent - Portion of address, e.g. 'street_number'
   *  @param {string} whichName - either "short_name" or "long_name" (e.g. "Pkwy" vs "Parkway")
   *  @return {string} Value of given address component
   *
   */
  _getAddressComponent(addressObject, whichComponent, whichName) {
    for (const r of addressObject) {
      for (const t of r['types']) {
        if (t === whichComponent) {
          // Logger.log(r[whichName]);
          return r[whichName]
        }
      }
    }

    return ''
  }

  /**
   *  Creates a formatted address (US type) given a lat/lon.
   *  Modified from https://github.com/nuket/google-sheets-geocoding-macro/blob/master/Code.gs
   *
   *  @param {decimal} lat - Latitude
   *  @param {decimal} lon - Longitude
   *  @throws {Error} "No location at lat/lon" if the Google geocoding library can't find an entity at that lat/lon
   *                  or if the information returned is blank.
   *  @return {string} Formatted address
   *
   */
  _reverseGeocodeExploded(lat, lon) {
    // @ts-ignore
    const geocoder = Maps.newGeocoder()
    const location = geocoder.reverseGeocode(lat, lon)
    // Logger.log(location.status);

    if (location.status == 'OK') {
      const L = location['results'][0]['address_components']

      // const outName  = this._getAddressComponent(L, 'establishment',               'short_name');
      const outStreetNumber = this._getAddressComponent(L, 'street_number', 'short_name')
      const outStreet = this._getAddressComponent(L, 'route', 'short_name')
      // const outBorough       = this._getAddressComponent(L, 'sublocality',                 'short_name');
      const outCity = this._getAddressComponent(L, 'locality', 'short_name')
      // const outStateLong     = this._getAddressComponent(L, 'administrative_area_level_1', 'long_name');
      const outStateShort = this._getAddressComponent(L, 'administrative_area_level_1', 'short_name')
      // const outCountryLong   = this._getAddressComponent(L, 'country',                     'long_name');
      // const outCountryShort  = this._getAddressComponent(L, 'country',                     'short_name');
      const outPostcodeShort = this._getAddressComponent(L, 'postal_code', 'short_name')

      // const finalName=outName?outName+', ':''; // unused

      if (outStreetNumber + outStreet + outCity + outStateShort + outPostcodeShort != '') {
        // If all answers are not blank
        return outStreetNumber + ' ' + outStreet + ', ' + outCity + ' ' + outStateShort + ' ' + outPostcodeShort
      } else {
        throw Error('No location at lat/lon')
      }
    } else {
      // location.status != 'OK'
      throw Error('No location at lat/lon')
    }
  }

  /**
   *  Finds mismatch concerns between input, formatted, and reversed addresses.
   *  Checks to see that the rva and fma addresses have the same street number and zip code (and any other number in the addresses)
   *  This is a good way to reality-check the output of the Google geocoder, as the geocoder will sometimes return a completely different
   *  address when reverse geocoding, given the case that the input address wasn't properly geocoded in the first place (or has another
   *  problem, like the street being renamed.)
   *
   *  @param {Object} r - Object containing values for ina (input address), rva (reversed address), and fma (formatted address)
   *  @throws {Error} "Function requires ina, rva, and fma before inspection." if the object does not contain the three addresses.
   *  @return {array} Concerns: if the array is empty then there are no concerns
   *
   */
  _getConcerns(r) {
    const concerns: string[] = []
    if (!r.ina) {
      throw new Error('Function requires ina, rva, and fma before inspection.')
    } else if (!r.fma) {
      throw new Error('Function requires ina, rva, and fma before inspection.')
    } else if (!r.rva) {
      throw new Error('Function requires ina, rva, and fma before inspection.')
    }

    // Regex matches all numbers in the address
    if (!(JSON.stringify(r.ina.match(/\d+/g).map(Number)) === JSON.stringify(r.fma.match(/\d+/g).map(Number)))) {
      concerns.push('Zip and/or street numbers in input and formatted addresses do not match')
    }

    if (!(JSON.stringify(r.ina.match(/\d+/g).map(Number)) === JSON.stringify(r.rva.match(/\d+/g).map(Number)))) {
      concerns.push('Zip and/or street numbers in input and reverse geocoded addresses do not match')
    }

    return concerns
  }

  // ############################
  // ##     Public methods     ##
  // ############################

  /**
   *  Geocodes an address (returns lat/lon) - warning: do not abuse the API and run this function more than every 3 seconds
   *
   *  @param {string} addr - Address as a string, e.g. "7800 Smith Rd Denver CO 80207"
   *  @throws {Error} "Cannot geocode empty address." if the address is empty
   *  @throws {Error} "No lat/lon returned for given address." if the address doesn't match to a real entity according to the Geocoder API
   *  @return {Object} {lat:decimal, lon:decimal} with latitude and longitude inside
   *
   */
  geocode(addr) {
    if (!addr) {
      throw new Error('Cannot geocode empty address')
    } else {
      // @ts-ignore
      const response = Maps.newGeocoder().geocode(addr)

      // Returns the last result in the response list
      const result = response.results[response.results.length - 1]
      if (result) {
        return { lat: result.geometry.location.lat, lon: result.geometry.location.lng, fma: result.formatted_address }
      } else {
        throw Error('No lat/lon returned for given address: perhaps the address does not exist')
      }
    }
  }

  /**
   *  Reverse geocodes an address (returns address from lat/lon) - warning: do not abuse the API and run this function more than every 3 seconds
   *
   *  @param {decimal} lat - Latitude
   *  @param {decimal} lon - Longitude
   *  @throws {Error} "No location at lat/lon" if the Google geocoding library can't find an entity at that lat/lon
   *                  or if the information returned is blank. (Error passed up from private method)
   *  @return {string} Formatted address
   */
  reverseGeocode(lat, lon) {
    return this._reverseGeocodeExploded(lat, lon)
  }

  /**
   *  Get detailed geocoding for a specific address or addresses in an array
   *
   *  @param {Array} addrArray - Address(es) in an array as strings, e.g. ["7800 Smith Rd Denver CO 80207"]
   *  @throws {Error} "Cannot get address details from empty array." if the array is empty
   *  @throws {Error} "Cannot get address details from non-array." if the parameter is not actually an array
   *  @throws {Error} Any other errors thrown by geocode() or reverseGeocode()
   *  @return {Object} {ina:string, fma:string, lat:decimal, lon:decimal, rva:string, concerns:Array }
   *    ina: Input address
   *    fma: Formatted address (input address but cleaned up using Google's methods)
   *    lat: Latitude
   *    lon: Longitude
   *    rva: Reverse geocode address
   *    concerns: Array of concerns: concerns arise when the street numbers or zip codes of
   *        the formatted address or reverse geocode address don't match the input address.
   *        If the array is empty, there are no concerns.
   */
  detailMultiple(addrArray) {
    if (!addrArray) {
      throw new Error('Cannot get address details from empty array')
    } else if (!Array.isArray(addrArray)) {
      throw new Error('Cannot get address details from non-array')
    } else {
      const retArr: DetailedOutput[] = []
      for (let i = 0; i < addrArray.length; i++) {
        const initial_address = addrArray[i]
        const r = this.geocode(initial_address)
        const rf = this.reverseGeocode(r.lat, r.lon)
        const c = this._getConcerns({ ina: initial_address, fma: r.fma, lat: r.lat, lon: r.lon, rva: rf })
        retArr.push({ ina: initial_address, fma: r.fma, lat: r.lat, lon: r.lon, rva: rf, concerns: c })
        // @ts-ignore
        Utilities.sleep(3000) // to not overuse the API
      }
      return retArr
    }
  }
}
