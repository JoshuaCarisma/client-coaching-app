import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import {
  getConsentGiven,
  setConsentGiven,
} from "../../src/services/tokenStorage";

export default function ConsentScreen() {
  const [checking, setChecking] = useState(true);
  const [agreeing, setAgreeing] = useState(false);

  useEffect(() => {
    getConsentGiven().then((given) => {
      if (given) {
        router.replace("/(auth)/login");
      } else {
        setChecking(false);
      }
    });
  }, []);

  const handleAgree = async () => {
    setAgreeing(true);
    await setConsentGiven();
    router.replace("/(auth)/login");
  };

  if (checking) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View>
      <Text>Body By Carisma</Text>
      <Text>
        This app collects health metrics, workout logs, and journal entries to
        support your coaching relationship. Your data is used for progress
        tracking and coaching only. It is never sold to third parties.
      </Text>
      <TouchableOpacity onPress={handleAgree} disabled={agreeing}>
        <Text>{agreeing ? "Please wait..." : "I Agree and Continue"}</Text>
      </TouchableOpacity>
    </View>
  );
}
