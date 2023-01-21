import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';
import externalGlobals from 'rollup-plugin-external-globals';
import resolve from '@rollup/plugin-node-resolve';


const extensions = ['.ts'];

const globalsMap = {
    backbone: 'Backbone',
    Backbone: 'Backbone',
    underscore: '_',
};


export default [
    {
        input: './src/index.ts',
        output: [
            {
                file: `lib/index.js`,
                format: 'umd',
                name: 'Spina',
                esModule: false,
                exports: 'named',
                sourcemap: true,
            },
            {
                dir: 'lib/esm',
                format: 'esm',
                exports: 'named',
                sourcemap: true,
                globals: globalsMap,
            },
            {
                dir: 'lib/cjs',
                format: 'cjs',
                exports: 'named',
                sourcemap: true,
                globals: globalsMap,
            },
        ],
        plugins: [
            babel({
                babelHelpers: 'bundled',
                extensions: extensions,
            }),
            copy({
                targets: [
                    {
                        src: 'src/@types',
                        dest: 'lib',
                    },
                ],
            }),
            externalGlobals(id => {
                return globalsMap[id];
            }),
            resolve({
                extensions: extensions,
                modulePaths: [],
            }),
        ],
    },
    {
        input: './_build/dts/index.d.ts',
        output: [
            {
                file: 'lib/index.d.ts',
                format: 'es',
            },
        ],
        plugins: [
            dts.default(),
        ],
    },
];
