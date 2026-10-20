// CMM 原生名称由系列前缀与 Create 对应机器名称组合而成。
// 指定 CMM 命名空间，确保覆盖其自带语言；两参数 add 默认写入 minecraft。
ClientEvents.lang('zh_cn', event => {
    event.add('createmoremachines', 'tier.createmoremachines.brass', '奥术')
})

ClientEvents.lang('en_us', event => {
    event.add('createmoremachines', 'tier.createmoremachines.brass', 'Arcane ')
})
