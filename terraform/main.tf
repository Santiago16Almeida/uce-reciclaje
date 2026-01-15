provider "aws" {
  region = "us-east-1" # Learner Lab siempre usa North Virginia
}

# 1. VPC (Permitido en Learner Lab)
resource "aws_vpc" "uce_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "uce-reciclaje-vpc" }
}

# 2. Subredes (Permitido)
resource "aws_subnet" "public_sub" {
  vpc_id                  = aws_vpc.uce_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
  tags = { Name = "uce-public-subnet" }
}

# 3. Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.uce_vpc.id
  tags   = { Name = "uce-igw" }
}

# 4. Tabla de Rutas
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.uce_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_sub.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group para el Bastion
resource "aws_security_group" "bastion_sg" {
  name        = "bastion-sg-uce"
  vpc_id      = aws_vpc.uce_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Bastion / Jump Box
resource "aws_instance" "bastion" {
  ami = "ami-0440d3b780d96b29d"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public_sub.id
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  
  # IMPORTANTE: En AWS Academy esta línea es vital si necesitas roles
  # iam_instance_profile = "LabInstanceProfile" 

  tags = {
    Name = "UCE-Despliegue-QA"
  }
}

output "bastion_ip" {
  value = aws_instance.bastion.public_ip
}