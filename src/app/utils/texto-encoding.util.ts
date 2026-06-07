/** Repara texto con acentos/ñ corruptos (UTF-8 leído como Latin-1). */
export function repararTexto(valor: string | null | undefined): string {
  if (valor == null || valor === '') {
    return valor ?? '';
  }

  if (!/[\u00C3\u00C2]/.test(valor)) {
    return valor;
  }

  try {
    const bytes = Uint8Array.from(valor, ch => ch.charCodeAt(0) & 0xff);
    const reparado = new TextDecoder('utf-8').decode(bytes);
    if (reparado && reparado !== valor) {
      return reparado;
    }
  } catch {
    // continuar con respaldo
  }

  try {
    return decodeURIComponent(escape(valor));
  } catch {
    return valor;
  }
}

export function repararTextoEnObjeto<T>(valor: T): T {
  if (valor == null) {
    return valor;
  }
  if (typeof valor === 'string') {
    return repararTexto(valor) as T;
  }
  if (Array.isArray(valor)) {
    return valor.map(item => repararTextoEnObjeto(item)) as T;
  }
  if (typeof valor === 'object') {
    const resultado: Record<string, unknown> = {};
    for (const [clave, dato] of Object.entries(valor as Record<string, unknown>)) {
      resultado[clave] = repararTextoEnObjeto(dato);
    }
    return resultado as T;
  }
  return valor;
}
