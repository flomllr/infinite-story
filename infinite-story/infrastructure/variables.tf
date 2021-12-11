variable "region" {
  default = "eu-central-1"
}

variable "availability_zone" {
    default = "eu-central-1a"
}

variable "availability_zone_extra" {
    default = "eu-central-1b"
}

variable "zone_id" {
    default = "Z077176629OQ9NT0NQ28Y"
}

variable "private_zone_id" {
    default = "Z0144263569KOF9R1E9C"
}

variable "aws_key_name" {
  default = "justin-mac"
}

variable "s3_model_bucket_name" {
  default = "infinite-story-bucket-year2"
}

variable "redis_broker" {
  default = "redis://cluster.cgerza.0001.euc1.cache.amazonaws.com/0"
}

variable "nat-ami" {
  type = map(string)
  default = {
    "eu-central-1" = "ami-001b36cbc16911c13" # AWS Ami
    # TODO
    "us-west-1" = "ami-05f3512a49bdcff76"
  }
}

variable "web-ami" {
  type = map(string)
  default = {
    "eu-central-1" = "ami-05dea5c8173a4fb22" # Our custom one
    # TODO
    "us-west-1" = "ami-05f3512a49bdcff76"
  }
}

variable "metric-ami" {
  type = map(string)
  default = {
    "eu-central-1" = "ami-037261dd9895a00e6" # Our custom one
    # TODO
    "us-west-1" = "ami-05f3512a49bdcff76"
  }
}

variable "frontend-ami" {
  type = map(string)
  default = {
    "eu-central-1" = "ami-0c5e041d6e18a5e94" # Our custom one
    # TODO
    "us-west-1" = "ami-05f3512a49bdcff76"
  }
}

variable "castle-ami" {
  type = map(string)
  default = {
    "eu-central-1" = "ami-0f35293eaaa48f38a" # Our custom one
    # TODO
    "us-west-1" = "ami-05f3512a49bdcff76"
  }
}

variable "dev-ami" {
  type = map(string)
  default = {
    "eu-central-1" = "ami-05e5dba84479f613a" # Our custom one
    # TODO
    "us-west-1" = "ami-05f3512a49bdcff76"
  }
}

variable "vpc_cidr" {
  description = "CIDR for the whole VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for the Public Subnet"
  default     = "10.0.0.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR for the Private Subnet"
  default     = "10.0.1.0/24"
}

variable "private_subnet_extra_zone_cidr" {
  description = "CIDR for the Private Extra Zone Subnet"
  default     = "10.0.2.0/24"
}