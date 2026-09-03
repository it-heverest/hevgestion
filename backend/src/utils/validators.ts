// src/utils/validators.ts
export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidTaxNumber(taxNumber: string): boolean {
    // Cameroon tax number format: P + 9 digits
    const taxRegex = /^P\d{9}$/;
    return taxRegex.test(taxNumber);
  }

  static isValidNIU(niu: string): boolean {
    // NIU format validation
    return /^[A-Z]{1}\d{12}$/.test(niu);
  }

  static isValidPhoneNumber(phone: string): boolean {
    // International phone format
    const phoneRegex = /^\+?[1-9]\d{8,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  static isValidCameroonPhoneNumber(phoneNumber: string): boolean {
    // Remove any spaces, dashes, or other non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    // Numérotation nationale camerounaise (ANTIC): tout numéro mobile
    // compte 9 chiffres et commence par 6, quel que soit l'opérateur.
    //
    // Une précédente version limitait la validation à une liste figée de
    // préfixes MTN/Orange (65-69) — devenue obsolète et rejetant à tort des
    // numéros valides d'autres opérateurs (Camtel, Nexttel, Yoomee...) ou de
    // blocs plus récemment attribués. Les préfixes par opérateur changent au
    // fil des attributions de l'ANTIC ; le seul invariant fiable est le
    // format structurel (9 chiffres, premier chiffre 6).
    return /^6\d{8}$/.test(cleanNumber);
  }

  static isValidAccountNumber(accountNumber: string): boolean {
    // OHADA account numbers: 6-8 digits
    return /^\d{6,8}$/.test(accountNumber);
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}