import { View, XStack, YStack, Text, useTheme } from "tamagui";
import { WallpaperCard } from "@/components/WallpaperCard";
import { Ionicons } from "@expo/vector-icons";
import { SectionHeader } from "./SectionHeader";
import { buildUrl } from "@/lib/utils";

export function SearchResults({
  searchQuery,
  filteredImages,
  onNavigate,
}: {
  searchQuery: string;
  filteredImages: any[];
  onNavigate: (img: any) => void;
}) {
  const theme = useTheme();

  return (
    <YStack gap="$3" paddingTop="$4" paddingHorizontal="$5">
      <SectionHeader title={`"${searchQuery}"`} subtitle={`${filteredImages.length} wallpaper${filteredImages.length !== 1 ? "s" : ""} found`} noPadding />
      {filteredImages.length === 0 ? (
        <YStack alignItems="center" paddingVertical="$8" gap="$3">
          <View width={64} height={64} borderRadius={20} backgroundColor="$color3" alignItems="center" justifyContent="center">
            <Ionicons name="search-outline" size={28} color={theme.color11?.val} />
          </View>
          <Text color="$color11" fontSize={14}>No results for "{searchQuery}"</Text>
        </YStack>
      ) : (
        <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
          {filteredImages.map((img: any) => (
            <View key={img.id} width="48%">
              <WallpaperCard
                id={img.id}
                imageUri={buildUrl(img.url)}
                categoryName={img.category?.name}
                blurhash={img.blurhash}
                onPress={() => onNavigate(img)}
              />
            </View>
          ))}
        </XStack>
      )}
    </YStack>
  );
}
