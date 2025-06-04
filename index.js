import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import cliProgress from 'cli-progress';

// Reutilizar las traducciones del archivo original
import { translations } from './translations.js';

// Configuración global
const CONFIG = {
    AUDIO_FORMATS: ['.mp3', '.wav', '.ogg', '.flac', '.aac'],
    OUTPUT_DIR: 'output',
    DEFAULT_TEMPO: 1.25,
    DEFAULT_BITRATE: '32k',
    lang: 'es'
};

// Objeto para almacenar las opciones seleccionadas
const userChoices = {
    wantsToCut: false,
    wantsTempoChange: false,
    wantsBitrateChange: false,
    cutConfig: { start: 0, end: 0 },
    tempoValue: 1.0,
    bitrateValue: '0'
};

// Función de traducción mejorada
const t = (key, ...args) => {
    let text = translations[CONFIG.lang];
    const keys = key.split('.');
    for (const k of keys) {
        text = text[k];
        if (!text) return key;
    }
    if (args.length > 0 && typeof text === 'string') {
        return args.reduce((str, arg, i) => str.replace(`{${i}}`, arg), text);
    }
    return text;
};

// Funciones de utilidad para validación y parseo de tiempo
const timeUtils = {
    parseFlexibleTime: (timeStr) => {
        if (!timeStr || timeStr === '0') return 0;
        const hhmmss = /^(\d{1,2}:)?(\d{1,2}:)?\d{1,2}(\.\d+)?$/;
        const hms = /^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m)?\s*(?:(\d+(?:\.\d+)?)\s*s)?$/i;

        if (hhmmss.test(timeStr)) {
            const parts = timeStr.split(':').map(Number);
            if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
            if (parts.length === 2) return parts[0] * 60 + parts[1];
            return parts[0];
        }

        const match = timeStr.match(hms);
        if (!match) return null;

        const hours = parseFloat(match[1] || '0');
        const minutes = parseFloat(match[2] || '0');
        const seconds = parseFloat(match[3] || '0');

        return hours * 3600 + minutes * 60 + seconds;
    },

    formatFriendlyDuration: (seconds) => {
        if (seconds <= 0) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0 || parts.length === 0) parts.push(`${s}s`);
        return parts.join(' ');
    }
};

// Funciones de interacción con el usuario
const userInterface = {
    async selectLanguage() {
        const { selectedLang } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedLang',
            message: t('languageSelection'),
            choices: [
                { name: t('spanish'), value: 'es' },
                { name: t('english'), value: 'en' }
            ]
        }]);
        CONFIG.lang = selectedLang;
    },

    async getInitialChoices() {
        const choices = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'wantsToCut',
                message: t('wantToCut'),
                default: false
            },
            {
                type: 'confirm',
                name: 'wantsTempoChange',
                message: t('wantToChangeTempo'),
                default: false
            },
            {
                type: 'confirm',
                name: 'wantsBitrateChange',
                message: t('wantToChangeBitrate'),
                default: false
            }
        ]);

        Object.assign(userChoices, choices);
    },

    async getCutParameters(duration) {
        if (!userChoices.wantsToCut) return;

        const { startTime, endTime } = await inquirer.prompt([
            {
                type: 'input',
                name: 'startTime',
                message: t('startTimeMessage'),
                default: '0',
                validate: (input) => {
                    const time = timeUtils.parseFlexibleTime(input);
                    if (time === null) return t('invalidTimeFormat');
                    if (time < 0) return t('timeCannotBeNegative');
                    if (time >= duration) return t('timeMustBeLessThanDuration');
                    return true;
                }
            },
            {
                type: 'input',
                name: 'endTime',
                message: t('endTimeMessage'),
                default: '0',
                validate: (input, answers) => {
                    const time = timeUtils.parseFlexibleTime(input);
                    if (time === null) return t('invalidTimeFormat');
                    if (time === 0) return true;
                    const start = timeUtils.parseFlexibleTime(answers.startTime) || 0;
                    if (time <= start) return t('endTimeMustBeGreater');
                    if (time > duration) return t('timeMustBeLessOrEqual');
                    return true;
                }
            }
        ]);

        userChoices.cutConfig.start = timeUtils.parseFlexibleTime(startTime);
        userChoices.cutConfig.end = timeUtils.parseFlexibleTime(endTime);
    },

    async getTempoValue() {
        if (!userChoices.wantsTempoChange) return;

        const { tempo } = await inquirer.prompt([{
            type: 'number',
            name: 'tempo',
            message: t('tempoFactorMessage', CONFIG.DEFAULT_TEMPO),
            default: CONFIG.DEFAULT_TEMPO,
            validate: (value) => {
                if (value <= 0) return t('tempoMustBeGreaterThanZero');
                if (value > 2.5) return t('tempoMustBeLessThanMax');
                return true;
            }
        }]);

        userChoices.tempoValue = tempo;
    },

    async getBitrateValue() {
        if (!userChoices.wantsBitrateChange) return;

        const { bitrate } = await inquirer.prompt([{
            type: 'input',
            name: 'bitrate',
            message: t('bitrateMessage', CONFIG.DEFAULT_BITRATE),
            default: CONFIG.DEFAULT_BITRATE,
            validate: (value) => {
                if (!/^\d+k$/.test(value)) return t('invalidBitrateFormat');
                return true;
            }
        }]);

        userChoices.bitrateValue = bitrate;
    }
};

