# Guía de Despliegue - El Mangrullo

Esta guía te ayudará a desplegar la aplicación de El Mangrullo en Firebase Hosting.

## Requisitos Previos

1. Tener una cuenta de Firebase
2. Tener instalado Node.js y npm
3. Tener instalado Firebase CLI (`npm install -g firebase-tools`)

## Configuración de Firebase

### Paso 1: Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Sigue los pasos para crear un nuevo proyecto
4. Anota el ID del proyecto, lo necesitarás más adelante

### Paso 2: Configurar Firebase en tu aplicación

1. En la consola de Firebase, ve a la configuración del proyecto
2. Haz clic en "Agregar app" y selecciona "Web"
3. Sigue los pasos para registrar tu aplicación
4. Copia la configuración de Firebase que se te proporciona

### Paso 3: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz de tu proyecto con las siguientes variables:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
\`\`\`

## Despliegue

### Paso 1: Iniciar sesión en Firebase

\`\`\`bash
firebase login
\`\`\`

### Paso 2: Inicializar Firebase en tu proyecto

\`\`\`bash
firebase init
\`\`\`

Selecciona las siguientes opciones:
- Hosting
- Firestore (si vas a usar la base de datos)
- Storage (si vas a usar almacenamiento)
- Usa el proyecto que creaste anteriormente
- Directorio público: `out`
- Configura como aplicación de página única: `No` (ya que usamos Next.js)

### Paso 3: Construir la aplicación

\`\`\`bash
npm run build
\`\`\`

### Paso 4: Exportar la aplicación estática

\`\`\`bash
next export
\`\`\`

### Paso 5: Desplegar a Firebase

\`\`\`bash
firebase deploy
\`\`\`

## Configuración de Dominio Personalizado (Opcional)

Si deseas usar un dominio personalizado:

1. Ve a la consola de Firebase > Hosting
2. Haz clic en "Agregar dominio personalizado"
3. Sigue las instrucciones para verificar la propiedad del dominio
4. Configura los registros DNS según las instrucciones

## Configuración de CI/CD con GitHub Actions (Opcional)

Para configurar el despliegue automático con GitHub Actions:

1. Crea un token de Firebase CI:
\`\`\`bash
firebase login:ci
\`\`\`

2. Agrega el token como secreto en tu repositorio de GitHub con el nombre `FIREBASE_TOKEN`

3. Crea un archivo `.github/workflows/firebase-deploy.yml` con el siguiente contenido:

\`\`\`yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - run: npm run export
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_TOKEN }}'
          channelId: live
          projectId: tu-project-id
\`\`\`

## Solución de Problemas

### Error: "Firebase Hosting setup complete!"
Este no es un error, sino una confirmación de que la configuración se ha completado correctamente.

### Error: "Error: HTTP Error: 403, The caller does not have permission"
Asegúrate de haber iniciado sesión correctamente con `firebase login` y tener los permisos adecuados en el proyecto.

### Error: "Error: Functions directory does not exist. Run firebase init functions"
Si no estás usando Firebase Functions, puedes ignorar este error. De lo contrario, ejecuta `firebase init functions`.

## Recursos Adicionales

- [Documentación de Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de GitHub Actions](https://docs.github.com/es/actions)
