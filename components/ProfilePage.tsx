"use client"
import { FunctionComponent } from "react";
import { Container, Table, TableContainer, Tr, Th, Tbody, Td, Thead, HStack, IconButton, Button } from "@chakra-ui/react";
import { UserType } from "@types";
import {usePrivy} from '@privy-io/react-auth';

export type ProfileType = {
    user: UserType,
    wins : number,
    losses : number,
    bets : BetType[]
  };

export type BetType = {
    marketId: string
    prompt: string
    winLoss: string
    token: string
    stake: number
    pick: string
    odd: string
    payout: string
    filled: number
    timestamp: number
}

const Profile: FunctionComponent<ProfileType> = ({
    user=null,
    wins=0,
    losses=0,
    bets=[]
}) => {

    const openInNewTab = (url: string) => {
        console.log(url)
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const {ready, authenticated, logout, user: privyUser} = usePrivy();

    return (
        <Container maxW="container.xl" p={3} marginTop={25} as="main" minH="70vh">
            <HStack paddingBottom={5} justify={"space-between"}>
                <HStack>
                    <IconButton
                        variant="none"
                        icon={<img className="rounded-[50%] w-[100px]" src={`https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(user.pfpUrl)}`} />}
                        onClick={() => {
                            openInNewTab(`https://warpcast.com/${user.username}`);
                        }} 
                        aria-label={""}/>
                    <div className="flex flex-col items-start justify-start gap-[12px] text-6xl">
                        <h2 className="m-0 relative text-inherit font-bold font-inherit inline-block z-[2]">
                        {user.displayName}
                        </h2>
                        <div className="relative text-mid font-inter text-lightgray-300 inline-block">
                        FID #{user.fid}
                        </div>
                    </div>
                </HStack>
                {ready && authenticated && privyUser?.farcaster?.fid == user.fid &&
                <Button onClick={logout}>
                    Disconnect
                </Button>
                }
            </HStack>
            <HStack gap={5} paddingY={5} borderBottom={"1px solid gray"} className="font-inter text-mid">
                <div className="flex flex-row items-start justify-start min-w-[32px] gap-2">
                    <div className="relative font-extrabold inline-block">
                    {bets.length}
                    </div>
                    <div className="relative text-lightgray-300 inline-block">
                    Bets
                    </div>
                </div>
                <div className="flex flex-row items-start justify-start min-w-[32px] gap-2">
                    <div className="relative font-extrabold inline-block">
                    {wins}
                    </div>
                    <div className="relative text-lightgray-300 inline-block">
                    Wins
                    </div>
                </div>
                <div className="flex flex-row items-start justify-start min-w-[32px] gap-2">
                    <div className="relative font-extrabold inline-block">
                    {losses}
                    </div>
                    <div className="relative text-lightgray-300 inline-block">
                    Loses
                    </div>
                </div>
            </HStack>
            <div className="font-bold font-inherit text-5xl mt-7">
                BETS
            </div>
            <TableContainer marginTop="10px">
                <Table variant="unstyled" size="md">
                    <Thead borderBottom={"1px solid gray"}>
                        <Tr color={"gray"} fontSize={"md"}>
                            <Th >Market</Th>
                            <Th >Pick</Th>
                            <Th >Stake</Th>
                            <Th >Odds</Th>
                            <Th >W/L</Th>
                            <Th >Payout</Th>
                            <Th isNumeric >% Filled</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody className="font-inter">
                        {bets.map((bet, index) => {
                            const now = new Date().getTime() / 1000;
                            const elapsedSeconds = Math.ceil(now - bet.timestamp);
                            let timeAgo;
                            if (elapsedSeconds < 60) {
                                timeAgo = `${elapsedSeconds} seconds ago`;
                            } else if (elapsedSeconds < 3600) {
                                const elapsedMinutes = Math.floor(elapsedSeconds / 60);
                                timeAgo = `${elapsedMinutes} minutes ago`;
                            } else {
                                const elapsedHours = Math.floor(elapsedSeconds / 3600);
                                timeAgo = `${elapsedHours} hours ago`;
                            }

                            return (
                                <Tr key={index}>
                                    <Td>
                                        <Button variant="ghost" onClick={() => {
                                            openInNewTab(`http://${window.location.host}/bookies/${bet.marketId}`)
                                        }}>
                                            {bet.prompt}
                                        </Button>
                                    </Td>
                                    <Td>{bet.pick}</Td>
                                    <Td>{bet.stake} ${bet.token}</Td>
                                    <Td>{bet.odd}</Td>
                                    <Td className="font-bold" color={bet.winLoss !== "---" ? bet.winLoss === "W" ? `rgb(0, 255, 0)` : `rgb(255, 0, 0)` : 'white'}>{bet.winLoss}</Td>
                                    <Td>{bet.payout} ${bet.token}</Td>
                                    <Td isNumeric color={`rgb(${255 - bet.filled * 2.55}, ${bet.filled * 2.55}, 0)`}>{bet.filled}%</Td>
                                    <Td fontSize={'small'} color={"gray"}>{timeAgo}</Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Container>
        );
}

export default Profile;