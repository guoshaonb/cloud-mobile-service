const GLOABL_DATA = {}

function get(key) {
  return GLOABL_DATA[key]
}

function set(key, value) {
  GLOABL_DATA[key] = value
}

function setProp(key, prop, value, childProp) {
  try {
    if (!childProp) {
      GLOABL_DATA[key][prop] = value
    } else {
      GLOABL_DATA[key][prop][childProp] = value
    }
  } catch (error) { }
}

module.exports = {
  get,
  set,
  setProp
}