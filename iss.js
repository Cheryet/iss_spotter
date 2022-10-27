const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const fetchMyIP = (callback) => {
  request('https://api.ipify.org?format=json', (error, response, body) => {

    if (error) {
      callback(error, null); //Returns error in callback
      return;
    }

    //Checks status code
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const myIP = JSON.parse(body); //converts to object
    callback(null, myIP.ip); //returns IP as a string to callback

  });
};

/**
 * Makes a single API request to retrieve the lat/lng for a given IPv4 address.
 * Input:
 *   - The ip (ipv4) address (string)
 *   - A callback (to pass back an error or the lat/lng object)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The lat and lng as an object (null if error). Example:
 *     { latitude: '49.27670', longitude: '-123.13000' }
 */

const fetchCoordsByIP = (ip, callback) => {
  request('http://ipwho.is/' + ip, (error, responce, body) => {

    if (error) {
      callback(error, null); //Returns error in callback
      return;
    }

    const toObj = JSON.parse(body); //Converts sting to Object

    if (!toObj.success) {
      const message = `Success status was ${toObj.success}. Server message says: ${toObj.message} when fetching for IP ${toObj.ip}`;
      callback(Error(message), null);
      return;
    }

    const latLng = {
      latitude: toObj.latitude.toString(), //Grabs lat and long from JSON object
      longitude: toObj.longitude.toString()//     and converts to string
    };

    callback(null, latLng);

  });
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */

const fetchISSFlyOverTimes = (coords, callback) => {
  request('https://iss-flyover.herokuapp.com/json/?lat=' + coords.latitude + '&lon=' + coords.longitude, (error, response, body) => {


    if (error) {
      callback(error, null); //Returns error in callback
      return;
    }

    //Checks status code
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
  

    const toObj = JSON.parse(body);
    
    if (toObj.message !== 'success') {
      const message2 = `Invaild: Message = ${toObj.message}`;
      callback(Error(message2), null);
      return;
    }

    callback(null, toObj.response);

  });
};


/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */

const nextISSTimesForMyLocation = (callback) => {

  fetchMyIP((error, data) => {
    
    if (error) {
      return callback(error, null);
    }

    const IP = data;
    fetchCoordsByIP(IP, (error, data) => {

      if (error) {
        return callback(error, null);
      }

      const latLng = data;
      fetchISSFlyOverTimes(latLng, (error, data) => {

        if (error) {
          return callback(error, null);
        }

        const ISSFlyOverTimes = data;
        callback(null, ISSFlyOverTimes);

      
      });
    });
  });
};
  

module.exports = { nextISSTimesForMyLocation };