---
name: Agregar tarea
description: Agrega una tarea nueva al backlog de mejoras de TaroTools (BACKLOG-MEJORAS.md en la raíz del repo), para que una futura pasada de la skill mejorar-proyecto la tome y la resuelva. Usar cuando el usuario pida "agregá una tarea", "sumá esto al bucle de mejoras", "anotá esto para después", "quiero que en algún momento hagas X", "guardalo para el loop", o cualquier pedido de dejar registrada una idea/mejora para más adelante en vez de implementarla ahora mismo en la conversación actual.
---

# Agregar tarea (backlog de mejoras — TaroTools)

Esta skill **no implementa nada**. Solo registra la tarea en `BACKLOG-MEJORAS.md` para que una
pasada futura de `mejorar-proyecto` la tome. Si lo que pide el usuario es algo que se resuelve en
un par de minutos sin pisar nada más de la conversación en curso, preguntale si lo querés ya mismo
o prefiere que quede para el loop — no asumas por él.

## Qué hacer

1. Leé `BACKLOG-MEJORAS.md` en la raíz del repo. Si no existe, creálo con esta plantilla exacta:

   ```markdown
   # Backlog de mejoras — TaroTools

   Tareas pendientes para el bucle de mejoras continuo del sitio. Cada pasada de la skill
   `mejorar-proyecto` revisa primero esta lista: si hay algo sin marcar en **Pendientes**, lo toma
   como la tarea de esa pasada — tiene prioridad sobre el análisis automático de bugs, seguridad y
   pulido visual que hace el loop por su cuenta. Si está vacía, el loop vuelve a su criterio normal.

   Para agregar una tarea nueva, usá la skill `agregar-tarea` (o pedile directamente a Claude
   "agregá X al bucle de mejoras" / "anotá esto para después"). Cada entrada tiene que ser
   autocontenida: una sesión futura, sin el contexto de la conversación donde se pidió, tiene que
   poder leerla y ejecutarla sin tener que volver a preguntar nada.

   ## Pendientes

   _(vacío por ahora — lo que se vaya agregando aparece acá, como checkbox sin marcar)_

   ## Hechas

   _(se van moviendo acá a medida que el loop las completa, marcadas `[x]` con fecha y commit)_
   ```

2. Si el pedido del usuario es vago ("hacé que la página sea más útil", "mejorala en general"), no
   inventes una tarea genérica de relleno — o le pedís que lo baje a algo concreto, o le proponés
   2-3 interpretaciones específicas y dejás que elija. Una entrada vaga en el backlog es peor que
   no tener entrada: una pasada futura no va a saber qué hacer con ella.

3. Escribí la entrada como un ítem **autocontenido**. Incluye:
   - Título corto, una línea, que deje claro qué hay que hacer.
   - Contexto/por qué — qué problema resuelve o qué valor agrega, en las palabras del usuario
     cuando sea posible, no una paráfrasis vacía tipo "mejorar la experiencia".
   - Cualquier detalle concreto que el usuario haya dado: herramientas específicas mencionadas,
     ejemplos, restricciones, lo que NO quiere.

   Formato de la línea, agregada al final de `## Pendientes`:

   ```markdown
   - [ ] **<título corto>** — <contexto/por qué, 1-3 oraciones>. _(agregado AAAA-MM-DD)_
   ```

4. Si el usuario pide explícitamente que algo vaya primero ("esto es urgente", "priorizalo",
   "antes que las demás"), insertala al principio de la lista de `## Pendientes` en vez de al
   final.

5. Si el usuario pide varias tareas en el mismo pedido, agregalas como ítems separados — no las
   comprimas en una sola entrada mezclada, porque el loop resuelve una cosa por pasada.

6. Commiteá y pusheá el cambio. Es un archivo de texto plano: no hace falta el ciclo de
   prueba/verificación con Playwright que usa `mejorar-proyecto` para cambios de código. Igual
   seguí las reglas normales de git de la sesión (nunca pushear a una rama sin permiso previo si
   la sesión lo exige, mensaje de commit corto en español explicando qué se agregó).

7. Confirmále al usuario, en una o dos líneas, qué quedó anotado — no hace falta repetir el
   contenido completo de la entrada ni el diff.

## Relación con `mejorar-proyecto`

Son complementarias: esta skill guarda, `mejorar-proyecto` ejecuta. El loop de mejoras revisa
`BACKLOG-MEJORAS.md` antes que su propio análisis automático de bugs/seguridad/visual — así que
cualquier cosa que el usuario pida acá va a ser lo primero que se resuelva en la próxima pasada,
antes que lo que el loop hubiera encontrado por su cuenta.
