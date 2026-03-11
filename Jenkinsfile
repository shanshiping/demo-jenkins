pipeline {
    agent any

    tools {
        nodejs 'nodejs-20'
    }

    environment {
        APP_NAME   = 'demo-frontend'
        DEPLOY_DIR = '/opt/apps/demo-frontend'
        APP_PORT   = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Fetching source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Lint Code') {
            steps {
                echo '🔍 Running code linting...'
                sh 'npm run lint || true'  // Non-blocking check
            }
        }

        stage('Build Application') {
            steps {
                echo '🔨 Building Next.js application...'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh 'docker build -t ${APP_NAME}:${BUILD_NUMBER} .'
            }
        }

        stage('Deploy to Server') {
            steps {
                echo '🚀 Deploying application...'
                sh """
                    # Stop and remove existing container
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true

                    # Run new container
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
                echo '🏥 Performing health check...'
                sh 'sleep 8'
                sh "curl -sf http://localhost:${APP_PORT} -o /dev/null && echo '✅ Application is healthy'"
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! Access the application at: http://localhost:${APP_PORT}"
        }
        failure {
            echo '❌ Deployment failed'
        }
    }
}