# 💎 Ethereum Angular DApp - Proyecto de Pruebas Basado en Riesgos

**Autor:** [kiz4ru]
**Fecha:** 21 de mayo de 2025

## 1. Introducción del Proyecto

Esta aplicación descentralizada (DApp) ha sido desarrollada como base para la implementación y evaluación de un **modelo de pruebas exhaustivo basado en riesgos**. La DApp, construida con Angular y un contrato inteligente en Solidity para Ethereum, permite a los usuarios almacenar y consultar valores en la blockchain, gestionar autorizaciones y visualizar un historial de actualizaciones.
---

## 2. Funcionalidades Implementadas en la DApp

La DApp sirve como el "sistema bajo prueba" y cuenta con las siguientes características:

- **Almacenamiento de Valores en Blockchain:**
    - Los usuarios pueden registrar un valor (cadena de texto) asociado a su dirección de Ethereum.
    - El contrato inteligente `ValueStorage.sol` gestiona la lógica de almacenamiento.
- **Consulta de Valores:**
    - Los usuarios pueden ver el valor actual almacenado por su propia dirección.
- **Sistema de Autorización:**
    - El propietario del contrato puede autorizar a otras direcciones para modificar su valor almacenado.
    - El propietario puede revocar dichas autorizaciones.
- **Historial de Transacciones por Usuario:**
    - Cada vez que un valor es modificado, se registra la nueva entrada junto con una marca de tiempo (`block.timestamp`).
    - Los usuarios pueden consultar su propio historial de valores.
    - Es posible consultar el historial de otras direcciones (si se conoce la dirección).
- **Integración con MetaMask:**
    - Conexión nativa para la interacción con la blockchain (obtención de cuentas, firma de transacciones).
    - Detección de red y solicitud de cambio a redes soportadas (Ganache, Sepolia).
- **Interfaz de Usuario (Angular):**
    - **Dashboard:** Para ver el valor actual y actualizarlo.
    - **Historial:** Para visualizar el historial de cambios de valor.
    - **Ajustes:** Para gestionar autorizaciones (propietario), ver información del contrato y cambiar el tema visual.
    - **Notificaciones Toastr:** Para feedback de transacciones y acciones.
    - **Traducción al Español:** Interfaz de usuario completamente en español.
- **Soporte para Modo Claro/Oscuro:** Para mejorar la accesibilidad y preferencia del usuario.

---

## 3. Arquitectura de la Aplicación

La DApp se compone de dos partes principales:

### 3.1. Smart Contract (`ValueStorage.sol`)
- **Lenguaje:** Solidity
- **Framework:** Truffle
- **Funcionalidades Clave:**
    - `setValue(string memory newValue)`: Almacena un nuevo valor y registra la marca de tiempo. Solo para el propietario o direcciones autorizadas.
    - `getValue(address user)`: Devuelve el valor actual del usuario.
    - `authorize(address userToAuth)`: Autoriza a una dirección. Solo propietario.
    - `unauthorize(address userToUnauth)`: Revoca la autorización. Solo propietario.
    - `isAuthorized(address user)`: Verifica si una dirección está autorizada.
    - `getUserHistory(address user)`: Devuelve el historial de valores (valor y marca de tiempo) para un usuario.
    - `getOwner()`: Devuelve la dirección del propietario del contrato.
- **Ubicación:** `c:\Users\UserLix\Desktop\midapp\project\contracts\ValueStorage.sol`
- **ABI y Dirección (después de la migración):** Se encuentra en `c:\Users\UserLix\Desktop\midapp\project\build\contracts\ValueStorage.json` y se gestiona a través de `web3.service.ts`.

### 3.2. Frontend (Angular)
- **Framework:** Angular (versión específica si la tienes, ej: v17)
- **Lenguaje:** TypeScript
- **Componentes Principales:**
    - `DashboardComponent`: Interfaz para interactuar con `setValue` y `getValue`.
    - `HistoryComponent`: Muestra el resultado de `getUserHistory`.
    - `RecentUpdatesComponent`: Muestra un resumen del historial reciente.
    - `SettingsComponent`: Permite al propietario gestionar autorizaciones y ver detalles del contrato.
    - `Web3Service`: Servicio central para la interacción con MetaMask y el contrato inteligente. Maneja la conexión, llamadas a funciones del contrato, procesamiento de datos (ej: conversión de `BigInt` a `Number` para timestamps) y traducciones de mensajes de error.
