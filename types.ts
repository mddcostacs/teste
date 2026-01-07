
export interface Boleto {
  id: string;
  name: string;
  value: number;
  dueDate: string;
  barcode: string;
  issuer: string;
  status: 'pending' | 'paid';
  pdfData?: string; // Base64 of the PDF for preview
  createdAt: number;
}

export interface ExtractionResult {
  value: number;
  dueDate: string;
  barcode: string;
  issuer: string;
}

export interface ReminderSettings {
  enabled: boolean;
  daysBefore: number;
  lastCheckedDate: string; // To avoid multiple notifications on the same day
}
