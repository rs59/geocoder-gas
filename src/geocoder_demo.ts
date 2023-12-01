// #####################################
// ##     Geocoder library demo       ##
// #####################################

// R.S. 2023-12-01
// Demonstration functions of the geocoder-gas library used to geocode, reverse geocode, and check concerns about addresses

/**
 *  Demonstrates simple address geocoding
 *  @return {object} [input, output] to/from gc.geocode(address)
 */
function demo1() {
  const address = '7800 Smith Rd Denver CO 80207'
  // Create a geocoding handler
  const gc = new Geocoder()
  // 1. Basic geocoding (transform address into lat/lon)
  const r = gc.geocode(address)
  // Returns:
  // fma: formatted address:       "7800 Smith Rd, Denver, CO 80207"  # Note: will fix minor mispellings and formatting issues
  // lat: latitude:                39.7697618    # Geocoded
  // lon: longitude:               -104.8976515  # Geocoded
  return [JSON.stringify([address]), JSON.stringify(r)]
}

/**
 *  Demonstrates address reverse geocoding
 *  @return {object} [input, output] to/from gc.reverseGeocode(lat, lon)
 */
function demo2() {
  const lat = '39.67829'
  const lon = '-104.91202'
  // Create a geocoding handler
  const gc = new Geocoder()
  // 2. Reverse geocoding (transform lat/lon into address)
  const r = gc.reverseGeocode(lat, lon) // Winchell's Donuts, lat/lon
  // Returns:
  // address:        6550 E Evans Ave, Denver CO 80224
  return [JSON.stringify([lat, lon]), JSON.stringify(r)]
}

/**
 *  Demonstrates multiple address detailed info
 *  @return {object} [input, output] to/from gc.detailMultiple([address1, address2])
 */
function demo3() {
  address1 = '4600 Letsdale Dr Glendale   CO 80246'
  address2 = '4600 Leetsdale Dr Glendale CO 80236'
  // Create a geocoding handler
  const gc = new Geocoder()
  // 3. Get detailed geocoding for a specific address or addresses in an array
  // (note: handles minor misspellings, in this case Leetsdale is misspelled)
  const r = gc.detailMultiple([address1, address2])
  // Inside each returned entry:
  // ina: input address:           "4600 Letsdale Dr Glendale   CO 80246"
  // fma: formatted address:       "4600 Leetsdale Dr, Glendale CO 80246" # Note how formatting and spelling was cleaned up
  // lat: latitude:                39.7084673    # Geocoded
  // lon: longitude:               -104.9326797  # Geocoded
  // rva: reverse geocode address: "4600 Leetsdale Dr, Glendale, CO 80246, USA"  # Comes from lat/lon
  // concerns:                     []            # Concerns arise when the street numbers or zip codes
  //                                             # of the formatted address or reverse geocode address don't match the input address
  return [JSON.stringify([address1, address2]), JSON.stringify(r)]
}

/**
 *  Demos the functionality of the Geocoder library.
 *
 */
function demo_geocoder_library() {
  // @ts-ignore
  Logger.log("Basic geocoding of '7800 Smith Rd Denver CO 80207': \n" + demo1())
  // @ts-ignore
  Logger.log('Reverse geocoding of 39.67829,-104.91202: \n' + demo2())
  // @ts-ignore
  Logger.log('Detailed geocoding of ["4600 Letsdale Dr Glendale   CO 80246"]: \n' + demo3())
}
