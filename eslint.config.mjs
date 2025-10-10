/**
 * ESLint configuration.
 *
 * Version Added:
 *     3.1.2
 */

import beanbag from '@beanbag/eslint-plugin';
import {
    defineConfig,
    globalIgnores,
} from 'eslint/config';
import globals from 'globals';


export default defineConfig([
    globalIgnores([
        'src/@types/**/*',
    ]),
    beanbag.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...beanbag.globals.backbone,
                ...globals.browser,
                ...globals.jquery,
                Spina: 'writable',
            },
            sourceType: 'module',
        },
        plugins: {
            '@beanbag': beanbag,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]);
