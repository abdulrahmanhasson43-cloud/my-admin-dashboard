import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    price: 50,
    color: null,
    features: ["100 منتج", "موظف واحد", "بدون AI", "POS أساسي", "تقارير بسيطة"],
    merchants: 1,
  },
  {
    id: "pro",
    name: "Pro",
    price: 150,
    color: "info",
    features: ["1000 منتج", "5 موظفين", "AI - 10 أسئلة/يوم", "تقارير متقدمة", "مسح فواتير الموردين", "كتالوج رقمي"],
    merchants: 2,
  },
  {
    id: "elite",
    name: "Elite",
    price: 500,
    color: "warning",
    features: ["منتجات غير محدودة", "20 موظف", "AI - 50 سؤال/يوم", "كل المميزات", "فروع متعددة", "أولوية دعم فني"],
    merchants: 1,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    color: "success",
    features: ["كل شيء غير محدود", "مدير حساب خاص", "تطويرات مخصصة", "تدريب الموظفين", "API مخصص"],
    merchants: 1,
  },
];

export default function PackagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const getPlanColor = (color: string | null) => {
    if (!color) return colors.primary;
    if (color === "info") return colors.info;
    if (color === "warning") return colors.warning;
    if (color === "success") return colors.success;
    return colors.primary;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>إدارة الباقات</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {PACKAGES.map((pkg) => (
          <View key={pkg.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.countBadge, { backgroundColor: getPlanColor(pkg.color) + "20" }]}>
                <Text style={[styles.countText, { color: getPlanColor(pkg.color) }]}>
                  {pkg.merchants} متجر
                </Text>
              </View>
              <View style={styles.nameSection}>
                <Text style={[styles.planName, { color: colors.foreground }]}>{pkg.name}</Text>
                <Text style={[styles.planPrice, { color: getPlanColor(pkg.color) }]}>
                  {pkg.price ? `${pkg.price} ج.م/شهر` : "حسب الطلب"}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.features}>
              {pkg.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Feather name="check" size={14} color={getPlanColor(pkg.color)} />
                  <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.editBtn, { borderColor: getPlanColor(pkg.color), borderWidth: 1 }]}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={14} color={getPlanColor(pkg.color)} />
              <Text style={[styles.editText, { color: getPlanColor(pkg.color) }]}>تعديل الباقة</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  cardHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { fontSize: 12, fontFamily: "Cairo_700Bold" },
  nameSection: { alignItems: "flex-end", gap: 2 },
  planName: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900" },
  planPrice: { fontSize: 14, fontFamily: "Cairo_600SemiBold" },
  divider: { height: 1 },
  features: { gap: 8 },
  featureRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, fontFamily: "Cairo_400Regular", flex: 1, textAlign: "right" },
  editBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
  },
  editText: { fontSize: 13, fontFamily: "Cairo_700Bold" },
});
