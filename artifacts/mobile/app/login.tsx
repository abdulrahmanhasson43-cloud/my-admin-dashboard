import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
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
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const LOGO_DARK = require("@/assets/images/logo-dark.png");
const LOGO_LIGHT = require("@/assets/images/logo-light.png");

type LoginMode = "email" | "code";

/* ── Animated floating orb ── */
function Orb({ style, delay, colors }: { style: any; delay: number; colors: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 4000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 4000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.18, 0.32, 0.18] });

  return (
    <Animated.View
      style={[style, { transform: [{ translateY }], opacity }]}
    />
  );
}

export default function LoginScreen() {
  const { width, height: winH } = useWindowDimensions();
  const colors = useColors();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const isDark = scheme === "dark";

  const [mode, setMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Entrance animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const logoSource = isDark ? LOGO_LIGHT : LOGO_DARK;

  const handleLogin = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      let success = false;
      if (mode === "email") {
        if (!email.trim() || !password.trim()) {
          setError("من فضلك ادخل البريد الإلكتروني وكلمة المرور");
          return;
        }
        success = await login(email.trim(), password.trim());
      } else {
        if (!code.trim()) {
          setError("من فضلك ادخل كود الدخول");
          return;
        }
        success = await login(code.trim());
      }
      if (!success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError("البيانات غير صحيحة، حاول مرة أخرى");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const HERO_H = Math.max(winH * 0.42, 260);

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#0E0E0E" : "#F5F2ED" }]}>

      {/* ── Background orbs ── */}
      <Orb
        delay={0}
        colors={colors}
        style={{
          position: "absolute",
          top: HERO_H * 0.15,
          left: width * 0.1,
          width: width * 0.55,
          height: width * 0.55,
          borderRadius: width * 0.275,
          backgroundColor: isDark ? "#FAF7F2" : "#1A1A1A",
        }}
      />
      <Orb
        delay={800}
        colors={colors}
        style={{
          position: "absolute",
          top: HERO_H * 0.35,
          right: -width * 0.1,
          width: width * 0.4,
          height: width * 0.4,
          borderRadius: width * 0.2,
          backgroundColor: isDark ? "#FAF7F2" : "#1A1A1A",
        }}
      />

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

          {/* ── HERO ── */}
          <View style={{ height: HERO_H + insets.top, justifyContent: "flex-end", paddingBottom: 36 }}>
            {/* Logo centered */}
            <Animated.View style={{
              alignItems: "center",
              opacity: logoAnim,
              transform: [{
                translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
              }],
            }}>
              <Image
                source={logoSource}
                style={{ width: width * 0.22, height: width * 0.22 }}
                resizeMode="contain"
              />
              <Text style={[styles.brandName, { color: isDark ? "#FAF7F2" : "#1A1A1A" }]}>
                فلاش بيور
              </Text>
              <Text style={[styles.brandSub, { color: isDark ? "#9B9B9B" : "#6B6B6B" }]}>
                منصة إدارة المستلزمات الطبية
              </Text>
            </Animated.View>
          </View>

          {/* ── CARD ── */}
          <Animated.View style={[
            styles.card,
            {
              backgroundColor: isDark ? "#161616" : "#FFFFFF",
              transform: [{ translateY: cardAnim }],
              opacity: cardOpacity,
            },
          ]}>

            {/* Tab toggle */}
            <View style={[styles.tabRow, {
              backgroundColor: isDark ? "#1E1E1E" : "#F0EBE0",
              borderRadius: 16,
            }]}>
              {(["email", "code"] as LoginMode[]).map((m) => {
                const active = mode === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.tabBtn,
                      active && {
                        backgroundColor: isDark ? "#FAF7F2" : "#1A1A1A",
                        borderRadius: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.12,
                        shadowRadius: 6,
                        elevation: 3,
                      },
                    ]}
                    onPress={() => { setMode(m); setError(""); }}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={m === "email" ? "mail" : "key"}
                      size={14}
                      color={active
                        ? (isDark ? "#1A1A1A" : "#FAF7F2")
                        : (isDark ? "#9B9B9B" : "#6B6B6B")
                      }
                    />
                    <Text style={[
                      styles.tabText,
                      {
                        color: active
                          ? (isDark ? "#1A1A1A" : "#FAF7F2")
                          : (isDark ? "#9B9B9B" : "#6B6B6B"),
                      },
                    ]}>
                      {m === "email" ? "بريد إلكتروني" : "كود الدخول"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title */}
            <View style={{ gap: 4, marginTop: 8 }}>
              <Text style={[styles.title, { color: isDark ? "#FAF7F2" : "#1A1A1A" }]}>
                {mode === "email" ? "تسجيل الدخول" : "دخول بالكود"}
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? "#9B9B9B" : "#6B6B6B" }]}>
                {mode === "email"
                  ? "ادخل بيانات حسابك للمتابعة"
                  : "ادخل كود العميل الخاص بك"}
              </Text>
            </View>

            {/* Fields */}
            {mode === "email" ? (
              <View style={{ gap: 14 }}>
                <Field
                  label="البريد الإلكتروني"
                  icon="mail"
                  isDark={isDark}
                  colors={colors}
                >
                  <TextInput
                    style={[styles.inputText, { color: isDark ? "#FAF7F2" : "#1A1A1A" }]}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(""); }}
                    placeholder="example@email.com"
                    placeholderTextColor={isDark ? "#555" : "#AAA"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textAlign="right"
                    returnKeyType="next"
                  />
                </Field>

                <Field
                  label="كلمة المرور"
                  icon="lock"
                  isDark={isDark}
                  colors={colors}
                  rightAction={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Feather
                        name={showPassword ? "eye-off" : "eye"}
                        size={17}
                        color={isDark ? "#555" : "#AAA"}
                      />
                    </TouchableOpacity>
                  }
                >
                  <TextInput
                    style={[styles.inputText, { color: isDark ? "#FAF7F2" : "#1A1A1A" }]}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(""); }}
                    placeholder="••••••••"
                    placeholderTextColor={isDark ? "#555" : "#AAA"}
                    secureTextEntry={!showPassword}
                    textAlign="right"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </Field>
              </View>
            ) : (
              <Field label="كود الدخول" icon="key" isDark={isDark} colors={colors}>
                <TextInput
                  style={[
                    styles.inputText,
                    {
                      color: isDark ? "#FAF7F2" : "#1A1A1A",
                      letterSpacing: 5,
                      textAlign: "center",
                      fontFamily: "Cairo_700Bold",
                      fontSize: 16,
                    },
                  ]}
                  value={code}
                  onChangeText={(t) => { setCode(t.toUpperCase()); setError(""); }}
                  placeholder="FP-XXXX-XXX"
                  placeholderTextColor={isDark ? "#555" : "#AAA"}
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </Field>
            )}

            {/* Error */}
            {error !== "" && (
              <View style={[styles.errorBox, {
                backgroundColor: isDark ? "#2A1515" : "#FFF0EE",
                borderColor: isDark ? "#5A2020" : "#FFCDD2",
              }]}>
                <Feather name="alert-circle" size={14} color="#E55039" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: isDark ? "#FAF7F2" : "#1A1A1A",
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <Text style={[styles.btnText, { color: isDark ? "#1A1A1A" : "#FAF7F2" }]}>
                    جاري الدخول
                  </Text>
                  <LoadingDots isDark={isDark} />
                </View>
              ) : (
                <Text style={[styles.btnText, { color: isDark ? "#1A1A1A" : "#FAF7F2" }]}>
                  دخول
                </Text>
              )}
            </TouchableOpacity>

            {/* Register link */}
            {mode === "email" && (
              <TouchableOpacity
                onPress={() => router.push("/register")}
                activeOpacity={0.7}
                style={styles.registerLink}
              >
                <Text style={[styles.registerText, { color: isDark ? "#9B9B9B" : "#6B6B6B" }]}>
                  مش عندك حساب؟{"  "}
                  <Text style={{ color: isDark ? "#FAF7F2" : "#1A1A1A", fontFamily: "Cairo_700Bold" }}>
                    سجل متجرك الآن
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Bottom safe area */}
            <View style={{ height: Math.max(insets.bottom, 32) }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ── Field component ── */
function Field({
  label, icon, children, rightAction, isDark, colors,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  isDark: boolean;
  colors: any;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.fieldLabel, { color: isDark ? "#9B9B9B" : "#6B6B6B" }]}>
        {label}
      </Text>
      <View style={[
        styles.fieldBox,
        {
          backgroundColor: isDark ? "#1E1E1E" : "#F5F2ED",
          borderColor: isDark ? "#2A2A2A" : "#E8E2D8",
        },
      ]}>
        {rightAction ?? (
          <Feather name={icon} size={17} color={isDark ? "#555" : "#AAA"} />
        )}
        {children}
        {rightAction && (
          <Feather name={icon} size={17} color={isDark ? "#555" : "#AAA"} />
        )}
      </View>
    </View>
  );
}

/* ── Loading dots ── */
function LoadingDots({ isDark }: { isDark: boolean }) {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: isDark ? "#1A1A1A" : "#FAF7F2",
            opacity: dot,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  brandName: {
    fontSize: 22,
    fontFamily: "Cairo_900Black",
    marginTop: 14,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    marginTop: 4,
  },

  card: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
    flexGrow: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 10,
  },

  tabRow: {
    flexDirection: "row-reverse",
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    gap: 7,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Cairo_600SemiBold",
  },

  title: {
    fontSize: 26,
    fontFamily: "Cairo_900Black",
    textAlign: "right",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },

  fieldLabel: {
    fontSize: 13,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "right",
  },
  fieldBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    height: 54,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Cairo_400Regular",
    paddingVertical: 0,
  },

  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    color: "#E55039",
    textAlign: "right",
  },

  btn: {
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnText: {
    fontSize: 17,
    fontFamily: "Cairo_700Bold",
    letterSpacing: -0.3,
  },

  registerLink: {
    alignItems: "center",
    paddingVertical: 4,
  },
  registerText: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
  },
});
