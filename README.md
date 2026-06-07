# BookStore - Sistema de Gestión de Biblioteca

¡Bienvenido a **BookStore**! Una aplicación web full-stack premium diseñada para la administración y consulta de autores y libros en un catálogo de biblioteca. Este proyecto implementa funcionalidades avanzadas de filtrado, paginación y agregación de datos (estadísticas de rendimiento).

El desarrollo está basado en una arquitectura moderna enfocada en la experiencia de usuario (UX), utilizando un diseño responsivo con estética premium de glassmorphism y transiciones fluidas.

---

## 🚀 Tecnologías Utilizadas

*   **Frontend & Core:** [Next.js](https://nextjs.org/) (versión 16, App Router) y [React 19](https://react.dev/).
*   **Base de Datos Relacional:** PostgreSQL alojado en [Supabase](https://supabase.com/).
*   **ORM:** [Prisma](https://www.prisma.io/) (para modelado y migraciones de datos con soporte de transactions).
*   **Estilos y UX:** [Tailwind CSS v4](https://tailwindcss.com/) (diseño completamente responsivo y adaptativo).
*   **Iconografía:** [Lucide React](https://lucide.dev/).

---

## ✨ Características Principales

### 👨‍💻 Panel de Gestión de Autores (Dashboard)
*   **CRUD Completo de Autores:** Creación, lectura, edición y eliminación de perfiles de autores.
*   **Estadísticas Generales:** Tarjetas interactivas con métricas globales actualizadas en tiempo real (autores totales, libros, etc.).
*   **Diseño Interactivo:** Modales animados para inserción y edición de perfiles sin recargas de página.

### 📚 Buscador de Libros Avanzado
*   **Búsqueda en Tiempo Real:** Filtro reactivo por título del libro (case-insensitive).
*   **Filtros Multi-criterio:** Dropdowns dinámicos para filtrar de forma simultánea por género y autor.
*   **Paginación Eficiente:** Implementación de paginación en el backend para un rendimiento óptimo de carga.
*   **Ordenamiento Flexible:** Ordenamiento ascendente/descendente configurable por título del libro, fecha de creación o año de publicación.

### 📊 Perfil de Detalle & Métricas por Autor
*   **Estadísticas Avanzadas:** 
    *   Cálculo del promedio de páginas escritas por libro.
    *   Identificación de los libros con mayor y menor número de páginas.
    *   Historial cronológico (primer libro vs. último libro publicado).
    *   Listado de géneros literarios únicos abordados por el autor.
*   **Asociación Rápida:** Registro de nuevos libros asociados automáticamente al autor seleccionado.

---

## 🛠️ Arquitectura de la API (Endpoints)

El sistema expone las siguientes rutas de API robustas bajo `/api/`:

*   `GET /api/authors` - Listar todos los autores.
*   `POST /api/authors` - Registrar un autor.
*   `GET | PUT | DELETE /api/authors/[id]` - Operaciones individuales por autor.
*   `GET /api/authors/[id]/stats` - **[Avanzado]** Agregación de estadísticas del autor.
*   `GET /api/books` - Obtener libros.
*   `POST /api/books` - Crear un libro.
*   `GET | PUT | DELETE /api/books/[id]` - Operaciones individuales por libro.
*   `GET /api/books/search` - **[Avanzado]** Búsqueda de libros con paginación, filtros y ordenación.

---

## ⚙️ Instrucciones de Instalación y Uso Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/TU_USUARIO/athenaeum-library-manager.git
cd athenaeum-library-manager
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y agrega tu cadena de conexión a PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:contraseña@servidor:puerto/bd?schema=public"
```

### 4. Sincronizar Base de Datos con Prisma
Genera el cliente Prisma y realiza la sincronización de tablas:
```bash
npx prisma db push
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando.
