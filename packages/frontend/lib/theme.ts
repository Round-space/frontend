// 1. import `extendTheme` function
import { extendTheme } from '@chakra-ui/react'

// 2. Add your color mode config
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  // fonts: {
  //   // heading: `Inter, ${base.fonts.heading}`,
  //   // body: `Inter, ${base.fonts.body}`,
  // },
  fonts: {
    heading: `Manrope, sans-serif`,
    body: `Manrope, sans-serif`,
  },
  components: {
    Button: {
      // 1. We can update the base styles
      baseStyle: {
        borderRadius: 'md',
      },
      variants: {
        connect: {
          minWidth: 44,
          position: 'relative',
          border: '2px solid',
          borderRadius: 'full',
          borderColor: '#878787',
          transition: 'box-shadow 0.3s cubic-bezier(.18,.89,.45,1.36)',
          _hover: {
            boxShadow: 'md',
          },
          _active: {
            boxShadow: 'md',
          },
          '&[data-connected=""]': {
            borderColor: 'green',
            boxShadow: 'md',
          },
        },
      },
    },
  },
}

// 3. extend the theme
const theme = extendTheme(config)

export default theme
