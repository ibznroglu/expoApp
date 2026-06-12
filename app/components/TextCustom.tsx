import React, { ReactNode } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

interface TextCustomProps extends TextProps {
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  children: ReactNode;
}

const TextCustom: React.FC<TextCustomProps> = ({ style, fontSize = 16, children, ...rest }) => {
  return (
    <Text {...rest} style={[style, { fontSize }]}>{children}</Text>
  )
}

export default TextCustom