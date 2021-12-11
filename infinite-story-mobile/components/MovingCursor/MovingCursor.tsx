import React, { useState, ReactNode } from 'react';
import { Animated } from 'react-native';

interface Props {
  children?: ReactNode;
  style?: StyleSheet;
}

export const MovingCursor = ({ children, style }: Props) => {
  const [left] = useState(new Animated.Value(3)); // Initial value for left: 3

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(left, {
          toValue: -3,
          duration: 500
        }),
        Animated.timing(left, {
          toValue: 3,
          duration: 500
        })
      ]),
      {}
    ).start();
  }, []);

  return (
    <Animated.View // Special animatable View
      style={{
        ...style,
        left: left // Bind left to animated value
      }}
    >
      {children}
    </Animated.View>
  );
};
