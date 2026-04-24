const container = document.getElementById('jsoneditor')
const jsonkey = 'jsonv'
const AI_CONFIG_KEY = 'jsonedit_ai_config'
const AI_DEFAULT_CONFIG = {
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-v4-flash',
  apiKey: ''
}
const AI_JSON_PROMPT = '帮我 json 格式化，只输出 json 格式的格式化后的内容即可，不要输出其他任何内容'
let editor
const options = {
  mode: 'code',
  modes: ['code', 'form', 'text', 'tree', 'view', 'preview'], // allowed modes
  onChange: () => {
    try {
      localforage.setItem(jsonkey,editor.get())
    } catch (e) {}
  },
  onModeChange: () => {
    setTimeout(renderAiToolbar, 0)
  },
}

const mode = window.location.search.substring(1)
editor = new JSONEditor(container, options)
async function init() {
  let json = ''
  try {
    try{
      // 获取url后面的json字符串
      if (!mode || mode == '') {
        json = await localforage.getItem(jsonkey) || json
      } else if ('none' == mode) {
        json = ''
      } else if ('clipboard' == mode) {
          navigator.clipboard.readText()
          .then(clipText => editor.set(JSON.parse(clipText)))
          .catch(err => {
            const msg = err + ''
            console.error(msg)
            if (msg.indexOf('permission') > -1) {
              toast('bad','缺少剪切板权限')
            } else if (msg.indexOf('focused') > -1) {
              toast('bad','浏览器没有获取焦点，无法获取剪切板内容')
            }
          })
        return
      }
    }catch(e) {
     json = await localforage.getItem(jsonkey) || json
    }
  } catch (e) { }
  if (json) { 
    editor.set(json)
  } else {
    editor.setText(json)
  }
}
init()

editor.focus()
// 设置JSONEditor实例
window.JSONEditorInstance = editor

//加载时设置默认字体大小
var font = parseInt(localStorage.getItem('jsonedit_fontsize'));
if (font < 0) {
	font = 15;
  localStorage.setItem('jsonedit_fontsize', font);
}
document.querySelector('.ace_editor').style.fontSize = font + 'px';

function getAiConfig() {
  try {
    return {
      ...AI_DEFAULT_CONFIG,
      ...JSON.parse(localStorage.getItem(AI_CONFIG_KEY) || '{}')
    }
  } catch (e) {
    return { ...AI_DEFAULT_CONFIG }
  }
}

function saveAiConfig(config) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify({
    baseUrl: (config.baseUrl || AI_DEFAULT_CONFIG.baseUrl).replace(/\/+$/, ''),
    model: config.model || AI_DEFAULT_CONFIG.model,
    apiKey: config.apiKey || ''
  }))
}

function configureAi() {
  const current = getAiConfig()
  const baseUrl = prompt('OpenAPI 地址', current.baseUrl)
  if (baseUrl === null) return false

  const model = prompt('模型名称', current.model)
  if (model === null) return false

  const masked = current.apiKey ? '保持不变请直接确定；输入新 key 会覆盖' : ''
  const apiKey = prompt('DeepSeek API Key', masked)
  if (apiKey === null) return false

  saveAiConfig({
    baseUrl,
    model,
    apiKey: apiKey === masked ? current.apiKey : apiKey
  })
  toast('good', 'AI配置已保存')
  return true
}

function getEditorTextForAi() {
  try {
    return editor.getText()
  } catch (e) {
    try {
      return JSON.stringify(editor.get(), null, 2)
    } catch (err) {
      return ''
    }
  }
}

function normalizeAiJsonContent(content) {
  let text = (content || '').trim()
  const fenced = text.match(/^```(?:json|javascript|js)?\s*([\s\S]*?)\s*```$/i)
  if (fenced) {
    text = fenced[1].trim()
  }

  try {
    JSON.parse(text)
    return text
  } catch (e) {}

  const candidates = extractJsonCandidates(text)
  for (const candidate of candidates) {
    try {
      JSON.parse(candidate)
      return candidate
    } catch (e) {}
  }

  return text
}

function extractJsonCandidates(text) {
  const candidates = []
  for (const open of ['{', '[']) {
    const close = open === '{' ? '}' : ']'
    const start = text.indexOf(open)
    if (start < 0) continue

    let depth = 0
    let inString = false
    let escaped = false
    for (let i = start; i < text.length; i++) {
      const ch = text[i]
      if (inString) {
        if (escaped) {
          escaped = false
        } else if (ch === '\\') {
          escaped = true
        } else if (ch === '"') {
          inString = false
        }
        continue
      }

      if (ch === '"') {
        inString = true
      } else if (ch === open) {
        depth += 1
      } else if (ch === close) {
        depth -= 1
        if (depth === 0) {
          candidates.push(text.slice(start, i + 1).trim())
          break
        }
      }
    }
  }
  return candidates
}

async function aiFormatJson(button) {
  let config = getAiConfig()
  if (!config.apiKey && !configureAi()) {
    return
  }

  config = getAiConfig()
  const text = getEditorTextForAi()
  if (!text.trim()) {
    toast('warn', '无数据')
    return
  }

  const oldText = button.textContent
  button.disabled = true
  button.textContent = 'AI解析中...'

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `${AI_JSON_PROMPT}\n${text}`
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    const result = await response.json()
    const content = result?.choices?.[0]?.message?.content || ''
    const jsonText = normalizeAiJsonContent(content)
    const parsed = JSON.parse(jsonText)
    editor.set(parsed)
    try {
      await localforage.setItem(jsonkey, parsed)
    } catch (e) {}
    toast('good', 'AI格式化完成')
  } catch (err) {
    console.error(err)
    toast('bad', 'AI格式化失败')
  } finally {
    button.disabled = false
    button.textContent = oldText
    button.blur()
  }
}

function appendToolbarButton(text, title, onClick, options = {}) {
  const menu = document.querySelector('.jsoneditor-menu')
  if (!menu) return

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'jsoneditor-ai-button'
  button.textContent = text
  button.title = title
  button.onclick = onClick
  if (options.marginLeft) {
    button.style.marginLeft = options.marginLeft
  }

  menu.appendChild(button)
}

function renderAiToolbar() {
  document.querySelectorAll('.jsoneditor-ai-button').forEach(function (button) {
    button.remove()
  })

  if (!editor || editor.getMode() !== 'code') {
    return
  }

  appendToolbarButton('AI格式化', '调用AI强行解析非规范JSON，并用返回的合法JSON覆盖当前编辑器', function (e) {
    aiFormatJson(e.currentTarget)
  }, { marginLeft: '25px' })

  appendToolbarButton('AI配置', '配置OpenAPI地址、模型名称和API Key', function (e) {
    configureAi()
    e.currentTarget.blur()
  })
}

renderAiToolbar()
