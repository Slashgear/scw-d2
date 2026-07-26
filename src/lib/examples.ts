export interface Example {
  id: string
  label: string
  code: string
}

export const EXAMPLES: Example[] = [
  {
    id: 'web-app',
    label: '3-tier web app',
    code: `vpc: Private Network {
  icon: scw:cat-network

  lb: Load Balancer { icon: scw:lb }
  web1: Web Server { icon: scw:instance }
  web2: Web Server { icon: scw:instance }
  db: Managed Database { icon: scw:rdb }
  cache: Cache { icon: scw:redis }
}

storage: Object Storage { icon: scw:object-storage }
registry: Container Registry { icon: scw:registry }
dns: DNS { icon: scw:dns }

dns -> vpc.lb
vpc.lb -> vpc.web1
vpc.lb -> vpc.web2
vpc.web1 -> vpc.db
vpc.web2 -> vpc.db
vpc.web1 -> vpc.cache
vpc.web2 -> vpc.cache
vpc.web1 -> storage
registry -> vpc.web2
`,
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes microservices',
    code: `vpc: Private Network {
  icon: scw:cat-vpc

  lb: Load Balancer { icon: scw:lb }
  k8s: Kubernetes Kapsule { icon: scw:kubernetes }
}

dns: DNS { icon: scw:dns }
registry: Container Registry { icon: scw:registry }
db: Managed Database { icon: scw:rdb }
secrets: Secret Manager { icon: scw:secret-manager }

dns -> vpc.lb
vpc.lb -> vpc.k8s
registry -> vpc.k8s
vpc.k8s -> db
vpc.k8s -> secrets
`,
  },
  {
    id: 'serverless-api',
    label: 'Serverless API',
    code: `api: Serverless {
  icon: scw:cat-serverless-compute

  fn: Functions { icon: scw:functions }
  jobs: Batch Jobs { icon: scw:serverless-jobs }
}

gw: API Gateway { icon: scw:api-gateway }
db: Serverless DB { icon: scw:serverless-db }
storage: Object Storage { icon: scw:object-storage }
iam: IAM { icon: scw:iam }

gw -> api.fn
api.fn -> db
api.fn -> storage
api.fn -> iam
api.jobs -> storage
`,
  },
  {
    id: 'data-pipeline',
    label: 'Data & analytics pipeline',
    code: `data: Data Platform {
  icon: scw:cat-data-and-analytics

  kafka: Managed Kafka { icon: scw:managed-kafka }
  search: Managed Search { icon: scw:managed-search-database }
  storage: Object Storage { icon: scw:object-storage }
}

iot: IoT Hub { icon: scw:iot }
cockpit: Cockpit Monitoring { icon: scw:cockpit }

iot -> data.kafka
data.kafka -> data.search
data.kafka -> data.storage
data.kafka -> cockpit
`,
  },
  {
    id: 'multi-cloud',
    label: 'Multi-cloud backup',
    code: `vpc: Private Network {
  icon: scw:cat-network

  instance: App Server { icon: scw:instance }
  db: Managed Database { icon: scw:rdb }
}

storage: Primary Storage { icon: scw:object-storage }
aws: AWS S3 Backup { icon: https://api.iconify.design/logos:aws-s3.svg }
k8s: External Kubernetes { icon: https://api.iconify.design/logos:kubernetes.svg }

vpc.instance -> vpc.db
vpc.instance -> storage
storage -> aws
vpc.instance -> k8s
`,
  },
]
