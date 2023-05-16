import controller from "../controller"
import {Request,Response} from "express";
import * as jose from 'jose'

   
class TestController extends controller{
     check=async(req:Request,res:Response)=>{

        const idToken=req.body.idToken
        const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
        const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
          algorithms: ["ES256"],
        });
        res.send((jwtDecoded.payload as any).wallets[0].public_key)

    }

    
}

export default new TestController