/**
 * @fileoverview gRPC-Web generated client stub for zeva.transactions
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.zeva = {};
proto.zeva.transactions = require('./transactions_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.zeva.transactions.TransactionListClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.zeva.transactions.TransactionListPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.zeva.transactions.TransactionListRequest,
 *   !proto.zeva.transactions.TransactionSummary>}
 */
const methodDescriptor_TransactionList_GetTransactions = new grpc.web.MethodDescriptor(
  '/zeva.transactions.TransactionList/GetTransactions',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.zeva.transactions.TransactionListRequest,
  proto.zeva.transactions.TransactionSummary,
  /**
   * @param {!proto.zeva.transactions.TransactionListRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.zeva.transactions.TransactionSummary.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.zeva.transactions.TransactionListRequest,
 *   !proto.zeva.transactions.TransactionSummary>}
 */
const methodInfo_TransactionList_GetTransactions = new grpc.web.AbstractClientBase.MethodInfo(
  proto.zeva.transactions.TransactionSummary,
  /**
   * @param {!proto.zeva.transactions.TransactionListRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.zeva.transactions.TransactionSummary.deserializeBinary
);


/**
 * @param {!proto.zeva.transactions.TransactionListRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.zeva.transactions.TransactionSummary>}
 *     The XHR Node Readable Stream
 */
proto.zeva.transactions.TransactionListClient.prototype.getTransactions =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/zeva.transactions.TransactionList/GetTransactions',
      request,
      metadata || {},
      methodDescriptor_TransactionList_GetTransactions);
};


/**
 * @param {!proto.zeva.transactions.TransactionListRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.zeva.transactions.TransactionSummary>}
 *     The XHR Node Readable Stream
 */
proto.zeva.transactions.TransactionListPromiseClient.prototype.getTransactions =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/zeva.transactions.TransactionList/GetTransactions',
      request,
      metadata || {},
      methodDescriptor_TransactionList_GetTransactions);
};


module.exports = proto.zeva.transactions;

