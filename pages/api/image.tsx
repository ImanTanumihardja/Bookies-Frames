import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import {kv} from "@vercel/kv";
import satori from "satori";
import { join } from 'path';
import * as fs from "fs";

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Get the poll data from database
        const count49ers: number = await kv.get('49ers') || 0
        const countCheifs: number = await kv.get('Chiefs') || 0

        const totalVotes = count49ers + countCheifs

        const percent49ers = totalVotes ? Math.round(count49ers / totalVotes * 100) : 0
        const percentCheifs = totalVotes ? Math.round(countCheifs / totalVotes * 100) : 0
        
        const pollData = {
            question: 'Who will win Super Bowl LVIII?',
            options: [{votes: countCheifs, 
                      percentOfTotal: percentCheifs,
                      text: `49ers: ${countCheifs} votes`},
                      {votes: count49ers, 
                       percentOfTotal: percent49ers,
                       text: `49ers: ${count49ers} votes`},
                    ]
        }

        const svg = await satori(
            <div style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: 'f4f4f4',
                padding: 50,
                lineHeight: 1.2,
                fontSize: 24,
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 20,
                }}>
                    <h2 style={{textAlign: 'center', color: 'lightgray'}}>{pollData.question}</h2>
                    {
                        pollData.options.map((opt, index) => {
                            return (
                                <div style={{
                                    backgroundColor: '#007bff',
                                    color: '#fff',
                                    padding: 10,
                                    marginBottom: 10,
                                    borderRadius: 4,
                                    width: `${opt.percentOfTotal}%`,
                                    whiteSpace: 'nowrap',
                                    overflow: 'visible',
                                }}>{opt.text}</div>
                            )
                        })
                    }
                    {/*{showResults ? <h3 style={{color: "darkgray"}}>Total votes: {totalVotes}</h3> : ''}*/}
                </div>
            </div>
            ,
            {
                width: 600, height: 400, fonts: [{
                    data: fontData,
                    name: 'Roboto',
                    style: 'normal',
                    weight: 400
                }]
            })

        // Convert SVG to PNG using Sharp
        const pngBuffer = await sharp(Buffer.from(svg))
            .toFormat('png')
            .toBuffer();

        // Set the content type to PNG and send the response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'max-age=10');
        res.send(pngBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
}