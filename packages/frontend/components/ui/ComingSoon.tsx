import { Center, Link, Heading } from '@chakra-ui/react'



function ComingSoon() {
    const discordURL = "https://discord.gg/JKjY5tmvSu";

    return (
      <>
    <Center height="80vh" mb={10}>
        <Heading fontSize="md">Coming Soon!&nbsp;<Link href={discordURL} target="_blank" >Hop into our Discord</Link> for product updates.</Heading> 
    </Center>
    {/* <Flex p={2} rounded="2xl" borderWidth="thin" boxShadow="md">
    <iframe src="https://airtable.com/embed/shrYcte8sXeR0qgy2" width="100%" height="800" frameborder="0" onmousewheel=""></iframe>
    </Flex> */}
  </>
  )
}

export default ComingSoon
