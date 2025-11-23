import express from "express";
import { TSSCli } from "solana-mpc-tss-lib/mpc";
import { prismaClient } from "mpc-db/client";
import {NETWORK} from "common/solana";

const app = express();
const port = process.env.PORT || 4000;
const cli = new TSSCli(NETWORK);

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

app.post("/send/step1", async (req, res) => {
    const {to, amount, userId} = req.body;
    const user = await prismaClient.keyShare.findFirst({
        where: {userId}
    })
    if(!user){
        res.status(403).json({
            message: "User not found"
        })
    }



})

app.listen(port, () => {
    console.log(`Listening On Port: ${port}`);
});