import React, { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useStore, Customer, Supplier } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { StatsCard } from "@/components/StatsCard";

type Tab = "customers" | "suppliers" | "debt" | "reports" | "settings";

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { products, customers, suppliers, orders, addCustomer, addSupplier } = useStore();
  const [tab, setTab] = useState<Tab>("customers");

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>المزيد</Text>
      </View>

      {/* Tab selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabs}>
          {([
            { key: "customers", label: "العملاء", icon: "users" },
            { key: "suppliers", label: "الموردين", icon: "truck" },
            { key: "debt", label: "الديون", icon: "credit-card" },
            { key: "reports", label: "التقارير", icon: "bar-chart-2" },
            { key: "settings", label: "الإعدادات", icon: "settings" },
          ] as { key: Tab; label: string; icon: keyof typeof Feather.glyphMap }[]).map(t => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tabBtn,
                { backgroundColor: tab === t.key ? colors.primary : colors.accent, borderColor: tab === t.key ? colors.primary : colors.border }
              ]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.8}
            >
              <Feather name={t.icon} size={14} color={tab === t.key ? colors.primaryForeground : colors.mutedForeground} />
              <Text style={[styles.tabText, { color: tab === t.key ? colors.primaryForeground : colors.foreground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {tab === "customers" && <CustomersTab colors={colors} insets={insets} customers={customers} addCustomer={addCustomer} />}
      {tab === "suppliers" && <SuppliersTab colors={colors} insets={insets} suppliers={suppliers} addSupplier={addSupplier} />}
      {tab === "debt" && <DebtTab colors={colors} insets={insets} customers={customers} />}
      {tab === "reports" && <ReportsTab colors={colors} insets={insets} orders={orders} products={products} customers={customers} />}
      {tab === "settings" && <SettingsTab colors={colors} insets={insets} user={user} logout={logout} />}
    </View>
  );
}

function CustomersTab({ colors, insets, customers, addCustomer }: any) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cat, setCat] = useState<Customer["priceCategory"]>("retail");
  const filtered = customers.filter((c: Customer) => c.name.includes(search) || c.phone.includes(search));

  const handleAdd = async () => {
    if (!name.trim()) { Alert.alert("تنبيه", "الاسم مطلوب"); return; }
    const code = "FP-" + Date.now().toString().slice(-6);
    await addCustomer({ merchantId: "store-001", name: name.trim(), phone: phone.trim(), priceCategory: cat, accessCode: code, creditLimit: 1000, totalDebt: 0, status: "active" });
    setName(""); setPhone(""); setShowAdd(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 8 }}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity style={[{ backgroundColor: colors.primary, width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }]} onPress={() => setShowAdd(!showAdd)} activeOpacity={0.8}>
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
          <Text style={[{ fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.foreground }]}>{customers.length} عميل</Text>
        </View>
        {showAdd && (
          <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 }]}>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} value={name} onChangeText={setName} placeholder="اسم العميل" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} value={phone} onChangeText={setPhone} placeholder="رقم التليفون" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" textAlign="right" />
            <View style={{ flexDirection: "row-reverse", gap: 6, flexWrap: "wrap" }}>
              {(["public", "retail", "wholesale1", "vip"] as Customer["priceCategory"][]).map(c => (
                <TouchableOpacity key={c} style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, backgroundColor: cat === c ? colors.primary : colors.accent, borderColor: cat === c ? colors.primary : colors.border }]} onPress={() => setCat(c)} activeOpacity={0.8}>
                  <Text style={[{ fontSize: 11, fontFamily: "Cairo_600SemiBold", color: cat === c ? colors.primaryForeground : colors.foreground }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[{ backgroundColor: colors.primary, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" }]} onPress={handleAdd} activeOpacity={0.8}>
              <Text style={[{ color: colors.primaryForeground, fontSize: 14, fontFamily: "Cairo_700Bold" }]}>إضافة</Text>
            </TouchableOpacity>
          </View>
        )}
        <SearchBar value={search} onChangeText={setSearch} placeholder="بحث في العملاء..." />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 8, paddingBottom: insets.bottom + 80 }}>
        {filtered.length === 0 ? <EmptyState icon="users" title="لا يوجد عملاء" /> : filtered.map((c: Customer) => (
          <View key={c.id} style={[styles.customerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.customerLeft}>
              {c.totalDebt > 0 && <Text style={[{ fontSize: 12, fontFamily: "Cairo_700Bold", color: colors.destructive }]}>{c.totalDebt} ج.م دين</Text>}
              <Text style={[{ fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground }]}>{c.accessCode}</Text>
            </View>
            <View style={styles.customerRight}>
              <Text style={[{ fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.foreground, textAlign: "right" }]}>{c.name}</Text>
              <Text style={[{ fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground }]}>{c.phone} · {c.priceCategory}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function SuppliersTab({ colors, insets, suppliers, addSupplier }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) { Alert.alert("تنبيه", "الاسم مطلوب"); return; }
    await addSupplier({ merchantId: "store-001", name: name.trim(), phone: phone.trim(), totalDebt: 0, rating: 5 });
    setName(""); setPhone(""); setShowAdd(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 8 }}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity style={[{ backgroundColor: colors.primary, width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }]} onPress={() => setShowAdd(!showAdd)} activeOpacity={0.8}>
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
          <Text style={[{ fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.foreground }]}>{suppliers.length} مورد</Text>
        </View>
        {showAdd && (
          <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 }]}>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} value={name} onChangeText={setName} placeholder="اسم المورد / الشركة" placeholderTextColor={colors.mutedForeground} textAlign="right" />
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} value={phone} onChangeText={setPhone} placeholder="رقم التليفون" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" textAlign="right" />
            <TouchableOpacity style={[{ backgroundColor: colors.primary, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" }]} onPress={handleAdd} activeOpacity={0.8}>
              <Text style={[{ color: colors.primaryForeground, fontSize: 14, fontFamily: "Cairo_700Bold" }]}>إضافة</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 8, paddingBottom: insets.bottom + 80 }}>
        {suppliers.map((s: Supplier) => (
          <View key={s.id} style={[styles.customerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.customerLeft}>
              {s.totalDebt > 0 && <Text style={[{ fontSize: 12, fontFamily: "Cairo_700Bold", color: colors.destructive }]}>{s.totalDebt} ج.م مستحق</Text>}
              <View style={{ flexDirection: "row-reverse", gap: 2 }}>
                {[1,2,3,4,5].map(star => (
                  <Feather key={star} name="star" size={10} color={star <= s.rating ? colors.warning : colors.border} />
                ))}
              </View>
            </View>
            <View style={styles.customerRight}>
              <Text style={[{ fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.foreground, textAlign: "right" }]}>{s.name}</Text>
              <Text style={[{ fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground }]}>{s.phone}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function DebtTab({ colors, insets, customers }: any) {
  const debtCustomers = customers.filter((c: Customer) => c.totalDebt > 0);
  const totalDebt = debtCustomers.reduce((s: number, c: Customer) => s + c.totalDebt, 0);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 10, paddingBottom: insets.bottom + 80 }}>
      <View style={[{ backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30", borderWidth: 1, borderRadius: 14, padding: 16 }]}>
        <Text style={[{ fontSize: 28, fontFamily: "Cairo_900Black", fontWeight: "900", color: colors.destructive, textAlign: "right" }]}>
          {totalDebt.toLocaleString()} ج.م
        </Text>
        <Text style={[{ fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.destructive, textAlign: "right" }]}>
          إجمالي ديون العملاء
        </Text>
      </View>
      {debtCustomers.length === 0 ? (
        <EmptyState icon="check-circle" title="لا توجد ديون" subtitle="ممتاز! كل العملاء لديهم رصيد صفر" />
      ) : debtCustomers.map((c: Customer) => (
        <View key={c.id} style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }]}>
          <TouchableOpacity style={[{ flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.primary, borderRadius: 8 }]} activeOpacity={0.8}>
            <Feather name="message-circle" size={14} color={colors.primaryForeground} />
            <Text style={[{ fontSize: 11, fontFamily: "Cairo_600SemiBold", color: colors.primaryForeground }]}>تذكير</Text>
          </TouchableOpacity>
          <View>
            <Text style={[{ fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.foreground, textAlign: "right" }]}>{c.name}</Text>
            <Text style={[{ fontSize: 18, fontFamily: "Cairo_900Black", fontWeight: "900", color: colors.destructive, textAlign: "right" }]}>{c.totalDebt} ج.م</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function ReportsTab({ colors, insets, orders, products, customers }: any) {
  const totalSales = orders.reduce((s: number, o: any) => s + o.total, 0);
  const totalPaid = orders.reduce((s: number, o: any) => s + o.paidAmount, 0);
  const totalRemaining = orders.reduce((s: number, o: any) => s + o.remainingAmount, 0);
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 10, paddingBottom: insets.bottom + 80 }}>
      <View style={styles.statsRow}>
        <StatsCard title="إجمالي المبيعات" value={`${(totalSales/1000).toFixed(1)}k`} subtitle="ج.م" icon="dollar-sign" isPrimary />
        <StatsCard title="المحصّل" value={`${(totalPaid/1000).toFixed(1)}k`} subtitle="ج.م" icon="check-circle" />
      </View>
      <View style={styles.statsRow}>
        <StatsCard title="الديون المتبقية" value={`${totalRemaining}`} subtitle="ج.م" icon="credit-card" />
        <StatsCard title="طلبات مُسلَّمة" value={String(deliveredOrders)} icon="package" />
      </View>

      <Text style={[{ fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.foreground, textAlign: "right" }]}>المنتجات الأكثر مبيعاً</Text>
      {products.slice(0, 5).map((p: any) => (
        <View key={p.id} style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row-reverse", alignItems: "center", gap: 10 }]}>
          <Text style={{ fontSize: 20 }}>{p.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.foreground, textAlign: "right" }]}>{p.name}</Text>
            <Text style={[{ fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground }]}>مخزون: {p.stock} {p.unit}</Text>
          </View>
          <Text style={[{ fontSize: 15, fontFamily: "Cairo_900Black", fontWeight: "900", color: colors.foreground }]}>{p.prices.retail} ج.م</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function SettingsTab({ colors, insets, user, logout }: any) {
  const sections = [
    { icon: "store" as const, label: "بيانات المتجر" },
    { icon: "file-text" as const, label: "إعدادات الفاتورة" },
    { icon: "truck" as const, label: "إعدادات التوصيل" },
    { icon: "credit-card" as const, label: "طرق الدفع" },
    { icon: "bell" as const, label: "الإشعارات" },
    { icon: "users" as const, label: "الموظفين والصلاحيات" },
    { icon: "lock" as const, label: "الأمان" },
    { icon: "download" as const, label: "نسخة احتياطية" },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 8, paddingBottom: insets.bottom + 80 }}>
      <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: "row-reverse", alignItems: "center", gap: 12 }]}>
        <View style={[{ width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }]}>
          <Feather name="user" size={24} color={colors.primaryForeground} />
        </View>
        <View>
          <Text style={[{ fontSize: 17, fontFamily: "Cairo_700Bold", color: colors.foreground, textAlign: "right" }]}>{user?.name}</Text>
          <Text style={[{ fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground }]}>{user?.plan?.toUpperCase() ?? "Pro"} · صاحب متجر</Text>
        </View>
      </View>

      <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, overflow: "hidden" }]}>
        {sections.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={[{ flexDirection: "row-reverse", alignItems: "center", padding: 14, gap: 12, ...(i < sections.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}) }]}
            activeOpacity={0.8}
          >
            <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
            <Text style={[{ flex: 1, fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.foreground, textAlign: "right" }]}>{s.label}</Text>
            <View style={[{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }]}>
              <Feather name={s.icon} size={15} color={colors.foreground} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[{ height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.destructive + "40", backgroundColor: colors.destructive + "10", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 }]}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[{ fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.destructive }]}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Cairo_900Black", fontWeight: "900", textAlign: "right" },
  tabScroll: { borderBottomWidth: 1 },
  tabs: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  tabBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  tabText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
  statsRow: { flexDirection: "row-reverse", gap: 10 },
  customerCard: { borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  customerLeft: { alignItems: "flex-start", gap: 4 },
  customerRight: { flex: 1, gap: 2, paddingStart: 12 },
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, fontFamily: "Cairo_400Regular" },
});
