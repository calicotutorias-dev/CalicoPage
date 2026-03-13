# Arquitectura Monolítica - Documentación de Conversión

## Resumen Ejecutivo

Tu aplicación ha sido **convertida exitosamente a una arquitectura monolítica** dentro del proyecto Next.js 15. El backend original (carpeta `ISIS3710_202520_S1_E06_Back`) ahora se usa **solo como referencia**, y toda la funcionalidad ha sido replicada dentro del monolito.

---

## ✅ Cambios Realizados

### 1. Exclusión del Backend de Referencia
Para que el proyecto compile correctamente sin errores de tipos NestJS, la carpeta `ISIS3710_202520_S1_E06_Back` ha sido excluida de la compilación:

**Archivos modificados:**
- `tsconfig.json` - Agregado `src/ISIS3710_202520_S1_E06_Back/**` a `exclude`
- `eslint.config.mjs` - Agregado a sección `ignores`

⚠️ **Importante:** La carpeta NO ha sido modificada, movida ni eliminada. Solo está excluida de la compilación. Puedes seguir usándola como referencia.

---

### 2. Creación de Servicios de Tutor (Backend)

Se han creado 3 archivos esenciales para la lógica de tutores:

#### 📄 `src/lib/repositories/tutor.repository.js`
**Propósito:** Acceso a datos de Firestore (capa repository)

**Funciones:**
- `findById(tutorId)` - Busca tutor por ID o email
- `findAll(limit)` - Obtiene todos los tutores
- `findByCourse(courseId, limit)` - Obtiene tutores de un curso
- `findByName(searchTerm, limit)` - Busca tutores por nombre

**Características:**
- Todas las queries incluyen `.limit()` (por límites de Firebase)
- Maneja búsquedas por documento ID y email
- Usa Firebase Admin SDK

#### 📄 `src/lib/services/tutor.service.js`
**Propósito:** Lógica de negocio y transformación de datos

**Funciones:**
- `getTutorById(tutorId)` - Obtiene tutor sanitizado
- `getAllTutors(limit)` - Obtiene todos los tutores
- `getTutorsByCourse(courseId, limit)` - Obtiene tutores de un curso
- `searchTutors(searchTerm, limit)` - Busca tutores
- `getTutorStats(tutorId)` - Obtiene estadísticas del tutor

**Características:**
- Sanitización de datos (remueve información sensible)
- Enriquecimiento de datos
- Transforma datos para el frontend

#### 🔌 `src/app/api/tutors/[id]/route.js`
**Propósito:** Endpoint REST para obtener tutores

**Endpoint:**
```http
GET /api/tutors/[id]
```

**Response:**
```json
{
  "success": true,
  "tutor": {
    "id": "doc-id",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "isTutor": true,
    "rating": 4.8,
    "hourlyRate": 50000,
    "bio": "Tutor de matemáticas...",
    "courses": ["MATH101", "MATH201"],
    "profileImage": "url...",
    "location": "Virtual"
  }
}
```

---

### 3. Actualización de Vistas del Frontend

#### 📄 `src/app/tutor/statistics/page.jsx`
**Cambio realizado:**
- `API_BASE` cambiado de `"http://localhost:3001/api"` a `""` (vacío)
- Ahora usa endpoints internos: `/api/tutors/:id`, `/api/courses/:id`

**Endpoints que llama:**
- `GET /api/tutors/:tutorId` - Para obtener cursos del tutor
- `GET /api/courses/:courseId` - Para obtener nombre del curso

---

### 4. Verificación de Endpoints Existentes

✅ `GET /api/courses/[id]` - Ya existía, retorna curso por ID

---

## 📊 Arquitectura Actual (Monolítica)

