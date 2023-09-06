const {PublicKey, Keypair, SystemProgram} = require("@solana/web3.js");
const {Token, createInitializeMintInstruction, createAssociatedTokenAccountInstruction, createMintToInstruction, MintLayout, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} = require("@solana/spl-token");
const solana = require("@solana/web3.js");
var moment = require('moment');
const { delayWithNoExit } = require('./delay.js')
const { TOKEN_METADATA_PROGRAM_ID,SYSTEM_PROGRAM,RENT,CLOCK,SYSVAR,CIVIC,SYSVAR_BH,remainingAccounts } = require('./constants.js')

/**
 * Mints an NFT from the specified Candy Machine with a simple minting process.
 *
 * @param {object} CONFIG - The configuration object loaded from the config file.
 * @param {Keypair} payer - The user's Solana keypair used for minting.
 * @param {PublicKey} CandyID - The public key of the Candy Machine.
 * @param {Array} candyCreator - An array containing the candy creator's public keys.
 * @param {moment} start - The moment when the minting process started.
 * @param {Connection} connection - The Solana connection instance.
 * @param {Program} program - The Solana program instance for the Candy Machine.
 * @param {PublicKey} candyWallet - The public key of the Candy Machine's wallet.
 * @param {number} lamports_rent - The required lamports for minting.
 */
async function mint(payer, CandyID, candyCreator,state,start,connection,program,candyWallet,lamports_rent) {
    let mint = Keypair.generate();
    const token = await PublicKey.findProgramAddress(
        [(payer.publicKey).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), (mint.publicKey).toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    const metadata = await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), (mint.publicKey).toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
    );
    const masterEdition = await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), (mint.publicKey).toBuffer(), Buffer.from('edition')],
        TOKEN_METADATA_PROGRAM_ID,
    );
    if (state.data.gatekeeper!=null)
    {
        const gatekeeper = new PublicKey(state.data.gatekeeper);
        const gatekeeperNetwork = new PublicKey(gatekeeper.gatekeeperNetwork);
        const networkToken = await PublicKey.findProgramAddress(
            [payer.publicKey.toBuffer(), Buffer.from('gateway'), [0, 0, 0, 0, 0, 0, 0, 0].toBuffer(), (gatekeeperNetwork[0]).toBuffer()],
            CIVIC,
        );
        remainingAccounts.push(
            {
                pubkey: networkToken,
                isWritable: true,
                isSigner: false,
            }
        );
        if (gatekeeper.expireOnUse==true)
        {
            const networkExpire = await PublicKey.findProgramAddress(
                [(gatekeeperNetwork[0]).toBuffer(), Buffer.from('expire')],
                CIVIC,
            );
            remainingAccounts.push(
                {
                    pubkey: CIVIC,
                    isWritable: false,
                    isSigner: false,
                },
                {
                    pubkey: networkExpire,
                    isWritable: false,
                    isSigner: false,
                }              
            );
        }
    }
    if (state.data.whitelistMintSettings!=null)
    {
        var whitelistBurnAuthority = null;
        whitelistMint = state.data.whitelistMintSettings.mint;
        mint_new = new PublicKey(whitelistMint);
        const tokenMint = await PublicKey.findProgramAddress(
            [(payer.publicKey).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), (mint_new).toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );
        remainingAccounts.push(
            {
                pubkey: tokenMint[0],
                isWritable: true,
                isSigner: false,
            }
        );
        if (state.data.whitelistMintSettings.mode=='mode.BurnEveryTime()')
        {
            whitelistBurnAuthority = Keypair.generate();
            remainingAccounts.push(
                {
                    pubkey: mint_new,
                    isWritable: true,
                    isSigner: false,
                },
                {
                    pubkey: whitelistBurnAuthority.publicKey,
                    isWritable: false,
                    isSigner: true,
                }
            );
        }
    }
    createAccount = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        lamports: lamports_rent,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID,
    });
    initMint = createInitializeMintInstruction(
        mint.publicKey,
        0,
        payer.publicKey,
        payer.publicKey,
        TOKEN_PROGRAM_ID
    ); 
    createAssToken = createAssociatedTokenAccountInstruction(
        payer.publicKey,
        token[0],
        payer.publicKey,
        mint.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )
    mintTo = createMintToInstruction(
        mint.publicKey,
        token[0],
        payer.publicKey,
        1,
        [],
        TOKEN_PROGRAM_ID
    )
    mintNft = program.transaction['mintNft'];
    const accounts = {
        candyMachine: CandyID,
        candyMachineCreator: candyCreator[0],
        payer: payer.publicKey,
        wallet: candyWallet,
        metadata: metadata[0],
        mint: mint.publicKey,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
        masterEdition: masterEdition[0],
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM,
        rent: RENT,
        clock: CLOCK,
        recentBlockhashes: SYSVAR_BH,
        instructionSysvarAccount: SYSVAR,
    };
    const mintTx = mintNft(candyCreator[1], {
        accounts: accounts, 
        remainingAccounts: remainingAccounts,
        }
    );
    const transaction = new solana.Transaction();
    transaction.add(
        createAccount,
        initMint,
        createAssToken,
        mintTo,
        mintTx,
    );
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    signers = [];
    signers.push(payer);
    signers.push(mint);

    if(whitelistBurnAuthority!=null)
    {
        transaction.sign(payer, mint, whitelistBurnAuthority);
    }
    else
    {
        transaction.sign(payer, mint);
    }

    finalTx = transaction.serialize({ verifySignatures: false });
    const transactionSignature = await connection.sendRawTransaction(
        finalTx,
        { skipPreflight: true }
    );

    var end = moment();
    var duration = moment.duration(end.diff(start));
    console.log('TX '+transactionSignature+' sent in '+duration+' ms.')
    delayWithNoExit();
}

