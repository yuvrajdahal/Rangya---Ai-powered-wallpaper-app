import React, { useEffect } from "react";
import { View, ViewProps } from "tamagui";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";

type SkeletonProps = ViewProps & {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export const Skeleton = ({
  width,
  height,
  borderRadius = 8,
  ...props
}: SkeletonProps) => {
  const opacity = useSharedValue(0.3);
  const colorScheme = useColorScheme();
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedView
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor={colorScheme === "dark" ? "$white10" : "$black10"}
      style={animatedStyle}
      {...props}
    />
  );
};
