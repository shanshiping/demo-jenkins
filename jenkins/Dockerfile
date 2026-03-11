# Jenkins 镜像：安装 libatomic1（Node 需要）+ Docker CLI（流水线里 docker build/run 需要）
# 你是在「本机 Docker 里跑 Jenkins」时，用这个镜像并挂载宿主机 Docker socket 即可。
#
# 构建（在项目根目录执行，上下文用 . 即可）:
#   docker build -t my-jenkins -f jenkins/Dockerfile .
# 运行（必须挂载 socket，否则流水线里 docker 会 not found）:
#   docker run -d -p 8080:8080 -v jenkins_home:/var/jenkins_home \
#     -v /var/run/docker.sock:/var/run/docker.sock \
#     --group-add $(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo 999) \
#     my-jenkins
# 若上面 --group-add 报错（如 Mac），可先去掉该参数试一次；仍无权限再查文档。
FROM jenkins/jenkins:lts
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends libatomic1 docker.io \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -g 999 docker 2>/dev/null || true \
  && usermod -aG docker jenkins
USER jenkins
