# Push 后自动触发 Jenkins 扫描与构建

实现 **Git push → GitHub 发 Webhook → Jenkins 自动扫描/构建** 需要两步：Jenkins 启用“由 Git 推送触发”，GitHub 仓库配置 Webhook。

---

## 一、Jenkins 端配置

### 方式 A：普通 Pipeline 任务（从 SCM 拉取 Jenkinsfile）

1. 打开你的 Pipeline 任务 → **配置 (Configure)**。
2. 在 **构建触发器 (Build Triggers)** 里勾选：
   - **Build when a change is pushed to GitHub**  
     或  
   - **GitHub hook trigger for GITScm polling**
3. 若没有上述选项，先安装插件：**Manage Jenkins** → **Plugins** → 搜索并安装 **GitHub Plugin**。
4. 保存配置。

这样每次 GitHub 收到 push 并往 Jenkins 发 Webhook 时，该任务会自动触发一次构建（无需“扫描”步骤，直接 build）。

---

### 方式 B：多分支流水线 (Multibranch Pipeline)

1. 打开你的 **Multibranch Pipeline** 或 **Organization** 任务 → **配置**。
2. 在 **Branch Sources** 里已配置好 GitHub 仓库的前提下，在 **Build Configuration** 或 **Discover branches** 区域确认分支发现方式正常。
3. 在 **Scan Multibranch Pipeline Triggers** 中勾选：
   - **Periodically if not otherwise run**（可选，例如间隔 5 分钟兜底扫描）。
4. 关键：要“push 就扫”，需要 **GitHub 发 Webhook 到 Jenkins**。  
   Jenkins 收到 GitHub 的 `push` 事件后，会自动对该多分支任务做一次 **“Scan Repository Now”**，发现新提交后再触发对应分支的 build。

---

## 二、GitHub 仓库配置 Webhook

1. 打开仓库：<https://github.com/shanshiping/demo-jenkins>
2. **Settings** → **Webhooks** → **Add webhook**
3. 填写：
   - **Payload URL**
     - 普通 Pipeline：`https://你的Jenkins地址/github-webhook/`
     - 示例：`http://jenkins.example.com:8080/github-webhook/`
     - 若 Jenkins 在公网，需用 **https**；内网可用 http。
   - **Content type**：`application/json`
   - **Trigger**：选 **Just the push event**（仅 push 时触发即可）
4. 保存后，GitHub 会发一次 ping；在 Webhooks 里可看到最近 Delivery 是否成功（状态码 200 表示 Jenkins 收到）。

---

## 三、流程小结

| 步骤 | 说明 |
|------|------|
| 1 | 你在本地 `git push` 到 GitHub |
| 2 | GitHub 向 Jenkins 的 `/github-webhook/` 发送 push 事件 |
| 3 | Jenkins（GitHub Plugin）收到后：**普通任务**直接触发该任务构建；**多分支任务**先执行一次扫描，再对变更分支触发构建 |
| 4 | 构建使用当前分支的 Jenkinsfile，完成 scan/build |

---

## 四、常见问题

- **Webhook 报 403/404**：检查 Jenkins URL 是否正确、是否可被 GitHub 访问（公网 Jenkins 需可被访问）。
- **Push 了但没触发**：在 GitHub Webhooks 里看该次 push 的 Delivery 状态；在 Jenkins 任务里看“构建历史”和“最近一次触发原因”是否显示 “Started by GitHub push”。
- **多分支没自动扫描**：确认已勾选 “Scan Multibranch Pipeline Triggers” 或依赖 GitHub hook；并确认 GitHub 发的是 push 事件且 URL 为 `.../github-webhook/`。

按上述配置后，push 代码即可自动触发 Jenkins 的扫描（多分支）或直接构建（普通 Pipeline）。
