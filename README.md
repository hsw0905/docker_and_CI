## Docker 와 CI

- (참고 : 완벽한 IT 인프라 구축을 위한 docker, 인프런 : 따라하며 배우는 도커와 CI환경)
- 목적 : 기존에 사용하던 docker에 대한 내용을 정리하고, 보충하고, 실습하여 좀 더 익숙해지기

### 사고의 전환

- 인프라를 수동 세팅 -> 코드로 세팅
- 여러개의 서버를 한 대씩 수작업으로 설정하는 것은 굉장히 비효율적입니다.
- 인프라 구성 정보를 코드로 관리하면, 개발환경에서의 소스코드 관리와 같은 환경에서 변경 이력을 일원화하여 관리 가능합니다.
- 구성의 변경이 발생한 경우, 커밋 메시지를 통해 팀간 공유가 가능합니다.
- Docker에서는 Dockerfile이라는 파일에 인프라 구성 정보를 작성하여 Docker 이미지를 생성합니다.

### Docker의 기능

1. Docker 이미지를 만드는 기능(Build)
   - 도커 명령을 이용한 수동으로 만들거나
   - Dockerfile이라는 설정 파일을 만들어 관리합니다.(바람직)
2. Docker 이미지를 공유하는 기능(Ship)
   - Docker Hub [(Docker 공식 레지스트리)](https://hub.docker.com/)에 이미지 공유
   - 혹은 개인/단체의 private registry 생성하여 관리
3. Docker 컨테이너를 작동시키는 기능(Run)
   - 도커는 하나의 Linux 커널을 여러 개의 컨테이너에서 공유하고 있습니다.
   - 도커가 설치된 환경이라면 어디서나 컨테이너 작동 가능합니다.

[<참고: 도커의 작동 구조>](./docker_arch.md)

### Dockerfile 작성 예시

- 도커파일 작성의 개본은 FROM(기반 이미지), RUN(실행 이외 추가 명령), CMD(app 실행 명령어) 구조입니다
- 도커 이미지는 여러개의 레이어로 되어있습니다.

```docker
# base image
FROM node:14

# 컨테이너 내부 app 위치 (넣지 않으면 /(root))
# / 에 다이렉트로 app이 복사되면 app dir을 따로 관리하기 번거롭습니다
WORKDIR /usr/src/app

# node의 경우 먼저 package.json을 복사합니다
# 소스 변경될때마다 필요 모듈을 다시 다운받게 되는 번거로움을 없앨 수 있습니다
COPY package.json ./

RUN npm install

# ./의 기준은 Dockerfile 위치 기준입니다
COPY ./ ./

CMD ["npm", "run", "start"]

```

- Dockerfile -> 도커 클라이언트 전달 -> 도커 서버가 인식하게 해야 합니다.(빌드!)

```bash
# -t 옵션을 주어 이미지에 태그를 부여합니다. (관용적으로 본인 id/app:version)
docker build -t hsw0905/app-name ./
```

- 외부 -> 로컬환경 -> 컨테이너 포트 포워딩하여 실행

```bash
# 내 컴에 5000 포트로 접근이 오면 8080(컨테이너) 포트로 포워딩합니다.
docker run -p 5000:8080 image_name
```

- 복사가 아닌, 로컬의 볼륨을 두어 도커가 해당 위치를 바라보고 참조합니다.

```bash
# pwd 경로에 있는 파일을 /usr/src/app 경로에서 참조
docker run -p 5000:8080 -v /usr/src/app/node_modules -v $(pwd):usr/src/app image_name
```

- 기본적으로 build 명령은 Dockerfile이란 파일을 찾게 됩니다.
- 개발환경용으로 따로 Dockerfile.dev 파일을 만들게 되면 빌드 명령을인식하지 못하게 됩니다.
- 이때 Dockerfile.dev를 명시해줍니다.

```bash
docker build -f Dockerfile.dev .
```

### 멀티 컨테이너

- 컨테이너 사이에 통신을 하려면?
- 멀티 컨테이너 상황에서 쉽게 네트워크를 연결시켜주기 위해서 docker-compose를 사용합니다.
- <예시>

```yml
version: "3"
services:
  redis-server:
    image: "redis"
  node-app:
    build: .
    ports:
      - "5000:8080"
```
