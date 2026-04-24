class CacheDao {
  constructor (key) {
    this.key = key
    this.maxLength = 5
  }

  async setItem(item, name) {
    let arr = await this.getItem()
    if(!Array.isArray(arr)) {
      arr = []
    }
    if(arr.length >= this.maxLength) {
      arr.pop()
    }
    arr.unshift({
      timestamp: Math.round(new Date() / 1000),
      name: name || '',
      value: item
    })
    return localforage.setItem(this.key, arr)
  }

  async removeItem(index) {
    let arr = await this.getItem()
    if(!Array.isArray(arr)) {
      return
    }
    arr.splice(index, 1)
    return localforage.setItem(this.key, arr)
  }

  getItem() {
    try{
      return localforage.getItem(this.key)
    }catch(err) {
      // nothing..
    }
    return []
  }
}
const cacheDao = new CacheDao('__jsoneditor_history')

function beautifyTime(timestamp){
  var date = new Date(timestamp * 1000)
  var pad = function (num) {
    return String(num).padStart(2, '0')
  }
  return date.getFullYear() + '-' +
    pad(date.getMonth() + 1) + '-' +
    pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' +
    pad(date.getMinutes()) + ':' +
    pad(date.getSeconds())
}
