import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Product, UpdateProductRequest } from '../../types/products.types';
import { updateProduct } from '../../services/products.service';
import { useCategories } from '../../hooks/useCategories';

interface EditProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({
  visible,
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<UpdateProductRequest>({
    codigo: '',
    descripcion: '',
    categoria_id: null,
    precio_base: 0,
    precio_venta: 0,
    margen_ganancia: 20,
    stock: 0,
    stock_minimo: 10,
    activo: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo,
        descripcion: product.descripcion,
        categoria_id: product.categoria_id,
        precio_base: product.precio_base,
        precio_venta: product.precio_venta,
        margen_ganancia: product.margen_ganancia,
        stock: product.stock,
        stock_minimo: product.stock_minimo,
        activo: product.activo,
      });
    }
  }, [product]);

  const handleSave = async () => {
    if (!product) return;

    // Validaciones
    if (!formData.codigo?.trim() || !formData.descripcion?.trim()) {
      Alert.alert('Error', 'Código y descripción son obligatorios');
      return;
    }

    if (formData.precio_venta! <= 0) {
      Alert.alert('Error', 'El precio de venta debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      await updateProduct(product.id, formData);
      Alert.alert('Éxito', 'Producto actualizado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-slate-900 rounded-lg w-11/12 max-h-5/6 p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Editar Producto</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView>
            <Text className="text-slate-300 mb-1">Código *</Text>
            <TextInput
              value={formData.codigo}
              onChangeText={(text) => setFormData({ ...formData, codigo: text })}
              className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />

            <Text className="text-slate-300 mb-1">Descripción *</Text>
            <TextInput
              value={formData.descripcion}
              onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
              className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />

            <Text className="text-slate-300 mb-1">Precio Base</Text>
            <TextInput
              value={formData.precio_base?.toString()}
              onChangeText={(text) => setFormData({ ...formData, precio_base: parseFloat(text) || 0 })}
              keyboardType="numeric"
              className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />

            <Text className="text-slate-300 mb-1">Precio Venta *</Text>
            <TextInput
              value={formData.precio_venta?.toString()}
              onChangeText={(text) => setFormData({ ...formData, precio_venta: parseFloat(text) || 0 })}
              keyboardType="numeric"
              className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />

            <Text className="text-slate-300 mb-1">Stock</Text>
            <TextInput
              value={formData.stock?.toString()}
              onChangeText={(text) => setFormData({ ...formData, stock: parseInt(text) || 0 })}
              keyboardType="numeric"
              className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />

            <Text className="text-slate-300 mb-1">Stock Mínimo</Text>
            <TextInput
              value={formData.stock_minimo?.toString()}
              onChangeText={(text) => setFormData({ ...formData, stock_minimo: parseInt(text) || 0 })}
              keyboardType="numeric"
              className="border border-gray-600 rounded-lg px-3 py-2 mb-4 text-white bg-slate-800"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </ScrollView>

          {/* Actions */}
          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-600 px-4 py-2 rounded-lg mr-2"
              disabled={loading}
            >
              <Text className="text-white">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="bg-brand-500 px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white">Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
