import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const LOGO_DARK  = require("@/assets/images/logo-dark.png");
const LOGO_LIGHT = require("@/assets/images/logo-light.png");

const FEATURES = [
  { icon: "layers",     text: "إدارة كاملة للمخزون والفروع" },
  { icon: "users",      text: "كتالوج رقمي لعملائك" },
  { icon: "shield",     text: "حماية وأمان عالي للبيانات" },
];

export default function LandingScreen() {
  const { width, height } = useWindowDimensions();
  const insets  = useSafeAreaInsets();
  const scheme  = useSafeAreaInsets();
  const isDark  = useColorScheme() === "dark";

  const logoSource = isDark ? LOGO_LIGHT : LOGO_DARK;
  const BG   = isDark ? "#0E0E0E" : "#F5F2ED";
  const FG   = isDark ? "#FAF7F2" : "#1A1A1A";
  const MUTED = isDark ? "#6B6B6B" : "#9B9B9B";
  const CARD  = isDark ? "#161616" : "#FFFFFF";
  const BORDER = isDark ? "#232323" : "#E8E2D8";

  // Animations
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY      = useRef(new Animated.Value(30)).current;
  const titleOp     = useRef(new Animated.Value(0)).current;
  const featY       = useRef(new Animated.Value(30)).current;
  const featOp      = useRef(new Animated.Value(0)).current;
  const btnY        = useRef(new Animated.Value(30)).current;
  const btnOp       = useRef(new Animated.Value(0)).current;

  // Floating logo
  const floatAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(featY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(featOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(btnOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>

      {/* خلفية زخرفية */}
      <View style={[styles.bgCircle1, {
        backgroundColor: FG,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        top: -width * 0.25,
        right: -width * 0.2,
        opacity: isDark ? 0.04 : 0.04,
      }]} />
      <View style={[styles.bgCircle2, {
        backgroundColor: FG,
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        bottom: height * 0.25,
        left: -width * 0.15,
        opacity: isDark ? 0.03 : 0.03,
      }]} />

      {/* القسم العلوي — شعار وعنوان */}
      <View style={[styles.top, { paddingTop: insets.top + 40 }]}>

        <Animated.View style={{
          transform: [{ scale: logoScale }, { translateY: floatY }],
          opacity: logoOpacity,
          alignItems: "center",
        }}>
          <View style={[styles.logoWrap, {
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            borderColor: BORDER,
            shadowColor: FG,
            shadowOpacity: isDark ? 0.15 : 0.08,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }]}>
            <Image
              source={logoSource}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View style={{
          alignItems: "center",
          transform: [{ translateY: titleY }],
          opacity: titleOp,
          marginTop: 28,
          gap: 10,
        }}>
          <Text style={[styles.brand, { color: FG }]}>فلاش بيور</Text>
          <Text style={[styles.tagline, { color: MUTED }]}>
            منصة إدارة المستلزمات الطبية
          </Text>
        </Animated.View>
      </View>

      {/* القسم الأوسط — المميزات */}
      <Animated.View style={[
        styles.mid,
        { transform: [{ translateY: featY }], opacity: featOp },
      ]}>
        {FEATURES.map((f, i) => (
          <View key={i} style={[styles.featureRow, {
            backgroundColor: CARD,
            borderColor: BORDER,
          }]}>
            <View style={[styles.featureIcon, {
              backgroundColor: isDark ? "#1E1E1E" : "#F5F2ED",
            }]}>
              <Feather name={f.icon as any} size={18} color={FG} />
            </View>
            <Text style={[styles.featureText, { color: FG }]}>{f.text}</Text>
          </View>
        ))}
      </Animated.View>

      {/* القسم السفلي — أزرار */}
      <Animated.View style={[
        styles.bottom,
        {
          paddingBottom: insets.bottom + 32,
          transform: [{ translateY: btnY }],
          opacity: btnOp,
        },
      ]}>

        {/* زرار تسجيل الدخول */}
        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: FG }]}
          onPress={() => router.push("/login")}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnPrimaryText, { color: BG }]}>
            تسجيل الدخول
          </Text>
          <Feather name="arrow-left" size={18} color={BG} />
        </TouchableOpacity>

        {/* زرار التسجيل */}
        <TouchableOpacity
          style={[styles.btnSecondary, {
            borderColor: BORDER,
            backgroundColor: CARD,
          }]}
          onPress={() => router.push("/register")}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnSecondaryText, { color: FG }]}>
            سجل متجرك الآن
          </Text>
        </TouchableOpacity>

        <Text style={[styles.year, { color: MUTED }]}>
          فلاش بيور © 2026
        </Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgCircle1: { position: "absolute" },
  bgCircle2: { position: "absolute" },

  top: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 32,
    fontFamily: "Cairo_900Black",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
  },

  mid: {
    paddingHorizontal: 24,
    gap: 10,
  },

  featureRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "right",
  },

  bottom: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 12,
    alignItems: "center",
  },

  btnPrimary: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnPrimaryText: {
    fontSize: 17,
    fontFamily: "Cairo_700Bold",
    letterSpacing: -0.3,
  },

  btnSecondary: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
  },

  year: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    marginTop: 4,
  },
});
