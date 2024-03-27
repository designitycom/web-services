import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Record } from "airtable";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

//import { Growth } from "../types/growth";
import { Designity } from "../types/designity";
import { toBigNumber } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  ICreativesScoresAirtable,
  ISoftrCreativesUser,
} from "../workflows/airtable/activities";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export class GrowthService {
  private program: Program<Designity>;
  private authority: Keypair;
  private orgMint: Keypair;

  private orgAddress: PublicKey;
  private orgMetadata: PublicKey;
  private orgMaster: PublicKey;
  private orgATA: PublicKey;

  private getMetadata(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
  }

  private getMasterEdition(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
  }

  private getOrg(mint: PublicKey, authority: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("org"), mint.toBuffer(), authority.toBuffer()],
      this.program.programId
    )[0];
  }

  private getScore(orgAddress: PublicKey, applicant: PublicKey) {
    console.log();
    return PublicKey.findProgramAddressSync(
      [Buffer.from("score"), orgAddress.toBuffer(), applicant.toBuffer()],
      this.program.programId
    )[0];
  }

  constructor(connection: Connection, authority: Keypair, mint: Keypair) {
    this.authority = authority;
    this.orgMint = mint;
    let w = new Wallet(this.authority);
    const env = new anchor.AnchorProvider(connection, w, {
      commitment: "confirmed",
    });
    anchor.setProvider(env);
    // Read the generated IDL.
const idl = JSON.parse(
  require("fs").readFileSync("./target/idl/designity.json", "utf8")
);

//Address of the deployed program
const programId = new anchor.web3.PublicKey("86kpZGxTEDUF3VShNZfykKM8ow1TEeuHEzJ3tduLFyQY");
this.program = new anchor.Program(idl, programId);
    //this.program = anchor.workspace.Designity as Program<Designity>;
    //console.log(this.program.idl);
    // wtf is programID
    console.log(
      "mint and auth",
      this.orgMint.publicKey.toBase58(),
      this.authority.publicKey.toBase58()
    );
    this.orgAddress = this.getOrg(
      this.orgMint.publicKey,
      this.authority.publicKey
    );
    this.orgMetadata = this.getMetadata(this.orgMint.publicKey);
    this.orgMaster = this.getMasterEdition(this.orgMint.publicKey);
    this.orgATA = getAssociatedTokenAddressSync(
      this.orgMint.publicKey,
      this.orgAddress,
      true
    );
    console.log("Growth constructed");
  }

  public async createOrganization(
    name: string,
    weights: number[],
    ranges: number[],
    levels: Array<Array<number>>,
    domain: string,
    min_reviews: number,
    level_wait: number
  ) {
    const tx = await this.program.methods
      .createOrganization(
        weights,
        Buffer.from(ranges),
        levels,
        name,
        min_reviews,
        domain,
        level_wait
      )
      .accounts({
        org: this.orgAddress,
        orgMint: this.orgMint.publicKey,
        authority: this.authority.publicKey,
        metadata: this.orgMetadata,
        masterEdition: this.orgMaster,
        tokenAccount: this.orgATA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([this.authority, this.orgMint])
      .rpc({
        commitment: "confirmed",
        skipPreflight: true,
      });
    console.log("Create ORG tx:", tx);
    return await this.program.account.org.fetch(this.orgAddress, "confirmed");
  }

  public async createRegisterMint(mint: Keypair) {
    console.log(`creating mint by ${this.authority.publicKey.toBase58()}`);
    return await createMint(
      this.program.provider.connection,
      this.authority,
      this.orgAddress,
      this.orgAddress,
      0,
      mint,
      {
        commitment: "confirmed",
      }
    );
  }

  public async register(fields: ISoftrCreativesUser, mint: PublicKey) {
    const applicant = new PublicKey(fields["Wallet Address"]);
    let registerMintATA = await getOrCreateAssociatedTokenAccount(
      this.program.provider.connection,
      this.authority,
      mint,
      applicant,
      false,
      "confirmed",
      {
        commitment: "confirmed",
      }
    );
    const startDate = new Date(fields["Start Date"]![0]);
    console.log("register fields",fields);
    // console.log(fields, startDate, startDate.getTime() / 1000);
    return await this.program.methods
      .register(
        fields.Name!,
        Buffer.from([fields.Level, fields.Status]),
        new anchor.BN(startDate.getTime()).div(new anchor.BN(1000))
      )
      .accounts({
        authority: this.authority.publicKey,
        applicant: applicant,
        org: this.orgAddress,
        collectionMaster: this.orgMaster,
        score: this.getScore(this.orgAddress, applicant),
        registerMint: mint,
        metadata: this.getMetadata(mint),
        tokenAccount: registerMintATA.address,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([this.authority])
      .rpc({
        skipPreflight: true,
        commitment: "confirmed",
      });
  }

  public async getScoreAccount(applicant: PublicKey) {
    try {
      return await this.program.account.score.fetch(
        this.getScore(this.orgAddress, applicant),
        "confirmed"
      );
    } catch (err) {
      console.error("Fetch score account", err);
      throw err;
    }
  }

  public async verify(applicant: PublicKey) {
    const score = await this.program.account.score.fetch(
      this.getScore(this.orgAddress, applicant),
      "confirmed"
    );
    return await this.program.methods
      .verify()
      .accounts({
        authority: this.authority.publicKey,
        metadata: this.getMetadata(score.mint),
        org: this.orgAddress,
        orgMint: this.orgMint.publicKey,
        collectionMaster: this.orgMaster,
        collectionMetadata: this.orgMetadata,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([this.authority])
      .rpc({
        skipPreflight: true,
        commitment: "confirmed",
      });
  }

  public async submitScore(recieved_score: ICreativesScoresAirtable) {
    //const applicant = new PublicKey(recieved_score["Wallet Address"][0]);
    //below line should be used because i have changed it in its structure
    const applicant = new PublicKey(recieved_score["Wallet Address"]);
    //const applicant = new PublicKey("HKgZsQq4HrGSF4iMrBzuqmZ8AhzcYuhESJTGQhZrPhk5");
    try {
      const score = await this.program.account.score.fetch(
        this.getScore(this.orgAddress, applicant),
        "confirmed"
      );
      let smartcontract_score = [
        Number(recieved_score["Hard Skill (Calculated)"]),
        Number(recieved_score.Creativity_design_sense),
        Number(recieved_score.Strategic_thinking),
        Number(recieved_score.Communication_presentation),
        Number(recieved_score.Feedback_listening),
        Number(recieved_score.Accountability),
        Number(recieved_score.Team_collaboration),
        Number(recieved_score.Management_organisation),
        Number(recieved_score.Leadership_guidance),
        Number(recieved_score.Attention_to_detail),
      ];
      smartcontract_score = smartcontract_score.map((e) => {
        return isFinite(e) ? e : 0;
      });
      console.log(smartcontract_score);
      const submission = new Date(recieved_score["Submitted On"]);
      return await this.program.methods
        .receiveScore(
          smartcontract_score,
          new anchor.BN(submission.getTime() / 1000)
        )
        .accounts({
          authority: this.authority.publicKey,
          applicant,
          org: this.orgAddress,
          metadata: this.getMetadata(score.mint),
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .signers([this.authority])
        .rpc({
          skipPreflight: true,
        });
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // TODO: verify and score functions
}
