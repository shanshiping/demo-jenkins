# Jenkins 运行说明（本机 Docker 里跑 Jenkins）

## 你的用法：电脑上跑 Docker，Docker 里跑 Jenkins

流水线会在这台 Jenkins 容器里执行，所以需要两样东西：

1. **Node 能跑** → 容器里要有 `libatomic1`（否则 node 报错 libatomic.so.1）
2. **流水线里的 docker 能跑** → 容器里要有 Docker 命令行，并且能连上你电脑的 Docker（挂载 socket）

本目录的镜像已经装好了 **libatomic1 + Docker CLI**，你只要用这个镜像启动 Jenkins，并**把宿主机的 Docker socket 挂进容器**即可。

## 操作步骤

### 1. 构建镜像（在项目根目录执行）

```bash
# 确保在 demo-jenkins 项目根目录
docker build -t my-jenkins -f jenkins/Dockerfile .
```

### 2. 启动 Jenkins（挂载 Docker socket）

**Linux：**

```bash
docker run -d -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add $(stat -c '%g' /var/run/docker.sock) \
  my-jenkins
```

**Mac（Docker Desktop）：**  
`stat -c` 在 Mac 上不存在，可以省略 `--group-add` 先试：

```bash
docker run -d -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  my-jenkins
```

若构建/部署时仍报权限错误，再查「Jenkins in Docker 挂载 docker.sock 权限」按你系统处理。

### 3. 在 Jenkins 里配置 Node.js

- 打开 **Manage Jenkins → Global Tool Configuration**
- 在 **NodeJS** 里添加一个安装（如 Node 20），取名例如 `NodeJS`（和 Jenkinsfile 里 `nodejs 'NodeJS'` 一致）
- 保存

之后重新跑流水线，Node 和流水线里的 `docker build` / `docker run` 都会在这台容器里可用（docker 实际用的是你电脑上的 Docker）。
