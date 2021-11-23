FROM jenkins/jenkins:lts

USER root

RUN curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 && chmod 777 /usr/local/bin/argocd

USER jenkins
