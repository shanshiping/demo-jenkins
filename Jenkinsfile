pipeline {
    agent any

    tools {
        nodejs 'NodeJS'   // Jenkins -> Global Tool Configuration 中配置
    }

    environment {
        APP_NAME   = 'demo-frontend'
        DEPLOY_DIR = '/opt/apps/demo-frontend'
        APP_PORT   = '3000'
    }

    stages {
        stage('Setup Node.js') {
            steps {
                // Node.js (Jenkins tool) 依赖 libatomic.so.1，需安装 libatomic1
                // 若 agent 无 sudo 权限，请在主机或 agent 镜像中预先安装: apt-get install -y libatomic1
                sh 'sudo apt-get update -qq && sudo apt-get install -y libatomic1'
                sh 'node -v && npm -v'
            }
        }

        stage('Checkout') {
            steps {
                echo '📥 拉取代码...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                echo '📦 安装依赖...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '🔍 代码检查...'
                sh 'npm run lint || true'  // 不阻断构建
            }
        }

        stage('Build') {
            steps {
                echo '🔨 构建 Next.js...'
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 部署...'
                sh """
                    # 停止旧进程
                    PID=\$(pgrep -f "node.*${APP_NAME}" || true)
                    if [ -n "\$PID" ]; then
                        kill \$PID && sleep 3
                    fi

                    # 同步文件
                    rsync -a --delete .next ${DEPLOY_DIR}/
                    rsync -a --delete public ${DEPLOY_DIR}/
                    cp package.json next.config.js ${DEPLOY_DIR}/
                    cd ${DEPLOY_DIR} && npm ci --omit=dev

                    # 启动
                    nohup npm start -- --port ${APP_PORT} \
                        > ${DEPLOY_DIR}/frontend.log 2>&1 &
                    echo "Frontend started on port ${APP_PORT}"
                """
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 8'
                sh "curl -sf http://localhost:${APP_PORT} -o /dev/null && echo '✅ Frontend is up'"
            }
        }
    }

    post {
        success {
            echo "✅ 前端部署成功！访问: http://localhost:${APP_PORT}"
        }
        failure {
            echo '❌ 前端部署失败'
        }
    }
}
