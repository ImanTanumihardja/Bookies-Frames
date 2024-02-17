import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { generateUrl, RequestProps, validateFrameMessage, FrameNames } from '../../../../src/utils';
import { kv } from '@vercel/kv';

const MAX_QUESTIONS = 10;
const EASY_QUESTION_INDEXES = encodeURIComponent([0, 1, 2, 3, 4, 5, 6, 7].toString()) // Make sure matchs with the amount of questions in easy category

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const questions : Record<string, any> = {
    'easy': [
      {
        question: 'Which country won the 2022 World Cup? ',
        options: ['Argentina', 'Brazil', 'Spain', 'Colombia'],
      },
      {
        question: 'How many innings are in a baseball game?',
        options: ['9', '3', '5', '7'],
      },
      {
        question: 'How many miles are in a marathon?',
        options: ['26.2', '24.2', '25.5', '28.2'],
      },
      {
        question: 'What color belt is the highest honor in Karate?',
        options: ['Black', 'Brown', 'White', 'Purple'],
      },
      {
        question: 'How many points is a touchdown worth?',
        options: ['6', '7', '3', '8'],
      },
      {
        question: 'What athlete holds the record for most Olympic medals?',
        options: ['M. Phelps', 'Carl Lewis', 'Usain Bolt', 'Paavo Nurmi'],
      },
      {
        question: 'In soccer, what does the term hattrick mean?',
        options: ['3 goals', '2 redcards', '2 goals', '3 assists'],
      },
      {
        question: 'How many NBA championships did Michael Jordan win with the Chicago Bulls?',
        options: ['6', '7', '3', '4'],
      },
  ],
    'medium': [
      {
        question: 'Who is the oldest active player in the NBA?',
        options: ['Lebron', 'Vince Carter', 'Chris Paul', 'P.J. Tucker'],
      },
      {
        question: 'How many rings are on the Olympic rings?',
        options: ['5', '3', '4', '6'],
      },
      {
        question: 'Which basketball player hold the record for most points scored in a single game?',
        options: ['Wilt C.', 'M. Jordan', 'B. Russell', 'Lebron'],
      },
      {
        question: 'What is the name of the trophy given to the winners of the NHL?',
        options: ['Stanley Cup', 'Gold Puck', 'Rose Bowl', 'Ryder Cup'],
      },
      {
        question: 'Which country has won the most FIFA World Cups?',
        options: ['Brazil', 'Italy', 'Germany', 'England'],
      },
      {
        question: 'Which country invented the sport of basketball?',
        options: ['USA', 'Spain', 'Australia', 'Greece'],
      },
       {
        question: 'What team is Leo Messi on currently?',
        options: ['Inter Miami', 'Barcelona', 'Real Madrid', 'PSG'],
      },
      {
        question: 'Which baseball player has the most home runs of all time?',
        options: ['Barry Bonds', 'Hank Aaron', 'Babe Ruth', 'A-Rod'],
      },
      {
        question: 'How many personal fouls does a player get to be ejected from an NBA basketball game?',
        options: ['6', '5', '7', '4'],
      },
      {
        question: 'Who was the NBA MVP in 2023?',
        options: ['J. Embiid', 'Giannis', 'N. Jokic', 'Lebron'],
      },
  ],
    'hard': [
      {
        question: 'Which country hosted the first ever FIFA World Cup?',
        options: ['Uruguay', 'Paraguay', 'Brazil', 'Germany'],
      },
    {
        question: 'A Grand Slam in tennis means a player winning how many major tournaments in a calendar year?',
        options: ['4', '2', '3', '10'],
      },
  {
        question: 'What is the only team in the NFL to neither host nor play in the Super Bowl?',
        options: ['Browns', 'Jaguars', 'Panthers', 'Texans'],
      },
  {
        question: 'Who holds the record in basketball for the most fouls?',
        options: ['Kareem', 'D. Rodman', 'Lebron', 'D. Green'],
      },
  {
        question: 'Who has the most total assists this season in the NBA?',
        options: ['Trae Young', 'L. Doncic', 'Nikola Jokic', 'J. Harden'],
      },
  {
        question: 'Besides the Buffalo Bills, what is the only other team in NFL history to lose in all four of their Super Bowl appearances?',
        options: ['Vikings', 'Panthers', 'Broncos', '49ers'],
      },
  {
        question: 'Who is the only player in World Cup history to win three World Cup titles?',
        options: ['Pele', 'Gerd Muller', 'Messi', 'Ronaldo'],
      },
  ]
  }

  // Verify the frame request
  const message = await validateFrameMessage(req);
  
  const {followingBookies: isFollowing, fid , button} = message;
  console.log('FID: ', fid.toString())

  // Get user
  let user: any = await kv.hget('trivia', fid.toString());
  if (user === null) {
    user = {score: 0, strikes: 0};
  }

  let count : number = parseInt(req.nextUrl.searchParams.get("count") || '-1')
  const prevCorrectIndex = parseInt(req.nextUrl.searchParams.get("index") || '-1')
  let questionIndexes : number[] = decodeURIComponent(req.nextUrl.searchParams.get("array") || '').split(',').map(Number);
  
  let options : string[] = [];
  let mode : string = 'easy';
  let question : string = '';
  let correctIndex : number = -1;
  let postUrl : string = '';

  if (user?.strikes >= 3) { // You ran out of strikes
    // Game over
    postUrl = `${process.env['HOST']}/api/frames/${FrameNames.TRIVIA}?count=${count}&index=${correctIndex}`
  }
  else if (prevCorrectIndex !== -1 && prevCorrectIndex !== button - 1) { // Got the wrong answer and not first question or
    // Wrong answer
    console.log('Wrong answer');
    user.strikes = parseInt(user.strikes.toString()) + 1;
    user.score = Math.max(count, parseInt(user.score.toString()));
    await kv.hset('trivia', {[fid.toString()]: user});

    // End quiz
    count = -1;
    postUrl = `${process.env['HOST']}/api/frames/${FrameNames.TRIVIA}?count=-1&array=${EASY_QUESTION_INDEXES}`
  }
  else { // Continue game
    console.log('Got the right answer');
    count++;

    // Easy
    let questionIndex : number = questionIndexes[Math.floor(Math.random() * (questionIndexes.length - 1))];

    if (count >= 4 && count < 7) {
      // Easy
      mode = 'medium';
      if (count === 4) {
        questionIndexes = Array.from({ length: (questions[mode].length - 1) }, (_, index) => index + 1);
      }
      questionIndex = questionIndexes[Math.floor(Math.random() * (questionIndexes.length - 1))];
    }
    else if (count >= 7) {
      // Hard
      mode = 'hard';
      if (count === 7) {
        questionIndexes = Array.from({ length: (questions[mode].length - 1) }, (_, index) => index + 1);
      }
      questionIndex = questionIndexes[Math.floor(Math.random() * (questionIndexes.length - 1))];
    }
    else if (count >= MAX_QUESTIONS) {
      user.score = Math.max(count - 1, parseInt(user.score.toString()));
      await kv.hset('trivia', {[fid.toString()]: user});
    }

    options = questions[mode][questionIndex].options;
    question = questions[mode][questionIndex].question;

    // shuffle options but keep the track of the right answer
    const correctAnswer = options[0];
    options = options.sort(() => Math.random() - 0.5);
    correctIndex = options.indexOf(correctAnswer);

    console.log('Question: ', question, ' Correct Answer: ', correctAnswer, ' Options: ', options, ' Correct Index: ', correctIndex);

    // Remove question from array
    questionIndexes.splice(questionIndexes.indexOf(questionIndex), 1);

    postUrl = `${process.env['HOST']}/api/frames/${FrameNames.TRIVIA}?count=${count}&index=${correctIndex}&array=${encodeURIComponent(questionIndexes.toString())}`
  }

  const imageUrl = generateUrl(`api/frames/${FrameNames.TRIVIA}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.PROMPT]: question, [RequestProps.WINS]: count, [RequestProps.LOSSES]: user.strikes}, true, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: count !== -1 && count != MAX_QUESTIONS && user?.strikes < 3 ? [{label:`${options[0]}`, action: 'post'}, {label:`${options[1]}`, action: 'post'}, {label:`${options[2]}`, action: 'post'}, {label:`${options[3]}`, action: 'post'}] : 
              user?.strikes < 3 && count === -1 ? [{label:`Try Again`, action: 'post'}] : 
              [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}],
    postUrl: postUrl,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
