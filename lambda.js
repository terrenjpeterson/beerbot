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
            {"cityName":"Myrtle Beach", "stateName":"South Carolina", "breweryData":"locationsMyrtleBeach.json"},
            {"cityName":"New York City", "stateName":"New York", "breweryData":"locationsNewYorkCity.json"},
            {"cityName":"Houston", "stateName":"Texas", "breweryData":"locationsHouston.json"},
            {"cityName":"Austin", "stateName":"Texas", "breweryData":"locationsAustin.json"},
            {"cityName":"Dallas", "stateName":"Texas", "breweryData":"locationsDallas.json"},
            {"cityName":"San Antonio", "stateName":"Texas", "breweryData":"locationsSanAntonio.json"},
            {"cityName":"Los Angeles", "stateName":"California", "breweryData":"locationsLosAngeles.json"},
            {"cityName":"San Francisco", "stateName":"California", "breweryData":"locationsSanFrancisco.json"},
            {"cityName":"San Jose", "stateName":"California", "breweryData":"locationsSanJose.json"},
            {"cityName":"Fort Worth", "stateName":"Texas", "breweryData":"locationsFortWorth.json"},
            {"cityName":"Jacksonville", "stateName":"Florida", "breweryData":"locationsJacksonville.json"},
            {"cityName":"Indianapolis", "stateName":"Indiana", "breweryData":"locationsIndianapolis.json"},
            {"cityName":"Columbus", "stateName":"Ohio", "breweryData":"locationsColumbus.json"},
            {"cityName":"El Paso", "stateName":"Texas", "breweryData":"locationsElPaso.json"},
            {"cityName":"Detroit", "stateName":"Michigan", "breweryData":"locationsDetroit.json"},
            {"cityName":"Washington", "stateName":"District of Columbia", "breweryData":"locationsWashingtonDC.json"},
            {"cityName":"Boston", "stateName":"Massachusetts", "breweryData":"locationsBoston.json"},
            {"cityName":"Memphis", "stateName":"Tennessee", "breweryData":"locationsMemphis.json"},
            {"cityName":"Nashville", "stateName":"Tennessee", "breweryData":"locaitonsNashville.json"},
            {"cityName":"Oklahoma City", "stateName":"Oklahoma", "breweryData":"locationsOklahomaCity.json"},
            {"cityName":"Las Vegas", "stateName":"Nevada", "breweryData":"locationsLasVegas.json"},
            {"cityName":"Louisville", "stateName":"Kentucky", "breweryData":"locationsLouisville.json"},
            {"cityName":"Milwaukee", "stateName":"Wisconsin", "breweryData":"locationsMilwaukee.json"},
            {"cityName":"Albuquerque", "stateName":"New Mexico", "breweryData":"locationsAlbuquerque.json"},
            {"cityName":"Tuscon", "stateName":"Arizona", "breweryData":"locationsTucson.json"},
            {"cityName":"Fresno", "stateName":"California", "breweryData":"locationsFresno.json"},
            {"cityName":"Sacramento", "stateName":"California", "breweryData":"locationsSacramento.json"},
            {"cityName":"Kansas City", "stateName":"Kansas", "breweryData":"locationsKansasCity.json"},
            {"cityName":"Long Beach", "stateName":"California", "breweryData":"locationsLongBeach.json"},
            {"cityName":"Mesa", "stateName":"Arizona", "breweryData":"locationsMesa.json"},
            {"cityName":"Atlanta", "stateName":"Georgia", "breweryData":"locationsAtlanta.json"},
            {"cityName":"Colorado Springs", "stateName":"Colorado", "breweryData":"locationsColoradoSprings.json"},
            {"cityName":"Virginia Beach", "stateName":"Virginia", "breweryData":"locationsVirginiaBeach.json"},
            {"cityName":"Omaha", "stateName":"Nebraska", "breweryData":"locationsOmaha.json"},
            {"cityName":"Miami", "stateName":"Florida", "breweryData":"locationsMiami.json"},
            {"cityName":"Oakland", "stateName":"California", "breweryData":"locationsOakland.json"},
            {"cityName":"Minneapolis", "stateName":"Minnesota", "breweryData":"locationsMinneapolis.json"},
            {"cityName":"Tulsa", "stateName":"Oklahoma", "breweryData":"locationsTulsa.json"},
            {"cityName":"Wichita", "stateName":"Kansas", "breweryData":"locationsWichita.json"},
            {"cityName":"New Orleans", "stateName":"Louisianna", "breweryData":"locationsNewOrleans.json"},
            {"cityName":"Arlington", "stateName":"Texas", "breweryData":"locationsArlington.json"},
            {"cityName":"Chicago", "stateName":"Illinois", "breweryData":"locationsChicago.json"},
            {"cityName":"Seattle", "stateName":"Washington", "breweryData":"locationsSeattle.json"},
            {"cityName":"San Diego", "stateName":"California", "breweryData":"locationsSanDiego.json"},
            {"cityName":"Portland", "stateName":"Oregon", "breweryData":"locationsPortland.json"},
            {"cityName":"Denver", "stateName":"Colorado", "breweryData":"locationsDenver.json"}
];

