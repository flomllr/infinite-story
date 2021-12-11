resource "aws_instance" "nlp" {
  ami                    = local.nlp-worker-ami[var.region]
  instance_type          = "c5.2xlarge"
  availability_zone      = var.availability_zone
  key_name               = var.key_name
  iam_instance_profile   = var.s3_profile_name
  vpc_security_group_ids = [var.security_group_id]
  subnet_id              = var.subnet_id
  source_dest_check      = false
  user_data = file("${path.module}/start-nlp-instance.sh")

  tags = {
    Name = "Nlp Server ${var.counter}"
  }
}