import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { signIn } from "./auth";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (signIn(username, password)) {
      onSuccess();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Admin Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <Pressable
        onPress={handleLogin}
        style={{ backgroundColor: "black", padding: 12, marginTop: 16 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
      </Pressable>
    </View>
  );
}
