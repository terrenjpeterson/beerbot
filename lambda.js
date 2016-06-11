/**
 * This skill provides details about beers and microbreweries across the US
 */

var aws = require('aws-sdk');

var breweryDetailAvail = [
            {"cityName":"Richmond", "stateName":"Virginia", "breweryData":"locationsRichmond.json"},
            {"cityName":"Alexandria", "stateName":"Virginia", "breweryData":"locationsAlexandria.json"},
            {"cityName":"Charleston", "stateName":"South Carolina", "breweryData":"locationsCharleston.json"},
            {"cityName":"Philadelphia", "stateName":"Pennsylvania", "breweryData":"locationsPhiladelphia.json"},
            {"cityName":"Baltimore", "stateName":"Maryland", "breweryData":"locationsBaltimore.json"},
            {"cityName":"Cary", "stateName":"North Carolina", "breweryData":"locationsCary.json"}, 
            {"cityName":"Charlotte", "stateName":"North Carolina", "breweryData":"locationsCharlotte.json"},            
            {"cityName":"Charlottesville", "stateName":"Virginia", "breweryData":"locationsCharlottesville.json"},
            {"cityName":"McLean", "stateName":"Virginia", "breweryData":"locationsMcLean.json"},
            {"cityName":"Myrtle Beach", "stateName":"South Carolina", "breweryData":"locationsMyrtleBeach.json"}
];

var beerCategories = [
            { "id":1, "name":"British Origin Ales"},
            { "id":2, "name":"Irish Origin Ales"},
            { "id":3, "name":"North American Origin Ales"},
            { "id":4, "name":"German Origin Ales"},
            { "id":5, "name":"Belgian And French Origin Ales"},
            { "id":6, "name":"International Ale Styles"},
            { "id":7, "name":"European-germanic Lager"},
            { "id":8, "name":"North American Lager"},
            { "id":9, "name":"Other Lager"},
            { "id":10, "name":"International Styles"},
            { "id":11, "name":"Hybrid Beer"},
            { "id":12, "name":"Mead, Cider, & Perry"},
            { "id":13, "name":"Other Origin"},
            { "id":14, "name":"Malternative Beverages"},
            { "id":15, "name":"All Others"}
];

// location of the bucket used to manage data
var beerDataBucket = 'beer-skill';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * This validates that the applicationId matches what is provided by Amazon.
         */
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.e14641d9-241d-4311-bc03-e897eb882328") {
             context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill. This drives
 * the main logic for the function.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to the individual skill handlers

    if ("ListAvailableCities" === intentName) {
        getCityNames(intent, session, callback);
    } else if ("ListBeerCategories" === intentName) {
        getBeerCategories(intent, session, callback);
    } else if ("ListBreweriesForCity" == intentName) {
        getBreweriesByCity(intent, session, callback);
    } else if ("GetBeerStyles" === intentName) {
        getBeerStyles(intent, session, callback);
    } else if ("GetMoreDetail" === intentName) {
        getMoreDetail(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getHelpResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

// --------------- Base Functions that are invoked based on standard utterances -----------------------

// this is the function that gets called to format the response to the user when they first boot the app

function getWelcomeResponse(callback) {
    var sessionAttributes = {};
    var shouldEndSession = false;
    var cardTitle = "Welcome to Beer Bot";

    var speechOutput = "Welcome to the Beer Bot, the best source for information " +
        "related to microbreweries and craft beers.  Please begin by saying something like " +
        "List Beer Categories, or List for me the microbreweries in Richmond, Virginia.";
    var repromptText = "Please tell me how I can help you by saying phrases like, " +
        "list breweries in Richmond, Virginia.";

    console.log('speech output : ' + speechOutput);

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, speechOutput, repromptText, shouldEndSession));

}

// this is the function that gets called to format the response to the user when they ask for help
function getHelpResponse(callback) {
    var sessionAttributes = {};
    var cardTitle = "Help";
    // this will be what the user hears after asking for help

    var speechOutput = "The Beer bot provides information about different craft beers and who makes them. " +
        "If you are tryingn to figure out a type of beer to try out, start by saying " +
        "Which beer categories are there? " +
        "If you are trying to find a microbrewery in a particular location, say " +
        "List breweries for Richmond, Virginia.";

    // if the user still does not respond, they will be prompted with this additional information

    var repromptText = "Please tell me how I can help you by saying phrases like, " +
        "list breweries in Richmond, Virginia.";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, speechOutput, repromptText, shouldEndSession));
}

