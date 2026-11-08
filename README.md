# 🚀 DevRoadmap & Tracker de Proyectos

Una aplicación web moderna, interactiva y ligera diseñada para planificar proyectos futuros, estimar tiempos, definir niveles de complejidad y llevar un registro riguroso de revisiones e hitos con cálculo automático de progreso.

---

## 🌟 Características Principales

1. **Dashboard con Métricas en Tiempo Real (KPIs)**:
   - Contador total de proyectos (activos vs completados).
   - Progreso global promedio ponderado.
   - Total de horas estimadas vs horas reales invertidas.
   - Conteo de revisiones e hitos pendientes y superados.

2. **Control de Complejidad & Tiempos**:
   - Clasificación por nivel de complejidad con código de colores:
     - 🟢 **Baja**: Tareas rápidas o MVPs (1 a 3 semanas).
     - 🔵 **Media**: Desarrollo estándar o funcionalidades moderadas (3 a 6 semanas).
     - 🟠 **Alta**: Sistemas multicapa, arquitecturas complejas o integraciones avanzadas.
     - 🔴 **Muy Alta**: Proyectos críticos, alta concurrencia o requerimientos extensos.
   - Registro de tiempo estimado en horas.
   - Frecuencia programada de revisiones (Diaria, Cada 2-3 días, Semanal, Quincenal, Mensual).

3. **Seguimiento de Revisiones e Hitos (Checkpoints)**:
   - Lista interactiva de hitos con checkboxes que actualizan el progreso automáticamente.
   - Registro de revisiones con historial: horas dedicadas por sesión, notas/feedback técnico y dictamen (Superada, Con Observaciones, Bloqueada).
   - Acceso rápido a incremento de progreso (+10%).

4. **Búsqueda, Filtros y Vistas**:
   - Búsqueda en tiempo real por título, categoría o descripción.
   - Filtrado por estado (Planificado, En Progreso, En Revisión, Completado, Pausado).
   - Filtrado por nivel de complejidad.
   - Ordenamiento inteligente (Última actualización, Progreso, Horas estimadas, Complejidad).
   - Alternador de diseño: Vista de tarjetas (Grid) o Vista compacta (Lista).

5. **Persistencia & Portabilidad**:
   - Almacenamiento local automático en el navegador (`localStorage`), sin proyectos predefinidos ni datos ficticios.
   - Botón para exportar tus proyectos en formato **JSON** en cualquier momento.

---

## 💻 ¿Cómo abrir y usar la aplicación?

No requiere instalar Node.js ni compilar ningún paquete.

1. **Abrir en el Navegador**:
   - Haz doble clic en el archivo `index.html` ubicado en:
     ```
     C:\Users\alexa\.gemini\antigravity\scratch\project-roadmap-tracker\index.html
     ```
   - O ábrelo directamente en tu navegador favorito (Chrome, Edge, Firefox, Brave).

2. **Abrir en Antigravity / VS Code**:
   - Te recomendamos establecer esta carpeta como tu espacio de trabajo activo:
     ```
     C:\Users\alexa\.gemini\antigravity\scratch\project-roadmap-tracker
     ```

---

## 📁 Estructura del Proyecto

```
project-roadmap-tracker/
├── index.html        # Estructura de la aplicación y modales
├── style.css         # Estilos personalizados, animaciones y scrollbars
├── app.js            # Lógica reactiva, métricas, persistencia y eventos
└── README.md         # Documentación de uso
```
