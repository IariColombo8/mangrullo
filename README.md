# El Mangrullo - Sitio Web

Este proyecto es una Single Page Application (SPA) desarrollada con React.js (Next.js) para "El Mangrullo", un complejo de cabañas en Federación, Entre Ríos, Argentina.

## Características

- ✅ Panel de administrador 100% editable (sin tocar código)
- ✅ Integración con Booking.com API (calendario y reservas)
- ✅ Multiidioma (ES/EN/PT)
- ✅ Hosting en Firebase
- ✅ Blog de actividades (Termas, Pesca, Chaviyú, + opción "Agregar más")

## Tecnologías Utilizadas

- **Frontend**: React + Next.js + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Booking.com**: API oficial
- **CMS**: Panel admin custom con CRUD para todo
- **Deploy**: Firebase Hosting

## Estructura del Proyecto

\`\`\`
el-mangrullo/
├── app/                  # Páginas de Next.js
│   ├── admin/            # Panel de administración
│   ├── login/            # Página de inicio de sesión
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página principal
├── components/           # Componentes React
│   ├── admin/            # Componentes del panel admin
│   ├── home/             # Componentes de la página principal
│   ├── layout/           # Componentes de layout (header, footer)
│   └── ui/               # Componentes UI reutilizables
├── context/              # Contextos de React
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
├── public/               # Archivos estáticos
├── translations/         # Archivos de traducción
├── types/                # Definiciones de TypeScript
└── utils/                # Funciones utilitarias
\`\`\`

## Instalación y Ejecución

### Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn

### Pasos de Instalación

1. Clona el repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/el-mangrullo.git
cd el-mangrullo
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
# o
yarn install
\`\`\`

3. Configura las variables de entorno:
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Agrega las variables necesarias (ver `.env.example`)

4. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue

Para desplegar la aplicación en Firebase Hosting, consulta la guía detallada en [DEPLOYMENT.md](DEPLOYMENT.md).

## Guía del Administrador

Para aprender a usar el panel de administración, consulta la guía detallada en [ADMIN_GUIDE.md](ADMIN_GUIDE.md).

## Contribución

Si deseas contribuir a este proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

- **Desarrollador**: Tu Nombre
- **Email**: tu.email@ejemplo.com
- **Sitio Web**: [www.elmangrullo.com](https://www.elmangrullo.com)
