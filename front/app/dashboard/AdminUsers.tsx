import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Trash2, Edit } from "lucide-react-native";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../services/users.service";

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");

  // Cargar usuarios desde backend
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsuarios(data);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Error al cargar usuarios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Agregar usuario
  const handleAgregar = async () => {
    if (!nuevoUsuario.trim()) return alert("Ingrese un nombre");

    try {
      const nuevoUserData = {
        username: nuevoUsuario.trim().toLowerCase().replace(/\s/g, ""),
        password: "123456", // Password por defecto para demo
        nombre: nuevoUsuario.trim(),
        rol: "EMPLEADO",
      };

      await createUser(nuevoUserData);
      setNuevoUsuario("");
      await fetchUsuarios(); // Recargar lista
      alert("Usuario creado exitosamente");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error al crear usuario: " + error.message);
    }
  };

  // Borrar usuario
  const handleBorrar = async (id) => {
    try {
      await deleteUser(id);
      await fetchUsuarios(); // Recargar lista
      alert("Usuario eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar usuario: " + error.message);
    }
  };

  // Editar usuario
  const handleEditar = (id, nombre) => {
    setEditandoId(id);
    setNombreEditado(nombre);
  };

  const handleGuardarEdicion = async () => {
    try {
      await updateUser(editandoId, { nombre: nombreEditado });
      setEditandoId(null);
      setNombreEditado("");
      await fetchUsuarios(); // Recargar lista
      alert("Usuario actualizado exitosamente");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error al actualizar usuario: " + error.message);
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#45bd66" />
        <Text className="text-white mt-4">Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-900 p-6">
      <Text className="text-xl font-bold mb-6 text-white">
        Panel de Administrador
      </Text>

      {/* Campo para agregar usuario */}
      <View className="flex-row items-center mb-6">
        <TextInput
          className="flex-1 bg-slate-700 rounded-xl p-3 text-white"
          placeholder="Nombre del nuevo usuario"
          placeholderTextColor="#9ca3af"
          value={nuevoUsuario}
          onChangeText={setNuevoUsuario}
        />
        <TouchableOpacity
          onPress={handleAgregar}
          className="ml-2 bg-brand-500 p-3 rounded-xl"
        >
          <Text className="text-white font-semibold">＋</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de usuarios */}
      {loading ? (
        <ActivityIndicator size="large" color="#45bd66" />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center bg-slate-800 rounded-xl p-4 mb-3">
              {editandoId === item.id ? (
                <>
                  <TextInput
                    value={nombreEditado}
                    onChangeText={setNombreEditado}
                    className="flex-1 bg-slate-600 rounded-lg p-2 text-white"
                  />
                  <TouchableOpacity
                    onPress={handleGuardarEdicion}
                    className="ml-2 bg-green-600 p-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold">💾</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View className="flex-1">
                    <Text className="text-white text-lg">{item.nombre}</Text>
                    <Text className="text-gray-400 text-sm">{item.rol}</Text>
                    <Text className="text-gray-500 text-xs">@{item.username}</Text>
                  </View>
                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={() => handleEditar(item.id, item.nombre)}
                      className="p-1 bg-brand-500 rounded mr-2"
                    >
                      <Edit color="#fff" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleBorrar(item.id)}
                      className="p-1 bg-red-600 rounded"
                    >
                      <Trash2 color="#fff" size={16} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}
