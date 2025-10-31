import {
  logger,
  consoleTransport,
  fileAsyncTransport,
} from "react-native-logs";
import * as FileSystem from "expo-file-system/legacy";

const LOG = logger.createLogger({
  transport: __DEV__ ? consoleTransport : fileAsyncTransport,
  severity: __DEV__ ? "debug" : "error",
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
    FS: FileSystem,
  },
  enabledExtensions: ["VISITS"],
});

const VISITS_LOG = LOG.extend("VISITS");

export { LOG, VISITS_LOG };
