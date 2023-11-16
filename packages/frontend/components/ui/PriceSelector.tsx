/* eslint-disable @typescript-eslint/no-unused-vars, no-console ,react/no-unescaped-entities,react/no-children-prop */
import {
  Box,
  FormControl,
  
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  
  VStack,
  Flex,
  Tooltip,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Image
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { toDecimal } from '../../utils/bignumber'
import { getTokenPrice } from '../../reducers/bountytoken/asyncActions'
import { useAppDispatch, useAppSelector } from '../../reducers/index'
import SelectTokenModal from './SelectTokenModal'
import { setNewBountyAmount } from '../../reducers/bountytoken/reducer'
import { setNewFundAmount } from '../../reducers/bountytoken/fundReducer'
import { useMoralisWeb3Api } from 'react-moralis'

import { useAccount } from 'wagmi'
import { ChevronDownIcon } from '@chakra-ui/icons'

export default function PriceSelector(props): JSX.Element {
  const NULL_AMOUNT = ''
  const dispatch = useAppDispatch()
  const { token } = useMoralisWeb3Api()
  const { data: accountData } = useAccount();
  const account = accountData?.address

  // this price selector can be used for creating bounty as well as funding bounty. So choose the state accordingly
  const bountyTokenState = useAppSelector((state) => props.fund ? state.fundBounty : state.createBounty)

  const tokenPrecision = bountyTokenState.currency?.isNative ? 4 : 2
  
  const initialAmount = bountyTokenState.amount
    ? toDecimal(bountyTokenState.amount, bountyTokenState.currency).toString()
    : ''
  const [usdEquivalent, setUsdEquivalent] = useState(NULL_AMOUNT)
  const [tokenAmount, setTokenAmount] = useState(initialAmount)

  const usdPrecision = 2
  const maxTokenAmount =
    bountyTokenState?.maxAmount && bountyTokenState.currency
      ? toDecimal(bountyTokenState.maxAmount, bountyTokenState.currency)
      : 0
  const conversionRate = bountyTokenState.currencyUsdPrice
  const maxUSD = maxTokenAmount * conversionRate

  useEffect(() => {
    const newUsdValue = toUsdAmount(Number.parseFloat(initialAmount))
    setTokenAmount(initialAmount)
    setUsdEquivalent(newUsdValue)
    if (bountyTokenState.currency) {
      getTokenPrice(dispatch, bountyTokenState.currency, token, props.fund ); // true for updating the fundBounty state
    }
  }, [
    bountyTokenState.currency,
    token,
    account,
    bountyTokenState.currencyUsdPrice,
  ])

  // useEffect(()=>{
  //   if(bountyTokenState.currencyUsdPrice > 0.001
  //      && usdEquivalent == NULL_AMOUNT ){
  //       const newUsdValue = toUsdAmount(Number.parseFloat(tokenAmount));
  //       setUsdEquivalent( newUsdValue);
  //   }
  // },[bountyTokenState.currencyUsdPrice, account, token]);

  // const handleClickMaxAmount = () => {
  //   if (bountyTokenState.currency) {
  //     const newAmount = maxTokenAmount.toFixed(tokenPrecision)
  //     setTokenAmount(newAmount)
  //     const newUsd = toUsdAmount(Number.parseFloat(newAmount))
  //     setUsdEquivalent(newUsd)
  //     dispatch( props.fund ? setNewFundAmount(newAmount) : setNewBountyAmount(newAmount) )
  //   }
  // }

  const toTokenAmount = (usd: number) => {
    if (
      Number.isNaN(usd) ||
      Number.isNaN(conversionRate) ||
      conversionRate < 0.000000001
    )
      return NULL_AMOUNT
    return (usd / conversionRate).toFixed(tokenPrecision)
  }

  const toUsdAmount = (tokenAmount: number) => {
    if (
      Number.isNaN(tokenAmount) ||
      Number.isNaN(conversionRate) ||
      conversionRate < 0.000000001
    )
      return NULL_AMOUNT
    return (tokenAmount * conversionRate).toFixed(usdPrecision)
  }

  const handleUsdAmountChanged = (valueAsString, valueAsNumber) => {
    props.setInvalidity({ ...props.invalidity, rewardAmountFiat: '' })
    if (!(valueAsNumber < 0)) {
      setUsdEquivalent(valueAsString)
      const newTokenAmount = toTokenAmount(valueAsNumber)
      
      setTokenAmount(newTokenAmount)

      dispatch(props.fund ? setNewFundAmount(newTokenAmount) : setNewBountyAmount(newTokenAmount))
    }
  }

  const handleTokenAmountChanged = (valueAsString, valueAsNumber) => {
    props.setInvalidity({ ...props.invalidity, rewardAmountToken: '' })
    if (!(valueAsNumber < 0)) {
      setTokenAmount(Number.isNaN(valueAsNumber) ? NULL_AMOUNT : valueAsString)
      const newUsdValue = toUsdAmount(valueAsNumber)
      setUsdEquivalent(newUsdValue)
      dispatch(props.fund ? setNewFundAmount(valueAsNumber) : setNewBountyAmount(valueAsNumber))
    }
  }

  return (
    <Grid
      w="100%"
      templateRows="repeat(1, 1fr)"
      templateColumns="repeat(2, 1fr)"
      gap={3}
    >
      <GridItem colSpan={1}>
        <Box w="100%">
          <VStack>
            <FormControl id="amount">
              <NumberInput
                isInvalid={props.invalidity['rewardAmountToken'].length > 0}
                errorBorderColor='red.600'
                isDisabled={bountyTokenState.readingCurrencyPrice}
                min={0.0}
                max={maxTokenAmount}
                value={tokenAmount}
                step={0.01}
                mt={1}
                size="lg"
                keepWithinRange={true}
                clampValueOnBlur={true}
                onChange={handleTokenAmountChanged}
                // onKeyPress={preventMinus}
              >
                <InputGroup>
                  <InputLeftAddon children={(
                    !props?.token ?
                      <SelectTokenModal fund={props.fund} gnosis={props.gnosis} /> :
                      <Flex gap={1} alignItems="center">
                        {
                          props.token?.logo && 
                          <Image 
                          src={props.token?.logo.startsWith('/') ? props.token?.logo : '/'+ props.token?.logo} 
                          alt={props.token?.symbol} 
                          w="18px" h="18px" /> 
                        }
                        <strong>{props.token?.symbol}</strong>
                      </Flex>
                    
                  )}/>
                  <NumberInputField
                    borderLeftRadius="0"
                    borderRightRadius="md"
                    border="2px"
                    shadow="sm"
                    name="rewardAmountToken"
                  />
                </InputGroup>
              </NumberInput>
              
            </FormControl>
          </VStack>
        </Box>
      </GridItem>

      <GridItem colSpan={1}>
        <Box>
          {/* <Text fontSize="md">USD Equivalent:</Text> */}
          {/* <Tooltip
            label={props.invalidity['rewardAmountFiat']}
            placement="bottom"
            isOpen={props.invalidity['rewardAmountFiat'].length > 0}
          > */}
            <NumberInput
              isInvalid={props.invalidity['rewardAmountFiat'].length > 0}
              errorBorderColor='red.600'
              isDisabled={bountyTokenState.readingCurrencyPrice || !conversionRate}
              min={0.0}
              max={maxUSD}
              clampValueOnBlur={true}
              precision={2}
              value={usdEquivalent}
              step={1}
              mt={1}
              size="lg"
              keepWithinRange={true}
              onChange={handleUsdAmountChanged}
            >
              <InputGroup>                      
                <NumberInputField
                  borderLeftRadius="md"
                  borderRightRadius="0"
                  border="2px"
                  name="rewardAmountFiat"
                  shadow="sm"
                />
                <InputRightAddon children={(<strong>USD ($)</strong>)}/>
              </InputGroup>
            </NumberInput>
          {/* </Tooltip> */}
        </Box>
      </GridItem>
    </Grid>
  )
}
