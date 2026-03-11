# Push 未触发 Jenkins 构建 — 排查清单

按下面顺序逐项检查。

---

## 一、确认你用的是哪种触发方式

### A. 用的是 GitHub Webhook（ngrok 暴露）

跳到 **第二节**。

### B. 用的是 Poll SCM（轮询）

- 在 Jenkins 任务里：**配置** → **构建触发器** → 确认已勾选 **Poll SCM**，日程表例如 `H/2 * * * *`（每 2 分钟）。
- Push 后最多等一个轮询间隔（如 2 分钟），看是否自动触发。
- 若一直不触发：**配置** → **Pipeline** 里确认 **Definition** 是 **Pipeline script from SCM**，且 **SCM** 是 Git、仓库 URL 和分支正确，**Poll SCM** 勾选在同一任务页里。

---

## 二、GitHub Webhook 是否发出去且成功

1. 打开仓库：**GitHub** → **Settings** → **Webhooks**。
2. 点你填的那个 Webhook。
3. 看 **Recent Deliveries**：
   - 有 **push** 事件且 **Response** 是 **200** → GitHub 已成功打到 Jenkins，问题在 Jenkins 端（看第三节）。
   - **Response** 是 403/404/500 → 看下面「常见 Response 错误」。
   - 没有 push 的 delivery → 说明 push 没触发发送，或 Webhook 刚加、还没 push 过，再 push 一次试一下。

**常见 Response 错误：**

- **404**：URL 错了。应为 `https://你的ngrok域名/github-webhook/`（末尾要有 `/`），且 ngrok 正在运行。
- **403**：Jenkins 安全限制（如 CSRF）。需在 **Manage Jenkins** → **Security** 里允许 GitHub 触发（见第三节）。
- **502 / Connection refused**：ngrok 没开，或 Jenkins 没跑，或 ngrok URL 已变。

---

## 三、Jenkins 端必须满足的配置

### 1. 安装 GitHub 相关插件

- **Manage Jenkins** → **Plugins** → **Installed**：
  - 确认有 **GitHub Plugin**（和 **Git plugin**）。
- 没有就 **Available** 里搜 **GitHub** 安装，装完重启 Jenkins。

### 2. 任务要勾选「由 GitHub 触发」

- 打开你的 **Pipeline 任务**（不是 Multibranch 的「分支」子任务）→ **Configure**。
- **Build Triggers** 里必须勾选其一：
  - **Build when a change is pushed to GitHub**，或  
  - **GitHub hook trigger for GITScm polling**
- **保存**。

很多人在 Webhook 和 ngrok 都配好了，但这里没勾选，所以 push 不会触发。

### 3. 安全设置允许 GitHub 触发

- **Manage Jenkins** → **Security** → **Configure Global Security**：
  - 若 **Enable CSRF Protection** 开着，一般不影响 GitHub Webhook（GitHub Plugin 会处理）。
  - 若你改过「认证」或「授权」，确保 **Anonymous** 至少有 **Read**（或你用了「Allow anonymous read」），否则有的 Jenkins 版本会拒绝 GitHub 的触发请求。
- 若装了 **Strict Crumb Issuer**，可能拦 Webhook，可先改成默认 Crumb 试一次。

### 4. 任务类型要对

- 必须是「从 GitHub 拉 Jenkinsfile」的那种任务：
  - **Pipeline** → **Definition**: **Pipeline script from SCM** → **SCM: Git**，仓库是 `https://github.com/shanshiping/demo-jenkins.git`（或你的仓库）。
- 若是 **Multibranch Pipeline**：Webhook 会触发「扫描」，扫描到分支/提交变化后才会触发该分支的 build；去 Multibranch 任务页点一次 **Scan Repository Now**，看是否有分支被识别、是否有构建被触发。

---

## 四、ngrok 是否一直可用

- 终端里运行 `ngrok http 8080` 的窗口要**保持开着**。
- 免费版 ngrok 重启后 URL 会变，若变了要去 GitHub Webhook 里把 **Payload URL** 改成新地址（仍是 `https://新地址/github-webhook/`）。

---

## 五、快速自测：手动触发一次

- 在 Jenkins 任务页点 **Build Now**：
  - 若可以正常构建 → 说明 Pipeline 和仓库配置没问题，只是**触发条件**没满足（Webhook 或 Poll 没生效）。
  - 若失败 → 先看控制台报错，修 Pipeline/仓库/凭据。

---

## 六、总结：最常见原因

1. **Build Triggers 里没勾选**「Build when a change is pushed to GitHub」或「GitHub hook trigger for GITScm polling」。
2. **Webhook URL 错误**：少了 `/github-webhook/` 或用了旧的 ngrok 地址。
3. **ngrok 没运行**或 **Jenkins 没运行**，导致 GitHub 打不过来。
4. **Multibranch** 只做了扫描，没点到具体分支的 build → 去 Multibranch 任务里看分支列表和最近一次扫描/构建。

按上面顺序查一遍，一般能定位到是 GitHub 没发、发了但 Jenkins 没收到、还是收到了但没勾选「由 GitHub 触发」。

---

## 七、Pipeline 任务：Webhook 200 但仍不触发（已知情况）

**原因**：GitHub Plugin 对 **Pipeline（Pipeline script from SCM）** 任务有时不会把 Webhook 和任务关联——它主要针对带「Git SCM」的 Freestyle 任务。所以即使勾了「GitHub hook trigger for GITScm polling」、也配了 GitHub project，Pipeline 任务仍可能不触发。

### 方案 A：只用轮询（最简单、必生效）

不依赖 Webhook，让 Jenkins 每分钟查一次仓库，有提交就构建。

1. 任务 → **Configure** → **Build Triggers**
2. 勾选 **Poll SCM**
3. **日程表** 填：`* * * * *`（每分钟）或 `H/1 * * * *`（每分钟、错开整点）
4. 保存

Push 后**最多等 1 分钟**，Build History 里就会出现新构建。无需改 GitHub、无需新插件。

### 方案 B：用 Generic Webhook Trigger（Push 后立刻触发）

让 GitHub 的 Webhook 打到「带 token 的通用触发地址」，直接触发这个任务，不依赖 GitHub Plugin 的关联。

**1. 安装插件**

- **Manage Jenkins** → **Plugins** → **Available** → 搜 **Generic Webhook Trigger** → 安装 → 重启

**2. 在任务里加触发器**

- 任务 → **Configure** → **Build Triggers**
- 勾选 **Generic Webhook Trigger**
- **Token** 填一个只有你知道的字符串，例如：`demo-jenkins-push`
- 其余可默认，保存

**3. 改 GitHub Webhook 的 URL**

- GitHub 仓库 → **Settings** → **Webhooks** → 编辑你那条 Webhook（或新增一条）
- **Payload URL** 改为（把 `你的ngrok地址` 和 token 换成你的）：
  ```text
  https://你的ngrok地址/generic-webhook-trigger?token=demo-jenkins-push
  ```
- **Content type**：`application/json`
- **Which events?**：Just the push event
- 保存

之后每次 push，GitHub 会请求这个 URL，Jenkins 收到后就会触发该任务。若保留 **Poll SCM**（如 `H/2 * * * *`），即使 Webhook 失败也有轮询兜底。
