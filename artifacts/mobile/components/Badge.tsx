import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "info" | "outline";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const colors = useColors();

  const getBg = () => {
    switch (variant) {
      case "success": return colors.success;
      case "warning": return colors.warning;
      case "destructive": return colors.destructive;
      case "info": return colors.info;
      case "outline": return "transparent";
      default: return colors.accent;
    }
  };

  const getFg = () => {
    switch (variant) {
      case "success": return colors.successForeground;
      case "warning": return colors.warningForeground;
      case "destructive": return colors.destructiveForeground;
      case "info": return colors.infoForeground;
      case "outline": return colors.foreground;
      default: return colors.accentForeground;
    }
  };

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: getBg(),
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor: colors.border,
      }
    ]}>
      <Text style={[styles.text, { color: getFg() }]}>{label}</Text>
    </View>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    new: { label: "جديد", variant: "info" },
    processing: { label: "قيد التجهيز", variant: "warning" },
    delivering: { label: "خرج للتوصيل", variant: "warning" },
    delivered: { label: "تم التسليم", variant: "success" },
    returned: { label: "مرتجع", variant: "outline" },
    cancelled: { label: "ملغي", variant: "destructive" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" as BadgeVariant };
  return <Badge label={cfg.label} variant={cfg.variant} />;
}

export function PaymentMethodBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    cash: "كاش",
    bank_transfer: "تحويل بنكي",
    whatsapp_pay: "واتساب Pay",
    deferred: "آجل",
    partial: "جزئي",
  };
  return <Badge label={map[method] ?? method} variant="outline" />;
}

export function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    starter: { label: "Starter", variant: "outline" },
    pro: { label: "Pro", variant: "info" },
    elite: { label: "Elite", variant: "warning" },
    enterprise: { label: "Enterprise", variant: "success" },
  };
  const cfg = map[plan] ?? { label: plan, variant: "default" as BadgeVariant };
  return <Badge label={cfg.label} variant={cfg.variant} />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontFamily: "Cairo_700Bold",
    fontWeight: "700",
  },
});
