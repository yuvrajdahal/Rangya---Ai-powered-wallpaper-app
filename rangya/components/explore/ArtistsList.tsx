import { ScrollView } from "react-native";
import { YStack, XStack, Text, useTheme } from "tamagui";
import { Skeleton } from "@/components/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { SectionHeader } from "./SectionHeader";
import { ArtistChip } from "./ArtistChip";

export function ArtistsList({
  artists,
  isLoading,
  isDark,
  onSeeAll,
}: {
  artists: any[];
  isLoading: boolean;
  isDark: boolean;
  onSeeAll?: () => void;
}) {
  const theme = useTheme();

  return (
    <YStack gap="$3">
      <SectionHeader title="Artists" subtitle="Creators uploading to Rangya" showSeeAll onSeeAll={onSeeAll} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
        <XStack gap="$4">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <YStack key={i} alignItems="center" gap="$2">
                <Skeleton width={72} height={72} borderRadius={36} />
                <Skeleton width={56} height={10} borderRadius={5} />
              </YStack>
            ))
          ) : artists.length > 0 ? (
            artists.map((artist) => (
              <ArtistChip key={artist.id} artist={artist} isDark={isDark} />
            ))
          ) : (
            <YStack paddingVertical="$3" paddingHorizontal="$2" alignItems="center" gap="$2">
              <Ionicons name="people-outline" size={28} color={theme.color11?.val} />
              <Text color="$color11" fontSize={12}>No artists yet</Text>
            </YStack>
          )}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
