var builder = require('botbuilder');

var lib = new builder.Library('weather');
lib.dialog('/', builder.DialogAction.endDialog('thank_you'));


// Export createLibrary() function
module.exports.createLibrary = function () {
    return lib.clone();
};