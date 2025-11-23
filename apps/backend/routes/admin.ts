import { Router } from "express";
import { prismaClient } from "db/client";
import jwt from "jsonwebtoken"
import { CreateUserSchema, SendSchema, SignupSchema } from "common/inputs";
import { AdminauthMiddleware } from "../middleware";
import  axios  from "axios";
import { TSSCli } from "solana-mpc-tss-lib/mpc";
import { NETWORK } from "common/solana";

const MPC_SERVERS = [
    "http://localhost:4000",
    // "http://localhost:4001",
    // "http://localhost:4002",
]

const MPC_THRESHOLD = Math.max(1, MPC_SERVERS.length - 1);

const cli = new TSSCli(NETWORK);

const adminRouter = Router();

export default adminRouter;

adminRouter.post("/signin", async (req,res) => {
    const {success, data} = SignupSchema.safeParse(req.body);
    if(!success){
        res.status(403).json({
            message: "Incorrect Credentials"
        })
        return;
    }

    const email = data.email;
    const password = data.password;

    const user = await prismaClient.user.findFirst({
        where:{
            email : email
        }
    })
    if(!user){
        res.status(403).json({
            message: "User Does Not Exist"
        })
        return;
    }
    if(user.password !== password){
        res.status(403).json({
            message: "Incorrect Password"
        })
    }

    const token = jwt.sign({
        userId: user.id
    },process.env.ADMIN_JWT_SECRET!);

    res.json({
        token,
        message: "Signed In Successfully"
    })

});

adminRouter.post("/create-user", AdminauthMiddleware, async (req, res) => {
    const {success, data} = CreateUserSchema.safeParse(req.body);
    if(!success){
        res.status(403).json({
            message:"Incorrect Credentials"
        })
        return;
    }

    const user = await prismaClient.user.create({
        data:{
            email: data.email,
            password: data.password,
            phone: String(data.phone),
            role: "USER"
        }
    })

    const responses = await Promise.all(MPC_SERVERS.map(async (server) => {
        const response = await axios.post(`${server}/create-user`, {
            userId: user.id
        })
        return response.data ;
    }))

    const aggregatedPublicKey = cli.aggregateKeys(responses.map((r) => r.publicKey), MPC_THRESHOLD)
    await prismaClient.user.update({
        where:{id: user.id},
        data:{
            publicKey: aggregatedPublicKey.aggregatedPublicKey
        }
    })

    await cli.airdrop(aggregatedPublicKey.aggregatedPublicKey, 0.1);

    res.json({
        message: "User Created",
        user: {
            ...user,
            publicKey: aggregatedPublicKey.aggregatedPublicKey
        }
    })
})

adminRouter.post("/send", AdminauthMiddleware, async (req, res) => {
    const {success, data} = SendSchema.safeParse(req.body);
    const blockhash = await cli.recentBlockHash();
    if(!success){
        res.status(403).json({
            message: "Incorrect Credentials"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where:{
            id: req.userId
        }
    });

    if(!user){
        res.status(403).json({
            message: "User Does Not Exist"
        })
        return;
    }

    const step1Responses = await Promise.all(MPC_SERVERS.map(async (server) => {
        const response = await axios.post(`${server}/send/step-1`, {
            to: data.to,
            amount: data.amount,
            userId: req.userId,
            recentBLockhash: blockhash
        })
        return response.data
    }))

    const step2Responses = await Promise.all(MPC_SERVERS.map(async (server, index) => {
        const response = await axios.post(`${server}/send/step-2`, {
            to: data.to,
            amount: data.amount,
            userId: req.userId,
            recentBlockhash: blockhash,
            step1Response: step1Responses[index],
            allPublicNonces: JSON.stringify(step1Responses.map((r) => r.response.publicNonce))
        })
        return response.data
    }))

    const partialSignatures = step2Responses.map((r) => r.response);

    const transactionDetails = {
        amount: data.amount,
        to: data.to,
        from: user.publicKey,
        network: NETWORK,
        memo: undefined,
        recentBlockhash: blockhash
    }

    const signature = await cli.aggregateSignaturesAndBroadcast(
        JSON.stringify(partialSignatures),
        JSON.stringify(transactionDetails),
        JSON.stringify({
            aggregatedPublicKey: user.publicKey,
            participantKeys: step2Responses.map((r) => r.publicKey),
            threshold: MPC_THRESHOLD
        }),
    );
    res.json({
        signature
    })
})