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

# 2. Subredes (Dos zonas para el Load Balancer)
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

  # Regla para SSH (Puerto 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regla para permitir PING (ICMP) para diagnóstico
  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group para el Balanceador (Restaurado para evitar el error de referencia)
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
  name     = "api-gateway-tg"
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
  ami                         = "ami-0440d3b780d96b29d"
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.public_sub_1.id
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  
  # Usar llave por defecto de AWS Academy
  key_name                    = "vockey" 
  
  # Asegurar IP pública para acceso externo
  associate_public_ip_address = true

  tags = { Name = "UCE-Despliegue-QA" }
}

# 7. OUTPUT PARA VER LA IP
output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
}