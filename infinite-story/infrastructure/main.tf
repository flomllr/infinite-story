provider "aws" {
  access_key = "CHANGE_ME"
  secret_key = "CHANGE_ME"
  region     = var.region
}

output "nat-public-dns" {
  value = aws_instance.nat.public_dns
}

output "castle-public-ip" {
  value = aws_instance.castle.public_ip
}

output "castle-private-ip" {
  value = aws_instance.castle.private_ip
}

output "ec2user-id" {
  value = aws_iam_access_key.prometheus-user.id
}

output "ec2user-secret" {
  value = aws_iam_access_key.prometheus-user.secret
}