- **Ubicación del Código Fuente:** `c:\Users\UserLix\Desktop\midapp\project\src\app\`

---

## 4. Proceso de Pruebas Basado en Riesgos (Enfoque Principal del Proyecto)

Esta sección detalla el núcleo del proyecto: la aplicación de una metodología de pruebas basada en riesgos.

### 4.1. Metodología
Se ha adoptado un enfoque de pruebas basado en riesgos para identificar, analizar y mitigar los riesgos potenciales en la DApp. Este proceso incluye:
    - **Identificación de Riesgos:** Análisis de posibles fallos en el contrato inteligente y la aplicación frontend (seguridad, funcionales, usabilidad, integración).
    - **Análisis y Priorización de Riesgos:** Creación de una matriz de riesgos para cuantificar y priorizar los riesgos identificados.
    - **Diseño de Estrategia de Pruebas:** Desarrollo de un plan de pruebas que se enfoca en las áreas de mayor riesgo.
    - **Ejecución de Pruebas:** Implementación y ejecución de casos de prueba.
    - **Evaluación y Reporte:** Análisis de la efectividad de las pruebas y justificación de las decisiones tomadas.

*(Esta sección se expandirá significativamente a medida que avancemos en el proceso de pruebas. Incluirá referencias a la matriz de riesgos, planes de prueba, herramientas utilizadas, resultados y justificaciones.)*

### 4.2. Herramientas de Prueba Previstas
- **Smart Contract:**
    - Pruebas unitarias con Truffle (JavaScript/Mocha/Chai) - `value_storage.test.js`.
    - Análisis estático de seguridad con Slither.
- **Frontend Angular:**
    - Pruebas unitarias con Karma/Jasmine para servicios y componentes.
    - Pruebas End-to-End (E2E) con Cypress o Protractor para flujos de usuario clave.

### 4.3. Documentación de Pruebas
- **Plan de Pruebas:** [Referencia al documento o sección donde se detallará]
- **Casos de Prueba:** [Referencia al documento o sección donde se detallarán]
- **Resultados de Pruebas:** [Referencia al documento o sección donde se detallarán]
- **Matriz de Riesgos:** [Referencia al documento o sección donde se detallará]

---

## 5. Requisitos Previos para Ejecución

- [MetaMask](https://metamask.io/) (extensión para navegador)
- [Ganache](https://trufflesuite.com/ganache/) (blockchain local para desarrollo y pruebas)
- [Node.js](https://nodejs.org/) (versión 16 o superior recomendada)
- [npm](https://www.npmjs.com/) (gestor de paquetes)
- [Truffle Suite](https://trufflesuite.com/) (instalado globalmente o como dependencia de proyecto)

---

## 6. Instalación y Configuración del Entorno de Desarrollo

1.  **Clonar el Repositorio:**
    ```bash
    # (Si estuviera en un repo git)
    # git clone https://github.com/tuusuario/ethereum-angular-dapp.git
    # cd ethereum-angular-dapp
    # Por ahora, asumir que el proyecto ya está en c:\Users\UserLix\Desktop\midapp\project\
    cd c:\Users\UserLix\Desktop\midapp\project\
    ```

2.  **Instalar Dependencias del Proyecto (Frontend y Herramientas de Desarrollo):**
    ```bash
    npm install
    ```

3.  **Configurar Ganache:**
    - Iniciar Ganache.
    - Asegurarse de que la red esté disponible en `HTTP://127.0.0.1:7545`.
    - Importar cuentas de Ganache a MetaMask si es necesario para pruebas manuales.

4.  **Compilar Contratos Inteligentes:**
    Este comando compila los contratos de Solidity y genera los archivos ABI necesarios.
    ```bash
    npm run truffle:compile 
    # o directamente: npx truffle compile
    ```

5.  **Migrar Contratos Inteligentes a Ganache:**
    Este comando despliega los contratos compilados a la red de Ganache configurada en `truffle-config.js`.
    ```bash
    npm run truffle:migrate -- --reset
    # o directamente: npx truffle migrate --network ganache --reset
    # El flag --reset es importante para asegurar un despliegue limpio.
    ```
    *Nota: La configuración de red 'ganache' en `truffle-config.js` apunta a `127.0.0.1:7545` con `network_id: "1337"`.*

6.  **Iniciar la Aplicación Angular (Servidor de Desarrollo):**
    ```bash
    npm run dev
    # o directamente: ng serve
    ```

