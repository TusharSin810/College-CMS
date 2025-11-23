import express from "express";
import { TSSCli } from "solana-mpc-tss-lib/mpc";
import { prismaClient } from "mpc-db/client";
import {NETWORK} from "common/solana";

const app = express();
const port = process.env.PORT || 4000;
const cli = new TSSCli(NETWORK);

app.use(express.json());

app.post("/create-user", async (req, res) => {
    const {userId} = req.body;
    const participant = await cli.generate();

    prismaClient.keyShare.create({
        data:{
            userId,
            publicKey: participant.publicKey,
            secretKey: participant.secretKey
        }
    })

    res.json({
        publicKey: participant.publicKey,
    })

})

app.post("/send/step-1", async (req, res) => {
    const {to, amount, userId, recentBlockHash} = req.body;
    const user = await prismaClient.keyShare.findFirst({
        where: {userId}
    })
    if(!user){
        res.status(403).json({
            message: "User not found"
        })
        return;
    }



    const response = await cli.aggregateSignStepOne(
        user?.secretKey,
        to,
        amount,
        'Multi-sig payment',
        recentBlockHash
    );

    res.json({
        response
    })

})

app.post("/send/step-2", async (req, res) => {
    const {to, amount, userId, recentBLockhash, step1Responses, allPublicNonces} = req.body;
    const user = await prismaClient.keyShare.findFirst({
        where: {userId}
    })
    if(!user) {
        res.status(403).json({
            message: "User Not Found"
        })
        return;
    }

    const response2 = await cli.aggregateSignStepTwo(
        step1Responses,
        user.secretKey,
        to,
        amount,
        allPublicNonces,
        undefined,
        recentBLockhash
    )
    res.json({
        response2,
        publicKey: user.publicKey
    })
})

app.listen(port, () => {
    console.log(`Listening On Port: ${port}`);
});