# Principios — TaroTools

Esto es la base de pensamiento del proyecto: lo que no se negocia al sumar o cambiar algo.
Nace del análisis FODA de 2026-10-09 (ver `/mnt/project-files/foda/FODA-TaroTools-2026-10-09.md`
en el proyecto). Toda pasada de `mejorar-proyecto`, toda tarea del backlog y toda decisión de
producto se evalúa contra esto antes que contra gusto personal del momento.

Objetivo de fondo (ya definido antes de este documento, no cambia): que TaroTools sea la página
de herramientas online más útil que exista — no la que tiene más herramientas, la que de verdad
resuelve lo que alguien necesita, sin fricción, sin humo.

## Los 6 principios

1. **La privacidad es el producto, no un detalle técnico.**
   Default: toda herramienta nueva procesa el archivo 100% en el navegador del usuario, nunca lo
   sube a un servidor. Es la ventaja que ningún competidor freemium (iLovePDF, Smallpdf,
   CloudConvert, tinywow) puede copiar sin rehacer su arquitectura — así que se declara, no se
   esconde: si una herramienta cumple esto, se lo dice explícitamente en la UI.
   Excepción: cuando algo requiere backend (IA, descarga de video), se construye igual si aporta
   valor real, pero nunca se vende como "el diferencial" — ver principio 4.

2. **Cero fricción, siempre.**
   Sin cuentas, sin paywall, sin límites artificiales de uso en las herramientas core. Si en algún
   momento se evalúa monetizar, la funcionalidad base no se toca — se monetiza alrededor
   (donaciones, cosmético), nunca adentro.

3. **Calidad pareja por sobre cantidad.**
   Una herramienta nueva no se suma "a medias": se prueba de forma rigurosa (casos reales, no solo
   "no tira error en consola") antes de marcarse como hecha en el backlog. Ante la duda entre sumar
   una herramienta nueva o pulir/arreglar una existente, gana pulir.

4. **No construir el diferencial sobre lo que no controlamos.**
   Las herramientas de IA (proxy a modelo gratuito) y la descarga de video (proxy a Cobalt) son
   gancho de producto, no la base: dependen de servicios de terceros gratuitos que pueden fallar o
   cortarse sin aviso. La retención y la reputación del sitio se construyen sobre las herramientas
   100% cliente, que son la ventaja estructural real.

5. **Si no se puede encontrar, no existe.**
   Tener la mejor herramienta no sirve si nadie la encuentra buscando en Google. Descubribilidad
   (SEO, mensaje de privacidad explícito en portada, URLs propias por herramienta) es prioridad de
   producto, al mismo nivel que sumar funciones nuevas — no un "nice to have" para después.

6. **La deuda técnica se paga cuando empieza a frenar, no antes ni después.**
   `app.js` monolítico y los handlers inline (`onclick=...`) ya bloquearon la extensión offline.
   No se migra todo de golpe "porque sí", pero tampoco se ignora: cuando una tarea nueva choca con
   esa deuda (como pasó con la extensión), se resuelve esa porción en el camino en vez de evitarla.

## Objetivo SMART actual

**Para el 31 de diciembre de 2026, llevar el contador de visitas del sitio de 121 (medido el
2026-10-12) a 250 visitas acumuladas, mediante dos acciones concretas alineadas con el principio 5:**

1. Agregar un sello visible ("🔒 esto se procesa en tu navegador, nunca se sube") en cada
   herramienta que procese 100% en cliente, y mencionar el mismo mensaje en la portada y en la
   meta description del sitio.
2. Dar URL propia e indexable (con su propio `<title>`/meta description orientado a búsqueda real)
   a las 10 herramientas con más potencial de búsqueda: `pdf-compress`, `img-compress`,
   `pdf-merge`, `pdf-to-jpg`, `img-convert`, `img-heic`, `qr-gen`, `pdf-split`, `img-resize`,
   `pdf-unlock`.

- **Specific**: las dos acciones de arriba, tomadas directamente de las oportunidades #1 y #2 del
  FODA.
- **Measurable**: el contador de visitas ya implementado (`netlify/functions/visits.js`), que pasa
  de 121 a 250 (más del doble) en el período.
- **Achievable**: no requiere infraestructura nueva — es front-end sobre lo que ya existe
  (catálogo de herramientas, sistema de routing del SPA, metadatos del `<head>`).
- **Relevant**: ataca la mayor debilidad de discovery del sitio (sin SEO, sin mensaje de privacidad
  explícito) usando la mayor fortaleza real (privacidad genuina) — exactamente el cruce que pide el
  FODA ("cómo aprovecharlo a favor").
- **Time-bound**: antes del 2026-12-31 (~80 días desde este documento).

Cuando este objetivo se cumpla o venza el plazo, se revisa el número real contra la meta y se
define el próximo objetivo SMART acá mismo, reemplazando esta sección — no se acumulan objetivos
viejos sin cerrar.
