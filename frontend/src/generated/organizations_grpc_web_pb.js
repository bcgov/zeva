/**
 * @fileoverview gRPC-Web generated client stub for zeva.organizations
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.zeva = {};
proto.zeva.organizations = require('./organizations_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.zeva.organizations.OrganizationDetailsClient =
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
proto.zeva.organizations.OrganizationDetailsPromiseClient =
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
 *   !proto.zeva.organizations.GetMyOrganizationRequest,
 *   !proto.zeva.organizations.MyOrganizationResponse>}
 */
const methodDescriptor_OrganizationDetails_GetMyOrganization = new grpc.web.MethodDescriptor(
  '/zeva.organizations.OrganizationDetails/GetMyOrganization',
  grpc.web.MethodType.UNARY,
  proto.zeva.organizations.GetMyOrganizationRequest,
  proto.zeva.organizations.MyOrganizationResponse,
  /**
   * @param {!proto.zeva.organizations.GetMyOrganizationRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.zeva.organizations.MyOrganizationResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.zeva.organizations.GetMyOrganizationRequest,
 *   !proto.zeva.organizations.MyOrganizationResponse>}
 */
const methodInfo_OrganizationDetails_GetMyOrganization = new grpc.web.AbstractClientBase.MethodInfo(
  proto.zeva.organizations.MyOrganizationResponse,
  /**
   * @param {!proto.zeva.organizations.GetMyOrganizationRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.zeva.organizations.MyOrganizationResponse.deserializeBinary
);


/**
 * @param {!proto.zeva.organizations.GetMyOrganizationRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.zeva.organizations.MyOrganizationResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.zeva.organizations.MyOrganizationResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.zeva.organizations.OrganizationDetailsClient.prototype.getMyOrganization =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/zeva.organizations.OrganizationDetails/GetMyOrganization',
      request,
      metadata || {},
      methodDescriptor_OrganizationDetails_GetMyOrganization,
      callback);
};


/**
 * @param {!proto.zeva.organizations.GetMyOrganizationRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.zeva.organizations.MyOrganizationResponse>}
 *     A native promise that resolves to the response
 */
proto.zeva.organizations.OrganizationDetailsPromiseClient.prototype.getMyOrganization =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/zeva.organizations.OrganizationDetails/GetMyOrganization',
      request,
      metadata || {},
      methodDescriptor_OrganizationDetails_GetMyOrganization);
};


module.exports = proto.zeva.organizations;

