import { Center } from "@chakra-ui/layout";

function Error({ statusCode }) {
    return (
      <Center fontWeight="bold">
        {statusCode
          ? `Something went wrong (error code:  ${statusCode}). Please visit Support if you need help.`
          : 'An error occurred on the client. Please visit Support if you need help.'}
      </Center>
    )
  }
  
  Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
  }
  
  export default Error;
  