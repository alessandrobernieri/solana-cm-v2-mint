const {PublicKey, Connection} = require("@solana/web3.js");
const {MintLayout} = require("@solana/spl-token");
const anchor = require("@project-serum/anchor")
var inquirer = require('inquirer');
var moment = require('moment');
const { delayWithExit } = require('./delay.js')
const { printCandy } = require('./candy.js')
const { mint, mintWithToken } = require('./mint.js')
const { candyProgram } = require('./constants.js')

const questions = [
    {
        type: 'list',
        name: 'command',
        message: 'What do you want to do?',
        choices: [
            'Show info',
            'Mint',
            'Mint with token',
            'Exit',
        ],
    },
]

/**
 * Main function responsible for executing the Candy V2 minting bot.
 *
 * @param {object} CONFIG - The configuration object loaded from the config file.
 * @param {Keypair} payer - The user's Solana keypair used for minting.
 * @param {PublicKey} CandyID - The public key of the Candy Machine.
 */
async function main(CONFIG, payer, CandyID) {
    let connection = new Connection(CONFIG.APIEndpoint);

    console.log('Successfully Authenticated, balance: '+(await connection.getBalance(payer.publicKey))*0.000000001+' SOL.')
    const provider = new anchor.Provider(connection, new anchor.Wallet(payer), { preflightCommitment: 'recent', });
    const idl = await anchor.Program.fetchIdl(candyProgram, provider);
    const program = new anchor.Program(idl, candyProgram, provider);
    try {
        const state = await program.account.candyMachine.fetch(CandyID);
        const candyWallet = new PublicKey(state.wallet);
        const candyCreator = await PublicKey.findProgramAddress(
            [Buffer.from('candy_machine'), (CandyID).toBuffer()],
            candyProgram,
        );
        let lamports_rent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
        
        await inquirer.prompt(questions).then((answers) => {
            if (answers.command == "Show info")
            {
                (async () => {
                    await printCandy(state);
                })();
                main(CONFIG, payer, CandyID);
            };
            if (answers.command == "Mint")
            {
                (async () => {
                    var now = moment();
                    var candy = moment.unix(state.data.goLiveDate);
                    if (now.isBefore(candy))
                    {
                        var duration = moment.duration(candy.diff(now));
                        console.log('Candy is not live yet, waiting '+duration+' milliseconds..');
                        i = 0;
                        await new Promise(resolve => setTimeout(resolve, duration-500));
                        start = moment();
                        if (state.data.price*0.000000001 > CONFIG.MaxPrice)
                        {
                            console.log('Candy price is higher than max price.');
                        }
                        else
                        {
                            while(i<(CONFIG.MintAmount))
                            {
                                await mint(payer, CandyID,candyCreator,state,start,connection,program,candyWallet,lamports_rent);
                                i=i+1;
                            }
                        }
                    }
                    else
                    {
                        i = 0;
                        var start = moment();
                        if (state.data.price*0.000000001 > CONFIG.MaxPrice)
                        {
                            console.log('Candy price is higher than max price.');
                        }
                        else
                        {
                            while(i<(CONFIG.MintAmount))
                            {
                                await mint(payer, CandyID, candyCreator,state,start,connection,program,candyWallet,lamports_rent);
                                i=i+1;
                            }
                        }
                    }
                })();
            };
            if (answers.command == "Mint with token")
            {
                (async () => {
                    i = 0;
                    var start = moment();
                    if (state.data.price*0.000000001 > CONFIG.MaxPrice)
                    {
                        console.log('Candy price is higher than max price.');
                    }
                    else
                    {
                        while(i<(CONFIG.MintAmount))
                        {
                            await mintWithToken(payer, CandyID, candyCreator,state,start,connection,program,candyWallet,lamports_rent);
                            i=i+1;
                        }
                    }
                })();
            };
            if (answers.command == "Exit")
            {
                console.log('Goodbye.')
                delayWithExit();
            };
        });
    }catch(err) {
        console.log(err)
        console.error('This is not a candyv2 anymore. Change the candy address to a valid one!')
        delayWithExit();
    }
}

module.exports = { main };