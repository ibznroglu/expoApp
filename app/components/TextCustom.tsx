import React, { ReactNode } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface TextCustomProps {
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  children: ReactNode;
}

const TextCustom: React.FC<TextCustomProps> = ({ style, fontSize = 16, children }) => {
  return (
    <Text style={[style, { fontSize }]}>{children}</Text>
  )
}

export default TextCustom