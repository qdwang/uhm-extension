const vscode = require('vscode');

const commands = [
    'Info', 'NumFrames', 'Seed', 'Wave', 'Spectrum',
    'Phase', 'Import', 'Export', 'Move', 'Interpolate',
    'Normalize', 'Envelope'
]
const commands_set = new Set(commands.map(x => x.toLowerCase()))

function detectState(document, position) {
    const text = document.lineAt(position).text.toLowerCase()
    if (!text.trim().length)
        return {cmd: '', prefix: ''}

    const range_text_lst = text.slice(0, position.character).trim().split(/\s+/g)
    const first_token = range_text_lst[0]
    const last_token = range_text_lst[range_text_lst.length - 1]
    
    const cmd = commands_set.has(first_token) ? first_token : ''

    const last_char = text[position.character - 1]
    const in_quote = text.slice(0, position.character).match('"')

    if (in_quote) {
        return {in_quote: true}
    }

    if (last_char == '=') {
        return {cmd, prefix: last_token}
    } else {
        return {cmd, prefix: ''}
    }
}

function tokenList(tokens, kind = vscode.CompletionItemKind.Method) {
    return tokens.map(x => {
        const item = new vscode.CompletionItem(x, kind)
        item.detail = doc_mapping[x.toLowerCase()]
        return item
    }) 
}

