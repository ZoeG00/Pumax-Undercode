import { api } from './api.service';
import { Invoice, CreateInvoiceRequest } from '../types/billing.types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import API_CONFIG from '../constants/config';
import { Platform } from 'react-native';

export async function getInvoices(): Promise<Invoice[]> {
  const response = await api.get<{ success: boolean; data: Invoice[] }>('/facturas');
  return response.data;
}

export async function getInvoiceById(id: number): Promise<Invoice> {
  const response = await api.get<{ success: boolean; data: Invoice }>(`/facturas/${id}`);
  return response.data;
}

export async function getInvoicesByClient(clientId: number): Promise<Invoice[]> {
  const response = await api.get<{ success: boolean; data: Invoice[] }>(`/facturas/cliente/${clientId}`);
  return response.data;
}

export async function createLegalInvoice(invoice: CreateInvoiceRequest): Promise<Invoice> {
  const response = await api.post<{ success: boolean; data: Invoice }>('/facturas/legal', invoice);
  return response.data;
}

export async function createInformalInvoice(invoice: CreateInvoiceRequest): Promise<Invoice> {
  const response = await api.post<{ success: boolean; data: Invoice }>('/facturas/negro', invoice);
  return response.data;
}

export async function cancelInvoice(id: number): Promise<void> {
  await api.patch(`/facturas/${id}/anular`);
}

export async function downloadInvoicePDF(id: number, numeroFactura: string): Promise<void> {
  try {
    const pdfUrl = `${API_CONFIG.BASE_URL}/facturas/${id}/pdf`;

    // En web, usar descarga del navegador
    if (Platform.OS === 'web') {
      // Crear un link temporal y hacer click para descargar
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `factura-${numeroFactura}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // En dispositivos nativos (iOS/Android), usar FileSystem
    const fileName = `factura-${numeroFactura}.pdf`;
    const fileUri = FileSystem.documentDirectory + fileName;

    // Descargar el PDF
    const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error('Error al descargar el PDF');
    }

    // Verificar si el dispositivo puede compartir archivos
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      // Compartir el archivo (abre el menú de compartir nativo)
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Factura ${numeroFactura}`,
        UTI: 'com.adobe.pdf'
      });
    } else {
      console.log('PDF guardado en:', downloadResult.uri);
      // En este caso, el archivo queda guardado en la carpeta de documentos de la app
      alert(`PDF guardado en: ${downloadResult.uri}`);
    }
  } catch (error) {
    console.error('Error descargando PDF:', error);
    throw error;
  }
}
