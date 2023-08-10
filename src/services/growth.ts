import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

import { Growth } from "../types/growth";
import { } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

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

    constructor(rpc: string, authority: Keypair, mint: Keypair) {
        this.authority = authority;
        this.orgMint = mint;

        let w = new Wallet(this.authority);
        const c = new Connection(rpc);
        const env = new anchor.AnchorProvider(c, w, {
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

    public async register(name: string, applicant: PublicKey, mint: Keypair) {
        const applicanMint = await createMint(
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
        let registerMintATA = await getOrCreateAssociatedTokenAccount(
            this.program.provider.connection,
            this.authority,
            mint.publicKey,
            applicant
        );
        const tx1 = await this.program.methods
            .register(name)
            .accounts({
                authority: this.authority.publicKey,
                applicant: applicant,
                org: this.orgAddress,
                collectionMaster: this.orgMaster,
                score: this.getScore(this.orgAddress, applicant),
                registerMint: mint.publicKey,
                metadata: this.getMetadata(mint.publicKey),
                tokenAccount: registerMintATA.address,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([this.authority])
            .rpc({
                skipPreflight: true,
            });
        return await this.program.account.org.fetch(this.orgAddress);;
    }
}