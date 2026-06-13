import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function AdminSettings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const sections = [
    {
      title: "الحساب",
      items: [
        { icon: "user" as const, label: "بياناتي الشخصية", sub: user?.name },
        { icon: "lock" as const, label: "تغيير كلمة المرور" },
        { icon: "shield" as const, label: "إعدادات الأمان" },
      ],
    },
    {
      title: "المنصة",
      items: [
        { icon: "globe" as const, label: "إعدادات عامة" },
        { icon: "bell" as const, label: "الإشعارات" },
        { icon: "activity" as const, label: "سجل العمليات" },
      ],
    },
    {
      title: "الدعم",
      items: [
        { icon: "help-circle" as const, label: "مركز المساعدة" },
        { icon: "message-square" as const, label: "تذاكر الدعم الفني" },
      ],
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>الإعدادات</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={28} color={colors.primaryForeground} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.name}</Text>
            <Text style={[styles.profileRole, { color: colors.mutedForeground }]}>سوبر أدمن</Text>
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.title}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.settingRow,
                    i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                  activeOpacity={0.8}
                >
                  <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
                    {item.sub && <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>{item.sub}</Text>}
                  </View>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}>
                    <Feather name={item.icon} size={16} color={colors.foreground} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900", textAlign: "right" },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  profile: { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row-reverse", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontFamily: "Cairo_700Bold", textAlign: "right" },
  profileRole: { fontSize: 13, fontFamily: "Cairo_400Regular", textAlign: "right" },
  sectionTitle: { fontSize: 12, fontFamily: "Cairo_600SemiBold", textAlign: "right", marginBottom: 6, marginTop: 4, paddingHorizontal: 4 },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  settingRow: { flexDirection: "row-reverse", alignItems: "center", padding: 14, gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingInfo: { flex: 1, gap: 1 },
  settingLabel: { fontSize: 14, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  settingSub: { fontSize: 12, fontFamily: "Cairo_400Regular", textAlign: "right" },
  logoutBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontFamily: "Cairo_700Bold" },
});