// this is the function that gets called to format the response when the user is done
function handleSessionEndRequest(callback) {
    var cardTitle = "Thanks for using Beer Bot";
    var speechOutput = "Thank you for checking in with the Beer bot. Have a nice day!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, speechOutput, null, shouldEndSession));
}

// This provides the list of different beer categories

function getBeerCategories(intent, session, callback) {
    var cardTitle = "Beer Bot - Beer Categories";
    var sessionAttributes = {};
    var shouldEndSession = false;

    console.log("Get Beer Categories Invoked");

    var speechOutput = "Here are the following categories of beer that we track styles for. ";
    var cardOutput = "Beer Styles:\n";

    for (i = 0; i < beerCategories.length; i++) {
        speechOutput = speechOutput + beerCategories[i].name + ", ";
        cardOutput = cardOutput + "\n";
    }

    var repromptText = "If you would like to hear more information about a particular category of beer " +
        "please say something like Describe beer styles for North American Origin Ales";

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
        
//                    { "id":1, "name":"British Origin Ales"},
}

// This provides styles of beers for a particular category

function getBeerStyles(intent, session, callback) {
    var cardTitle = "Beer Bot - Beer Categories";
    var sessionAttributes = {};
    var shouldEndSession = false;

    console.log("Get Beer Categories Invoked" + intent.slots.Category.value);

    var beerCategory = intent.slots.Category.value;
    var speechOutput = "";
    var cardOutput = "";
    var validBeerCategory = false;

    for (i = 0; i < beerCategories.length; i++) {
        console.log(beerCategory + " " + beerCategories[i].name);
        if (beerCategory.toLowerCase() == beerCategories[i].name.toLowerCase()) {
            console.log("found a match with category " + beerCategories[i].id);
            validBeerCategory = true;
        }
    }

    if (validBeerCategory) {
        cardOutput = "Styles for Beer Category: " + beerCategory + "\n";
    } else {
        cardOutput = "Beer Category : " + beerCategory + " not found";
    }
    
    var repromptText = "Please let me know if you would like more information about one of these beers.";

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
}

// This provides the list of city names that currently have breweries listed for

function getCityNames(intent, session, callback) {
    var cardTitle = "Beer Bot - City Names";
    var sessionAttributes = {};
    var shouldEndSession = false;

    console.log("Get City Names Invoked");

    var speechOutput = "The current locations that I have microbrewery information for are ";
    var cardOutput = "City Locations Available:\n";

    for (i = 0; i < breweryDetailAvail.length; i++) {
        speechOutput = speechOutput + breweryDetailAvail[i].cityName + ", ";
        cardOutput = cardOutput + breweryDetailAvail[i].cityName + ", " +
            breweryDetailAvail[i].stateName + ",  ";
    }

    speechOutput = speechOutput + ". If you would like the microbreweries for one of these locations " +
        "please ask for it by city name.  For example " +
        "say something like List microbreweries for Richmond, Virginia.";

    var repromptText = "These are the cities that I currently have microbrewery information on. ";

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
}

// this function provides microbrewery details about a particular US city. it is pulling the information
// from an S3 bucket which has pulled data back from the shareable brewery DB.

