# Audio Processor CLI

## Instrucciones de Instalación

Para utilizar esta aplicación:

1. Asegúrate de tener Node.js y FFmpeg instalados en tu sistema Ubuntu.
2. Instala las dependencias ejecutando:
   ```bash
   npm install
   ```
3. Coloca los archivos de audio que deseas procesar en el mismo directorio.
4. Ejecuta la aplicación:
   ```bash
   node index.js
   ```
   o
   ```bash
   npm start
   ```

## Cómo Funciona la Aplicación

1. **Configuración Inicial**:
   - La aplicación verifica si FFmpeg está instalado en tu sistema.
   - Escanea el directorio actual en busca de archivos de audio.
   - Crea un directorio de salida 'output' si no existe.

2. **Interacción con el Usuario**:
   - El usuario selecciona un archivo de audio de una lista.
   - El usuario ingresa parámetros para:
     - Tiempos de inicio y fin de corte (formato HH:MM:SS).
     - Ajuste de tempo (1.0 es la velocidad original).
     - Bitrate de audio para compresión (ej. 32k).
   - La aplicación muestra un resumen y solicita confirmación.

3. **Procesamiento**:
   - Crea una copia temporal del archivo seleccionado.
   - Construye un comando FFmpeg basado en los parámetros del usuario.
   - Ejecuta FFmpeg para procesar el audio.
   - Guarda el resultado en el directorio 'output'.
   - Limpia los archivos temporales.

4. **Validación de Entrada**:
   - Validación del formato de tiempo (HH:MM:SS).
   - Validación del tempo (número positivo).
   - Validación del bitrate (formato como 32k).

5. **Manejo de Errores**:
   - Verifica errores comunes como la falta de FFmpeg.
   - Maneja errores de operaciones con archivos.
   - Proporciona mensajes de error comprensibles para el usuario.

---

# Audio Processor CLI

## Installation Instructions

To use this application:

1. Make sure you have Node.js and FFmpeg installed on your Ubuntu system.
2. Install dependencies by running:
   ```bash
   npm install
   ```
3. Place audio files you want to process in the same directory.
4. Run the application:
   ```bash
   node index.js
   ```
   or
   ```bash
   npm start
   ```

## How the Application Works

1. **Initial Setup**:
   - The application checks if FFmpeg is installed on your system.
   - It scans the current directory for audio files.
   - It creates a 'output' output directory if it doesn't exist.

2. **User Interaction**:
   - The user selects an audio file from a list.
   - The user enters parameters for:
     - Cut start and end times (HH:MM:SS format).
     - Tempo adjustment (1.0 is original speed).
     - Audio bitrate for compression (e.g., 32k).
   - The application shows a summary and asks for confirmation.

3. **Processing**:
   - Creates a temporary copy of the selected file.
   - Builds an FFmpeg command based on user parameters.
   - Executes FFmpeg to process the audio.
   - Saves the result to the 'output' directory.
   - Cleans up temporary files.

4. **Input Validation**:
   - Time format validation (HH:MM:SS).
   - Tempo validation (positive number).
   - Bitrate validation (format like 32k).

5. **Error Handling**:
   - Checks for common errors like missing FFmpeg.
   - Handles file operation errors.
   - Provides user-friendly error messages.