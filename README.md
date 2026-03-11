# Spring Boot Jenkins 部署学习项目

## 项目结构

```
demo/
├── src/
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── DemoApplication.java        # 启动类
│   │   │   ├── controller/HelloController.java  # API 接口
│   │   │   └── service/HelloService.java   # 业务逻辑
│   │   └── resources/
│   │       └── application.properties      # 配置文件
│   └── test/
│       └── java/com/example/demo/
│           └── DemoApplicationTests.java   # 单元测试
├── Jenkinsfile                             # Jenkins 流水线脚本
├── Dockerfile                              # Docker 镜像构建文件
└── pom.xml                                 # Maven 配置
```

## 接口说明

| 接口 | 描述 |
|------|------|
| GET /api/hello | 问候接口 |
| GET /api/info  | 应用信息 |
| GET /actuator/health | 健康检查（Jenkins 用） |

## 本地运行

```bash
# 编译打包
mvn clean package

# 运行
java -jar target/demo-1.0.0.jar

# 访问
curl http://localhost:8080/api/hello
```

## Jenkins 配置步骤

### 1. 安装 Jenkins 必要插件
- Pipeline
- Git
- Maven Integration

### 2. 配置全局工具
进入 **Jenkins → Manage Jenkins → Global Tool Configuration**：
- 添加 JDK：名称填 `JDK-17`
- 添加 Maven：名称填 `Maven-3.9`

### 3. 创建 Pipeline 项目
1. 新建任务 → 选择 **Pipeline**
2. Pipeline 配置 → **Pipeline script from SCM**
3. SCM 选 Git，填写仓库地址
4. Script Path 填 `Jenkinsfile`
5. 保存并构建

### 4. Jenkins 流水线阶段说明

```
Checkout → Build → Test → Package → Deploy → Health Check
  拉代码    编译    测试    打包      部署      健康检查
```

## Docker 部署方式（可选）

```bash
# 构建镜像
docker build -t spring-boot-demo:1.0.0 .

# 运行容器
docker run -d -p 8080:8080 --name demo spring-boot-demo:1.0.0

# 查看日志
docker logs -f demo
```

在 Jenkinsfile 中替换 Deploy 阶段为 Docker 命令即可实现容器化部署。
