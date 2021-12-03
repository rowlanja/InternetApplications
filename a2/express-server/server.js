const AWS = require('aws-sdk');
const axios = require('axios');
const http = require('http');
const express = require('express');
var fs = require("fs");
var cors = require('cors');
const host = 'localhost';
const port = 4000;
const accessKey = "";
const secAccessKey = "";
const app = express();
app.use(cors({ origin: true, credentials: true }));

var create_params = {
    TableName : "Movies",
    KeySchema: [
        { AttributeName: "year", KeyType: "HASH"},
        { AttributeName: "title", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
        { AttributeName: "year", AttributeType: "N" },
        { AttributeName: "title", AttributeType: "S" },         
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
}

//params
var delete_params = {
    TableName: "Movies"
};

// AWS UPLOADING CREDENTIALS
AWS.config.update({
    region: 'eu-west-1',
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secAccessKey
  }
});

const download_params = {
  Bucket: "csu44000assignment220", 
  Key: "moviedata.json"
};

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});
dynamodb = new AWS.DynamoDB({retryDelayOptions: {base: 200}});
var DynamoDB = new AWS.DynamoDB.DocumentClient();

// UPLOADING SECTION

// call DDB to create the bucket
function createDDBTable(){
    //ddm create table
    dynamodb.createTable(create_params, function(err, data) {
        if (err) {
            console.log("Unable to create table: ", err);
        } else {
            console.log("Created table: ", JSON.stringify(data));
        }
    });
}

function deleteDDBTable(){
    //ddb delete table
    dynamodb.deleteTable(delete_params, function(err, data) {
      if (err && err.code === 'ResourceNotFoundException') {
        console.log("Error: Table not found");
      } else if (err && err.code === 'ResourceInUseException') {
        console.log("Error: Table in use");
      } else {
        console.log("Success", data);
      }
    });
}

function putDDB(movie){
    var put_params = {
        region: 'eu-west-1',
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secAccessKey
        },
        TableName:'Movies',
        Item:{
            "year": movie['year'],
            "title": movie['title'],
            "rating": movie['rating'],
            "rank":movie['rank']
        }
    };
    DynamoDB.put(put_params, function(err, data) {
        if (err) {
            console.log("Error : ", err);
        } 
    });
}

function putJsonDDB(movies){
    movies.forEach(function(movie) {
        putDDB(movie);
    });
}


//DOWNLOADING SECTION

async function getS3(opts) { 
    const data = await s3.getObject(opts).promise();
    let resp = '';
    resp += data.Body;
    resp = JSON.parse(resp);
    return resp;
}

app.get('/CreateDatabase', (req, res, next) => {
    // create DynamoDB promise
    (async () => {
        try {
            createDDBTable();
            var resp = await getS3(download_params);
            putJsonDDB(resp);
        } catch (error) {
            console.log(error);
        }
    })();
})

app.get('/DestroyDatabase', (req, res, next) => {
    console.log('destroying');
    (async () => {
        try {
            deleteDDBTable();
        } catch (error) {
            console.log(error);
        }
    })();
})

app.get('/QueryDatabase/:movie/:year/:review', (req, res, next) => {
    var movie = req.params.movie;
    var year = req.params.year;
    var review = req.params.review;
    var put_params = {
        region: 'eu-west-1',
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secAccessKey
        },
        TableName:'Movies',
        KeyConditionExpression: "#yr = :yyyy",
        ExpressionAttributeNames:{
            "#yr": "year"
        },
        ExpressionAttributeValues: {
            ":yyyy": 1985
        }
    };
    DynamoDB.query(put_params, function(err, data) {
        if(data){
            console.log("Data : ",data)
        }
        if (err) {
            console.log("Error : ", err);
        } 
    });
})


app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});