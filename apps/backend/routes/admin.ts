import { Router } from "express";
import { prismaClient } from "db/client";
import jwt from "jsonwebtoken"
import { CreateUserSchema, SendSchema, SignupSchema } from "common/inputs";
import { AdminauthMiddleware } from "../middleware";
import  axios  from "axios";
import { TSSCli } from "solana-mpc-tss-lib/mpc";
import { NETWORK } from "common/solana";

const MPC_SERVERS = [
    "http://localhost:5001",
    // "http://localhost:5002",
    // "http://localhost:5003",
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
        return response.data
    }))

    const aggregatedPublicKey = cli.aggregateKeys(responses.map((r) => r.data.publicKey), MPC_THRESHOLD)
    await prismaClient.user.update({
        where:{id: user.id},
        data:{
            publicKey: aggregatedPublicKey.aggregatedPublicKey
        }
    })

    await cli.airdrop(aggregatedPublicKey.aggregatedPublicKey, 1000_000_000);

    res.json({
        message: "User Created",
        user
    })
})

adminRouter.post("/send", AdminauthMiddleware, async (req, res) => {
    const {success, data} = SendSchema.safeParse(req.body);
    if(!success){
        res.status(403).json({
            message: "Incorrect Credentials"
        })
        return;
    }
})