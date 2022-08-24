import {
  handleCors,
  handleBodyRequestParsing,
  handleCompression
} from "./common";

import { handleAPIDocs } from "./apidocs";
//import { handleBullBoard } from "./bulldashboard";

export default [
  handleCors,
  handleBodyRequestParsing,
  handleCompression,
  handleAPIDocs
  //handleBullBoard
];
