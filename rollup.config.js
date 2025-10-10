import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';


const extensions = ['.ts'];

const globalsMap = {
    backbone: 'Backbone',
    underscore: '_',
};


export default [
    {
        external: [
            'backbone',
            'underscore',
        ],
        input: './src/index.ts',
        output: [
            {
                esModule: false,
                exports: 'named',
                file: 'lib/index.js',
                format: 'umd',
                globals: globalsMap,
                name: 'Spina',
                sourcemap: true,
            },
            {
                dir: 'lib/esm',
                exports: 'named',
                format: 'esm',
                globals: globalsMap,
                sourcemap: true,
            },
            {
                dir: 'lib/cjs',
                exports: 'named',
                format: 'cjs',
                globals: globalsMap,
                sourcemap: true,
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
                        dest: 'lib',
                        src: 'src/@types',
                    },
                ],
            }),
            copy({
                targets: [
                    {
                        dest: 'lib/esm',
                        src: 'src/index-all.js',
                    },
                ],
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
            {
                file: 'lib/index.d.mts',
                format: 'es',
            },
        ],
        plugins: [
            dts.default(),
        ],
    },
];
