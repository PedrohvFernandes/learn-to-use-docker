# Do --> Digital Ocean
# A variavel vem de forma injetada, pela env do terraform.tfvars
variable "do_token" {
  type        = string
  description = "DigitalOcean toke"
}