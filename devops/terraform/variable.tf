variable "region" {

    description = "The AWS region to deploy resources in"
    type        = string
    default     = "us-east-1"
  
}


variable "cluster_name" {
    description = "The name of the EKS cluster"
    type        = string
    default     = "pipeline-cluster"
}


variable "node_count" {
    description = "The number of worker nodes in the EKS cluster"
    type        = number
    default     = 2
}

variable "node_instance_type" {
    description = "The EC2 instance type for the worker nodes"
    type        = string
    default     = "t3.small"
  
}


variable "node_max_size" {
    description = "The maximum number of worker nodes in the EKS cluster"
    type        = number
    default     = 3
    
}

variable "nodes_desired_size" {
    description = "The desired number of worker nodes in the EKS cluster"
    type        = number
    default     = 2
}