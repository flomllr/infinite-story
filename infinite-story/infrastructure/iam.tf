resource "aws_iam_role" "ec2_s3_access_role" {
  name               = "s3-role"
  assume_role_policy = file("./assumerolepolicy.json")

}

resource "aws_iam_policy" "s3-policy" {
  name        = "s3-read-write-policy"
  description = "Read from s3 policy"
  policy      = file("./s3policy.json")
}

resource "aws_iam_policy" "ec2-read-policy" {
  name        = "ec2-read-policy"
  description = "Read from ec2 policy"
  policy      = file("./ec2readpolicy.json")
}

resource "aws_iam_user" "prometheus-user" {
  name = "prometheus-user"
}

resource "aws_iam_user_policy_attachment" "ec2-read-attach" {
  user       = aws_iam_user.prometheus-user.name
  policy_arn = aws_iam_policy.ec2-read-policy.arn
}

resource "aws_iam_access_key" "prometheus-user" {
  user    = aws_iam_user.prometheus-user.name
}



resource "aws_iam_policy_attachment" "s3-attachment" {
  name       = "s3-attachment"
  roles      = [aws_iam_role.ec2_s3_access_role.name]
  policy_arn = aws_iam_policy.s3-policy.arn
}

resource "aws_iam_instance_profile" "s3_profile" {
  name  = "s3_profile"
  role = aws_iam_role.ec2_s3_access_role.name
}