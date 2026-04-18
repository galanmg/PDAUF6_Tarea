# PROMPTS.md — Registro de prompts destacados

Documento que recoge los prompts más relevantes utilizados durante el desarrollo del proyecto **Parking Manager**, organizados por fase.

---

## Fase 0 — Definición del proyecto y CLAUDE.md

### Prompt 1: Presentación del proyecto y contexto

> Te he adjuntado un archivo que te servirá para conocer el proyecto que quiero hacer. Indícame si tienes alguna duda tras su análisis para poder comenzar a trabajar. Dicho archivo lo he generado en otro chat con Claude Code en el que le he dado los requisitos que nos solicitan para realizar este proyecto.
>
> Algunos datos que pueden ser relevantes para ponerte en contexto de lo que buscamos hacer:
> - La temática se centra en un gestor de parking de vehículos. Yo aparco mi coche en un párking gestionado por un señor mayor. El párking tiene 2 plantas (una baja y una primera planta) y ambas tienen 2 hileras con 11 plazas a cada lado, en total 44 plazas. Todas están numeradas, por lo que no hay que hacer alusión a la hilera que ocupa cada plaza. Estaría bien hacer un gestor sencillo que permita guardar perfiles de los conductores que aparcan allí, cuantos coches tienen (con datos como la matrícula, marca, modelo, color), las plazas que ocupan y si han pagado un mes determinado. Las plazas serán siempre las mismas, el párking no se va a reestructurar ni nada parecido, por lo que las 44 se pueden crear nada más arrancar la BBDD.

**Resultado**: Claude analizó el CLAUDE.md y formuló preguntas clave sobre alcance, roles, pagos, entorno y versión de Spring Boot antes de empezar.

---

### Prompt 2: Resolución de dudas y actualización del CLAUDE.md

> - Lo dejo a tu elección, lo que creas que es más eficiente. Yo lo que haría es gestionar el back y luego el front.
> - Me interesa gestionar el ADMIN, pues el objetivo es crear un gestor de párking para los propietarios de dichos parking. El USER podemos dejarlo creado para que solo pueda leer, pero realmente eso sería una V2.
> - Podemos poner un campo tarifa, me parece buena idea. Si tiene tarifa por defecto, que sean 40, y si el valor el false, entonces son 30 €.
> - Me gustaría que incluyeses lo necesario para crear la BBDD. La pondré a funcionar en XAMPP y phpMyAdmin.
> - Usaré la versión que sea más estable, por lo que puedes modificar ese requisito.
>
> Visto lo visto, puedes modificar el claude.md o generarlo de nuevo para cubrir todas estas dudas y tener un documento actualizado.

**Resultado**: Se regeneró el CLAUDE.md completo con Java 17, Spring Boot 3.4.x, campo tarifa, SQL de creación de BD, roles simplificados y orden de desarrollo definido.

---

## Fase 1 — Backend

### Prompt 3: Depuración del error de FK al eliminar conductor

> He intentado borrar un conductor y sale este aviso: `Cannot delete or update a parent row: a foreign key constraint fails (parking_manager.plazas...)`

**Resultado**: Se actualizó el método `eliminar` del `ConductorController` para liberar primero las plazas asignadas al conductor antes de eliminarlo.

---

## Fase 2 — Mejoras funcionales del frontend

### Prompt 4: CRUD en la página de vehículos

> La hoja de vehículos debería dejar que añadiesemos vehículos ahí directamente siendo obligatorio asociarlos a un conductor.

**Resultado**: Se refactorizó `CochesPage.jsx` añadiendo botón "+ Nuevo vehículo" con selector de conductor obligatorio, edición y eliminación directa desde la tabla.

### Prompt 5: HomePage dinámica con estadísticas y navegación

> El cuadro de Conductores debería tener un emoji de una persona e indicar cuántos conductores hay registrados. El cuadro de Plazas debería ser dinámico y mostrar X plazas ocupadas de Y.

> Falta que el cuadro de Pagos se cambie por un cuadro de Vehículos que liste el número de vehículos registrados. Y que además los cuadros sean en sí un enlace a la sección correspondiente.

**Resultado**: HomePage con tres tarjetas enlazables (Conductores, Vehículos, Plazas) que muestran estadísticas en tiempo real cuando el usuario está autenticado.

---

## Fase 3 — Cumplimiento de requisitos

### Prompt 6: Integración de shadcn/ui

> Antes de tocar nada en el proyecto, revisa si tal cual está se cumple el requisito de usar alguna de las bibliotecas de componentes de React listadas en él. No tiene por qué ser shadcn/ui.

**Resultado**: Se detectó que no se estaba usando ninguna biblioteca de componentes. Se instaló shadcn/ui y se refactorizaron las 8 páginas/componentes del frontend para usar Button, Input, Label, Table, Dialog, AlertDialog y Badge.

---

## Observaciones generales

- **Revisar contra requisitos**: la auditoría del CLAUDE.md detectó el incumplimiento de shadcn/ui, lo que permitió corregirlo antes de la entrega.
- **Iterar sobre el resultado**: las mejoras se pidieron una vez la base funcionaba, lo que permitió añadir funcionalidad (página de vehículos, estadísticas en home) sin romper lo existente.
