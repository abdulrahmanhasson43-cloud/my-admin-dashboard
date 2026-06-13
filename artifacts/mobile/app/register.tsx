import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";

const SPECIALTIES = [
  "مستلزمات طبية عامة",
  "أجهزة طبية",
  "مستهلكات مستشفيات",
  "معامل وتحاليل",
  "صيدليات",
  "عيادات",
  "أخرى",
];

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const insets    = useSafeAreaInsets();
  const isDark    = useColorScheme() === "dark";
  const { register } = useAuth();

  const BG     = isDark ? "#0E0E0E" : "#F5F2ED";
  const FG     = isDark ? "#FAF7F2" : "#1A1A1A";
  const MUTED  = isDark ? "#6B6B6B" : "#9B9B9B";
  const CARD   = isDark ? "#161616" : "#FFFFFF";
  const FIELD  = isDark ? "#1E1E1E" : "#F5F2ED";
  const BORDER = isDark ? "#2A2A2A" : "#E8E2D8";

  const [step, setStep]         = useState<1 | 2>(1);
  const [loading, setLoading]   = useState(false);
  const [showSpec, setShowSpec] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError]       = useState("");

  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone]         = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");

  // Entrance animation
  const cardAnim = useRef(new Animated.Value(40)).current;
  const cardOp   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 0, duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOp, {
        toValue: 1, duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Step transition
  const stepAnim = useRef(new Animated.Value(0)).current;
  const goStep2 = () => {
    Animated.sequence([
      Animated.timing(stepAnim, { toValue: -30, duration: 180, useNativeDriver: true }),
      Animated.timing(stepAnim, { toValue: 0,   duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    setStep(2);
  };

  const validateStep1 = (): string => {
    if (!storeName.trim())       return "ادخل اسم المتجر";
    if (!ownerName.trim())       return "ادخل اسم صاحب المتجر";
    if (phone.trim().length < 10) return "ادخل رقم موبايل صحيح";
    if (!specialty)              return "اختار التخصص";
    return "";
  };

  const validateStep2 = (): string => {
    if (!email.includes("@"))   return "ادخل بريد إلكتروني صحيح";
    if (password.length < 8)    return "كلمة المرور لازم تكون 8 أحرف على الأقل";
    if (password !== confirm)   return "كلمة المرور مش متطابقة";
    return "";
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goStep2();
  };

  const handleRegister = async () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const success = await register({
        storeName, ownerName, phone, specialty,
        email: email.trim().toLowerCase(), password,
      });
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError("هذا البريد الإلكتروني مسجل من قبل");
      }
    } finally {
      setLoading(false);
    }
  };

  const passMatch = confirm.length > 0 && password === confirm;
  const passWrong = confirm.length > 0 && password !== confirm;

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Header ── */}
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: CARD, borderColor: BORDER }]}
              onPress={() => step === 2 ? (setStep(1), setError("")) : router.back()}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="arrow-right" size={18} color={FG} />
            </TouchableOpacity>

            {/* Step indicator */}
            <View style={styles.stepsRow}>
              <StepDot num="١" active={step === 1} done={step === 2} color={FG} muted={MUTED} />
              <View style={[styles.stepLine, {
                backgroundColor: step === 2 ? FG : BORDER,
              }]} />
              <StepDot num="٢" active={step === 2} done={false} color={FG} muted={MUTED} />
            </View>
          </View>

          {/* ── Card ── */}
          <Animated.View style={[
            styles.card,
            {
              backgroundColor: CARD,
              transform: [{ translateY: cardAnim }],
              opacity: cardOp,
            },
          ]}>

            <Animated.View style={{ transform: [{ translateY: stepAnim }], gap: 20 }}>

              {/* Title */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.title, { color: FG }]}>
                  {step === 1 ? "تسجيل متجر جديد" : "بيانات الحساب"}
                </Text>
                <Text style={[styles.subtitle, { color: MUTED }]}>
                  {step === 1
                    ? "الخطوة الأولى — معلومات المتجر"
                    : "الخطوة الثانية — بيانات الدخول"}
                </Text>
              </View>

              {step === 1 ? (
                <View style={{ gap: 14 }}>
                  <Field label="اسم المتجر" icon="shopping-bag"
                    isDark={isDark} FG={FG} MUTED={MUTED} FIELD={FIELD} BORDER={BORDER}>
                    <TextInput
                      style={[styles.inputText, { color: FG }]}
                      value={storeName} onChangeText={(t) => { setStoreName(t); setError(""); }}
                      placeholder="مثال: متجر الصحة الطبي"
                      placeholderTextColor={isDark ? "#444" : "#BBB"}
                      textAlign="right" returnKeyType="next"
                    />
                  </Field>

                  <Field label="اسم صاحب المتجر" icon="user"
                    isDark={isDark} FG={FG} MUTED={MUTED} FIELD={FIELD} BORDER={BORDER}>
                    <TextInput
                      style={[styles.inputText, { color: FG }]}
                      value={ownerName} onChangeText={(t) => { setOwnerName(t); setError(""); }}
                      placeholder="الاسم بالكامل"
                      placeholderTextColor={isDark ? "#444" : "#BBB"}
                      textAlign="right" returnKeyType="next"
                    />
                  </Field>

                  <Field label="رقم الموبايل" icon="phone"
                    isDark={isDark} FG={FG} MUTED={MUTED} FIELD={FIELD} BORDER={BORDER}>
                    <TextInput
                      style={[styles.inputText, { color: FG }]}
                      value={phone} onChangeText={(t) => { setPhone(t); setError(""); }}
                      placeholder="01xxxxxxxxx"
                      placeholderTextColor={isDark ? "#444" : "#BBB"}
                      keyboardType="phone-pad" textAlign="right" returnKeyType="next"
                    />
                  </Field>

                  {/* Specialty dropdown */}
                  <View style={{ gap: 8 }}>
                    <Text style={[styles.fieldLabel, { color: MUTED }]}>التخصص</Text>
                    <TouchableOpacity
                      style={[styles.fieldBox, {
                        backgroundColor: FIELD, borderColor: BORDER,
                      }]}
                      onPress={() => setShowSpec(!showSpec)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={showSpec ? "chevron-up" : "chevron-down"}
                        size={17}
                        color={isDark ? "#444" : "#BBB"}
                      />
                      <Text style={[styles.inputText, {
                        color: specialty ? FG : (isDark ? "#444" : "#BBB"),
                      }]}>
                        {specialty || "اختار التخصص"}
                      </Text>
                      <Feather name="briefcase" size={17} color={isDark ? "#444" : "#BBB"} />
                    </TouchableOpacity>

                    {showSpec && (
                      <View style={[styles.dropdown, {
                        backgroundColor: CARD, borderColor: BORDER,
                      }]}>
                        {SPECIALTIES.map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[styles.dropItem, { borderBottomColor: BORDER }]}
                            onPress={() => { setSpecialty(s); setShowSpec(false); setError(""); }}
                          >
                            {specialty === s && (
                              <Feather name="check" size={14} color={FG} />
                            )}
                            <Text style={[styles.dropText, { color: FG }]}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  {/* ملخص البيانات */}
                  <View style={[styles.summary, { backgroundColor: FIELD, borderColor: BORDER }]}>
                    {[["المتجر", storeName], ["الاسم", ownerName], ["التخصص", specialty]].map(([k, v], i, arr) => (
                      <React.Fragment key={k}>
                        <View style={styles.sumRow}>
                          <Text style={[styles.sumVal, { color: FG }]}>{v}</Text>
                          <Text style={[styles.sumKey, { color: MUTED }]}>{k}</Text>
                        </View>
                        {i < arr.length - 1 && (
                          <View style={[styles.sep, { backgroundColor: BORDER }]} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>

                  <Field label="البريد الإلكتروني" icon="mail"
                    isDark={isDark} FG={FG} MUTED={MUTED} FIELD={FIELD} BORDER={BORDER}>
                    <TextInput
                      style={[styles.inputText, { color: FG }]}
                      value={email} onChangeText={(t) => { setEmail(t); setError(""); }}
                      placeholder="example@store.com"
                      placeholderTextColor={isDark ? "#444" : "#BBB"}
                      keyboardType="email-address" autoCapitalize="none"
                      textAlign="right" returnKeyType="next"
                    />
                  </Field>

                  <Field label="كلمة المرور" icon="lock"
                    isDark={isDark} FG={FG} MUTED={MUTED} FIELD={FIELD} BORDER={BORDER}
                    rightAction={
                      <TouchableOpacity onPress={() => setShowPass(!showPass)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Feather name={showPass ? "eye-off" : "eye"} size={17} color={isDark ? "#444" : "#BBB"} />
                      </TouchableOpacity>
                    }
                  >
                    <TextInput
                      style={[styles.inputText, { color: FG }]}
                      value={password} onChangeText={(t) => { setPassword(t); setError(""); }}
                      placeholder="8 أحرف على الأقل"
                      placeholderTextColor={isDark ? "#444" : "#BBB"}
                      secureTextEntry={!showPass} textAlign="right"
                    />
                  </Field>

                  {/* تأكيد كلمة المرور */}
                  <View style={{ gap: 8 }}>
                    <Text style={[styles.fieldLabel, { color: MUTED }]}>تأكيد كلمة المرور</Text>
                    <View style={[styles.fieldBox, {
                      backgroundColor: FIELD,
                      borderColor: passMatch ? "#34A85A" : passWrong ? "#E55039" : BORDER,
                    }]}>
                      <TouchableOpacity onPress={() => setShowConf(!showConf)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Feather name={showConf ? "eye-off" : "eye"} size={17} color={isDark ? "#444" : "#BBB"} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.inputText, { color: FG }]}
                        value={confirm} onChangeText={(t) => { setConfirm(t); setError(""); }}
                        placeholder="أعد كتابة كلمة المرور"
                        placeholderTextColor={isDark ? "#444" : "#BBB"}
                        secureTextEntry={!showConf} textAlign="right"
                        onSubmitEditing={handleRegister}
                      />
                      <Feather
                        name={passMatch ? "check-circle" : passWrong ? "x-circle" : "lock"}
                        size={17}
                        color={passMatch ? "#34A85A" : passWrong ? "#E55039" : (isDark ? "#444" : "#BBB")}
                      />
                    </View>
                  </View>

                  {/* شروط الاستخدام */}
                  <View style={[styles.terms, {
                    backgroundColor: FIELD, borderColor: BORDER,
                  }]}>
                    <Feather name="shield" size={13} color={MUTED} />
                    <Text style={[styles.termsText, { color: MUTED }]}>
                      بالتسجيل توافق على شروط الاستخدام وسياسة الخصوصية
                    </Text>
                  </View>
                </View>
              )}

              {/* رسالة الخطأ */}
              {error !== "" && (
                <View style={[styles.errorBox, {
                  backgroundColor: isDark ? "#2A1515" : "#FFF0EE",
                  borderColor: isDark ? "#5A2020" : "#FFCDD2",
                }]}>
                  <Feather name="alert-circle" size={14} color="#E55039" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* زرار */}
              <TouchableOpacity
                style={[styles.btn, {
                  backgroundColor: FG,
                  opacity: loading ? 0.7 : 1,
                }]}
                onPress={step === 1 ? handleNext : handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnText, { color: BG }]}>
                  {loading ? "جاري التسجيل..." : step === 1 ? "التالي" : "إنشاء الحساب"}
                </Text>
                {!loading && (
                  <Feather
                    name={step === 1 ? "arrow-left" : "user-plus"}
                    size={18}
                    color={BG}
                  />
                )}
              </TouchableOpacity>

              {/* رابط اللوجن */}
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                activeOpacity={0.7}
                style={styles.loginLink}
              >
                <Text style={[styles.loginText, { color: MUTED }]}>
                  عندك حساب بالفعل؟{"  "}
                  <Text style={{ color: FG, fontFamily: "Cairo_700Bold" }}>
                    سجل الدخول
                  </Text>
                </Text>
              </TouchableOpacity>

              <View style={{ height: Math.max(insets.bottom, 32) }} />
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ── Field ── */
function Field({ label, icon, children, rightAction, isDark, FG, MUTED, FIELD, BORDER }: {
  label: string; icon: any; children: React.ReactNode;
  rightAction?: React.ReactNode;
  isDark: boolean; FG: string; MUTED: string; FIELD: string; BORDER: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.fieldLabel, { color: MUTED }]}>{label}</Text>
      <View style={[styles.fieldBox, { backgroundColor: FIELD, borderColor: BORDER }]}>
        {rightAction ?? <Feather name={icon} size={17} color={isDark ? "#444" : "#BBB"} />}
        {children}
        {rightAction && <Feather name={icon} size={17} color={isDark ? "#444" : "#BBB"} />}
      </View>
    </View>
  );
}

/* ── StepDot ── */
function StepDot({ num, active, done, color, muted }: {
  num: string; active: boolean; done: boolean; color: string; muted: string;
}) {
  return (
    <View style={[styles.stepDot, {
      backgroundColor: active || done ? color : "transparent",
      borderColor: active || done ? color : muted,
      borderWidth: 1.5,
    }]}>
      {done
        ? <Feather name="check" size={12} color={active || done ? (color === "#1A1A1A" ? "#FAF7F2" : "#1A1A1A") : muted} />
        : <Text style={{ fontSize: 11, fontFamily: "Cairo_700Bold", color: active ? (color === "#1A1A1A" ? "#FAF7F2" : "#1A1A1A") : muted }}>
            {num}
          </Text>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1 },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },

  backBtn: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },

  stepsRow: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stepLine: { flex: 1, height: 1.5, maxWidth: 60 },
  stepDot: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
  },

  card: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
    flexGrow: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
  },

  title:    { fontSize: 26, fontFamily: "Cairo_900Black", textAlign: "right", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Cairo_400Regular", textAlign: "right" },

  fieldLabel: { fontSize: 13, fontFamily: "Cairo_600SemiBold", textAlign: "right" },
  fieldBox: {
    flexDirection: "row-reverse", alignItems: "center",
    height: 54, borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 16, gap: 10,
  },
  inputText: {
    flex: 1, fontSize: 15,
    fontFamily: "Cairo_400Regular", paddingVertical: 0,
  },

  dropdown: {
    borderWidth: 1, borderRadius: 14,
    overflow: "hidden", marginTop: 4,
  },
  dropItem: {
    flexDirection: "row-reverse", alignItems: "center",
    justifyContent: "flex-start", gap: 10,
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropText: { fontSize: 14, fontFamily: "Cairo_400Regular" },

  summary: {
    borderWidth: 1, borderRadius: 14,
    padding: 14, gap: 10,
  },
  sumRow: { flexDirection: "row-reverse", justifyContent: "space-between" },
  sumKey: { fontSize: 12, fontFamily: "Cairo_400Regular" },
  sumVal: { fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  sep:    { height: 1 },

  terms: {
    borderWidth: 1, borderRadius: 12,
    padding: 12, flexDirection: "row-reverse",
    gap: 8, alignItems: "flex-start",
  },
  termsText: {
    flex: 1, fontSize: 12,
    fontFamily: "Cairo_400Regular",
    textAlign: "right", lineHeight: 20,
  },

  errorBox: {
    flexDirection: "row-reverse", alignItems: "center",
    gap: 8, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1,
  },
  errorText: {
    flex: 1, fontSize: 13,
    fontFamily: "Cairo_400Regular",
    color: "#E55039", textAlign: "right",
  },

  btn: {
    height: 58, borderRadius: 18,
    flexDirection: "row-reverse",
    alignItems: "center", justifyContent: "center",
    gap: 10, marginTop: 4,
  },
  btnText: { fontSize: 17, fontFamily: "Cairo_700Bold", letterSpacing: -0.3 },

  loginLink: { alignItems: "center", paddingVertical: 4 },
  loginText: { fontSize: 13, fontFamily: "Cairo_400Regular", textAlign: "center" },
});
