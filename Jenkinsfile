pipeline {
  environment {
    imagename = "registry-devops.agea.com.ar/ms/jenkins-webapp}"
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
        sh "docker rmi $imagename:$BUILD_ID"
         sh "docker rmi $imagename:latest"
 
      }
    }
  }
}