import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Switch, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // La app ya está en dark mode
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("Español");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar preferencias guardadas
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedNotifications = await AsyncStorage.getItem('settings_notifications');
      const savedDarkMode = await AsyncStorage.getItem('settings_darkMode');
      const savedLanguage = await AsyncStorage.getItem('settings_language');

      if (savedNotifications !== null) {
        setNotifications(savedNotifications === 'true');
      }
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
      if (savedLanguage !== null) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('settings_notifications', notifications.toString());
      await AsyncStorage.setItem('settings_darkMode', darkMode.toString());
      await AsyncStorage.setItem('settings_language', language);

      alert("Configuración guardada exitosamente ✅");
    } catch (error) {
      console.error('Error saving settings:', error);
      alert("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#45bd66" />
        <Text className="text-white mt-4">Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-900 p-6">
      {/* Título */}
      <Text className="text-2xl font-bold mb-2 text-white">Configuración</Text>
      <Text className="text-gray-400 mb-6">Personaliza tu experiencia</Text>

      {/* Sección de Preferencias */}
      <View className="bg-slate-800 rounded-2xl p-4 shadow mb-4">
        <Text className="text-lg font-semibold mb-4 text-white">
          Preferencias de la Aplicación
        </Text>

        {/* Notificaciones */}
        <View className="flex-row justify-between items-center py-3 border-b border-slate-700">
          <View className="flex-1">
            <Text className="text-base text-white mb-1">Notificaciones</Text>
            <Text className="text-gray-400 text-sm">
              Recibe alertas sobre pedidos y stock
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#475569", true: "#45bd66" }}
            thumbColor={notifications ? "#158a33" : "#94a3b8"}
          />
        </View>

        {/* Modo oscuro */}
        <View className="flex-row justify-between items-center py-3">
          <View className="flex-1">
            <Text className="text-base text-white mb-1">Modo oscuro</Text>
            <Text className="text-gray-400 text-sm">
              {darkMode ? "Activado (recomendado)" : "Desactivado"}
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#475569", true: "#45bd66" }}
            thumbColor={darkMode ? "#158a33" : "#94a3b8"}
          />
        </View>
      </View>

      {/* Sección de Idioma */}
      <View className="bg-slate-800 rounded-2xl p-4 shadow mb-4">
        <Text className="text-lg font-semibold mb-3 text-white">Idioma</Text>

        <TouchableOpacity
          className="flex-row justify-between items-center py-3 bg-slate-700 rounded-xl px-4"
          onPress={() => setLanguageOpen(!languageOpen)}
        >
          <Text className="text-base text-white">{language}</Text>
          <Text className="text-white text-xl">{languageOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {languageOpen && (
          <View className="mt-2 bg-slate-700 rounded-xl overflow-hidden">
            {["Español", "Inglés"].map((lang, index) => (
              <TouchableOpacity
                key={lang}
                className={`py-3 px-4 ${index === 0 ? 'border-b border-slate-600' : ''}`}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageOpen(false);
                }}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-white">{lang}</Text>
                  {language === lang && (
                    <Text className="text-brand-400">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Información de la app */}
      <View className="bg-slate-800 rounded-2xl p-4 shadow mb-4">
        <Text className="text-lg font-semibold mb-3 text-white">Acerca de</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-400">Versión</Text>
            <Text className="text-white">1.0.0</Text>
          </View>
          <View className="flex-row justify-between py-2 border-t border-slate-700">
            <Text className="text-gray-400">Plataforma</Text>
            <Text className="text-white">Expo / React Native</Text>
          </View>
          <View className="flex-row justify-between py-2 border-t border-slate-700">
            <Text className="text-gray-400">Desarrollado por</Text>
            <Text className="text-white">MendoDevs</Text>
          </View>
           <View className="flex-row justify-between py-2 border-t border-slate-700">
            <Text className="text-gray-400">Soporte técnico</Text>
            <Text className="text-white">mendodevs.soft@gmail.com</Text>
          </View>
        </View>
      </View>

      {/* Botón Guardar */}
      <TouchableOpacity
        onPress={handleSaveSettings}
        disabled={saving}
        className="bg-brand-500 rounded-xl p-4 mt-2 shadow"
      >
        {saving ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-white text-center text-base font-semibold">
            Guardar cambios
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
