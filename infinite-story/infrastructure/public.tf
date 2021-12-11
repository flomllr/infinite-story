/*
  Web Servers
*/
resource "aws_security_group" "web" {
  name        = "vpc_web"
  description = "Allow incoming HTTP connections."

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

    #Node_export metrics across the private vpc
  ingress {
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  # flower
  ingress {
    from_port   = 10000
    to_port     = 10000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress {
    from_port   = 10000
    to_port     = 10000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  ## Gunicorn StatsD exporter
  ingress {
    from_port   = 9102
    to_port     = 9102
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 9102
    to_port     = 9102
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  #END: Node_export metrics across the private vpc

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = [var.vpc_cidr]
  }
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  # to the dev server api
  egress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  # redis in the private subnet
  egress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  # Prometheus
  egress {
    from_port   = 9090
    to_port     = 9090 
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  # dev api websocket
  egress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  vpc_id = aws_vpc.default.id

  tags = {
    Name = "Public Security Group"
  }
}

resource "aws_instance" "castle" {
  ami                         = lookup(var.castle-ami, var.region)
  availability_zone           = var.availability_zone
  instance_type               = "t3.small"
  key_name                    = var.aws_key_name
  vpc_security_group_ids      = [aws_security_group.web.id]
  subnet_id                   = aws_subnet.public.id
  associate_public_ip_address = true
  source_dest_check           = false

  tags = {
    Name = "Castle"
  }
}

resource "aws_instance" "web" {
  ami                         = lookup(var.web-ami, var.region)
  availability_zone           = var.availability_zone
  instance_type               = "t2.large"
  key_name                    = var.aws_key_name
  vpc_security_group_ids      = [aws_security_group.web.id]
  subnet_id                   = aws_subnet.public.id
  associate_public_ip_address = true
  source_dest_check           = false
  user_data = file("./start-web-instance.sh")

  tags = {
    Name = "API server"
  }
}
resource "aws_instance" "frontend" {
  ami                         = lookup(var.frontend-ami, var.region)
  availability_zone           = var.availability_zone
  instance_type               = "t2.large"
  key_name                    = var.aws_key_name
  vpc_security_group_ids      = [aws_security_group.web.id]
  subnet_id                   = aws_subnet.public.id
  associate_public_ip_address = true
  source_dest_check           = false
  user_data = file("./start-frontend-instance.sh")

  tags = {
    Name = "Frontend server"
  }
}

resource "aws_eip" "web" {
  instance = aws_instance.web.id
  vpc      = true
}

resource "aws_eip" "frontend" {
  instance = aws_instance.frontend.id
  vpc      = true
}

resource "aws_eip" "castle" {
  instance = aws_instance.castle.id
  vpc      = true
}
