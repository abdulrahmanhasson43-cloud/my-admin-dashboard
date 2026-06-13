import React, { useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { SearchBar } from "@/components/SearchBar";

const CATEGORIES = [
  { id: "all", label: "الكل", icon: "grid" as const },
  { id: "gloves", label: "قفازات", icon: "shield" as const },
  { id: "devices", label: "أجهزة", icon: "activity" as const },
  { id: "bandages", label: "ضمادات", icon: "heart" as const },
  { id: "syringes", label: "محاقن", icon: "droplet" as const },
];

function getPriceForCategory(product: any, category: string): number {
  const map: Record<string, number> = {
    public: product.prices.public,
    retail: product.prices.retail,
    wholesale1: product.prices.wholesale1,
    wholesale2: product.prices.wholesale2,
    wholesale3: product.prices.wholesale3,
    vip: product.prices.vip,
  };
  return map[category] ?? product.prices.public;
}

export default function CustomerCatalog() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { products } = useStore();
  const { addToCart, itemCount } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const priceCategory = user?.priceCategory ?? "public";
  const filtered = products.filter(p => p.isActive && p.name.includes(search));

  const handleAdd = (product: any) => {
    addToCart(product, priceCategory);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={[styles.cartIndicator, { backgroundColor: colors.accent, borderColor: colors.border }]}>
            <Feather name="shopping-cart" size={18} color={colors.foreground} />
            {itemCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cartBadgeText, { color: colors.primaryForeground }]}>{itemCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>أهلاً</Text>
            <Text style={[styles.customerName, { color: colors.foreground }]}>{user?.name}</Text>
          </View>
          <View style={[styles.logoMini, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={16} color={colors.primaryForeground} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="بحث في المنتجات..." />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catChip,
              {
                backgroundColor: category === cat.id ? colors.primary : colors.accent,
                borderColor: category === cat.id ? colors.primary : colors.border,
              }
            ]}
            onPress={() => setCategory(cat.id)}
            activeOpacity={0.8}
          >
            <Feather name={cat.icon} size={13} color={category === cat.id ? colors.primaryForeground : colors.mutedForeground} />
            <Text style={[styles.catText, { color: category === cat.id ? colors.primaryForeground : colors.foreground }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        numColumns={2}
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 80 }]}
        columnWrapperStyle={styles.gridRow}
        scrollEnabled={!!filtered.length}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const price = getPriceForCategory(item, priceCategory);
          return (
            <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.productIconWrap, { backgroundColor: colors.accent }]}>
                <Text style={styles.productIcon}>{item.icon || "📦"}</Text>
              </View>
              <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.productDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{item.description}</Text>
              <View style={styles.productFooter}>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleAdd(item)}
                  activeOpacity={0.8}
                >
                  <Feather name="plus" size={16} color={colors.primaryForeground} />
                </TouchableOpacity>
                <Text style={[styles.productPrice, { color: colors.foreground }]}>{price} ج.م</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { borderBottomWidth: 1, paddingBottom: 12 },
  headerRow: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, gap: 12 },
  logoMini: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  greeting: { fontSize: 12, fontFamily: "Cairo_400Regular", textAlign: "right" },
  customerName: { fontSize: 18, fontFamily: "Cairo_700Bold", textAlign: "right" },
  cartIndicator: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { fontSize: 10, fontFamily: "Cairo_700Bold" },
  categoryScroll: { borderBottomWidth: 0 },
  categoryRow: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  catChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  catText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
  grid: { paddingHorizontal: 12, paddingTop: 4, gap: 10 },
  gridRow: { flexDirection: "row-reverse", gap: 10 },
  productCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  productIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  productIcon: { fontSize: 24 },
  productName: { fontSize: 13, fontFamily: "Cairo_700Bold", textAlign: "right" },
  productDesc: { fontSize: 11, fontFamily: "Cairo_400Regular", textAlign: "right" },
  productFooter: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  productPrice: { fontSize: 16, fontFamily: "Cairo_900Black", fontWeight: "900" },
  addBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
