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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useStore, Product } from "@/context/StoreContext";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";

const ICONS = ["💉","🩹","🌡️","🩺","🧴","🧤","🦴","🩼","🔬","📏","🧼","🏥","📦","💊","🩻","🫀","🩸","🧬","🧪"];

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, addProduct, updateProduct, deleteProduct } = useStore();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "📦",
    stock: "0",
    minStock: "5",
    unit: "قطعة",
    costPrice: "0",
    publicPrice: "0",
    retailPrice: "0",
    wholesale1: "0",
    wholesale2: "0",
    wholesale3: "0",
    vipPrice: "0",
  });

  const filtered = products.filter(p =>
    p.name.includes(search) || p.description.includes(search)
  );

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", icon: "📦", stock: "0", minStock: "5", unit: "قطعة", costPrice: "0", publicPrice: "0", retailPrice: "0", wholesale1: "0", wholesale2: "0", wholesale3: "0", vipPrice: "0" });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      icon: p.icon,
      stock: String(p.stock),
      minStock: String(p.minStock),
      unit: p.unit,
      costPrice: String(p.prices.cost),
      publicPrice: String(p.prices.public),
      retailPrice: String(p.prices.retail),
      wholesale1: String(p.prices.wholesale1),
      wholesale2: String(p.prices.wholesale2),
      wholesale3: String(p.prices.wholesale3),
      vipPrice: String(p.prices.vip),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("تنبيه", "اسم المنتج مطلوب");
      return;
    }
    const data = {
      merchantId: "store-001",
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 5,
      unit: form.unit,
      isActive: true,
      prices: {
        cost: parseFloat(form.costPrice) || 0,
        public: parseFloat(form.publicPrice) || 0,
        retail: parseFloat(form.retailPrice) || 0,
        wholesale1: parseFloat(form.wholesale1) || 0,
        wholesale2: parseFloat(form.wholesale2) || 0,
        wholesale3: parseFloat(form.wholesale3) || 0,
        vip: parseFloat(form.vipPrice) || 0,
      },
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("حذف المنتج", `هل تريد حذف "${name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => deleteProduct(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd} activeOpacity={0.8}>
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>المنتجات</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="بحث في المنتجات..." />
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="package" title="لا توجد منتجات" subtitle="اضغط + لإضافة منتج جديد" actionLabel="إضافة منتج" onAction={openAdd} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          scrollEnabled={!!filtered.length}
          renderItem={({ item }) => {
            const isLow = item.stock <= item.minStock;
            return (
              <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.productRow}>
                  <View style={styles.productActions}>
                    <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]} onPress={() => openEdit(item)} activeOpacity={0.8}>
                      <Feather name="edit-2" size={14} color={colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.destructive + "40" }]} onPress={() => handleDelete(item.id, item.name)} activeOpacity={0.8}>
                      <Feather name="trash-2" size={14} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productInfo}>
                    <View style={styles.productNameRow}>
                      <View style={[styles.stockBox, { backgroundColor: isLow ? colors.destructive + "15" : colors.success + "15" }]}>
                        <Text style={[styles.stockNum, { color: isLow ? colors.destructive : colors.success }]}>{item.stock}</Text>
                        <Text style={[styles.stockUnit, { color: isLow ? colors.destructive : colors.success }]}>{item.unit}</Text>
                      </View>
                      <Text style={[styles.productIcon]}>{item.icon}</Text>
                      <Text style={[styles.productName, { color: colors.foreground }]}>{item.name}</Text>
                    </View>
                    <View style={styles.pricesRow}>
                      <Text style={[styles.priceChip, { backgroundColor: colors.accent, color: colors.foreground }]}>
                        ت: {item.prices.retail}
                      </Text>
                      <Text style={[styles.priceChip, { backgroundColor: colors.accent, color: colors.foreground }]}>
                        ج: {item.prices.wholesale1}
                      </Text>
                      <Text style={[styles.priceChip, { backgroundColor: colors.accent, color: colors.foreground }]}>
                        ع: {item.prices.public}
                      </Text>
                      <Text style={[styles.priceChip, { backgroundColor: colors.accent, color: colors.mutedForeground }]}>
                        ت: {item.prices.cost}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} activeOpacity={0.8}>
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>حفظ</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editingProduct ? "تعديل منتج" : "منتج جديد"}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Icon Picker */}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>الأيقونة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.iconRow}>
                {ICONS.map(ic => (
                  <TouchableOpacity
                    key={ic}
                    style={[styles.iconOption, {
                      backgroundColor: form.icon === ic ? colors.primary : colors.accent,
                      borderColor: form.icon === ic ? colors.primary : colors.border,
                    }]}
                    onPress={() => setForm(f => ({ ...f, icon: ic }))}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.iconOptionText}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {[
              { label: "اسم المنتج *", key: "name", placeholder: "مثال: قفازات طبية" },
              { label: "الوصف", key: "description", placeholder: "وصف مختصر للمنتج" },
              { label: "وحدة القياس", key: "unit", placeholder: "قطعة / علبة / زجاجة" },
            ].map(f => (
              <View key={f.key} style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  textAlign="right"
                />
              </View>
            ))}

            <View style={styles.row}>
              {[
                { label: "الكمية الحالية", key: "stock" },
                { label: "الحد الأدنى", key: "minStock" },
              ].map(f => (
                <View key={f.key} style={[styles.field, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                    keyboardType="number-pad"
                    textAlign="right"
                  />
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>الأسعار</Text>
            {[
              { label: "سعر التكلفة", key: "costPrice" },
              { label: "السعر العام", key: "publicPrice" },
              { label: "سعر التجزئة", key: "retailPrice" },
              { label: "جملة 1", key: "wholesale1" },
              { label: "جملة 2", key: "wholesale2" },
              { label: "جملة 3", key: "wholesale3" },
              { label: "سعر VIP", key: "vipPrice" },
            ].map(f => (
              <View key={f.key} style={styles.priceField}>
                <TextInput
                  style={[styles.priceInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_700Bold" }]}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
                <Text style={[styles.priceLabel, { color: colors.foreground }]}>{f.label}</Text>
              </View>
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
  title: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900" },
  addBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  searchWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  list: { paddingHorizontal: 16, paddingTop: 6, gap: 8 },
  productCard: { borderRadius: 14, borderWidth: 1, padding: 12 },
  productRow: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 10 },
  productInfo: { flex: 1, gap: 8 },
  productNameRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  productIcon: { fontSize: 20 },
  productName: { flex: 1, fontSize: 14, fontFamily: "Cairo_700Bold", textAlign: "right" },
  stockBox: { padding: 6, borderRadius: 8, alignItems: "center" },
  stockNum: { fontSize: 15, fontFamily: "Cairo_900Black", fontWeight: "900" },
  stockUnit: { fontSize: 9, fontFamily: "Cairo_400Regular" },
  pricesRow: { flexDirection: "row-reverse", gap: 6, flexWrap: "wrap" },
  priceChip: { fontSize: 11, fontFamily: "Cairo_600SemiBold", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  productActions: { gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
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
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 14, fontFamily: "Cairo_700Bold" },
  modalContent: { padding: 16, gap: 12, paddingBottom: 40 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  row: { flexDirection: "row-reverse", gap: 10 },
  sectionLabel: { fontSize: 16, fontFamily: "Cairo_700Bold", textAlign: "right", marginTop: 4 },
  priceField: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  priceInput: { width: 100, height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16 },
  priceLabel: { fontSize: 13, fontFamily: "Cairo_600SemiBold", flex: 1, textAlign: "right", marginRight: 12 },
  iconRow: { flexDirection: "row-reverse", gap: 8, paddingBottom: 4 },
  iconOption: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconOptionText: { fontSize: 20 },
});
