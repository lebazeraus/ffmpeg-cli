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
    cutType: 'What type of cut do you want to perform?',
    cutOptions: {
      none: 'Do not cut the audio (use entire file)',
      startOnly: 'Remove the beginning (keep from a point to the end)',
      endOnly: 'Remove the ending (keep from start to a point)',
      segment: 'Extract middle segment (keep only a specific portion)',
      custom: 'Manually specify exact start and end points'
    },
    startTime: 'Start time for cut (HH:MM:SS):',
    endTime: 'End time for cut (HH:MM:SS):',
    segmentStart: 'Start time of segment to keep (HH:MM:SS):',
    segmentEnd: 'End time of segment to keep (HH:MM:SS):',
    customStart: 'Custom start time (HH:MM:SS):',
    customEnd: 'Custom end time (HH:MM:SS):',
    endAfterStart: 'End time must be after start time',
    tempoFactor: 'Tempo factor (1.0 = original, >1.0 = faster, <1.0 = slower):',
    bitrate: 'Bitrate for compression (e.g.: 32k, 64k, 128k):',
    invalidTime: 'Please enter a time in HH:MM:SS format',
    invalidTempo: 'Please enter a positive number for tempo',
    invalidBitrate: 'Please enter a valid bitrate (example: 32k, 64k, 128k)',
    summary: 'Operations summary:',
    selectedFile: 'Selected file:',
    duration: 'Duration:',
    cut: 'Cut:',
    tempo: 'Tempo factor:',
    bitrateLabel: 'Bitrate:',
    confirm: 'Execute the configured tasks?',
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
    cutDescriptions: {
      none: 'No cut',
      startOnly: 'Cut from {0} to the end',
      endOnly: 'Cut from the beginning to {0}',
      segment: 'Keep segment from {0} to {1}',
      custom: 'Custom cut: {0} - {1}'
    }
  },
  es: {
    appTitle: 'Procesador de Audio CLI',
    languageSelection: 'Seleccione el idioma de la interfaz:',
    spanish: 'Español',
    english: 'Inglés',
    scanningFiles: 'Escaneando archivos de audio...',
    noFilesFound: 'No se encontraron archivos de audio en el directorio actual.',
    directoryCreated: 'Directorio creado correctamente:',
    directoryError: 'Error al crear el directorio:',
    selectFile: 'Seleccione un archivo de audio para procesar:',
    analyzingFile: 'Analizando archivo de audio...',
    fileDuration: 'Duración del archivo:',
    cutType: '¿Qué tipo de corte desea realizar?',
    cutOptions: {
      none: 'No realizar ningún corte (usar audio completo)',
      startOnly: 'Eliminar la parte inicial (conservar desde un punto hasta el final)',
      endOnly: 'Eliminar la parte final (conservar desde el inicio hasta un punto)',
      segment: 'Extraer segmento del medio (conservar sólo una porción específica)',
      custom: 'Especificar manualmente puntos exactos de inicio y fin'
    },
    startTime: 'Tiempo de inicio para el corte (HH:MM:SS):',
    endTime: 'Tiempo de fin para el corte (HH:MM:SS):',
    segmentStart: 'Tiempo de inicio del segmento a conservar (HH:MM:SS):',
    segmentEnd: 'Tiempo de fin del segmento a conservar (HH:MM:SS):',
    customStart: 'Tiempo de inicio personalizado (HH:MM:SS):',
    customEnd: 'Tiempo de fin personalizado (HH:MM:SS):',
    endAfterStart: 'El tiempo de fin debe ser posterior al tiempo de inicio',
    tempoFactor: 'Factor de tempo (1.0 = original, >1.0 = más rápido, <1.0 = más lento):',
    bitrate: 'Bitrate para compresión (ej: 32k, 64k, 128k):',
    invalidTime: 'Por favor, ingrese un tiempo en formato HH:MM:SS',
    invalidTempo: 'Por favor, ingrese un número positivo para el tempo',
    invalidBitrate: 'Por favor, ingrese un bitrate válido (ejemplo: 32k, 64k, 128k)',
    summary: 'Resumen de operaciones:',
    selectedFile: 'Archivo seleccionado:',
    duration: 'Duración:',
    cut: 'Corte:',
    tempo: 'Factor de tempo:',
    bitrateLabel: 'Bitrate:',
    confirm: '¿Ejecutar las tareas configuradas?',
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
    cutDescriptions: {
      none: 'Sin corte',
      startOnly: 'Cortar desde {0} hasta el final',
      endOnly: 'Cortar desde el inicio hasta {0}',
      segment: 'Conservar segmento desde {0} hasta {1}',
      custom: 'Corte personalizado: {0} - {1}'
    }
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
      message: 'Select language / Seleccione idioma:',
      choices: [
        { name: 'Español', value: 'es' },
        { name: 'English', value: 'en' }
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

// Get audio duration using FFmpeg
function getAudioDuration(fileName) {
  try {
    // Use FFprobe to get duration
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fileName}"`;
    const durationInSeconds = parseFloat(execSync(command).toString().trim());
    
    // Convert seconds to HH:MM:SS format
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    
    return {
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      seconds: durationInSeconds
    };
  } catch (error) {
    console.warn(chalk.yellow(`Warning: ${error.message}`));
    return { formatted: '00:30:00', seconds: 1800 }; // Default duration if unable to detect
  }
}

// Format time in seconds to HH:MM:SS
function formatTimeHHMMSS(secondsTotal) {
  const hours = Math.floor(secondsTotal / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = Math.floor(secondsTotal % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Convert HH:MM:SS to seconds
function timeToSeconds(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
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

// Validate time format (HH:MM:SS)
function validateTimeFormat(time) {
  const timeRegex = /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
  if (!timeRegex.test(time)) {
    return t('invalidTime');
  }
  return true;
}

// Validate tempo value (positive float)
function validateTempo(tempo) {
  const tempoValue = parseFloat(tempo);
  if (isNaN(tempoValue) || tempoValue <= 0) {
    return t('invalidTempo');
  }
  return true;
}

// Validate bitrate format
function validateBitrate(bitrate) {
  const bitrateRegex = /^[0-9]+k$/;
  if (!bitrateRegex.test(bitrate)) {
    return t('invalidBitrate');
  }
  return true;
}

// Get user input for cutting type and parameters
async function getCuttingParameters(audioDuration) {
  // Ask for cutting type
  const { cutType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'cutType',
      message: t('cutType'),
      choices: [
        { name: t('cutOptions.none'), value: 'none' },
        { name: t('cutOptions.startOnly'), value: 'startOnly' },
        { name: t('cutOptions.endOnly'), value: 'endOnly' },
        { name: t('cutOptions.segment'), value: 'segment' },
        { name: t('cutOptions.custom'), value: 'custom' }
      ]
    }
  ]);
  
  let startTime = '00:00:00';
  let endTime = audioDuration.formatted;
  
  switch (cutType) {
    case 'none':
      // No cutting, use defaults
      break;
    
    case 'startOnly':
      // Only specify start time
      const { start } = await inquirer.prompt([
        {
          type: 'input',
          name: 'start',
          message: t('startTime'),
          default: '00:00:10', // Default to 10 seconds in
          validate: validateTimeFormat
        }
      ]);
      startTime = start;
      break;
    
    case 'endOnly':
      // Only specify end time
      const { end } = await inquirer.prompt([
        {
          type: 'input',
          name: 'end',
          message: t('endTime'),
          default: formatTimeHHMMSS(audioDuration.seconds - 10), // Default to 10 seconds before end
          validate: validateTimeFormat
        }
      ]);
      endTime = end;
      break;
    
    case 'segment':
      // Specify segment to keep
      const { segmentStart, segmentEnd } = await inquirer.prompt([
        {
          type: 'input',
          name: 'segmentStart',
          message: t('segmentStart'),
          default: '00:00:10',
          validate: validateTimeFormat
        },
        {
          type: 'input',
          name: 'segmentEnd',
          message: t('segmentEnd'),
          default: formatTimeHHMMSS(audioDuration.seconds - 10),
          validate: (input) => {
            const baseValidation = validateTimeFormat(input);
            if (baseValidation !== true) return baseValidation;
            
            const endSecs = timeToSeconds(input);
            // const startSecs = timeToSeconds(segmentStart);
            
            // if (endSecs <= startSecs) {
            //   return t('endAfterStart');
            // }
            
            return true;
          }
        }
      ]);

      startTime = segmentStart;
      endTime = segmentEnd;
      break;
    
    case 'custom':
      // Custom cutting - manually specify both
      const { customStart, customEnd } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customStart',
          message: t('customStart'),
          default: '00:00:00',
          validate: validateTimeFormat
        },
        {
          type: 'input',
          name: 'customEnd',
          message: t('customEnd'),
          default: audioDuration.formatted,
          validate: (input) => {
            const baseValidation = validateTimeFormat(input);
            if (baseValidation !== true) return baseValidation;
            
            const endSecs = timeToSeconds(input);
            const startSecs = timeToSeconds(customStart);
            
            if (endSecs <= startSecs) {
              return t('endAfterStart');
            }
            
            return true;
          }
        }
      ]);
      startTime = customStart;
      endTime = customEnd;
      break;
  }

  return { startTime, endTime, cutType };
}

