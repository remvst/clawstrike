import { EVALUATE, NOMANGLE, assembleHtml, hardcodeConstants, macro, mangle } from "@remvst/js13k-tools";
import CleanCSS from 'clean-css';
import { promises as fs } from 'fs';
import { minify as minifyHTML } from 'html-minifier';
import { Packer } from 'roadroller';
import * as terser from 'terser';
import yargs from 'yargs/yargs';

const JS_FILES = [
    'globals.js',

    'input/keyboard.js',
    'input/touch.js',

    'utils/math.js',
    'utils/easing.js',
    'utils/resizer.js',
    'utils/raycasting.js',
    'utils/rect.js',
    'utils/first-item.js',
    'utils/pick.js',
    'utils/shuffle.js',

    'graphics/wrap.js',
    'graphics/create-canvas.js',

    'entity/entity.js',
    'entity/human.js',
    'entity/bullet.js',
    'entity/claw-effect.js',
    'entity/flash.js',
    'entity/cat.js',
    'entity/structure.js',
    'entity/physical-particle.js',
    'entity/camera.js',
    'entity/hud.js',
    'entity/spikes.js',
    'entity/label.js',
    'entity/interpolator.js',

    'screen/screen.js',
    'screen/gameplay-screen.js',
    'screen/main-menu-screen.js',
    'screen/pause-screen.js',
    'screen/game-over-screen.js',

    'level/matrix.js',
    'level/serialization.js',

    'sound/sonantx.js',
    'sound/ZzFXMicro.js',
    'sound/song.js',

    'world.js',
    'game.js',
    'main.js',
];

const CONSTANTS = {
    "true": 1,
    "false": 0,
    "const": "let",
    "null": 0,

    "CELL_SIZE": 50,

    "INPUT_MODE_KEYBOARD": 0,
    "INPUT_MODE_TOUCH": 1,

    "MOBILE_BUTTON_SIZE": 50,

    "SONG_VOLUME": 0.5,

    "DEBUG_INFO": 0,
    "DEBUG_HITBOXES": 0,
    "DEBUG_JUMP": 0,
    "DEBUG_VISION": 0,
};

const MANGLE_PARAMS = {
    "skip": [
        "repeat",
    ],
    "force": [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "alpha",
        "background",
        "direction",
        "ended",
        "key",
        "level",
        "maxDistance",
        "remove",
        "speed",
        "item",
        "center",
        "wrap",
        "angle",
        "target",
        "path",
        "step",
        "color",
        "expand",
        "label",
        "action",
        "normalize",
        "duration",
        "message",
        "name",
        "ratio",
        "index",
        "controls",
        "attack",
        "end",
        "description",
        "resolve",
        "reject",
        "category",
        "update",
        "error",
        "endTime",
        "aggressivity",
        "radiusX",
        "radiusY",
        "state",
        "rotation",
        "contains",
        "zoom",
        "object",
        "entity",
        "Entity",
        "entities",
        "timeout",
        "frame",
        "line",
        "elements",
        "text",
        "source",
        "frequency",
    ]
};

const argv = yargs(process.argv.slice(2)).options({
    debug: { type: 'boolean', default: false },
    mangle: { type: 'boolean', default: false },
    minify: { type: 'boolean', default: false },
    'roadroll-level': { type: 'number', default: 0 },
    pack: { type: 'boolean', default: false },
    html: { type: 'string', demandOption: true },
}).parse();

(async () => {
    const constants = {
        DEBUG: argv.debug,
        ...CONSTANTS,
    };

    let html = await fs.readFile('src/index.html', 'utf-8');
    let css = await fs.readFile('src/style.css', 'utf-8');

    const jsFiles = [...JS_FILES];

    // Add the level editor if needed
    if (constants.DEBUG) {
        jsFiles.push('screen/level-editor-screen.js');
    }

    let js = (await Promise.all(
        jsFiles.map(path => fs.readFile('src/' + path, 'utf-8')))
    ).join('\n');

    js += 'ALL_LEVELS = [';

    for (const path of [
        // 'level/levels/blank.js',
        'level/levels/tutorial-v2.js',
        'level/levels/tutorial-wall-jump.js',
        'level/levels/tutorial-roll.js',
        'level/levels/first-level.js',
        'level/levels/second-level.js',
        'level/levels/medium.js',
        'level/levels/medium.js',
        'level/levels/medium.js',
        'level/levels/medium.js',
        'level/levels/medium.js',
        'level/levels/medium.js',
        'level/levels/medium.js',
        'level/levels/medium.js',
        'level/levels/stuff.js',
        'level/levels/green.js',
    ]) {
        js += await fs.readFile('src/' + path, 'utf-8') + ',';
    }

    js += '];';

    js = hardcodeConstants(js, constants);
    js = macro(js, NOMANGLE);
    js = macro(js, EVALUATE);

    if (argv.mangle) {
        console.log('Mangling...');
        js = mangle(js, MANGLE_PARAMS);
    }

    if (argv.minify) {
        console.log('Minifying...');
        js = (await terser.minify(js, {
            mangle: {
                properties: false,
                toplevel: true,
            }
        })).code!;
    }

    if (argv['roadroll-level'] > 0) {
        console.log('Roadrolling (level ' + argv['roadroll-level'] + ')...');
        const packer = new Packer([
            {
                data: js,
                type: 'js',
                action: 'eval',
            },
        ], {
            // see the Usage for available options.
        });
        await packer.optimize(argv['roadroll-level']);
        const { firstLine, secondLine } = packer.makeDecoder();
        js = firstLine + secondLine;
    }

    if (argv.minify) {
        html = minifyHTML(html, {
            collapseWhitespace: true,
            minifyCSS: false,
            minifyJS: false
        });

        css = new CleanCSS().minify(css).styles;
    }

    const finalHtml = assembleHtml({ html, css, js });

    await fs.mkdir('build/', { recursive: true });
    await fs.writeFile(argv.html, finalHtml);
})();
