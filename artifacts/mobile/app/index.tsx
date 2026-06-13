import { Redirect } from "expo-router";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();
  const isDark = useColorScheme() === "dark";

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "#0E0E0E" : "#F5F2ED",
      }}>
        <ActivityIndicator color={isDark ? "#FAF7F2" : "#1A1A1A"} size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/landing" />;
  if (user.role === "super_admin") return <Redirect href="/(admin)" />;
  if (user.role === "merchant")    return <Redirect href="/(merchant)" />;
  return <Redirect href="/(customer)" />;
}
