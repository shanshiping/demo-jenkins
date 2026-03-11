pipeline {
    agent {
        docker {
            image 'node:24'
            args '-u root'
        }
    }

    environment {
        APP_NAME   = 'demo-frontend'
        DEPLOY_DIR = '/opt/apps/demo-frontend'
        APP_PORT   = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Fetching source code...'
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                sh '''
                    # Install Node.js 20 using nvm
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm install 20
                    nvm use 20
                    echo "Node.js $(node -v) and npm $(npm -v) installed"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Lint Code') {
            steps {
                echo 'Running code linting...'
                sh 'npm run lint || true'
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building Next.js application...'
                sh 'npm run build'
            }
        }

        stage('Verify Environment') {
            steps {
                echo '🔍 Verifying required tools...'
                sh '''
                    echo "Node: $(node -v)"
                    echo "npm: $(npm -v)"
                    if command -v docker &> /dev/null; then
                        echo "Docker: $(docker --version)"
                    else
                        echo "ERROR: Docker not found in PATH!"
                        exit 1
                    fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh 'docker build -t ${APP_NAME}:${BUILD_NUMBER} . || (echo "Failed to build Docker image. Check Docker installation." && exit 1)'
            }
        }

        stage('Deploy to Server') {
            steps {
                echo 'Deploying application...'
                sh """
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true
                    docker run -d \\
                        -p ${APP_PORT}:3000 \\
                        --name ${APP_NAME} \\
                        ${APP_NAME}:${BUILD_NUMBER}
                    echo "Application started on port ${APP_PORT}"
                """
            }
        }

        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sh 'sleep 8'
                sh "curl -sf http://localhost:${APP_PORT} -o /dev/null && echo 'Application is healthy'"
            }
        }
    }

    post {
        success {
            echo "Deployment successful! Access the application at: http://localhost:${APP_PORT}"
        }
        failure {
            echo 'Deployment failed'
        }
    }
}