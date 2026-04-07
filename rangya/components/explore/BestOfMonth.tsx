import { ScrollView } from "react-native";
import { View, XStack, YStack, Text, useTheme } from "tamagui";
import { Skeleton } from "@/components/Skeleton";
import { WallpaperCard } from "@/components/WallpaperCard";
import Feather from "@expo/vector-icons/Feather";
import { SectionHeader } from "./SectionHeader";
import { buildUrl } from "@/lib/utils";

export function BestOfMonth({
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
    <YStack gap="$3" paddingTop="$5">
      <SectionHeader
        title="Best of the Month"
        subtitle="Hand-picked favourites"
        showSeeAll
        onSeeAll={onSeeAll}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        <XStack gap="$3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} width={148} height={248} borderRadius={18} />
            ))
          ) : images.length > 0 ? (
            images
              .slice(0, 10)
              .map((img: any) => (
                <WallpaperCard
                  key={img.id}
                  id={img.id}
                  imageUri={buildUrl(img.url)}
                  categoryName={img.category?.name}
                  blurhash={img.blurhash}
                  isAi={img.isAi}
                  user={img.user}
                  onPress={() => onNavigate(img)}
                />
              ))
          ) : (
            <View
              width={160}
              height={248}
              borderRadius={18}
              backgroundColor="$color3"
              alignItems="center"
              justifyContent="center"
              gap="$2"
            >
              <Feather name="image" size={28} color={theme.color11?.val} />
              <Text color="$color11" fontSize={13} fontWeight="500">
                No images yet
              </Text>
            </View>
          )}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
