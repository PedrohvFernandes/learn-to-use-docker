# Recurso cluster, o cluster ele pode ser um agregrador de recursos, de bancos de dados. Se criacimos pela interface, primeiro criamos o cluster e depois criamos o banco de dados. Quando esse recurso é criado, ou seja, o cluster, teremos o output do id do cluster, que é um atributo que podemos usar para referenciar o cluster em outros recursos.
resource "digitalocean_database_cluster" "db-cluster" {
  name    = "attendee-postgres"
  engine  = "pg"
  version = "16"
  # Tamanho da maquina(esse é o mais basico da digital ocean https://cloud.digitalocean.com/databases/new?i=db8298)
  size       = "db-s-1vcpu-1gb"
  region     = "nyc1"
  node_count = 1
}

# Recurso DB
resource "digitalocean_database_db" "db-name" {
  # O nosso banco é associado a um clustwer
  cluster_id = digitalocean_database_cluster.db-cluster.id
  name       = "attendee-postgres"


  # Fazemos com que o banco so pode ser criado apos a criação do cluster. Ou seja, o banco esta dependente do recurso cluster
  depends_on = [
    digitalocean_database_cluster.db-cluster
  ]
}
