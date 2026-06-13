import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Product } from "@/context/StoreContext";

interface ProductCardProps {
  product: Product;
  priceCategory?: string;
  showStock?: boolean;
  showCost?: boolean;
  onPress?: () => void;
  onAdd?: () => void;
  compact?: boolean;
}

function getPriceLabel(category: string): string {
  const map: Record<string, string> = {
    public: "السعر العام",
    retail: "التجزئة",
    wholesale1: "جملة 1",
    wholesale2: "جملة 2",
    wholesale3: "جملة 3",
    vip: "VIP",
  };
  return map[category] ?? "السعر";
}

function getPrice(product: Product, category?: string): number {
  switch (category) {
    case "retail": return product.prices.retail;
    case "wholesale1": return product.prices.wholesale1;
    case "wholesale2": return product.prices.wholesale2;
    case "wholesale3": return product.prices.wholesale3;
    case "vip": return product.prices.vip;
    default: return product.prices.public;
  }
}

export function ProductCard({ product, priceCategory, showStock, showCost, onPress, onAdd, compact }: ProductCardProps) {
  const colors = useColors();
  const isLowStock = product.stock <= product.minStock;
  const displayPrice = getPrice(product, priceCategory);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        compact && styles.compactCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
          <Text style={styles.icon}>{product.icon || "📦"}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {product.name}
          </Text>
          {!compact && (
            <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
              {product.description}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.foreground }]}>
              {displayPrice} ج.م
            </Text>
            {priceCategory && priceCategory !== "public" && (
              <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>
                {getPriceLabel(priceCategory)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.right}>
          {showStock && (
            <View style={[
              styles.stockBadge,
              { backgroundColor: isLowStock ? colors.destructive + "20" : colors.success + "20" }
            ]}>
              <Text style={[
                styles.stockText,
                { color: isLowStock ? colors.destructive : colors.success }
              ]}>
                {product.stock} {product.unit}
              </Text>
            </View>
          )}
          {onAdd && (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={onAdd}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </TouchableOpacity>
          )}
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
  },
  compactCard: {
    padding: 10,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
  },
  desc: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontFamily: "Cairo_900Black",
    fontWeight: "900",
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontFamily: "Cairo_700Bold",
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
