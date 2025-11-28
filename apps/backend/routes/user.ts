import { Router } from "express";
import { prismaClient } from "db/client";
import jwt from "jsonwebtoken"
import { SignupSchema } from "common/inputs";
import { authMiddleware } from "../middleware";
import { NETWORK } from "common/solana";
import { SendSchema } from "common/inputs";
import axios from "axios";
import { cli, MPC_SERVERS, MPC_THRESHOLD } from "./admin";

const userRouter = Router();


export default userRouter;

userRouter.post("/signin", async (req,res) => {
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
    },process.env.JWT_SECRET!);

    res.json({
        token,
        message: "Signed In Successfully"
    })

});

userRouter.get("/calender/:courseId", authMiddleware, async (req,res) => {
    const courseId = req.params.courseId;
    const courses = await prismaClient.courses.findFirst({
        where:{
            id: courseId
        }
    })

    const purchase = await prismaClient.purchases.findFirst({
        where:{
            userId: req.userId,
            courseId: courseId
        }
    })

    if(!purchase){
        res.status(411).json({
            message: "You Dont Have access To this Course"
        })
        return;
    }

    if(!courses) {
        res.status(411).json({
            message: "Course with Id not Found"
        })
        return;
    }
    res.json({
        id: courses.id,
        calenderId : courses.calenderNotionId,
    })
});

userRouter.get("/courses", authMiddleware, async (req, res) => {
    const courses = await prismaClient.courses.findMany({
        where:{
            purchases:{
                some:{
                    userId: req.userId
                }
            }
        }
    });
    if(!courses){
        res.status(411).json({
            message: "No Courses Available For the User"
        })
        return;
    }
    res.json({
        courses: courses.map(c => ({
            id: c.id,
            title: c.title,
            slug: c.slug
        }))
    })
})

userRouter.post("/send", authMiddleware, async (req, res) => {
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
        return response.data.response
    }))

    const step2Responses = await Promise.all(MPC_SERVERS.map(async (server, index) => {
        const response = await axios.post(`${server}/send/step-2`, {
            to: data.to,
            amount: data.amount,
            userId: req.userId,
            recentBlockhash: blockhash,
            step1Response: JSON.stringify(step1Responses[index]),
            allPublicNonces: step1Responses.map((r) => r.publicNonce)
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