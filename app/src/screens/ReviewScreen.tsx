import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../App";
import { saveBusinessCard, getEvents } from "../lib/api";
import { getDeviceLabel } from "../lib/device";
import type { CardData, EventConfig } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Review">;

const fields: {
  key: keyof CardData;
  label: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "url";
}[] = [
  { key: "name", label: "ชื่อ" },
  { key: "position", label: "ตำแหน่ง" },
  { key: "company", label: "บริษัท" },
  { key: "phone", label: "โทรศัพท์", keyboardType: "phone-pad" },
  { key: "email", label: "อีเมล", keyboardType: "email-address" },
  { key: "website", label: "เว็บไซต์", keyboardType: "url" },
  { key: "address", label: "ที่อยู่", multiline: true },
];

export default function ReviewScreen({ navigation, route }: Props) {
  const [card, setCard] = useState<CardData>(route.params.card);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const deviceLabel = getDeviceLabel();
  const imageBase64 = route.params.imageBase64;

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  const update = (key: keyof CardData, value: string) => {
    setCard((prev) => ({ ...prev, [key]: value }));
  };

  const onSaveNoEvent = async () => {
    try {
      setSaving(true);
      await saveBusinessCard(card, deviceLabel, imageBase64);
      Alert.alert("บันทึกเรียบร้อย", "ข้อมูลถูกเพิ่มลง Google Sheet แล้ว", [
        { text: "ตกลง", onPress: () => navigation.popToTop() },
      ]);
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const onContinueToEvent = () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return;
    navigation.navigate("EventForm", { card, imageBase64, event });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>ตรวจสอบข้อมูล</Text>
        <Text style={styles.subtitle}>แก้ไขก่อนบันทึกได้</Text>

        {fields.map((f) => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={[styles.input, f.multiline && styles.multiline]}
              value={card[f.key]}
              onChangeText={(t) => update(f.key, t)}
              multiline={f.multiline}
              keyboardType={f.keyboardType ?? "default"}
              autoCapitalize={f.keyboardType === "email-address" ? "none" : "sentences"}
              autoCorrect={false}
              placeholder={f.label}
              placeholderTextColor="#94a3b8"
            />
          </View>
        ))}

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>บันทึกโดยเครื่อง</Text>
          <Text style={styles.deviceValue}>{deviceLabel}</Text>
        </View>

        {events.length > 0 && (
          <View style={styles.eventBlock}>
            <Text style={styles.label}>ผูกกับ Event (ถ้ามี)</Text>
            <View style={styles.chipRow}>
              <Pressable
                onPress={() => setSelectedEventId("")}
                style={[styles.chip, !selectedEventId && styles.chipActive]}
              >
                <Text style={[styles.chipText, !selectedEventId && styles.chipTextActive]}>
                  ไม่เลือก
                </Text>
              </Pressable>
              {events.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => setSelectedEventId(e.id)}
                  style={[styles.chip, selectedEventId === e.id && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedEventId === e.id && styles.chipTextActive,
                    ]}
                  >
                    {e.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {selectedEventId ? (
          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={onContinueToEvent}
            disabled={saving}
          >
            <Text style={styles.saveText}>➡️ ถัดไป: กรอกข้อมูล Event</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={onSaveNoEvent}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>💾 บันทึกลง Google Sheet</Text>
            )}
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelText}>ยกเลิก</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scroll: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4, marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  deviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  deviceLabel: { fontSize: 13, color: "#475569", fontWeight: "600" },
  deviceValue: { fontSize: 14, color: "#0f172a", fontWeight: "700" },
  eventBlock: { marginBottom: 18 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  chipText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  saveButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cancelButton: { paddingVertical: 14, alignItems: "center", marginTop: 8 },
  cancelText: { color: "#64748b", fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.7 },
});
