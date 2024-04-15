# pass.in

O pass.in é uma aplicação de **gestão de participantes em eventos presenciais**. 

A ferramenta permite que o organizador cadastre um evento e abra uma página pública de inscrição.

Os participantes inscritos podem emitir uma credencial para check-in no dia do evento.

O sistema fará um scan da credencial do participante para permitir a entrada no evento.

## Requisitos

### Requisitos funcionais

- [x] O organizador deve poder cadastrar um novo evento;
- [x] O organizador deve poder visualizar dados de um evento;
- [x] O organizador deve poder visualizar a lista de participantes; 
- [x] O participante deve poder se inscrever em um evento;
- [x] O participante deve poder visualizar seu crachá de inscrição;
- [x] O participante deve poder realizar check-in no evento;

### Regras de negócio

- [x] O participante só pode se inscrever em um evento uma única vez;
- [x] O participante só pode se inscrever em eventos com vagas disponíveis;
- [x] O participante só pode realizar check-in em um evento uma única vez;

### Requisitos não-funcionais

- [x] O check-in no evento será realizado através de um QRCode;

## Documentação da API (Swagger)

Para documentação da API, acesse o link: https://nlw-unite-nodejs.onrender.com/docs

## Banco de dados

Nessa aplicação vamos utilizar banco de dados relacional (SQL). Para ambiente de desenvolvimento seguiremos com o SQLite pela facilidade do ambiente.

### Diagrama ERD

<img src=".github/erd.svg" width="600" alt="Diagrama ERD do banco de dados" />

### Estrutura do banco (SQL)

```sql
-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "slug" TEXT NOT NULL,
    "maximum_attendees" INTEGER
);

-- CreateTable
CREATE TABLE "attendees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendeeId" INTEGER NOT NULL,
    CONSTRAINT "check_ins_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "attendees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "attendees_event_id_email_key" ON "attendees"("event_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_attendeeId_key" ON "check_ins"("attendeeId");
```
### Comando para criar o ORM prisma em Sqlite
```bash
npx prisma init --datasource-provider SQLite

npx prisma migrate dev 
# ou
npm run db:migrate

npx prisma studio
# ou
npm run db:studio

# Para gerar o prisma client apos a instalar a dependência do prisma
npx prisma generate
# ou
npm run db:generate
```

### Comando do node para ler .env(Variaveis de ambiente)
```bash
# Maneira tradicional: Instalar a dependência dotenv
npm install dotenv

# ou

# No package.json, passar --env-file .env na execução do script. O proprio node suporta a leitura do .env. E pelo fato de estarmos usando o tsx ele ja passa o arquivo .env para o node automaticamente: node --env-file .env src/server.js
  "scripts": {
    "dev": "tsx watch --env-file .env src/server.ts"
  }
```

### Anotações:

- Métodos HTTP para fins semanticos: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
  -  Get - Obter dados
  -  Post - Criar dados...

- Maneiras de passar parametros para o servidor:
  - Query/search params: site.../users?name=Lucas&age=25 --> Parametros passados na URL --> Parametros de busca/filtro --> Esses parametros não são obrigatórios --> Podem ser usados para filtrar os resultados de uma busca

  - Route params: /users/10 (id do usuario) --> site.../users/:id --> site.../users/5 --> Parametros de rota passados na URL --> Identificação de recursos --> Para Put, Delete, Patch ou ate get--> fazer uma operação em um unico registro --> Por exemplo para deletar um usuario --> Esses parametros são obrigatórios

  - Body: { name: 'Lucas', age: 25 } --> Corpo da requisição

  - Headers: { Authorization : 'Bearer 123456' } --> Cabeçalhos --> Contexto da requisição --> Informações mais fixas, para detalhar a requisição/back-end --> Ex: a localização do usuario, o tipo de conteudo que ele aceita, o tipo de conteudo que ele envia, a autenticação do usuario

- Maneiras de conectar com o banco:
  -  Driver nativo: Conexão direta(Baixo nivel) com o banco de dados --> Ex: mysql, pg, sqlite --> Necessita de conhecimento avançado em SQL
  -  ORM: Object Relational Mapping --> Mapeamento de objetos para o banco de dados --> Ex: TypeORM, Sequelize, Prisma, Hibernate(Para Java)...
  -  Query Builder: Construção de queries SQL com métodos/sintaxe Javascript --> Knex.js...

  -  Migrations --> Controle de versão do banco de dados --> Criação de tabelas, alteração de tabelas, exclusão de tabelas...

