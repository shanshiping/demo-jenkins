# ====== 多阶段构建（可选，用于 Docker 部署方式）======

# 阶段1：构建
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
# 先下载依赖（利用 Docker 缓存层加速）
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# 阶段2：运行
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 创建非 root 用户（安全最佳实践）
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 从构建阶段复制 JAR
COPY --from=builder /app/target/demo-1.0.0.jar app.jar

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
