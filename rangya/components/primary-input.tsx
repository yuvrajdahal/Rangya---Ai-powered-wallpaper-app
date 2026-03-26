import React, { useState } from "react";
import { Input, TextArea, XStack, YStack, useTheme } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

interface PrimaryInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  icon?: any;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}

interface PrimaryTextAreaProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  minHeight?: number;
}

export const PrimaryTextArea: React.FC<PrimaryTextAreaProps> = ({
  placeholder,
  value,
  onChangeText,
  minHeight = 100,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <YStack gap="$1.5">
      <XStack
        backgroundColor="$backgroundFocus"
        borderRadius="$4"
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="flex-start"
        borderWidth={1}
        borderColor={isFocused ? "$blue10" : "$borderColor"}
        // minHeight={minHeight}
        shadowColor={isFocused ? "$blue10" : "transparent"}
        shadowOffset={{ width: 0, height: 0 }}
        shadowOpacity={isFocused ? 0.3 : 0}
        shadowRadius={isFocused ? 4 : 0}
      >
        <TextArea
          flex={1}
          placeholder={placeholder}
          placeholderTextColor="$color11"
          value={value}
          onChangeText={onChangeText}
          borderWidth={0}
          backgroundColor="transparent"
          paddingLeft={0}
          paddingTop={0}
          paddingBottom={5}
          minHeight={minHeight}
          maxHeight={"100%"}
          fontSize={16}
          color="$color"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          outlineStyle="none"
          textAlignVertical="top"
        />
      </XStack>
    </YStack>
  );
};

export const PrimaryInput: React.FC<PrimaryInputProps> = ({
  placeholder,
  value,
  onChangeText,
  onSubmitEditing,
  returnKeyType,
  icon,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  // Resolve Tamagui tokens to real color values
  const iconColor = isFocused ? theme.blue10?.get() : theme.color8?.get();

  return (
    <YStack gap="$1.5">
      <XStack
        backgroundColor="$backgroundFocus"
        borderRadius="$4"
        paddingHorizontal="$4"
        alignItems="center"
        borderWidth={1}
        borderColor={isFocused ? "$blue10" : "$borderColor"}
        height={56}
        shadowColor={isFocused ? "$blue10" : "transparent"}
        shadowOffset={{ width: 0, height: 0 }}
        shadowOpacity={isFocused ? 0.3 : 0}
        shadowRadius={isFocused ? 4 : 0}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={iconColor} // ✅ resolved value, not token string
          />
        )}
        <Input
          flex={1}
          placeholder={placeholder}
          placeholderTextColor="$color11"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          borderWidth={0}
          backgroundColor="transparent"
          paddingLeft={icon ? "$3" : "$0"}
          fontSize={16}
          color="$color"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          outlineStyle="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={iconColor} // ✅ resolved value, not token string
            />
          </TouchableOpacity>
        )}
      </XStack>
    </YStack>
  );
};
