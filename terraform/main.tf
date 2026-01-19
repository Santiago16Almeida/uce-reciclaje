provider "aws" {
  region = "us-east-1"
}

# 1. VPC
resource "aws_vpc" "uce_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = "uce-reciclaje-vpc" }
}

# 2. Subredes
resource "aws_subnet" "public_sub_1" {
  vpc_id                  = aws_vpc.uce_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
  tags                    = { Name = "uce-public-subnet-1" }
}

resource "aws_subnet" "public_sub_2" {
  vpc_id                  = aws_vpc.uce_vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1b"
  tags                    = { Name = "uce-public-subnet-2" }
}

# 3. Internet Gateway e Internet Access
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.uce_vpc.id
  tags   = { Name = "uce-igw" }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.uce_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "a1" {
  subnet_id      = aws_subnet.public_sub_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "a2" {
  subnet_id      = aws_subnet.public_sub_2.id
  route_table_id = aws_route_table.public_rt.id
}

# 4. Security Groups
resource "aws_security_group" "bastion_sg" {
  name   = "bastion-sg-uce"
  vpc_id = aws_vpc.uce_vpc.id

  # Acceso SSH (Para que puedas entrar por terminal)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # --- PUERTOS PARA MICROSERVICIOS ---
  # Esto permite que el Gateway (Cuenta 3) hable con los demás
  ingress {
    from_port   = 3000
    to_port     = 3011
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # --- PUERTO PARA EL DASHBOARD ---
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # --- PUERTO PARA gRPC (Auth Service) ---
  ingress {
    from_port   = 50051
    to_port     = 50051
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida a internet permitida para descargar Docker e imágenes
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "alb_sg" {
  name   = "alb-sg-uce"
  vpc_id = aws_vpc.uce_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
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

# 5. Load Balancer
resource "aws_lb" "uce_alb" {
  name               = "uce-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_sub_1.id, aws_subnet.public_sub_2.id]
}

resource "aws_lb_target_group" "api_tg" {
  name     = "api-gateway-tg-final"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.uce_vpc.id
  health_check {
    path = "/health"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.uce_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_tg.arn
  }
}

# 6. EC2 Bastion
resource "aws_instance" "bastion" {
  ami                         = "ami-05b10e08d247fb927" 
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.public_sub_1.id
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  key_name                    = "vockey" 
  associate_public_ip_address = true

  tags = { Name = "UCE-Despliegue-QA" }
}

# 7. REGISTRO ECR (ALMACÉN DE DOCKER)
resource "aws_ecr_repository" "uce_repo" {
  name                 = "uce-proyecto-nuevo"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
  
}

# 8. OUTPUTS
output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
}

output "auth_ecr_url" {
  value = aws_ecr_repository.uce_repo.repository_url
}