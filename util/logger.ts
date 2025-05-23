import {
  logger,
  consoleTransport,
  fileAsyncTransport,
} from "react-native-logs";
import * as FileSystem from "expo-file-system";

const LOG = logger.createLogger({
  transport: __DEV__ ? consoleTransport : fileAsyncTransport,
  severity: __DEV__ ? "debug" : "error",
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
    // @ts-expect-error https://github.com/mowispace/react-native-logs/issues/112
    FS: FileSystem,
  },
  enabledExtensions: ["VISITS"],
});

const VISITS_LOG = LOG.extend("VISITS");

export { VISITS_LOG };
