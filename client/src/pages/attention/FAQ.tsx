import DocumentLayout from "../../components/DocumentLayout";

export default function FAQ() {
  return (
    <DocumentLayout title="Preguntas frecuentes">
      <section className="space-y-4">
        <details className="group border-b border-(--border) pb-4">
          <summary className="cursor-pointer list-none font-medium text-(--text-primary)">
            ¿Cómo puedo realizar un pedido?
          </summary>
          <div className="mt-2 space-y-2">
            <p>
              Para realizar un pedido, sigue estos pasos:
            </p>
            <ol>
              <li>Selecciona el producto que deseas desde el catálogo.</li>
              <li>Revisa sus detalles, precio y disponibilidad.</li>
              <li>Haz clic en "Comprar" o añádelo al carrito y continúa al checkout.</li>
              <li>Completa los datos solicitados y selecciona tu método de pago.</li>
              <li>Confirma la compra para finalizar tu pedido.</li>
            </ol>
          </div>
        </details>
        <details className="group border-b border-(--border) pb-4">
          <summary className="cursor-pointer list-none font-medium text-(--text-primary)">
            ¿Qué métodos de pago aceptan?
          </summary>
          <div className="mt-2 space-y-2">
            <p>
              Actualmente aceptamos los siguientes métodos de pago:
            </p>
            <ul>
              <li><strong>Nequi:</strong> Pago inmediato desde tu cuenta Nequi.</li>
              <li><strong>PSE:</strong> Débito desde tu cuenta bancaria a través del botón de pagos PSE.</li>
            </ul>
            <p>
              En este sitio se muestra una versión demostrativa, por lo que algunos métodos pueden aparecer deshabilitados.
            </p>
          </div>
        </details>
        <details className="group border-b border-(--border) pb-4">
          <summary className="cursor-pointer list-none font-medium text-(--text-primary)">
            ¿Cuánto tarda en llegar mi pedido?
          </summary>
          <p className="mt-2">
            Los tiempos de entrega estimados son entre 3 y 5 días hábiles, dependiendo de la disponibilidad del producto y
            la zona de entrega. En periodos de alta demanda los plazos pueden extenderse ligeramente.
          </p>
        </details>
        <details className="group border-b border-(--border) pb-4">
          <summary className="cursor-pointer list-none font-medium text-(--text-primary)">
            ¿Puedo modificar o cancelar mi pedido?
          </summary>
          <p className="mt-2">
            Una vez confirmado y procesado el pedido, no es posible modificarlo o cancelarlo. Si tienes alguna duda o
            necesitas asistencia, por favor contáctanos a través de la página de contacto indicando tu número de pedido.
          </p>
        </details>
        <details className="group border-b border-(--border) pb-4">
          <summary className="cursor-pointer list-none font-medium text-(--text-primary)">
            ¿Cómo puedo seguir el estado de mi pedido?
          </summary>
          <p className="mt-2">
            Puedes consultar el estado de tu pedido desde la sección "Mis pedidos". Si realizaste la compra como invitado,
            también recibirás actualizaciones por los datos de contacto proporcionados al momento del checkout.
          </p>
        </details>
        <details className="group border-b border-(--border) pb-4">
          <summary className="cursor-pointer list-none font-medium text-(--text-primary)">
            ¿Qué hago si recibo un producto dañado o incorrecto?
          </summary>
          <p className="mt-2">
            Si recibes un producto dañado, con defectos o diferente al que solicitaste, repórtalo dentro de los 5 días
            hábiles desde la recepción. Envía una descripción del caso, fotos del producto y tu número de pedido a través
            de la página de contacto para que podamos ayudarte lo antes posible.
          </p>
        </details>
        <details className="group border-b border-(--border) pb-4">
          <summary className="cursor-pointer list-none font-medium text-(--text-primary)">
            ¿Los precios incluyen impuestos?
          </summary>
          <p className="mt-2">
            Los precios mostrados en el sitio ya incluyen los impuestos aplicables, salvo que se indique lo contrario en
            la ficha del producto.
          </p>
        </details>
      </section>
    </DocumentLayout>
  );
}
