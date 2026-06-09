/**
 * Validadores e máscaras brasileiras (CPF/CNPJ e celular).
 * Isomórfico — sem dependência de DOM, usado no client (formulário) e no
 * server (validação da entrada antes de enviar à AbacatePay).
 */

/** Mantém apenas os dígitos de uma string. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Valida um CPF (11 dígitos) pelos dígitos verificadores. */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  // Rejeita sequências repetidas (000..., 111..., etc.).
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (slice: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += Number(slice[i]) * (factorStart - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcDigit(cpf.slice(0, 9), 10);
  const d2 = calcDigit(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

/** Valida um CNPJ (14 dígitos) pelos dígitos verificadores. */
export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (slice: string) => {
    const weights =
      slice.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += Number(slice[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcDigit(cnpj.slice(0, 12));
  const d2 = calcDigit(cnpj.slice(0, 13));
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

/** Aceita CPF (11) ou CNPJ (14). É o que a AbacatePay chama de taxId. */
export function isValidTaxId(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
}

/**
 * Valida celular brasileiro: DDD (2) + número (8 ou 9 dígitos) = 10 ou 11.
 * Para celular com 9º dígito, o terceiro dígito deve ser 9.
 */
export function isValidCellphone(value: string): boolean {
  const phone = onlyDigits(value);
  if (phone.length === 11) return phone[2] === "9";
  return phone.length === 10;
}

/** Formata CPF/CNPJ progressivamente para exibição (000.000.000-00). */
export function maskTaxId(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/** Formata celular para exibição: (00) 00000-0000 / (00) 0000-0000. */
export function maskCellphone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