function getBreweriesByCity(intent, session, callback) {
    var shouldEndSession = false;
    var sessionAttributes = {};
    var speechOutput = "";
    var cardOutput = "";
    var repromptText = "";
    var cardTitle = "Brewery List by City";

    if (intent.slots.City.value) {

        requestCity = intent.slots.City.value;
        cardTitle = "Brewery information for " + requestCity;
        haveBreweryDetail = false;
        cityBreweryObject = "";

        // first check the array of cities that have brewery information for
        
        for (i = 0; i < breweryDetailAvail.length; i++) {
            
            console.log("checking : " + breweryDetailAvail[i].cityName);
            
            if (requestCity == breweryDetailAvail[i].cityName) {
                haveBreweryDetail = true;
                cityBreweryObject = breweryDetailAvail[i].breweryData;
            }
                
            if (requestCity == breweryDetailAvail[i].cityName + " " + breweryDetailAvail[i].stateName) {
                haveBreweryDetail = true;
                cityBreweryObject = breweryDetailAvail[i].breweryData;
            }
        }

        // process response depending on if detail is available
        if (haveBreweryDetail) {
        
            var s3 = new aws.S3();

            var getParams = {Bucket : beerDataBucket,
                             Key : 'breweries/' + cityBreweryObject};

            console.log('attempt to pull an object from an s3 bucket' + JSON.stringify(getParams));

            s3.getObject(getParams, function(err, data) {
                if(err)
                    console.log('Error getting brewery data : ' + err);
                else {
                    var returnData = eval('(' + data.Body + ')');
                    var breweryArray = returnData.data;

                    speechOutput = "The microbreweries in " + requestCity + " are ";
                    cardOutput = "Microbreweries:\n";

                    var localBreweries = [];
                    var localDetailBrewery = "";

                    // parse through array of breweries retrieved to get information needed
                    for (i = 0; i < breweryArray.length; i++) {
                        var breweryName = breweryArray[i].brewery.name;

                        var brewery = {};
                            brewery.name = breweryName;
                            brewery.desc = breweryArray[i].brewery.description;
                            brewery.id   = breweryArray[i].brewery.id;

                        localBreweries.push(brewery);

                        if (brewery.desc != null)
                            localDetailBrewery = breweryName;
                            
                        speechOutput = speechOutput + breweryName + ", ";
                        cardOutput = cardOutput + breweryName + "\n";
                    }
                    
                    // saving off the local breweries into session data in case needed in next utterance
                    
                    var savedData = {};
                        savedData.localBreweries = localBreweries;
                        
                    sessionAttributes = savedData;
                    
                    if (localDetailBrewery != "")
                        speechOutput = speechOutput + "If you would like more information on one of these breweries, please say " +
                            "something like More details on " + localDetailBrewery;
                    
                    repromptText = "If you would like brewery information for another city, please ask for it. " +
                        "For a complete list of cities available, say List Cities.";
                    
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
                }
            });
            
        } else {
            speechOutput = "I'm sorry I couldn't locate information for " + requestCity + ". " +
                "If you would like a complete list of cities that I do have, please say " +
                "List Cities.";
            repromptOutput = "No information was available for " + requestCity + ". " +
                "If you would like a complete list of cities that I do have, please say " +
                "List Cities.";

            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
            }
    }
}

// this function gets information about breweries from a previous list

function getMoreDetail(intent, session, callback) {
    var repromptText = "";
    var shouldEndSession = false;
    var sessionAttributes = {};
    var speechOutput = "";
    var cardOutput = "";
    var cardTitle = "Detailed Information";

    console.log("Get Detailed Information for " + intent.slots.Brewery.value);

    if (session.attributes) {

        var breweryDesc = "";
        var breweryName = "";
        var detaiBreweryInfoAvail = false;
        
        for (i = 0; i < breweryDetailAvail.length; i++) {
            breweryName = session.attributes.localBreweries[i].name;
            breweryDesc = session.attributes.localBreweries[i].desc;
        
            console.log(breweryName + " match " + intent.slots.Brewery.value);
        
            if (breweryName.toLowerCase() == intent.slots.Brewery.value.toLowerCase()) {
                detailBreweryInfoAvail = true;
                speechOutput = speechOutput + breweryName + " " + breweryDesc + ", ";
                cardOutput = cardOutput + "Brewery Name: " + breweryName + "\n" +
                    "Detail: " + breweryDesc + "\n";
            }
            
            if (detailBreweryInfoAvail === false) {
                speechOutput = "Sorry, I don't have information about " + breweryName +
                    ". If you would like information on breweries from another location " +
                    " please ask that now.";
                cardOutput = "No information available on : " + breweryName;
            }
            
            repromptText = "If you would like information on another location, please " +
                "say something like List breweries from Charleston, South Carolina.";
        }
    } else {
        speechOutput = "Please first ask for details about a particular city.";
        repromptText = "Before getting details, you will need to find information about " +
            "a particular location. Please say something like " +
            "List microbreweries for Richmond, Virginia.";
    }

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, cardInfo, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: cardInfo
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
