Diagnostico dessa aplicação: Pode usar o npm, pnpm ou Yarn
Podemos ter dois arquivos do docker, um para dev dev.Dockerfile e outro para prod prod.Dockerfile, mas nesse caso iremos fazer somente para prod Dockerfile. O arquivo dockerfile funciona como o arquivo index de uma aplicação

- dev:
  - preparativo:
    - npm install
    - npm prisma generate(Gera os arquivos necessários para o prisma funcionar)

  - execução:
    - npm run dev(Orientado ao mundo do desenvolvimento, com hot reload e etc.)

- prod:
  - preparativo:
    - npm install
    - npm run build
    - npm prune --prod
    - npm prisma generate

  - execução:
    - npm run start(Orientado ao mundo da produção, sem hot reload e etc. Onde ele roda o build que foi gerado anteriormente)