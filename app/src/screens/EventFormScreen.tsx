import React, { useState } from "react";
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
import { saveEventCard } from "../lib/api";
import { getDeviceLabel } from "../lib/device";
import type { EventField, EventResponse } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EventForm">;

type MultiState = { selected: string[]; other: string };

export default function EventFormScreen({ navigation, route }: Props) {
  const { card, imagesBase64, event } = route.params;
  const deviceLabel = getDeviceLabel();
  const [saving, setSaving] = useState(false);

  const initial: Record<string, string | MultiState> = {};
  for (const f of event.fields) {
    if (f.type === "multiselect") initial[f.key] = { selected: [], other: "" };
    else initial[f.key] = "";
  }
  const [state, setState] = useState(initial);

  const setText = (key: string, v: string) => {
    setState((p) => ({ ...p, [key]: v }));
  };

  const toggleOption = (key: string, opt: string) => {
    setState((p) => {
      const cur = p[key] as MultiState;
      const has = cur.selected.includes(opt);
      const selected = has
        ? cur.selected.filter((o) => o !== opt)
        : [...cur.selected, opt];
      return { ...p, [key]: { ...cur, selected } };
    });
  };

  const setOther = (key: string, v: string) => {
    setState((p) => {
      const cur = p[key] as MultiState;
      return { ...p, [key]: { ...cur, other: v } };
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const response: EventResponse = {};
      for (const f of event.fields) {
        const v = state[f.key];
        if (f.type === "multiselect") {
          const m = v as MultiState;
          response[f.key] = { selected: m.selected, other: m.other };
        } else {
          response[f.key] = v as string;
        }
      }
      await saveEventCard(event.id, card, deviceLabel, imagesBase64, response);
      Alert.alert(
        "บันทึกเรียบร้อย",
        `ข้อมูลถูกเพิ่มลง ${event.sheetTab} แล้ว`,
        [{ text: "ตกลง", onPress: () => navigation.popToTop() }]
      );
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.subtitle}>กรอกข้อมูลเพิ่มเติมสำหรับ event นี้</Text>

        <View style={styles.cardSummary}>
          <Text style={styles.summaryLine}>{card.name}</Text>
          {card.company ? <Text style={styles.summarySub}>{card.company}</Text> : null}
        </View>

        {event.fields.map((f) => (
          <FieldRenderer
            key={f.key}
            field={f}
            value={state[f.key]}
            onText={(v) => setText(f.key, v)}
            onToggle={(opt) => toggleOption(f.key, opt)}
            onOther={(v) => setOther(f.key, v)}
          />
        ))}

        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          onPress={onSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>💾 บันทึก</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelText}>กลับไปแก้ไขนามบัตร</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldRenderer({
  field,
  value,
  onText,
  onToggle,
  onOther,
}: {
  field: EventField;
  value: string | MultiState;
  onText: (v: string) => void;
  onToggle: (opt: string) => void;
  onOther: (v: string) => void;
}) {
  if (field.type === "text") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>
          {field.labelTh}
          {field.labelEn ? ` / ${field.labelEn}` : ""}
        </Text>
        <TextInput
          style={styles.input}
          value={value as string}
          onChangeText={onText}
          placeholder={field.placeholder ?? field.labelEn}
          placeholderTextColor="#94a3b8"
        />
      </View>
    );
  }
  if (field.type === "textarea") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>
          {field.labelTh} / {field.labelEn}
        </Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={value as string}
          onChangeText={onText}
          multiline
          numberOfLines={field.rows ?? 3}
          placeholder={field.labelEn}
          placeholderTextColor="#94a3b8"
        />
      </View>
    );
  }
  const m = value as MultiState;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {field.labelTh} / {field.labelEn}
      </Text>
      <View style={styles.chipRow}>
        {field.options.map((opt) => {
          const active = m.selected.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => onToggle(opt)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
      {field.allowOther && (
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          value={m.other}
          onChangeText={onOther}
          placeholder="อื่นๆ ระบุ..."
          placeholderTextColor="#94a3b8"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scroll: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 14 },
  cardSummary: {
    backgroundColor: "#e0e7ff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  summaryLine: { fontSize: 15, fontWeight: "700", color: "#1e3a8a" },
  summarySub: { fontSize: 13, color: "#475569", marginTop: 2 },
  field: { marginBottom: 16 },
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
    marginTop: 10,
  },
  saveText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cancelButton: { paddingVertical: 14, alignItems: "center", marginTop: 8 },
  cancelText: { color: "#64748b", fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.7 },
});
