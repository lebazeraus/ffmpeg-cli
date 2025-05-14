import fs from 'fs';
import path from 'path';
import { exec, spawn, execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import cliProgress from 'cli-progress';

// Translations
const translations = {
  en: {
    appTitle: 'FFmpeg CLI',
    languageSelection: 'Select interface language:',
    spanish: 'Spanish',
    english: 'English',
    scanningFiles: 'Scanning for audio files...',
    noFilesFound: 'No audio files found in the current directory.',
    directoryCreated: 'Directory created successfully:',
    directoryError: 'Error creating directory:',
    selectFile: 'Select an audio file to process:',
    analyzingFile: 'Analyzing audio file...',
    fileDuration: 'File duration:',
    startTimeFlexible: 'Start time (e.g., 0s, 4s, 1m, 1m 3s, HH:MM:SS):',
    endTimeFlexible: 'End time (default: {0}, e.g., 4s, 1m, 1m 3s, HH:MM:SS):',
    endAfterStart: 'End time must be after start time.',
    askChangeTempo: 'Change tempo factor? (Y/n)',
    askChangeBitrate: 'Change bitrate? (Y/n)',
    yes: 'Yes',
    no: 'No',
    tempoFactorPrompt: 'Tempo factor (default: 1.25, enter 0 to skip):',
    bitratePrompt: 'Bitrate (default: 32k, enter 0 to skip):',
    invalidTime: 'Please enter a time in HH:MM:SS format',
    invalidFlexibleTime: 'Invalid time format. Use s, m, h. E.g., 5s, 10m, 1m 30s, 1h, or HH:MM:SS.',
    errorStartTimeAfterEndTime: 'Start time cannot be after end time.',
    invalidTempo: 'Please enter a positive number for tempo (or 0 to skip).',
    invalidBitrate: 'Please enter a valid bitrate (e.g., 32k, 0 to skip).',
    summary: 'Operations summary:',
    selectedFile: 'Selected file:',
    duration: 'Duration:',
    cut: 'Cut:',
    tempo: 'Tempo factor:',
    bitrateLabel: 'Bitrate:',
    confirmMandatory: 'Execute configured tasks? (Y/n):',
    canceled: 'Operation canceled.',
    tempFileCreated: 'Temporary copy created:',
    tempFileError: 'Error creating temporary copy:',
    executing: 'Executing FFmpeg with the following arguments:',
    processing: 'Processing:',
    completed: 'Processing completed successfully.',
    ffmpegError: 'FFmpeg exited with error code:',
    executionError: 'Error executing FFmpeg:',
    outputSaved: 'Processed file saved in:',
    tempFileRemoved: 'Temporary file removed:',
    tempFileWarning: 'Warning: Could not remove temporary file:',
    error: 'Error:',
    previewOption: 'Would you like to preview the audio?',
    previewOriginal: 'Preview original audio (5 seconds)',
    previewProcessed: 'Preview processed audio (5 seconds)',
    previewNoPreview: 'No preview',
    previewPlaying: 'Playing audio preview...',
    previewError: 'Could not play audio preview:',
    usingDefaultTempo: 'Using default tempo: {0}',
    usingDefaultBitrate: 'Using default bitrate: {0}',
    omittingTempo: 'Skipping tempo change.',
    omittingBitrate: 'Skipping bitrate change.',
    cutFromTo: 'Cut from {0} to {1}',
    entireAudio: 'Entire audio'
  },
  es: {
    appTitle: 'Procesador de Audio CLI',
    languageSelection: 'Seleccione el idioma de la interfaz:',
    spanish: 'Español',
    english: 'English',
    scanningFiles: 'Escaneando archivos de audio...',
    noFilesFound: 'No se encontraron archivos de audio en el directorio actual.',
    directoryCreated: 'Directorio creado correctamente:',
    directoryError: 'Error al crear el directorio:',
    selectFile: 'Seleccione un archivo de audio para procesar:',
    analyzingFile: 'Analizando archivo de audio...',
    fileDuration: 'Duración del archivo:',
    startTimeFlexible: 'Tiempo de inicio (ej: 0s, 4s, 1m, 1m 3s, HH:MM:SS):',
    endTimeFlexible: 'Tiempo de fin (defecto: {0}, ej: 4s, 1m, 1m 3s, HH:MM:SS):',
    endAfterStart: 'El tiempo de fin debe ser posterior al tiempo de inicio.',
    askChangeTempo: '¿Desea cambiar el factor de tempo? (S/n)',
    askChangeBitrate: '¿Desea cambiar el bitrate? (S/n)',
    yes: 'Sí',
    no: 'No',
    tempoFactorPrompt: 'Factor de tempo (defecto: 1.25, ingrese 0 para omitir):',
    bitratePrompt: 'Bitrate (defecto: 32k, ingrese 0 para omitir):',
    invalidTime: 'Por favor, ingrese un tiempo en formato HH:MM:SS',
    invalidFlexibleTime: 'Formato de tiempo inválido. Use s, m, h. Ej: 5s, 10m, 1m 30s, 1h, o HH:MM:SS.',
    errorStartTimeAfterEndTime: 'El tiempo de inicio no puede ser posterior al tiempo de fin.',
    invalidTempo: 'Por favor, ingrese un número positivo para el tempo (o 0 para omitir).',
    invalidBitrate: 'Por favor, ingrese un bitrate válido (ej: 32k, 0 para omitir).',
    summary: 'Resumen de operaciones:',
    selectedFile: 'Archivo seleccionado:',
    duration: 'Duración:',
    cut: 'Corte:',
    tempo: 'Factor de tempo:',
    bitrateLabel: 'Bitrate:',
    confirmMandatory: '¿Ejecutar las tareas configuradas? (S/n):',
    canceled: 'Operación cancelada.',
    tempFileCreated: 'Copia temporal creada:',
    tempFileError: 'Error al crear la copia temporal:',
    executing: 'Ejecutando FFmpeg con los siguientes argumentos:',
    processing: 'Procesando:',
    completed: 'Procesamiento completado correctamente.',
    ffmpegError: 'FFmpeg salió con código de error:',
    executionError: 'Error al ejecutar FFmpeg:',
    outputSaved: 'Archivo procesado guardado en:',
    tempFileRemoved: 'Archivo temporal eliminado:',
    tempFileWarning: 'Advertencia: No se pudo eliminar el archivo temporal:',
    error: 'Error:',
    previewOption: '¿Desea previsualizar el audio?',
    previewOriginal: 'Previsualizar audio original (5 segundos)',
    previewProcessed: 'Previsualizar audio procesado (5 segundos)',
    previewNoPreview: 'Sin previsualización',
    previewPlaying: 'Reproduciendo vista previa del audio...',
    previewError: 'No se pudo reproducir la vista previa del audio:',
    usingDefaultTempo: 'Usando tempo por defecto: {0}',
    usingDefaultBitrate: 'Usando bitrate por defecto: {0}',
    omittingTempo: 'Omitiendo cambio de tempo.',
    omittingBitrate: 'Omitiendo cambio de bitrate.',
    cutFromTo: 'Corte desde {0} hasta {1}',
    entireAudio: 'Audio completo'
  }
};

// Global language setting
let lang = 'es'; // Default language

// Translation helper function
function t(key, ...args) {
  let text = translations[lang];
  
  // Navigate through nested keys
  const keys = key.split('.');
  for (const k of keys) {
    text = text[k];
    if (!text) return key; // Return the key if translation not found
  }
  
  // Replace placeholders with arguments if provided
  if (args.length > 0 && typeof text === 'string') {
    return args.reduce((str, arg, i) => str.replace(`{${i}}`, arg), text);
  }
  
  return text;
}

// Supported audio formats
const AUDIO_FORMATS = ['.mp3', '.wav', '.ogg', '.flac', '.aac'];
const OUTPUT_DIR = 'output';

// Display application header
function displayHeader() {
  console.clear();
  console.log(chalk.yellow('========================================='));
}

// Select language
async function selectLanguage() {
  const { selectedLang } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedLang',
      message: t('languageSelection'),
      choices: [
        { name: t('spanish'), value: 'es' },
        { name: t('english'), value: 'en' }
      ]
    }
  ]);
  
  lang = selectedLang;
  displayHeader();
}

