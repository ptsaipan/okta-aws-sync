const axios = require('axios')
const url = 'http://checkip.amazonaws.com/';
var AWS = require('aws-sdk');
var request = require('request');

let response;

exports.lambdaHandler =  (event, context) => {
    console.log('IAM event');
    console.log('Received event: ', JSON.stringify(event));
    let groupName = event.detail.requestParameters.roleName;
    console.log('Group: ', groupName);
    createOktaGroup(groupName);
};


function createOktaGroup(groupName) {
    console.log('Entering createOktaGroup');

    const groupProfile =
        {
            "profile": {
                "name": groupName,
                "description": groupName
            }
        };

    let orgName = process.env.orgURL;
    let apiKey = process.env.apiKey;

    let options = {
        url: orgName + '/api/v1/groups',
        method: 'POST',
        headers: {
            'Authorization': 'SSWS ' + apiKey,
            'content-type': 'application/json',
            'accept': 'application/json'
        },
        json: true,
        body: groupProfile
    };

    console.log(JSON.stringify(options));
    request(options, (err, response, body) => {
        if (err) {
            return console.log('error' + err);
        }
        console.log('Response Body ' + JSON.stringify(body));
    });
    console.log("Exit createOktaGroup");
}