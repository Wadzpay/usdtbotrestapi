var env = require('../config/env.json');

export const envConfig = () =>{
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};