const doc_mapping = {
    'info': 'This message will appear in the wavetable info field',
    'numframes': 'Sets the number of frames in the wavetable. Defaults to 256.',
    'seed': 'This command assures variation between random values in multiple scripts. Each script retains the same sequence of values so that the oscillator will sound the same every time it is loaded.',
    'wave': 'Runs the parser on the wavetable.',
    'start': 'Start=N, where N is the first frame to process. Defaults to 0.',
    'end': 'End=N, where N is the last frame to process. Defaults to NumFrames',
    'blend': 'Blend=X, where X is a waveform blend mode (replace, add, multiply...). Defaults to replace.',
    'direction': 'Direction=X, where X is forward or backward. Direction samples are processed. Defaults to forward.',
    'target': 'Target=X, where X is main, aux1 or aux2, defining the target buffer.',
    'spectrum': 'Runs the parser on the spectrum (magnitudes) of the wavetable.',
    'lowest': 'Lowest=N, where N is the lowest partial to process. Defaults to 1, but can also be set to 0 (DC)',
    'highest': 'Highest=N, where N is the highest partial to process. Defaults to 1024.',
    'phase': 'Runs the parser on the spectrum (phase information) of the wavetable.',
    'import': 'Loads a .wav or.uhm file and writes/blends it (or a portion thereof) into the target wavetable. The source file must be in the same directory as the script.',
    'from': 'From=N, where N is the first frame in the target buffer which the extracted frames are written to. Defaults to 0.',
    'export': 'Saves the main, aux1 or aux2 buffer as a .wav file into the same directory as the script.',
    'source': 'Source=X, where X is main, aux1 or aux2, defining the target buffer. The default is main.',
    'move': 'Copies frames within a wavetable.',
    'to': 'To=N, where N is the first frame to be overwritten. Required.',
    'interpolate': 'Interpolates between frames within a wavetable. Details of the “morph” types and the last 3 options here will be explained at a later date.',
    'type': 'Type=X, where X is an interpolator type (switch, crossfade, spectrum, zerophase, morph1, morph2). Defaults to crossfade.',
    'snippets': 'Snippets=X (1-500) maximum number of fragments to be morphed (Morph1/2 only).',
    'threshold': 'Threshold=X (-120 - 0) threshold for identifying snippets (Morph1/2 only)',
    'weighting': 'Weighting=X where X is none, distance, level or both (Morph1/2 only)',
    'normalize': 'Normalizes frames within a wavetable.',
    'metric': 'Metric=X, where X is “RMS", “Peak”, “Average” or “Ptp” (peak to peak). Defaults to RMS.',
    'db': 'dB=M, where M is a value in dB (typically 0dB for Peak). Defaults to 0.00.',
    'base': 'Base=X, where X is "All" or “Each" (individual frames are normalized). Defaults to Each.',
    'envelope': 'Creates an envelope with up to 8 segments to be used within the formula parser. Using "env(frame)" within a formula gives us an envelope value based on frames. Using "env(index)" gives us an envelope based on samples.',
    'curve': 'Curve=X, where x is "linear", “exponential”, logarithmic or “quadric”: curvature of each segment',
    't1': 'Where 1 are integer time values, typically mapped to indices',
    'l0': 'Where 0 are floating point levels, typically from 0.0 to 1.0',
    'acos(x)': 'arccosine',
    'asin(x)': 'arcsine',
    'atan(x)': 'arctangent',
    'atan2(x,y)': 'arctangent2',
    'cos(x)': 'cosine',
    'cosh(x)': 'hyperbolic cosine',
    'sin(x)': 'sine',
    'sinh(x)': 'hyperbolic sine',
    'tan(x) ': 'tangent',
    'tanh(x)': 'hyperbolic tangent',
    'abs(x)': 'absolute (positive) value of x',
    'ceil(x)': 'round up to next integer value',
    'floor(x)': 'round down to next integer value',
    'frac(x)': 'fractional part only',
    'round(x)': 'to nearest integer (up or down)',
    'select(x,y,z)': '"if" x==1.0 ? y : z',
    'exp(x)': 'exponent (e^x)',
    'fac(x)': 'faculty (x!)',
    'ln(x)': 'natural logarithm',
    'log(x)': 'natural logarithm',
    'log10(x)': 'log base 10',
    'pow(x,y)': 'exponent (x^y)',
    'sqrt(x)': 'square root',
    'lin_db(x)': 'convert linear value to dB',
    'db_lin(x)': 'convert dB to linear value',
    'env(x)': 'where x is the time position/index of the 8-segment envelope (see Envelope above). The result is the envelope level at that time position/index',
    'lowpass(x, cutoff, resonance)': 'where x is the sample and cutoff / reso are values between 0 and 1',
    'bandpass(x, cutoff, resonance)': 'where x is the sample and cutoff / reso are values between 0 and 1',
    'highpass(x, cutoff, resonance)': 'where x is the sample and cutoff / reso are values between 0 and 1',
    'main_fi(frame, index)': 'the sample at index (0-2047) of frame (0-255) in the main buffer',
    'main_fp(frame, phase)': 'the sample at phase (0-1) of frame (0-255) in the main buffer',
    'e': '2.71828182845904523536',
    'pi': '3.14159265358979323846',
    'x': ' Current sample/magnitude/phase in wavetable of current target buffer',
    'y': 'Previous result of the expression parser',
    'frame': 'Current frame',
    'table': 'Current frame, normalized to the current process loop (0-1)',
    'index': 'Current sample index within the frame',
    'phase': 'Current sample, normalized to one waveform cycle (0-1, index/2048)',
    'main': 'Like x/input, but from the main buffer',
    'aux1': 'Like x/input, but from the aux1 buffer',
    'aux2': 'Like x/input, but from the aux2 buffer',
    'rand': 'A random value for each operation',
    'randf': 'A random value for the current frame (remains the same for all samples)',
    'rands': 'A random value for the current sample (remains the same for all frames)',
    'replace': 'source replaces target',
    'add': 'source is added to target',
    'sub': 'source is subtracted from',
    'multiply': 'target is multiplied with source',
    'multiplyabs': '(x + fabs(y))',
    'divide': 'sign(x*y)*(1-fabs(x))*(1-fabs(y))',
    'divideabs': 'sign(x)*(1-fabs(x))*(1-fabs(y))',
    'min': 'minimum, the smaller absolute value',
    'max': 'maximum, the larger absolute value (good for emulating formants when used with Spectrum)'
}

