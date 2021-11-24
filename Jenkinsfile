pipeline {
  environment {
    imagename = "registry-devops.agea.com.ar/ms/jenkins-webapp:${BUILD_ID}"
    registryCredential = 'registry-devops'
    dockerImage = ''
  }
  agent any
    stages {  
    stage('Building image') {
      steps{
        script {
          dockerImage = docker.build imagename
        }
      }
    }
    stage('Deploy Image') {
      steps{
        script {
          docker.withRegistry( 'https://registry-devops.agea.com.ar', registryCredential ) {
             dockerImage.push("$BUILD_ID")
             dockerImage.push('latest')
          }
        }
      }
   }
    stage('Remove Unused docker image') {
      steps{
        sh "docker rmi registry-devops.agea.com.ar/ms/jenkins-webapp:$BUILD_ID"
        sh "docker rmi registry-devops.agea.com.ar/ms/jenkins-webapp:latest"
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