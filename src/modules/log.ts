import fse from 'fs-extra'
import { IErrorObject, ILogObject, IStackFrame, Logger } from 'tslog'

fse.ensureDirSync('./logs')

export const log = new Logger({ overwriteConsole: true })
log.attachTransport({
  silly: logToFile,
  trace: logToFile,
  debug: logToFile,
  info: logToFile,
  warn: logToFile,
  error: logToFile,
  fatal: logToFile,
})

function logToFile(lo: ILogObject) {
  const fileAndLine = lo.fileName ? `${lo.fileName}:${getLineAndColumn(lo)}` : 'could not get fileName'
  const date = lo.date.toLocaleString()
  const logLevel = lo.logLevel
  const logLevelId = lo.logLevelId
  const argumentsArray = lo.argumentsArray

  let messages = ''

  for (const element of argumentsArray) {
    messages += isIErrorObject(element) ? handleIErrorObject(element) : `${String(element)}\n`
  }

  const logMessageHeader = `${date} | ${logLevel} | ${fileAndLine}\n`
  const logMessage = `${logMessageHeader}${messages}\n`

  if (logLevelId > 3) fse.appendFileSync('./logs/errors.log', logMessage)
  else fse.appendFileSync('./logs/app-bot.log', logMessage)
}

function handleIErrorObject(eo: IErrorObject) {
  const name = eo.name
  const errorMessage = eo.message
  const details = Object.keys(eo.details).length > 0 ? `${JSON.stringify(eo.details, undefined, 2)}\n` : ''

  let message = `${name} | ${errorMessage}\n${details}`

  for (const stack of eo.stack) {
    message += `${handleStack(stack)}\n`
  }

  return message
}

function handleStack(stack: IStackFrame) {
  const filePath = stack.filePath ? `${stack.filePath}:${getLineAndColumn(stack)}` : 'could not get filePath'
  const file = stack.fileName || ''
  const functionName = stack.functionName ? ` | ${stack.functionName}` : ''

  return `- ${file}${functionName}\n\t${filePath}`
}

function getLineAndColumn(stack: IStackFrame) {
  return stack.lineNumber && stack.columnNumber ? `${stack.lineNumber}:${stack.columnNumber}` : ''
}

function isIErrorObject(element: unknown): element is IErrorObject {
  const isObject = element !== null && typeof element === 'object' && Array.isArray(element) === false
  return isObject ? (element as Record<string, unknown>)['isError'] === true : false
}

process.on('uncaughtException', (error) => {
  log.fatal(error)
  process.exit(1)
})