- Http status code: Traz o significado da resposta
  -  2xx: Sucesso
  -  3xx: Redirecionamento
  -  4xx: Erro do cliente(Erro em alguma informação enviada por QUEM esta fazendo a chamada p/ API)
  -  5xx: Erro do servidor(Um erro que está acontecendo IDEPENDENTE do que está sendo enviado p/ o servidor)

- Caso queira gerar regex de maneira facil, basta usar o Chatgpt:
  -  Me dê uma função em typescript que gere um slug a partir de um texto sem acentos, símbolos ou espaços, ou seja, pronto para ser usado em uma URL
  ```bash
      export function generateSlug(text: string): string {
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    }
  ```
- Arquivo para pre-popular nosso BD, o arquivo *seed* em prisma
- Em package.json:
```bash
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
```
depois rode o comando para popular o banco:
```bash
  npx prisma db seed
```
- Documentação da Api usando o Swagger: https://swagger.io/ e iremos usar o fastify junto com ele para gerar o arquivo de documentação yml ou json da API *fastify/swagger*, o *fastify/swagger-ui* cria a interface para visualizar/navegar pela documentação da API
```bash 
  npm i @fastify/swagger @fastify/swagger-ui
```
- Para abrir e testar a documentação da API, basta acessar a rota /docs: http://localhost:3000/docs
- Fazendo o build para subir a aplicação para produção
```bash
  npm i tsup -D
```
- Script de build para preparar nossa aplicação para produção
```bash
  "scripts": {
    # Para gerar o build no formato ESM (EcmaScript Module) de exportação e importação diretamente das funções, classes, variáveis, arquivos...
    "build:esm": "tsup src --format esm",
    # Para gerar o build no formato CommonJS padrão antigo de exportação e importação, module export
    "build:cjs": "tsup src --format cjs",
  }
```
- Para rodar o build: `npm run start`, ou seja, a plicação em JS
```bash
  "scripts": {
    "start": "node dist/server.mjs"
  }
```
- Devops
  - O docker hub nada mais é que um repositorio de imagens docker, onde podemos subir nossas imagens para serem usadas em qualquer lugar
  - [Imagens Docker](https://hub.docker.com/)
  - [Imagens Docker node](https://hub.docker.com/_/node)
  - [Imagem docker node 20](https://hub.docker.com/_/node/tags?page=&page_size=&ordering=&name=20)
  - [Imagem docker node 20-alpine3.19](https://hub.docker.com/_/node/tags?page=&page_size=&ordering=&name=20-alpine3.19)
  - [Para baixar o docker no windows](https://docs.docker.com/desktop/windows/install/)
  - [Lembre de ter o WSL2 instalado](https://docs.microsoft.com/pt-br/windows/wsl/install)
  - [Como instalar o WSL2 no Windows 10/11 - Linux e Windows Lado a Lado para Iniciantes](https://www.youtube.com/watch?v=qlLcnSvG1rA)
  - Após instalar tudo basta iniciar, que qualquer comando via CLI do windows será executado
  - Para baixar a imagem do docker do node da tag 20 na maquina(servidor/pc): ```docker pull node:20``` pode demorar um pouco
    - Retorno após baixar a imagem:
      ```bash
        0: Pulling from library/node
        71215d55680c: Pull complete
        3cb8f9c23302: Pull complete
        5f899db30843: Pull complete
        567db630df8d: Pull complete
        f4ac4e9f5ffb: Pull complete
        eecc94e1c146: Pull complete
        5bbcc6307f26: Pull complete
        18e47472a9da: Pull complete
        Digest: sha256:8a03de2385cb16c4d76aac30bf86ab05f55f1754a5402dc9039916e8043f019a
        Status: Downloaded newer image for node:20
        docker.io/library/node:20
      ```
    - Rode um ```docker image ls``` para ver as imagens baixadas no seu sistema
      - Retorno do meu:
        ```bash
            REPOSITORY           TAG       IMAGE ID       CREATED        SIZE
            node                 20        8e022d47db62   4 days ago     1.1GB
            bitnami/postgresql   latest    9b84f4e4d643   2 months ago   274MB
            bitnami/redis        latest    45de196aef7e   2 months ago   95.2MB
        ```
  - Para baixar a imagem do docker do node da tag 20-alpine3.19: ```docker pull node:20-alpine3.19``` pode demorar um pouco, so que menos, porque ela é 135MB, esse minimo ja da para rodar o node
    - Retorno após baixar a imagem:
      ```bash
          20-alpine3.19: Pulling from library/node
          4abcf2066143: Pull complete
          77152dc4dbd8: Pull complete
          f90945061f81: Pull complete
          c95f6f65e1db: Pull complete
          Digest: sha256:7e227295e96f5b00aa79555ae166f50610940d888fc2e321cf36304cbd17d7d6
          Status: Downloaded newer image for node:20-alpine3.19
          docker.io/library/node:20-alpine3.19
      ```
    - Rode um ```docker image ls``` para ver as imagens baixadas no seu sistema
      - Retorno do meu:
        ```bash
            REPOSITORY           TAG             IMAGE ID       CREATED        SIZE
            node                 20              8e022d47db62   4 days ago     1.1GB
            node                 20-alpine3.19   bc27e8ab8b21   4 days ago     135MB
            bitnami/postgresql   latest          9b84f4e4d643   2 months ago   274MB
            bitnami/redis        latest          45de196aef7e   2 months ago   95.2MB
        ```
  - Para rodar a imagem feita por a gente, basta ir no direitorio onde tem o arquivo Dockerfile e rodar o comando ```docker build -t nome_da_imagem:v1 .``` o ponto no final é para dizer que o arquivo Dockerfile está no diretorio atual, os : é para dizer a tag da imagem, o -t é para dar um nome a imagem
    - Exemplo: ```docker build -t passin:v1 .```
    - Exemplo caso você não esteja no terminal aberto com o direitorio da sua aplicação com o dockerfile(vscode basta abrir um terminal de acordo com a pasta) e queira passar o endereço da sua aplicação com o Dockerfile em outro terminal aberto em outro diretorio: ```docker build -t passin:v1 -f /caminho/para/o/Dockerfile .```
    - Resultado:
    ```bash
        docker build -t passin:v1 .
    [+] Building 21.1s (15/21)                                                                                                          docker:default
    => [internal] load build definition from Dockerfile                                                                                          0.1s
    => => transferring dockerfile: 5.12kB                                                                                                        0.0s
    => [internal] load metadata for docker.io/library/node:20                                                                                    0.0s
    => [internal] load metadata for docker.io/library/node:20-alpine3.19                                                                         0.0s
    => [internal] load .dockerignore                                                                                                             0.0s
    => => transferring context: 153B                                                                                                             0.0s
    => [deploy 1/8] FROM docker.io/library/node:20-alpine3.19                                                                                    0.1s
    => [internal] load build context                                                                                                             0.1s
    => => transferring context: 341.52kB                                                                                                         0.0s
    => [base 1/1] FROM docker.io/library/node:20                                                                                                 0.2s
    => [deploy 2/8] WORKDIR /usr/src/app                                                                                                         0.1s
    => [deploy 3/8] RUN npm i -g prisma                                                                                                         10.7s 
    => [dependencies 1/3] WORKDIR /usr/src/app                                                                                                   0.0s 
    => [dependencies 2/3] COPY package.json package-lock.json ./                                                                                 0.0s 
    => [build 2/5] COPY . .                                                                                                                      0.1s 
    => [dependencies 3/3] RUN npm install                                                                                                        16.8s 
    => [build 3/5] COPY --from=dependencies /usr/src/app/node_modules ./node_modules                                                             2.2s
    => [build 4/5] RUN npm run build:esm                                                                                                         1.2s 
    => [build 5/5] RUN npm prune --prod                                                                                                          2.1s 
    => [deploy 4/8] COPY --from=build /usr/src/app/dist ./dist                                                                                   0.0s 
    => [deploy 5/8] COPY --from=build /usr/src/app/node_modules ./node_modules                                                                   1.2s 
    => [deploy 6/8] COPY --from=build /usr/src/app/package.json ./package.json                                                                   0.0s 
    => [deploy 7/8] COPY --from=build /usr/src/app/prisma ./prisma                                                                               0.0s 
    => [deploy 8/8] RUN npx prisma generate                                                                                                      2.1s 
    => exporting to image                                                                                                                        0.9s 
    => => exporting layers                                                                                                                       0.9s 
    => => writing image sha256:5d01caa891d2896bf3e1c6a9818af954bc935ebd5d317163bf93292ffd138f4b                                                  0.0s 
    => => naming to docker.io/library/passin:v1                                                                                                  0.0s 

    What's Next?
      View a summary of image vulnerabilities and recommendations → docker scout quickview 
    ```
  - Rodando um ```docker image ls```
    - Resultado:
      ```bash
      PS C:\Users\Pedro\OneDrive\Documentos\GitHub\nlw-unite\api> docker image ls
      REPOSITORY           TAG             IMAGE ID       CREATED         SIZE
      passin               v1              5d01caa891d2   5 minutes ago   587MB
      node                 20              8e022d47db62   9 days ago      1.1GB
      node                 20-alpine3.19   bc27e8ab8b21   9 days ago      135MB
      bitnami/postgresql   latest          9b84f4e4d643   2 months ago    274MB
      bitnami/redis        latest          45de196aef7e   2 months ago    95.2MB
      
      ```
  - Rodando o docker ```docker run -p 3001:3000 passin:v1```
    - Resultado
      ``` bash
      docker run -p 3001:3000 passin:v1

      > api@1.0.0 start
      > node dist/server.mjs

      Server is running on 
      ```
    - definimos a porta do docker com a flag -p, a primeira porta é a porta do docker e a segunda é a porta da nossa aplicação
  - Não havíamos passado as variáveis de ambiente para o docker, logo pode dar algum erro, para solucionar basta passar via arquivo dotenv. Não criamos o dotenv para o docker que seria o ideal, passamos as variaveis de ambiente para o docker diretamente no arquivo dockerfile. 
  - Apos isso, de um ```docker build -t passin:v2 .``` para atualizar a imagem do docker e depois rode o ```docker run -p 3001:3000 passin:v2``` para rodar a nova imagem
    - Resultado apos colocar as variaveis
      ```bash
      docker run -p 3001:3000 passin:v2

      > api@1.0.0 start
      > node dist/server.mjs

      Server is running on http://localhost:3000
      ```
  - Lembrando que o localhost:3000 é dentro do docker, para nós a porta é 3001 porque usamos o docker para subir a aplicação, usando a porta 3001 para subir a imagem do mesmo, logo se eu quiser acessar agora documentação da minha api não é mais http://localhost:3000/docs e sim http://localhost:3001/docs que foi a porta que definimos ao subir a imagem. Se eu der um ctrl+C a aplicação finaliza, para isso não ocorrer, para não depender desse terminal para rodar a imagem, basta rodar a imagem de outra maneira:
      - ```docker run -p 3001:3000 -d passin:v2``` o -d é para fazer a execução e não travar o meu terminal, dessa forma nossa imagem roda como qualquer outra imagem de terceiros que usamos para rodar em outras aplicações(ex: bd redis, postgress) na nossa maquina usando o docker, ou seja, ficam de fundo rondando, para ver quais imagens estão executando: ```docker ps```, para parar basta ir na UI do Docker e parar ou via CLI ```docker stop CONTAINER ID```
       - Resultado da execução docker run -p 3001:3000 -d passin:v2: *0059444199ecebe25e39a72a7b7209944ac6478a29a1c6ae5b34da95c253516d*
       - Resultado da execução pra ver quais imagens estão rodando:
         ```bash
         docker ps
         CONTAINER ID   IMAGE       COMMAND                  CREATED          STATUS          PORTS                    NAMES
         0059444199ec   passin:v2   "docker-entrypoint.s…"   57 seconds ago   Up 56 seconds   0.0.0.0:3001->3000/tcp   strange_heyrovsky
         ```
         - Aqui vemos que a porta 3001(da nossa imagem) aponta para a porta da nossa aplicação 3000 --> 0.0.0.0:3001->3000/tcp
  - Dockers passados ```docker ps -a```
    ```bash
      CONTAINER ID   IMAGE                       COMMAND                  CREATED          STATUS                      PORTS                    NAMES
      0059444199ec   passin:v2                   "docker-entrypoint.s…"   3 minutes ago    Up 3 minutes                0.0.0.0:3001->3000/tcp   strange_heyrovsky
      148dcfddf162   passin:v2                   "docker-entrypoint.s…"   13 minutes ago   Exited (1) 4 minutes ago                             quizzical_chaum
      bf0ceb014b01   passin:v1                   "docker-entrypoint.s…"   20 minutes ago   Exited (1) 13 minutes ago                            exciting_sammet
      c24c2f06be99   passin:v1                   "docker-entrypoint.s…"   21 minutes ago   Exited (1) 20 minutes ago                            zen_hellman
      4bd857564eb1   bitnami/postgresql:latest   "/opt/bitnami/script…"   3 weeks ago      Exited (0) 3 weeks ago                               url-shortening-system-with-node-postgres-1
      3ef72e5abce5   bitnami/redis:latest        "/opt/bitnami/script…"   3 weeks ago      Exited (0) 3 weeks ago                               url-shortening-system-with-node-redis-1
      240a81c65fc1   bitnami/redis:latest        "/opt/bitnami/script…"   2 months ago     Exited (0) 8 weeks ago                               trilha-node-polls-redis-1
      9c7975954ade   bitnami/postgresql:latest   "/opt/bitnami/script…"   2 months ago     Exited (0) 8 weeks ago                               trilha-node-polls-postgres-1
    ``` 
  - Logs ```docker logs CONTAINER ID```
  - Temos o docker compose, para instalar e rodar imagens de terceiros ou a nossa mesma(dockerfile), nesse caso iremos usar o postgress e a nossa imagem(dockerfile). Para saber se esta instalado basta dar um ```docker-compose -v```
    - Resultado: *Docker Compose version v2.24.3-desktop.1*
  - O docker compose é uma ferramenta somente para ambiente local, servindo para orquestração de containers. Ou seja, conseguimos ter dois serviços rodando ou mais e fazendo a execução com apenas um comendo na mesma camada de rede, no mesmo container, conseguindo associar volume... Para que consigamos instalar e rodar imagens de terceiros ou a nossa propria imagem(Dockerfile) em um so container(onde cada serviço é um container e cada serviço tem a sua imagem) com um so comando, criamos o docker-compose.yml, onde passamos os serviços que queremos rodar
  - Tiramos as envs do dockerfile e passamos para o docker-compose
  - E agora invés do ```docker build``` passando uma nova tag de uma nova versão, rodamos o ```docker-compose up --build -d``` para buildar e subir a imagem para criar o container ou ```docker-compose up -d``` somente para subir a imagem para criar o container. o -d é mesma logica do docker run, para o console/terminal não ficar travado. Para encerrar via CLI ```docker-compose down``` ou via UI. Se quiser subir de novo sem precisar buildar novamente ```docker-compose up -d```
    - Resultado:
      ```bash
          docker-compose up --build -d
          [+] Building 0.0s (0/0)  docker:default
          [+] Building 10.4s (22/22) FINISHED                                                                                                 docker:default
          => [api-pass-in internal] load build definition from Dockerfile                                                                              0.0s
          => => transferring dockerfile: 5.48kB                                                                                                        0.0s 
          => [api-pass-in internal] load metadata for docker.io/library/node:20                                                                        0.0s 
          => [api-pass-in internal] load metadata for docker.io/library/node:20-alpine3.19                                                             0.0s 
          => [api-pass-in internal] load .dockerignore                                                                                                 0.0s 
          => => transferring context: 153B                                                                                                             0.0s 
          => [api-pass-in base 1/1] FROM docker.io/library/node:20                                                                                     0.0s 
          => [api-pass-in internal] load build context                                                                                                 0.0s 
          => => transferring context: 2.98kB                                                                                                           0.0s 
          => [api-pass-in deploy 1/8] FROM docker.io/library/node:20-alpine3.19                                                                        0.0s 
          => CACHED [api-pass-in dependencies 1/3] WORKDIR /usr/src/app                                                                                0.0s
          => CACHED [api-pass-in dependencies 2/3] COPY package.json package-lock.json ./                                                              0.0s 
          => CACHED [api-pass-in dependencies 3/3] RUN npm install                                                                                     0.0s 
          => [api-pass-in build 2/5] COPY . .                                                                                                          0.0s 
          => [api-pass-in build 3/5] COPY --from=dependencies /usr/src/app/node_modules ./node_modules                                                 5.7s 
          => [api-pass-in build 4/5] RUN npm run build:esm                                                                                             1.3s 
          => [api-pass-in build 5/5] RUN npm prune --prod                                                                                              2.2s 
          => CACHED [api-pass-in deploy 2/8] WORKDIR /usr/src/app                                                                                      0.0s 
          => CACHED [api-pass-in deploy 3/8] RUN npm i -g prisma                                                                                       0.0s 
          => CACHED [api-pass-in deploy 4/8] COPY --from=build /usr/src/app/dist ./dist                                                                0.0s 
          => CACHED [api-pass-in deploy 5/8] COPY --from=build /usr/src/app/node_modules ./node_modules                                                0.0s 
          => CACHED [api-pass-in deploy 6/8] COPY --from=build /usr/src/app/package.json ./package.json                                                0.0s 
          => CACHED [api-pass-in deploy 7/8] COPY --from=build /usr/src/app/prisma ./prisma                                                            0.0s 
          => CACHED [api-pass-in deploy 8/8] RUN npx prisma generate                                                                                   0.0s 
          => [api-pass-in] exporting to image                                                                                                          0.0s 
          => => exporting layers                                                                                                                       0.0s 
          => => writing image sha256:7aa827dc2070f3582a67da33d174d84901c01584e54319be76c4937e24dfe583                                                  0.0s 
          => => naming to docker.io/library/api-api-pass-in                                                                                            0.0s 
          [+] Running 0/2
          - Network api_default    Created                                                                                                             0.3s 
          - Container api_pass_in  Starting                                                                                                            0.3s 
          Error response from daemon: driver failed programming external connectivity on endpoint api_pass_in (45318b57010c9a20d82a54cf095761d894decddb0f7d6636289352ed5e4a5ba8): Bind for 0.0.0.0:3001 failed: port is already allocated
      ```
    - Ele deu um erro *Error response from daemon: driver failed programming external connectivity on endpoint api_pass_in (45318b57010c9a20d82a54cf095761d894decddb0f7d6636289352ed5e4a5ba8): Bind for 0.0.0.0:3001 failed: port is already allocated* Porque ja estamos utilizando a porta 3001, basta fazer isso ```docker ps``` pegar o container que esta rodando nessa porta e dar um ```docker stop CONTAINER ID```
      - Docker ps:
        ```bash
          CONTAINER ID   IMAGE       COMMAND                  CREATED          STATUS          PORTS                    NAMES
          0059444199ec   passin:v2   "docker-entrypoint.s…"   32 minutes ago   Up 32 minutes   0.0.0.0:3001->3000/tcp   strange_heyrovsky
        ```
      - docker stop 0059444199ec. Agora podemos rodar o up
        - docker up...
          ```bash
          2024/04/13 15:19:34 http2: server: error reading preface from client //./pipe/docker_engine: file has already been closed
          [+] Building 0.0s (0/0)  docker:default
          [+] Building 0.1s (22/22) FINISHED                                                                                                  docker:default
          => [api-pass-in internal] load build definition from Dockerfile                                                                              0.0s
          => => transferring dockerfile: 5.48kB                                                                                                        0.0s 
          => [api-pass-in internal] load metadata for docker.io/library/node:20-alpine3.19                                                             0.0s 
          => [api-pass-in internal] load metadata for docker.io/library/node:20                                                                        0.0s 
          => [api-pass-in internal] load .dockerignore                                                                                                 0.0s 
          => => transferring context: 153B                                                                                                             0.0s 
          => [api-pass-in base 1/1] FROM docker.io/library/node:20                                                                                     0.0s 
          => [api-pass-in deploy 1/8] FROM docker.io/library/node:20-alpine3.19                                                                        0.0s 
          => [api-pass-in internal] load build context                                                                                                 0.0s 
          => => transferring context: 2.17kB                                                                                                           0.0s 
          => CACHED [api-pass-in deploy 2/8] WORKDIR /usr/src/app                                                                                      0.0s 
          => CACHED [api-pass-in deploy 3/8] RUN npm i -g prisma                                                                                       0.0s 
          => CACHED [api-pass-in dependencies 1/3] WORKDIR /usr/src/app                                                                                0.0s 
          => CACHED [api-pass-in build 2/5] COPY . .                                                                                                   0.0s 
          => CACHED [api-pass-in dependencies 2/3] COPY package.json package-lock.json ./                                                              0.0s 
          => CACHED [api-pass-in dependencies 3/3] RUN npm install                                                                                     0.0s 
          => CACHED [api-pass-in build 3/5] COPY --from=dependencies /usr/src/app/node_modules ./node_modules                                          0.0s 
          => CACHED [api-pass-in build 4/5] RUN npm run build:esm                                                                                      0.0s 
          => CACHED [api-pass-in build 5/5] RUN npm prune --prod                                                                                       0.0s 
          => CACHED [api-pass-in deploy 4/8] COPY --from=build /usr/src/app/dist ./dist                                                                0.0s 
          => CACHED [api-pass-in deploy 5/8] COPY --from=build /usr/src/app/node_modules ./node_modules                                                0.0s 
          => CACHED [api-pass-in deploy 6/8] COPY --from=build /usr/src/app/package.json ./package.json                                                0.0s 
          => CACHED [api-pass-in deploy 7/8] COPY --from=build /usr/src/app/prisma ./prisma                                                            0.0s 
          => CACHED [api-pass-in deploy 8/8] RUN npx prisma generate                                                                                   0.0s 
          => [api-pass-in] exporting to image                                                                                                          0.0s 
          => => exporting layers                                                                                                                       0.0s 
          => => writing image sha256:7aa827dc2070f3582a67da33d174d84901c01584e54319be76c4937e24dfe583                                                  0.0s 
          => => naming to docker.io/library/api-api-pass-in                                                                                            0.0s 
          [+] Running 1/1
          ✔ Container api_pass_in  Started     
          ```
  - Agora iremos preparar a aplicação para receber o postgres, removendo o arquivo dev.db que era usado pelo SQlite, depois indo no prisma configuramos para receber o postgres, depois removemos o migration_lock em migrations, depois em cada migration mudamos o *autoincrement*, porque no postgres não possui *autoincrement*, usamos o *serial* que é o equivalente ao *autoincrement* do SQlite, e o integer tambem não é necessario visto que um campo *serial* ja é um campo *integer* no postgres. Mudamos também o tipo *DATETIME* para *TIMESTAMP* 
  - Agora declaramos outro serviço dentro do docker-compose o postgres
  - Para rodar o docker-compose com o postgres basta rodar o ```docker-compose up --build -d``` ele vai fazer baixar, fazer o pull da imagem do postgres(postgres:16.2-alpine3.19) de acordo com a tag que foi definida e o build da nossa imagem(api-api-pass-in) e subir os dois containers(api-pass-in e db-pass-in) em um pacote de container(api(nome da nossa aplicação))
    ```bash
        [+] Running 10/10
        ✔ postgres 9 layers [⣿⣿⣿⣿⣿⣿⣿⣿⣿]      0B/0B      Pulled                                                                                                      10.9s 
          ✔ 4abcf2066143 Already exists                                                                                                                              0.0s 
          ✔ 128d1b74d24d Pull complete                                                                                                                               0.7s 
          ✔ 0a392327555d Pull complete                                                                                                                               0.6s 
          ✔ 0e14a31643e8 Pull complete                                                                                                                               5.7s 
          ✔ 904e95badb7d Pull complete                                                                                                                               1.2s 
          ✔ 8f6103a2e811 Pull complete                                                                                                                               1.4s 
          ✔ 02b106837f9f Pull complete                                                                                                                               1.8s 
          ✔ d34b010d3edc Pull complete                                                                                                                               2.0s 
          ✔ 696a345da38f Pull complete                                                                                                                               2.5s 
        [+] Building 10.2s (22/22) FINISHED                                                                                                                 docker:default
        => [api-pass-in internal] load build definition from Dockerfile                                                                                              0.0s
        => => transferring dockerfile: 5.48kB                                                                                                                        0.0s 
        => [api-pass-in internal] load metadata for docker.io/library/node:20-alpine3.19                                                                             0.0s 
        => [api-pass-in internal] load metadata for docker.io/library/node:20                                                                                        0.0s 
        => [api-pass-in internal] load .dockerignore                                                                                                                 0.0s 
        => => transferring context: 153B                                                                                                                             0.0s 
        => [api-pass-in base 1/1] FROM docker.io/library/node:20                                                                                                     0.0s 
        => [api-pass-in deploy 1/8] FROM docker.io/library/node:20-alpine3.19                                                                                        0.0s 
        => [api-pass-in internal] load build context                                                                                                                 0.0s 
        => => transferring context: 5.01kB                                                                                                                           0.0s
        => CACHED [api-pass-in dependencies 1/3] WORKDIR /usr/src/app                                                                                                0.0s 
        => CACHED [api-pass-in dependencies 2/3] COPY package.json package-lock.json ./                                                                              0.0s 
        => CACHED [api-pass-in dependencies 3/3] RUN npm install                                                                                                     0.0s 
        => [api-pass-in build 2/5] COPY . .                                                                                                                          0.0s 
        => [api-pass-in build 3/5] COPY --from=dependencies /usr/src/app/node_modules ./node_modules                                                                 2.4s 
        => [api-pass-in build 4/5] RUN npm run build:esm                                                                                                             1.1s 
        => [api-pass-in build 5/5] RUN npm prune --prod                                                                                                              2.1s 
        => CACHED [api-pass-in deploy 2/8] WORKDIR /usr/src/app                                                                                                      0.0s 
        => CACHED [api-pass-in deploy 3/8] RUN npm i -g prisma                                                                                                       0.0s 
        => CACHED [api-pass-in deploy 4/8] COPY --from=build /usr/src/app/dist ./dist                                                                                0.0s 
        => CACHED [api-pass-in deploy 5/8] COPY --from=build /usr/src/app/node_modules ./node_modules                                                                0.0s 
        => CACHED [api-pass-in deploy 6/8] COPY --from=build /usr/src/app/package.json ./package.json                                                                0.0s 
        => [api-pass-in deploy 7/8] COPY --from=build /usr/src/app/prisma ./prisma                                                                                   0.0s 
        => [api-pass-in deploy 8/8] RUN npx prisma generate                                                                                                          3.5s 
        => [api-pass-in] exporting to image                                                                                                                          0.3s 
        => => exporting layers                                                                                                                                       0.3s 
        => => writing image sha256:a480c10407aafab9949edc298586b5db0c6829764f10d5a62b1f3a6d47319570                                                                  0.0s 
        => => naming to docker.io/library/api-api-pass-in                                                                                                            0.0s 
        [+] Running 2/3
        ✔ Container db-pass-in-postgres  Started                                                                                                                     0.9s 
        - Container api_pass_in          Recreated                                                                                                                   1.2s 
        ✔ Container api-pass-in          Started                                                                                                                     0.4s
    ```

  - ```docker-compose up -d``` para subir a aplicação sem precisar buildar novamente
  - Para ver se os containers estão rodando basta rodar o ```docker ps``` e para ver todos os containers que ja rodaram basta rodar o ```docker ps -a``` ou container que existem mas que não estão rodando e que estão rodando```docker container ls```
  - Para ver o log dos nossos containers via CLI basta rodar o ```docker logs CONTAINER ID```, da para ver os logs via UI
  - Rodamos sempre com build para caso tenha alguma alteração no dockerfile ou no docker-compose quando alterar algo da nossa imagem, ele ja builda a nossa imagem(Dockerfile) e sobe os containers(serviços) com as alterações(api-pass-in e db-pass-in)
  - Para parar algum container especifico basta rodar o ```docker stop CONTAINER ID```
  - Para remover todos os containers basta rodar o ```docker-compose down```
  - Para remover algum container(ex: db-pass-in) especifico do nosso pacote de container(ex: api) basta rodar o ```docker rm CONTAINER ID``` lembrando que a imagem ainda vai estar la(ex:postgres:16.2-alpine3.19) no docker, ou seja, no sistema, para remover a imagem basta rodar o ```docker rmi IMAGE ID``` para ver os id das imagens basta rodar o ```docker image ls```
  - para subir somente o container que foi interrompido  basta rodar o ```docker-compose up -d NOME_DO_SERVIÇO``` --> ```docker-compose up -d postgres``` ou ```docker-compose up``` Sobe tudo que estiver  no docker-compose.yml
  - Caso seja necessario fazer migrations no banco de dados da nossa api ao subir os containers, basta ir no comando start no *package.json* e adicionar o comando de migration no start ```npm run db:migrate-deploy && node dist/server.mjs``` e no Dockerfile deixar no CMD npm start. Não tem problema de deixar o comando da migration no start, porque se paramos algum container que não seja da api(api-pass-in) ao dar o ```docker-compose up -d``` ele vai subir somente o container que foi interrompido, mas caso interrompa o container da api e execute o npm run start ao subir o container da api e rodar as migration não sera um problema, porque o volumes do postgres não são apagados, logo as migrations não serão executadas novamente
  - Então lembre de criar o volumes para o container do banco de dados, para que os dados não se percam quando o container do postgres for removido e quando o container da api desligar, subir e rodar a migrations novamente ao subir o container da api, para isso basta ir no docker-compose.yml e adicionar o volumes no container do Banco de dados.
  - Depois de um ```docker-compose up --build -d``` para subir a aplicação e pegar o novo *package.json* com o comando start alterado.