import externals from "rollup-plugin-node-externals";

export default {
  // ...
  plugins: [
    externals(), // Bundle deps in; make all Node builtins, devDeps, peerDeps and optDeps external
  ],
};
