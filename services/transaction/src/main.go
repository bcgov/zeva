//go:generate protoc -I ../../../protos --go_out=plugins=grpc:./zeva_transactions transactions.proto

package main

import (
	"log"
	"net"
	"google.golang.org/grpc"
	pb "zeva_transactions"
)

type transactionListServer struct {
	pb.UnimplementedTransactionListServer
}

func (s *transactionListServer) GetTransactions(req *pb.TransactionListRequest, stream pb.TransactionList_GetTransactionsServer) error {

	values := []pb.TransactionSummary{
		pb.TransactionSummary{
			Id:      1,
			Type:    pb.TransactionType_BOUGHT,
			Amount:  &pb.DollarValue{Cents: 30012},
			Credits: &pb.CreditValue{Credits: 402},
		},
		pb.TransactionSummary{
			Id:      2,
			Type:    pb.TransactionType_SOLD,
			Amount:  &pb.DollarValue{Cents: 39412330912},
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
	return s
}

func main() {
	lis, err := net.Listen("tcp", "localhost:10101")

	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	var opts []grpc.ServerOption

	grpcServer := grpc.NewServer(opts...)
	pb.RegisterTransactionListServer(grpcServer, newServer())

	log.Println("Ready to serve requests")

	grpcServer.Serve(lis)
}
