import Feather from "@expo/vector-icons/Feather";
import { Button, styled } from "tamagui";

const StyledRoundButton = styled(Button, {
  position: "absolute",
  bottom: 24,
  right: 24,
  width: 64,
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 32,
  backgroundColor: "$blue10",
  shadowColor: "$shadowColor",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  zIndex: 100,
  hoverStyle: {
    backgroundColor: "$blue11",
  },
  pressStyle: {
    backgroundColor: "$blue9",
  },
});

type FABProps = {
  onPress: () => void;
};

export const FloatingActionButton = ({ onPress }: FABProps) => {
  return (
    <StyledRoundButton onPress={onPress}>
      <Feather name="plus" size={32} color="white" />
    </StyledRoundButton>
  );
};
