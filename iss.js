const request = require('request');

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

const IP = '98.97.161.212';
fetchCoordsByIP(IP , () => {});


module.exports = { fetchMyIP, fetchCoordsByIP };