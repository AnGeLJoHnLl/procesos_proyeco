# 🚀 DevRoadmap & Control de Procesos de Proyectos

Sistema interactivo para gestión visual de proyectos y actividades, diseñado con una vista en árbol de procesos, controles deslizantes de progreso en vivo, bitácora de notas y resumen gerencial.

---

## 📸 Interfaz y Funcionalidades

### 1. Barra de Control del Proyecto
- **`+ Agregar actividad`** (Botón cyan destacado): Registra una nueva tarea/proceso especificando nombre, rol/responsable, fecha límite y estado.
- **`Seguimiento`**: Historial de auditoría y notas de seguimiento del proyecto con fechas.
- **`Resumen gerencial`**: Panel ejecutivo con métricas de salud del proyecto, porcentaje general promediado, desglose de actividades (*En ejecución*, *Atrasadas*, *Completadas*) y tiempos.
- **`Editar proyecto`**: Modifica la complejidad (Baja, Media, Alta, Muy Alta), frecuencia de revisiones y horas estimadas.
- **`Eliminar proyecto`**: Borrado seguro del proyecto y sus actividades.

### 2. Tarjetas de Actividades y Procesos (Timeline Tree)
- Conexión visual en árbol vertical con líneas de guía y conector `↳`.
- **Información de la actividad**: Nombre destacado, rol del responsable, fecha de vencimiento y badge de estado (*Atrasado*, *En ejecución*, *Completado*, *Por iniciar*).
- **Control Deslizante en Vivo (Slider)**: Ajusta el porcentaje arrastrando directamente el control deslizante con actualización instantánea del progreso y recálculo automático del avance total del proyecto.
- **`Notas (X) ▾`**: Menú desplegable para revisar observaciones previas y agregar nuevas notas de revisión.
- **`Editar` & `Quitar`**: Gestión directa de cada actividad.

### 3. Selector Multi-Proyecto & Persistencia
- Cambia fácilmente entre diferentes proyectos desde la barra superior.
- Almacenamiento local automático en el navegador (`localStorage`).
- Botón de **Exportar** para respaldar tus proyectos en formato JSON.

---

## 💻 Uso Local y en GitHub Pages

- **En local**: Abre el archivo [`index.html`](file:///C:/Users/alexa/.gemini/antigravity/scratch/project-roadmap-tracker/index.html) en cualquier navegador web.
- **En GitHub**: [AnGeLJoHnLl/procesos_proyeco](https://github.com/AnGeLJoHnLl/procesos_proyeco)
- **Web en vivo (GitHub Pages)**: `https://angeljohnll.github.io/procesos_proyeco/`
