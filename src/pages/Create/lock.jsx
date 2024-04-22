import React, { useState, useEffect } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import splToken from '@solana/spl-token';
// import { Keypair, TransactionMessage, VersionedTransaction, Connection, ComputeBudgetProgram, SystemProgram, Transaction, TransactionInstruction, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';

import {
    Connection,
    Keypair,
    PublicKey,
    TransactionInstruction,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction
} from '@solana/web3.js';

async function Lock({tokenId, amount, date, persents}) {
    const connection = new Connection('https://api.devnet.solana.com/', 'confirmed');
    const LOCKER_PROGRAM = new PublicKey("4nGizfnLQnPhFM4tkEeXpSXB2iifBNfNNdX8g963DZNh");
    const { publicKey: userWalletPublicKey, sendTransaction, signTransaction, connected } = useWallet();

    const [nextIndex, setNextIndex] = useState(); 
    const [nextLockAddress,setNextLockAddress] = useState();
    const [nextLockBump, setNextLockBump] = useState();



    function getLockAuthorityAndBump() {
        return PublicKey.findProgramAddressSync([Buffer.from("authority")], LOCKER_PROGRAM);
    };

    function getTokenAccountAddressForLock({ wallet, index }) {
        const indexStorageBuffer = Buffer.alloc(4);
        indexStorageBuffer.writeUInt32LE(index);
        return PublicKey.findProgramAddressSync([
            Buffer.from("token_account"),
            wallet.toBuffer(),
            indexStorageBuffer,]
            , LOCKER_PROGRAM);
    }

    console.log(getTokenAccountAddressForLock({wallet: userWalletPublicKey, index: 1}));
  


    function getLockAddressByIndex({ wallet, index }) {

        const indexStorageBuffer = Buffer.alloc(4);
        indexStorageBuffer.writeUInt32LE(index);
        return PublicKey.findProgramAddressSync([
            wallet.toBuffer(),
            indexStorageBuffer,
        ], LOCKER_PROGRAM);
    }

    console.log(getLockAddressByIndex({wallet: userWalletPublicKey, index: 1}));



    async function findFirstEmptyLock({ wallet }) {
        let queryRangeBegin = 0;
        const queryStep = 10;
        const indexStorageBuffer = Buffer.alloc(4);

        while (true) {
            const accountsToCheck = (
                new Array(queryStep)).fill(0).map((_, i) => {

                    return getLockAddressByIndex({
                        wallet,
                        index: queryRangeBegin + i
                    });
                    
                })
            console.log('Checking accounts', accountsToCheck.map(a => a[0].toBase58()).join(', '));


            const accountInfos = await connection.getMultipleAccountsInfo(accountsToCheck.map(a => a[0]));
            console.log(accountInfos);
            for (let i = 0; i < accountInfos.length; i++) {
                const accountInfo = accountInfos[i];
                if (accountInfo === null) {
                    setNextIndex(queryRangeBegin + i);
                    setNextLockAddress(accountsToCheck[i][0]);
                    setNextLockBump(accountsToCheck[i][1]);
                    return;
                }
            }
            queryRangeBegin += queryStep;
        }

    }
    useEffect(()=> {
        if (!userWalletPublicKey){
            return;}
        findFirstEmptyLock({wallet: userWalletPublicKey})
    },
   [userWalletPublicKey])



    async function createLock({ wallet, tokenMint, ata }) {
        const [authority, authorityBump] = getLockAuthorityAndBump();
        const [nextIndex, nextLockAddress, nextLockBump] = await findFirstEmptyLock({ wallet });
        console.log('Next lock index for', wallet.publicKey.toBase58(), 'is', nextIndex, '/', nextLockAddress.toBase58(), '/', nextLockBump);

        const indexStorageBuffer = Buffer.alloc(4);
        indexStorageBuffer.writeUInt32LE(nextIndex);

        const [lockTokenAccount, lockTokenAccountBump] = getTokenAccountAddressForLock({ wallet, index: nextIndex });
        console.log('Token account for the next lock is', lockTokenAccount.toBase58(), '/', lockTokenAccountBump);

        const mintInfo = await connection.getAccountInfo(tokenMint.publicKey);

        const data = Buffer.alloc(25);
        data.writeUInt8(0, 0); // Instruction: create lock
        data.writeBigUint64LE(90_000000n, 1); // Amount
        data.writeBigUint64LE(BigInt(LOCK_DUR + Math.floor(Date.now() / 1000)), 9); // Unlock time
        data.writeUint32LE(nextIndex, 17); // Lock index
        data.writeUInt8(nextLockBump, 21); // Info account bump
        data.writeUInt8(authorityBump, 22); // Authority bump
        data.writeUInt8(lockTokenAccountBump, 23); // Authority bump
        data.writeUInt8(splToken.MintLayout.decode(mintInfo.data).decimals, 24); // Mint decimals (for extra security)

        const createLockInstruction = new TransactionInstruction({
            keys: [
                { pubkey: nextLockAddress, isSigner: false, isWritable: true },
                { pubkey: ata, isSigner: false, isWritable: true },
                { pubkey: lockTokenAccount, isSigner: false, isWritable: true },
                { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
                { pubkey: authority, isSigner: false, isWritable: false },
                { pubkey: authority /* fee info */, isSigner: false, isWritable: false },
                { pubkey: tokenMint.publicKey, isSigner: false, isWritable: false },
                { pubkey: mintInfo.owner, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ],
            programId: LOCKER_PROGRAM,
            data,
        });

        const message = new TransactionMessage({
            instructions: [createLockInstruction],
            payerKey: wallet.publicKey,
            recentBlockhash: (await connection.getLatestBlockhash('finalized')).blockhash,
        }).compileToV0Message();

        const tx = new VersionedTransaction(message);
        return tx; 

        tx.sign([wallet]);
        const signature = await connection.sendRawTransaction(tx.serialize());
        console.log('Lock created tx', signature);
        await connection.confirmTransaction(signature, 'finalized');

        const lockInfoInfo = await connection.getAccountInfo(nextLockAddress);
        const lockedTokenAccountInfo = await connection.getAccountInfo(lockTokenAccount);
        console.log('Lock is owned by', lockInfoInfo.owner.toBase58(), ' token account is owned by', lockedTokenAccountInfo.owner.toBase58());

        return nextIndex;
    }

    async function withdrawFromLockedAccount({ wallet, lockIndex, ata }) {
        const [lockAuthority, lockAuthorityBump] = getLockAuthorityAndBump();
        const [lockAccountAddress] = getLockAddressByIndex({ wallet, index: lockIndex });
        const [lockTokenAccount, lockTokenAccountBump] = getTokenAccountAddressForLock({ wallet, index: lockIndex });

        const lockedTokenAccountInfo = await connection.getAccountInfo(lockTokenAccount);
        const decodedLockedTokenAccount = splToken.AccountLayout.decode(lockedTokenAccountInfo.data);
        const tokenMint = decodedLockedTokenAccount.mint;
        const tokenAmount = decodedLockedTokenAccount.amount;
        console.log('Lock', lockAccountAddress.toBase58(), 'owns', tokenAmount, 'tokens of', tokenMint.toBase58());

        const mintInfo = await connection.getAccountInfo(tokenMint);
        const mintDecimals = splToken.MintLayout.decode(mintInfo.data).decimals;

        const data = Buffer.alloc(11);
        data.writeUInt8(1, 0); // Instruction: withdraw
        data.writeBigInt64LE(tokenAmount, 1); // Amount
        data.writeUInt8(mintDecimals, 9); // Mint decimals
        data.writeUInt8(lockAuthorityBump, 10); // Lock bump

        const withdrawInstruction = new TransactionInstruction({
            keys: [
                { pubkey: lockAccountAddress, isSigner: false, isWritable: true },
                { pubkey: lockTokenAccount, isSigner: false, isWritable: true },
                { pubkey: ata, isSigner: false, isWritable: true },
                { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
                { pubkey: lockAuthority, isSigner: false, isWritable: false },
                { pubkey: lockAuthority /* fee account in the future */, isSigner: false, isWritable: false },
                { pubkey: tokenMint, isSigner: false, isWritable: false },
                { pubkey: mintInfo.owner, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ],
            programId: LOCKER_PROGRAM,
            data,
        });

        const message = new TransactionMessage({
            instructions: [withdrawInstruction],
            payerKey: wallet.publicKey,
            recentBlockhash: (await connection.getLatestBlockhash('finalized')).blockhash,
        }).compileToV0Message();

        const tx = new VersionedTransaction(message);
        tx.sign([wallet]);
        const signature = await connection.sendRawTransaction(tx.serialize());
        console.log('Lock released tx', signature);
        await connection.confirmTransaction(signature, 'finalized');
    }

    async function initializeTokenMint({ tokenMint, wallet, program }) {
        await splToken.createMint(
            connection,
            wallet,
            wallet.publicKey,
            null,
            6,
            tokenMint,
            undefined,
            program
        );
    }

    async function mintSomeTokens({ wallet, program, tokenMint }) {
        const ata = await splToken.createAssociatedTokenAccount(
            connection,
            wallet,
            tokenMint.publicKey,
            wallet.publicKey,
            undefined,
            program
        );

        console.log('ATA', ata.toBase58());

        await splToken.mintTo(
            connection,
            wallet,
            tokenMint.publicKey,
            ata,
            wallet,
            100_000000n,
            [],
            undefined,
            program
        );

        return ata;
    }

    async function runTestSuite({ program }) {
        const tokenMint = Keypair.generate();
        console.log('Creating Mint', tokenMint.publicKey.toBase58());

        await initializeTokenMint({ wallet, program, tokenMint });

        const currentMintInfo = await connection.getAccountInfo(tokenMint.publicKey);
        console.log('Token mint initialized', currentMintInfo.owner);

        console.log('Minting some tokens');
        const ata = await mintSomeTokens({ wallet, program, tokenMint });
        console.log(wallet.publicKey.toBase58(), 'now has', (await connection.getTokenAccountBalance(ata)).value.uiAmountString, 'tokens');
        const ataInfo = await connection.getAccountInfo(ata);
        console.log('ATA owned by', ataInfo.owner.toBase58());

        const lockIndex = await createLock({ wallet, program, tokenMint, ata });
        console.log('=== Lock created. Index = ', lockIndex, '===');
        console.log(wallet.publicKey.toBase58(), 'now has', (await connection.getTokenAccountBalance(ata)).value.uiAmountString, 'tokens');

        console.log('Trying to withdraw before unlock time');
        try {
            await withdrawFromLockedAccount({ wallet, lockIndex, ata });
        } catch (e) {
            console.log('Withdraw failed as expected:', e.message);
        }

        console.log('Waiting for lock to expire');
        await new Promise(resolve => setTimeout(resolve, (LOCK_DUR + 60) * 1000));
        await withdrawFromLockedAccount({ wallet, lockIndex, ata });
        console.log('=== Lock released. Index = ', lockIndex, '===');
        console.log(wallet.publicKey.toBase58(), 'now has', (await connection.getTokenAccountBalance(ata)).value.uiAmountString, 'tokens');
    }

    // async function main() {
    //     const balance = await connection.getBalance(wallet.publicKey);
    //     console.log('Balance:', balance / 1e9, 'SOL');

    //     console.log('Running tests for Token2019');
    //     await runTestSuite({ wallet, program: splToken.TOKEN_PROGRAM_ID });

    //     console.log('Running tests for Program2022');
    //     await runTestSuite({ wallet, program: splToken.TOKEN_2022_PROGRAM_ID });
    // }

    // main();





    //   const base58Client = '8Aqh9szdiCjvoozYqGHoAi9NoGcYMa6qPaw5r5eeaBF5';
    //   const paymentTokenMint = new PublicKey(base58Client);

    //   const base58ClientProgram = '43AsaUEw6rue8qTsVaLS7QTxDM6PcHG4Bh3xtaeYSwhq';
    //   const program = new PublicKey(base58ClientProgram);

    //   const base58ChairNftMint = 'J44qqRtoKdsv1aNVYKjWAu55qMf17cgMuGMsqcJuYZX2';
    //   const chairNftMint = new PublicKey(base58ChairNftMint);


    // const Deposit = async () => {


    //     const paymentTokenAccount = getAssociatedTokenAddressSync(paymentTokenMint, userWalletPublicKey);
    //     console.log(paymentTokenAccount);

    //     let paymentTokenBalance = "0";
    //     try {
    //         paymentTokenBalance = (await connection.getTokenAccountBalance(paymentTokenAccount)).value.uiAmount;
    //     } catch (e) {
    //         console.log('Error getting token account balance:', e);
    //     }

    //     console.log('Payment Token: %s, balance %s', paymentTokenMint, paymentTokenBalance);

    //     const chairNftAccount = getAssociatedTokenAddressSync(chairNftMint, userWalletPublicKey);
    //     const [mintOwnerAccount, _] = PublicKey.findProgramAddressSync([Buffer.from('nft')], program);
    //     const feesAccount = new PublicKey("7vQJh3ci7QT5Q9S85ZWAyt8dff8PnDtXJWnZXmaaMqKA");


    //     // Balance checks are omitted...
    //     const data = Buffer.alloc(1);
    //     data.writeInt8(1, 0);  // 1 for "buy chair"



    //     const instructions = [
    //         ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100 }),  // 100 or for DEVNET, NOT OK FOR PRODUCTION
    //         new createAssociatedTokenAccountIdempotentInstruction(
    //             userWalletPublicKey,
    //             chairNftAccount,
    //             userWalletPublicKey,
    //             chairNftMint,
    //         ),

    //         new TransactionInstruction({
    //             keys: [
    //                 // must remain the same as in the program
    //                 { pubkey: paymentTokenAccount, isSigner: false, isWritable: true },
    //                 { pubkey: chairNftAccount, isSigner: false, isWritable: true },
    //                 { pubkey: userWalletPublicKey, isSigner: true, isWritable: true },
    //                 { pubkey: mintOwnerAccount, isSigner: false, isWritable: false },
    //                 { pubkey: chairNftMint, isSigner: false, isWritable: true },
    //                 { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    //                 { pubkey: feesAccount, isSigner: false, isWritable: true },
    //             ],
    //             programId: program,
    //             data,
    //         }),
    //     ];


    //     const message = new TransactionMessage({
    //         instructions,
    //         recentBlockhash: (await connection.getLatestBlockhash('finalized')).blockhash,
    //         payerKey: userWalletPublicKey,
    //     }).compileToV0Message();

    //     const tx = new VersionedTransaction(message);
    //     const signedTx = await signTransaction(tx);
    //     const compiledTransaction = signedTx.serialize();
    //     const txHash = await connection.sendRawTransaction(compiledTransaction, { preflightCommitment: 'confirmed' });
    //     console.log(txHash);

    // };


    return (
        <section className="Game">
            <button>Lock {nextIndex}, {tokenId}, {amount}, {date}, {persents}</button>
        </section>

    );
}

export default Lock;