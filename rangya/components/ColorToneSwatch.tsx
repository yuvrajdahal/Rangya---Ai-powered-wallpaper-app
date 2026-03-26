import { View } from "tamagui";

type ColorToneSwatchProps = {
  color: string;
};

export const ColorToneSwatch = ({ color }: ColorToneSwatchProps) => {
  return (
    <View
      width={48}
      height={48}
      borderRadius={12}
      backgroundColor={color}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
    />
  );
};
