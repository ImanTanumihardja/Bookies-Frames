const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
const fs = require('fs')
const path = require('path');
dotenv.config({ path: ".env"})
import { Event } from '../../app/types';
import {Accounts} from '../../src/utils'

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

export default async function createEvent(eventName=``, startDate=0, odds=[0.5, 0.5], options=["", ""], prompt="", host="") {
  if (startDate < new Date().getTime()) {
    throw new Error('Start date is invalid')
  }

  if (odds.length != options.length) {
    throw new Error('Odds and options length do not match')
  }

  // Check if any of the options are empty
  if (options.some((option) => option === "")) {
    throw new Error('Options cannot be empty')
  }

  if (odds.reduce((a, b) => a + b, 0) != 1 && odds.length === 2) {
    throw new Error('The sum of odds is not equal to 1')
  }

  // Check if event already exists
  const eventExists = await kv.exists(`${eventName}`)
  if (eventExists) {
    throw new Error(`Event ${eventName} already exists`)
  }

  if (host !== Accounts.ALEA && host !== Accounts.BOOKIES && host !== Accounts.BOTH) {
    throw new Error('Invalid host')
  }

  let event: Event = {startDate: startDate, result: -1, odds: odds, options: options, prompt: prompt, host} as Event;
  await kv.hset(`${eventName}`, event);

  // Create poll
  const poll = {0: 0, 1: 0, 2: 0, 3: 0} as Record<number, number>
  await kv.hset(`${eventName}:poll`, poll)

  // Create bets list 
  await kv.del(`${eventName}:bets`)

  event = await kv.hgetall(`${eventName}`)

  console.log(`Event: ${eventName}`)
  console.log(event)
  console.log(`Poll`, await kv.hgetall(`${eventName}:poll`))
  console.log(`Bets`, await kv.smembers(`${eventName}:bets`))
}

if (require.main === module) {
  // Read event file using fs
  const filePath = path.join(__dirname, `../../event.json`);
  const eventData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (eventData === null) {
    throw new Error('Event data is null')
  }

  const eventName = eventData.eventName;
  const startDate = eventData.startDate;
  const odds = eventData.odds;
  const multiplier = eventData.multiplier;
  const options = eventData.options;
  const prompt = eventData.prompt;

  createEvent(eventName, startDate, odds, multiplier, options, prompt).then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
