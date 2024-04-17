# Poderiamos trabalhar com sdk ou ate mesmo com linguagens de programação, mas iremos usar o Syntax - Configuration Language  que parece um JSON

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "2.36.0"
    }
  }
}

provider "digitalocean" {
  # Esse token pegamos em digitalonce>api>Generate New Token>Token name>No expire>Mark Write (optional) porque iremos trabalhar com Tf e vamos precisar de permissão de escrita. Poderiamos montar um github actions para criar essas variaveis secretas por la e ter uma pipeline de infraestrutura, ao infez de rodar isso aqui localmente
  token = var.do_token
}