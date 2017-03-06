'use strict';

/**
 * @overview 
 * This application requests and formats weather data from a group of
 * RSS feeds for various cities in the UK.
 */

const rss = require( 'rss-parser' );

/** Defines weather-data RSS sources for each city. */
const weatherFeedEndpoints = {
    manchester: 'http://open.live.bbc.co.uk/weather/feeds/en/2643123/observations.rss',
    cardiff: 'http://open.live.bbc.co.uk/weather/feeds/en/2653822/observations.rss',
    london: 'http://open.live.bbc.co.uk/weather/feeds/en/2643743/observations.rss'
};

/**
 * Given a city identifier, gets the RSS weather data for that city.
 * @param {string} city - the city-name identifier, like "london"
 * @param {function(err, data)} callback - will be called with the error and/or
 * the results returned from the RSS request
 * @usage
 *     getWeatherForCity( 'manchester', function (err, data) {
 *         if (err) console.log( err );
 *         else doSomethingUsefulWith( data );
 *     } );
 */
function getWeatherForCity( city, callback ) {
    let endpoint = weatherFeedEndpoints[ city ];

    if ( !endpoint ) {
        callback( new Error( 'Missing or invalid city name.' ) );
    } 
    else {
        rss.parseURL( endpoint, callback );
    }
}

/**
 * Given raw input data, formats it to be displayed.
 * @param {object} inputData - Expected to have a title and an array of entries.
 * @usage
 *     getWeatherForCity( 'london', function (err, data) {
 *         if (err) console.log( err );
 *         else console.log( formatData( data ) );
 *     } );
 */
function formatData( inputData ) {
    let result = {};

    if ( inputData && inputData.feed ) {
        if ( inputData.feed.title ) {
            let title = inputData.feed.title.replace( 'BBC Weather - Observations for  ', '' );
            if ( title ) result.title = title;
        }
        // Found pubDate in RRS feed, set it to result.date
        if (inputData.feed.pubDate) {
            let pubDate = inputData.feed.pubDate
            if ( pubDate ) result.date = inputData.feed.pubDate;
        }
        
        if ( inputData.feed.entries ) {
            let entry = inputData.feed.entries[ 0 ];
            if ( entry && entry.title ) result.summary = entry.title.split( ': ' )[ 1 ];
        }
    }

    return result;
}

/**
 * @module weather-cities
 */
module.exports = function( city, callback ) {
    if (city != 'all') {
    getWeatherForCity( city, function( err, data ) {
        let result = {};

        if ( err ) {
            result = {
                error: err.toString()
            };
        } else {
            if ( !data ) {
                result = {
                    error: new Error( 'No data returned.' )
                };
            } else {
                result = formatData( data );
            }
        }

        callback( result );

    } );
    /* PseudoCode
        else 
            var allCities = [];
            for ForEach item in weatherFeedEndpoints, parse the objects return object summary and complete callback  
    */
    };
};
