import { TouchableOpacity, StyleSheet } from "react-native";
import { Text, YStack } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";

export function GuestCta({ onSignIn }: { onSignIn: () => void }) {
  return (
    <YStack marginHorizontal="$5" marginTop="$5" borderRadius={20} overflow="hidden">
      <LinearGradient colors={["#3B82F6", "#6366F1"]} start={[0, 0]} end={[1, 1]} style={styles.ctaGradient}>
        <YStack gap="$2" flex={1}>
          <Text fontSize={16} fontWeight="800" color="white">Share your wallpapers</Text>
          <Text fontSize={13} color="rgba(255,255,255,0.8)" lineHeight={18}>
            Sign in to upload and publish your own wallpapers.
          </Text>
        </YStack>
        <TouchableOpacity onPress={onSignIn} style={styles.ctaBtn}>
          <Text fontSize={13} fontWeight="700" color="#3B82F6">Sign In</Text>
        </TouchableOpacity>
      </LinearGradient>
    </YStack>
  );
}

const styles = StyleSheet.create({
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 12,
    borderRadius: 20,
  },
  ctaBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
});
