FROM golang:1.13

WORKDIR /go/src
COPY src .

#ADD https://github.com/vishnubob/wait-for-it/compare/master...HEAD /dev/null
#RUN git clone https://github.com/vishnubob/wait-for-it.git /wfi
#WORKDIR src

RUN go get -u google.golang.org/grpc
#RUN go get 
RUN go install transaction_service

CMD ["transaction_service"]

