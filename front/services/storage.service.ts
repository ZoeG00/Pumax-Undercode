import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Usuario } from '../types/auth.types';

const STORAGE_KEYS = {
  USER: 'user_session',
  TOKEN: 'session_token',
} as const;

/**
 * Servicio de almacenamiento seguro para datos de sesión
 * Usa SecureStore en plataformas nativas y AsyncStorage en web
 */
class StorageService {
  private isWeb = Platform.OS === 'web';

  /**
   * Guarda datos de forma segura
   */
  private async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error saving to storage, attempting fallback to AsyncStorage:', error);
      try {
        await AsyncStorage.setItem(key, value);
      } catch (fallbackError) {
        throw error;
      }
    }
  }

  /**
   * Obtiene datos del almacenamiento seguro
   */
  private async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        return await AsyncStorage.getItem(key);
      } else {
        const val = await SecureStore.getItemAsync(key);
        if (val) return val;
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error reading from storage, trying fallback to AsyncStorage:', error);
      try {
        return await AsyncStorage.getItem(key);
      } catch (fallbackError) {
        return null;
      }
    }
  }

  /**
   * Elimina datos del almacenamiento
   */
  private async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from storage:', error);
      try {
        await AsyncStorage.removeItem(key);
      } catch (e) {
        // Ignorar
      }
    }
  }

  /**
   * Guarda el usuario en el almacenamiento seguro
   */
  async saveUser(user: Usuario): Promise<void> {
    const userJson = JSON.stringify(user);
    await this.setItem(STORAGE_KEYS.USER, userJson);
  }

  /**
   * Obtiene el usuario del almacenamiento
   */
  async getUser(): Promise<Usuario | null> {
    const userJson = await this.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as Usuario;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Guarda el token de sesión
   */
  async saveToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * Obtiene el token de sesión
   */
  async getToken(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Elimina el token de sesión
   */
  async removeToken(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Elimina el usuario del almacenamiento (logout)
   */
  async removeUser(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER);
    await this.removeToken();
  }

  /**
   * Limpia todo el almacenamiento
   */
  async clearAll(): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.clear();
      } else {
        // En nativo, eliminamos las claves una por una
        await this.removeUser();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