// Get user input for processing parameters
async function getUserParameters() {
  const audioFiles = scanForAudioFiles();
  
  // File selection
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
  const audioDuration = getAudioDuration(selectedFile);
  console.log(chalk.green(`${t('fileDuration')} ${audioDuration.formatted}`));
  
  // Get cutting parameters
  const { startTime, endTime, cutType } = await getCuttingParameters(audioDuration, audioDuration.seconds);
  
  // Tempo parameters
  const { tempo } = await inquirer.prompt([
    {
      type: 'input',
      name: 'tempo',
      message: t('tempoFactor'),
      default: '1.0',
      validate: validateTempo
    }
  ]);
  
  // Compression parameters
  const { bitrate } = await inquirer.prompt([
    {
      type: 'input',
      name: 'bitrate',
      message: t('bitrate'),
      default: '32k',
      validate: validateBitrate
    }
  ]);
  
  return {
    selectedFile,
    startTime,
    endTime,
    cutType,
    tempo: parseFloat(tempo),
    bitrate,
    audioDuration
  };
}

// Preview audio (requires SoX 'play' command)
async function previewAudio(fileName, startTime = '00:00:00', duration = 5) {
  try {
    console.log(chalk.blue(t('previewPlaying')));
    
    // Build play command with specified start time and duration
    const command = `play "${fileName}" trim ${startTime} ${duration} 2>/dev/null`;
    
    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error && error.code !== 0) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    return true;
  } catch (error) {
    console.error(chalk.red(`${t('previewError')} ${error.message}`));
    return false;
  }
}

