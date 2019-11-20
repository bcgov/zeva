FROM golang:1.13

WORKDIR /go/src

RUN go get -u google.golang.org/grpc
RUN go get -u github.com/grpc-ecosystem/go-grpc-middleware
RUN go get -u go.uber.org/zap

COPY src .

RUN go install transaction_service

CMD ["transaction_service"]

