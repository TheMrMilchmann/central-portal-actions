import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        clearMocks: true,
        environment: 'node',
        typecheck: {
            tsconfig: './tsconfig.test.json',
        },
    },
});
