# Sistema de Apoyo de Recursos Educativos (REA)

**Universidad Veracruzana — Facultad de Estadística e Informática**

Sistema web para la búsqueda, curación y validación de recursos educativos abiertos, desarrollado con Next.js, Supabase, Cloudinary y Tailwind CSS.

---

## Requisitos Previos

Antes de clonar el proyecto asegúrate de tener instalado lo siguiente en tu máquina.

### 1. Node.js (v18 o superior)

Descarga el instalador desde la página oficial:

https://nodejs.org/en/download

Se recomienda la versión **LTS**. Para verificar que la instalación fue exitosa, abre una terminal y ejecuta:

```bash
node -v
npm -v
```

Deberías ver los números de versión de ambos. Si no los ves, reinicia la terminal e intenta de nuevo.

---

## Clonar el Repositorio

Abre una terminal en la carpeta donde quieras guardar el proyecto y ejecuta:

```bash
git clone https://github.com/AngelSpinosa/sistema-de-apoyo
```
Luego entra a la carpeta del proyecto:

```bash
cd sistema-apoyo-rea
```

---

## Variables de Entorno

El proyecto requiere un archivo `.env.local` en la raíz del proyecto con las credenciales de Supabase y Cloudinary. Este archivo **no está incluido en el repositorio** por razones de seguridad.

```
sistema-apoyo-rea/
├── .env.local        ← aquí va el archivo
├── app/
├── public/
├── package.json
└── ...
```

---

## Instalación de Dependencias

Con Node.js instalado y el archivo `.env.local` en su lugar, instala las dependencias del proyecto:

```bash
npm install
```

Este comando descarga todos los paquetes necesarios (Next.js, Supabase client, Tailwind CSS, TypeScript, etc.). Puede tardar uno o dos minutos la primera vez.

---

## Correr el Proyecto en Modo Desarrollo

```bash
npm run dev
```

Abre tu navegador en:

```
http://localhost:3000
```

El servidor recargará automáticamente cada vez que guardes cambios en el código.

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 16.2.6 | Framework principal (React + SSR) |
| TypeScript | — | Tipado estático |
| Tailwind CSS | — | Estilos |
| Supabase | — | Base de datos (PostgreSQL) y autenticación |
| Cloudinary | — | Almacenamiento de recursos (PDFs y videos) |

---

## Estructura del Proyecto

```
sistema-apoyo-rea/
└── app/
    ├── auth/login/             # Inicio de sesión
    ├── dashboard/              # Dashboard personalizado por usuario
    │   ├── page.tsx            # Temas y recursos dinámicos por perfil
    │   └── historial/          # Historial de vistas
    ├── dashboard/recurso/[id]/ # Vista de recurso individual
    ├── r/[token]/              # Redirección por token
    ├── perfil/                 # Perfil del usuario autenticado
    ├── admin/
    │   ├── dashboard/          # Panel de administración
    │   ├── repositorios/[id]/  # Gestión de repositorios
    │   └── usuarios/           # Gestión de usuarios
    ├── docente/
    │   ├── colecciones/        # Colecciones del docente
    │   ├── curacion/           # (En desarrollo) CU-02/03/04
    │   └── validacion/         # (En desarrollo) CU-05
    └── estudiante/
        └── biblioteca/         # Biblioteca del estudiante
```

---

## Roles de Usuario

El sistema maneja tres roles:

- **Estudiante** — acceso al dashboard, historial y biblioteca.
- **Docente** — acceso al dashboard, colecciones, curación y validación (según membresía en academia).
- **Administrador** — acceso completo al panel de administración, repositorios y usuarios.

---

## Solución de Problemas Comunes

**`npm install` falla con error de permisos (macOS/Linux)**

```bash
sudo npm install
```

**El puerto 3000 ya está en uso**

Next.js asignará automáticamente el siguiente puerto disponible (3001, 3002, etc.) e indicará la URL en la terminal.

**La página carga pero no muestra datos**

Verifica que el archivo `.env.local` esté en la raíz del proyecto y que las credenciales sean correctas. Las variables deben empezar con `NEXT_PUBLIC_` para ser accesibles en el cliente.

---

## Contacto

Para dudas sobre el proyecto o para solicitar el archivo `.env.local`:

**José Ángel Espinosa Lagunes** — autor del sistema  
Director: Dr. Saúl Domínguez Isidro  
Codirectora: Dra. Alma Eloísa Rodríguez Medina