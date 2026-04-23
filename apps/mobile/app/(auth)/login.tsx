import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const { state, login, clearError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await login();
    setIsLoggingIn(false);
    // Do NOT navigate here — root layout Stack.Protected handles routing
    // once state.status becomes "authenticated"
  };

  return (
    <View>
      <Text>Body By Carisma</Text>

      {state.error ? (
        <View>
          <Text>{state.error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity onPress={handleLogin} disabled={isLoggingIn}>
        {isLoggingIn ? (
          <ActivityIndicator />
        ) : (
          <Text>Sign in with Body By Carisma</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
