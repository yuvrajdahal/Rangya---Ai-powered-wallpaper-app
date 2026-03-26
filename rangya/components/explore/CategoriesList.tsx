import { View, YStack, XStack, Text } from "tamagui";
import { Skeleton } from "@/components/Skeleton";
import { CategoryCard } from "@/components/CategoryCard";
import { SectionHeader } from "./SectionHeader";

export function CategoriesList({
  categories,
  isLoading,
  onSeeAll,
}: {
  categories: any[];
  isLoading: boolean;
  onSeeAll?: () => void;
}) {
  return (
    <YStack gap="$3" paddingHorizontal="$5">
      <SectionHeader title="Categories" subtitle="Browse by collection" showSeeAll noPadding onSeeAll={onSeeAll} />
      <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => (
            <View key={i} width="48%">
              <Skeleton width="100%" height={120} borderRadius={16} />
            </View>
          ))
        ) : categories.length > 0 ? (
          categories.map((cat: any) => (
            <View key={cat.id} width="48%">
              <CategoryCard
                id={cat.id}
                title={cat.name}
                imageUri={cat.images?.[0]?.url || ""}
                blurhash={cat.images?.[0]?.blurhash}
              />
            </View>
          ))
        ) : (
          <Text color="$color11" paddingVertical="$3">No categories yet</Text>
        )}
      </XStack>
    </YStack>
  );
}
