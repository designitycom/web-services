import controller from "../controller"
import express,{Request,Response} from "express";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { ADAPTER_EVENTS, CHAIN_NAMESPACES } from "@web3auth/base";
import jwt from "jsonwebtoken";
import jose from 'node-jose';
import fs from 'fs';
const web3auth = new Web3AuthNoModal({
    clientId: "BKw8hgIPDMl3p6bcYYlZgdXSoIrLyJivtoZWcld40wsN-AM-XUAOkiI-ATvQGJu9x6kRVx3aGtdKQg3EMhM_BrE", // Get your Client ID from Web3Auth Dashboard
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.SOLANA,
      chainId: "0x3",
      rpcTarget: "https://api.devnet.solana.com", // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
    },
    web3AuthNetwork: "testnet", // mainnet, aqua, celeste, cyan or testnet
  });


   
class UserController extends controller{
     dashboard=async(req:Request,res:Response)=>{
        res.send('dashboard')

    }
     login=async(req:Request,res:Response)=>{
        web3auth.init();
        const data = {
           email: "mr.dehdar@gmail.com"
        }
  
    const token = jwt.sign(data, process.env.JWT_SECRET_KEY!);
  
    res.send(token);

    }

    jwk=async(req:Request,res:Response)=>{
        const keyStore = jose.JWK.createKeyStore();

        keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" }).then((result) => {
          fs.writeFileSync(
            "Keys.json",
            JSON.stringify(keyStore.toJSON(true), null, "  ")
          );
        });
    }
    jwks=async(req:Request,res:Response)=>{
        const ks = fs.readFileSync("keys.json");

        const keyStore = await jose.JWK.asKeyStore(ks.toString());
      
        res.send(keyStore.toJSON());
    }

    
}

export default new UserController