import React, { useState } from "react";
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useStore, Order } from "@/context/StoreContext";
import { OrderCard } from "@/components/OrderCard";
import { OrderStatusBadge, PaymentMethodBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";

const STATUS_FILTERS = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديد" },
  { key: "processing", label: "تجهيز" },
  { key: "delivering", label: "توصيل" },
  { key: "delivered", label: "مُسلَّم" },
];

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus } = useStore();

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders
    .filter(o => statusFilter === "all" || o.status === statusFilter)
    .filter(o => o.customerName.includes(search) || o.orderNumber.includes(search));

  const statusOptions: Array<Order["status"]> = ["new", "processing", "delivering", "delivered", "returned", "cancelled"];
  const statusLabels: Record<string, string> = {
    new: "جديد", processing: "قيد التجهيز", delivering: "خرج للتوصيل",
    delivered: "تم التسليم", returned: "مرتجع", cancelled: "ملغي",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>الطلبات</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{filtered.length} طلب</Text>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {STATUS_FILTERS.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: statusFilter === f.key ? colors.primary : colors.accent,
                    borderColor: statusFilter === f.key ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setStatusFilter(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, { color: statusFilter === f.key ? colors.primaryForeground : colors.foreground }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="بحث بالعميل أو رقم الطلب..." />
        </View>
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="file-text" title="لا توجد طلبات" subtitle="ستظهر الطلبات هنا عند إضافتها من نقطة البيع" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={o => o.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          scrollEnabled={!!filtered.length}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => setSelectedOrder(item)} />
          )}
        />
      )}

      <Modal visible={!!selectedOrder} animationType="slide" presentationStyle="formSheet">
        {selectedOrder && (
          <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>تفاصيل الطلب</Text>
              <View style={{ width: 22 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={[styles.orderDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailVal, { color: colors.foreground }]}>{selectedOrder.orderNumber}</Text>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>رقم الطلب</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailVal, { color: colors.foreground }]}>{selectedOrder.customerName}</Text>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>العميل</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.badgesGroup}>
                    <OrderStatusBadge status={selectedOrder.status} />
                    <PaymentMethodBadge method={selectedOrder.paymentMethod} />
                  </View>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>الحالة</Text>
                </View>
              </View>

              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>المنتجات</Text>
              {selectedOrder.items.map((item, i) => (
                <View key={i} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.itemTotal, { color: colors.foreground }]}>{item.total} ج.م</Text>
                  <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>×{item.quantity}</Text>
                  <Text style={[styles.itemName, { color: colors.foreground }]}>{item.productName}</Text>
                </View>
              ))}

              <View style={[styles.totalsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {[
                  { label: "الإجمالي الفرعي", val: selectedOrder.subtotal },
                  { label: "الخصم", val: -selectedOrder.discount },
                  { label: "التوصيل", val: selectedOrder.deliveryCost },
                ].map((r, i) => (
                  <View key={i} style={styles.totalRow}>
                    <Text style={[styles.totalVal, { color: colors.foreground }]}>{r.val > 0 ? "+" : ""}{r.val} ج.م</Text>
                    <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                  </View>
                ))}
                <View style={[styles.totalRow, styles.grandRow]}>
                  <Text style={[styles.grandVal, { color: colors.foreground }]}>{selectedOrder.total} ج.م</Text>
                  <Text style={[styles.grandLabel, { color: colors.foreground }]}>الإجمالي</Text>
                </View>
                {selectedOrder.remainingAmount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalVal, { color: colors.destructive }]}>{selectedOrder.remainingAmount} ج.م</Text>
                    <Text style={[styles.totalLabel, { color: colors.destructive }]}>المتبقي (دين)</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>تحديث الحالة</Text>
              <View style={styles.statusGrid}>
                {statusOptions.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: selectedOrder.status === s ? colors.primary : colors.accent,
                        borderColor: selectedOrder.status === s ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => {
                      updateOrderStatus(selectedOrder.id, s);
                      setSelectedOrder({ ...selectedOrder, status: s });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.statusBtnText, { color: selectedOrder.status === s ? colors.primaryForeground : colors.foreground }]}>
                      {statusLabels[s]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
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
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900" },
  count: { fontSize: 14, fontFamily: "Cairo_400Regular" },
  filterSection: { paddingTop: 10, paddingBottom: 6 },
  filterRow: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  list: { paddingHorizontal: 16, paddingTop: 8, gap: 4 },
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontFamily: "Cairo_700Bold" },
  modalContent: { padding: 16, gap: 12, paddingBottom: 40 },
  orderDetailCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  detailRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontSize: 13, fontFamily: "Cairo_400Regular" },
  detailVal: { fontSize: 14, fontFamily: "Cairo_600SemiBold" },
  badgesGroup: { flexDirection: "row-reverse", gap: 6 },
  sectionLabel: { fontSize: 16, fontFamily: "Cairo_700Bold", textAlign: "right" },
  itemRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1 },
  itemName: { flex: 1, fontSize: 13, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  itemQty: { fontSize: 13, fontFamily: "Cairo_400Regular" },
  itemTotal: { fontSize: 14, fontFamily: "Cairo_700Bold", minWidth: 60, textAlign: "left" },
  totalsCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  totalRow: { flexDirection: "row-reverse", justifyContent: "space-between" },
  totalLabel: { fontSize: 13, fontFamily: "Cairo_400Regular" },
  totalVal: { fontSize: 14, fontFamily: "Cairo_600SemiBold" },
  grandRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E8E2D8" },
  grandLabel: { fontSize: 16, fontFamily: "Cairo_700Bold" },
  grandVal: { fontSize: 20, fontFamily: "Cairo_900Black", fontWeight: "900" },
  statusGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  statusBtnText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
});
