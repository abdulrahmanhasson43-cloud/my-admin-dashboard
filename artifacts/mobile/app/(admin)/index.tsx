import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { StatsCard } from "@/components/StatsCard";

const MERCHANTS = [
  { id: "1", name: "متجر التوفير الطبي", plan: "pro", isActive: true, revenue: 4500 },
  { id: "2", name: "صيدلية الشفاء", plan: "elite", isActive: true, revenue: 12000 },
  { id: "3", name: "مستلزمات القاهرة", plan: "starter", isActive: false, revenue: 800 },
  { id: "4", name: "ميد كير", plan: "enterprise", isActive: true, revenue: 85000 },
];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const totalRevenue = MERCHANTS.reduce((s, m) => s + m.revenue, 0);
  const activeCount = MERCHANTS.filter(m => m.isActive).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>مرحباً</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatsCard
            title="إجمالي الإيرادات"
            value={`${(totalRevenue / 1000).toFixed(1)}k`}
            subtitle="جنيه مصري"
            icon="dollar-sign"
            isPrimary
            trend="up"
            trendValue="+12%"
          />
          <StatsCard
            title="متاجر نشطة"
            value={`${activeCount}/${MERCHANTS.length}`}
            icon="shopping-bag"
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="استخدام AI اليوم"
            value="847"
            subtitle="سؤال"
            icon="cpu"
            trend="up"
            trendValue="+23%"
          />
          <StatsCard
            title="إشتراكات نشطة"
            value="4"
            subtitle="من 12 إجمالي"
            icon="users"
          />
        </View>

        {/* Recent Merchants */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>المتاجر</Text>
        {MERCHANTS.map((m) => (
          <View key={m.id} style={[styles.merchantCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.merchantInfo}>
              <View style={styles.merchantRow}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: m.isActive ? colors.success : colors.destructive }
                ]} />
                <Text style={[styles.planBadge, { color: colors.mutedForeground }]}>
                  {m.plan.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.merchantRevenue, { color: colors.foreground }]}>
                {m.revenue.toLocaleString()} ج.م
              </Text>
            </View>
            <Text style={[styles.merchantName, { color: colors.foreground }]}>{m.name}</Text>
          </View>
        ))}

        {/* Platform Stats */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>إحصائيات المنصة</Text>
        <View style={[styles.platformCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Starter (50 ج.م/شهر)", count: 1, color: colors.mutedForeground },
            { label: "Pro (150 ج.م/شهر)", count: 2, color: colors.info },
            { label: "Elite (500 ج.م/شهر)", count: 1, color: colors.warning },
            { label: "Enterprise", count: 1, color: colors.success },
          ].map((item, i) => (
            <View key={i} style={styles.platformRow}>
              <Text style={[styles.platformCount, { color: colors.foreground }]}>{item.count}</Text>
              <Text style={[styles.platformLabel, { color: item.color }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  header: { marginBottom: 8 },
  greeting: { fontSize: 14, fontFamily: "Cairo_400Regular" },
  name: { fontSize: 24, fontFamily: "Cairo_900Black", fontWeight: "900" },
  statsRow: { flexDirection: "row-reverse", gap: 10 },
  sectionTitle: { fontSize: 18, fontFamily: "Cairo_700Bold", textAlign: "right", marginTop: 8 },
  merchantCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  merchantInfo: { alignItems: "flex-end", gap: 4 },
  merchantRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  planBadge: { fontSize: 11, fontFamily: "Cairo_600SemiBold" },
  merchantRevenue: { fontSize: 16, fontFamily: "Cairo_900Black", fontWeight: "900" },
  merchantName: { fontSize: 15, fontFamily: "Cairo_700Bold", textAlign: "right", flex: 1 },
  platformCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  platformRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  platformCount: { fontSize: 20, fontFamily: "Cairo_900Black", fontWeight: "900" },
  platformLabel: { fontSize: 14, fontFamily: "Cairo_600SemiBold" },
});
