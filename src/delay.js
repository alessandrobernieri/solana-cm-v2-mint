

/**
 * Delays the program exit to allow the user to see errors before quitting.
 */
function delayWithExit() {
    setTimeout(function() {        
        process.exit();
    }, 20000); //
};

function delayWithNoExit() {
    setTimeout(function() {        
        process.exit();
    }, 2000000); //
};


module.exports = { delayWithExit, delayWithNoExit};