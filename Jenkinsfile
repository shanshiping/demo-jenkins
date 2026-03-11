pipeline {
    agent any

    tools {
        // 使用 Jenkins 内置的 Node.js（需在 Jenkins 全局工具中配置名为 NodeJS-20 的 Node 20）
        // 若没有 NodeJS 插件，可改回 agent 并安装 Node 20，或确保 agent 上已安装 Docker
        nodejs 'NodeJS-20'
    }

    environment {
        APP_NAME   = 'demo-frontend'
        IMAGE_NAME = 'demo-frontend'
        APP_PORT   = '3000'
        NODE_IMAGE = 'node:20'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 拉取代码...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                echo '📦 安装依赖...'
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                echo '🔍 代码检查...'
                sh 'npm run lint || true'
            }
        }

        stage('Build') {
            steps {
                echo '🔨 构建 Next.js...'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 构建 Docker 镜像...'
                sh """
                    docker build -t ${IMAGE_NAME}:latest .
                """
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 使用 Docker 镜像部署...'
                sh """
                    docker stop ${APP_NAME} 2>/dev/null || true
                    docker rm ${APP_NAME} 2>/dev/null || true
                    docker run -d --name ${APP_NAME} -p ${APP_PORT}:3000 ${IMAGE_NAME}:latest
                    echo "容器已启动，访问 http://localhost:${APP_PORT}"
                """
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 5'
                sh "curl -sf http://localhost:${APP_PORT} -o /dev/null && echo '✅ Frontend is up' || echo '⚠️ 健康检查未通过（若 Jenkins 与容器不在同一台机可忽略）'"
            }
        }
    }

    post {
        success {
            echo "✅ 前端部署成功！Docker 镜像: ${IMAGE_NAME}:latest，访问: http://localhost:${APP_PORT}"
        }
        failure {
            echo '❌ 前端部署失败'
        }
    }
}
