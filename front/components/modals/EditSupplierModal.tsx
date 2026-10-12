import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { Supplier, UpdateSupplierRequest } from '../../types/suppliers.types';
import { updateSupplier } from '../../services/suppliers.service';

interface EditSupplierModalProps {
  visible: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSupplierModal({ visible, supplier, onClose, onSuccess }: EditSupplierModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateSupplierRequest>({ nombre: '' });

  useEffect(() => {
    if (supplier) {
      setFormData({
        nombre: supplier.nombre,
        razon_social: supplier.razon_social || '',
        cuit: supplier.cuit || '',
        telefono: supplier.telefono || '',
        email: supplier.email || '',
        direccion: supplier.direccion || '',
      });
    }
  }, [supplier]);

  const handleSave = async () => {
    if (!supplier || !formData.nombre?.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await updateSupplier(supplier.id, formData);
      Alert.alert('Éxito', 'Proveedor actualizado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-slate-900 rounded-lg w-11/12 max-h-5/6 p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Editar Proveedor</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text className="text-slate-300 mb-1">Nombre *</Text>
            <TextInput value={formData.nombre} onChangeText={(t) => setFormData({ ...formData, nombre: t })} className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800" editable={!loading} />

            <Text className="text-slate-300 mb-1">CUIT</Text>
            <TextInput value={formData.cuit} onChangeText={(t) => setFormData({ ...formData, cuit: t })} className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800" editable={!loading} />

            <Text className="text-slate-300 mb-1">Teléfono</Text>
            <TextInput value={formData.telefono} onChangeText={(t) => setFormData({ ...formData, telefono: t })} className="border border-gray-600 rounded-lg px-3 py-2 mb-3 text-white bg-slate-800" editable={!loading} />

            <Text className="text-slate-300 mb-1">Email</Text>
            <TextInput value={formData.email} onChangeText={(t) => setFormData({ ...formData, email: t })} className="border border-gray-600 rounded-lg px-3 py-2 mb-4 text-white bg-slate-800" editable={!loading} />
          </ScrollView>

          <View className="flex-row justify-end mt-4">
            <TouchableOpacity onPress={onClose} className="bg-gray-600 px-4 py-2 rounded-lg mr-2" disabled={loading}>
              <Text className="text-white">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="bg-brand-500 px-4 py-2 rounded-lg" disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white">Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
