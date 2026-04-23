import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function HomeScreen() {
  const { state, logout } = useAuth();

  return (
    <View>
      <Text>Body By Carisma</Text>
      <Text>Welcome, {state.user?.email ?? "athlete"}</Text>
      <Text>Role: {state.user?.roles?.[0] ?? "client"}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
