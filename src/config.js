const {PublicKey, Keypair} = require("@solana/web3.js");
const bs58 = require('bs58');
const path = require('path');
const fs = require('fs');
const { delayWithExit } = require('./delay.js')
const { main } = require('./routes.js')


/**
 * Verifies that the user is attempting to mint a valid Candy V2 NFT from the configuration file.
 * @param {object} CONFIG - The configuration object loaded from the config file.
 * @param {Keypair} payer - The user's Solana keypair used for minting.
 */
function verifyCandyAddress(CONFIG, payer) {
    try {
        const CandyID = new PublicKey(CONFIG.CandyAddress);
        console.log('Welcome '+payer.publicKey.toBase58()+'. ');
        console.log('You have set a mint amount of '+CONFIG.MintAmount+' NFT at a max price of '+CONFIG.MaxPrice+' SOL. ');
        main(CONFIG, payer, CandyID);
    } catch(error) {
        console.error('Wrong candy machine public key!')
        delayWithExit();
    }
}

/**
 * Verifies that the user has inserted valid private keys in the configuration file.
 * @param {object} CONFIG - The configuration object loaded from the config file.
 */
function verifySecretKey(CONFIG) {
    try {
        const payer = Keypair.fromSecretKey(bs58.decode(CONFIG.PrivateKey));
        verifyCandyAddress(CONFIG, payer);
    } catch (error) {
        console.error('Wrong private keys!')
        delayWithExit();
    }
}

/**
 * Verifies that the configuration file is valid and loads it.
 */
function verifyConfig() {
    try {
        const configPath = path.join(process.cwd(), './config.json');
        var CONFIG = fs.readFileSync(configPath);
        var CONFIG = JSON.parse(CONFIG.toString());
        verifySecretKey(CONFIG);
    } catch (error) {
        console.error('Wrong path or wrong name for the config.json!')
        delayWithExit();
    }
}

module.exports = { verifyConfig, verifySecretKey, verifyCandyAddress };