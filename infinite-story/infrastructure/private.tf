resource "aws_security_group" "private" {
  name        = "vpc_private"
  description = "Allow incoming connections inside the cluster. for inference, nlp, redis, and prometheus"

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
  #postgress
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  #web socket pub sub
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  #dev api server
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  #redis
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # Prometheus
  ingress {
    from_port   = 9090
    to_port     = 9090 
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress {
    from_port   = 9090
    to_port     = 9090 
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  # END: Prometheus

  # ingress {
  #   from_port   = 5432
  #   to_port     = 5432
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  #Node_export metrics across the private vpc
  ingress {
    from_port   = 9100
    to_port     = 9100
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
  egress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
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
    Name = "Private server security group"
  }
}

module "inference1" {
  source = "../infrastructure_modules/inference"
  counter = 1
  region = var.region
  key_name = var.aws_key_name
  availability_zone = var.availability_zone
  subnet_id = aws_subnet.private.id
  s3_profile_name = aws_iam_instance_profile.s3_profile.name
  security_group_id = aws_security_group.private.id
}

module "inference2" {
  source = "../infrastructure_modules/inference"
  counter = 2
  region = var.region
  key_name = var.aws_key_name
  availability_zone = var.availability_zone
  subnet_id = aws_subnet.private.id
  s3_profile_name = aws_iam_instance_profile.s3_profile.name
  security_group_id = aws_security_group.private.id
}

module "inference3" {
  source = "../infrastructure_modules/inference"
  counter = 3
  region = var.region
  key_name = var.aws_key_name
  availability_zone = var.availability_zone
  subnet_id = aws_subnet.private.id
  s3_profile_name = aws_iam_instance_profile.s3_profile.name
  security_group_id = aws_security_group.private.id
}

module "inference4" {
  source = "../infrastructure_modules/inference"
  counter = 4
  region = var.region
  key_name = var.aws_key_name
  availability_zone = var.availability_zone
  subnet_id = aws_subnet.private.id
  s3_profile_name = aws_iam_instance_profile.s3_profile.name
  security_group_id = aws_security_group.private.id
}

module "nlp1" {
  source = "../infrastructure_modules/nlp"
  counter = 1
  region = var.region
  key_name = var.aws_key_name
  availability_zone = var.availability_zone
  subnet_id = aws_subnet.private.id
  s3_profile_name = aws_iam_instance_profile.s3_profile.name
  security_group_id = aws_security_group.private.id
}


data "template_file" "metric-init-script" {
  template = file("./start-metric-instance.sh")
  vars = {
    region = var.region
    access_key = aws_iam_access_key.prometheus-user.id
    secret_key = aws_iam_access_key.prometheus-user.secret
    redis_broker = var.redis_broker
  }
}

resource "aws_instance" "metric" {
  ami                         = var.metric-ami[var.region]
  availability_zone           = var.availability_zone
  instance_type               = "t3.small"
  key_name                    = var.aws_key_name
  vpc_security_group_ids      = [aws_security_group.private.id]
  subnet_id                   = aws_subnet.private.id
  source_dest_check           = false
  user_data                   = data.template_file.metric-init-script.rendered

  tags = {
    Name = "Metric"
  }
}

resource "aws_instance" "dev" {
  ami                         = var.dev-ami[var.region]
  availability_zone           = var.availability_zone
  instance_type               = "g4dn.2xlarge"
  key_name                    = var.aws_key_name
  vpc_security_group_ids      = [aws_security_group.private.id]
  subnet_id                   = aws_subnet.private.id
  source_dest_check           = false

  tags = {
    Name = "Dev"
  }
}


resource "aws_elasticache_subnet_group" "subnet_elasticache" {
  name       = "cache-subnet"
  subnet_ids = [aws_subnet.private.id]
}


resource "aws_elasticache_cluster" "cluster" {
  cluster_id           = "cluster"
  engine               = "redis"
  node_type            = "cache.t2.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  engine_version       = "3.2.10"
  port                 = 6379
  security_group_ids   = [aws_security_group.private.id]
  subnet_group_name    = aws_elasticache_subnet_group.subnet_elasticache.name
  availability_zone    = var.availability_zone
}