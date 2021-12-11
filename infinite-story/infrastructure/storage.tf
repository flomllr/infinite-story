resource "aws_s3_bucket" "model-bucket" {
  bucket = var.s3_model_bucket_name
  acl    = "private"

  tags = {
    Name        = "Model Bucket"
  }
}