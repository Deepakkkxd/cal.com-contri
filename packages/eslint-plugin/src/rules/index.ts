/* eslint-disable @typescript-eslint/no-var-requires*/
import type { ESLint } from "eslint";

export default {
  "deprecated-imports": require("./deprecated-imports").default,
  "avoid-web-storage": require("./avoid-web-storage").default,
  "avoid-prisma-client-import-for-enums": require("./avoid-prisma-client-import-for-enums").default,
  "no-prisma-include-true": require("./no-prisma-include-true").default,
} as ESLint.Plugin["rules"];
