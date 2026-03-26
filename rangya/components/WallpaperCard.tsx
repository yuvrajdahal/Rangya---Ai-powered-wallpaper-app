import { API_URL } from "@/lib/auth-client";
import { Image } from "expo-image";
import { Dimensions, TouchableOpacity } from "react-native";
import { View } from "tamagui";

const { width } = Dimensions.get("window");
const BASE_URL = API_URL.replace("/api", "");

type WallpaperCardProps = {
  id?: string;
  imageUri: string;
  categoryName?: string;
  blurhash?: string;
  onPress?: () => void;
};

export const WallpaperCard = ({
  id,
  imageUri,
  categoryName,
  blurhash,
  onPress,
}: WallpaperCardProps) => {
  const fullUri = imageUri.startsWith("http") ? imageUri : `${BASE_URL}${imageUri}`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} disabled={!onPress}>
      <View
        width={width * 0.43}
        height={200}
        borderRadius={16}
        overflow="hidden"
        backgroundColor="$color4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={8}
      >
        <Image
          source={{ uri: fullUri }}
          placeholder={blurhash}
          contentFit="cover"
          transition={300}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    </TouchableOpacity>
  );
};
