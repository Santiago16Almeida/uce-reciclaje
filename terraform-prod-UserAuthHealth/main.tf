provider "aws" {
  region = "us-east-1"
}

# =====================================================
# 0. DATA SOURCES
# =====================================================

data "aws_vpc" "default" {
  default = true
}

# FILTRO ACTUALIZADO: Excluimos us-east-1e para evitar el error de t3.medium
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "availability-zone"
    values = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1f"]
  }
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

# =====================================================
# 1. SECURITY GROUPS
# =====================================================

resource "aws_security_group" "sg_bastion" {
  name        = "sg_bastion_pro"
  vpc_id      = data.aws_vpc.default.id
  description = "Acceso SSH gestionado"

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

resource "aws_security_group" "sg_alb" {
  name        = "sg_alb_pro"
  vpc_id      = data.aws_vpc.default.id

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

resource "aws_security_group" "sg_microservicios" {
  name        = "sg_microservicios_pro"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_bastion.id]
  }

  ingress {
    from_port       = 3000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# =====================================================
# 2. COMPUTO Y ALTA DISPONIBILIDAD
# =====================================================

resource "aws_instance" "bastion" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t2.micro"
  key_name      = "vockey"
  vpc_security_group_ids = [aws_security_group.sg_bastion.id]

  tags = { Name = "JumpBox-Bastion" }
}

resource "aws_launch_template" "lt_backend" {
  name_prefix   = "lt-backend-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"
  key_name      = "vockey"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.sg_microservicios.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y git nodejs
              npm install -g nx
              EOF
  )
}

resource "aws_lb" "alb" {
  name               = "alb-sistema-pro"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg_alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "tg" {
  name     = "tg-servicios-backend"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path = "/health"
    port = "3002"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

resource "aws_autoscaling_group" "asg" {
  desired_capacity    = 2
  max_size            = 4
  min_size            = 1
  target_group_arns   = [aws_lb_target_group.tg.arn]
  vpc_zone_identifier = data.aws_subnets.default.ids

  # Pequeño delay para permitir que las instancias se estabilicen
  wait_for_capacity_timeout = "5m"

  launch_template {
    id      = aws_launch_template.lt_backend.id
    version = "$Latest"
  }
}

# =====================================================
# 3. OUTPUTS
# =====================================================
output "ip_publica_bastion" {
  value = aws_instance.bastion.public_ip
}

output "dns_load_balancer" {
  value = aws_lb.alb.dns_name
}