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
   - Permite seleccionar el idioma de la interfaz (Español/Inglés).
   - Escanea el directorio actual en busca de archivos de audio (.mp3, .wav, .ogg, .flac, .aac).
   - Crea un directorio de salida 'output' si no existe.

2. **Interacción con el Usuario**:
   - El usuario selecciona un archivo de audio de una lista.
   - El usuario ingresa parámetros para:
     - Tiempos de inicio y fin de corte (formatos flexibles: 5s, 1m 30s, 1h, HH:MM:SS).
     - Ajuste de tempo (1.0 es la velocidad original, 1.25 por defecto).
     - Bitrate de audio para compresión (ej. 32k).
   - La aplicación muestra un resumen y solicita confirmación.

3. **Procesamiento**:
   - Crea una copia temporal del archivo seleccionado.
   - Construye un comando FFmpeg basado en los parámetros del usuario.
   - Muestra una barra de progreso durante el procesamiento.
   - Guarda el resultado en el directorio 'output'.
   - Limpia los archivos temporales automáticamente.

4. **Validación de Entrada**:
   - Validación de formato de tiempo flexible (5s, 1m, 1h, HH:MM:SS).
   - Validación del tempo (número positivo o 0 para omitir).
   - Validación del bitrate (formato como 32k o 0 para omitir).

5. **Manejo de Errores**:
   - Verifica errores comunes como la falta de FFmpeg.
   - Maneja errores de operaciones con archivos.
   - Proporciona mensajes de error comprensibles en el idioma seleccionado.

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
   - Allows selecting interface language (Spanish/English).
   - Scans the current directory for audio files (.mp3, .wav, .ogg, .flac, .aac).
   - Creates an 'output' directory if it doesn't exist.

2. **User Interaction**:
   - User selects an audio file from a list.
   - User enters parameters for:
     - Cut start and end times (flexible formats: 5s, 1m 30s, 1h, HH:MM:SS).
     - Tempo adjustment (1.0 is original speed, 1.25 default).
     - Audio bitrate for compression (e.g., 32k).
   - The application shows a summary and asks for confirmation.

3. **Processing**:
   - Creates a temporary copy of the selected file.
   - Builds an FFmpeg command based on user parameters.
   - Shows a progress bar during processing.
   - Saves the result to the 'output' directory.
   - Automatically cleans up temporary files.

4. **Input Validation**:
   - Flexible time format validation (5s, 1m, 1h, HH:MM:SS).
   - Tempo validation (positive number or 0 to skip).
   - Bitrate validation (format like 32k or 0 to skip).

5. **Error Handling**:
   - Checks for common errors like missing FFmpeg.
   - Handles file operation errors.
   - Provides user-friendly error messages in the selected language.