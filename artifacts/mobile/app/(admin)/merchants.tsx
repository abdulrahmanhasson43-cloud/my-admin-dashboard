import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SearchBar } from "@/components/SearchBar";
import { PlanBadge } from "@/components/Badge";

const MERCHANTS = [
  { id: "1", name: "متجر التوفير الطبي", phone: "01011223344", plan: "pro", isActive: true, joinDate: "2024-01-15", revenue: 4500, products: 120, customers: 35 },
  { id: "2", name: "صيدلية الشفاء", phone: "01099887766", plan: "elite", isActive: true, joinDate: "2023-11-01", revenue: 12000, products: 450, customers: 120 },
  { id: "3", name: "مستلزمات القاهرة", phone: "01055667788", plan: "starter", isActive: false, joinDate: "2024-03-20", revenue: 800, products: 45, customers: 12 },
  { id: "4", name: "ميد كير", phone: "0223456789", plan: "enterprise", isActive: true, joinDate: "2023-06-10", revenue: 85000, products: 2000, customers: 800 },
];

export default function MerchantsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const filtered = MERCHANTS.filter(m =>
    m.name.includes(search) || m.phone.includes(search)
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>إدارة المتاجر</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { paddingHorizontal: 16, paddingTop: 12 }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="بحث بالاسم أو التليفون..." />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View style={styles.rightSection}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: m.isActive ? colors.success : colors.destructive }
                ]} />
                <PlanBadge plan={m.plan} />
              </View>
              <Text style={[styles.merchantName, { color: colors.foreground }]}>{m.name}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: colors.foreground }]}>{m.revenue.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>إيراد ج.م</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: colors.foreground }]}>{m.products}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>منتج</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: colors.foreground }]}>{m.customers}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>عميل</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} activeOpacity={0.8}>
                <Feather name={m.isActive ? "pause-circle" : "play-circle"} size={16} color={m.isActive ? colors.destructive : colors.success} />
                <Text style={[styles.actionText, { color: m.isActive ? colors.destructive : colors.success }]}>
                  {m.isActive ? "إيقاف" : "تفعيل"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} activeOpacity={0.8}>
                <Feather name="edit-2" size={16} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} activeOpacity={0.8}>
                <Feather name="bar-chart-2" size={16} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>تقرير</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
  searchWrap: { paddingBottom: 8 },
  list: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  rightSection: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  merchantName: { fontSize: 16, fontFamily: "Cairo_700Bold", flex: 1, textAlign: "right" },
  divider: { height: 1 },
  statsRow: { flexDirection: "row-reverse", gap: 16 },
  stat: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 18, fontFamily: "Cairo_900Black", fontWeight: "900" },
  statLabel: { fontSize: 11, fontFamily: "Cairo_400Regular" },
  actions: { flexDirection: "row-reverse", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    gap: 4,
  },
  actionText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
});
