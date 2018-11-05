"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGraphQLType = getGraphQLType;

var _graphql = require("../graphql");

var _is = require("./is");

var _misc = require("./misc");

function getGraphQLType(anyType) {
  let type = anyType; // extract type from TypeComposer, InputTypeComposer, EnumTypeComposer and Resolver

  if (type && (0, _is.isFunction)(type.getType)) {
    type = type.getType();
  }

  if (!(0, _graphql.isType)(type)) {
    throw new Error(`You provide incorrect type for 'getGraphQLType' method: ${(0, _misc.inspect)(type)}`);
  }

  return type;
}