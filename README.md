Beer Bot
--------

Amazon Skill providing information about microbreweries and beer selections

Folders
-------
Graphics --> this is where icons for the Alexa store are stored
deprecated --> this is where old scripts not used are saved
interaction_model --> this is where the voice functions pushed to the Alexa store are stored

Root
----
lambda.js --> this is the main runtime skill that is executed as beer bot

gatherBeerData.js --> this is the lambda function that extracts brewery information from the BreweryDB APIs
createSlot.js --> this is the lambda function that parses through the brewery array and creates the custom slots with Brewery names
