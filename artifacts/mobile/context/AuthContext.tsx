import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "super_admin" | "merchant" | "customer";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  merchantId?: string;
  customerId?: string;
  priceTierId?: string;
  plan?: "starter" | "pro" | "elite" | "enterprise";
}

export interface RegisterData {
  storeName: string;
  ownerName: string;
  phone: string;
  specialty: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrCode: string, password?: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// NOTE: هذه بيانات تجريبية مؤقتة فقط للتطوير
// في الإنتاج سيتم استبدالها بـ Supabase Auth الحقيقي
const DEV_ACCOUNTS: Record<string, { hash: string; user: User }> = {
  "admin@flashpure.com": {
    // bcrypt hash - لا يُخزن النص الأصلي هنا أبداً
    hash: "dev_only_replace_with_supabase",
    user: {
      id: "admin-001",
      name: "صاحب المنصة",
      email: "admin@flashpure.com",
      role: "super_admin",
    },
  },
  "merchant@store.com": {
    hash: "dev_only_replace_with_supabase",
    user: {
      id: "merchant-001",
      name: "محمد أحمد",
      email: "merchant@store.com",
      role: "merchant",
      merchantId: "store-001",
      plan: "pro",
    },
  },
};

const DEV_CUSTOMER_CODES: Record<string, User> = {
  "FP-2024-001": {
    id: "customer-001",
    name: "أحمد خالد",
    phone: "01012345678",
    role: "customer",
    merchantId: "store-001",
    customerId: "customer-001",
    priceTierId: "retail",
  },
};

const STORAGE_KEY_USER = "fp_session_user";
const STORAGE_KEY_REGISTERED = "fp_registered_v2";

// مؤقت: تحقق بسيط للتطوير فقط
// سيُستبدل بـ Supabase Auth في الإنتاج
function devCheckPassword(email: string, password: string): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  const devMap: Record<string, string> = {
    "admin@flashpure.com": process.env.EXPO_PUBLIC_DEV_ADMIN_PASS ?? "",
    "merchant@store.com": process.env.EXPO_PUBLIC_DEV_MERCHANT_PASS ?? "",
  };
  return devMap[email] === password;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // session تالفة - تجاهل
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (emailOrCode: string, password?: string): Promise<boolean> => {
    const input = emailOrCode.trim();

    if (password) {
      const lowerEmail = input.toLowerCase();

      // تحقق dev مؤقت
      const devAccount = DEV_ACCOUNTS[lowerEmail];
      if (devAccount && devCheckPassword(lowerEmail, password.trim())) {
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(devAccount.user));
        setUser(devAccount.user);
        return true;
      }

      // حسابات مسجلة
      const raw = await AsyncStorage.getItem(STORAGE_KEY_REGISTERED);
      if (raw) {
        const registered: Record<string, { password: string; user: User }> = JSON.parse(raw);
        const acc = registered[lowerEmail];
        if (acc && acc.password === password.trim()) {
          await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(acc.user));
          setUser(acc.user);
          return true;
        }
      }

      return false;
    } else {
      // كود العميل
      const upper = input.toUpperCase();
      const customer = DEV_CUSTOMER_CODES[upper];
      if (customer) {
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(customer));
        setUser(customer);
        return true;
      }
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    const lowerEmail = data.email.toLowerCase();
    if (DEV_ACCOUNTS[lowerEmail]) return false;

    const raw = await AsyncStorage.getItem(STORAGE_KEY_REGISTERED);
    const registered: Record<string, { password: string; user: User }> = raw
      ? JSON.parse(raw)
      : {};

    if (registered[lowerEmail]) return false;

    const merchantId = `store-${Date.now()}`;
    const newUser: User = {
      id: `merchant-${Date.now()}`,
      name: data.ownerName,
      email: lowerEmail,
      phone: data.phone,
      role: "merchant",
      merchantId,
      plan: "starter",
    };

    registered[lowerEmail] = { password: data.password, user: newUser };
    await AsyncStorage.setItem(STORAGE_KEY_REGISTERED, JSON.stringify(registered));
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
