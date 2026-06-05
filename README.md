# Landing Page - Dulce Mercado

Esta es una landing page para Dulce Mercado, un proveedor mayorista de dulces artesanales en Chile.

## Estructura del Proyecto

- **`index.html`**: Archivo principal HTML con la estructura de la página, incluyendo footer con enlaces a políticas legales e iconos sociales.
- **`privacy.html`**: Página de Política de Privacidad.
- **`terms.html`**: Página de Términos y Condiciones.
- **`cookies.html`**: Página de Política de Cookies.
- **`css/styles.css`**: Hoja de estilos CSS con todos los estilos de la página.
- **`js/script.js`**: Archivo JavaScript con la lógica de la página, incluyendo el carrito de compras y funcionalidades interactivas.
- **`README.md`**: Este archivo de documentación.

## Categorías de Organización

### HTML (index.html)
- Estructura semántica de la página.
- Meta tags para SEO.
- Enlaces a recursos externos (fuentes, íconos).
- Secciones: Navbar, Hero, Value Proposition, Catálogo, Cómo Funciona, Testimonios, CTA, Footer.
- Modales y overlays para carrito, checkout y éxito.

### CSS (styles.css)
- Variables CSS para colores, tipografía y espaciado.
- Estilos para componentes: botones, tarjetas, navegación, etc.
- Animaciones y transiciones.
- Responsive design con media queries.
- Estilos para modales, carrito y elementos interactivos.

### JavaScript (script.js)
- Gestión del carrito de compras (localStorage).
- Renderizado dinámico de productos.
- Funcionalidades de modales (carrito, checkout, éxito).
- Validación de formularios.
- Animaciones de scroll reveal.
- Manejo de eventos (clicks, scroll, teclado).

## Recursos Externos
- Google Fonts: Cormorant Garamond y Outfit.
- Lucide Icons: Para íconos vectoriales, incluyendo redes sociales.
- Imágenes: URLs de Picsum para placeholders.

## Políticas Legales
- **Política de Privacidad**: Información sobre recopilación y uso de datos personales, conforme a la Ley 19.628 de Chile.
- **Términos y Condiciones**: Condiciones de venta, envíos, pagos y responsabilidades.
- **Política de Cookies**: Explicación del uso de cookies en el sitio web.

## Funcionalidades
- Carrito de compras con persistencia.
- Checkout simulado.
- Animaciones de entrada.
- Diseño responsive.
- Navegación suave.
- Páginas legales accesibles desde el footer.
- Iconos de redes sociales en el footer.

## Cómo Ejecutar
Abre `index.html` en un navegador web moderno.

## Integración con Mercado Pago
1. Copia `.env.example` a `.env`.
2. Coloca tu `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY` en `.env`.
3. En la carpeta del proyecto, instala dependencias:
   ```bash
   npm install
   ```
4. Ejecuta el backend de Mercado Pago y correo:
   ```bash
   npm start
   ```
5. Sirve el sitio por HTTP para que el checkout funcione correctamente.
6. El backend enviará un correo a `dulceconexion@zohomail.com` cada vez que se genere una preferencia de pago.
7. Si agregas un formulario de contacto, puedes usar el endpoint `/send_contact` para enviar consultas directamente a tu correo.
