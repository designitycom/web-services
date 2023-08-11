import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import { Growth } from "../types/growth";
import { } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const wait = (timeout: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

export class GrowthService {
    private program: Program<Growth>;
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
    };

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
    };

    private getOrg(mint: PublicKey, authority: PublicKey) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("org"), mint.toBuffer(), authority.toBuffer()],
            this.program.programId
        )[0];
    };

    private getScore(orgAddress: PublicKey, applicant: PublicKey) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("score"), orgAddress.toBuffer(), applicant.toBuffer()],
            this.program.programId
        )[0];
    };

    constructor(connection: Connection, authority: Keypair, mint: Keypair) {
        this.authority = authority;
        this.orgMint = mint;

        let w = new Wallet(this.authority);
        const env = new anchor.AnchorProvider(connection, w, {
            commitment: "confirmed",
        });
        anchor.setProvider(env);
        this.program = anchor.workspace.Growth as Program<Growth>;
        // wtf is programID
        this.orgAddress = this.getOrg(this.orgMint.publicKey, this.authority.publicKey);
        this.orgMetadata = this.getMetadata(this.orgMint.publicKey);
        this.orgMaster = this.getMasterEdition(this.orgMint.publicKey);
        this.orgATA = getAssociatedTokenAddressSync(
            this.orgMint.publicKey,
            this.orgAddress,
            true
        );
        console.log("Growth constructed");
    }

    public async createOrganization(name: string, weights: number[], ranges: number[], levels: Array<Array<number>>, domain: string, min_reviews: number) {
        const tx = await this.program.methods
            .createOrganization(weights, Buffer.from(ranges), levels, name, min_reviews, domain)
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
                skipPreflight: true,
            });
        console.log("Create ORG tx:", tx);
        return await this.program.account.org.fetch(this.orgAddress);
    }

    public async createRegisterMint(mint: Keypair){
        console.log(`creating mint by ${this.authority.publicKey.toBase58()}`);
        return await createMint(
            this.program.provider.connection,
            this.authority,
            this.orgAddress,
            this.orgAddress,
            0,
            mint,
            {
                commitment: "confirmed"
            }
        );
    }

    public async register(name: string, applicant: PublicKey, mint: PublicKey) {
        console.log("ATA");
        // await wait(10000);
        console.log(this.program.provider.connection);
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
        console.log("ATA", registerMintATA);
        const tx1 = await this.program.methods
            .register(name)
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
                commitment: "confirmed"
            });
            return await this.getScoreAccount(applicant);
    }

    public async getScoreAccount(applicant: PublicKey) {
        try {
            return await this.program.account.score.fetch(this.getScore(this.orgAddress, applicant));
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // TODO: verify and score functions
}