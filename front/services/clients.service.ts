import { api } from './api.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types/clients.types';

export async function getClients(): Promise<Client[]> {
  const response = await api.get<{ success: boolean; data: Client[] }>('/clientes');
  return response.data;
}

export async function getClientById(id: number): Promise<Client> {
  const response = await api.get<{ success: boolean; data: Client }>(`/clientes/${id}`);
  return response.data;
}

export async function createClient(client: CreateClientRequest): Promise<Client> {
  const response = await api.post<{ success: boolean; data: Client }>('/clientes', client);
  return response.data;
}

export async function updateClient(id: number, client: UpdateClientRequest): Promise<Client> {
  const response = await api.put<{ success: boolean; data: Client }>(`/clientes/${id}`, client);
  return response.data;
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/clientes/${id}`);
}

export async function searchClients(query: string): Promise<Client[]> {
  const response = await api.get<{ success: boolean; data: Client[] }>(`/clientes/buscar?q=${encodeURIComponent(query)}`);
  return response.data;
}
