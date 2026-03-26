import Feather from "@expo/vector-icons/Feather";
import { TouchableOpacity } from "react-native";
import { Text, XStack, YStack, useTheme } from "tamagui";

export function SectionHeader({
  title,
  subtitle,
  showSeeAll = false,
  onSeeAll,
  noPadding = false,
}: {
  title: string;
  subtitle: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  noPadding?: boolean;
}) {
  const theme = useTheme();
  const accentColor = theme.blue10?.val ?? "#3B82F6";

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={noPadding ? 0 : "$4"}
    >
      <YStack gap="$0.5">
        <Text
          fontSize={18}
          fontWeight="800"
          color="$color"
          letterSpacing={-0.3}
        >
          {title}
        </Text>
        <Text fontSize={12} color="$color11" marginTop={1}>
          {subtitle}
        </Text>
      </YStack>
      {showSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <XStack alignItems="center" gap={3}>
            <Text fontSize={13} fontWeight="600" color="$blue10">
              See all
            </Text>
            <Feather name="chevron-right" size={13} color={accentColor} />
          </XStack>
        </TouchableOpacity>
      )}
    </XStack>
  );
}
