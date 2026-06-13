import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Order } from "@/context/StoreContext";
import { OrderStatusBadge, PaymentMethodBadge } from "./Badge";

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.badges}>
          <OrderStatusBadge status={order.status} />
          <PaymentMethodBadge method={order.paymentMethod} />
        </View>
        <Text style={[styles.orderNum, { color: colors.mutedForeground }]}>{order.orderNumber}</Text>
      </View>

      <Text style={[styles.customerName, { color: colors.foreground }]}>{order.customerName}</Text>

      <Text style={[styles.itemsSummary, { color: colors.mutedForeground }]}>
        {order.items.length} منتج — {order.items.map(i => `${i.productName} ×${i.quantity}`).join("، ")}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footer}>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(order.createdAt)}</Text>
        <View style={styles.amountSection}>
          {order.remainingAmount > 0 && (
            <Text style={[styles.debt, { color: colors.destructive }]}>
              متبقي: {order.remainingAmount} ج.م
            </Text>
          )}
          <Text style={[styles.total, { color: colors.foreground }]}>
            {order.total} ج.م
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badges: {
    flexDirection: "row-reverse",
    gap: 6,
    flexWrap: "wrap",
  },
  orderNum: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
  },
  customerName: {
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
  },
  itemsSummary: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
  },
  amountSection: {
    alignItems: "flex-end",
    gap: 2,
  },
  debt: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
  },
  total: {
    fontSize: 18,
    fontFamily: "Cairo_900Black",
    fontWeight: "900",
  },
});