var beerCategories = [
            { "id":1, "name":"British Ales"},
            { "id":2, "name":"Irish Ales"},
            { "id":3, "name":"North American Ales"},
            { "id":4, "name":"German Ales"},
            { "id":5, "name":"Belgian and French Ales"},
            { "id":6, "name":"International Ale Styles"},
            { "id":7, "name":"European-Germanic Lager"},
            { "id":8, "name":"North American Lager"},
            { "id":9, "name":"Other Lager"},
            { "id":10, "name":"International Styles"},
            { "id":11, "name":"Hybrid Beer"},
            { "id":12, "name":"Mead, Cider, and Perry"},
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
        "Find me a beer!  This will walk you through available types that I have information on. " +
        "You can also say, List for me the microbreweries in Richmond, Virginia.";
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
        "If you are trying to figure out a type of beer to try out, start by saying " +
        "Find me a beer! " +
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

    var speechOutput = "Here are the following categories of beer that we track styles for. Let's " +
        "start by going through them to see if you hear one that you like. ";
    var cardOutput = "Beer Styles:\n";

    for (i = 0; i < beerCategories.length; i++) {
        speechOutput = speechOutput + beerCategories[i].name + ", ";
        cardOutput = cardOutput + beerCategories[i].name + "\n";
    }

    speechOutput = speechOutput + ". Which category sounded interesting as I have more details? Just say something like " +
        "List beer styles for North American Ales.";

    var repromptText = "If you would like to hear more information about a particular category of beer " +
        "please say something like Describe beer styles for North American Ales";

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
        
}

// This provides styles of beers for a particular category

function getBeerStyles(intent, session, callback) {
    var cardTitle = "Beer Bot - Beer Categories";
    var sessionAttributes = {};
    var shouldEndSession = false;

    console.log("Get Beer Categories Invoked for :" + intent.slots.Category.value);

    var beerCategory = intent.slots.Category.value;
    var speechOutput = "";
    var cardOutput = "";
    var validBeerCategory = false;
    var lookupBeerCategory = 0;

    // first verify that the category is a valid one
    for (i = 0; i < beerCategories.length; i++) {
        console.log("category : " + i + " " + beerCategories[i].name);
        if (beerCategory.toLowerCase() == beerCategories[i].name.toLowerCase()) {
            lookupBeerCategory = beerCategories[i].id;
            validBeerCategory = true;
        }
    }

    // if the category is valid, then pull the index of beers and parse out just those matching the category 
    if (validBeerCategory) {
        var s3 = new aws.S3();

        var getParams = {Bucket : beerDataBucket,
                         Key : 'beerStyles.json'};

        s3.getObject(getParams, function(err, data) {
            if(err)
                console.log('Error getting brewery category data : ' + err);
            else {
                var returnData = eval('(' + data.Body + ')');
                var styleArray = returnData.data;
                
                var matchExample = "";
                var beerStyles = [];

                speechOutput = "Here are the styles of beers under the " + beerCategory + " category. ";
                cardOutput = "Styles for Beer Category - " + beerCategory + "\n";

                for (i = 0; i < styleArray.length; i++) {
                    if (styleArray[i].categoryId == lookupBeerCategory) {
                        
                        cardOutput = cardOutput + styleArray[i].shortName + "\n";
                        speechOutput = speechOutput + styleArray[i].shortName + ", ";
                        matchExample = styleArray[i].shortName;

                        // this will be saved off for the session
                        var style = {};
                            style.name = styleArray[i].shortName;
                            style.id = i;
                            style.description = styleArray[i].description;
                            
                        beerStyles.push(style);
                    }
                }

                // saving off the beer styles into session data in case needed in next utterance

                var savedSession = {};
                    savedSession.categoryId = lookupBeerCategory;
                    savedSession.detailType = "CategoryData";
                    savedSession.beerStyles = beerStyles;
                    
                var savedData = {};
                    savedData.data = savedSession;
                        
                sessionAttributes = savedData;

                speechOutput = speechOutput + " If you would like specific details about one of these types of beers, " +
                    "please say something like Tell me more about " + matchExample + ".";

                var repromptText = "Would you like details about another category?  If so, please ask for it now.";

                callback(sessionAttributes,
                     buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
            }
        });
        
    } else {
        cardOutput = "Beer Category : " + beerCategory + " not found";

        var repromptText = "Sorry, " + beerCategory + " was not found. Would you like to try searching for another? " +
            "If so, say something like List styles for Old English Ales.";

        callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
    }
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
                        //    brewery.desc = breweryArray[i].brewery.description;
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
        sessionAttributes = session.attributes;
        if (session.attributes.data.detailType = "CategoryData") {
            // provide detail around a particular category of beer
            console.log("detail: " + intent.slots.Brewery.value);
            
            var beerStyleArray = session.attributes.data.beerStyles;
            var matchStyle = false;
            
            for (i = 0; i < beerStyleArray.length; i++) {
                if (intent.slots.Brewery.value.toLowerCase() == beerStyleArray[i].name.toLowerCase()) {
                    speechOutput = beerStyleArray[i].description;
                    cardOutput = "Beer Style\n" + beerStyleArray[i].description;
                    matchStyle = true;
                }
            }
            
            if (matchStyle === false) {
                speechOutput = "I'm sorry, I didn't see a beer style matching " + intent.slots.Brewery.value;
                cardOutput = "Can't match " + intent.slots.Brewery.value;
            } else {
                speechOutput = speechOutput + " If you would like details on another style, please ask now.";
                repromptText = "For more details on other beer styles, ask now or you can ask about other " +
                    "beer categories.";
            }
            
        } else {
            // provide detail around breweries
            var breweryDesc = "";
            var breweryName = "";
            var detailBreweryInfoAvail = false;
        
            for (i = 0; i < session.attributes.localBreweries.length; i++) {
                breweryName = session.attributes.localBreweries[i].name;
                breweryDesc = session.attributes.localBreweries[i].desc;
        
                if (breweryName.toLowerCase() == intent.slots.Brewery.value.toLowerCase()) {
                    detailBreweryInfoAvail = true;
                    speechOutput = speechOutput + breweryName + " " + breweryDesc + ", ";
                    cardOutput = cardOutput + "Brewery Name: " + breweryName + "\n" +
                        "Detail: " + breweryDesc + "\n";
                };
            }

            console.log("build response");
        
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
