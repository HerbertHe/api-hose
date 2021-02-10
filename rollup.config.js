import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"

const extensions = [".js", ".ts"]

export default {
    input: "./src/index.ts",
    external: [],

    plugins: [
        resolve({ extensions }),

        commonjs(),

        babel({ extensions, include: ["src/**/*"], babelHelpers: "runtime" }),
    ],

    output: {
        file: "dist/index.js",
        format: "cjs",
    },
}
