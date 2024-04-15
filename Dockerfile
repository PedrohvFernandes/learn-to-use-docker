# Construindo a nossa imagem para produção

# Primeiro estagio
# Queremos trabalhar com base na imagem do node, basicamente um link https://hub.docker.com/_/node/ --> 1.1Giga bytes uma versão pura/completa, essa 20 trabalha com debian. Como iremos usar o alpine que é mais leve para executar a aplicação, iremos usar a versão 20 para caso precisarmos de algo mais pesado ou de algum pacote/recurso que não tenha no alpine, podemos usar essa versão --> Conceito de multi-estaged build, ou seja, podemos fazer um build em multiplos estagios, por exemplo talvez aqui precisamos do node 20 para pegar algo que não existe na versão enxuta que é a 20-alpine3.19, então podemos fazer um build de multiplos estagios, então eu posso ter um estagio especifico que vai olhar para a node 20, o outro pode reaproveitar a imagem desse estagio, ou seja, reparoveitar recurssos, e o outro pode usar outra imagem. Aqui por exemplo iremos pegar a imagem node:20 para instalar as dependencias e fazer o build da aplicação
# O nome base nada mais é que um alias(AS - apelido) para a imagem node:20
FROM node:20 AS base

# O run é um comando que roda alguma instrução dentro de uma imagem base
# O comando abaixo instala o pnpm porque a node:20 não tem ele, mas isso seria para quem estiver usando o pnpm
# RUN npm i -g pnpm

# Segundo estagio, toda vez que eu coloco um from é outro estagio, e os demais estagios pode usar recusos do estagio anterior e tudo o que você instalou no estagio anterior, você pode reaproveitar.
# Nesse estagio iremos instalar as dependencias
FROM base AS dependencies

# Quando entramos em um sistema operacional, precisamos definir um diretorio de trabalho, com isso, usamos o workdir é um comando que muda o diretorio de trabalho. Se não definir ele vai trabalhar no diretorio da raiz do Sistema operacional(SO). Isso aqui é um opção, não é obrigatorio, mas é uma boa pratica
WORKDIR /usr/src/app

# Dessa forma pega todos os arquivos que começam com package e terminam com .json sem precisar especificar o nome de cada um
# COPY package*.json ./     

# ou:

# Pegamos o package.json e o package-lock.json da nossos arquivos(interface, ou seja, os arquivos da aplicação) e copiamos para o diretorio de trabalho WORKDIR para insatalar as dependencias no docker. O nosso ./ é a raiz do diretorio de trabalho que definimos acima, se não tivessimos definido o WORKDIR, ele iria instalar na raiz do SO
COPY package.json package-lock.json ./
# Ele gera o node_module apos a instalação do npm install, o node_modules fica na raiz do diretorio de trabalho --> WORKDIR /usr/src/app --> /usr/src/app/node_modules
# RUN pnpm install
RUN npm install

# Terceiro estagio, é a parte do build da aplicação
FROM base AS build

WORKDIR /usr/src/app

# Copia tudo .(tudo) .(para direito de trbalho) --> os arquivos(interface, ou seja, os arquivos da aplicação) para o diretorio atual de trabalho, com isso, conseguimos fazer o build, gerar o dist dentro do diretorio de trabalho. Mas dentro do .dockerignore podemos ignorar o node_modules, dist entre outras coisas que estão aqui nessa interface.
# Ignoramos o node_modules e o dist(caso ela persista aqui na interface) daqui porque não precisamos deles, porque vamos instalar as dependencias no estagio anterior e vamos gerar o dist no estagio atual para o diretorio de trabalho
COPY . .
# E por conta que ignoramos o node_modules, precisamos usar a node_module gerada no estagio anterior(--from=dependencies) nesse estagio atual para buildar a aplicação e não desse diretorio atual(arquivos da interface)
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN npm run build:esm
# O prune é um comando que remove as dependencias de desenvolvimento, ou seja, as dependencias que não são necessarias para rodar a aplicação em produção
RUN npm prune --prod

# quarto  estagio, vamos rodar o projeto e executar o prisma. So que dessa vez iremos utilizar uma base que pesa menos que a anterior por conta da via de regra porque aqui nos trabalhamos com alpine --> 135mb. O alpine nos usamos mais para executar a nossa aplicação, onde não preicisamos da imagem anterior que é mais pesada que tem muitos recursos que não precisamos
FROM node:20-alpine3.19 AS deploy

WORKDIR /usr/src/app

# Poderiamos reaproveitar o node_modules com o pnpm do estagio anterior, mas para facilitar podemos instalar novamente
#RUN npm i -g pnpm prisma
RUN npm i -g prisma

# Copiando os arquivos do estagio de build para o diretorio de trabalho do estagio atual. Essas pastinhas existem no estagio de build porque copiamos tudo(.) para(.) direito de trabalho.
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/prisma ./prisma

# Env passando direto no dockerfile, mas o ideal é criar um dotenv, caso seja alguma info sensivel das variaveis de ambiente
# ENV DATABASE_URL="file:./dev.db"
# ENV NODE_ENV=development

RUN npx prisma generate

# PARA EXPOR A PORTA da aplicação API ou outro tipo de eaplicação, uma boa pratica
EXPOSE 3000

# Comando de saida da imagem, para rodar a aplicação olhando para os estagios ateriores

# ENTRYPOINT [ "npm", "start" ]

# ou:

# CMD npm run start

# ou:

CMD [ "npm", "start" ]