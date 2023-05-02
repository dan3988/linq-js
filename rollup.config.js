import typescript from "rollup-plugin-typescript2";
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

/** @type {import("rollup").RollupOptions[]} */
const configs = [
	{
		input: "src/index.ts",
		output: [
			{
				banner: '/// <reference path="./types/index.d.ts" />',
				sourcemap: true,
				format: "es",
				file: "lib/index.mjs",
			},
			{
				minifyInternalExports: true,
				sourcemap: true,
				name: "linq-js",
				format: "umd",
				exports: "named",
				file: "lib/index.cjs",
				amd: {
					id: "linq-js"
				}
			}
		],
		plugins: [
			typescript({
				tsconfig: "tsconfig.json",
				useTsconfigDeclarationDir: true
			}),
			production && terser()
		],
	},
	{
		input: "mocha/main.ts",
		output: {
			sourcemap: true,
			format: "es",
			dir: "lib-mocha",
		},
		external: [
			"assert",
			"fs",
			"crypto"
		],
		plugins: [
			typescript({
				tsconfig: "tsconfig-mocha.json"
			}),
		]
	}
];

if (!production) {
	configs.push({
		input: "test/main.ts",
		output: {
			sourcemap: true,
			format: "es",
			dir: "lib-test",
		},
		plugins: [
			typescript({
				tsconfig: "tsconfig-mocha.json"
			}),
		]
	})
}

export default configs;