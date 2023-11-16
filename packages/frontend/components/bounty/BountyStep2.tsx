
import { DeleteIcon } from "@chakra-ui/icons";
import {
    Stack, Box, Heading,
    FormControl, Text, Divider, Checkbox, FormHelperText, FormLabel, Input, HStack, Button, Flex, Spacer
} from "@chakra-ui/react";

import { useEffect } from "react";

import PopoverGuide from "../ui/PopoverGuide";
import PriceSelector from "../ui/PriceSelector";
import { RequiredBadge } from "../ui/RequiredBadge";
import VotingNFTSetter from "../ui/NFTSetter";
import GnosisPopup from "./GnosisPopup";
import { useAppSelector, RootState } from "../../reducers";

export default function BountyStep2({ bountyMetadata, setBountyMetadata, invalidity, setInvalidity }): JSX.Element {
    // get dashboard state
    const dashBoardState = useAppSelector((state: RootState) => { return state.dashBoard });
    const themeColor = dashBoardState.metadata?.themeColor;

    const setAmountInvalidity = ({ rewardAmountFiat, rewardAmountToken }) => {
        if (rewardAmountFiat === '' || rewardAmountToken === '') {
            setInvalidity((prev) => ({ ...prev, tokenAmount: '' }));
        }
    }


    const checkMinDate = (e, field) => {

        if (e.target['value'] && e.target['value'] <= new Date().toISOString().split('T')[0]) {
            // add one day to the date
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 1);
            setBountyMetadata((prev) => ({ ...prev, [field]: newDate.toISOString().split('T')[0] }));
        }
    }

    useEffect(() => {
        if (!bountyMetadata?.requiresApplication) {
            setBountyMetadata((prev) => ({ ...prev, applicationsDeadline: '' }));
        }

    }, [bountyMetadata.requiresApplication])

    return (
        <Stack gap={4}>

            <Box>
                <Heading>Round Settings</Heading>
                {/* <Text>Customize how others discover and participate in your project</Text> */}
            </Box>

            <FormControl>
                <FormLabel>
                    <HStack>
                        <Heading size="md" fontWeight="bold">Token Reward</Heading>
                        <RequiredBadge isInvalid={invalidity?.tokenAmount} />

                        <PopoverGuide
                            title="Specify a reward amount in ETH, any ERC20 token or USD."
                            text="You can enter the token amount directly, or it's USD equivalent. If you're not sure how much to enter, add a small amount and set your bounty to allow additional funding."
                        />

                    </HStack>
                </FormLabel>
                <FormHelperText mb={5}>
                    Enter details about the funding wallet and token reward.
                </FormHelperText>
                <GnosisPopup bountyMetadata={bountyMetadata} setBountyMetadata={setBountyMetadata} />

                <Text fontWeight="bold" mb={2}>
                    {invalidity?.tokenAmount ? "Token Reward Amount (ETH or ERC20)" : "Token Reward Amount (ETH or ERC20)"}
                </Text>
                <PriceSelector gnosis={bountyMetadata?.gnosis ?? null} invalidity={{ rewardAmountFiat: invalidity.tokenAmount, rewardAmountToken: invalidity.tokenAmount }} setInvalidity={setAmountInvalidity} />
            </FormControl>

            <FormControl mt={6}>
                <FormLabel>
                    <HStack>
                        <Text fontWeight="bold">Number of Rewards</Text>
                            <PopoverGuide
                                title="Number of Rewards"
                                text="If this reward pool will be split into equal parts, specify how many here. This information will be visible to your contributors."
                            />

                    </HStack>
                </FormLabel>
                <Input
                    mt={2}
                    borderWidth="medium"
                    type="number"
                    name="numRewards"
                    // min={1}
                    value={bountyMetadata?.numRewards}
                    onChange={(event) => {
                        setInvalidity((prev) => ({ ...prev, numberOfRewards: '' }));
                        const num = parseInt(event.target['value']);
                        // num = num ? num : 1;
                        setBountyMetadata((prev) => ({ ...prev, numRewards: num }));
                    }}           
                    onBlur={(event) => {
                        let num = parseInt(event.target['value']);
                        num = (num < 1 || !num) ? 1 : num;
                        setBountyMetadata((prev) => ({ ...prev, numRewards: num }));
                    }}
                    />
            </FormControl>

            <Divider />

            <FormControl mt={2}>
                <FormLabel>
                    <HStack>
                        <Heading size="md" fontWeight="bold">Deadline</Heading>
                        <RequiredBadge isInvalid={invalidity?.deadline} />

                        <PopoverGuide
                            title="Deadline"
                            text="Your Round automatically expires after this deadline and no additional work can be submitted past this date."
                        />
                    </HStack>
                </FormLabel>
                <FormHelperText mb={5}>
                    {invalidity?.deadline ? "Please enter a deadline." : "Your Round will expire after this date - set it carefully."}
                </FormHelperText>

                <Input
                    type="date"
                    value={bountyMetadata?.deadline}
                    isInvalid={invalidity?.deadline}
                    errorBorderColor='red.600'
                    borderWidth="medium"
                    onBlur={(e) => checkMinDate(e, 'deadline')}
                    onInput={(e) => {
                        setInvalidity((prev) => ({ ...prev, deadline: '' }));
                        setBountyMetadata((prev) => ({ ...prev, deadline: e.target['value'] }));
                    }} />
            </FormControl>

            <Divider />


            <FormControl>
                <FormLabel>
                    <HStack>
                        <Heading size="md" fontWeight="bold">Additional Settings</Heading>
                    </HStack>
                </FormLabel>

                <FormHelperText mb={5}>
                    Optional settings that allow you to configure your Round for your community needs.
                </FormHelperText>

                <HStack>
                    <Checkbox colorScheme='purple' isChecked={bountyMetadata?.externalFunding} onChange={(e) => {
                        setBountyMetadata((prev) => ({ ...prev, externalFunding: e.target['checked'] }));
                    }}><Text fontSize='sm' fontWeight="bold">Allow continual funding</Text>
                    </Checkbox>

                    <PopoverGuide
                        title="Allow Continual Funding"
                        text="Additional funds can be added to this Round (e.g. from your community or a sponsor). Round issuers control how those funds are distributed."
                    />
                </HStack>
            </FormControl>

            <FormControl>
                <HStack>
                    <Checkbox colorScheme='purple' isChecked={bountyMetadata?.requiresApplication} onChange={(e) => {
                        setBountyMetadata((prev) => ({ ...prev, requiresApplication: e.target['checked'] }));
                    }}><Text fontSize='sm' fontWeight="bold">Require applications</Text></Checkbox>
                    <PopoverGuide
                        title="Round Applications"
                        text="Use applications if you want to screen Round proposers - e.g. for a longer project that might needs some specialized skills. Without this set, anyone can make a proposal for this Round (it's still up to you which to accept)."
                    />
                </HStack>
                {/* <FormHelperText>Require an before someone can claim bounty amount.</FormHelperText> */}
            </FormControl>

            <FormControl hidden={!bountyMetadata.requiresApplication}>
                <FormLabel>Application Close Date (Optional)</FormLabel>
                <HStack>
                    <Input
                        type="date"
                        value={bountyMetadata?.applicationsDeadline ?? ''}

                        onBlur={(e) => checkMinDate(e, 'applicationsDeadline')}
                        onInput={(e) => {
                            setBountyMetadata((prev) => ({ ...prev, applicationsDeadline: e.target['value'] }));
                        }} />
                    <Button
                        isDisabled={!bountyMetadata.requiresApplication}
                        borderRadius="md"
                        onClick={() => {
                            setBountyMetadata((prev) => ({ ...prev, applicationsDeadline: '' }));
                        }}
                    ><DeleteIcon /></Button>
                </HStack>
            </FormControl>

            <FormControl>
                <HStack>
                    <Checkbox
                        colorScheme='purple'
                        isChecked={bountyMetadata?.publicSubmissions}
                        isDisabled={bountyMetadata?.voting}
                        onChange={(e) => {
                            setBountyMetadata((prev) => ({ ...prev, publicSubmissions: e.target['checked'] }));
                        }}><Text fontSize='sm' fontWeight="bold" >Proposals are visible to all</Text></Checkbox>
                    <PopoverGuide
                        title="Public Proposals"
                        text="Enable public proposals if you want to allow anyone to see the submissions to your Round. This is required if you want to allow your community to vote on proposals."
                    />
                </HStack>
                {/* <FormHelperText>Require an application before someone can claim bounty amount.</FormHelperText> */}
            </FormControl>



            <HStack>
                <Checkbox colorScheme='purple' isChecked={bountyMetadata?.voting} onChange={(e) => {
                    setBountyMetadata((prev) => ({ ...prev, voting: e.target['checked'] }));
                }}><Text fontSize='sm' fontWeight="bold">Enable community voting for proposals</Text></Checkbox>
                <PopoverGuide
                    title="Community Voting for Proposals"
                    text="You can allow your community to vote for the best proposals. Enabling this will require you to set a voting start and end date. You can also set a requirement that voters own a specific NFT (ERC721 or 1155)."
                />
            </HStack>
            {bountyMetadata?.voting &&
                <>
                    <HStack p={1} gap='2'>
                        <FormControl>
                            <FormLabel>
                                <HStack>
                                    <Text fontWeight="bold">Voting Start Date</Text>
                                    <RequiredBadge isInvalid={invalidity?.votingStart} />
                                </HStack>
                            </FormLabel>
                            <FormHelperText mb={2}>
                                {invalidity?.votingStart ? invalidity.votingStart : "Enter a valid date"}
                            </FormHelperText>
                            <Input
                                type="date"
                                value={bountyMetadata?.votingStart ?? ''}
                                isInvalid={invalidity?.votingStart}
                                errorBorderColor='red.600'
                                borderWidth="medium"
                                onBlur={(e) => checkMinDate(e, 'votingStart')}
                                onInput={(e) => {
                                    setInvalidity((prev) => ({ ...prev, votingStart: '' }));
                                    setBountyMetadata((prev) => ({ ...prev, votingStart: e.target['value'] }));
                                }} />

                        </FormControl>
                        <FormControl>
                            <FormLabel>
                                <HStack>
                                    <Text fontWeight="bold">Voting End Date</Text>
                                    <RequiredBadge isInvalid={invalidity?.votingEnd} />
                                </HStack>
                            </FormLabel>
                            <FormHelperText mb={2}>
                                {invalidity?.votingEnd ? invalidity.votingEnd : "Enter a valid date"}
                            </FormHelperText>
                            <Input
                                type="date"
                                value={bountyMetadata?.votingEnd ?? ''}
                                isInvalid={invalidity?.votingEnd}
                                errorBorderColor='red.600'
                                borderWidth="medium"
                                onBlur={(e) => checkMinDate(e, 'votingEnd')}
                                onInput={(e) => {
                                    setInvalidity((prev) => ({ ...prev, votingEnd: '' }));
                                    setBountyMetadata((prev) => ({ ...prev, votingEnd: e.target['value'] }));
                                }} />

                        </FormControl>
                    </HStack>

                    {bountyMetadata?.votingNFT ?

                        <Flex direction={['column', 'row', 'row']}>
                            <Text textAlign="left" fontSize="smaller">Only holders of this NFT contract are allowed to vote for submissions.<br /> {bountyMetadata.votingNFT}</Text>
                            <Spacer /><Button
                                colorScheme={themeColor}
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                    setBountyMetadata((prev: any) => ({
                                        ...prev,
                                        votingNFT: null
                                    }))
                                }}>Remove</Button></Flex>
                        :
                        <VotingNFTSetter label='Tokengate by NFT' nft={bountyMetadata?.votingNFT} themeColor='green' setNft={(value, onClose) => {
                            setBountyMetadata((prev) => ({ ...prev, votingNFT: value }));
                            onClose();
                        }} />
                    }

                    {/* <VotingNFTSetter votingNFT={bountyMetadata?.votingNFT} themeColor='purple' setBountyMetadata={setBountyMetadata} /> */}

                </>
            }

            <Divider />
            <FormControl>
                <Heading size="md" fontWeight="bold">Contact Email
                </Heading>

                <FormHelperText mb={2}>
                    {invalidity?.email ? "Please enter a valid email address." : "Optional, but convenient! You'll only receive notifications when new proposals are submitted - not any marketing emails."}
                </FormHelperText>

                {/* <Tooltip label={invalidity.name} placement='bottom' isOpen={invalidity.name.length > 0} > */}
                <Input
                    value={bountyMetadata?.email ?? ''}
                    isInvalid={invalidity?.email}
                    errorBorderColor='red.600'
                    borderWidth="medium"
                    onInput={(e) => {
                        setInvalidity((prev) => ({ ...prev, email: '' }));
                        setBountyMetadata((prev) => ({ ...prev, email: e.target['value'] }));
                    }} />
                {/* </Tooltip> */}
            </FormControl>
        </Stack>
    )
}