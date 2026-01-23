provider "aws" {
  region = "us-east-1"
}

# =====================================================
# 0. DATA SOURCES
# =====================================================
data "aws_vpc" "default" {
  default = true
}

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
# 1. SECURITY GROUPS (Específicos para Cuenta 2)
# =====================================================

# Reutilizamos el concepto de Bastión para esta cuenta
resource "aws_security_group" "sg_bastion_iot" {
  name        = "sg_bastion_iot_pro"
  vpc_id      = data.aws_vpc.default.id
  description = "Acceso SSH gestionado Cuenta IoT"

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

resource "aws_security_group" "sg_alb_iot" {
  name        = "sg_alb_iot_pro"
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

resource "aws_security_group" "sg_microservicios_iot" {
  name        = "sg_microservicios_iot_pro"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_bastion_iot.id]
  }

  # Puertos para IoT (3011), Audit (3008) y Reward (3006)
  ingress {
    from_port       = 3000
    to_port         = 3015
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_alb_iot.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# =====================================================
# 2. COMPUTO Y ALTA DISPONIBILIDAD (IoT/Audit/Reward)
# =====================================================

resource "aws_instance" "bastion_iot" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t2.micro"
  key_name      = "vockey"
  vpc_security_group_ids = [aws_security_group.sg_bastion_iot.id]

  tags = { Name = "JumpBox-IoT-Audit" }
}

resource "aws_launch_template" "lt_iot" {
  name_prefix   = "lt-iot-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"
  key_name      = "vockey"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.sg_microservicios_iot.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user
              chmod 666 /var/run/docker.sock
              EOF
  )
}

resource "aws_lb" "alb_iot" {
  name               = "alb-iot-pro"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg_alb_iot.id]
  subnets            = data.aws_subnets.default.ids
}

# Target Group para IoT-Gateway (Puerto principal 3011)
resource "aws_lb_target_group" "tg_iot" {
  name     = "tg-iot-services"
  port     = 3011
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path = "/health" # Asegúrate que el IoT Gateway tenga este endpoint
    port = "3011"
  }
}

resource "aws_lb_listener" "http_iot" {
  load_balancer_arn = aws_lb.alb_iot.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_iot.arn
  }
}

resource "aws_autoscaling_group" "asg_iot" {
  desired_capacity    = 1 # Puedes subirlo a 2 para producción
  max_size            = 2
  min_size            = 1
  target_group_arns   = [aws_lb_target_group.tg_iot.arn]
  vpc_zone_identifier = data.aws_subnets.default.ids

  launch_template {
    id      = aws_launch_template.lt_iot.id
    version = "$Latest"
  }
}

# =====================================================
# 3. OUTPUTS
# =====================================================
output "ip_publica_bastion_iot" {
  value = aws_instance.bastion_iot.public_ip
}

output "dns_load_balancer_iot" {
  value = aws_lb.alb_iot.dns_name
}