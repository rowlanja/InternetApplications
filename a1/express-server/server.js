// server.js
const express = require('express');
const request = require('request')
const app = express();
const port = 4000;
const api_helper = require('./API_helper');
const API_KEY = '836d523e658e579b90a703170017946d';
const endpointForecastFore = 'http://api.openweathermap.org/data/2.5/forecast?q=';
const endpointForecastPost = '&mode=json&units=metric&appid='+API_KEY;
const endpointPollutionFore = 'http://api.openweathermap.org/data/2.5/air_pollution?';
const endpointPollutionPost = '&mode=json&units=metric&appid='+API_KEY;
var cors = require('cors');

app.use(cors({ origin: true, credentials: true }));

function make_API_call (url){
    return new Promise((resolve, reject) => {
        request(url, { json: true }, (err, res, body) => {
          if (err) reject(err)
          resolve(body)
        });
    })
}


app.get('/getAPIResponse/:id', (req, res, next) => {
    var location = req.params.id;
    var fullEndpoint = endpointForecastFore + location + endpointForecastPost;
    console.log('forecast location : ', location);
    console.log('forecast full endpoint : ', fullEndpoint);

    api_helper.make_API_call(fullEndpoint)
    .then(response => {
        console.log(`Success! sending response : `, response);
        res.json(response)
    })
    .catch(error => {
        console.log(`Failure! sending error`);
        res.send(error)
    })
})

app.get('/getAirPollution/lat/:lat/lon/:lon', (req, res, next) => {
    var lat = req.params.lat;
    var lon = req.params.lon;
    var fullEndpoint = endpointPollutionFore + 'lat='+lat+'&lon='+lon + endpointPollutionPost;
    console.log('Pollution location : ', lat,lon);
    console.log('Pollution full endpoint : ', fullEndpoint);

    api_helper.make_API_call(fullEndpoint)
    .then(response => {
        console.log(`Success! sending response : `, response);
        res.json(response)
    })
    .catch(error => {
        console.log(`Failure! sending error`);
        res.send(error)
    })
})



app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});