import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";
import { Program } from "@coral-xyz/anchor";
import { Growth } from "../../web-services/target/types/growth";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("Growth", () => {
  // Configure the client to use the local cluster.
  const env = anchor.AnchorProvider.env();
  anchor.setProvider(env);
  const metaplex = Metaplex.make(env.connection);

  const program = anchor.workspace.Growth as Program<Growth>;

  const getMetadata = (mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
  };

  const getMasterEdition = (mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
  };

  const getCollectionAuthorityPDA = (mint: PublicKey, authority: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("collection_authority"),
        authority.toBuffer()
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
  };

  console.log(program.programId.toBase58());
  const getOrg = (mint: PublicKey, authority: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("org"), mint.toBuffer()],
      program.programId
    )[0];
  };

  const getScore = (orgAddress: PublicKey, applicant: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("score"), orgAddress.toBuffer(), applicant.toBuffer()],
      program.programId
    )[0];
  };

  it("Is initialized!", async () => {
    // Admin initializes the org
    const orgMint = Keypair.generate();

    const decodedAuthorityKey = new Uint8Array(
      JSON.parse(
        fs.readFileSync(path.join(__dirname, "../authority.json")).toString()
      )
    );

    let authority = Keypair.fromSecretKey(decodedAuthorityKey);
    // const authority = Keypair.generate();
    // let airDropTX = await env.connection.requestAirdrop(
    //   authority.publicKey,
    //   5 * LAMPORTS_PER_SOL
    // );
    // let blockhash = await env.connection.getLatestBlockhash({
    //   commitment: "confirmed",
    // });
    // env.connection.confirmTransaction(
    //   {
    //     blockhash: blockhash.blockhash,
    //     signature: airDropTX,
    //     lastValidBlockHeight: blockhash.lastValidBlockHeight,
    //   },
    //   "confirmed"
    // );
    // console.log(`Airdropped to authority ${authority.publicKey.toBase58()}`);

    const orgAddress = getOrg(orgMint.publicKey, authority.publicKey);
    console.log("Org Address", orgAddress.toBase58());

    const orgMetadataAddress = getMetadata(orgMint.publicKey);
    const orgMaster = getMasterEdition(orgMint.publicKey);
    const orgMasterMetadata = getMetadata(orgMaster);
    let orgMintATA = getAssociatedTokenAddressSync(
      orgMint.publicKey,
      orgAddress,
      true
    );
    console.log("Org ATA", orgMintATA.toBase58())

    const tx = await program.methods
      .createOrganization(Buffer.from([1, 2, 1, 1, 1, 2, 1, 1, 1, 1]), Buffer.from([2]))
      .accounts({
        org: orgAddress,
        orgMint: orgMint.publicKey,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: orgMetadataAddress,
        masterEdition: orgMaster,
        tokenAccount: orgMintATA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([authority, orgMint])
      .rpc({
        commitment: "confirmed",
        skipPreflight: true,
      });
    console.log("Create Org signature", tx);
    let mplxOrgMint = await metaplex.nfts().findByMint({
      mintAddress: orgMint.publicKey,
    });
    console.log("MPLX Org", JSON.stringify(mplxOrgMint));
    // const orgAccount = await program.account.org.fetch(orgAddress);
    // console.log("All org data: ", orgAccount);

    const decodedApplicantKey = new Uint8Array(
      JSON.parse(
        fs.readFileSync(path.join(__dirname, "../applicant.json")).toString()
      )
    );

    // CD applies
    let applicant = Keypair.fromSecretKey(decodedApplicantKey);
    // const applicant = Keypair.generate();
    // airDropTX = await env.connection.requestAirdrop(
    //   applicant.publicKey,
    //   1 * LAMPORTS_PER_SOL
    // );
    // blockhash = await env.connection.getLatestBlockhash({
    //   commitment: "confirmed",
    // });
    // env.connection.confirmTransaction(
    //   {
    //     blockhash: blockhash.blockhash,
    //     signature: airDropTX,
    //     lastValidBlockHeight: blockhash.lastValidBlockHeight,
    //   },
    //   "confirmed"
    // );
    // console.log(`Airdropped to applicant ${applicant.publicKey.toBase58()}`);

    const registerMint = Keypair.generate();
    const applicanMint = await createMint(
      env.connection,
      applicant,
      orgAddress,
      orgAddress,
      0,
      registerMint,
      {
        commitment: "confirmed"
      }
    );
    console.log(`Applicant mint is created, ${applicanMint.toBase58()}`)

    let registerMintATA = await getOrCreateAssociatedTokenAccount(
      env.connection,
      applicant,
      registerMint.publicKey,
      applicant.publicKey
    );
    const scoreAddress = getScore(orgAddress, applicant.publicKey);

    const registerMetadataAddress = getMetadata(registerMint.publicKey);
    const tx1 = await program.methods
      .register()
      .accounts({
        applicant: applicant.publicKey,
        org: orgAddress,
        registerMint: registerMint.publicKey,
        orgMint: orgMint.publicKey,
        tokenAccount: registerMintATA.address,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: registerMetadataAddress,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        collectionMaster: orgMaster,
        score: scoreAddress
      })
      .signers([applicant])
      .rpc({
        skipPreflight: true,
        commitment: "confirmed",
      });
    console.log("Register signature", tx1);
    let mplxMint = await metaplex.nfts().findByMint({
      mintAddress: registerMint.publicKey,
    });
    console.log("MPLX", JSON.stringify(mplxMint));
    let applicantMintATA = await getOrCreateAssociatedTokenAccount(
      env.connection,
      authority,
      registerMint.publicKey,
      applicant.publicKey
    );

    const txVerify = await program.methods.verify().accounts({
      authority: authority.publicKey,
      collectionMaster: orgMaster,
      collectionMetadata: orgMetadataAddress,
      metadata: registerMetadataAddress,
      org: orgAddress,
      orgMint: orgMint.publicKey,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID
    }).signers([authority]).rpc({
      skipPreflight: true,
      commitment: "confirmed",
    });

    let tx3 = await program.methods
      .submitScore(Buffer.from([3, 4, 5, 6, 7, 8, 9, 1, 2, 3]))
      .accounts({
        applicant: applicant.publicKey,
        orgMint: orgMint.publicKey,
        org: orgAddress,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: registerMetadataAddress,
      })
      .signers([authority])
      .rpc({
        skipPreflight: true
      });
    console.log("Rating signature", tx3);
    let scoreAccount = await program.account.score.fetch(scoreAddress);
    // 3.5 5.125
    console.log("All score data: ", scoreAccount);
    mplxMint = await metaplex.nfts().findByMint({
      mintAddress: registerMint.publicKey,
    });
    console.log("MPLX", JSON.stringify(mplxMint));

    tx3 = await program.methods
      .submitScore(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 9]))
      .accounts({
        applicant: applicant.publicKey,
        orgMint: orgMint.publicKey,
        org: orgAddress,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: registerMetadataAddress,
      })
      .signers([authority])
      .rpc();
    console.log("Rating signature", tx3);

    scoreAccount = await program.account.score.fetch(scoreAddress);
    // 2.5 5.25
    console.log("All score data: ", scoreAccount);
  });
});
