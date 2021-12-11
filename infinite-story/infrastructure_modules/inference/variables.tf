variable "counter" {
  description = "The counter of the node"
  type        = number
}

variable "region" {
  description = "The region of the node"
  type        = string
}

variable "availability_zone" {
  description = "The zone of the node"
  type        = string
}

variable "key_name" {
  description = "The name of the key"
  type        = string
}

variable "subnet_id" {
  description = "The id of the subnet"
  type        = string
}

variable "s3_profile_name" {
  description = "The name of the profile with s3 access"
  type        = string
}

variable "security_group_id" {
  description = "The id of the security group"
  type        = string
}