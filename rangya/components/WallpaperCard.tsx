import { API_URL } from "@/lib/auth-client";
import { Image } from "expo-image";
import { Dimensions, TouchableOpacity } from "react-native";
import { View, Text, XStack, YStack } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const BASE_URL = API_URL.replace("/api", "");

type WallpaperCardProps = {
  id?: string;
  imageUri: string;
  categoryName?: string;
  blurhash?: string;
  isAi?: boolean;
  onPress?: () => void;
  user?: {
    name: string;
    image?: string;
  };
};

export const WallpaperCard = ({
  id,
  imageUri,
  categoryName,
  blurhash,
  isAi,
  onPress,
  user,
}: WallpaperCardProps) => {
  const fullUri = imageUri.startsWith("http")
    ? imageUri
    : `${BASE_URL}${imageUri}`;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      disabled={!onPress}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
      }}
    >
      <View
        width={width * 0.43}
        height={260} 
        borderRadius={20}
        overflow="hidden"
        backgroundColor="$color4"
      >
        <Image
          source={{ uri: fullUri }}
          placeholder={blurhash}
          contentFit="cover"
          transition={400}
          style={{ width: "100%", height: "100%" }}
        />

        {}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            justifyContent: "flex-end",
            padding: 10,
          }}
        >
          <XStack alignItems="center" gap={8}>
            {}
            <View
              width={26}
              height={26}
              borderRadius={13}
              overflow="hidden"
              backgroundColor="$blue10"
              borderWidth={1.5}
              borderColor="rgba(255,255,255,0.3)"
            >
              {user?.image ? (
                <Image
                  source={{ uri: `${BASE_URL}${user.image}` }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View
                  flex={1}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="$blue9"
                >
                  <Text fontSize={9} color="white" fontWeight="800">
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            {}
            <YStack flex={1}>
              <Text
                color="white"
                fontSize={11}
                fontWeight="700"
                numberOfLines={1}
                style={{
                  textShadowColor: "rgba(0, 0, 0, 0.75)",
                  textShadowOffset: { width: -1, height: 1 },
                  textShadowRadius: 10,
                }}
              >
                {user?.name || "Unknown"}
              </Text>
            </YStack>
          </XStack>
        </LinearGradient>

        {}
        {isAi && (
          <View
            position="absolute"
            top={10}
            right={10}
            backgroundColor="rgba(255,255,255,0.15)"
            paddingHorizontal={8}
            paddingVertical={4}
            borderRadius={8}
            borderWidth={1}
            borderColor="rgba(255,255,255,0.2)"
            style={
              {
                backdropFilter: "blur(10px)", 
              } as any
            }
          >
            <XStack alignItems="center" gap={5}>
              <LinearGradient
                colors={["#3B82F6", "#6366F1"]}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                }}
              />
              <Text
                color="white"
                fontSize={10}
                fontWeight="900"
                letterSpacing={0.8}
              >
                AI
              </Text>
            </XStack>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
