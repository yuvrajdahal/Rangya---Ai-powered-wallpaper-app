import { View, XStack, YStack, Text, useTheme } from "tamagui";
import { Skeleton } from "@/components/Skeleton";
import { WallpaperCard } from "@/components/WallpaperCard";
import { Ionicons } from "@expo/vector-icons";
import { SectionHeader } from "./SectionHeader";
import { buildUrl } from "@/lib/utils";

export function AllWallpapersList({
  images,
  isLoading,
  onNavigate,
  onSeeAll,
}: {
  images: any[];
  isLoading: boolean;
  onNavigate: (img: any) => void;
  onSeeAll?: () => void;
}) {
  const theme = useTheme();

  return (
    <YStack gap="$3" paddingHorizontal="$5">
      <SectionHeader title="All Wallpapers" subtitle="Everything in the collection" showSeeAll noPadding onSeeAll={onSeeAll} />
      {isLoading ? (
        <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} width="48%">
              <Skeleton width="100%" height={200} borderRadius={16} />
            </View>
          ))}
        </XStack>
      ) : images.length > 0 ? (
        <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
          {images.map((img: any) => (
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
      ) : (
        <YStack alignItems="center" paddingVertical="$8" gap="$3">
          <View width={64} height={64} borderRadius={20} backgroundColor="$color3" alignItems="center" justifyContent="center">
            <Ionicons name="images-outline" size={28} color={theme.color11?.val} />
          </View>
          <Text color="$color11" fontSize={14}>No wallpapers yet</Text>
        </YStack>
      )}
    </YStack>
  );
}
