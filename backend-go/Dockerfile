# Stage 1: Build the Golang CLOB binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy dependency files first for optimal Docker layer caching
COPY go.mod ./
RUN go mod download

# Copy the source code
COPY . .

# Build the standalone static machine-code binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o clob-engine ./cmd/server/main.go

# Stage 2: Create a minimal lightweight runtime image (~15MB total!)
FROM alpine:3.19

WORKDIR /root/

# Copy the pre-compiled binary from builder stage
COPY --from=builder /app/clob-engine .

EXPOSE 8080

CMD ["./clob-engine"]
