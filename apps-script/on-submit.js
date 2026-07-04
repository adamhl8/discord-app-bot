const BOT_URL = "https://<your-bot-host>/apps"
const GUILD_ID = "<your discord server id>"
const EMBED_TITLE = "<Potent> Application"
function sendToBot(payload) {
  const secret = PropertiesService.getScriptProperties().getProperty("APP_BOT_SECRET")
  if (!secret) throw new Error("APP_BOT_SECRET script property is not set")
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: `Bearer ${secret}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  }
  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let code = 0
    let body = ""
    try {
      const response = UrlFetchApp.fetch(BOT_URL, options)
      code = response.getResponseCode()
      body = response.getContentText()
    } catch (error) {
      Logger.log(`attempt ${attempt} threw: ${String(error)}`)
    }
    if (code >= 200 && code < 300) return
    Logger.log(`attempt ${attempt} -> HTTP ${code}: ${body}`)
    if (code >= 400 && code < 500) throw new Error(`bot rejected the application: HTTP ${code} ${body}`)
    Utilities.sleep(1e3 * 2 ** attempt)
  }
  throw new Error(`failed to send application after ${maxAttempts} attempts`)
}
function onSubmit(e) {
  const formResponse = e ? e.response : FormApp.getActiveForm().getResponses().pop()
  if (!formResponse) throw new Error("form has no responses")
  const fields = formResponse.getItemResponses().map((itemResponse) => {
    const answer = itemResponse.getResponse()
    return {
      name: itemResponse.getItem().getTitle(),
      value: Array.isArray(answer) ? answer.flat().join(", ") : answer,
    }
  })
  sendToBot({
    guildId: GUILD_ID,
    title: EMBED_TITLE,
    fields,
  })
}
