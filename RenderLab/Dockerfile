# syntax=docker/dockerfile:1
ARG TARGETARCH
FROM scratch AS binary-amd64
ADD --checksum=sha256:a2b153fc3570aeb48440de2d280de00a4505d26b59792f4ccd80a7e14ee1f8a6 --chmod=0555 https://github.com/teamjoin/interview-fullstack/releases/download/renderlab-v1.0.0/renderlab-linux-amd64 /renderlab

FROM scratch AS binary-arm64
ADD --checksum=sha256:cd824e4bee0c0c73e94ece93ec87c21d6e24b7cc36d8df228d6059a1f44b7f10 --chmod=0555 https://github.com/teamjoin/interview-fullstack/releases/download/renderlab-v1.0.0/renderlab-linux-arm64 /renderlab

FROM binary-${TARGETARCH}
USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/renderlab"]
