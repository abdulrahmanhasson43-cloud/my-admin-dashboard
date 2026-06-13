import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { OrderCard } from "@/components/OrderCard";
import { EmptyState } from "@/components/EmptyState";

export default function CustomerOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { orders } = useStore();

  const myOrders = orders.filter(o => o.customerId === user?.customerId);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{myOrders.length} طلب</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>طلباتي</Text>
      </View>

      {myOrders.length === 0 ? (
        <EmptyState icon="file-text" title="لا توجد طلبات بعد" subtitle="أضف منتجات للسلة وأكد طلبك" />
      ) : (
        <FlatList
          data={myOrders}
          keyExtractor={o => o.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          scrollEnabled={!!myOrders.length}
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      )}
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
  count: { fontSize: 14, fontFamily: "Cairo_400Regular" },
  list: { paddingHorizontal: 16, paddingTop: 10, gap: 4 },
});
