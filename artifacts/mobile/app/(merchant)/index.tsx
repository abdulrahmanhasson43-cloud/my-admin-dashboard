import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { StatsCard } from "@/components/StatsCard";
import { OrderStatusBadge } from "@/components/Badge";

function formatCurrency(n: number) {
  return n.toLocaleString("ar-EG") + " ج.م";
}

export default function MerchantDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { products, orders, customers } = useStore();

  const todayOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const totalRevenue = orders.reduce((s, o) => s + o.paidAmount, 0);
  const totalDebt = customers.reduce((s, c) => s + c.totalDebt, 0);
  const lowStockItems = products.filter(p => p.stock <= p.minStock && p.isActive);
  const recentOrders = orders.slice(0, 4);

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
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={18} color={colors.primaryForeground} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>أهلاً بك</Text>
            <Text style={[styles.storeName, { color: colors.foreground }]}>{user?.name}</Text>
          </View>
        </View>

        {/* Alerts */}
        {lowStockItems.length > 0 && (
          <View style={[styles.alert, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}>
            <Text style={[styles.alertText, { color: colors.destructive }]}>
              تنبيه: {lowStockItems.length} منتج مخزونه منخفض
            </Text>
            <Feather name="alert-triangle" size={16} color={colors.destructive} />
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatsCard
              title="إجمالي الإيرادات"
              value={formatCurrency(totalRevenue)}
              icon="dollar-sign"
              isPrimary
              trend="up"
              trendValue="+8%"
            />
            <StatsCard
              title="طلبات اليوم"
              value={String(todayOrders.length)}
              subtitle="طلب"
              icon="shopping-cart"
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="إجمالي الديون"
              value={formatCurrency(totalDebt)}
              icon="credit-card"
            />
            <StatsCard
              title="المخزون المنخفض"
              value={String(lowStockItems.length)}
              subtitle="منتج"
              icon="alert-triangle"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>إجراءات سريعة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
          <View style={styles.actionsRow}>
            {[
              { icon: "shopping-cart" as const, label: "بيع جديد", color: colors.primary },
              { icon: "user-plus" as const, label: "عميل جديد", color: colors.info },
              { icon: "package" as const, label: "منتج جديد", color: colors.success },
              { icon: "truck" as const, label: "مورد جديد", color: colors.warning },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={[styles.actionChip, { backgroundColor: action.color + "15", borderColor: action.color + "30" }]} activeOpacity={0.8}>
                <Feather name={action.icon} size={18} color={action.color} />
                <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Recent Orders */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>آخر الطلبات</Text>
        {recentOrders.map(order => (
          <TouchableOpacity
            key={order.id}
            style={[styles.orderRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.85}
          >
            <View style={styles.orderRight}>
              <Text style={[styles.orderCustomer, { color: colors.foreground }]}>{order.customerName}</Text>
              <Text style={[styles.orderItems, { color: colors.mutedForeground }]}>
                {order.items.length} منتج
              </Text>
            </View>
            <View style={styles.orderLeft}>
              <Text style={[styles.orderTotal, { color: colors.foreground }]}>{order.total} ج.م</Text>
              <OrderStatusBadge status={order.status} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Low Stock */}
        {lowStockItems.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>مخزون منخفض</Text>
            {lowStockItems.slice(0, 3).map(p => (
              <View key={p.id} style={[styles.lowStockRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.lowStockCount, { backgroundColor: colors.destructive + "15" }]}>
                  <Text style={[styles.lowStockNum, { color: colors.destructive }]}>{p.stock}</Text>
                  <Text style={[styles.lowStockUnit, { color: colors.destructive }]}>{p.unit}</Text>
                </View>
                <Text style={[styles.lowStockName, { color: colors.foreground }]}>{p.name}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 4 },
  logo: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  greeting: { fontSize: 12, fontFamily: "Cairo_400Regular", textAlign: "right" },
  storeName: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900", textAlign: "right" },
  alert: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  alertText: { flex: 1, fontSize: 13, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  statsGrid: { gap: 10 },
  statsRow: { flexDirection: "row-reverse", gap: 10 },
  sectionTitle: { fontSize: 18, fontFamily: "Cairo_700Bold", textAlign: "right", marginTop: 4 },
  actionsScroll: { marginHorizontal: -16 },
  actionsRow: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  actionChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionLabel: { fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  orderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  orderRight: { gap: 3 },
  orderCustomer: { fontSize: 14, fontFamily: "Cairo_700Bold", textAlign: "right" },
  orderItems: { fontSize: 12, fontFamily: "Cairo_400Regular" },
  orderLeft: { alignItems: "flex-end", gap: 4 },
  orderTotal: { fontSize: 16, fontFamily: "Cairo_900Black", fontWeight: "900" },
  lowStockRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  lowStockCount: { padding: 8, borderRadius: 8, alignItems: "center", minWidth: 50 },
  lowStockNum: { fontSize: 18, fontFamily: "Cairo_900Black", fontWeight: "900" },
  lowStockUnit: { fontSize: 10, fontFamily: "Cairo_400Regular" },
  lowStockName: { fontSize: 14, fontFamily: "Cairo_600SemiBold", flex: 1, textAlign: "right" },
});
