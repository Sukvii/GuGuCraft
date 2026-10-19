# 魔源转化器

方块 ID：`mbd2:source_converter`。使用 MBD2 的单方块机器、流体槽和 Ars 魔源存储接口；没有机器 GUI，方块和物品均使用自制液态魔源通道模型。

模型位于 `kubejs/assets/ars_nouveau/models/block/liquid_sourcelink.json`，图集位于 `kubejs/assets/ars_nouveau/textures/block/liquid_sourcelink.png`，从 `GuGuMaterials/model/liquid_sourcelink` 原样安装。液面保留模型对 `ars_nouveau:block/source_still` 的引用，使用已安装 Ars 的动画贴图。模型使用 cutout 渲染，机器关闭实体遮挡以保留镂空效果。液面是模型固定几何，不随内部储液量变化。

碰撞箱与选取框由模型的 20 个无旋转部件合并而成，保留炉体、支脚和顶部装饰之间的空隙，也保留底部向下延伸的 1 像素。仅在启动注册时读取模型并生成形状，所有机器状态继承同一形状。

物品提示直接注册到 Create 的 `TooltipModifier.REGISTRY`，使用原生 `ItemDescription.Modifier` 与 `STANDARD_CREATE` 配色。默认显示 Create 的 Shift 展开提示，展开后先显示“从液态魔源中提炼魔源，为奥术装置供能。”，再通过原生 `condition1` 添加灰色的“用于生产时”，下方由 `behaviour1` 缩进说明“将液位维持在半满附近，即可保持满额产出。储液过少或过多，都会导致大幅减产。”提示不列出具体桶数或减产比例；关键词由原生机制高亮，遵循 Create 的客户端提示开关。

## 使用

1. 将机器放在 Theurgy 火盆正上方，给火盆提供燃料，使其实际燃烧。
2. 从任意面用管道输入 `kubejs:liquid_source`，其他流体会被拒收。
3. 在机器相邻位置放置 Ars 魔源罐，可自动接收魔源；附近 Ars 设备也可以直接取用机器内部的魔源。
4. 佩戴 Create 工程师护目镜，将准星指向机器，查看原生风格信息框中的“魔源缓存：当前值 / 容量”。右键不显示参数，也不会打开 GUI。

新增工作台配方：魔源转化器、配套魔源罐。后者使用独立的 `kubejs:` 配方 ID，保留整合包对原 Ars 配方的移除规则。

液态魔源转换是机器内部配方，使用 MBD2 的 `setXEIVisible(false)` 隐藏配方浏览器中的整个转换分类，兼容 JEI / EMI；工作台合成配方仍然可查。当前测试客户端安装的是 EMI。

Jade 仍显示机器名称、运行状态等信息，但不显示本机配方进度条及其耗时文字。通过 Jade 原生的 `addBeforeTooltipCollectCallback` 在 MBD2 Provider 收集内容前，仅移除本机客户端展示 NBT 的 `recipe_logic.duration`，不改服务器配方数据；其他机器的读条不受影响。回调注册状态在 startup 阶段预留，客户端脚本重载仅更新过滤函数，不重复注册回调。

## 默认数值

| 参数 | 数值 |
| --- | --- |
| 储液容量 | 8,000 mB（8 桶） |
| 推荐工作液量 | 4,000 mB（4 桶） |
| 满产区间 | 3,000–5,000 mB（含端点） |
| 魔源缓存 | 10,000 Source |
| 每批消耗 | 100 mB |
| 每批耗时 | 200 tick（10 秒） |
| 区间内每批产量 | 1,000 Source |
| 区间外每批产量 | 100 Source（10%） |

4 桶为推荐维持的工作液量，总容量为 8 桶。每批开始、扣料之前采样绝对储液量：3,000–5,000 mB 内（含端点）以 100% 产率运行，其余液量一律以 10% 产率运行，耗液和时间均不变。2,999 / 3,000 / 4,000 / 5,000 / 5,001 / 8,000 mB 分别产出 100 / 1,000 / 1,000 / 1,000 / 100 / 100 Source；液体不足 100 mB 时不工作。魔源是 Ars 的 Source 单位，不是另一种流体。

火盆与效率只在每批尝试启动时采样一次。批次运行中不再检查火盆、重新计算效率；中途熄火或移除火盆，当前批次仍会按开始时的效率完成，到下一批启动时才停机。无法启动时，检测最多每 20 tick 重试一次，重新点燃后的启动可能有约 1 秒延迟。

