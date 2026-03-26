import { ScrollView } from "react-native";
import { YStack, XStack } from "tamagui";
import { ColorToneSwatch } from "@/components/ColorToneSwatch";
import { SectionHeader } from "./SectionHeader";

export function ToneBrowse({ dynamicPalettes }: { dynamicPalettes: string[] }) {
  return (
    <YStack gap="$3">
      <SectionHeader title="Browse by Tone" subtitle="Find your colour mood" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
        <XStack gap="$2">
          {dynamicPalettes.map((color, index) => (
            <ColorToneSwatch key={index} color={color} />
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
