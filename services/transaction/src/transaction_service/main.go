//go:generate protoc -I ../../../protos --go_out=plugins=grpc:./zeva_transactions transactions.proto

package main

import (
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"go.uber.org/zap"
	"google.golang.org/grpc/metadata"
	"net"
	"google.golang.org/grpc"
	"github.com/grpc-ecosystem/go-grpc-middleware"
	pb "zeva_transactions"
)

type transactionListServer struct {
	pb.UnimplementedTransactionListServer
	log *zap.Logger
}

func (s *transactionListServer) GetTransactions(req *pb.TransactionListRequest, stream pb.TransactionList_GetTransactionsServer) error {

	md, ok := metadata.FromIncomingContext(stream.Context())
	if ok {
		var token []string = md.Get("authorization")
		s.log.Info("context:", zap.String("token", token[0]))
	}

	values := []pb.TransactionSummary{
		pb.TransactionSummary{
			Id:      1,
			Type:    pb.TransactionType_BOUGHT,
			Amount:  &pb.DollarValue{Cents: 6565},
			Credits: &pb.CreditValue{Credits: 401},
		},
		pb.TransactionSummary{
			Id:      2,
			Type:    pb.TransactionType_SOLD,
			Amount:  &pb.DollarValue{Cents: 56454},
			Credits: &pb.CreditValue{Credits: 1},
		},
		pb.TransactionSummary{
			Id:      4,
			Type:    pb.TransactionType_VALIDATION,
			Amount:  &pb.DollarValue{Cents: 32},
			Credits: &pb.CreditValue{Credits: 123},
		},
	}

	for _, v := range values {
		if err := stream.Send(&v); err != nil {
			return err
		}
	}
	return nil
}

func newServer() *transactionListServer {
	s := &transactionListServer{}
	s.log, _ = zap.NewDevelopment()
	defer s.log.Sync()
	return s
}

func main() {
	zapLogger, _ := zap.NewDevelopment()
	defer zapLogger.Sync()

	lis, err := net.Listen("tcp", "transaction-service.tbiwaq-dev.svc.cluster.local:10101")

	if err != nil {
		zapLogger.Fatal("failed to listen.", zap.Error(err))
	}

	opts := []grpc.ServerOption{
		grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(
			grpc_zap.StreamServerInterceptor(zapLogger),
		)),
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
			grpc_zap.UnaryServerInterceptor(zapLogger),
		)),
	}

	grpcServer := grpc.NewServer(opts...)

	pb.RegisterTransactionListServer(grpcServer, newServer())

	zapLogger.Info("Ready to serve requests")

	_ = grpcServer.Serve(lis)
}
