module.exports = main; // templater call: "await tp.user.foty(tp, app)"
async function main(tp, app) { 
  let dbgAttribs = { 
    __notePath: tp.file.path(true/*relative*/), 
    __noteTitle: tp.file.title,
    __activeFile: tp.config.active_file.path,
    __runMode: tp.config.run_mode,
    __targetFile: tp.config.target_file.path,
    __templateFile: tp.config.template_file.path,
  }
  return Object.assign({}, dbgAttribs)
}
