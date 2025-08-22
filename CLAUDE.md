# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 版本信息
当前分支: **5.0** - 这是 Apache Superset 的主要版本，包含重大架构改进和功能更新。

## 架构概览

Apache Superset 是一个现代化的企业级商业智能 Web 应用程序，采用 Python/JavaScript 混合架构：

### 核心组件
- **后端**: Python Flask 应用程序 (`superset/`)，使用 SQLAlchemy ORM
- **前端**: React/TypeScript 应用程序 (`superset-frontend/`)，使用 Redux 进行状态管理  
- **数据库支持**: 通过 SQLAlchemy 方言支持 40+ 数据库连接器 (`superset/db_engine_specs/`)
- **可视化**: 基于 Apache ECharts 和 D3.js 的插件化图表系统
- **安全性**: Flask-AppBuilder 用于 RBAC，OAuth 集成
- **任务队列**: Celery 用于异步操作（报告、缓存、缩略图）

### 5.0 版本主要变化
- **TypeScript 升级**: 前端升级到 TypeScript v5.1.6
- **AgGrid 表格**: SQL Lab 使用新的 AgGrid 表格替代 FilterableTable
- **UUID 支持**: 大部分模型添加了 UUID Mixin
- **数据上传重构**: 统一数据上传流程，减少权限和端点
- **移除旧版图表**: 移除了已废弃的 5.0 版本旧版图表
- **新数据库连接器**: 添加了 Parseable 连接器
- **前端依赖更新**: Antd v4.10.3，Node.js ^20.16.0，npm ^10.8.1

### 关键目录
- `superset/` - Python 后端代码（模型、API、图表、仪表板）
- `superset-frontend/` - React 前端应用程序
- `superset/db_engine_specs/` - 数据库特定连接逻辑
- `superset/charts/` - 图表/可视化 API 和数据处理  
- `superset/dashboards/` - 仪表板管理和 API
- `superset/connectors/` - 数据源连接器（主要是 SQLAlchemy）
- `superset/commands/` - 业务逻辑命令（CRUD 操作）
- `tests/` - Python 测试套件
- `superset-frontend/spec/` - JavaScript/TypeScript 测试

## 开发命令

### Python 环境设置
```bash
# 创建虚拟环境
make venv

# 安装依赖并设置
make install

# 更新现有安装  
make update
```

### 后端开发
```bash
# 运行 Flask 开发服务器
make flask-app

# 自定义端口运行: flask run -p 8088 --with-threads --reload --debugger

# 数据库操作
superset db upgrade              # 应用迁移
superset init                   # 初始化角色/权限
superset fab create-admin       # 创建管理员用户
superset load-examples          # 加载示例数据

# 运行 Celery worker 处理异步任务
make report-celery-worker

# 运行 Celery beat 调度器
make report-celery-beat
```

### 前端开发  
```bash
cd superset-frontend

# 安装依赖
npm ci

# 带热重载的开发服务器
npm run dev-server

# 生产环境构建
npm run build

# 开发环境构建
npm run build-dev

# 运行测试套件
npm test

# 类型检查
npm run type

# 代码检查
npm run lint
npm run lint-fix

# 代码格式化
npm run prettier
```

### 测试
```bash
# Python 测试
pytest                          # 运行所有 Python 测试
pytest tests/unit_tests/        # 仅运行单元测试
pytest -k "test_name"          # 运行特定测试

# JavaScript 测试
cd superset-frontend
npm test                        # 运行 JS/TS 测试套件
npm run test-loud              # 运行详细输出
npm run tdd                    # 监视模式运行
```

### 代码质量
```bash
# Python 格式化和检查（使用 pre-commit）
make py-format

# JavaScript 格式化  
cd superset-frontend
npm run format

# 类型检查
cd superset-frontend
npm run type
```

### Docker 开发
```bash
# 启动完整技术栈
docker-compose up

# 其他可用的 compose 变体：
# docker-compose-light.yml - 轻量级开发设置
# docker-compose-non-dev.yml - 类生产环境设置
```

## 技术要求

### 5.0 版本环境要求
- **Python**: >=3.10 (支持 3.10, 3.11)
- **Node.js**: ^20.16.0 
- **npm**: ^10.8.1
- **TypeScript**: 5.1.6

### 依赖版本变化
- **前端框架**: React 17.0.2, Antd 4.10.3 + Antd v5.18.0 (双版本)
- **构建工具**: Webpack 5.97.1, Babel 7.26.x
- **测试工具**: Jest 29.7.0, Cypress (通过 docker-compose)
- **Python 依赖**: Flask 2.2.5, SQLAlchemy 1.4, pandas 2.0.3

