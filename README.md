# TP5: Flujo de Contratación Digital de Seguros (Cubrí)

¡Buenas! Este es mi proyecto para el **Trabajo Práctico N° 5 de Diseño UX/UI (2026)** de la carrera Licenciatura en Sistemas de Información (FCyT - UADER).

El objetivo del trabajo era armar el front-end completo de un checkout para contratar seguros de celulares, pasando por todas las pantallas: catálogo, cotización, selección de plan, datos del titular y simulación de pago.

---

## 💻 ¿Cómo correr el proyecto?


Para probarlo sin problemas, puede ingresar a la siguiente URL: 



## 🛠️ Tecnologías que usé

Siguiendo las reglas de la cátedra, no usé ningún framework (nada de React, Vue ni librerías raras de validación):
- **HTML5:** Estructurado en una sola página (`index.html`) usando etiquetas `<section>` para cada paso, que se van mostrando y ocultando según corresponda.
- **Tailwind CSS v4:** Cargado por CDN para los estilos, márgenes, colores y el responsive.
- **Basecoat UI:** Para mantener la estética y variables de diseño estilo shadcn (están en `css/tokens.css`).
- **JavaScript Vanilla:** Todo el comportamiento hecho a mano, dividido en módulos limpios dentro de la carpeta `js/`.

---

## 🧠 Decisiones que tomé y cómo lo encaré

1. **SPA en una sola página (`index.html`):**
   Como pedía la sección 3.1 del PDF, metí todas las pantallas en un solo HTML con etiquetas `<section data-paso="...">`. Con una función `render()` en JavaScript le pongo o saco el atributo `hidden` a cada sección según el paso en el que esté el usuario.
2. **Un único estado (`js/estado.js`):**
   Creé un objeto global `solicitud` que guarda todo (qué equipo cotizó, qué plan eligió, sus datos y el pago). Cada vez que cambia algo, lo guardo en `localStorage` para que si tocás F5 o apretás el botón de "Volver" (`←`), no se borre nada y los inputs sigan llenos.
3. **Validaciones en tiempo real y en blur:**
   En vez de validar recién cuando mandás el formulario, los botones de "Ver planes", "Continuar" y "Pagar" arrancan deshabilitados. A medida que vas escribiendo o cambiando de campo se va chequeando todo:
   - Si salís de un campo y está mal, se pone el borde rojo y aparece el mensaje explicativo.
   - Cuando todos los campos requeridos de la pantalla están bien, el botón se habilita al instante.
4. **Cálculo de cuotas centralizado (`js/cotizador.js`):**
   Para no calcular el precio en dos lugares distintos (y que no dé diferencias entre la card y el resumen), dejé una sola función `calcularCuota()` usando la fórmula exacta de la consigna:  
   `Math.round(valor * tasaAnual / 12 * factorAntiguedad)`
5. **Simulación de pago (`js/pago.js`):**
   Le puse un `setTimeout` de 1,5 segundos y cambio el texto del botón a "Procesando…" para que parezca una pasarela de pago real y el usuario no haga doble clic.
   - Si ponés la tarjeta de prueba que falla (`4000 0000 0000 0002`), te manda a la pantalla de error. Si tocás "Reintentar pago", volvés al paso 4 con todos tus datos intactos.
   - Con cualquier otra tarjeta válida (ej: `4111 1111 1111 1111`), aprueba y te genera la póliza con el formato `POL-2026-XXXXXX`.

---

## 🧪 Casos de prueba de la cátedra (probados y funcionando)

Probé los 3 casos que figuran en la sección 5.1 del PDF y dan exactamente lo pedido:
- **Valor $ 600.000 · Menos de 1 año (factor 1.00):**
  - Básico (4%): **$ 2.000**
  - Plus (6%): **$ 3.000**
  - Premium (9%): **$ 4.500**
- **Valor $ 600.000 · 1 a 2 años (factor 1.10):**
  - Básico: **$ 2.200**
  - Plus: **$ 3.300**
  - Premium: **$ 4.950**
- **Valor $ 1.200.000 · Más de 2 años (factor 1.25):**
  - Básico: **$ 5.000**
  - Plus: **$ 7.500**
  - Premium: **$ 11.250**

---

##  Cosas que alcancé a meter

- **Persistencia con `localStorage`:** Si recargás la página o vas para atrás con el botón de volver, tus datos no se pierden. Y cuando terminás en la pantalla de éxito y tocás "Volver al inicio", se limpia todo para arrancar de cero.
- **Máscaras en los inputs:**
  - En la tarjeta te separa automáticamente los números de a 4 (`4111 1111 1111 1111`).
  - En el vencimiento te pone la barra sola (`MM/AA`).
- **Responsive pensado para 390px:** Ajusté el stepper y las tarjetas para que en pantallas de celular angostas (como el iPhone de 390px que pedía el diseño) no se corte nada horizontalmente y se lea cómodo.
- **Notificacion al solicitar descargar comprobante** al seleccionar la opcion de descargar comprobante sale una notificacion la cual dice que descarga el comprobante

##  Aclaracion commits
Si bien en el pdf aclara que cada hito tiene que tener un commit, sinceramente estuve teniendo problemas con la sincronización de mi repositorio local al principio y terminé trabajando sobre un entorno de pruebas preliminar, lo que hizo que volcara gran parte del código funcional de golpe en el repositorio. Para el trabajo final trabajare como debe ser haciendo commits como corresponde.