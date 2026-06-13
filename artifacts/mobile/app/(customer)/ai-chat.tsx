import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "أنا مساعد فلاش بيور! بساعدك في أي سؤال عن المستلزمات الطبية. بس ممنوع الأسئلة عن الأدوية أو الإرشادات العلاجية.",
  "قفازات": "القفازات الطبية اللي عندنا دلوقتي:\n• قفازات لاتكس معقمة - 40 ج.م/علبة\n• قفازات فينيل للحساسية - 38 ج.م/علبة\n\nالمخزون كويس دلوقتي! تحب أضيف للسلة؟",
  "ضغط": "جهاز قياس ضغط الدم الرقمي متاح بـ 320 ج.م (سعر التجزئة). دقيق وسهل الاستخدام، مناسب للاستخدام المنزلي. هل تحتاج مواصفات أكثر؟",
  "حرارة": "مقياس الحرارة الإبطي الرقمي بـ 110 ج.م. سريع ودقيق. في المخزون دلوقتي.",
  "محاقن": "المحاقن الطبية المعقمة (5 مل) بـ 22 ج.م للعلبة (100 محقنة). للاستخدام الواحد فقط.",
  "مساء": "مساء النور! أنا موجود وجاهز أساعدك في أي سؤال عن المستلزمات الطبية. إيه اللي محتاجه؟",
  "صباح": "صباح الخير! كيف أقدر أساعدك النهارده؟",
};

function getResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return DEMO_RESPONSES.default;
}

export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `أهلاً ${user?.name ?? ""}! أنا مساعد فلاش بيور الذكي. بساعدك في:\n• استفسارات المنتجات\n• توافر المخزون\n• الأسعار والعروض\n\nاسأل أي سؤال عن المستلزمات الطبية.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      const response = getResponse(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1200 + Math.random() * 600);
  };

  const formatTime = (d: Date) => d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

  const QUICK_QUESTIONS = ["قفازات طبية", "جهاز قياس ضغط", "مقياس حرارة", "محاقن"];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <View style={[styles.aiBadge, { backgroundColor: colors.success + "20" }]}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={[styles.aiBadgeText, { color: colors.success }]}>متاح</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>مساعد فلاش بيور</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>مستلزمات طبية فقط — بالعامية المصرية</Text>
        </View>
        <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}>
          <Feather name="cpu" size={18} color={colors.primaryForeground} />
        </View>
      </View>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <View style={styles.quickSection}>
          <Text style={[styles.quickTitle, { color: colors.mutedForeground }]}>أسئلة سريعة:</Text>
          <View style={styles.quickRow}>
            {QUICK_QUESTIONS.map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.quickChip, { backgroundColor: colors.accent, borderColor: colors.border }]}
                onPress={() => setInput(q)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickText, { color: colors.foreground }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={[styles.messagesList, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.messageWrap, item.role === "user" && styles.userWrap]}>
            {item.role === "assistant" && (
              <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                <Feather name="zap" size={12} color={colors.primaryForeground} />
              </View>
            )}
            <View style={[
              styles.bubble,
              item.role === "user"
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
            ]}>
              <Text style={[
                styles.bubbleText,
                { color: item.role === "user" ? colors.primaryForeground : colors.foreground }
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.bubbleTime,
                { color: item.role === "user" ? "rgba(250,247,242,0.5)" : colors.mutedForeground }
              ]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingWrap}>
              <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                <Feather name="zap" size={12} color={colors.primaryForeground} />
              </View>
              <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.typingDots}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.typingDot, { backgroundColor: colors.mutedForeground }]} />
                  ))}
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputWrap, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 70 }]}>
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.accent }]}
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.8}
          >
            <Feather name="send" size={18} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: colors.accent, borderColor: colors.border, color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
            value={input}
            onChangeText={setInput}
            placeholder="اسأل عن أي منتج..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlign="right"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  aiIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Cairo_700Bold", textAlign: "right" },
  headerSub: { fontSize: 11, fontFamily: "Cairo_400Regular", textAlign: "right" },
  aiBadge: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  aiBadgeText: { fontSize: 11, fontFamily: "Cairo_600SemiBold" },
  quickSection: { paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  quickTitle: { fontSize: 12, fontFamily: "Cairo_400Regular", textAlign: "right" },
  quickRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  quickText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
  messagesList: { paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  messageWrap: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 8 },
  userWrap: { flexDirection: "row", justifyContent: "flex-end" },
  avatarSmall: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble: { maxWidth: "78%", borderRadius: 14, padding: 12, gap: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Cairo_400Regular", lineHeight: 22, textAlign: "right" },
  bubbleTime: { fontSize: 10, fontFamily: "Cairo_400Regular", textAlign: "left" },
  typingWrap: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 8, paddingTop: 4 },
  typingBubble: { borderRadius: 14, borderWidth: 1, padding: 14 },
  typingDots: { flexDirection: "row-reverse", gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.5 },
  inputWrap: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 8, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, maxHeight: 100, minHeight: 42 },
  sendBtn: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
