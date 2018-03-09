var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());


// Welcome Dialog
var MainOptions = {
    Weather: 'main_options_weather',
    Support: 'main_options_talk_to_support'
};
// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
	if (localizedRegex(session, [MainOptions.Weather]).test(session.message.text)) {
        // go to weather
        session.send("You said: %s", session.message.text);
        return session.beginDialog('weather:/');
    }

      var welcomeCard = new builder.HeroCard(session)
        .title('welcome_title')
        .subtitle('welcome_subtitle')
        .images([
            new builder.CardImage(session)
                .url('https://placeholdit.imgix.net/~text?txtsize=56&txt=Contoso%20Flowers&w=640&h=330')
                
        ])
        .buttons([
            builder.CardAction.imBack(session, session.gettext(MainOptions.Weather), MainOptions.Weather),
            builder.CardAction.imBack(session, session.gettext(MainOptions.Support), MainOptions.Support)
        ]);

    session.send(new builder.Message(session)
        .addAttachment(welcomeCard));
    
});

// Enable Conversation Data persistence
bot.set('persistConversationData', true);


// Set default locale
bot.set('localizerSettings', {
    botLocalePath: './locale',
    defaultLocale: 'en'
});



// Sub-Dialogs
bot.library(require('./dialogs/weather').createLibrary());


// Cache of localized regex to match selection from main options
var LocalizedRegexCache = {};
function localizedRegex(session, localeKeys) {
    var locale = session.preferredLocale();
    var cacheKey = locale + ":" + localeKeys.join('|');
    if (LocalizedRegexCache.hasOwnProperty(cacheKey)) {
        return LocalizedRegexCache[cacheKey];
    }

    var localizedStrings = localeKeys.map(function (key) { return session.localizer.gettext(locale, key); });
    var regex = new RegExp('^(' + localizedStrings.join('|') + ')', 'i');
    LocalizedRegexCache[cacheKey] = regex;
    return regex;
}
