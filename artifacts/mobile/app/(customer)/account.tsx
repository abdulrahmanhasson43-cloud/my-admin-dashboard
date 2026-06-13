import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";

const PRICE_CATEGORY_LABELS: Record<string, string> = {
  public: "السعر العام",
  retail: "سعر التجزئة",
  wholesale1: "جملة الأول",
  wholesale2: "جملة الثاني",
  wholesale3: "جملة الثالث",
  vip: "VIP مميز",
};

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { orders } = useStore();

  const myOrders = orders.filter(o => o.customerId === user?.customerId);
  const totalPurchases = myOrders.reduce((s, o) => s + o.total, 0);
  const totalDebt = myOrders.reduce((s, o) => s + o.remainingAmount, 0);
  const deliveredCount = myOrders.filter(o => o.status === "delivered").length;

  const priceLabel = PRICE_CATEGORY_LABELS[user?.priceCategory ?? "public"] ?? "السعر العام";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>حسابي</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="user" size={32} color={colors.primaryForeground} />
          </View>
          <Text style={[styles.profileName, { color: colors.primaryForeground }]}>{user?.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.primaryForeground }]}>{priceLabel}</Text>
          </View>
          <Text style={[styles.codeText, { color: "rgba(250,247,242,0.6)" }]}>كود الدخول: {user?.priceCategory}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{totalPurchases}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>إجمالي المشتريات ج.م</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: totalDebt > 0 ? colors.destructive : colors.success }]}>{totalDebt}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>الدين الحالي ج.م</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{deliveredCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>طلب مُسلَّم</Text>
          </View>
        </View>

        {/* Debt Section */}
        {totalDebt > 0 && (
          <View style={[styles.debtCard, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "30" }]}>
            <View style={styles.debtRow}>
              <Feather name="alert-circle" size={20} color={colors.destructive} />
              <View style={styles.debtInfo}>
                <Text style={[styles.debtTitle, { color: colors.destructive }]}>لديك رصيد مستحق</Text>
                <Text style={[styles.debtAmount, { color: colors.destructive }]}>{totalDebt} ج.م</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.payBtn, { backgroundColor: colors.destructive }]} activeOpacity={0.8}>
              <Text style={[styles.payBtnText, { color: "#FFF" }]}>تواصل لتسوية الحساب</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order History */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>سجل الطلبات</Text>
        {myOrders.slice(0, 5).map(order => (
          <View key={order.id} style={[styles.orderRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.orderLeft}>
              <Text style={[styles.orderTotal, { color: colors.foreground }]}>{order.total} ج.م</Text>
              {order.remainingAmount > 0 && (
                <Text style={[styles.orderDebt, { color: colors.destructive }]}>دين: {order.remainingAmount}</Text>
              )}
            </View>
            <View style={styles.orderRight}>
              <Text style={[styles.orderNum, { color: colors.mutedForeground }]}>{order.orderNumber}</Text>
              <Text style={[styles.orderItems, { color: colors.foreground }]}>
                {order.items.map(i => i.productName).join("، ")}
              </Text>
            </View>
          </View>
        ))}

        {/* Yearly Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>الجرد السنوي</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryNum, { color: colors.foreground }]}>{myOrders.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>طلب</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryNum, { color: colors.foreground }]}>{totalPurchases}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>ج.م إجمالي</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryNum, { color: colors.foreground }]}>2024</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>السنة</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "40" }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900", textAlign: "right" },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  profileCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: 22, fontFamily: "Cairo_700Bold" },
  categoryBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  categoryBadgeText: { fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  codeText: { fontSize: 12, fontFamily: "Cairo_400Regular" },
  statsRow: { flexDirection: "row-reverse", gap: 10 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statNum: { fontSize: 20, fontFamily: "Cairo_900Black", fontWeight: "900" },
  statLabel: { fontSize: 10, fontFamily: "Cairo_400Regular", textAlign: "center" },
  debtCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  debtRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  debtInfo: { flex: 1 },
  debtTitle: { fontSize: 14, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  debtAmount: { fontSize: 24, fontFamily: "Cairo_900Black", fontWeight: "900", textAlign: "right" },
  payBtn: { height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  payBtnText: { fontSize: 14, fontFamily: "Cairo_700Bold" },
  sectionTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", textAlign: "right" },
  orderRow: { borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" },
  orderRight: { flex: 1, gap: 4 },
  orderLeft: { alignItems: "flex-end", gap: 2 },
  orderNum: { fontSize: 11, fontFamily: "Cairo_400Regular" },
  orderItems: { fontSize: 13, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  orderTotal: { fontSize: 16, fontFamily: "Cairo_900Black", fontWeight: "900" },
  orderDebt: { fontSize: 11, fontFamily: "Cairo_600SemiBold" },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  summaryTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", textAlign: "right" },
  summaryStats: { flexDirection: "row-reverse", justifyContent: "space-around" },
  summaryStat: { alignItems: "center", gap: 4 },
  summaryNum: { fontSize: 24, fontFamily: "Cairo_900Black", fontWeight: "900" },
  summaryLabel: { fontSize: 11, fontFamily: "Cairo_400Regular" },
  logoutBtn: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", height: 48, borderRadius: 12, borderWidth: 1, gap: 8 },
  logoutText: { fontSize: 14, fontFamily: "Cairo_700Bold" },
});
