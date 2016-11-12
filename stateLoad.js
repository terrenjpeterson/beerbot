var aws = require('aws-sdk');

const https = require('https');

console.log('begin processing');

/**
 * This uses the BreweryDB API to gather all of the brewery information for a particular state
 * then load it into an object in a S3 bucket
 */
exports.handler = (event, context, callback) => {
    
    var APIurl = 'https://api.brewerydb.com/v2/locations/';
    var region = 'Maryland';

    var APIkey = 'xxx';

    var breweryCatalog = [];
    var morePages = true;
    var pageNum = 1;
    var totalPages = 2;

    while (pageNum < totalPages + 1) {
        page = pageNum.toString();
        console.log('getting page #' + page);
        pageNum += 1;
        https.get(APIurl + '?key=' + APIkey + '&isClosed=N&region=' + region + '&p=' + page + '&format=json', (res) => {
            console.log('API Call to Brewery DB HTTP Code: ', res.statusCode);

            var beerData = "";

            res.on('data', (d) => {
                beerData += d;
            });

            // this is the logic that gets executed once a successful API call is completed
            res.on('end', (d) => {
                // now process data returned from the API call

                returnData = eval('(' + beerData.toString('utf8') + ')');
                        
                if(res.statusCode == 200) {
                    beerArray = returnData.data;
                    console.log('total pages: ' + returnData.numberOfPages);
                    
                    // first make sure that beer data returned in the array
                            
                    if (beerArray !== null) {
                        console.log("length of page: " + beerArray.length);
                        for (i = 0; i < beerArray.length; i++) {
                        var brewery = {};

                            brewery.breweryId = beerArray[i].breweryId;
                            brewery.name = beerArray[i].brewery.name;
                            brewery.city = beerArray[i].locality;
                            brewery.website = beerArray[i].website;
                            brewery.state = region;

                            breweryCatalog.push(brewery);
                        }
                    }
                    
                    var postData = JSON.stringify(breweryCatalog);

                    var s3 = new aws.S3();

                    var beerDataBucket = 'beer-skill';

                    var putParams = {Bucket : beerDataBucket,
                                    Key : 'stateData/' + region + '.json',
                                    Body: postData};

                    // save array to S3 bucket
            
                    s3.putObject(putParams, function(err, data) {
                        if(err)
                            console.log('Error getting history data : ' + err);
                        else {
                            console.log('Success');
                        }
                    });
                    
                    //console.log(breweryCatalog);
                }
            }).on('error', (e) => {
                console.error(e);
            });
        });
    }
};