液体在完成批次时扣除。MBD2 原生的原料与输出空间检查仍照常工作：魔源缓存空间不足时停止启动批次；若运行中缓存被 Ars 的其他设备填满或液体被抽走，则取消该批次，原料不会被扣除。待机后重新开始会重新检测火盆、采样液位。升级时，旧版短周期或带逐 tick 火盆条件的未完成批次会取消并按新参数重新启动，液体不会损失；原有机器的液槽由 MBD2 在读档时应用新的默认容量。

护目镜信息框仅在戴着护目镜查看机器时每 10 tick 请求一次数据，只发送并显示当前魔源缓存与容量，不读取液槽、检测火盆或计算效率。

向相邻魔源罐等魔源能力接收端成功输出时，会播放 Ars 魔源通道同款的追踪光球和粒子拖尾，使用 Ars 默认魔源颜色。直接调用原生 `ParticleUtil.spawnFollowProjectile`，由 Ars 处理区块检查、附近玩家检查、实体同步与客户端效果；没有接收端、缓存为空或接收端已满时不播放。

输出脚本接管本机魔源槽的自动 IO 调度，保留原有周期（默认 20 tick）、侧面配置和朝向，实际传输仍调用 MBD2 的 `SourceStorageCapabilityTrait.handleAutoIO`，沿用原生能力缓存与传输上限。每个出口传输后检查缓存实际减少量，再补充效果；关闭该槽内建自动调度以避免重复转移。此回调在机器内部配方 tick 前执行，因此本 tick 刚完成批次的魔源可能在下一次输出周期发送。附近 Ars 设备直接取用缓存的注册接口仍然保留。

脚本访问游戏时间、维度和玩家世界时使用 KubeJS 的 `level.getTime()`、`level.getDimension()` 与 `player.getLevel()`；它们与原生 Java 方法名不同。配方修改会先拒绝未缩放的原始配方，再写入计算结果，避免脚本异常时意外产出最高数量的魔源。

护目镜显示依据实装 Create 6.0.10 的 `GoggleOverlayRenderer.renderOverlay` 源码，直接使用 Create 的 `RemovedGuiUtils.drawHoveringText` 与 Catnip 的 `GuiGameElement` 绘制 Tooltip 和护目镜图标，沿用原生默认配色、Create 客户端配置、位置和淡入效果。普通 MBD2 方块没有 `IHaveGoggleInformation` 接口，因此由 KubeJS 在 `create:goggle_info` 图层后提供这一行缓存数据，不再手工绘制边框或文字。

ModernUI 兼容分支与 Create 相同：绘制时临时将鼠标位置对齐 GUI 像素，并在 `finally` 中恢复鼠标位置与外层矩阵。Java 重载通过实装 Rhino 支持的完整签名选择。KubeJS 的 `NativeEventWrapper.Listeners.accept` 不捕获回调异常，因此本信息框自行捕获渲染异常、记录一次错误并停止显示，直到客户端脚本重新加载。

图标占位按 Catnip `LangBuilder.getIndents` 的字体宽度公式计算，再通过 `CreateLang.builder` 创建组件并存入本地列表。没有直接调用 `forGoggles(List)`：Rhino `Context.listOf` 在泛型元素类型不同时会复制列表，导致该方法新增的行不能写回原列表。

## 文件与调整

- `kubejs/startup_scripts/source_converter/00_config.js`：容量、满产液量区间、消耗、周期、最大产量与区间外产率，以及客户端回调注册状态容器。
- `kubejs/startup_scripts/source_converter/01_machine.js`：机器、模型与碰撞形状、输入过滤、魔源输出、禁用 GUI 及隐藏转换配方分类。
- `kubejs/server_scripts/tech/source_converter/logic.js`：批次启动时的燃烧检测、液位效率及配方缓存刷新。
- `kubejs/server_scripts/tech/source_converter/inspection.js`：向佩戴护目镜并查看机器的玩家回复魔源缓存与容量。
- `kubejs/server_scripts/tech/source_converter/transfer.js`：按原有 IO 周期调用 MBD2 原生输出，并在实际传输成功后生成 Ars 原生追踪光球。
- `kubejs/server_scripts/recipes/source_converter.js`：两项合成配方、液态魔源转换配方。
- `kubejs/client_scripts/source_converter/goggles.js`：护目镜信息框与查看时的数据请求。
- `kubejs/client_scripts/source_converter/jade.js`：使用 Jade 原生回调隐藏本机配方进度条，保留其他信息。
- `kubejs/client_scripts/source_converter/tooltip.js`：接入 Create 原生 Shift 展开物品提示。
- `kubejs/client_scripts/source_converter/lang.js`：中英文名称与提示。
- `kubejs/assets/ars_nouveau/models/block/liquid_sourcelink.json` 与 `textures/block/liquid_sourcelink.png`：方块和物品共用模型及图集。

