import { defineConfig } from 'eslint/config';
import eslintConfigInclusiveDesign from '@inclusive-design/eslint-config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
	{
		extends: [eslintConfigInclusiveDesign],
		plugins: {
			'@stylistic': stylistic,
		},
		rules: {
			'@stylistic/arrow-parens': ['error', 'always'],
			'@stylistic/object-curly-spacing': ['error', 'always'],
		},
	},
]);
