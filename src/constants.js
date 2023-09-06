const { PublicKey } = require("@solana/web3.js");

/**
 * Static Solana and Candy V2 contract addresses.
 */
module.exports = {
    TOKEN_METADATA_PROGRAM_ID: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    SYSTEM_PROGRAM: new PublicKey('11111111111111111111111111111111'),
    RENT: new PublicKey('SysvarRent111111111111111111111111111111111'),
    CLOCK: new PublicKey('SysvarC1ock11111111111111111111111111111111'),
    SYSVAR: new PublicKey('Sysvar1nstructions1111111111111111111111111'),
    CIVIC: new PublicKey('gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs'),
    SYSVAR_BH: new PublicKey('SysvarRecentB1ockHashes11111111111111111111'),
    candyProgram: new PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'),
    remainingAccounts: []
}
