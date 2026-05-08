/**
 * PIX Payment Generator
 * Generates PIX QR Codes and BR Codes for payments
 */

import QRCode from "qrcode";

interface PixGeneratorOptions {
  pixKey: string; // PIX key (CPF, email, phone, or random key)
  ownerName: string; // Merchant name
  amount: number; // Amount in cents
  description?: string; // Payment description
  transactionId?: string; // Unique transaction ID
}

interface PixGeneratorResult {
  brCode: string; // BR Code (string format)
  qrCode: string; // QR Code (data URL for display)
  pixKey: string;
  amount: number;
  ownerName: string;
}

/**
 * Generate a PIX BR Code (Banco Central format)
 * This is the string that gets encoded into the QR Code
 */
export function generateBrCode(options: PixGeneratorOptions): string {
  const { pixKey, ownerName, amount, description = "Compra VANTA", transactionId } = options;

  // PIX BR Code structure (simplified version)
  // Format: 00020126580014br.gov.bcb.pix...
  // This is a simplified implementation - for production, use a proper library

  // Merchant Account Information (26)
  const merchantAccountInfo = `26${formatField("0014br.gov.bcb.pix", 4)}${formatField(pixKey, 2)}`;

  // Merchant Category Code (52)
  const merchantCategoryCode = "52040810";

  // Transaction Amount (54)
  const amountInReais = (amount / 100).toFixed(2);
  const transactionAmount = `54${formatField(amountInReais, 2)}`;

  // Country Code (58)
  const countryCode = "5802BR";

  // Merchant Name (59)
  const merchantName = `59${formatField(ownerName.substring(0, 25), 2)}`;

  // Merchant City (60)
  const merchantCity = `60${formatField("SAO PAULO", 2)}`;

  // Additional Data (62)
  const txId = transactionId || generateTransactionId();
  const additionalData = `62${formatField(`05${formatField(txId, 2)}`, 2)}`;

  // Build the BR Code
  let brCode =
    "00020126580014br.gov.bcb.pix" +
    `0136${formatField(pixKey, 2)}` +
    merchantCategoryCode +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData;

  // Add CRC16 checksum
  const crc = calculateCRC16(brCode + "6304");
  brCode += `6304${crc}`;

  return brCode;
}

/**
 * Generate QR Code image from BR Code
 */
export async function generateQrCode(brCode: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(brCode, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR Code: ${error}`);
  }
}

/**
 * Generate complete PIX payment data
 */
export async function generatePixPayment(options: PixGeneratorOptions): Promise<PixGeneratorResult> {
  const brCode = generateBrCode(options);
  const qrCode = await generateQrCode(brCode);

  return {
    brCode,
    qrCode,
    pixKey: options.pixKey,
    amount: options.amount,
    ownerName: options.ownerName,
  };
}

/**
 * Format field for PIX (adds length prefix)
 */
function formatField(value: string, lengthSize: number): string {
  const length = value.length.toString().padStart(lengthSize, "0");
  return length + value;
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId(): string {
  return Math.random().toString(36).substring(2, 15).toUpperCase().padEnd(14, "0").substring(0, 14);
}

/**
 * Calculate CRC16 checksum for PIX
 * Using CCITT-FALSE polynomial
 */
function calculateCRC16(data: string): string {
  let crc = 0xffff;
  const poly = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ poly : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Validate PIX key format
 */
export function validatePixKey(pixKey: string): boolean {
  // CPF format: 11 digits
  if (/^\d{11}$/.test(pixKey)) {
    return true;
  }

  // Email format
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) {
    return true;
  }

  // Phone format: +55 + 11 digits
  if (/^\+55\d{11}$/.test(pixKey)) {
    return true;
  }

  // Random key format: 32 characters (UUID-like)
  if (/^[a-f0-9-]{32,36}$/.test(pixKey)) {
    return true;
  }

  return false;
}

/**
 * Format amount for display
 */
export function formatCurrency(amountInCents: number): string {
  return (amountInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