## 测试要求

- **Python**: 使用 pytest 进行所有 Python 测试。在项目根目录运行 `pytest`。
- **JavaScript**: 使用 Jest/React Testing Library。在 superset-frontend/ 目录运行 `npm test`。
- **集成测试**: Cypress 测试位于 `superset-frontend/cypress-base/`
- **测试覆盖率**: Jest 配置支持覆盖率报告
- 提交更改前始终运行相关测试。

## 数据库与数据源

- 默认开发数据库是 SQLite
- 生产环境支持 40+ 数据库（PostgreSQL、MySQL、BigQuery、Snowflake 等）
- 5.0 新增 Parseable 数据库连接器
- 数据库连接通过 `superset/db_engine_specs/` 配置
- 通过 `superset load-examples` 可获取示例数据集
- UUID Mixin 已添加到大部分模型中

## 配置文件

### 配置文件层级关系
Superset 使用多层配置文件系统，后加载的配置会覆盖前面的：

1. **superset/config.py** - 默认配置
   - Superset 自带的默认配置文件
   - 包含所有默认设置，不建议直接修改
   - 设置示例：`BABEL_DEFAULT_LOCALE = "en"`

2. **docker/pythonpath_dev/superset_config.py** - Docker 开发环境配置
   - Docker Compose 环境专用配置
   - 通过 `PYTHONPATH` 环境变量加载
   - **会覆盖默认配置**
   - 修改此文件来自定义 Docker 环境设置

3. **superset_config.py** - 自定义配置（可选）
   - 可放在 PYTHONPATH 任意位置
   - 生产环境常用
   - 通过 `SUPERSET_CONFIG_PATH` 环境变量指定

### Docker 环境配置加载顺序
```bash
# docker/.env 中设置
PYTHONPATH=/app/pythonpath:/app/docker/pythonpath_dev

# 实际加载顺序
1. superset/config.py (基础)
2. docker/pythonpath_dev/superset_config.py (覆盖)
3. superset_config_docker.py (如果存在，最高优先级)
```

### 常用配置示例
```python
# 语言设置（在 docker/pythonpath_dev/superset_config.py 中）
BABEL_DEFAULT_LOCALE = 'zh'  # 默认中文
LANGUAGES = {
    'en': {'flag': 'us', 'name': 'English'},
    'zh': {'flag': 'cn', 'name': 'Chinese'},
}
```

### 其他配置文件
- `superset-frontend/webpack.config.js` - 前端构建配置
- `pyproject.toml` - Python 包配置、代码检查规则（支持 ruff）
- `superset-frontend/package.json` - JavaScript 依赖和脚本
- `superset-frontend/tsconfig.json` - TypeScript 配置（v5）

## 5.0 版本开发注意事项

1. **TypeScript 升级**: 代码需要兼容 TypeScript 5.1.6
2. **AgGrid 表格**: SQL Lab 中的表格组件已更新，相关测试和功能需要适配
3. **UUID 支持**: 新的模型应该继承 UUID Mixin
4. **数据上传**: 使用重构后的统一数据上传流程
5. **旧版图表**: 已移除的旧版图表不再支持
6. **Node.js 版本**: 必须使用 Node.js 20.16+
7. **前端构建**: 支持 esbuild 加速构建过程

## 国际化（i18n）开发指南

### 翻译系统架构
Superset 使用 gettext/po 文件进行国际化：
- **PO 文件位置**: `superset/translations/{language}/LC_MESSAGES/messages.po`
- **JSON 文件位置**: `superset/translations/{language}/LC_MESSAGES/messages.json`
- **前端使用 JSON 格式**，通过 po2json 工具转换

### 常见问题和注意事项

1. **多行 msgstr 的处理**：
   - PO 文件中的多行字符串需要正确处理换行符
   - 每行（除最后一行）需要以 `\n` 结尾
   - 使用双引号包裹每行内容

2. **特殊字符转义**：
   - 百分号占位符如 `%(name)s` 需要保留
   - 引号需要转义：`\"` 
   - 反斜杠需要双重转义：`\\n`

3. **Windows Docker 文件同步**：
   - 这是 Windows Docker Desktop 的已知问题
   - 使用 `docker cp` 手动复制是最可靠的解决方案
   - 重启容器确保更改生效

