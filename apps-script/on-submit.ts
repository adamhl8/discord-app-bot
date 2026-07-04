const BOT_URL = "https://<your-bot-host>/apps"
const GUILD_ID = "<your discord server id>"
const EMBED_TITLE = "<Potent> Application"

interface ApplicationField {
  name: string
  value: string
}

interface ApplicationPayload {
  guildId: string
  title: string
  fields: ApplicationField[]
}

function sendToBot(payload: ApplicationPayload): void {
  const secret = PropertiesService.getScriptProperties().getProperty("APP_BOT_SECRET")
  if (!secret) throw new Error("APP_BOT_SECRET script property is not set")

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
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

    // a 4xx means the payload or config is wrong, retrying won't help
    if (code >= 400 && code < 500) throw new Error(`bot rejected the application: HTTP ${code} ${body}`)

    Utilities.sleep(1000 * 2 ** attempt)
  }
  throw new Error(`failed to send application after ${maxAttempts} attempts`)
}

// e is undefined when run manually from the editor, which re-sends the latest submission
// oxlint-disable-next-line no-unused-vars
function onSubmit(e?: GoogleAppsScript.Events.FormsOnFormSubmit): void {
  const formResponse = e ? e.response : FormApp.getActiveForm().getResponses().pop()
  if (!formResponse) throw new Error("form has no responses")

  const fields = formResponse.getItemResponses().map((itemResponse): ApplicationField => {
    const answer = itemResponse.getResponse()
    return {
      name: itemResponse.getItem().getTitle(),
      // checkbox and grid questions return arrays
      value: Array.isArray(answer) ? answer.flat().join(", ") : answer,
    }
  })

  sendToBot({ guildId: GUILD_ID, title: EMBED_TITLE, fields })
}
