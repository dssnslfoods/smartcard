import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const [images, setImages] = useState<{ base64: string; uri: string }[]>([]);
  const deviceLabel = getDeviceLabel();

  const addImage = async (uri: string) => {
    try {
      const base64 = await prepareForUpload(uri);
      setImages((prev) =>
        prev.length < 2 ? [...prev, { base64, uri }] : prev
      );
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", e instanceof Error ? e.message : String(e));
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
    addImage(result.assets[0].uri);
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
    addImage(result.assets[0].uri);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onScan = async () => {
    if (images.length === 0) return;
    try {
      setBusy(true);
      const imagesBase64 = images.map((i) => i.base64);
      const card = await scanBusinessCard(imagesBase64);
      navigation.navigate("Review", { card, imagesBase64 });
      setImages([]);
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const canAddMore = images.length < 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SmartCard</Text>
        <Text style={styles.subtitle}>สแกนนามบัตรลง Google Sheet</Text>
        <Text style={styles.device}>เครื่อง: {deviceLabel}</Text>
      </View>

      {images.length > 0 && (
        <View style={styles.previewBlock}>
          <Text style={styles.previewLabel}>
            รูปที่จะสแกน ({images.length}/2)
          </Text>
          <View style={styles.previewRow}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.thumbWrap}>
                <Image source={{ uri: img.uri }} style={styles.thumb} />
                <Pressable
                  onPress={() => removeImage(idx)}
                  style={styles.thumbX}
                >
                  <Text style={styles.thumbXText}>✕</Text>
                </Pressable>
                <Text style={styles.thumbCaption}>
                  {idx === 0 ? "ด้านหน้า" : "ด้านหลัง"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {canAddMore && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primary,
                pressed && styles.pressed,
              ]}
              onPress={onTakePhoto}
              disabled={busy}
            >
              <Text style={styles.buttonText}>
                {images.length === 0
                  ? "📷 ถ่ายรูปนามบัตร"
                  : "➕ ถ่ายเพิ่ม (หน้าหลัง)"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondary,
                pressed && styles.pressed,
              ]}
              onPress={onPickPhoto}
              disabled={busy}
            >
              <Text style={[styles.buttonText, styles.secondaryText]}>
                🖼  เลือกจากคลังรูปภาพ
              </Text>
            </Pressable>
          </>
        )}

        {images.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.scan,
              pressed && styles.pressed,
            ]}
            onPress={onScan}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              ✨ สแกน {images.length} รูป
            </Text>
          </Pressable>
        )}
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
  previewBlock: { marginVertical: 16 },
  previewLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600", marginBottom: 8 },
  previewRow: { flexDirection: "row", gap: 12 },
  thumbWrap: { alignItems: "center" },
  thumb: {
    width: 130,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
  },
  thumbX: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#dc2626",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbXText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  thumbCaption: { color: "#cbd5e1", fontSize: 11, marginTop: 6, fontWeight: "600" },
  actions: { gap: 12, marginBottom: 48 },
  button: { padding: 18, borderRadius: 16, alignItems: "center" },
  primary: { backgroundColor: "#3b82f6" },
  secondary: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#475569" },
  scan: { backgroundColor: "#16a34a" },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
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
