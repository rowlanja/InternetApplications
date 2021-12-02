const AWS = require('aws-sdk');
const axios = require('axios');

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
// Set the region & credentials
AWS.config.update({
    region: 'eu-west-1',
    credentials: {
        accessKeyId: "xxx",
        secretAccessKey: "xxx"
  }
});

const download_opts = {
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
            accessKeyId: "AKIAV43OARRYQPZQB2WF",
            secretAccessKey: "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"
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

(async () => {
  try {
    //deleteDDBTable();
    //createDDBTable();
    var resp = await getS3(download_opts);
    console.log(resp);
    //putJsonDDB(movies);
  } catch (error) {
    console.log(error);
  }
})();