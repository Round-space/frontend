import { Button, Heading, Tooltip, Wrap, WrapItem, Spacer, Box, Stack, Text, ButtonGroup, Tag } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import templates from "../../../../../constants/bountyTemplates"
import templateCategories from "../../../../../constants/templateCategories";
import { useAppDispatch, RootState, useAppSelector } from "../../../../../reducers";
import { setUseTemplate } from "../../../../../reducers/dashboard/state";

export default function CreateFromTemplate(): JSX.Element {

  const router = useRouter();
  const dispatch = useAppDispatch();
  const dashBoardState = useAppSelector((state: RootState) => { return state.dashBoard });
  const { board } = dashBoardState;
  const createBounty = useCallback((index: number) => {
    dispatch(setUseTemplate(index));
    router.push(`/dashboard/${board}/bounty/create`);
  }, [board])

  return (
    <>
      <Heading mb={5} textAlign="center" size="md">Templates</Heading>
      {templateCategories.map((category: any) => {
        return (
          <>
            <Spacer my={7} />
            <Heading mb={1} size="md">{category.category_heading}</Heading>
            <Heading mb={3} color="gray.400" size="xs">{category.category_description}</Heading>

            <Wrap spacing="20px">
              {
                templates.map((item: any, index: number) => {
                  const { template, template_description, template_category, good_first } = item;
                  if (template_category != category.template_category) return <></>

                  else
                    return (
                      <>
                        <WrapItem>
                          <Box width="xs" height="200px" borderWidth="thin" borderColor="gray.300" rounded="xl" boxShadow="base" p={4}>
                            {good_first &&
                              <Tooltip rounded="xl" bg='gray.300' color='black' label='This is great issue to use to get started with working with your community.'>
                                <Tag>Good First Issue</Tag>
                              </Tooltip>
                            }
                            <Stack my='3' spacing='3'>
                              <Heading size='sm'>{template}</Heading>

                              <Text noOfLines={3}>
                                {template_description}
                              </Text>
                            </Stack>
                            <ButtonGroup spacing='2'>
                              <Button colorScheme={dashBoardState?.metadata?.themeColor} key={index} onClick={() => createBounty(index)}>Use This Template</Button>
                            </ButtonGroup>
                          </Box>
                        </WrapItem>
                      </>)
                })
              }
            </Wrap>

          </>
        );
      })}
    </>
  )
}