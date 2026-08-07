# Development practices
## DevOps Practices

### 1. CI/CD Pipeline Design

Add push and pull jobs on the release branch that would, install dependencies, check the types, run linter, test the code (unit tests, integration and E2E tests), build the packages, Build Docker Images, push the built artifacts to an artifactory and then deploy the packages and images to the cloud (AWS, google etc).Before releasing to production, I would deploy to a lower environment so that all sanity checks and validations can be made before production release. Most of the jobs have to be run sequencially, but I can spin up parallel jobs for both frontend and backend pipelines and running tests.

### 2. Infrastructure as Code
Use Terraform for the cloud resources, deploy APIs behind a loadbalancer on AWS ECS or similar, AWS RDS for database instance, a CDN with S3 bucket for Frontend static assets so that users can be served with little latency across different geographical regions. AWS Secrets managers for API keys and SSM Parameter store for app configs. Will Store terraform state in AWS S3

### 3. Monitoring and Alerting
Add tools like DataDog/Graphana/Splunk etc to log system logs, I would implement structured JSON logging, monitor API latency scores (p99?p95/p50), error rates, requests volume, DB connection pool usage and other key business metrics. Will set up dashboards for API health, and alerting systems whenever status/error codes frequency crosses a set threshold.

## Legacy Systems

### 4. Legacy Modernization
while upgrading a legacy system, continuation of business of the utmost importance, I would implement a staggered modernization approach, start with migrating a NON Mission critical least risk read only feature (product/component/route etc). Validate with canary/launchdrakly feature flag controlled release to a minor (5-20%) subset of users to establish a POC, so that we can revert the feature without rolling back the deployment.

## Testing

### 5. Test Suite Organization
I prefer `Testing Trophy` over `Testing Pyramid` focusing on the unit tests (fast and isolated) with good chunk of integration tests (actually hitting DB and APIs) and few E2E tests for mission critical happy paths. I like to colocate my tests with the components and try mocking data at the boundaries and not internally.

## Architecture

### 6. Scaling Architecture
I will replace SqLite DB with a robust DB that can support Concurrent R/W operations such as PostgreSQL, add indexing to the `players` table by `player_id`, partition `pitches` table based on game day data, and maintain mutlple Read replicas. Implement L1 and L2 chaching layers such as Redis. Add API gateway for auth, routing and rate limiting. I will implement Cursor based paginization(implemented for pitches query) and query optimizations to limit DB load.Serve app via CDN and will horizontally scale API servers, with autoscaling based on CPU/memory usage and request queue depth thresholds.

## Opinion

### 7. Overrated Practice
instance of getting the code coverage above a specific number, instead of focusing on critical paths teams try to write redundant or trivial tests. test should instead focus on ensuring core business logic (data manipulations, validations etc), error handling and integration contracts.
