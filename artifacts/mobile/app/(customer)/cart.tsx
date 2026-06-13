import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/EmptyState";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { addOrder } = useStore();
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "deferred">("cash");
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      await addOrder({
        merchantId: user?.merchantId ?? "store-001",
        customerId: user?.customerId ?? "customer-001",
        customerName: user?.name ?? "عميل",
        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.unitPrice * i.quantity,
        })),
        subtotal: total,
        discount: 0,
        deliveryCost: 30,
        total: total + 30,
        paidAmount: paymentMethod === "deferred" ? 0 : total + 30,
        remainingAmount: paymentMethod === "deferred" ? total + 30 : 0,
        paymentMethod,
        status: "new",
        notes: notes.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("تم الطلب", "تم إرسال طلبك بنجاح! ستصلك رسالة واتساب للتأكيد.", [
        { text: "حسناً", onPress: clearCart }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>السلة</Text>
        </View>
        <EmptyState icon="shopping-cart" title="السلة فارغة" subtitle="أضف منتجات من الكتالوج" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => { Alert.alert("مسح السلة", "هل تريد مسح كل المنتجات؟", [{ text: "إلغاء", style: "cancel" }, { text: "مسح", style: "destructive", onPress: clearCart }]); }} activeOpacity={0.8}>
          <Text style={[styles.clearText, { color: colors.destructive }]}>مسح الكل</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>السلة ({items.length})</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Items */}
        {items.map(item => (
          <View key={item.product.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={[styles.removeBtn, { backgroundColor: colors.destructive + "15" }]} activeOpacity={0.8}>
              <Feather name="x" size={14} color={colors.destructive} />
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.foreground }]}>{item.product.name}</Text>
              <Text style={[styles.itemPrice, { color: colors.mutedForeground }]}>{item.unitPrice} ج.م × {item.quantity}</Text>
            </View>
            <View style={[styles.productIconWrap, { backgroundColor: colors.accent }]}>
              <Text style={styles.productIcon}>{item.product.icon || "📦"}</Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity style={[styles.qtyBtn, { borderColor: colors.border }]} onPress={() => updateQuantity(item.product.id, item.quantity - 1)} activeOpacity={0.8}>
                <Feather name="minus" size={14} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.qtyNum, { color: colors.foreground }]}>{item.quantity}</Text>
              <TouchableOpacity style={[styles.qtyBtn, { borderColor: colors.border }]} onPress={() => updateQuantity(item.product.id, item.quantity + 1)} activeOpacity={0.8}>
                <Feather name="plus" size={14} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.itemTotal, { color: colors.foreground }]}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</Text>
            </View>
          </View>
        ))}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>ملاحظات (اختياري)</Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="اكتب ملاحظاتك هنا..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            textAlign="right"
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>طريقة الدفع</Text>
          <View style={styles.pmRow}>
            {[
              { key: "cash", label: "كاش عند الاستلام", icon: "dollar-sign" as const },
              { key: "bank_transfer", label: "تحويل بنكي", icon: "credit-card" as const },
              { key: "deferred", label: "آجل", icon: "clock" as const },
            ].map(pm => (
              <TouchableOpacity
                key={pm.key}
                style={[
                  styles.pmBtn,
                  {
                    backgroundColor: paymentMethod === pm.key ? colors.primary : colors.accent,
                    borderColor: paymentMethod === pm.key ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setPaymentMethod(pm.key as any)}
                activeOpacity={0.8}
              >
                <Feather name={pm.icon} size={14} color={paymentMethod === pm.key ? colors.primaryForeground : colors.mutedForeground} />
                <Text style={[styles.pmText, { color: paymentMethod === pm.key ? colors.primaryForeground : colors.foreground }]}>
                  {pm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={[styles.totalsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalVal, { color: colors.foreground }]}>{total} ج.م</Text>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>المنتجات</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalVal, { color: colors.foreground }]}>30 ج.م</Text>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>التوصيل</Text>
          </View>
          <View style={[styles.totalRow, styles.grandRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.grandVal, { color: colors.foreground }]}>{total + 30} ج.م</Text>
            <Text style={[styles.grandLabel, { color: colors.foreground }]}>الإجمالي</Text>
          </View>
        </View>
      </ScrollView>

      {/* Order Button */}
      <View style={[styles.orderBtnWrap, { paddingBottom: insets.bottom + 70, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.orderBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleOrder}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Feather name="send" size={20} color={colors.primaryForeground} />
          <Text style={[styles.orderBtnText, { color: colors.primaryForeground }]}>
            {loading ? "جاري الإرسال..." : `تأكيد الطلب — ${total + 30} ج.م`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Cairo_900Black", fontWeight: "900" },
  clearText: { fontSize: 14, fontFamily: "Cairo_600SemiBold" },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  itemCard: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 10 },
  productIconWrap: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  productIcon: { fontSize: 22 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontFamily: "Cairo_700Bold", textAlign: "right" },
  itemPrice: { fontSize: 12, fontFamily: "Cairo_400Regular", textAlign: "right" },
  qtyControls: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 16, fontFamily: "Cairo_700Bold", minWidth: 24, textAlign: "center" },
  itemTotal: { fontSize: 15, fontFamily: "Cairo_900Black", fontWeight: "900", minWidth: 60, textAlign: "left" },
  removeBtn: { width: 28, height: 28, borderRadius: 7, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  section: { gap: 8 },
  sectionLabel: { fontSize: 15, fontFamily: "Cairo_700Bold", textAlign: "right" },
  notesInput: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 80, fontSize: 14 },
  pmRow: { gap: 8 },
  pmBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  pmText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", flex: 1, textAlign: "right" },
  totalsCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  totalRow: { flexDirection: "row-reverse", justifyContent: "space-between" },
  totalLabel: { fontSize: 13, fontFamily: "Cairo_400Regular" },
  totalVal: { fontSize: 14, fontFamily: "Cairo_600SemiBold" },
  grandRow: { paddingTop: 8, borderTopWidth: 1 },
  grandLabel: { fontSize: 16, fontFamily: "Cairo_700Bold" },
  grandVal: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900" },
  orderBtnWrap: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 10 },
  orderBtn: { flexDirection: "row-reverse", height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 8 },
  orderBtnText: { fontSize: 16, fontFamily: "Cairo_700Bold" },
});
