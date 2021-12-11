resource "aws_route53_record" "api" {
  zone_id = var.zone_id
  name    = "api.infinitestory.app"
  type    = "A"
  ttl     = "60"
  records = [aws_eip.web.public_ip]
}

resource "aws_route53_record" "api-dev" {
  zone_id = var.zone_id
  name    = "api-dev.infinitestory.app"
  type    = "A"
  ttl     = "60"
  records = [aws_eip.web.public_ip]
}

resource "aws_route53_record" "api-ws" {
  zone_id = var.zone_id
  name    = "api-ws-prod.infinitestory.app"
  type    = "A"
  ttl     = "60"
  records = [aws_eip.web.public_ip]
}

resource "aws_route53_record" "api-ws-dev" {
  zone_id = var.zone_id
  name    = "api-ws-dev.infinitestory.app"
  type    = "A"
  ttl     = "60"
  records = [aws_eip.web.public_ip]
}

resource "aws_route53_record" "frontend" {
  zone_id = var.zone_id
  name    = "infinitestory.app"
  type    = "A"
  ttl     = "60"
  records = [aws_eip.frontend.public_ip]
}

resource "aws_route53_record" "castle" {
  zone_id = var.zone_id
  name    = "castle.infinitestory.app"
  type    = "A"
  ttl     = "60"
  records = [aws_eip.castle.public_ip]
}

resource "aws_route53_record" "ssh" {
  zone_id = var.zone_id
  name    = "ssh.infinitestory.app"
  type    = "A"
  ttl     = "60"
  records = [aws_eip.nat.public_ip]
}

resource "aws_route53_record" "web-internal" {
  zone_id = var.private_zone_id
  name    = "web.hq.inf"
  type    = "A"
  ttl     = "60"
  records = [aws_instance.web.private_ip]
}

resource "aws_route53_record" "metric-internal" {
  zone_id = var.private_zone_id
  name    = "metric.hq.inf"
  type    = "A"
  ttl     = "60"
  records = [aws_instance.metric.private_ip]
}

resource "aws_route53_record" "frontend-internal" {
  zone_id = var.private_zone_id
  name    = "front.hq.inf"
  type    = "A"
  ttl     = "60"
  records = [aws_instance.frontend.private_ip]
}

resource "aws_route53_record" "castle-internal" {
  zone_id = var.private_zone_id
  name    = "castle.hq.inf"
  type    = "A"
  ttl     = "60"
  records = [aws_instance.castle.private_ip]
}

resource "aws_route53_record" "dev-internal" {
  zone_id = var.private_zone_id
  name    = "dev.hq.inf"
  type    = "A"
  ttl     = "60"
  records = [aws_instance.dev.private_ip]
}