const command_words = tokenList(commands, vscode.CompletionItemKind.Module)
const fn_words = tokenList([
    'acos(x)', 'asin(x)', 'atan(x)', 'atan2(x,y)', 'cos(x)', 'cosh(x)',
    'sin(x)', 'sinh(x)', 'tan(x)', 'tanh(x)', 'abs(x)', 'ceil(x)',
    'floor(x)', 'frac(x)', 'round(x)', 'select(x,y,z)',
    'exp(x)', 'fac(x)', 'ln(x)', 'log(x)', 'log10(x) ', 'pow(x,y)', 'sqrt(x)', 'lin_db(x)', 'db_lin(x)',
    'env(x)', 'lowpass(x, cutoff, resonance)', 'bandpass(x, cutoff, resonance)', 'highpass(x, cutoff, resonance)',
    'main_fi(frame, index)', 'main_fp(frame, phase)', 'aux1_fi(index)', 'aux1_fp(phase)', 'aux2_fi(index)', 'aux2_fp(phase)'
])
const var_words = tokenList([
    'e', 'pi', 'x', 'y', 'frame', 'table', 'index',
    'phase', 'rand', 'randf', 'rands', 'main', 'aux1', 'aux2'
], vscode.CompletionItemKind.Variable)

const cmd_mapping = {
    wave: tokenList(['start', 'end', 'blend', 'direction', 'target'], vscode.CompletionItemKind.Property),
    spectrum: tokenList(['start', 'end', 'lowest', 'highest', 'blend', 'direction', 'target'], vscode.CompletionItemKind.Property),
    phase: tokenList(['start', 'end', 'lowest', 'highest', 'blend', 'direction', 'target'], vscode.CompletionItemKind.Property),
    import: tokenList(['start', 'end', 'blend', 'from', 'target'], vscode.CompletionItemKind.Property),
    export: tokenList(['source'], vscode.CompletionItemKind.Property),
    move: tokenList(['start', 'end', 'to', 'blend', 'target'], vscode.CompletionItemKind.Property),
    interpolate: tokenList(['start','end','type','target','snippets','threshold','weighting'], vscode.CompletionItemKind.Property),
    normalize: tokenList(['start','end','metric','db','base','target'], vscode.CompletionItemKind.Property),
    envelope: tokenList(['curve','T1','T2','T3','T4','T5','T6','T7','T8','L0','L1','L2','L3','L4','L5','L6','L7','L8'], vscode.CompletionItemKind.Property)
}
const attr_mapping = {
    'type=': tokenList(['crossfade', 'switch', 'spectrum', 'zerophase', 'morph1', 'morph2']),
    'source=': tokenList(['main', 'aux1', 'aux2']),
    'blend=': tokenList(['replace', 'add', 'sub', 'multiply', 'multiplyAbs', 'divide', 'divideAbs', 'min', 'max']),
    'target=': tokenList(['main', 'aux1', 'aux2']),
    'direction=': tokenList(['forward', 'backward']),
    'metric=': tokenList(['RMS', 'Peak', 'Average', 'Ptp']),
    'base=': tokenList(['each', 'all']),
    'weighting=': tokenList(['none', 'distance', 'level', 'both']),
    'curve=': tokenList(['linear', 'exponential', 'logarithmic', 'quadric'])
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let completion_provider = vscode.languages.registerCompletionItemProvider('uhm', {
        provideCompletionItems(document, position, token, context) {
            const state = detectState(document, position)

            if (state.in_quote)
                return var_words.concat(fn_words)

            if (state.prefix)
                return attr_mapping[state.prefix]

            if (state.cmd)
                return cmd_mapping[state.cmd]
            
            return command_words
        }
    }, '=', ' ')


    let hover_provider = vscode.languages.registerHoverProvider('uhm', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position)
            const word = document.lineAt(position).text.slice(range.start.character, range.end.character)

            return {
                contents: [doc_mapping[word.toLowerCase()]]
            }
        }
    })

    context.subscriptions.push(completion_provider, hover_provider)
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
