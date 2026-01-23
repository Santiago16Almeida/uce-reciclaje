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
# 1. SECURITY GROUPS (Específicos para Cuenta 4)
# =====================================================

resource "aws_security_group" "sg_bastion_reports" {
  name        = "sg_bastion_reports_pro"
  vpc_id      = data.aws_vpc.default.id
  description = "Acceso SSH para la cuenta de Reportes"

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

resource "aws_security_group" "sg_alb_reports" {
  name        = "sg_alb_reports_pro"
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

resource "aws_security_group" "sg_microservicios_reports" {
  name        = "sg_microservicios_reports_pro"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_bastion_reports.id]
  }

  # Puertos: Report (3012), Notification (3007), Deposit (3002)
  ingress {
    from_port       = 3000
    to_port         = 3015
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_alb_reports.id]
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

resource "aws_instance" "bastion_reports" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t2.micro"
  key_name      = "vockey"
  vpc_security_group_ids = [aws_security_group.sg_bastion_reports.id]

  tags = { Name = "JumpBox-Reports-Notifications" }
}

resource "aws_launch_template" "lt_reports" {
  name_prefix   = "lt-reports-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"
  key_name      = "vockey"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.sg_microservicios_reports.id]
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

resource "aws_lb" "alb_reports" {
  name               = "alb-reports-pro"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg_alb_reports.id]
  subnets            = data.aws_subnets.default.ids
}

# Target Group para Report-Service (Puerto principal 3012)
resource "aws_lb_target_group" "tg_reports" {
  name     = "tg-reports-services"
  port     = 3012
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path = "/health"
    port = "3012"
  }
}

resource "aws_lb_listener" "http_reports" {
  load_balancer_arn = aws_lb.alb_reports.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_reports.arn
  }
}

resource "aws_autoscaling_group" "asg_reports" {
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1
  target_group_arns   = [aws_lb_target_group.tg_reports.arn]
  vpc_zone_identifier = data.aws_subnets.default.ids

  launch_template {
    id      = aws_launch_template.lt_reports.id
    version = "$Latest"
  }
}

# =====================================================
# 3. OUTPUTS
# =====================================================
output "ip_publica_bastion_reports" {
  value = aws_instance.bastion_reports.public_ip
}

output "dns_load_balancer_reports" {
  value = aws_lb.alb_reports.dns_name
}