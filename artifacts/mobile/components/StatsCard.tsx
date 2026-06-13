import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  isPrimary?: boolean;
  trend?: "up" | "down";
  trendValue?: string;
}

export function StatsCard({ title, value, subtitle, icon, isPrimary, trend, trendValue }: StatsCardProps) {
  const colors = useColors();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isPrimary ? colors.primary : colors.card,
        borderColor: colors.border,
        borderWidth: isPrimary ? 0 : 1,
      }
    ]}>
      <View style={styles.header}>
        <View style={[
          styles.iconWrap,
          { backgroundColor: isPrimary ? "rgba(255,255,255,0.15)" : colors.accent }
        ]}>
          <Feather
            name={icon}
            size={18}
            color={isPrimary ? colors.primaryForeground : colors.foreground}
          />
        </View>
        {trend && trendValue && (
          <View style={styles.trend}>
            <Feather
              name={trend === "up" ? "trending-up" : "trending-down"}
              size={12}
              color={trend === "up" ? colors.success : colors.destructive}
            />
            <Text style={[
              styles.trendText,
              { color: trend === "up" ? colors.success : colors.destructive }
            ]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.value,
        { color: isPrimary ? colors.primaryForeground : colors.foreground }
      ]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[
        styles.title,
        { color: isPrimary ? "rgba(250,247,242,0.7)" : colors.mutedForeground }
      ]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[
          styles.subtitle,
          { color: isPrimary ? "rgba(250,247,242,0.5)" : colors.mutedForeground }
        ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  trend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  trendText: {
    fontSize: 11,
    fontFamily: "Cairo_600SemiBold",
  },
  value: {
    fontSize: 24,
    fontFamily: "Cairo_900Black",
    fontWeight: "900",
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: "Cairo_600SemiBold",
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
    marginTop: 2,
  },
});
