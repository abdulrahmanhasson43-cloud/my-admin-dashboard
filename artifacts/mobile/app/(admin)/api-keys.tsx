import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface ApiKey {
  id: string;
  service: string;
  maskedKey: string;
  dailyLimit: number;
  currentUsage: number;
  priority: number;
  isActive: boolean;
}

const INITIAL_KEYS: ApiKey[] = [
  { id: "1", service: "Gemini API", maskedKey: "AIza...xK9p", dailyLimit: 1000, currentUsage: 847, priority: 1, isActive: true },
  { id: "2", service: "Groq API", maskedKey: "gsk_...m3nQ", dailyLimit: 500, currentUsage: 120, priority: 2, isActive: true },
  { id: "3", service: "Gemini API (احتياطي)", maskedKey: "AIza...r7Lm", dailyLimit: 1000, currentUsage: 0, priority: 3, isActive: false },
];

export default function ApiKeysScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState("Gemini API");
  const [newKey, setNewKey] = useState("");
  const [newLimit, setNewLimit] = useState("1000");

  const toggleKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  };

  const addKey = () => {
    if (!newKey.trim()) {
      Alert.alert("تنبيه", "من فضلك ادخل المفتاح");
      return;
    }
    const masked = newKey.substring(0, 6) + "..." + newKey.slice(-4);
    setKeys(prev => [...prev, {
      id: Date.now().toString(),
      service: newService,
      maskedKey: masked,
      dailyLimit: parseInt(newLimit) || 1000,
      currentUsage: 0,
      priority: prev.length + 1,
      isActive: true,
    }]);
    setNewKey("");
    setShowAdd(false);
  };

  const usagePct = (key: ApiKey) => Math.round((key.currentUsage / key.dailyLimit) * 100);

  const getUsageColor = (pct: number) => {
    if (pct >= 90) return colors.destructive;
    if (pct >= 60) return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowAdd(!showAdd)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>إدارة API Keys</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {showAdd && (
          <View style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.addTitle, { color: colors.foreground }]}>إضافة مفتاح جديد</Text>
            {["Gemini API", "Groq API"].map(svc => (
              <TouchableOpacity
                key={svc}
                style={[styles.serviceBtn, {
                  backgroundColor: newService === svc ? colors.primary : colors.accent,
                  borderColor: colors.border,
                }]}
                onPress={() => setNewService(svc)}
                activeOpacity={0.8}
              >
                <Text style={[styles.serviceBtnText, { color: newService === svc ? colors.primaryForeground : colors.foreground }]}>
                  {svc}
                </Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
              value={newKey}
              onChangeText={setNewKey}
              placeholder="المفتاح السري"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              textAlign="right"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
              value={newLimit}
              onChangeText={setNewLimit}
              placeholder="الحد اليومي"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              textAlign="right"
            />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={addKey} activeOpacity={0.8}>
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>حفظ</Text>
            </TouchableOpacity>
          </View>
        )}

        {keys.map((key) => {
          const pct = usagePct(key);
          const usageColor = getUsageColor(pct);
          return (
            <View key={key.id} style={[styles.keyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.keyHeader}>
                <TouchableOpacity
                  style={[styles.toggleBadge, { backgroundColor: key.isActive ? colors.success + "20" : colors.muted }]}
                  onPress={() => toggleKey(key.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.dot, { backgroundColor: key.isActive ? colors.success : colors.mutedForeground }]} />
                  <Text style={[styles.toggleText, { color: key.isActive ? colors.success : colors.mutedForeground }]}>
                    {key.isActive ? "نشط" : "متوقف"}
                  </Text>
                </TouchableOpacity>
                <View style={styles.keyNameSection}>
                  <Text style={[styles.keyService, { color: colors.foreground }]}>{key.service}</Text>
                  <Text style={[styles.keyMasked, { color: colors.mutedForeground }]}>{key.maskedKey}</Text>
                </View>
              </View>

              <View style={styles.usageSection}>
                <View style={[styles.progressBar, { backgroundColor: colors.accent }]}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: usageColor }]} />
                </View>
                <View style={styles.usageLabels}>
                  <Text style={[styles.usagePct, { color: usageColor }]}>{pct}%</Text>
                  <Text style={[styles.usageNums, { color: colors.mutedForeground }]}>
                    {key.currentUsage}/{key.dailyLimit} طلب
                  </Text>
                </View>
              </View>

              <View style={styles.priorityRow}>
                <Text style={[styles.priorityText, { color: colors.mutedForeground }]}>أولوية #{key.priority}</Text>
                <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
                <Text style={[styles.priorityText, { color: colors.mutedForeground }]}>Auto-Failover</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900" },
  addBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  addCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  addTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", textAlign: "right" },
  serviceBtn: { padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  serviceBtnText: { fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  saveBtn: { height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 14, fontFamily: "Cairo_700Bold" },
  keyCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  keyHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" },
  toggleBadge: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  toggleText: { fontSize: 11, fontFamily: "Cairo_600SemiBold" },
  keyNameSection: { alignItems: "flex-end", gap: 2 },
  keyService: { fontSize: 15, fontFamily: "Cairo_700Bold" },
  keyMasked: { fontSize: 12, fontFamily: "Cairo_400Regular" },
  usageSection: { gap: 6 },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  usageLabels: { flexDirection: "row-reverse", justifyContent: "space-between" },
  usagePct: { fontSize: 13, fontFamily: "Cairo_700Bold" },
  usageNums: { fontSize: 12, fontFamily: "Cairo_400Regular" },
  priorityRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  priorityText: { fontSize: 11, fontFamily: "Cairo_400Regular" },
});
