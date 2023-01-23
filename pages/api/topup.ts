import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js"
import { NextApiRequest, NextApiResponse } from "next"
import calculatePrice from "../../lib/calculatePrice"
import base58 from 'bs58'
import { Elusiv, TokenType } from "elusiv-sdk";
import { sign } from "@noble/ed25519";

export type MakeTransactionInputData = {
  account: string,
}

type MakeTransactionGetResponse = {
  label: string,
  icon: string,
}

export type MakeTransactionOutputData = {
  transaction: string,
  message: string,
}

type ErrorOutput = {
  error: string
}

function get(res: NextApiResponse<MakeTransactionGetResponse>) {
  res.status(200).json({
    label: "Monstrè x Elusiv Private Topup",
    icon: "https://shdw-drive.genesysgo.net/HcnRQ2WJHfJzSgPrs4pPtEkiQjYTu1Bf6DmMns1yEWr8/monstre%20logo.png",
  })
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  try {
    const amount = calculatePrice(req.query)
    if (amount.toNumber() === 0) {
      res.status(400).json({ error: "Can't topup with charge of 0" })
      return
    }
    
    const { reference } = req.query
    if (!reference) {
      res.status(400).json({ error: "No reference provided" })
      return
    }

    const { password } = req.query
    if (!password) {
      res.status(400).json({ error: "No key provided" })
      return
    }

    // We pass the buyer's public key in JSON body
    const { account } = req.body as MakeTransactionInputData
    if (!account) {
      res.status(40).json({ error: "No account provided" })
      return
    }

    // We get the shop private key from .env - this is the same as in our script
    const operatorPrivateKey = process.env.OP_PRIVATE_KEY as string
    if (!operatorPrivateKey) {
      res.status(500).json({ error: "Shop private key not available" })
    }
    const operatorKeypair = Keypair.fromSecretKey(base58.decode(operatorPrivateKey))

    const recPublicKey = new PublicKey(account)
    const operatorPublicKey = operatorKeypair.publicKey
    const userKey = password as string
  
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Generate a keypair from the private key to retrieve the public key and optionally 
    // sign txs

    // Generate the input seed. Remember, this is almost as important as the private key, so don't log this!
    // (We use sign from an external library here because there is no wallet connected. Usually you'd use the wallet adapter here) 
    // (Slice because in Solana's keypair type the first 32 bytes is the privkey and the last 32 is the pubkey)
    const seed = await sign(Elusiv.hashPw(userKey), operatorKeypair.secretKey.slice(0, 32));

    const elusiv = await Elusiv.getElusivInstance(seed, operatorKeypair.publicKey, connection);
    const topupTx = await elusiv.buildTopUpTx(amount.toNumber() * (LAMPORTS_PER_SOL), 'LAMPORTS');
    topupTx.tx.partialSign(operatorKeypair);
    const storeRes = await elusiv.sendElusivTx(topupTx);
    
    const transaction = new Transaction({
      feePayer: operatorPublicKey,
      blockhash,
      lastValidBlockHeight,
    });

  
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: recPublicKey,
      lamports: amount.toNumber() * (LAMPORTS_PER_SOL),
      toPubkey: operatorPublicKey,
    })

    // Add the reference to the instruction as a key
    // This will mean this transaction is returned when we query for the reference
    transferInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    })

    // Add both instructions to the transaction
    transaction.add(transferInstruction)

    transaction.partialSign(operatorKeypair)

    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false
    })
    const base64 = serializedTransaction.toString('base64')

    const message = "Powered by Monstrè! 👾"

    // Return the serialized transaction
    res.status(200).json({
      transaction: base64,
      message,
    })
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: 'error creating transaction', })
    return
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionGetResponse | MakeTransactionOutputData | ErrorOutput>
) {
  if (req.method === "GET") {
    return get(res)
  } else if (req.method === "POST") {
    return await post(req, res)
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}