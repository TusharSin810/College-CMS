import express from 'express'
import cors from 'cors'
import { prismaClient } from "db/client";
import { authMiddleware } from './middleware';

const app = express();
const port = process.env.PORT || 3000;

app.post("/signin", (req,res) => {

});

app.get("/calender", authMiddleware, (req,res) => {

});

app.use(cors());

app.listen(port , () => {
    console.log(`Listening On Port : ${port}`);
})