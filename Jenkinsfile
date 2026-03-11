pipeline {
    agent any

    // 定义工具（需要在 Jenkins 全局工具中配置）
    tools {
        maven 'Maven-3.9'   // 对应 Jenkins -> Global Tool Configuration 中配置的 Maven 名称
        jdk 'JDK-17'        // 对应 Jenkins -> Global Tool Configuration 中配置的 JDK 名称
    }

    // 环境变量
    environment {
        APP_NAME = 'spring-boot-demo'
        JAR_NAME = 'demo-1.0.0.jar'
        DEPLOY_DIR = '/opt/apps/demo'      // 服务器上的部署目录
        SERVER_PORT = '8080'
    }

    stages {

        // ===== 阶段1：拉取代码 =====
        stage('Checkout') {
            steps {
                echo '📥 拉取代码...'
                checkout scm
                // 打印当前分支和提交信息
                sh 'git log --oneline -5'
            }
        }

        // ===== 阶段2：编译 =====
        stage('Build') {
            steps {
                echo '🔨 开始编译...'
                sh 'mvn clean compile -DskipTests'
            }
        }

        // ===== 阶段3：单元测试 =====
        stage('Test') {
            steps {
                echo '🧪 运行单元测试...'
                sh 'mvn test'
            }
            post {
                always {
                    // 发布测试报告
                    junit 'target/surefire-reports/*.xml'
                }
                failure {
                    echo '❌ 测试失败，请检查代码！'
                }
            }
        }

        // ===== 阶段4：打包 =====
        stage('Package') {
            steps {
                echo '📦 打包应用...'
                sh 'mvn package -DskipTests'
                // 确认 JAR 包生成
                sh 'ls -lh target/*.jar'
            }
        }

        // ===== 阶段5：部署 =====
        stage('Deploy') {
            steps {
                echo '🚀 开始部署...'
                sh """
                    # 创建部署目录
                    mkdir -p ${DEPLOY_DIR}

                    # 复制 JAR 包
                    cp target/${JAR_NAME} ${DEPLOY_DIR}/

                    # 停止旧进程（如果存在）
                    PID=\$(pgrep -f "${JAR_NAME}" || true)
                    if [ -n "\$PID" ]; then
                        echo "停止旧进程 PID: \$PID"
                        kill \$PID
                        sleep 3
                    fi

                    # 启动新进程
                    echo "启动新进程..."
                    nohup java -jar ${DEPLOY_DIR}/${JAR_NAME} \
                        --server.port=${SERVER_PORT} \
                        --spring.profiles.active=prod \
                        > ${DEPLOY_DIR}/app.log 2>&1 &

                    echo "应用已启动，PID: \$!"
                """
            }
        }

        // ===== 阶段6：健康检查 =====
        stage('Health Check') {
            steps {
                echo '🏥 健康检查...'
                // 等待应用启动
                sh 'sleep 10'
                // 调用 Actuator 健康检查接口
                sh """
                    curl -f http://localhost:${SERVER_PORT}/actuator/health || \
                    (echo '❌ 健康检查失败！' && exit 1)
                """
                echo '✅ 健康检查通过！'
            }
        }
    }

    // 构建后操作
    post {
        success {
            echo """
            ✅ ===== 部署成功 =====
            应用: ${APP_NAME}
            访问地址: http://localhost:${SERVER_PORT}/api/hello
            ========================
            """
        }
        failure {
            echo '❌ 流水线失败，请检查日志！'
        }
        always {
            // 清理工作空间（可选）
            echo '🧹 构建完成'
        }
    }
}
