import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js"
import { NextApiRequest, NextApiResponse } from "next"
import calculatePrice from "../../lib/calculatePrice"
import base58 from 'bs58'
import { Elusiv, PrivateTxWrapper, TokenType } from "elusiv-sdk";
import { sign } from "@noble/ed25519";

export default async function getLast5Transactions(req: { query: { password: any } }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string }): void; new(): any } }; json: (arg0: PrivateTxWrapper[]) => void }) {
    const { password } = req.query
    if (!password) {
    res.status(400).json({ error: "No key provided" })
    return
    }

    const operatorPrivateKey = process.env.OP_PRIVATE_KEY as string
    if (!operatorPrivateKey) {
      res.status(500).json({ error: "Operator private key not available" })
    }
    const operatorKeypair = Keypair.fromSecretKey(base58.decode(operatorPrivateKey))

    const operatorPublicKey = operatorKeypair.publicKey
    const userKey = password as string
  
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)

    // Generate a keypair from the private key to retrieve the public key and optionally 
    // sign txs

    const seed = await sign(Elusiv.hashPw(userKey), operatorKeypair.secretKey.slice(0, 32));

    // Create the elusiv instance
    const elusiv = await Elusiv.getElusivInstance(seed, operatorKeypair.publicKey, connection);
    const last5PrivTxs = await elusiv.getPrivateTransactions(8, 'LAMPORTS');

    console.log("Our last 8 private transactions:\n");
    console.log(last5PrivTxs);

  res.json(last5PrivTxs);
}
