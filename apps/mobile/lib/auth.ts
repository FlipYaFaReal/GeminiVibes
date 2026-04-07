import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { TokenCache } from "@clerk/clerk-expo";

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return SecureStore.getItemAsync(key);
    },
    saveToken: async (key: string, token: string) => {
      if (Platform.OS === "web") {
        localStorage.setItem(key, token);
      } else {
        await SecureStore.setItemAsync(key, token);
      }
    },
    clearToken: async (key: string) => {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    },
  };
};

export const tokenCache = createTokenCache();
