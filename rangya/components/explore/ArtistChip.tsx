import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import { Text, View, YStack } from "tamagui";
import { useRouter } from "expo-router";
import { API_URL } from "@/lib/auth-client";

export function ArtistChip({
  artist,
  isDark,
}: {
  artist: { id: string; name: string; image?: string; count: number };
  isDark: boolean;
}) {
  const initials = artist.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/artist/[id]",
          params: { id: artist.id, name: artist.name },
        })
      }
    >
      <YStack alignItems="center" gap={6} width={80}>
        {/* Avatar ring + image */}
        <View
          width={72}
          height={72}
          borderRadius={36}
          overflow="hidden"
          style={{
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.22,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {artist.image ? (
            <Image
              source={{ uri: `${API_URL.replace("/api", "")}${artist.image}` }}
              contentFit="cover"
              style={{ width: 72, height: 72 }}
            />
          ) : (
            <LinearGradient
              colors={["#3B82F6", "#6366F1"]}
              start={[0, 0]}
              end={[1, 1]}
              style={{
                width: 72,
                height: 72,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text fontSize={22} fontWeight="800" color="white">
                {initials}
              </Text>
            </LinearGradient>
          )}
          {/* Border ring */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 36,
              borderWidth: 2,
              borderColor: "rgba(59,130,246,0.45)",
            }}
          />
        </View>

        {/* First name */}
        <Text
          fontSize={12}
          fontWeight="600"
          color="$color"
          textAlign="center"
          numberOfLines={1}
          width={80}
        >
          {artist.name.split(" ")[0]}
        </Text>

        {/* Upload count badge */}
        <View
          paddingHorizontal={8}
          paddingVertical={2}
          borderRadius={10}
          marginTop={-4}
          backgroundColor={
            isDark ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.1)"
          }
        >
          <Text fontSize={10} fontWeight="700" color="$blue10">
            {artist.count} {artist.count === 1 ? "wall" : "walls"}
          </Text>
        </View>
      </YStack>
    </TouchableOpacity>
  );
}
