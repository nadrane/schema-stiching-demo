"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  GQC: true,
  schemaComposer: true,
  TypeComposer: true,
  InputTypeComposer: true,
  EnumTypeComposer: true,
  InterfaceTypeComposer: true,
  Resolver: true,
  TypeMapper: true,
  graphql: true,
  SchemaComposer: true,
  TypeComposerClass: true,
  InputTypeComposerClass: true,
  EnumTypeComposerClass: true,
  InterfaceTypeComposerClass: true,
  ResolverClass: true,
  TypeStorage: true,
  GraphQLDate: true,
  GraphQLBuffer: true,
  GraphQLGeneric: true,
  GraphQLJSON: true,
  getProjectionFromAST: true,
  getFlatProjectionFromAST: true,
  toInputObjectType: true,
  convertInputObjectField: true,
  toDottedObject: true,
  deepmerge: true,
  filterByDotPaths: true
};
Object.defineProperty(exports, "SchemaComposer", {
  enumerable: true,
  get: function get() {
    return _SchemaComposer.SchemaComposer;
  }
});
Object.defineProperty(exports, "TypeComposerClass", {
  enumerable: true,
  get: function get() {
    return _TypeComposer.TypeComposer;
  }
});
Object.defineProperty(exports, "InputTypeComposerClass", {
  enumerable: true,
  get: function get() {
    return _InputTypeComposer.InputTypeComposer;
  }
});
Object.defineProperty(exports, "EnumTypeComposerClass", {
  enumerable: true,
  get: function get() {
    return _EnumTypeComposer.EnumTypeComposer;
  }
});
Object.defineProperty(exports, "InterfaceTypeComposerClass", {
  enumerable: true,
  get: function get() {
    return _InterfaceTypeComposer.InterfaceTypeComposer;
  }
});
Object.defineProperty(exports, "ResolverClass", {
  enumerable: true,
  get: function get() {
    return _Resolver.Resolver;
  }
});
Object.defineProperty(exports, "TypeStorage", {
  enumerable: true,
  get: function get() {
    return _TypeStorage.TypeStorage;
  }
});
Object.defineProperty(exports, "GraphQLDate", {
  enumerable: true,
  get: function get() {
    return _type.GraphQLDate;
  }
});
Object.defineProperty(exports, "GraphQLBuffer", {
  enumerable: true,
  get: function get() {
    return _type.GraphQLBuffer;
  }
});
Object.defineProperty(exports, "GraphQLGeneric", {
  enumerable: true,
  get: function get() {
    return _type.GraphQLGeneric;
  }
});
Object.defineProperty(exports, "GraphQLJSON", {
  enumerable: true,
  get: function get() {
    return _type.GraphQLJSON;
  }
});
Object.defineProperty(exports, "getProjectionFromAST", {
  enumerable: true,
  get: function get() {
    return _projection.getProjectionFromAST;
  }
});
Object.defineProperty(exports, "getFlatProjectionFromAST", {
  enumerable: true,
  get: function get() {
    return _projection.getFlatProjectionFromAST;
  }
});
Object.defineProperty(exports, "toInputObjectType", {
  enumerable: true,
  get: function get() {
    return _toInputObjectType.toInputObjectType;
  }
});
Object.defineProperty(exports, "convertInputObjectField", {
  enumerable: true,
  get: function get() {
    return _toInputObjectType.convertInputObjectField;
  }
});
Object.defineProperty(exports, "toDottedObject", {
  enumerable: true,
  get: function get() {
    return _toDottedObject.default;
  }
});
Object.defineProperty(exports, "deepmerge", {
  enumerable: true,
  get: function get() {
    return _deepmerge.default;
  }
});
Object.defineProperty(exports, "filterByDotPaths", {
  enumerable: true,
  get: function get() {
    return _filterByDotPaths.default;
  }
});
exports.graphql = exports.TypeMapper = exports.Resolver = exports.InterfaceTypeComposer = exports.EnumTypeComposer = exports.InputTypeComposer = exports.TypeComposer = exports.schemaComposer = exports.GQC = void 0;

var graphql = _interopRequireWildcard(require("./graphql"));

exports.graphql = graphql;

var _SchemaComposer = require("./SchemaComposer");

var _TypeComposer = require("./TypeComposer");

var _InputTypeComposer = require("./InputTypeComposer");

var _EnumTypeComposer = require("./EnumTypeComposer");

var _InterfaceTypeComposer = require("./InterfaceTypeComposer");

var _Resolver = require("./Resolver");

var _TypeStorage = require("./TypeStorage");

var _type = require("./type");

var _projection = require("./utils/projection");

var _toInputObjectType = require("./utils/toInputObjectType");

var _misc = require("./utils/misc");

Object.keys(_misc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _misc[key];
    }
  });
});

var _is = require("./utils/is");

Object.keys(_is).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _is[key];
    }
  });
});

var _graphqlVersion = require("./utils/graphqlVersion");

Object.keys(_graphqlVersion).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _graphqlVersion[key];
    }
  });
});

var _toDottedObject = _interopRequireDefault(require("./utils/toDottedObject"));

var _deepmerge = _interopRequireDefault(require("./utils/deepmerge"));

var _filterByDotPaths = _interopRequireDefault(require("./utils/filterByDotPaths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/*  strict */
const schemaComposer = new _SchemaComposer.SchemaComposer();
exports.schemaComposer = schemaComposer;
const GQC = schemaComposer;
exports.GQC = GQC;
const TypeComposer = schemaComposer.TypeComposer;
exports.TypeComposer = TypeComposer;
const InputTypeComposer = schemaComposer.InputTypeComposer;
exports.InputTypeComposer = InputTypeComposer;
const EnumTypeComposer = schemaComposer.EnumTypeComposer;
exports.EnumTypeComposer = EnumTypeComposer;
const InterfaceTypeComposer = schemaComposer.InterfaceTypeComposer;
exports.InterfaceTypeComposer = InterfaceTypeComposer;
const Resolver = schemaComposer.Resolver;
exports.Resolver = Resolver;
const TypeMapper = schemaComposer.typeMapper;
exports.TypeMapper = TypeMapper;