4. **翻译验证**：
   - 翻译后运行脚本验证所有 msgstr 都不为空
   - 检查生成的 JSON 文件大小是否合理
   - 在容器中验证文件是否正确部署

### 开发建议
1. **分批处理**：将翻译工作分成多个批次，便于管理和验证
2. **自动化脚本**：创建可重用的 Python 脚本处理重复性工作
3. **版本控制**：提交翻译更改到 Git，便于追踪和回滚

## Docker Compose 文件对比

Superset 提供了三个不同的 Docker Compose 配置文件，适用于不同场景：

### 1. docker-compose.yml（开发环境）
**特点**：
- 挂载源代码目录：`./superset:/app/superset` 和 `./superset-frontend:/app/superset-frontend`
- 支持热重载，代码改动立即生效
- 构建目标：`target: dev`（包含开发工具）
- 启用开发模式：`DEV_MODE: "true"`

**使用场景**：
- 日常开发新功能
- 调试和测试
- 前后端同时开发

**启动命令**：
```bash
docker-compose up
```

### 2. docker-compose-non-dev.yml（准生产环境）
**特点**：
- 不挂载源代码（代码打包在镜像中）
- 仅挂载配置文件：`./docker:/app/docker`
- 构建目标：`target: dev`（但不启用开发模式）
- 无热重载功能

**使用场景**：
- 测试生产配置
- CI/CD 环境
- 演示环境
- 验证部署流程

**启动命令**：
```bash
docker-compose -f docker-compose-non-dev.yml up
```

### 3. docker-compose-image-tag.yml（生产部署）
**特点**：
- 使用预构建的官方镜像：`apachesuperset.docker.scarf.sh/apache/superset:${TAG}`
- 不需要本地构建
- 仅挂载配置和数据持久化目录
- 启动速度快

**使用场景**：
- 生产环境部署
- 快速搭建演示环境
- 使用官方发布版本

**启动命令**：
```bash
TAG=3.0.0 docker-compose -f docker-compose-image-tag.yml up
```

### 文件对比表

| 特性 | docker-compose.yml | docker-compose-non-dev.yml | docker-compose-image-tag.yml |
|-----|-------------------|------------------------|---------------------------|
| **源码挂载** | ✅ 支持 | ❌ 不支持 | ❌ 不支持 |
| **热重载** | ✅ 支持 | ❌ 不支持 | ❌ 不支持 |
| **镜像来源** | 本地构建 | 本地构建 | 官方镜像 |
| **构建目标** | dev | dev | N/A |
| **启动速度** | 慢 | 慢 | 快 |
| **适用场景** | 开发调试 | 测试演示 | 生产部署 |

## 部署流程和关键命令

### 开发到生产的部署流程

1. **本地开发**：使用 `docker-compose.yml` 进行开发
2. **构建镜像**：
   ```bash
   # 生产环境使用 lean target（体积更小）
   docker build -t mycompany/superset:v1.0 --target lean .
   
   # 测试环境可以使用 dev target
   docker build -t mycompany/superset:v1.0 --target dev .
   ```
3. **推送镜像**：
   ```bash
   docker push mycompany/superset:v1.0
   ```
4. **服务器部署**：使用 `docker-compose-image-tag.yml` 或自定义配置

### 数据库初始化命令

部署 Superset 时必须执行的两个关键命令：

#### 1. superset db upgrade
**作用**：
- 执行数据库迁移，创建/更新表结构
- 基于 Flask-Migrate（Alembic）管理迁移
- 从 `superset/migrations/versions/` 按顺序执行迁移脚本

**执行内容**：
- 创建核心表：dashboards, slices, datasources, users 等
- 添加字段、索引、约束
- 数据转换和版本升级

#### 2. superset init
**作用**：
- 初始化权限系统和安全配置
- 位于 `superset/cli/main.py:65-68`

### Docker 中的执行流程

在 `docker/docker-init.sh` 中自动执行：

```bash
# 1. 数据库迁移
superset db upgrade

# 2. 创建管理员用户
superset fab create-admin \
    --username admin \
    --password admin \
    --email admin@superset.com

# 3. 初始化权限
superset init

# 4. 加载示例数据（可选）
superset load_examples
```

### 手动执行方式

```bash
# 使用 docker-compose 执行
docker-compose run --rm superset superset db upgrade
docker-compose run --rm superset superset init
docker-compose run --rm superset superset fab create-admin

# 或使用 superset-init 服务一次性完成
docker-compose up superset-init
```

**注意**：这些命令仅在首次部署或版本升级时需要执行。
