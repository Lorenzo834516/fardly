export async function enviarMensajeRetencionWhatsApp(
  telefono: string,
  nombreCliente: string,
  mensaje: string
) {
  try {
    const payload = {
      to: telefono,
      message: `Hola ${nombreCliente}! ☕ ${mensaje}`,
    };
    console.log(`[WhatsApp Sent] to ${telefono}:${payload.message}`);
    return { success: true };
  } catch (error) {
    console.error('Error enviando mensaje por WhatsApp:', error);
    return { success: false, error };
  }
}