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
    FS: FileSystem,
  },
  enabledExtensions: ["CACHE", "VISITS"],
});

const CACHE_LOG = LOG.extend("CACHE");
const VISITS_LOG = LOG.extend("VISITS");

export { CACHE_LOG, LOG, VISITS_LOG };
