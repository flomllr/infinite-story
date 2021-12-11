resource "aws_instance" "inference" {
  ami                    = local.inference-worker-ami[var.region]
  instance_type          = "g4dn.xlarge"
  availability_zone      = var.availability_zone
  key_name               = var.key_name
  iam_instance_profile   = var.s3_profile_name
  vpc_security_group_ids = [var.security_group_id]
  subnet_id              = var.subnet_id
  source_dest_check      = false
  user_data = file("${path.module}/start-inference-instance.sh")

  tags = {
    Name = "Inference Server ${var.counter}"
  }
}