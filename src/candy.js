/**
 * Prints the current state of the Candy Machine specified in the configuration.
 *
 * @param {object} state - The state object of the Candy Machine.
 */
function printCandy(state) {
    if (state.data.whitelistMintSettings) {
        console.log('You need this token to mint presale: '+state.data.whitelistMintSettings.mint+'. ');
    }
    console.log('Price: '+state.data.price*0.000000001+' SOL. ');
    var a = new Date(state.data.goLiveDate * 1000);
    var year = a.getFullYear();
    var month = a.getMonth()+1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = "0" + a.getMinutes();
    var sec = "0" + a.getSeconds();
    var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec ;    
    console.log('Public time: '+time+'. ');
    var total = state.data.itemsAvailable.toNumber() - state.itemsRedeemed.toNumber();
    console.log('NFT available: '+total+'/'+state.data.itemsAvailable+'. ');
}

module.exports = { printCandy };