首次安装以及修改 startup 配置后，需要完整重启客户端和服务器。

## 验证

8 桶容量、3–5 桶满产区间及 10 秒周期通过实装 Rhino 脚本检查，使用原生 KubeJS global、MBD2 输出修改器/整数序列化器和 Minecraft `CompoundTag` 执行 63 项断言，覆盖 3,000 / 5,000 mB 两个端点、区间外 10% 产量、100 mB 耗液和 200 tick 周期保持不变、单批采样、火盆熄灭、失败重试节流与旧周期批次迁移。机器、火盆和配方事件边界使用替身，实际游戏内运行仍需确认。MBD2 的 `FluidTankCapabilityTrait` 在读入旧液槽 NBT 后重新应用定义容量；其 `RuntimeValue` 默认值不会作为覆盖值写入存档，因此原有默认液槽会使用新的 8 桶容量。若旧机器存液超过 8 桶，原生 `applyCapacity` 会将多余液体截断，重启升级前应先抽出超过 8 桶的部分。Create `ItemDescription.Builder` 源码确认 `condition1` 使用原生灰字、`behaviour1` 另行缩进，无需新增提示框实现。

配方浏览器可见性和 Jade 读条开关按实装 MBD2 21.1.2、Jade 15.10.6 源码核对。Jade 过滤脚本使用实装 Rhino、KubeJS 只读 global 包装、Jade 原生回调接口与容器、Minecraft `CompoundTag` 通过 25 项断言：覆盖本机读条隐藏、状态与其他 Provider 数据保留、其他机器和实体不受影响、缺少数据、客户端脚本重载不重复注册，以及异常后停用和重载恢复。注册入口与方块注册表在检查中使用替身；游戏内最终显示仍需重启客户端确认。

传输特效脚本使用实装 Rhino、Ars/MBD2 存储和 MBD2 运行时 IO 执行 23 项断言，覆盖周期限制、满罐、空缓存、部分接收、多出口、朝向、侧面禁用、提取上限、脚本重载及视觉异常后继续传输；Ars 原生粒子入口与默认颜色工厂的签名按实装字节码核对。测试使用替身观察特效创建请求，真实实体同步和粒子画面仍需进入游戏确认。

碰撞形状与原生提示接入曾通过 JavaScript 语法检查。使用实装 Rhino、Minecraft `Shapes` 和 MBD2 `ToggleShape` 执行形状生成代码，逐格核对模型范围内的 4,352 个像素单元，结果与 20 个模型部件一致；另核对 Create 原生提示构造器、配色、注册表及重复资源加载保护。客户端脚本的物品查询延迟到资源生成阶段；当前中英文提示均使用原生 summary、condition1 和 behaviour1。游戏内的碰撞体验与 Shift 展开效果仍需实际确认。

已通过 JavaScript 语法检查和 16 组脚本模拟场景检查，并按实装 Create 6.0.10、NeoForge 21.1.256、KubeJS 2101.7.2-build.377 和 Rhino 2101.2.8-build.91 的反编译源码核对调用。实装 Rhino 的原生 API 回归覆盖 Tooltip 签名解析、Catnip 图标构建、原生配色与矩阵调用，并复现了泛型列表复制问题，验证当前数据处理代码能保留一行带图标间距的文字。模拟场景另覆盖图层筛选、Create 配置、ModernUI 鼠标恢复、目标切换和异常停用；实际 GPU 绘制和运行时 Mixin 兼容还需在 Minecraft 内确认。

游戏内可用 `/give @s mbd2:source_converter` 获取测试方块。建议用 4,000 mB 测试 10 秒单批 100 mB → 1,000 Source；工作中熄灭火盆，确认当前批次完成、下一批停机，重新点燃后恢复；分别测试 2,900 / 3,000 / 5,000 / 5,100 mB 的 100 / 1,000 / 1,000 / 100 Source 产量，并放置相邻魔源罐确认自动输出。3,000 mB 启动的批次完成后液量为 2,900 mB，下批若不补液将降产；可用存量转信器围绕 4 桶控制补液。佩戴/摘下工程师护目镜、切换查看目标和进出世界，确认信息框显示及清除正常。
