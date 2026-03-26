import { Text, View } from "tamagui";
import { Image } from "expo-image";
import { API_URL } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

type CategoryCardProps = {
  id: string;
  title: string;
  imageUri: string;
  blurhash?: string;
};

export const CategoryCard = ({
  id,
  title,
  imageUri,
  blurhash,
}: CategoryCardProps) => {
  const router = useRouter();
  const BASE_URL = API_URL.replace("/api", "");

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/category/[id]",
          params: { id, title },
        })
      }
    >
      <View
        width={160}
        height={100}
        borderRadius={12}
        overflow="hidden"
        justifyContent="center"
        alignItems="center"
      >
        <Image
          source={{ uri: `${BASE_URL}${imageUri}` }}
          placeholder={blurhash}
          contentFit="cover"
          transition={1000}
          style={{ width: "100%", height: "100%", position: "absolute" }}
        />
        <View
          backgroundColor="rgba(0, 0, 0, 0.3)"
          width="100%"
          height="100%"
          position="absolute"
        />
        <Text color="white" fontWeight="bold" fontSize="$5" zIndex={10}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
