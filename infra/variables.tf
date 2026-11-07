variable "aws_region" {
  description = "AWS region for every resource. Use the same value in GitHub as the AWS_REGION secret."
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 size. t3.micro is enough for this assignment."
  type        = string
  default     = "t3.micro"
}

variable "public_key_path" {
  description = "Path to the SSH public key that GitHub Actions will use to log in."
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "Who may open an SSH session. Tighten this to your own IP when you can."
  type        = string
  default     = "0.0.0.0/0"
}