// Check if FFmpeg is installed
function checkFFmpeg() {
  return new Promise((resolve, reject) => {
    exec('ffmpeg -version', (error) => {
      if (error) {
        reject(new Error('FFmpeg no está instalado o no está disponible en el PATH del sistema.'));
      } else {
        resolve();
      }
    });
  });
}

// Check if play (SoX) is installed for audio preview
function checkSox() {
  return new Promise((resolve) => {
    exec('play --version', (error) => {
      resolve(!error);
    });
  });
}

// Scan directory for audio files
function scanForAudioFiles() {
  try {
    console.log(chalk.blue(t('scanningFiles')));
    const files = fs.readdirSync(process.cwd());
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_FORMATS.includes(ext);
    });
    
    if (audioFiles.length === 0) {
      console.log(chalk.red(t('noFilesFound')));
      process.exit(0);
    }
    
    return audioFiles;
  } catch (error) {
    console.error(chalk.red(`${t('error')} ${error.message}`));
    process.exit(1);
  }
}

// Get audio duration using ffprobe
async function getAudioDuration(fileName) {
  return new Promise((resolve, reject) => {
    const safeFileName = fileName.replace(/"/g, '\"');
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${safeFileName}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error getting duration with ffprobe for ${fileName}: ${stderr || error.message}. Falling back to ffmpeg.`));
        const fallbackCommand = `ffmpeg -i "${safeFileName}" 2>&1`;
        exec(fallbackCommand, (fallError, fallStdout, fallStderr) => {
            const durationMatch = fallStdout.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
            if (durationMatch) {
                const [, hours, minutes, seconds] = durationMatch.slice(1).map(Number);
                const durationSeconds = hours * 3600 + minutes * 60 + seconds;
                 resolve({
                    seconds: durationSeconds,
                    formattedHHMMSS: formatTimeHHMMSS(durationSeconds),
                    friendlyFormatted: formatFriendlyDuration(durationSeconds)
                });
            } else {
                 reject(new Error(`Failed to get duration using ffprobe and ffmpeg: ${fallStderr || fallError || 'Unknown error'}`));
            }
        });
        return;
      }
      const durationSeconds = parseFloat(stdout);
      if (isNaN(durationSeconds)) {
        reject(new Error(`Could not parse duration from ffprobe output: ${stdout}`));
        return;
      }
      resolve({
        seconds: durationSeconds,
        formattedHHMMSS: formatTimeHHMMSS(durationSeconds),
        friendlyFormatted: formatFriendlyDuration(durationSeconds)
      });
    });
  });
}

// Format time in seconds to HH:MM:SS
function formatTimeHHMMSS(secondsTotal) {
  const hours = Math.floor(secondsTotal / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = Math.floor(secondsTotal % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Convert HH:MM:SS or MM:SS or SS to seconds
function timeToSeconds(timeStr) {
  if (typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  let seconds = 0;
  if (parts.length === 3) { // HH:MM:SS
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) { // MM:SS
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 1) { // SS
    seconds = parts[0];
  }
  return seconds;
}

// Parse flexible time input (e.g., "1m 30s", "5s", "HH:MM:SS") to seconds
function parseFlexibleTime(timeStr) {
  timeStr = String(timeStr).trim().toLowerCase();
  if (!timeStr && timeStr !== '0') return null; // Distinguish empty from '0'
  if (timeStr === '0') return 0;

  // Check for HH:MM:SS or MM:SS or SS format first
  if (/^(\d{1,2}:){0,2}\d{1,2}(\.\d+)?$/.test(timeStr)) {
      if (/^\d+(\.\d+)?$/.test(timeStr)) { // If just a number, treat as seconds
          return parseFloat(timeStr);
      }
      const parts = timeStr.split(':').map(s => parseFloat(s.trim()));
      if (parts.some(isNaN)) return null; 
      let seconds = 0;
      if (parts.length === 3) { 
          seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) { 
          seconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 1) { 
          seconds = parts[0];
      }
      return seconds;
  }

  const regex = /(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m)?\s*(?:(\d+(?:\.\d+)?)\s*s)?/i;
  const match = timeStr.match(regex);

  if (!match || match[0] !== timeStr || (match[1] === undefined && match[2] === undefined && match[3] === undefined)) {
    return null; 
  }

  const hours = parseFloat(match[1] || '0');
  const minutes = parseFloat(match[2] || '0');
  const seconds = parseFloat(match[3] || '0');

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null; 
  }
  return hours * 3600 + minutes * 60 + seconds;
}

// Format total seconds into a user-friendly string like "1h 12m 3s"
function formatFriendlyDuration(totalSecondsParam) {
  let totalSeconds = totalSecondsParam;
  if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
    return '0s';
  }
  totalSeconds = Math.round(totalSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ') || '0s';
}

// Create output directory if it doesn't exist
function createOutputDirectory() {
  const outputPath = path.join(process.cwd(), OUTPUT_DIR);
  
  if (!fs.existsSync(outputPath)) {
    try {
      fs.mkdirSync(outputPath);
      console.log(chalk.green(`${t('directoryCreated')} '${OUTPUT_DIR}'`));
    } catch (error) {
      console.error(chalk.red(`${t('directoryError')} '${OUTPUT_DIR}': ${error.message}`));
      process.exit(1);
    }
  }
}

// Validate time format (HH:MM:SS) - REMOVED as parseFlexibleTime handles validation
/* function validateTimeFormat(time) {
  const timeRegex = /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
  if (!timeRegex.test(time)) {
    return t('invalidTime');
  }
  return true;
} */

// Validate flexible time format
function validateFlexibleTimeFormat(time) {
  const result = parseFlexibleTime(time);
  if (result === null) {
    return t('invalidFlexibleTime');
  }
  return true;
}

// Validate tempo value (positive float or 0)
function validateTempo(tempo) {
  const tempoValue = parseFloat(tempo);
  if (isNaN(tempoValue) || tempoValue < 0) { // Allow 0
    return t('invalidTempo');
  }
  return true;
}

// Validate bitrate format (e.g., 32k or 0)
function validateBitrate(bitrate) {
  if (String(bitrate).trim() === '0') return true; // Allow 0
  const bitrateRegex = /^\d+k$/i;
  if (!bitrateRegex.test(String(bitrate).trim())) {
    return t('invalidBitrate');
  }
  return true;
}

// Build FFmpeg command based on parameters
function buildFFmpegCommand(params) {
  const command = ['ffmpeg']; // Agregar 'ffmpeg' como primer elemento
  command.push('-y'); // Añadir -y después de ffmpeg
  command.push('-i', params.tempFile);

  // Apply cut if start or end time is different from defaults
  if (params.startTimeSeconds > 0) {
    command.push('-ss', String(params.startTimeSeconds));
  }
  if (params.endTimeSeconds < params.audioDuration.seconds) {
    command.push('-to', String(params.endTimeSeconds));
  }

  // Filters - combine tempo and potential future filters
  let filterComplex = [];
  if (params.tempo && params.tempo !== 1.0) {
    filterComplex.push(`atempo=${params.tempo}`);
  }

  if (filterComplex.length > 0) {
    command.push('-filter:a', filterComplex.join(','));
  }

  // Apply bitrate if specified and not 0
  if (params.bitrate && params.bitrate !== '0') {
    command.push('-b:a', params.bitrate);
  }

  // Add output file path
  command.push(params.outputFile);

  return command;
}

// Get human-readable description of cutting parameters
function getCutDescription(startTimeSeconds, endTimeSeconds, totalDurationSeconds) {
  if (startTimeSeconds === 0 && endTimeSeconds >= totalDurationSeconds) {
    return t('entireAudio');
  }
  const startFriendly = formatFriendlyDuration(startTimeSeconds);
  const endFriendly = formatFriendlyDuration(endTimeSeconds);
  return t('cutFromTo', startFriendly, endFriendly);
}

// Create a temporary copy of the file
function createTempFile(fileName) {
  const tempFileName = `temp_${fileName}`;
  try {
    fs.copyFileSync(fileName, tempFileName);
    console.log(chalk.green(`${t('tempFileCreated')} ${tempFileName}`));
    return tempFileName;
  } catch (error) {
    console.error(chalk.red(`${t('tempFileError')} ${error.message}`));
    process.exit(1);
  }
}

// Execute FFmpeg command with progress bar
function executeFFmpeg(ffmpegArgs) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(t('executing')));
    console.log(chalk.gray(ffmpegArgs.join(' ')));
    
    // Create progress bar
    const progressBar = new cliProgress.SingleBar({
      format: `${t('processing')} {bar} {percentage}% | ETA: {eta}s`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      clearOnComplete: true
    });
    
    progressBar.start(100, 0);
    
    // Separar el comando 'ffmpeg' de los argumentos
    const ffmpeg = spawn(ffmpegArgs[0], ffmpegArgs.slice(1), {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let progress = 0;
    let duration = 0;
    
    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      // Try to parse duration info
      const durationMatch = output.match(/Duration: (\d+):(\d+):(\d+)/);
      if (durationMatch && duration === 0) {
        const [, hours, minutes, seconds] = durationMatch;
        duration = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      }
      
      // Try to parse progress info
      const timeMatch = output.match(/time=(\d+):(\d+):(\d+)/);
      if (timeMatch && duration > 0) {
        const [, hours, minutes, seconds] = timeMatch;
        const currentTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
        progress = Math.min(99, Math.round((currentTime / duration) * 100));
        progressBar.update(progress);
      }
    });
    
    ffmpeg.on('close', (code) => {
      progressBar.stop();
      if (code === 0) {
        console.log(chalk.green(`\n${t('completed')}`));
        resolve();
      } else {
        reject(new Error(`${t('ffmpegError')} ${code}`));
      }
    });
    
    ffmpeg.on('error', (error) => {
      progressBar.stop();
      reject(new Error(`${t('executionError')} ${error.message}`));
    });
  });
}

// Clean up temporary files
function cleanupTempFile(tempFileName) {
  try {
    fs.unlinkSync(tempFileName);
    console.log(chalk.green(`${t('tempFileRemoved')} ${tempFileName}`));
  } catch (error) {
    console.warn(chalk.yellow(`${t('tempFileWarning')} ${error.message}`));
  }
}

// Main function to run the application
async function main() {
  try {
    // Initial checks
    await checkFFmpeg();
    // await checkSox(); // Optional: Uncomment if preview is essential
    createOutputDirectory();

    // 1. Select Language
    await selectLanguage();
    console.log(chalk.cyan(t('appTitle')));
    console.log(chalk.yellow('========================================='));

    // 2. Select Audio File
    const audioFiles = scanForAudioFiles();
    if (audioFiles.length === 0) {
      console.log(chalk.red(t('noFilesFound')));
      return;
    }
    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: t('selectFile'),
        choices: audioFiles
      }
    ]);

    // Get audio duration
    console.log(chalk.blue(t('analyzingFile')));
    const audioDuration = await getAudioDuration(selectedFile);
    console.log(chalk.green(`${t('fileDuration')} ${audioDuration.friendlyFormatted} (${audioDuration.seconds.toFixed(2)}s)`));

    // 3. Get Cutting Parameters (Directly)
    let startTimeSeconds = 0;
    let endTimeSeconds = audioDuration.seconds;

    const { startTimeInput } = await inquirer.prompt([
        {
            type: 'input',
            name: 'startTimeInput',
            message: t('startTimeFlexible'),
            default: '0s',
            validate: validateFlexibleTimeFormat
        }
    ]);
    startTimeSeconds = parseFlexibleTime(startTimeInput);

    const { endTimeInput } = await inquirer.prompt([
        {
            type: 'input',
            name: 'endTimeInput',
            message: t('endTimeFlexible', audioDuration.friendlyFormatted),
            default: audioDuration.friendlyFormatted,
            validate: (input) => {
                const isValidFormat = validateFlexibleTimeFormat(input);
                if (isValidFormat !== true) return isValidFormat;
                const endSecs = parseFlexibleTime(input);
                if (endSecs === null) return t('invalidFlexibleTime');
                if (endSecs < startTimeSeconds) {
                    return t('errorStartTimeAfterEndTime');
                }
                if (endSecs > audioDuration.seconds) {
                    console.warn(chalk.yellow(`\nWarning: End time ${formatFriendlyDuration(endSecs)} is beyond file duration ${audioDuration.friendlyFormatted}. Will cut up to the end.`));
                    // No need to return false, just warn. We'll cap it later if needed.
                }
                return true;
            }
        }
    ]);
    // Use parsed end time, but cap at actual duration if user entered higher
    const parsedEnd = parseFlexibleTime(endTimeInput);
    endTimeSeconds = Math.min(parsedEnd, audioDuration.seconds);
    if (endTimeSeconds < startTimeSeconds) endTimeSeconds = startTimeSeconds; // Should be caught by validation, but safety check


    // 4. Get Tempo Parameters
    let tempo = 1.0;
    const { changeTempoRaw } = await inquirer.prompt([
        {
            type: 'input',
            name: 'changeTempoRaw',
            message: t('askChangeTempo'),
            default: 'S',
            validate: (input) => {
                const normalized = input.toLowerCase();
                return normalized === 's' || normalized === 'n' ? true : 
                       'Por favor, ingrese S o n';
            }
        }
    ]);

    const changeTempo = changeTempoRaw.toLowerCase() === 's';

    if (changeTempo) {
        const { tempoFactor } = await inquirer.prompt([
            {
                type: 'input',
                name: 'tempoFactor',
                message: t('tempoFactorPrompt'),
                default: '1.25',
                validate: validateTempo
            }
        ]);
        tempo = parseFloat(tempoFactor);
        if (tempo === 0) {
            console.log(chalk.cyan(t('omittingTempo')));
            tempo = 1.0;
        } else {
            console.log(chalk.green(t('usingDefaultTempo', tempo)));
        }
    } else {
        console.log(chalk.cyan(t('omittingTempo')));
    }

    // 5. Get Bitrate Parameters
    let bitrate = '0';
    const { changeBitrateRaw } = await inquirer.prompt([
        {
            type: 'input',
            name: 'changeBitrateRaw',
            message: t('askChangeBitrate'),
            default: 'S',
            validate: (input) => {
                const normalized = input.toLowerCase();
                return normalized === 's' || normalized === 'n' ? true : 
                       'Por favor, ingrese S o n';
            }
        }
    ]);

    const changeBitrate = changeBitrateRaw.toLowerCase() === 's';

    if (changeBitrate) {
        const { bitrateValue } = await inquirer.prompt([
            {
                type: 'input',
                name: 'bitrateValue',
                message: t('bitratePrompt'),
                default: '32k',
                validate: validateBitrate
            }
        ]);
        bitrate = String(bitrateValue).trim();
        if (bitrate === '0') {
            console.log(chalk.cyan(t('omittingBitrate')));
        } else {
            console.log(chalk.green(t('usingDefaultBitrate', bitrate)));
        }
    } else {
        console.log(chalk.cyan(t('omittingBitrate')));
    }

    // --- Summary --- 
    console.log(chalk.cyan(`\n${t('summary')}`));
    console.log(chalk.yellow('========================================='));
    console.log(`${chalk.cyan(t('selectedFile'))} ${chalk.white(selectedFile)}`);
    console.log(`${chalk.cyan(t('duration'))} ${chalk.white(audioDuration.friendlyFormatted)}`);
    console.log(`${chalk.cyan(t('cut'))} ${chalk.white(getCutDescription(startTimeSeconds, endTimeSeconds, audioDuration.seconds))}`);
    console.log(`${chalk.cyan(t('tempo'))} ${chalk.white(tempo === 0 || tempo === 1.0 ? t('omittingTempo') : tempo)}`);
    console.log(`${chalk.cyan(t('bitrateLabel'))} ${chalk.white(bitrate === '0' ? t('omittingBitrate') : bitrate)}`);
    console.log(chalk.yellow('========================================='));

    // 6. Confirmation (Mandatory Y/N or S/N)
    const { confirmation } = await inquirer.prompt([
      {
        type: 'input',
        name: 'confirmation',
        message: t('confirmMandatory'),
        validate: (input) => {
          const lowerInput = input.toLowerCase();
          if (lang === 'es') {
            return lowerInput === 's' || lowerInput === 'n' ? true : 'Por favor, ingrese S o n.';
          } else {
            return lowerInput === 'y' || lowerInput === 'n' ? true : 'Please enter Y or n.';
          }
        }
      }
    ]);

    const confirmed = confirmation.toLowerCase() === (lang === 'es' ? 's' : 'y');

    if (!confirmed) {
      console.log(chalk.yellow(t('canceled')));
      return;
    }

    // --- Execution --- 
    const tempFile = await createTempFile(selectedFile);
    const outputFileName = `${path.basename(selectedFile, path.extname(selectedFile))}_processed.mp3`;
    const outputFile = path.join(OUTPUT_DIR, outputFileName);

    const params = {
        tempFile,
        outputFile,
        startTimeSeconds,
        endTimeSeconds,
        tempo: tempo === 1.0 ? 0 : tempo, // Pass 0 if tempo is 1.0 to skip filter
        bitrate,
        audioDuration
    };

    const ffmpegArgs = buildFFmpegCommand(params);
    await executeFFmpeg(ffmpegArgs);

    console.log(chalk.green(`${t('outputSaved')} ${chalk.white(outputFile)}`));

    // Cleanup
    await cleanupTempFile(tempFile);

    // Ask for preview (optional)
    // await askForPreview(selectedFile, outputFile);

  } catch (error) {
    console.error(chalk.red(`\n${t('error')} ${error.message}`));
  }
}

// Start the application
main();