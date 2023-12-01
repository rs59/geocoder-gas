# geocoder-gas: Simple Google Apps Script geocoding library

![tests passing](https://github.com/rs59/geocoder-gas/actions/workflows/config.yml/badge.svg)

## About

geocoder-gas is a Google Apps Script library that exposes relevant geocoding functionality in a tested, repeatable manner. It includes functions for geocoding, reverse geocoding, geocoding of arrays of value, and address quality inspection.

Special note: This repository demonstrates a complete Google Apps Script deployment pipeline (linting, automatic builds, automatic testing, automatic document generation) and offers extensible capabilities for automated deployment. Credit to [Goran Kukurin](https://medium.com/@gkukurin/about) for inspiration and clasp structure. This pipeline will be documented in future.

## Key links:

- [Live demo](https://script.google.com/macros/s/AKfycbxfLzccJWoHTXGobFMPdls39A-y_-YNFFnE115hoZ8Ec9jkdzZGjW-fPYwHS5nbH2cEWw/exec)
  
	<img width="668" alt="image" src="https://github.com/rs59/geocoder-gas/assets/97830491/2c513f6b-4b2c-4402-8a85-3ada6d246f75">

- [Source code](./src/geocoder_library.ts) (can simply be copied to your GAS project)
- [Documentation](./docs/index.html)
- [Unit tests](./src/geocoder_test.ts)
- [Demo functions](./src/geocoder_demo.ts)

## Quick start:

### Create a geocoding handler

	const gc = new Geocoder()

### Basic geocoding (transform address into lat/lon)

	const address = '7800 Smith Rd Denver CO 80207'
	const r = gc.geocode(address)

	// Returns:
	// fma: formatted address:       "7800 Smith Rd, Denver, CO 80207"  # Note: will fix minor mispellings and formatting issues
	// lat: latitude:                39.7697618    # Geocoded
	// lon: longitude:               -104.8976515  # Geocoded
	return [JSON.stringify([address]), JSON.stringify(r)]

### Reverse geocoding (transform lat/lon into address)

	const lat = '39.67829'
	const lon = '-104.91202'

	const r = gc.reverseGeocode(lat, lon) // Winchell's Donuts, lat/lon
	// Returns:
	// address:        6550 E Evans Ave, Denver CO 80224
	return [JSON.stringify([lat, lon]), JSON.stringify(r)]

### Get detailed geocoding for a specific address or addresses in an array, fixing misspellings and returning potential concerns

	address1 = '4600 Letsdale Dr Glendale   CO 80246'
	address2 = '4600 Leetsdale Dr Glendale CO 80236'

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
