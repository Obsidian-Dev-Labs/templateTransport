import { build } from "esbuild";
import { umdWrapper } from "esbuild-plugin-umd-wrapper";

const umdWrapperOptions = {
	libraryName: "TransportTemplate",
	external: "inherit",
	amdLoaderName: "define"
};

const makeAllPackagesExternalPlugin = {
	name: 'make-all-packages-external',
	setup(build) {
		let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/
		build.onResolve({ filter }, args => ({ path: args.path, external: true }))
	},
};

build({
	bundle: true,
	format: "esm",
	entryPoints: [`./src/index.ts`],
	outfile: `./dist/index.mjs`,
	plugins: [makeAllPackagesExternalPlugin],
	external: ["fs", "path", "ws"],
	logLevel: "info",
}).catch(() => process.exit(1));

build({
	bundle: true,
	format: "cjs",
	entryPoints: [`./src/index.ts`],
	outfile: `./dist/index.js`,
	plugins: [makeAllPackagesExternalPlugin, umdWrapper(umdWrapperOptions)],
	external: ["fs", "path", "ws"],
	logLevel: "info",
}).catch(() => process.exit(1));
