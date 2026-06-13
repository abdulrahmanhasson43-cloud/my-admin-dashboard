import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useStore, Product, Customer } from "@/context/StoreContext";
import { SearchBar } from "@/components/SearchBar";

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export default function POSScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, customers, addOrder } = useStore();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "deferred" | "partial">("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  const filteredProducts = products.filter(p =>
    p.isActive && (p.name.includes(search) || p.barcode?.includes(search))
  );

  const addToCart = (product: Product) => {
    const priceCategory = selectedCustomer?.priceCategory ?? "public";
    const priceMap: Record<string, number> = {
      public: product.prices.public,
      retail: product.prices.retail,
      wholesale1: product.prices.wholesale1,
      wholesale2: product.prices.wholesale2,
      wholesale3: product.prices.wholesale3,
      vip: product.prices.vip,
    };
    const price = priceMap[priceCategory] ?? product.prices.public;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1, price }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountVal = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountVal);
  const paid = parseFloat(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert("تنبيه", "السلة فارغة");
      return;
    }
    if (!selectedCustomer) {
      Alert.alert("تنبيه", "اختر العميل أولاً");
      return;
    }

    const actualPaid = paymentMethod === "cash" || paymentMethod === "bank_transfer" ? total : paid;

    await addOrder({
      merchantId: "store-001",
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.price,
        total: i.price * i.quantity,
      })),
      subtotal,
      discount: discountVal,
      deliveryCost: 0,
      total,
      paidAmount: actualPaid,
      remainingAmount: Math.max(0, total - actualPaid),
      paymentMethod,
      status: "delivered",
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("تم البيع", `تم تسجيل الفاتورة بنجاح\nالإجمالي: ${total} ج.م`, [
      { text: "فاتورة جديدة", onPress: () => { setCart([]); setSelectedCustomer(null); setShowCheckout(false); setDiscount("0"); setPaidAmount(""); } }
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: cart.length > 0 ? colors.primary : colors.accent }]}
          onPress={() => cart.length > 0 && setShowCheckout(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.checkoutBtnText, { color: cart.length > 0 ? colors.primaryForeground : colors.mutedForeground }]}>
            {total > 0 ? `${total} ج.م` : "الدفع"}
          </Text>
          {cart.length > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primaryForeground }]}>
              <Text style={[styles.cartBadgeText, { color: colors.primary }]}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>نقطة البيع</Text>
      </View>

      {/* Customer & Search */}
      <View style={styles.searchSection}>
        <TouchableOpacity
          style={[styles.customerPicker, { backgroundColor: colors.accent, borderColor: colors.border }]}
          onPress={() => setShowCustomerPicker(true)}
          activeOpacity={0.8}
        >
          <Feather name="user" size={14} color={colors.mutedForeground} />
          <Text style={[styles.customerPickerText, { color: selectedCustomer ? colors.foreground : colors.mutedForeground }]}>
            {selectedCustomer?.name ?? "اختر العميل"}
          </Text>
          <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
        <SearchBar value={search} onChangeText={setSearch} placeholder="بحث بالمنتج أو الباركود..." />
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={p => p.id}
        numColumns={2}
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 80 }]}
        columnWrapperStyle={styles.gridRow}
        scrollEnabled={filteredProducts.length > 0}
        renderItem={({ item }) => {
          const cartItem = cart.find(c => c.product.id === item.id);
          const inCart = cartItem ? cartItem.quantity : 0;
          const priceCategory = selectedCustomer?.priceCategory ?? "public";
          const priceMap: Record<string, number> = {
            public: item.prices.public, retail: item.prices.retail,
            wholesale1: item.prices.wholesale1, wholesale2: item.prices.wholesale2,
            wholesale3: item.prices.wholesale3, vip: item.prices.vip,
          };
          const price = priceMap[priceCategory] ?? item.prices.public;

          return (
            <TouchableOpacity
              style={[
                styles.productTile,
                { backgroundColor: colors.card, borderColor: inCart > 0 ? colors.primary : colors.border },
                inCart > 0 && { borderWidth: 2 },
              ]}
              onPress={() => addToCart(item)}
              activeOpacity={0.85}
            >
              <View style={[styles.productEmoji, { backgroundColor: colors.accent }]}>
                <Text style={styles.productEmojiText}>{item.icon || "📦"}</Text>
              </View>
              <Text style={[styles.productTileName, { color: colors.foreground }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.productTilePrice, { color: colors.foreground }]}>{price} ج.م</Text>
              {inCart > 0 && (
                <View style={[styles.inCartBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.inCartText, { color: colors.primaryForeground }]}>{inCart}</Text>
                </View>
              )}
              <Text style={[styles.productStock, { color: item.stock <= item.minStock ? colors.destructive : colors.mutedForeground }]}>
                {item.stock} {item.unit}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Checkout Modal */}
      <Modal visible={showCheckout} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowCheckout(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>إتمام البيع</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {cart.map(item => (
              <View key={item.product.id} style={[styles.cartRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.cartItemTotal, { color: colors.foreground }]}>
                  {(item.price * item.quantity).toFixed(0)} ج.م
                </Text>
                <View style={styles.qtyControl}>
                  <TouchableOpacity style={[styles.qtyBtn, { borderColor: colors.border }]} onPress={() => updateQty(item.product.id, item.quantity - 1)}>
                    <Feather name="minus" size={14} color={colors.foreground} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyNum, { color: colors.foreground }]}>{item.quantity}</Text>
                  <TouchableOpacity style={[styles.qtyBtn, { borderColor: colors.border }]} onPress={() => updateQty(item.product.id, item.quantity + 1)}>
                    <Feather name="plus" size={14} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cartItemName, { color: colors.foreground }]} numberOfLines={1}>{item.product.name}</Text>
              </View>
            ))}

            <View style={[styles.totalsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalVal, { color: colors.foreground }]}>{subtotal} ج.م</Text>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>الإجمالي الفرعي</Text>
              </View>
              <View style={styles.totalRow}>
                <TextInput
                  style={[styles.discountInput, { color: colors.foreground, borderColor: colors.border, fontFamily: "Cairo_400Regular" }]}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="number-pad"
                  textAlign="center"
                />
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>خصم (ج.م)</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={[styles.grandTotalVal, { color: colors.foreground }]}>{total} ج.م</Text>
                <Text style={[styles.grandTotalLabel, { color: colors.foreground }]}>الإجمالي النهائي</Text>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>طريقة الدفع</Text>
            <View style={styles.paymentMethods}>
              {[
                { key: "cash", label: "كاش" },
                { key: "bank_transfer", label: "تحويل" },
                { key: "deferred", label: "آجل" },
                { key: "partial", label: "جزئي" },
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
                  <Text style={[styles.pmText, { color: paymentMethod === pm.key ? colors.primaryForeground : colors.foreground }]}>
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {paymentMethod === "partial" && (
              <View style={styles.paidSection}>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>المبلغ المدفوع</Text>
                <TextInput
                  style={[styles.paidInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  textAlign="right"
                />
                <Text style={[styles.remainingText, { color: colors.destructive }]}>
                  المتبقي: {remaining} ج.م
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleCheckout}
              activeOpacity={0.9}
            >
              <Feather name="check" size={20} color={colors.primaryForeground} />
              <Text style={[styles.confirmText, { color: colors.primaryForeground }]}>تأكيد البيع — {total} ج.م</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Customer Picker Modal */}
      <Modal visible={showCustomerPicker} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>اختيار العميل</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {customers.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.customerRow, { backgroundColor: colors.card, borderColor: c.id === selectedCustomer?.id ? colors.primary : colors.border }]}
                onPress={() => { setSelectedCustomer(c); setShowCustomerPicker(false); }}
                activeOpacity={0.85}
              >
                <View style={styles.customerInfo}>
                  <Text style={[styles.customerCat, { color: colors.mutedForeground }]}>{c.priceCategory}</Text>
                  {c.totalDebt > 0 && <Text style={[styles.customerDebt, { color: colors.destructive }]}>دين: {c.totalDebt} ج.م</Text>}
                </View>
                <View style={styles.customerDetails}>
                  <Text style={[styles.customerName, { color: colors.foreground }]}>{c.name}</Text>
                  <Text style={[styles.customerPhone, { color: colors.mutedForeground }]}>{c.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontFamily: "Cairo_900Black", fontWeight: "900" },
  checkoutBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  checkoutBtnText: { fontSize: 15, fontFamily: "Cairo_700Bold" },
  cartBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { fontSize: 11, fontFamily: "Cairo_700Bold" },
  searchSection: { padding: 12, gap: 8 },
  customerPicker: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  customerPickerText: { flex: 1, fontSize: 13, fontFamily: "Cairo_400Regular", textAlign: "right" },
  grid: { paddingHorizontal: 12, paddingTop: 4, gap: 10 },
  gridRow: { flexDirection: "row-reverse", gap: 10 },
  productTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "flex-end",
    gap: 6,
    position: "relative",
  },
  productEmoji: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  productEmojiText: { fontSize: 22 },
  productTileName: { fontSize: 12, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  productTilePrice: { fontSize: 15, fontFamily: "Cairo_900Black", fontWeight: "900" },
  productStock: { fontSize: 10, fontFamily: "Cairo_400Regular" },
  inCartBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  inCartText: { fontSize: 11, fontFamily: "Cairo_700Bold" },
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
  cartRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cartItemName: { flex: 1, fontSize: 13, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  qtyControl: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 15, fontFamily: "Cairo_700Bold", minWidth: 24, textAlign: "center" },
  cartItemTotal: { fontSize: 14, fontFamily: "Cairo_700Bold", minWidth: 60, textAlign: "left" },
  totalsSection: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  totalRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 14, fontFamily: "Cairo_400Regular" },
  totalVal: { fontSize: 16, fontFamily: "Cairo_700Bold" },
  discountInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 15,
  },
  grandTotal: { paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E8E2D8" },
  grandTotalLabel: { fontSize: 16, fontFamily: "Cairo_700Bold" },
  grandTotalVal: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900" },
  sectionLabel: { fontSize: 15, fontFamily: "Cairo_700Bold", textAlign: "right" },
  paymentMethods: { flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" },
  pmBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  pmText: { fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  paidSection: { gap: 6 },
  paidInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 20,
    fontFamily: "Cairo_900Black",
  },
  remainingText: { fontSize: 14, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  confirmBtn: {
    flexDirection: "row-reverse",
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  confirmText: { fontSize: 16, fontFamily: "Cairo_700Bold" },
  customerRow: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  customerDetails: { gap: 2 },
  customerName: { fontSize: 15, fontFamily: "Cairo_700Bold", textAlign: "right" },
  customerPhone: { fontSize: 12, fontFamily: "Cairo_400Regular", textAlign: "right" },
  customerInfo: { alignItems: "flex-end", gap: 2 },
  customerCat: { fontSize: 11, fontFamily: "Cairo_600SemiBold" },
  customerDebt: { fontSize: 12, fontFamily: "Cairo_700Bold" },
});
