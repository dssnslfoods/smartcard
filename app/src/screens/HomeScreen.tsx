import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../App";
import { getDeviceLabel } from "../lib/device";
import { prepareForUpload } from "../lib/image";
import { scanBusinessCard } from "../lib/api";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [busy, setBusy] = useState(false);
  const deviceLabel = getDeviceLabel();

  const handleImage = async (uri: string) => {
    try {
      setBusy(true);
      const base64 = await prepareForUpload(uri);
      const card = await scanBusinessCard(base64);
      navigation.navigate("Review", { card });
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("ไม่ได้รับสิทธิ์เข้าถึงกล้อง");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    handleImage(result.assets[0].uri);
  };

  const onPickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("ไม่ได้รับสิทธิ์เข้าถึงคลังรูปภาพ");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    handleImage(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SmartCard</Text>
        <Text style={styles.subtitle}>สแกนนามบัตรลง Google Sheet</Text>
        <Text style={styles.device}>เครื่อง: {deviceLabel}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
          onPress={onTakePhoto}
          disabled={busy}
        >
          <Text style={styles.buttonText}>📷 ถ่ายรูปนามบัตร</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
          onPress={onPickPhoto}
          disabled={busy}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>🖼  เลือกจากคลังรูปภาพ</Text>
        </Pressable>
      </View>

      {busy && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>กำลังอ่านนามบัตร...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 24, justifyContent: "space-between" },
  header: { paddingTop: 32 },
  title: { fontSize: 36, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 16, color: "#94a3b8", marginTop: 4 },
  device: { fontSize: 13, color: "#64748b", marginTop: 16 },
  actions: { gap: 16, marginBottom: 48 },
  button: { padding: 20, borderRadius: 16, alignItems: "center" },
  primary: { backgroundColor: "#3b82f6" },
  secondary: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#475569" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  secondaryText: { color: "#cbd5e1" },
  pressed: { opacity: 0.7 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  overlayText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
