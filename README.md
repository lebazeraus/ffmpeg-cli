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
   npm run start
   ```

## Cómo Funciona la Aplicación

1. **Configuración Inicial**:
   - La aplicación verifica si FFmpeg está instalado en tu sistema.
   - Permite seleccionar el idioma de la interfaz (Español/Inglés).
   - Escanea el directorio actual en busca de archivos de audio (.mp3, .wav, .ogg, .flac, .aac).
   - Crea un directorio de salida 'output' si no existe.

2. **Selección de Operaciones**:
   - El usuario selecciona un archivo de audio de la lista.
   - Se presentan tres opciones de procesamiento:
     1. Cortar el audio
     2. Modificar el tempo
     3. Cambiar el bitrate
   - Cada opción es independiente y opcional.
   - Si no se selecciona ninguna opción, el proceso termina sin modificar el archivo.

3. **Configuración de Operaciones**:
   Si se seleccionaron operaciones, se solicitarán los parámetros necesarios:
   - **Para corte**:
     - Tiempo de inicio (0 para omitir)
     - Tiempo de fin (0 para omitir)
     - Soporta formatos: 5s, 1m 30s, 1h, HH:MM:SS
   - **Para tempo**:
     - Factor de tempo (1.0 es velocidad original)
     - Rango permitido: mayor que 0 y hasta 2.5
   - **Para bitrate**:
     - Nuevo bitrate en formato XXk (ej: 32k, 64k, 128k)

4. **Procesamiento**:
   - Construye un comando FFmpeg basado en las opciones seleccionadas.
   - Muestra una barra de progreso durante el procesamiento.
   - Guarda el resultado en el directorio 'output'.

5. **Validaciones**:
   - Verifica que al menos una opción sea seleccionada.
   - Valida los formatos de tiempo ingresados.
   - Comprueba que los tiempos sean coherentes con la duración del audio.
   - Valida el rango del factor de tempo.
   - Verifica el formato correcto del bitrate.

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
   npm run start
   ```

## How the Application Works

1. **Initial Setup**:
   - The application checks if FFmpeg is installed on your system.
   - Allows selecting interface language (Spanish/English).
   - Scans the current directory for audio files (.mp3, .wav, .ogg, .flac, .aac).
   - Creates an 'output' directory if it doesn't exist.

2. **Operation Selection**:
   - The user selects an audio file from the list.
   - Three processing options are presented:
     1. Cut the audio
     2. Modify the tempo
     3. Change the bitrate
   - Each option is independent and optional.
   - If no option is selected, the process ends without modifying the file.

3. **Operation Settings**:
   If operations were selected, the necessary parameters will be requested:
   - **For cutting**:
     - Start time (0 for omit)
     - End time (0 for omit)
     - Supports formats: 5s, 1m 30s, 1h, HH:MM:SS
   - **For tempo**:
     - Tempo factor (1.0 is original speed)
     - Allowed range: greater than 0 and up to 2.5
   - **For bitrate**:
     - New bitrate in XXk format (e.g., 32k, 64k, 128k)

4. **Processing**:
   - Builds an FFmpeg command based on the selected options.
   - Shows a progress bar during processing.
   - Saves the result to the 'output' directory.

5. **Validations**:
   - Checks that at least one option is selected.
   - Validates the entered time formats.
   - Ensures that the times are consistent with the audio duration.
   - Validates the tempo factor range.
   - Checks the correct format of the bitrate.