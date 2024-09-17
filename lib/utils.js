export function ScriptError(message, payload) {
  this.message = message
  this.name = 'ScriptError'
  this.payload = payload
}

ScriptError.prototype = Error.prototype
