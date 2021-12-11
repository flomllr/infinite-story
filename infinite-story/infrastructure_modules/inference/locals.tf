locals {
  # Our own custom nlp worker ami
  inference-worker-ami = {
    "eu-central-1" = "ami-03e2dfb0f31b8e116"
    # TODO
    "us-west-1" = "ami-05f3512a49bdcff76"
  }
}
