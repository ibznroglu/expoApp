import React from 'react'
import { Text } from 'react-native'

const TextCustom = ({style, fontSize=16, children}) => {
  return (
      <Text style={{...style, fontSize}}>{children}</Text>
  )
}

export default TextCustom