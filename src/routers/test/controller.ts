import controller from "../controller"
import { Request, Response } from "express";
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, Metadata } from "@metaplex-foundation/js";
import { Connection as conn, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { airdrop, createKeypair, getBalance, getKeyPair, initializeKeypair } from "../../services/solana";
import * as web3 from "@solana/web3.js"
import * as jose from 'jose'
import fs from "fs"
import { Connection, Client } from '@temporalio/client';
import { getStatus, isBlockedQuery, mint, signals, unblockSignal, updateMint } from "./workflow/workflows";
import { Worker } from '@temporalio/worker';
import * as activities from './workflow/activities';
import { nanoid } from "nanoid";
import { cli } from "winston/lib/winston/config";
import { BigQuery } from "@google-cloud/bigquery";
import { DESIGNITY_COLLECTION_ADDRESS, NETWORK } from "../../utils/globals";



class TestController extends controller {
  check = async (req: Request, res: Response) => {

    const idToken = req.body.idToken
    const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });
    res.send((jwtDecoded.payload as any).wallets[0].public_key)

  }

  getBalance = async (req: Request, res: Response) => {
    const privateKey = req.body.privateKey;
    const connection = new conn(NETWORK);
    const user = await getKeyPair(privateKey, connection)
    const balance = await connection.getBalance(new PublicKey(user.publicKey));
    res.send((balance / web3.LAMPORTS_PER_SOL) + "")
  }
  mint = async (req: Request, res: Response) => {
    // const idToken=req.body.idToken
    // const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    // const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    //   algorithms: ["ES256"],
    // });
    const name = req.body.name;
    console.log("nftname >>>>>>" + name);
    const description = req.body.description;
    console.log("nft description>>>>>" + description);
    const fileName = req.body.fileName;
    console.log("nft fileName>>>>>" + fileName);
    const privateKey = req.body.privateKey;
    const collectionMint = req.body.collectionMint;
    console.log("collectionMint>>>>>" + collectionMint);
    // console.log((jwtDecoded.payload as any).wallets[0].public_key);
    // console.log((jwtDecoded.payload as any).wallets[0]);
    console.log(privateKey);

    const connection = new conn(NETWORK)
    const user = await getKeyPair(privateKey, connection)
    console.log("PublicKey:", user.publicKey.toBase58())
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    console.log("make metaplex");
    const buffer = fs.readFileSync("uploads/images/" + fileName);
    console.log("make buffer");
    const file = toMetaplexFile(buffer, "image.png");
    console.log("to metaplex file");
    const imageUri = await metaplex.storage().upload(file);
    console.log("storage upload file");
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: name,
      description: description,
      image: imageUri,
    });
    console.log("upload meta data====>uri:" + uri);
    const { nft } = await metaplex.nfts().create(
      {
        uri: uri,
        name: name,
        sellerFeeBasisPoints: 0,
        collection: new PublicKey(DESIGNITY_COLLECTION_ADDRESS)
      },
      { commitment: "finalized" },
    );
    console.log("create nft");
    console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    const data = {
      explorer_uri: `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
      nft: nft,
      uri: uri
    };
    const userDesignity = await getKeyPair(process.env.DESIGNITY_PRIVATE_KEY!, connection)
    console.log("PublicKey designity:", userDesignity.publicKey.toBase58())
    const metaplexDesignitty = Metaplex.make(connection)
      .use(keypairIdentity(userDesignity))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    const result = await metaplexDesignitty.nfts().verifyCollection({
      //this is what verifies our collection as a Certified Collection
      mintAddress: nft.address,
      collectionMintAddress: new PublicKey(DESIGNITY_COLLECTION_ADDRESS),
      isSizedCollection: true,
    })
    this.myResponse(res, 200, result, "");
  }
  defaultMint = async (req: Request, res: Response) => {
    // const idToken=req.body.idToken
    // const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    // const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    //   algorithms: ["ES256"],
    // });
    const name = req.body.name;
    console.log("nftname >>>>>>" + name);
    const description = req.body.description;
    console.log("nft description>>>>>" + description);
    const role = req.body.role;
    console.log("nftrole >>>>>>" + role);
    const privateKey = req.body.privateKey;
    // console.log((jwtDecoded.payload as any).wallets[0].public_key);
    // console.log((jwtDecoded.payload as any).wallets[0]);
    console.log(privateKey);

    const connection = new conn(NETWORK)
    const user = await getKeyPair(privateKey, connection)
    console.log("PublicKey:", user.publicKey.toBase58())
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    console.log("make metaplex");
    const buffer = fs.readFileSync("uploads/images/designity.png");
    console.log("make buffer");
    const file = toMetaplexFile(buffer, "image.png");
    console.log("to metaplex file");
    const imageUri = await metaplex.storage().upload(file);
    console.log("storage upload file");
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: name,
      description: description,
      role: role,
      image: imageUri,
    });
    console.log("upload meta data====>uri:" + uri);
    const { nft } = await metaplex.nfts().create(
      {
        uri: uri,
        name: name,
        sellerFeeBasisPoints: 0,
        collection: new PublicKey(DESIGNITY_COLLECTION_ADDRESS)
      },
      { commitment: "finalized" },
    );
    console.log("create nft");
    console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    const data = {
      explorer_uri: `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
      nft: nft,
      uri: uri
    };

    const userDesignity = await getKeyPair(process.env.DESIGNITY_PRIVATE_KEY!, connection)
    console.log("PublicKey designity:", userDesignity.publicKey.toBase58())
    const metaplexDesignitty = Metaplex.make(connection)
      .use(keypairIdentity(userDesignity))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    const result = await metaplexDesignitty.nfts().verifyCollection({
      //this is what verifies our collection as a Certified Collection
      mintAddress: nft.address,
      collectionMintAddress: new PublicKey(DESIGNITY_COLLECTION_ADDRESS),
      isSizedCollection: true,
    })
    this.myResponse(res, 200, result, "");
  }
  mintCollection = async (req: Request, res: Response) => {
    // const idToken=req.body.idToken
    // const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    // const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    //   algorithms: ["ES256"],
    // });
    const name = req.body.name;
    console.log("nftname >>>>>>" + name);
    const description = req.body.description;
    console.log("nft description>>>>>" + description);
    const fileName = req.body.fileName;
    console.log("nft fileName>>>>>" + fileName);
    const privateKey = req.body.privateKey;
    // console.log((jwtDecoded.payload as any).wallets[0].public_key);
    // console.log((jwtDecoded.payload as any).wallets[0]);
    console.log(privateKey);
    // const connection = new conn(clusterApiUrl("devnet"))


    const connection = new conn(NETWORK)
    const user = await getKeyPair(privateKey, connection)
    console.log("PublicKey:", user.publicKey.toBase58())
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    console.log("make metaplex");
    const buffer = fs.readFileSync("uploads/images/" + fileName);
    console.log("make buffer");
    const file = toMetaplexFile(buffer, "image.png");
    console.log("to metaplex file");
    const imageUri = await metaplex.storage().upload(file);
    console.log("storage upload file");
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: name,
      description: description,
      image: imageUri,
    });
    console.log("upload meta data====>uri:" + uri);
    const { nft } = await metaplex.nfts().create(
      {
        uri: uri,
        name: name,
        sellerFeeBasisPoints: 0,
        isCollection: true
      },
      { commitment: "finalized" },
    );
    console.log("create nft");
    console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    const data = {
      explorer_uri: `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
      nft: nft,
      uri: uri
    };
    this.myResponse(res, 200, data, "");
  }
  mintWorkflow = async (req: Request, res: Response) => {

    const connection = await Connection.connect();
    const client = new Client({
      connection,
      // namespace: 'foo.bar', // connects to 'default' namespace if not specified
    });

    const name = req.body.name;
    console.log("nftname >>>>>>" + name);
    const description = req.body.description;
    console.log("nft description>>>>>" + description);
    const fileName = req.body.fileName;
    console.log("nft fileName>>>>>" + fileName);
    const privateKey = req.body.privateKey;
    const workId = req.body.workId;
    console.log("nft workId>>>>>" + workId);
    // console.log((jwtDecoded.payload as any).wallets[0].public_key);
    // console.log((jwtDecoded.payload as any).wallets[0]);
    console.log(privateKey);
    const workFlowId = 'mint-' + workId;
    const handle = await client.workflow.start(mint, {
      // type inference works! args: [name: string]
      args: [privateKey, fileName, description, name],
      taskQueue: 'mint',
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: workFlowId,
    });
    console.log(`Started workflow`);


    res.send("worker run:" + workFlowId)
  }
  updateMintWorkflow = async (req: Request, res: Response) => {

    const connection = await Connection.connect();
    const client = new Client({
      connection,
      // namespace: 'foo.bar', // connects to 'default' namespace if not specified
    });

    const name = req.body.name;
    console.log("nftname >>>>>>" + name);
    const description = req.body.description;
    console.log("nft description>>>>>" + description);
    const fileName = req.body.fileName;
    console.log("nft fileName>>>>>" + fileName);
    const privateKey = req.body.privateKey;
    const mintAddress = req.body.mintAddress;
    console.log("nft mintAddress>>>>>" + mintAddress);
    // console.log((jwtDecoded.payload as any).wallets[0].public_key);
    // console.log((jwtDecoded.payload as any).wallets[0]);
    console.log(privateKey);
    const workFlowId = 'mint-' + nanoid();
    const handle = await client.workflow.start(updateMint, {
      // type inference works! args: [name: string]
      args: [privateKey, fileName, description, name, mintAddress],
      taskQueue: 'mint',
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: workFlowId,
    });
    console.log(`Started workflow`);


    res.send("worker run:" + workFlowId)
  }

  updateDefaultMintWorkflow = async (req: Request, res: Response) => {

    const name = req.body.name;
    console.log("nftname >>>>>>" + name);
    const description = req.body.description;
    console.log("nft description>>>>>" + description);
    const role = req.body.role;
    console.log("nft role>>>>>" + role);
    const privateKey = req.body.privateKey;
    const address = req.body.mintAddress;
    console.log("nft mintAddress>>>>>" + address);
    const connection = new conn(NETWORK)
    const user = await getKeyPair(privateKey, connection)
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    const buffer = fs.readFileSync("uploads/images/designity.png");
    console.log("make buffer");
    const file = toMetaplexFile(buffer, "image.png");
    console.log("to metaplex file");
    const imageUri = await metaplex.storage().upload(file);
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: name,
      description: description,
      role: role,
      image: imageUri,
    });
    console.log("upload meta data====>uri:" + uri);
    const mintAddress = new PublicKey(address);
    // fetch NFT data using mint address
    const nft = await metaplex.nfts().findByMint({ mintAddress })

    // update the NFT metadata
    const { response } = await metaplex.nfts().update(
      {
        nftOrSft: nft,
        uri: uri,
      },
      { commitment: "finalized" }
    )

    console.log(
      `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
    )

    console.log(
      `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`
    )


    res.send(nft)


  }
  workflow = async (req: Request, res: Response) => {

    const connection = await Connection.connect();
    const client = new Client({
      connection,
      // namespace: 'foo.bar', // connects to 'default' namespace if not specified
    });

    const workFlowId = 'mint-' + nanoid();
    const handle = await client.workflow.start(mint, {
      // type inference works! args: [name: string]
      args: ['Temporal', 'Temporal', 'Temporal', 'Temporal'],
      taskQueue: 'mint',
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: workFlowId,
    });
    console.log(`Started workflow`);


    res.send("worker run:" + workFlowId)
  }
  mintWorker = async (req: Request, res: Response) => {
    const worker = await Worker.create({
      workflowsPath: require.resolve('./workflow/workflows'),
      activities,
      taskQueue: 'mint',
    });
    worker.run();
    res.send("worker run")
  }
  getInfoWorkFlow = async (req: Request, res: Response) => {

    const connection = await Connection.connect();
    const client = new Client({
      connection,
      // namespace: 'foo.bar', // connects to 'default' namespace if not specified
    });
    // const workFlow = await client.workflow.getHandle(req.params.workFlowId).describe();
    // res.send(workFlow);
    const handle = client.workflow.getHandle(req.params.workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const val = await handle.query(getStatus);
    // Should print "10", may print another number depending on timing
    console.log(val);

    await handle.result();
    console.log('complete');
    res.send(val);
  }
  findAllMint = async (req: Request, res: Response) => {

    const idToken = req.body.idToken;
    console.log(idToken);
    const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });
    const public_key = (jwtDecoded.payload as any).wallets[0].public_key;
    const privateKey = req.body.privateKey;
    console.log("public_key>>>>" + public_key);
    console.log("private_key>>>>" + privateKey);

    const connection = new conn(NETWORK)
    const user = await getKeyPair(privateKey, connection)
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    // const result = await metaplex.nfts().findAllByOwner({
    //   owner: metaplex.identity().publicKey
    // });
    res.json("")
  }
  findAllMintWithCollection = async (req: Request, res: Response) => {

    const idToken = req.body.idToken;
    console.log(idToken);
    const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });
    const public_key = (jwtDecoded.payload as any).wallets[0].public_key;
    const privateKey = req.body.privateKey;

    const connection = new conn(NETWORK)
    const user = await getKeyPair(privateKey, connection)
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    const result = await metaplex.nfts().findAllByOwner({
      owner: metaplex.identity().publicKey
    });
    const dc = new PublicKey(DESIGNITY_COLLECTION_ADDRESS).toBase58();
    const ourCollectionNfts = result.filter(
      metadata => {
        return metadata.collection !== null &&
          metadata.collection.verified &&
          metadata.collection.address.toBase58() === dc

      }
    )
    const loadedNfts = await Promise.all(ourCollectionNfts
      .map(metadata => {
        return metaplex.nfts().load({ metadata: metadata as Metadata })
      })
    )
    res.json(loadedNfts)
  }
  callSignalWorkFlow = async (req: Request, res: Response) => {

    const connection = await Connection.connect();
    const client = new Client({
      connection,
    });

    const workFlowId = 'signal-test';
    const handle = await client.workflow.start(signals, {
      args: [],
      taskQueue: 'signal',
      workflowId: workFlowId,
    });
    console.log(`Started workflow`);


    res.send("worker run:" + workFlowId)
  }
  startWorkerSignal = async (req: Request, res: Response) => {
    const worker = await Worker.create({
      workflowsPath: require.resolve('./workflow/workflows'),
      activities,
      taskQueue: 'signal',
    });
    worker.run();
    res.send("worker run")
  }
  getStatusSignal = async (req: Request, res: Response) => {

    const connection = await Connection.connect();
    const client = new Client({
      connection,
    });
    const handle = client.workflow.getHandle('signal-test');
    const isBlocked = await handle.query(isBlockedQuery);
    console.log('blocked?', isBlocked);
    res.send("isBlocked?" + isBlocked)
  }
  cancelSignal = async (req: Request, res: Response) => {
    const connection = await Connection.connect();
    const client = new Client({
      connection,
    });
    const handle = client.workflow.getHandle('signal-test');

    await handle.cancel();
    console.log('workflow canceled');
    res.send("canceled signal");
  }

  callSignal = async (req: Request, res: Response) => {
    const connection = await Connection.connect();
    const client = new Client({
      connection,
    });
    const handle = client.workflow.getHandle('signal-test');
    await handle.signal(unblockSignal);
    console.log('unblockSignal sent');
    res.send("unblockSignal sent");
  }

  checkingEmail = async (req: Request, res: Response) => {
    // const bigquery = new BigQuery({
    //   keyFilename:'bigquery-sa.json'
    // });
    // const dataset = await bigquery.dataset("first");
    // console.log("data_set:",dataset);
    // const [view] = await dataset.table("ftbl").get();
    // res.send(view);
    // res.send("bigquery");     


    const bigquery = new BigQuery({
      keyFilename: 'bigquery-sa.json',
      projectId: 'designitybigquerysandbox',
      scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/bigquery"
      ]

    });
    const query = `SELECT *
    FROM \`designitybigquerysandbox.designityemails.designityuser\`
     LIMIT 100`;
    console.log(query);
    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    };

    //   // Run the query
    const [rows] = await bigquery.query(options);

    console.log('Rows:', rows);
    const result = rows.find(row => row.Email == req.body.email);
    //   res.send(rows);
    console.log(result);

    this.myResponse(res, 200, result, "");
  }
}

export default new TestController