7.  **Acceder a la Aplicación:**
    Abrir el navegador en 👉 [http://localhost:4200](http://localhost:4200)

---

## 7. Uso de la Aplicación

### 7.1. Conexión con MetaMask
1.  Asegurarse de tener MetaMask instalada y desbloqueada.
2.  En MetaMask, seleccionar la red **Ganache** (o la red local configurada, ej: `Localhost 7545`). Si se usa una `network_id` diferente a la de Ganache por defecto (5777), asegurarse que MetaMask esté conectada a la red con la `network_id` "1337".
3.  Hacer clic en el botón **“Conectar Wallet”** en la DApp.
4.  Autorizar la conexión desde la notificación de MetaMask.

### 7.2. Funcionalidades Principales
-   **Actualizar Valor:**
    1.  Navegar al **Dashboard**.
    2.  Ingresar un valor en el campo "Actualizar Valor".
    3.  Hacer clic en "Guardar Valor".
    4.  Confirmar la transacción en MetaMask.
    *Solo el propietario o direcciones autorizadas pueden realizar esta acción.*
-   **Ver Historial:**
    1.  Navegar a la sección **Historial**.
    2.  El historial del usuario conectado se muestra por defecto.
    3.  Se puede ingresar otra dirección para ver su historial.
-   **Gestionar Autorizaciones (como propietario del contrato):**
    1.  Navegar a **Ajustes**.
    2.  En la sección "Gestionar Autorizaciones", ingresar la dirección a autorizar/desautorizar.
    3.  Hacer clic en "Autorizar" o "Revocar Autorización".
    4.  Confirmar la transacción en MetaMask.

---

## 8. Estructura del Repositorio (Resumen)

```text
midapp/
├── build/                        # Artefactos de compilación de Truffle (ABIs)
│   └── contracts/
│       └── ValueStorage.json
├── contracts/                    # Código fuente de los Smart Contracts
│   └── ValueStorage.sol
├── migrations/                   # Scripts de migración de Truffle
│   └── 1_initial_migration.js
├── node_modules/                 # Dependencias del proyecto
├── src/                          # Código fuente de la aplicación Angular
│   ├── app/
│   │   ├── components/           # Componentes de Angular
│   │   ├── services/             # Servicios de Angular (Web3Service, ThemeService)
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── assets/                   # Archivos estáticos (imágenes, etc.)
│   ├── environments/             # Configuración de entornos
│   ├── global_styles.css
│   ├── index.html
│   └── main.ts
├── test/                         # Pruebas del Smart Contract
│   └── value_storage.test.js
├── angular.json                  # Configuración del CLI de Angular
├── package.json                  # Dependencias y scripts de NPM
├── README.md                     # Este archivo
├── truffle-config.js             # Configuración de Truffle (redes, compilador)
└── tsconfig.json                 # Configuración de TypeScript
```




---

## 9. Decisiones de Diseño y Justificaciones Clave (Hasta la Fecha)

-   **Timestamp en `ValueRecord`:** Se utiliza `block.timestamp` para registrar el momento de la actualización del valor, proporcionando una referencia temporal en el historial.
-   **Conversión `BigInt` a `Number` en `web3.service.ts`:** Los timestamps devueltos por el contrato son `BigInt`. Se convierten a `Number` en el servicio para facilitar su manejo y visualización en Angular (ej: con `DatePipe`). Se asume que los timestamps no excederán `Number.MAX_SAFE_INTEGER` en el contexto de esta aplicación.
-   **Traducción al Español:** Para mejorar la accesibilidad y cumplir con posibles requisitos de localización.
-   **Configuración de Red `ganache` en `truffle-config.js`:** Se especificó `network_id: "1337"` para asegurar la compatibilidad con la configuración por defecto de Ganache CLI y evitar conflictos.
-   **Manejo de Errores en `web3.service.ts`:** Se implementó un manejo básico de errores para las interacciones con el contrato, con mensajes traducidos al español.

*(Esta sección se actualizará con justificaciones relacionadas con el proceso de pruebas y las modificaciones realizadas durante el mismo).*

---

## 10. Próximos Pasos y Enfoque del Proyecto

El enfoque principal se centra ahora en:
1.  **Identificación y Análisis Detallado de Riesgos:** Para `ValueStorage.sol` y la aplicación Angular.
2.  **Creación de una Matriz de Riesgos Exhaustiva.**
3.  **Desarrollo de una Estrategia de Pruebas Basada en Riesgos:** Con un fuerte énfasis en la seguridad del contrato inteligente y la funcionalidad crítica del frontend.
4.  **Elaboración de un Plan de Pruebas Detallado:** Incluyendo casos de prueba específicos para riesgos identificados.
5.  **Ejecución de Pruebas:**
    -   Ampliación de `value_storage.test.js`.
    -   Implementación de pruebas unitarias en Angular (Karma/Jasmine).
    -   Implementación de pruebas E2E en Angular (Cypress/Protractor).
    -   Análisis de seguridad con Slither para `ValueStorage.sol`.
6.  **Documentación Meticulosa:** De todo el proceso, resultados, modificaciones y justificaciones.
7.  **Evaluación Crítica:** De la efectividad del modelo de pruebas implementado.

---