import express, { Express, Request, Response } from "express"
import { Connection, Client } from '@temporalio/client';
import { example, getProgress } from './workflows.js';
import { Worker } from '@temporalio/worker';
// import { nanoid } from 'nanoid';
import * as activities from './activities.js';
import { createRequire } from "module";
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from "@metaplex-foundation/js";
import { Connection as conn, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { airdrop, createKeypair, getBalance, initializeKeypair } from "./initializeKeypair.js";
import { createCollectionNft, createNft, nftData, updateNftData, updateNftUri, uploadMetadata, uploadNFT } from "./metaplex.js";
import { Amman, LOCALHOST } from '@metaplex-foundation/amman-client'
import * as web3 from "@solana/web3.js"
// import pkg from '@web3auth/base';
import path from "path";
const app = express()
const port = 4000
// import pkg_modal from '@web3auth/modal';
import { Context } from "@temporalio/activity";
import * as fs from "fs"
// const { Web3Auth } = pkg_modal;
// const { WALLET_ADAPTERS } = pkg;
app.use('/dist', express.static('dist'));

// create a new connection to the cluster's API
// const connection = new conn(LOCALHOST);
const connection = new conn("https://api.devnet.solana.com");

// initialize a keypair for the user
const user = initializeKeypair(connection)

app.get('/', (req, res) => {
  res.send("main page");
  // res.sendFile(path.join('./index.html'));
})
app.get('/amman', async (req, res) => {
  const amman = Amman.instance()
  const [payer, payerPair] = amman.genKeypair()
  const connection = new conn(LOCALHOST)
  await amman.airdrop(connection, payer, 2)
  res.send(payerPair.publicKey)
})
app.get('/uploadNFT', async (req, res) => {
  console.log("PublicKey:", user.publicKey.toBase58())

  // metaplex set up
  const metaplex = Metaplex.make(connection, {
    cluster: "localnet"
  })
    .use(keypairIdentity(user));
  uploadNFT(metaplex)
  res.send("upload nft")
})
app.get('/createNFT/:address', async (req, res) => {

  res.send(req.params.address)
  // create a new connection to the cluster's API
  const connection = new conn(LOCALHOST)

  // initialize a keypair for the user
  const user = await createKeypair(connection, req.params.address)

  console.log("SecretKey:", req.params.address)

  // metaplex set up
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user));
  await uploadNFT(metaplex)
  res.send("upload nft")
})
app.get('/getBalance', async (req, res) => {

  const connection = new conn(LOCALHOST)
  // initialize a keypair for the user
  const user = await initializeKeypair(connection)
  const balance = await getBalance(connection)
  res.status(200).send("Balance is :" + (balance / web3.LAMPORTS_PER_SOL))
})
app.get('/airDrop/:sol', async (req, res) => {

  const connection = new conn(LOCALHOST)
  const balance = await airdrop(connection, parseInt(req.params.sol, 10))
  res.send("Balance is :" + (balance / web3.LAMPORTS_PER_SOL))
})
app.get('/mint', async (req, res) => {

  const connection = new conn(LOCALHOST)
  const user = await initializeKeypair(connection)
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
  const buffer = fs.readFileSync("./src/solana.png");
  console.log("make buffer");
  const file = toMetaplexFile(buffer, "image.png");
  console.log("to metaplex file");
  const imageUri = await metaplex.storage().upload(file);
  console.log("storage upload file");
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "My NFT Dehdar",
    description: "My description Dehdar",
    image: imageUri,
  });
  console.log("upload meta data");
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: "My NFT",
      sellerFeeBasisPoints: 0,
    },
    { commitment: "finalized" },
  );
  console.log("create nft");
  res.send("done");
});
app.get('/mint2', async (req, res) => {

  const connection = new conn(clusterApiUrl("devnet"))
  const user = await initializeKeypair(connection)
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
  const buffer = fs.readFileSync("./src/solana.png");
  console.log("make buffer");
  const file = toMetaplexFile(buffer, "image.png");
  console.log("to metaplex file");
  const imageUri = await metaplex.storage().upload(file);
  console.log("storage upload file");
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "My NFT Dehdar",
    description: "My description Dehdar",
    image: imageUri,
  });
  console.log("upload meta data====>uri:" + uri);
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: "My NFT",
      sellerFeeBasisPoints: 0,
    },
    { commitment: "finalized" },
  );
  console.log("create nft");
  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
  res.send("done");
});
app.get('/create', async (req, res) => {
  // create a new connection to the cluster's API
  const connection = new conn(LOCALHOST)

  // initialize a keypair for the user
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())
  // metaplex set up
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage()
    )
  console.log("Setup...");
  const collectionNftData = {
    name: "TestCollectionNFT",
    symbol: "TEST",
    description: "Test Description Collection",
    sellerFeeBasisPoints: 100,
    imageFile: "success.png",
    isCollection: true,
    collectionAuthority: user,
  }

  console.log("collectionNftData...");
  // upload data for the collection NFT and get the URI for the metadata
  const collectionUri = await uploadMetadata(metaplex, collectionNftData)

  // create a collection NFT using the helper function and the URI from the metadata
  const collectionNft = await createCollectionNft(
    metaplex,
    collectionUri,
    collectionNftData
  )

  // upload the NFT data and get the URI for the metadata
  const uri = await uploadMetadata(metaplex, nftData)

  // create an NFT using the helper function and the URI from the metadata
  const nft = await createNft(
    metaplex,
    uri,
    nftData,
    collectionNft.mint.address
  )

  // upload updated NFT data and get the new URI for the metadata
  const updatedUri = await uploadMetadata(metaplex, updateNftData)

  // update the NFT using the helper function and the new URI from the metadata
  await updateNftUri(metaplex, updatedUri, nft.address)
})
app.get('/find/:address', async (req, res) => {

  const connection = new conn(clusterApiUrl("devnet"));
  const metaplex = new Metaplex(connection);
  const mintAddress = new PublicKey(req.params.address);
  const nft = await metaplex.nfts().findByMint({ mintAddress });
  res.send(nft)
})
app.get('/meta', (req, res) => {
  const connection = new conn(clusterApiUrl("devnet"));
  const metaplex = new Metaplex(connection);
  const wallet = Keypair.generate();
  res.send('meta plex>>>' + wallet.publicKey)
})
app.get('/test', async (req, res) => {
  // Connect to the default Server location (localhost:7233)
  const connection = await Connection.connect();
  // In production, pass options to configure TLS and other settings:
  // {
  //   address: 'foo.bar.tmprl.cloud',
  //   tls: {}
  // }

  const client = new Client({
    connection,
    // namespace: 'foo.bar', // connects to 'default' namespace if not specified
  });
  const workerId = 'workflow-' + "xxxx";
  // const workerId = 'workflow-' + nanoid();
  const handle = await client.workflow.start(example, {
    // type inference works! args: [name: string]
    args: ['Temporal'],
    taskQueue: 'hello-world',
    // in practice, use a meaningful business ID, like customerId or transactionId
    workflowId: workerId,
  });
  console.log(`Started workflow`);

  // optional: wait for client result
  console.log("worker id:" + workerId); // Hello, Temporal!
})
app.get('/getInfoTemporal/:id', async (req, res) => {
  const connection = await Connection.connect();
  // In production, pass options to configure TLS and other settings:
  // {
  //   address: 'foo.bar.tmprl.cloud',
  //   tls: {}
  // }

  const client = new Client({
    connection,
    // namespace: 'foo.bar', // connects to 'default' namespace if not specified
  });
  const handle = client.workflow.getHandle(req.params.id); // match the Workflow id
  // res.send(await handle.signal(cancelSubscription));
  // const val = await handle.signal(cancelSubscription);
  // // Should print "10", may print another number depending on timing
  // console.log(val);

  // await handle.result();
  // console.log('complete');
  // res.send("ok")

  await new Promise((resolve) => setTimeout(resolve, 2000));
  const val = await handle.query(getProgress);
  // Should print "10", may print another number depending on timing
  console.log(val);

  await handle.result();
  console.log('complete');

})
app.get('/worker', async (req, res) => {
  // const require = createRequire(import.meta.url);
  // const worker = await Worker.create({
  //   workflowsPath: require.resolve('./src/workflows'),
  //   activities,
  //   taskQueue: 'hello-world',
  // });
  // // Worker connects to localhost by default and uses console.error for logging.
  // // Customize the Worker by passing more options to create():
  // // https://typescript.temporal.io/api/classes/worker.Worker
  // // If you need to configure server connection parameters, see docs:
  // // https://docs.temporal.io/typescript/security#encryption-in-transit-with-mtls

  // // Step 2: Start accepting tasks on the `hello-world` queue
  // worker.run();
  res.send('worker run');
})
app.get('/web3auth', async (req, res) => {
  //Initialize within your constructor
  // const web3auth = new Web3Auth({
  //   clientId: "BKw8hgIPDMl3p6bcYYlZgdXSoIrLyJivtoZWcld40wsN-AM-XUAOkiI-ATvQGJu9x6kRVx3aGtdKQg3EMhM_BrE", // Get your Client ID from Web3Auth Dashboard
  //   chainConfig: {
  //     chainNamespace: "solana",
  //     chainId: "0x3", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet

  //   },
  // });

  // await web3auth.initModal();
  // console.log(`completed`)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})