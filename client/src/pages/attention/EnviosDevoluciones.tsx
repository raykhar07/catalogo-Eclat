import DocumentLayout from "../../components/DocumentLayout";

export default function EnviosDevoluciones() {
  return (
    <DocumentLayout title="Envíos y devoluciones">
      <section>
        <h2>Envíos</h2>
        <p>
          Todos los pedidos se procesan una vez confirmado el pago. Nos esforzamos por despachar los pedidos lo antes
          posible para que lleguen dentro del plazo estimado.
        </p>
        <ul>
          <li><strong>Plazo de entrega:</strong> Entre 3 y 5 días hábiles.</li>
          <li><strong>Procesamiento:</strong> 24 a 48 horas hábiles tras la confirmación del pago.</li>
          <li><strong>Zonas de cobertura:</strong> Cobertura nacional según disponibilidad del transportista.</li>
          <li><strong>Seguimiento:</strong> Cuando tu pedido sea despachado, recibirás la información de seguimiento a través de los datos proporcionados en el checkout.</li>
        </ul>
        <p>
          Los plazos de entrega son estimados y pueden verse afectados por causas ajenas a nuestra voluntad, como condiciones
          climáticas, congestión logística o días festivos.
        </p>
      </section>

      <section>
        <h2>Devoluciones</h2>
        <p>
          Si por alguna razón necesitas devolver tu producto, aceptamos devoluciones en los siguientes casos:
        </p>
        <ul>
          <li>Producto dañado o con defectos de fabricación.</li>
          <li>Producto incorrecto recibido respecto al pedido realizado.</li>
          <li>Producto en mal estado por daños durante el transporte.</li>
        </ul>
        <p><strong>Condiciones para la devolución:</strong></p>
        <ul>
          <li>Solicitud dentro de los 5 días hábiles desde la recepción del pedido.</li>
          <li>Producto sin uso, en perfecto estado y con todas sus etiquetas, accesorios y empaque original.</li>
          <li>Incluir número de pedido y evidencia fotográfica en caso de daño o error.</li>
        </ul>
      </section>

      <section>
        <h2>Proceso de devolución</h2>
        <ol>
          <li><strong>Solicitud:</strong> Envía tu solicitud a través de la página de contacto con los detalles de tu pedido.</li>
          <li><strong>Autorización:</strong> Te enviaremos las instrucciones para realizar la devolución si esta es aprobada.</li>
          <li><strong>Recepción y revisión:</strong> Una vez recibido el producto, lo revisaremos para verificar su estado.</li>
          <li><strong>Resolución:</strong> Te notificaremos la aprobación o rechazo de la devolución.</li>
        </ol>
      </section>

      <section>
        <h2>Reembolsos</h2>
        <p>
          En caso de devolución aprobada, el reembolso se realizará por el mismo método de pago utilizado en la compra. El tiempo
          para ver reflejado el reembolso dependerá de la entidad bancaria, y suele oscilar entre 5 y 10 días hábiles.
        </p>
        <p>
          Los gastos de envío originales no son reembolsables, salvo en el caso de productos dañados, con defectos o enviados
          por error.
        </p>
      </section>
    </DocumentLayout>
  );
}
