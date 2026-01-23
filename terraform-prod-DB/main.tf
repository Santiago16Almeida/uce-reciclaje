provider "aws" {
  region = "us-east-1"
}

# --- RED ---
resource "aws_vpc" "uce_vpc_prod" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "uce-vpc-data-prod" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.uce_vpc_prod.id
  tags   = { Name = "uce-igw-prod" }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.uce_vpc_prod.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.uce_vpc_prod.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.rt.id
}

# --- SEGURIDAD ---
resource "aws_security_group" "data_sg" {
  name        = "uce-data-sg-prod"
  vpc_id      = aws_vpc.uce_vpc_prod.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # POSTGRES (Mapeo 5433)
  ingress {
    from_port   = 5433
    to_port     = 5433
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # MONGODB
  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # REDIS
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # KAFKA (9092)
  ingress {
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # ZOOKEEPER (2181)
  ingress {
    from_port   = 2181
    to_port     = 2181
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # DASHBOARD (5000)
  ingress {
    from_port   = 5000
    to_port     = 5000
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

# --- INSTANCIA ---
resource "aws_instance" "data_server_powerful" {
  ami           = "ami-05b10e08d247fb927" 
  instance_type = "t3.large"
  key_name      = "vockey"

  vpc_security_group_ids = [aws_security_group.data_sg.id]
  subnet_id              = aws_subnet.public_subnet.id

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    delete_on_termination = true
  }

  tags = {
    Name    = "UCE-Prod-Data-Server-HighRAM"
    Project = "Produccion-Reciclaje"
  }
}

output "prod_data_ip" {
  value = aws_instance.data_server_powerful.public_ip
}