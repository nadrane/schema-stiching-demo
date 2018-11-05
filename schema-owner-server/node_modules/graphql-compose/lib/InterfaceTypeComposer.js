"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InterfaceTypeComposer = void 0;

var _graphql = require("./graphql");

var _is = require("./utils/is");

var _misc = require("./utils/misc");

var _TypeComposer = require("./TypeComposer");

var _configAsThunk = require("./utils/configAsThunk");

var _typeByPath = require("./utils/typeByPath");

var _typeHelpers = require("./utils/typeHelpers");

var _configToDefine = require("./utils/configToDefine");

var _graphqlVersion = require("./utils/graphqlVersion");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class InterfaceTypeComposer {
  get schemaComposer() {
    return this.constructor.schemaComposer;
  } // Also supported `GraphQLInterfaceType` but in such case Flowtype force developers
  // to explicitly write annotations in their code. But it's bad.


  static create(opts) {
    const iftc = this.createTemp(opts);
    this.schemaComposer.add(iftc);
    return iftc;
  }

  static createTemp(opts) {
    if (!this.schemaComposer) {
      throw new Error('Class<InterfaceTypeComposer> must be created by a SchemaComposer.');
    }

    let IFTC;

    if ((0, _is.isString)(opts)) {
      const typeName = opts;
      const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

      if (NAME_RX.test(typeName)) {
        IFTC = new this.schemaComposer.InterfaceTypeComposer(new _graphql.GraphQLInterfaceType({
          name: typeName,
          fields: () => ({})
        }));
      } else {
        const type = this.schemaComposer.typeMapper.createType(typeName);

        if (!(type instanceof _graphql.GraphQLInterfaceType)) {
          throw new Error('You should provide correct GraphQLInterfaceType type definition.' + 'Eg. `interface MyType { id: ID!, name: String! }`');
        }

        IFTC = new this.schemaComposer.InterfaceTypeComposer(type);
      }
    } else if (opts instanceof _graphql.GraphQLInterfaceType) {
      IFTC = new this.schemaComposer.InterfaceTypeComposer(opts);
    } else if ((0, _is.isObject)(opts)) {
      const fields = opts.fields;
      const type = new _graphql.GraphQLInterfaceType(_objectSpread({}, opts, {
        fields: (0, _is.isFunction)(fields) ? () => (0, _configAsThunk.resolveOutputConfigMapAsThunk)(this.schemaComposer, fields(), opts.name) : () => ({})
      }));
      IFTC = new this.schemaComposer.InterfaceTypeComposer(type);
      if ((0, _is.isObject)(opts.fields)) IFTC.addFields(opts.fields);
    } else {
      throw new Error('You should provide GraphQLInterfaceTypeConfig or string with enum name or SDL');
    }

    return IFTC;
  }

  constructor(gqType) {
    if (!this.schemaComposer) {
      throw new Error('Class<InterfaceTypeComposer> can only be created by a SchemaComposer.');
    }

    if (!(gqType instanceof _graphql.GraphQLInterfaceType)) {
      throw new Error('InterfaceTypeComposer accept only GraphQLInterfaceType in constructor');
    }

    this.gqType = gqType;
  } // -----------------------------------------------
  // Field methods
  // -----------------------------------------------


  hasField(name) {
    const fields = this.getFields();
    return !!fields[name];
  }

  getFields() {
    if (!this.gqType._gqcFields) {
      if (_graphqlVersion.graphqlVersion >= 14) {
        this.gqType._gqcFields = (0, _configToDefine.defineFieldMapToConfig)(this.gqType._fields);
      } else {
        // $FlowFixMe
        const fields = this.gqType._typeConfig.fields;
        this.gqType._gqcFields = (0, _misc.resolveMaybeThunk)(fields) || {};
      }
    }

    return this.gqType._gqcFields;
  }

  getField(name) {
    const values = this.getFields();

    if (!values[name]) {
      throw new Error(`Cannot get field '${name}' from interface type '${this.getTypeName()}'. Field does not exist.`);
    }

    return values[name];
  }

  getFieldNames() {
    return Object.keys(this.getFields());
  }

  setFields(fields) {
    this.gqType._gqcFields = fields;

    if (_graphqlVersion.graphqlVersion >= 14) {
      this.gqType._fields = () => {
        return (0, _configToDefine.defineFieldMap)(this.gqType, (0, _configAsThunk.resolveOutputConfigMapAsThunk)(this.schemaComposer, fields, this.getTypeName()));
      };
    } else {
      // $FlowFixMe
      this.gqType._typeConfig.fields = () => {
        return (0, _configAsThunk.resolveOutputConfigMapAsThunk)(this.schemaComposer, fields, this.getTypeName());
      };

      delete this.gqType._fields; // clear builded fields in type
    }

    return this;
  }

  setField(name, fieldConfig) {
    this.addFields({
      [name]: fieldConfig
    });
    return this;
  }
  /**
   * Add new fields or replace existed in a GraphQL type
   */


  addFields(newValues) {
    this.setFields(_objectSpread({}, this.getFields(), newValues));
    return this;
  }

  removeField(nameOrArray) {
    const fieldNames = Array.isArray(nameOrArray) ? nameOrArray : [nameOrArray];
    const values = this.getFields();
    fieldNames.forEach(valueName => delete values[valueName]);
    this.setFields(_objectSpread({}, values));
    return this;
  }

  removeOtherFields(fieldNameOrArray) {
    const keepFieldNames = Array.isArray(fieldNameOrArray) ? fieldNameOrArray : [fieldNameOrArray];
    const fields = this.getFields();
    Object.keys(fields).forEach(fieldName => {
      if (keepFieldNames.indexOf(fieldName) === -1) {
        delete fields[fieldName];
      }
    });
    this.setFields(fields);
    return this;
  }

  reorderFields(names) {
    const orderedFields = {};
    const fields = this.getFields();
    names.forEach(name => {
      if (fields[name]) {
        orderedFields[name] = fields[name];
        delete fields[name];
      }
    });
    this.setFields(_objectSpread({}, orderedFields, fields));
    return this;
  }

  extendField(fieldName, parialFieldConfig) {
    let prevFieldConfig;

    try {
      prevFieldConfig = this.getFieldConfig(fieldName);
    } catch (e) {
      throw new Error(`Cannot extend field '${fieldName}' from type '${this.getTypeName()}'. Field does not exist.`);
    }

    this.setField(fieldName, _objectSpread({}, prevFieldConfig, parialFieldConfig));
    return this;
  }

  isFieldNonNull(fieldName) {
    return this.getFieldType(fieldName) instanceof _graphql.GraphQLNonNull;
  }

  getFieldConfig(fieldName) {
    const fc = this.getField(fieldName);

    if (!fc) {
      throw new Error(`Type ${this.getTypeName()} does not have field with name '${fieldName}'`);
    }

    return (0, _configAsThunk.resolveOutputConfigAsThunk)(this.schemaComposer, fc, fieldName, this.getTypeName());
  }

  getFieldType(fieldName) {
    return this.getFieldConfig(fieldName).type;
  }

  getFieldTC(fieldName) {
    const fieldType = (0, _graphql.getNamedType)(this.getFieldType(fieldName));

    if (!(fieldType instanceof _graphql.GraphQLObjectType)) {
      throw new Error(`Cannot get TypeComposer for field '${fieldName}' in type ${this.getTypeName()}. ` + `This field should be ObjectType, but it has type '${fieldType.constructor.name}'`);
    }

    return this.schemaComposer.TypeComposer.createTemp(fieldType);
  }

  makeFieldNonNull(fieldNameOrArray) {
    const fieldNames = Array.isArray(fieldNameOrArray) ? fieldNameOrArray : [fieldNameOrArray];
    fieldNames.forEach(fieldName => {
      if (this.hasField(fieldName)) {
        const fieldType = this.getFieldType(fieldName);

        if (!(fieldType instanceof _graphql.GraphQLNonNull)) {
          this.extendField(fieldName, {
            type: new _graphql.GraphQLNonNull(fieldType)
          });
        }
      }
    });
    return this;
  }

  makeFieldNullable(fieldNameOrArray) {
    const fieldNames = Array.isArray(fieldNameOrArray) ? fieldNameOrArray : [fieldNameOrArray];
    fieldNames.forEach(fieldName => {
      if (this.hasField(fieldName)) {
        const fieldType = this.getFieldType(fieldName);

        if (fieldType instanceof _graphql.GraphQLNonNull) {
          this.extendField(fieldName, {
            type: fieldType.ofType
          });
        }
      }
    });
    return this;
  }

  deprecateFields(fields) {
    const existedFieldNames = this.getFieldNames();

    if (typeof fields === 'string') {
      if (existedFieldNames.indexOf(fields) === -1) {
        throw new Error(`Cannot deprecate unexisted field '${fields}' from interface type '${this.getTypeName()}'`);
      }

      this.extendField(fields, {
        deprecationReason: 'deprecated'
      });
    } else if (Array.isArray(fields)) {
      fields.forEach(field => {
        if (existedFieldNames.indexOf(field) === -1) {
          throw new Error(`Cannot deprecate unexisted field '${field}' from interface type '${this.getTypeName()}'`);
        }

        this.extendField(field, {
          deprecationReason: 'deprecated'
        });
      });
    } else {
      const fieldMap = fields;
      Object.keys(fieldMap).forEach(field => {
        if (existedFieldNames.indexOf(field) === -1) {
          throw new Error(`Cannot deprecate unexisted field '${field}' from interface type '${this.getTypeName()}'`);
        }

        const deprecationReason = fieldMap[field];
        this.extendField(field, {
          deprecationReason
        });
      });
    }

    return this;
  }

  getFieldArgs(fieldName) {
    try {
      const fc = this.getFieldConfig(fieldName);
      return fc.args || {};
    } catch (e) {
      throw new Error(`Cannot get field args. Field '${fieldName}' from type '${this.getTypeName()}' does not exist.`);
    }
  }

  hasFieldArg(fieldName, argName) {
    const fieldArgs = this.getFieldArgs(fieldName);
    return !!fieldArgs[argName];
  }

  getFieldArg(fieldName, argName) {
    const fieldArgs = this.getFieldArgs(fieldName);

    if (!fieldArgs[argName]) {
      throw new Error(`Cannot get arg '${argName}' from type.field '${this.getTypeName()}.${fieldName}'. Argument does not exist.`);
    }

    return fieldArgs[argName];
  }

  getFieldArgType(fieldName, argName) {
    const ac = this.getFieldArg(fieldName, argName);
    return ac.type;
  } // -----------------------------------------------
  // Type methods
  // -----------------------------------------------


  getType() {
    return this.gqType;
  }

  getTypePlural() {
    return new _graphql.GraphQLList(this.gqType);
  }

  getTypeNonNull() {
    return new _graphql.GraphQLNonNull(this.gqType);
  }

  getTypeName() {
    return this.gqType.name;
  }

  setTypeName(name) {
    this.gqType.name = name;
    this.schemaComposer.add(this);
    return this;
  }

  getDescription() {
    return this.gqType.description || '';
  }

  setDescription(description) {
    this.gqType.description = description;
    return this;
  }

  clone(newTypeName) {
    if (!newTypeName) {
      throw new Error('You should provide newTypeName:string for InterfaceTypeComposer.clone()');
    }

    const newFields = {};
    this.getFieldNames().forEach(fieldName => {
      const fc = this.getFieldConfig(fieldName);
      newFields[fieldName] = _objectSpread({}, fc);
    });
    const cloned = new this.schemaComposer.InterfaceTypeComposer(new _graphql.GraphQLInterfaceType({
      name: newTypeName,
      fields: newFields
    }));
    cloned.setDescription(this.getDescription());
    return cloned;
  } // -----------------------------------------------
  // ResolveType methods
  // -----------------------------------------------


  hasTypeResolver(type) {
    const typeResolversMap = this.getTypeResolvers();
    return typeResolversMap.has(type);
  }

  getTypeResolvers() {
    if (!this.gqType._gqcTypeResolvers) {
      this.gqType._gqcTypeResolvers = new Map();
    }

    return this.gqType._gqcTypeResolvers;
  }

  getTypeResolverCheckFn(type) {
    const typeResolversMap = this.getTypeResolvers();

    if (!typeResolversMap.has(type)) {
      throw new Error(`Type resolve function in interface '${this.getTypeName()}' is not defined for type ${(0, _misc.inspect)(type)}.`);
    }

    return typeResolversMap.get(type);
  }

  getTypeResolverNames() {
    const typeResolversMap = this.getTypeResolvers();
    const names = [];
    typeResolversMap.forEach((resolveFn, composeType) => {
      if (composeType instanceof _TypeComposer.TypeComposer) {
        names.push(composeType.getTypeName());
      } else if (composeType && composeType.name) {
        names.push(composeType.name);
      }
    });
    return names;
  }

  getTypeResolverTypes() {
    const typeResolversMap = this.getTypeResolvers();
    const types = [];
    typeResolversMap.forEach((resolveFn, composeType) => {
      types.push((0, _typeHelpers.getGraphQLType)(composeType));
    });
    return types;
  }

  setTypeResolvers(typeResolversMap) {
    this._isTypeResolversValid(typeResolversMap);

    this.gqType._gqcTypeResolvers = typeResolversMap; // extract GraphQLObjectType from TypeComposer

    const fastEntries = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = typeResolversMap.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const _step$value = _slicedToArray(_step.value, 2),
              composeType = _step$value[0],
              checkFn = _step$value[1];

        fastEntries.push([(0, _typeHelpers.getGraphQLType)(composeType), checkFn]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    let resolveType;

    const isAsyncRuntime = this._isTypeResolversAsync(typeResolversMap);

    if (isAsyncRuntime) {
      resolveType =
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (value, context, info) {
          for (var _i = 0; _i < fastEntries.length; _i++) {
            const _fastEntries$_i = _slicedToArray(fastEntries[_i], 2),
                  gqType = _fastEntries$_i[0],
                  checkFn = _fastEntries$_i[1];

            // should we run checkFn simultaniously or in serial?
            // Current decision is: dont SPIKE event loop - run in serial (it may be changed in future)
            // eslint-disable-next-line no-await-in-loop
            if (yield checkFn(value, context, info)) return gqType;
          }

          return null;
        });

        return function resolveType(_x, _x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }();
    } else {
      resolveType = (value, context, info) => {
        for (var _i2 = 0; _i2 < fastEntries.length; _i2++) {
          const _fastEntries$_i2 = _slicedToArray(fastEntries[_i2], 2),
                gqType = _fastEntries$_i2[0],
                checkFn = _fastEntries$_i2[1];

          if (checkFn(value, context, info)) return gqType;
        }

        return null;
      };
    }

    this.gqType.resolveType = resolveType;
    return this;
  }

  _isTypeResolversValid(typeResolversMap) {
    if (!(typeResolversMap instanceof Map)) {
      throw new Error(`For interface ${this.getTypeName()} you should provide Map object for type resolvers.`);
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = typeResolversMap.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        const _step2$value = _slicedToArray(_step2.value, 2),
              composeType = _step2$value[0],
              checkFn = _step2$value[1];

        // checking composeType
        try {
          const type = (0, _typeHelpers.getGraphQLType)(composeType);
          if (!(type instanceof _graphql.GraphQLObjectType)) throw new Error('Must be GraphQLObjectType');
        } catch (e) {
          throw new Error(`For interface type resolver ${this.getTypeName()} you must provide GraphQLObjectType or TypeComposer, but provided ${(0, _misc.inspect)(composeType)}`);
        } // checking checkFn


        if (!(0, _is.isFunction)(checkFn)) {
          throw new Error(`Interface ${this.getTypeName()} has invalid check function for type ${(0, _misc.inspect)(composeType)}`);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return true;
  } // eslint-disable-next-line class-methods-use-this


  _isTypeResolversAsync(typeResolversMap) {
    let res = false;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = typeResolversMap.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        const _step3$value = _slicedToArray(_step3.value, 2),
              checkFn = _step3$value[1];

        try {
          const r = checkFn({}, {}, {});

          if (r instanceof Promise) {
            r.catch(() => {});
            res = true;
          }
        } catch (e) {// noop
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return res;
  }

  addTypeResolver(type, checkFn) {
    const typeResolversMap = this.getTypeResolvers();
    typeResolversMap.set(type, checkFn);
    this.setTypeResolvers(typeResolversMap);
    return this;
  }

  removeTypeResolver(type) {
    const typeResolversMap = this.getTypeResolvers();
    typeResolversMap.delete(type);
    this.setTypeResolvers(typeResolversMap);
    return this;
  } // -----------------------------------------------
  // Misc methods
  // -----------------------------------------------


  get(path) {
    return (0, _typeByPath.typeByPath)(this, path);
  }

}

exports.InterfaceTypeComposer = InterfaceTypeComposer;