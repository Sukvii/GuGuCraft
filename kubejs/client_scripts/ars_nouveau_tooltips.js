ItemEvents.modifyTooltips(event => {
    event.modify('ars_nouveau:source_gem', tooltip => {
        tooltip.removeText(Component.translatable('tooltip.source_gem'))
    })
})
