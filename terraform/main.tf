# 1. Definir el proveedor (AWS) y la región
provider "aws" {
  region = "us-east-1" 
}

# 2. Requisito 18: Crear una Red (VPC) para Alta Disponibilidad
resource "aws_vpc" "uce_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "VPC-UCE-RECICLAJE" }
}

# 3. Requisito 5: Crear el Bastion Host (Jump Box)
# Es un servidor seguro para entrar a administrar los demás sin exponerlos a internet
resource "aws_instance" "bastion_host" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2
  instance_type = "t2.micro"
  
  tags = {
    Name = "UCE-JumpBox-Bastion"
    Role = "Security-Gateway"
  }
}

# 4. Requisito 11: Simulación de Base de Datos RDS (Postgres)
resource "aws_db_instance" "usuarios_db" {
  allocated_storage    = 20
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  db_name              = "uce_users"
  username             = "admin_uce"
  password             = "password_segura_123"
  skip_final_snapshot  = true
  multi_az             = true # <--- REQUISITO 18: ALTA DISPONIBILIDAD
}