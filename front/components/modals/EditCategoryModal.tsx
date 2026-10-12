import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Category, UpdateCategoryRequest } from '../../types/categories.types';
import { updateCategory } from '../../services/categories.service';

interface EditCategoryModalProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoryModal({
  visible,
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateCategoryRequest>({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        nombre: category.nombre,
        descripcion: category.descripcion || '',
      });
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;

    if (!formData.nombre?.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setLoading(true);

    try {
      await updateCategory(category.id, formData);
      Alert.alert('Éxito', 'Categoría actualizada correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-slate-900 rounded-lg w-11/12 p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Editar Categoría</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          <Text className="text-slate-300 mb-1">Nombre *</Text>
          <TextInput
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800"
            editable={!loading}
          />

          <Text className="text-slate-300 mb-1">Descripción</Text>
          <TextInput
            value={formData.descripcion || ''}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            className="border border-gray-600 rounded-lg px-3 py-2 mb-4 text-white bg-slate-800"
            multiline
            numberOfLines={3}
            editable={!loading}
          />

          <View className="flex-row justify-end">
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
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white">Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
