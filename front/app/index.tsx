import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import "./../global.css";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard/Home");
    }
  }, [isAuthenticated, authLoading]);

  const handleLogin = async () => {
    // Limpiar error anterior
    setError("");

    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError("Por favor complete todos los campos");
      return;
    }

    setLoading(true);

    try {
      const result = await login({ username, password });

      if (result.success) {
        // El AuthContext ya guardó el usuario
        // La navegación se maneja en el useEffect
        router.replace("/dashboard/Home");
      } else {
        setError(result.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión. Por favor intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-slate-800 px-4">
      <View className="w-full max-w-sm bg-slate-700 p-14 rounded-sm shadow-lg border-b-4 border-wine-600">
        <View className="items-center mb-6 rounded-xl p-4">
          <Image
            source={require("../assets/images/pumax-blanco.png")}
            style={{ width: 200, height: 128 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-white mb-1">Usuario</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="nombre de usuario"
          placeholderTextColor="#9CA3AF"
          className="border border-slate-600 focus:border-brand-400 rounded-sm px-3 py-2 mb-4 text-white"
          autoCapitalize="none"
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />

        <Text className="text-white mb-1">Contraseña</Text>
        <TextInput
          ref={passwordInputRef}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
          className="border border-slate-600 focus:border-brand-300 rounded-sm px-3 py-2 mb-6 text-white"
          secureTextEntry
          editable={!loading}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        {error ? (
          <Text className="text-wine-600 text-sm mb-4">{error}</Text>
        ) : null}
      <View className="p-6">
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`bg-brand-700 rounded-lg py-2 ${loading ? 'opacity-50' : 'active:bg-brand-500'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white font-semibold text-base">
              Entrar
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-center text-gray-500 text-sm mt-4">
          ¿Olvidaste tu contraseña?
        </Text>
        <Text className="text-center text-gray-500 text-sm mt-4">
          ¿No tenés cuenta? Registrate
        </Text>
      </View>
      </View>
    </View>
  );
}