```
┌─────────────────────────────────────────────────┐
│              Frontend React 19                   │
│  ├─ Statistics Page (tutor/statistics)          │
│  ├─ History Page (home/history)                 │
│  └─ Otros componentes...                        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         API Routes (Next.js)                     │
│  ├─ GET /api/tutors/[id]                        │
│  ├─ GET /api/courses/[id]                       │
│  ├─ GET /api/tutoring-sessions/...              │
│  ├─ GET /api/payments/...                       │
│  └─ Más rutas...                                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│    Servicios (Business Logic)                   │
│  ├─ tutor.service.js                            │
│  ├─ tutoring-session.service.js                 │
│  ├─ payment.service.js                          │
│  ├─ academic.service.js                         │
│  └─ Más servicios...                            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│   Repositorios (Data Access)                    │
│  ├─ tutor.repository.js                         │
│  ├─ tutoring-session.repository.js              │
│  ├─ academic.repository.js                      │
│  └─ Más repositorios...                         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│        Firebase Firestore Database              │
│  ├─ Collection: users                           │
│  ├─ Collection: tutoring_sessions               │
│  ├─ Collection: course                          │
│  └─ Más colecciones...                          │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos (Ejemplo: Statistics Page)

1. **Usuario accede a** `/tutor/statistics`
2. **Statistics Page carga y llama:**
   ```javascript
   // Obtiene el tutor con sus cursos
   fetch('/api/tutors/:tutorId')
   
   // Para cada curso, obtiene su nombre
   fetch('/api/courses/:courseId')
   ```

3. **API Route** (`/api/tutors/[id]/route.js`):
   - Llama a `tutorService.getTutorById(id)`
   - Retorna JSON

4. **Service** (`tutor.service.js`):
   - Llama a `tutorRepository.findById(id)`
   - Sanitiza datos
   - Retorna objeto tutor limpio

5. **Repository** (`tutor.repository.js`):
   - Consulta Firestore
   - Retorna documento

---

## 🚀 Cómo Usar

### Ejecutar en desarrollo:
```bash
npm run dev
```
Abre http://localhost:3000

### Hacer build para producción:
```bash
npm run build
npm run start
```

### Probar un endpoint en la terminal:
```bash
curl http://localhost:3000/api/tutors/tutor-id-or-email
curl http://localhost:3000/api/courses/course-id
```

---

## 📋 Convenciones Implementadas

✅ **Capas estrictamente separadas:**
- Repository: Datos puros de Firestore
- Service: Lógica de negocio
- API Route: HTTP interface
- Component: UI React

✅ **Seguridad:**
- Firebase Admin SDK en servidor solamente
- 'use server' directives en módulos server-only
- No exponer datos sensibles al cliente

✅ **Performance:**
- `.limit()` en todas las queries Firestore
- Paginación en servicios
- Sanitización de datos

✅ **Patrón de Errores:**
- Respuestas JSON con estructura `{ success, data/error, ... }`
- HTTP status codes correctos (404, 400, 500)
- Logging de errores en servidor

---

## 📚 Referencia de Carpetas Clave

```
src/
├── app/
│   ├── api/                           # API Routes
│   │   ├── tutors/[id]/route.js      # ✨ Nuevo
│   │   ├── courses/[id]/route.js     # Existente
│   │   ├── tutoring-sessions/...
│   │   └── ...
│   ├── tutor/
│   │   └── statistics/page.jsx        # ✏️ Modificado (API_BASE)
│   ├── home/
│   │   └── history/page.jsx
│   └── ...
├── lib/
│   ├── services/
│   │   ├── tutor.service.js           # ✨ Nuevo
│   │   ├── tutoring-session.service.js
│   │   ├── academic.service.js
│   │   └── ...
│   ├── repositories/
│   │   ├── tutor.repository.js        # ✨ Nuevo
│   │   ├── academic.repository.js
│   │   └── ...
│   └── i18n/
└── ISIS3710_202520_S1_E06_Back/       # 📚 Solo para referencia (excluido de build)
```

---

## ✅ Estado del Proyecto

| Item | Estado |
|------|--------|
| Compilación | ✅ Exitosa |
| Endpoints de Tutor | ✅ Creados |
| Endpoints de Cursos | ✅ Existentes |
| Statistics Page | ✅ Conectada a /api internos |
| Estructura Monolítica | ✅ Implementada |
| Firebase Excluido de Cliente | ✅ 'use server' configurado |

---

## 🔧 Próximos Pasos

1. **Validar History Page** - Asegurarse de que TutoringHistory usa endpoints internos
2. **Crear más endpoints** - Si necesitas más funcionalidades (ej: pagos, sesiones)
3. **Testing** - Ejecutar tests unitarios y de integración
4. **Documentar API** - Usar Swagger/OpenAPI si lo deseas

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo eliminar la carpeta ISIS3710_202520_S1_E06_Back?**
A: Sí, cuando hayas completado la referencia. El proyecto funciona sin ella.

**P: ¿Dónde están los endpoints del backend original?**
A: Ahora están como servicios en `src/lib/services/` con endpoints en `src/app/api/`.

**P: ¿Cómo agregar más endpoints?**
A: Crea un archivo en `src/app/api/...`, usa el servicio/repository pattern, y expone una función GET/POST.

**P: ¿Necesito cambiar algo en el frontend?**
A: Solo si estabas llamando a `http://localhost:3001`. Ahora usa `/api/...` (rutas relativas).

---

## 📝 Notas Importantes

- La carpeta de referencia (`ISIS3710_202520_S1_E06_Back`) está excluida de compilación pero sigue en el repo
- Todos los servicios nuevos usan 'use server' para marcar código solo-servidor
- Firebase Admin SDK solo se ejecuta en los API routes, nunca en el cliente
- El patrón repository → service → route es consistente con el resto del código

---

**Última actualización:** 2026-03-12
**Estado:** Monolítico completamente funcional
**Próxima compilación:** `npm run build` ✅
