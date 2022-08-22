import {
  handleCors,
  handleBodyRequestParsing,
  handleCompression
} from "./common";

import { handleAPIDocs } from "./apiDocs";
import { handleBullBoard } from "./bullBoard";

export default [
  handleCors,
  handleBodyRequestParsing,
  handleCompression,
  handleAPIDocs,
  handleBullBoard
];
