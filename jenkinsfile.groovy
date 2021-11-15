pipeline {
    agent any
    stages {
        stage('Dockerize llamadoresdev') {
            steps {
                sh "sudo docker system prune -a --force"
                sh "sudo rm -rf /gitlabs/automation/" 
                sh "sudo rm -rf /tmp/llamadoresdev/"
                sh "sudo mkdir /tmp/llamadoresdev"
                sh "cd /gitlabs && sudo git clone git@gitlab.sanatorioallende.com:sserrano/automation.git"
                sh "sudo chmod 777 /gitlabs -R"
            dir("/tmp/llamadoresdev/"){
                 sh "sudo wget http://deploy.sanatorioallende.com/llamadoresdev.zip"
                 sh "sudo unzip llamadoresdev.zip"
                 sh "sudo rm -rf llamadoresdev.zip"
                 sh "sudo cp -R -f /tmp/llamadoresdev/ /gitlabs/automation/appdev/llamadores/docker.install/llamadoresdev/"
                 sh "sudo chmod 777 /gitlabs -R"
            }
            dir("/gitlabs/automation/appdev/llamadores/docker.install/"){
                 sh "sudo docker build . -t frontendllamadoresdev:${BUILD_ID}"
                 sh "sudo docker push registry.sanatorioallende.com/appdev/llamadoresdev:${BUILD_ID}"
            }       
                 sh "sudo rm -rf /gitlabs/automation/"                      
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