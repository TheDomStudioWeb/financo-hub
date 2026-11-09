# Manual interno · Ingreso con PIN animado (Hub FINANCO)
*09/11/2026 · The DOM Studio Web*

## Qué cambió
En **Mi estado de cuenta** (asociados) y en **Escalas y comisiones** (vendedores, jefes y gerencia) el PIN ya no se escribe en un campo común. Ahora hay **4 casillas**, una por número.

## Cómo se usa
1. Escribir el número de asociado (o el código del vendedor).
2. Tocar las casillas y escribir el PIN. Cada número aparece como un punto.
3. Al poner el último número **entra solo**, sin tocar "Ingresar" (el botón sigue estando, por si alguien prefiere tocarlo).

## Qué se ve
- **Mientras verifica:** las casillas forman un círculo y giran alrededor de un anillo punteado. Es la señal de "estoy revisando".
- **PIN correcto:** el anillo se pinta de verde, las casillas se cierran hacia el centro y aparece una tilde ✓. Después se abre la cuenta.
- **PIN incorrecto:** las casillas se ponen rojas, vuelven a la fila, se sacuden y aparece el mensaje "Número de asociado o PIN incorrectos". Se borran solas para volver a probar.
- El verde y el rojo se usan **solo** para el resultado; mientras tanto todo queda en los colores de FINANCO.

## PIN de más de 4 números
Los PIN que genera Gerencia son de 4 números. Si a alguien se le cargó uno de 5 o 6, debe tocar **"Mi PIN tiene más de 4 números"** antes de escribirlo: aparecen 6 casillas y entra al completarlas o al tocar "Ingresar".
Ojo: si una persona con PIN de 5 o 6 escribe sin tocar ese enlace, al cuarto número intenta entrar y cuenta como intento fallido.

## Seguridad (sin cambios)
- Después de 5 intentos fallidos el acceso se bloquea 15 minutos (lo controla la hoja de cálculo).
- El teclado del teléfono se abre en modo numérico y el PIN nunca se muestra en pantalla.
- Si el teléfono tiene "reducir movimiento", se muestra el resultado sin animación.

## Técnico
Componente `financo-pin.js` (sin librerías), compartido como `financo-sync.js`. Referencia de estilo: video "OTP Verification v3" guardado por Daniel.

**Para responder por voz:** "¿Por qué giran los números?" → Es el sistema verificando el PIN; cuando termina se pone verde si está bien o rojo si está mal.

## Ingreso "líquido" + PIN con órbita (09/11/2026)
- La pantalla arranca con un solo botón verde (**Ingresar a mi cuenta** en Mi estado de cuenta, **Ingresar** en Escalas y comisiones).
- Al tocarlo se divide como un líquido: arriba queda el campo **Número de asociado** (o **Tu código**) y abajo las **casillas del PIN**.
- Se escribe el número, se toca Enter y se escribe el PIN: al cuarto número las casillas giran en órbita como antes y, si está bien, se cierran en el anillo verde y se abre la cuenta.
- Componente `dom-login.js` (el mismo de las apps DOMino y del Hub X5) combinado con `financo-pin.js`.
