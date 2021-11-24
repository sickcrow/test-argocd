pipeline { 
    environment {
    registry = "registry-devops.agea.com.ar"
    registryCredential = 'registry-devops'
    }
    agent any
    stages {
        stage('Dockerize webapp') {
            steps {
                sh '''
                echo "Build & Push Docker"
                docker build -t registry-devops.agea.com.ar/ms/jenkins-webapp:${BUILD_ID} .
                docker push registry-devops.agea.com.ar/ms/jenkins-webapp:${BUILD_ID}

                echo "Clean docker env"
                docker system prune -f
                '''
            }
        }
        stage('Deploy k8s') {
            steps {
                sh '''
                 ARGOCD_SERVER="devops.agea.com.ar"
                 APP_NAME="test-cd"
                 IMAGE="registry-devops.agea.com.ar/ms/jenkins-webapp:${BUILD_ID}"
                 TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YTE1MzBjOS1kNWZjLTQ4NTctYjI3ZS1kMjljYzkyYmVlYmYiLCJpYXQiOjE2MTQyMTk1NjYsImlzcyI6ImFyZ29jZCIsIm5iZiI6MTYxNDIxOTU2Niwic3ViIjoic2lja2Nyb3cifQ.5E-C2btyaSpr_riwcsK6YKweJova0wxN1ckNslgXn7o"

                        
                 # Deploy image to K8S
                 # Customize image 
                 ARGOCD_SERVER=$ARGOCD_SERVER argocd --auth-token ${TOKEN} --grpc-web-root-path /argocd app set ${APP_NAME} --kustomize-image ${IMAGE}
                        
                 # Deploy to ArgoCD
                 ARGOCD_SERVER=$ARGOCD_SERVER argocd --auth-token ${TOKEN} --grpc-web-root-path /argocd app sync ${APP_NAME} --force
                 ARGOCD_SERVER=$ARGOCD_SERVER argocd --auth-token ${TOKEN} --grpc-web-root-path /argocd app wait ${APP_NAME} --timeout 600
                '''
            }
        }
    }
}