// Ask user if they want to preview audio
async function askForPreview(fileName, processedFile = null) {
  const isSoxInstalled = await checkSox();
  
  if (!isSoxInstalled) {
    return;
  }
  
  const choices = [
    { name: t('previewOriginal'), value: 'original' }
  ];
  
  if (processedFile && fs.existsSync(processedFile)) {
    choices.push({ name: t('previewProcessed'), value: 'processed' });
  }
  
  choices.push({ name: t('previewNoPreview'), value: 'none' });
  
  const { previewType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'previewType',
      message: t('previewOption'),
      choices: choices
    }
  ]);
  
  if (previewType === 'original') {
    await previewAudio(fileName);
  } else if (previewType === 'processed') {
    await previewAudio(processedFile);
  }
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

// Build FFmpeg command based on parameters
function buildFFmpegCommand(params, tempFile) {
  const outputFile = path.join(OUTPUT_DIR, params.selectedFile);
  let command = [];
  
  // Add input file
  command.push('-i', tempFile);
  
  // Build filter string for atempo
  let filterStr = '';
  if (params.tempo !== 1.0) {
    filterStr = `atempo=${params.tempo}`;
  }
  
  // Add filter complex if needed
  if (filterStr) {
    command.push('-af', filterStr);
  }
  
  // Add time parameters if needed
  if (params.startTime !== '00:00:00') {
    command.unshift('-ss', params.startTime);  // Add before input for faster seeking
  }
  
  if (params.endTime !== params.audioDuration.formatted) {
    command.push('-to', params.endTime);
  }
  
  // Add bitrate
  command.push('-b:a', params.bitrate);
  
  // Force overwrite existing files
  command.push('-y');
  
  // Add output file
  command.push(outputFile);
  
  command.unshift('ffmpeg')
  return command;
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
    const ffmpeg = spawn(ffmpegArgs[0], ffmpegArgs.slice(1));
    
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

// Get human-readable description of cutting type
function getCutTypeDescription(params) {
  switch (params.cutType) {
    case 'none':
      return t('cutDescriptions.none');
    case 'startOnly':
      return t('cutDescriptions.startOnly', params.startTime);
    case 'endOnly':
      return t('cutDescriptions.endOnly', params.endTime);
    case 'segment':
      return t('cutDescriptions.segment', params.startTime, params.endTime);
    case 'custom':
      return t('cutDescriptions.custom', params.startTime, params.endTime);
    default:
      return `${params.startTime} - ${params.endTime}`;
  }
}

// Main function to run the application
async function main() {
  try {
    // Select language
    await selectLanguage();

    // Check if FFmpeg is installed
    await checkFFmpeg();

    // Create output directory
    createOutputDirectory();

    // Get user parameters
    const params = await getUserParameters();

    // Preview original audio if requested (before processing)
    await askForPreview(params.selectedFile);

    // Show confirmation with parameters summary
    console.log(chalk.cyan(`\n${t('summary')}`));
    console.log(chalk.yellow('========================================='));
    console.log(`${chalk.cyan(t('selectedFile'))} ${chalk.white(params.selectedFile)}`);
    console.log(`${chalk.cyan(t('duration'))} ${chalk.white(params.audioDuration.formatted)}`);
    console.log(`${chalk.cyan(t('cut'))} ${chalk.white(getCutTypeDescription(params))}`);
    console.log(`${chalk.cyan(t('tempo'))} ${chalk.white(params.tempo)}`);
    console.log(`${chalk.cyan(t('bitrateLabel'))} ${chalk.white(params.bitrate)}`);
    console.log(chalk.yellow('========================================='));

    const { confirmation } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message: t('confirm'),
        default: true
      }
    ]);

    if (!confirmation) {
      console.log(chalk.yellow(t('canceled')));
      return;
    }

    // Create temporary file
    const tempFileName = createTempFile(params.selectedFile);
    const outputFile = path.join(OUTPUT_DIR, params.selectedFile);

    try {
      // Build and execute FFmpeg command
      const ffmpegArgs = buildFFmpegCommand(params, tempFileName);
      await executeFFmpeg(ffmpegArgs);

      console.log(chalk.green(`\n${t('outputSaved')} ${outputFile}`));

      // Preview processed audio if requested
      await askForPreview(params.selectedFile, outputFile);

    } finally {
      // Always attempt to clean up the temporary file
      cleanupTempFile(tempFileName);
    }

  } catch (error) {
    console.error(chalk.red(`\n${t('error')} ${error.message}`));
    process.exit(1); // Exit with error code
  }
}
  
// Start the application
main();