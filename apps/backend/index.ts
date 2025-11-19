import express from 'express'
import cors from 'cors'
import { prismaClient } from "db/client";
import { authMiddleware } from './middleware';
import jwt from 'jsonwebtoken';
import { SignupSchema } from "common/inputs";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.post("/signin", async (req,res) => {
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

app.get("/calender", authMiddleware, (req,res) => {

});

app.listen(port , () => {
    console.log(`Listening On Port : ${port}`);
})