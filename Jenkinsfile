pipeline {
    agent any
    stages {
        stage('Dockerize llamadoresdev') {
            steps {
                sh '''
                docker build -t registry-devops.agea.com.ar/ddr/jenkins-webapp:${BUILD_ID}

                if [$(docker image ls | grep "registry-devops.agea.com.ar/ddr/jenkins-webapp:${BUILD_ID}" | wc -l == 1) ]; then
                docker push registry-devops.agea.com.ar/ddr/jenkins-webapp:${BUILD_ID}
                else
                echo "[ERROR] BUILD & PUSH FAIL!"
                fi
                 '''
            }
        }
        stage ('Deploy_K8S') {
             steps {
                     withCredentials([string(credentialsId: "jenkins-argocd-deploy", variable: 'ARGOCD_AUTH_TOKEN')]) {
                        sh '''
                        ARGOCD_SERVER="192.168.32.234:32429"
                        APP_NAME="llamadores-dev"
                        IMAGE="registry.sanatorioallende.com/appdev/llamadoresdev:${BUILD_I}"

                        
                        # Deploy image to K8S
                        # Customize image 
                        ARGOCD_SERVER=$ARGOCD_SERVER argocd --grpc-web app set $APP_NAME --kustomize-image $IMAGE
                        
                        # Deploy to ArgoCD
                        ARGOCD_SERVER=$ARGOCD_SERVER argocd --auth-token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3Y2IxZjRmNy1hYzYzLTQ4ZDEtYTA1Yy01NGZhY2RhMzg0OGMiLCJpYXQiOjE2MzY5OTk0NjMsImlzcyI6ImFyZ29jZCIsIm5iZiI6MTYzNjk5OTQ2Mywic3ViIjoiamVua2luc2NkIn0.BXKONZ511bDPLpOHSgZSAcENUsF0Phashe0arbxTt3M --grpc-web app sync $APP_NAME --force --insecure
                        ARGOCD_SERVER=$ARGOCD_SERVER argocd --auth-token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3Y2IxZjRmNy1hYzYzLTQ4ZDEtYTA1Yy01NGZhY2RhMzg0OGMiLCJpYXQiOjE2MzY5OTk0NjMsImlzcyI6ImFyZ29jZCIsIm5iZiI6MTYzNjk5OTQ2Mywic3ViIjoiamVua2luc2NkIn0.BXKONZ511bDPLpOHSgZSAcENUsF0Phashe0arbxTt3M --grpc-web app wait $APP_NAME --timeout 600 --insecure
                        '''
               }
            }
        }
    }
}