// Funciones de procesamiento de audio
const audioProcessor = {
    buildFFmpegCommand(inputFile, outputFile, audioDuration) {
        const command = ['ffmpeg', '-y', '-i', inputFile];
        
        // Aplicar corte si está configurado
        if (userChoices.wantsToCut) {
            if (userChoices.cutConfig.start > 0) {
                command.push('-ss', userChoices.cutConfig.start.toString());
            }
            if (userChoices.cutConfig.end > 0) {
                command.push('-to', userChoices.cutConfig.end.toString());
            }
        }

        // Aplicar filtros de audio
        const filters = [];
        if (userChoices.wantsTempoChange && userChoices.tempoValue !== 1.0) {
            filters.push(`atempo=${userChoices.tempoValue}`);
        }
        
        if (filters.length > 0) {
            command.push('-filter:a', filters.join(','));
        }

        // Aplicar bitrate
        if (userChoices.wantsBitrateChange) {
            command.push('-b:a', userChoices.bitrateValue);
        }

        command.push(outputFile);
        return command;
    },

    async executeFFmpeg(command) {
        const progressBar = new cliProgress.SingleBar({
            format: t('processingBar'),
            barCompleteChar: '=',
            barIncompleteChar: ' '
        });

        return new Promise((resolve, reject) => {
            progressBar.start(100, 0);
            
            const ffmpeg = spawn(command[0], command.slice(1));
            let duration = 0;

            ffmpeg.stderr.on('data', (data) => {
                const output = data.toString();
                if (!duration) {
                    const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
                    if (match) {
                        duration = (parseInt(match[1]) * 3600 + 
                                  parseInt(match[2]) * 60 + 
                                  parseInt(match[3]));
                    }
                }

                const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
                if (timeMatch && duration) {
                    const current = (parseInt(timeMatch[1]) * 3600 + 
                                   parseInt(timeMatch[2]) * 60 + 
                                   parseInt(timeMatch[3]));
                    const progress = Math.min(99, (current / duration) * 100);
                    progressBar.update(progress);
                }
            });

            ffmpeg.on('close', (code) => {
                progressBar.stop();
                if (code === 0) resolve();
                else reject(new Error(`FFmpeg salió con código ${code}`));
            });
        });
    }
};

// Función principal
async function main() {
    try {
        await userInterface.selectLanguage();
        console.clear();
        console.log(chalk.cyan(t('audioProcessorTitle')));

        const audioFiles = fs.readdirSync('.')
            .filter(file => CONFIG.AUDIO_FORMATS.includes(path.extname(file).toLowerCase()));

        if (audioFiles.length === 0) {
            throw new Error(t('noAudioFiles'));
        }

        const { selectedFile } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedFile',
            message: t('selectAudioFile'),
            choices: audioFiles
        }]);

        const duration = await new Promise((resolve) => {
            exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${selectedFile}"`,
                (error, stdout) => resolve(parseFloat(stdout) || 0));
        });

        await userInterface.getInitialChoices();

        // Verificar si se seleccionó al menos una opción
        if (!userChoices.wantsToCut && !userChoices.wantsTempoChange && !userChoices.wantsBitrateChange) {
            console.log(chalk.yellow(t('noOptionsSelected')));
            return;
        }

        // Continuar con el proceso normal
        await userInterface.getCutParameters(duration);
        await userInterface.getTempoValue();
        await userInterface.getBitrateValue();

        // 6. Crear directorio de salida
        if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
            fs.mkdirSync(CONFIG.OUTPUT_DIR);
        }

        // 7. Procesar archivo
        const outputFile = path.join(CONFIG.OUTPUT_DIR, 
            `${path.basename(selectedFile, path.extname(selectedFile))}${path.extname(selectedFile)}`);

        const ffmpegCommand = audioProcessor.buildFFmpegCommand(selectedFile, outputFile, duration);
        await audioProcessor.executeFFmpeg(ffmpegCommand);

        console.log(chalk.green(t('processComplete')));
        console.log(chalk.white(t('fileSavedAs', outputFile)));

    } catch (error) {
        console.error(chalk.red('\nError:', error.message));
        process.exit(1);
    }
}

main();
