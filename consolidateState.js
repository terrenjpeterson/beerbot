var aws = require('aws-sdk');

var beerDataBucket = 'beer-skill';

console.log('consolidating state data');

exports.handler = (event, context, callback) => {

    var s3 = new aws.S3();

    var getParams = {Bucket : beerDataBucket,
                    Key : 'stateData/Virginia.json'};

    s3.getObject(getParams, function(err, data) {
        if(err)
            console.log('Error getting brewery category data : ' + err);
        else {
            console.log('Retreived state data');
            var stateBreweryArray = eval('(' + data.Body + ')');

            // now save slot data

            var postData = '';
            var slotArray = [];
            var uniqueBrewery = true;

            for (i = 0; i < stateBreweryArray.length; i++) {
                // check to make sure that the name is unique before inserting
                for (j = 0; j < slotArray.length; j++ ) {
                    //console.log('does' + stateBreweryArray[i].name + 'match' + slotArray[j]);
                    if (stateBreweryArray[i].name == slotArray[j]) {
                        uniqueBrewery = false;
                    }
                }
                if (uniqueBrewery) {
                    slotArray.push(stateBreweryArray[i].name);
                    postData = postData + stateBreweryArray[i].name + '\n';
                }
                uniqueBrewery = true;
            }
            
            console.log(postData);
            
            // create new slot data file
            var s3 = new aws.S3();

            var putParams = {Bucket : beerDataBucket,
                            Key : 'slotData/breweries.txt',
                            Body: postData};

            // save array to S3 bucket
                
            s3.putObject(putParams, function(err, data) {
                if(err)
                    console.log('Error posting brewery data : ' + err);
                else {
                    console.log('Success');
                }
            });    
        }
    });

    callback(null, 'Processing Complete');
};