/**
 * Same as mint, but paying with a custom spl token instead of sol.
 * Updated as q2 2022 - to revisit.
 */
async function mintWithToken(payer, CandyID, candyCreator,state,start,connection,program,candyWallet,lamports_rent) {
    let mint = Keypair.generate();
    signers = []
    instructions = []
    cleanupInstructions = []
    const token = await PublicKey.findProgramAddress(
        [(payer.publicKey).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), (mint.publicKey).toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    const metadata = await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), (mint.publicKey).toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
    );
    const masterEdition = await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), (mint.publicKey).toBuffer(), Buffer.from('edition')],
        TOKEN_METADATA_PROGRAM_ID,
    );
    if (state.data.gatekeeper!=null)
    {
        const gatekeeper = new PublicKey(state.data.gatekeeper);
        const gatekeeperNetwork = new PublicKey(gatekeeper.gatekeeperNetwork);
        const networkToken = await PublicKey.findProgramAddress(
            [payer.publicKey.toBuffer(), Buffer.from('gateway'), [0, 0, 0, 0, 0, 0, 0, 0].toBuffer(), (gatekeeperNetwork[0]).toBuffer()],
            CIVIC,
        );
        remainingAccounts.push(
            {
                pubkey: networkToken[0],
                isWritable: true,
                isSigner: false,
            }
        );
        if (gatekeeper.expireOnUse==true)
        {
            const networkExpire = await PublicKey.findProgramAddress(
                [(gatekeeperNetwork[0]).toBuffer(), Buffer.from('expire')],
                CIVIC,
            );
            remainingAccounts.push(
                {
                    pubkey: CIVIC,
                    isWritable: false,
                    isSigner: false,
                },
                {
                    pubkey: networkExpire[0],
                    isWritable: false,
                    isSigner: false,
                }              
            );
        }
    }
    if (state.data.whitelistMintSettings)
    {
        whitelistMint = new PublicKey(state.data.whitelistMintSettings.mint);
        const whitelistToken = await PublicKey.findProgramAddress(
            [(payer.publicKey).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), (whitelistMint).toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );
        
        remainingAccounts.push(
            {
                pubkey: whitelistToken[0],
                isWritable: true,
                isSigner: false,
            }
        );
        if (state.data.whitelistMintSettings.mode.burnEveryTime)
        {
            whitelistBurnAuthority = Keypair.generate();
            remainingAccounts.push(
                {
                    pubkey: whitelistMint,
                    isWritable: true,
                    isSigner: false,
                },
                {
                    pubkey: whitelistBurnAuthority.publicKey,
                    isWritable: false,
                    isSigner: true,
                }
            );
            signers.push(whitelistBurnAuthority);
            createApp = Token.createApproveInstruction(
                TOKEN_PROGRAM_ID,
                whitelistToken[0],
                whitelistBurnAuthority.publicKey,
                payer.publicKey,
                [],
                1,
            );
            cleanup = Token.createRevokeInstruction(
                TOKEN_PROGRAM_ID,
                whitelistToken[0],
                payer,
                [],
            );
        }
    }
    createAccount = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        lamports: lamports_rent,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID,
    });
    initMint = Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0,
        payer.publicKey,
        payer.publicKey,
    ); 
    createAssToken = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        token[0],
        payer.publicKey,
        payer.publicKey
    )
    mintTo = Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        token[0],
        payer.publicKey,
        [],
        1,
    )
    mintNft = program.transaction['mintNft'];
    const accounts = {
        candyMachine: CandyID,
        candyMachineCreator: candyCreator[0],
        payer: payer.publicKey,
        wallet: candyWallet,
        metadata: metadata[0],
        mint: mint.publicKey,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
        masterEdition: masterEdition[0],
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM,
        rent: RENT,
        clock: CLOCK,
        recentBlockhashes: SYSVAR_BH,
        instructionSysvarAccount: SYSVAR,
    };
    const mintTx = mintNft(candyCreator[1], {
        accounts: accounts, 
        remainingAccounts: remainingAccounts,
        }
    );
    const transaction = new solana.Transaction();
    if (state.data.whitelistMintSettings) {
        if(state.data.whitelistMintSettings.mode.burnEveryTime)
        {
            transaction.add(
                createAccount,
                initMint,
                createAssToken,
                mintTo,
                createApp,
                mintTx,
            )
        }
        else {
            transaction.add(
                createAccount,
                initMint,
                createAssToken,
                mintTo,
                mintTx,
            ); 
        }
    }
    else {
        transaction.add(
            createAccount,
            initMint,
            createAssToken,
            mintTo,
            mintTx,
        );
    }
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    if (state.data.whitelistMintSettings) {
        if(state.data.whitelistMintSettings.mode.burnEveryTime)
        {
            transaction.sign(payer, mint, whitelistBurnAuthority);
        }
        else {
            transaction.sign(payer, mint);
        }
    }
    else {
        transaction.sign(payer, mint);
    }

    signers.push(payer);
    signers.push(mint);

    finalTx = transaction.serialize({ verifySignatures: false });
    const transactionSignature = await connection.sendRawTransaction(
        finalTx,
        { skipPreflight: true }
    );

    var end = moment();
    var duration = moment.duration(end.diff(start));
    console.log('TX '+transactionSignature+' sent in '+duration+' ms.')
    delayWithNoExit();
}

module.exports = { mint, mintWithToken };